#!/usr/bin/env python3
"""
enrich_authors.py
=================
Production-grade asynchronous data pipeline for enriching poet/author metadata
by querying the Wikidata Action API.

Workflow:
  1. Stream `poems.jsonl.gz` to collect unique author names.
  2. For each unique author, query Wikidata to resolve the entity (Step A),
     extract claims (Step B), resolve place labels (Step C), format image
     URLs (Step D), and format dates (Step E).
  3. Write each enriched record immediately to `enriched_authors.jsonl`.
  4. Generate a comprehensive execution report saved to `enrichment_report.json`.

Dependencies:
  pip install aiohttp aiofiles
"""

# ---------------------------------------------------------------------------
# Standard-library imports
# ---------------------------------------------------------------------------
import asyncio
import gzip
import json
import logging
import os
import re
import sys
import time
import urllib.parse
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

# ---------------------------------------------------------------------------
# Third-party imports (must be installed: pip install aiohttp aiofiles)
# ---------------------------------------------------------------------------
try:
    import aiohttp
    import aiofiles
except ImportError as _e:
    sys.exit(
        f"[FATAL] Missing dependency: {_e}.\n"
        "Please run:  pip install aiohttp aiofiles"
    )

# ===========================================================================
# ── CONFIGURATION ──────────────────────────────────────────────────────────
# ===========================================================================

# Paths (relative to this script's directory so the script is portable)
_SCRIPT_DIR = Path(__file__).parent.resolve()
INPUT_FILE: Path = _SCRIPT_DIR / "poems.jsonl.gz"
OUTPUT_FILE: Path = _SCRIPT_DIR / "enriched_authors.jsonl"
REPORT_FILE: Path = _SCRIPT_DIR / "enrichment_report.json"

# Wikidata API endpoint
WIKIDATA_API: str = "https://www.wikidata.org/w/api.php"

# Wikimedia Commons image base URL — Special:FilePath always redirects to
# the maximum-resolution original file when no `width` parameter is given.
COMMONS_FILE_PATH: str = "https://commons.wikimedia.org/wiki/Special:FilePath/{filename}"

# HTTP request configuration
USER_AGENT: str = "OdePoetryAppBot/1.0 (charleskayssieh@gmail.com) Python/DataEnricher"
REQUEST_TIMEOUT_SECONDS: int = 30   # Per-request hard timeout
MAX_CONCURRENT_REQUESTS: int = 5    # asyncio.Semaphore concurrency cap
MAX_RETRIES: int = 3                # Retry count for 429 / 5xx errors
RETRY_BASE_DELAY: float = 2.0       # Base delay (s) for exponential backoff

# Wikidata property identifiers
P_IMAGE: str = "P18"          # Image / portrait
P_SIGNATURE: str = "P109"     # Signature image
P_BIRTH_DATE: str = "P569"    # Date of birth
P_DEATH_DATE: str = "P570"    # Date of death
P_BIRTH_PLACE: str = "P19"    # Place of birth (returns Q-ID)
P_DEATH_PLACE: str = "P20"    # Place of death (returns Q-ID)
P_NATIVE_NAME: str = "P1559"  # Name in native language (monolingualtext)
P_MOVEMENT: str = "P135"      # Literary/artistic movement (returns Q-ID)
P_LANGUAGE: str = "P1412"     # Languages spoken/written/signed (returns Q-ID)
P_NATIONALITY: str = "P27"    # Country of citizenship / nationality (returns Q-ID)
P_INFLUENCED_BY: str = "P737" # Influenced by (returns Q-ID, multi-valued)


# ===========================================================================
# ── LOGGING ────────────────────────────────────────────────────────────────
# ===========================================================================

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s │ %(levelname)-8s │ %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[
        logging.StreamHandler(sys.stdout),
    ],
)
logger = logging.getLogger("enrich_authors")

# ===========================================================================
# ── TYPE ALIASES ───────────────────────────────────────────────────────────
# ===========================================================================

AuthorRecord = Dict[str, Any]
ClaimsDict = Dict[str, Any]

# ===========================================================================
# ── STEP 1 – INPUT STREAMING & DEDUPLICATION ───────────────────────────────
# ===========================================================================


def stream_unique_authors(input_path: Path) -> Set[str]:
    """
    Read the compressed JSONL file line by line (without loading the whole
    file into memory) and return a set of unique, non-empty author names.

    Args:
        input_path: Absolute path to `poems.jsonl.gz`.

    Returns:
        A set of unique author name strings.

    Raises:
        FileNotFoundError: If the input file does not exist.
        ValueError: If no valid `author` field is found in any line.
    """
    if not input_path.exists():
        raise FileNotFoundError(
            f"Input file not found: {input_path}\n"
            "Make sure `poems.jsonl.gz` is in the same directory as "
            "this script."
        )

    authors: Set[str] = set()
    line_count: int = 0
    error_count: int = 0

    logger.info("📂  Opening input file: %s", input_path)

    with gzip.open(input_path, "rt", encoding="utf-8") as fh:
        for raw_line in fh:
            line_count += 1
            raw_line = raw_line.strip()
            if not raw_line:
                continue  # skip blank lines

            try:
                record: Dict[str, Any] = json.loads(raw_line)
            except json.JSONDecodeError as exc:
                error_count += 1
                logger.warning(
                    "⚠️  Malformed JSON at line %d – skipping (%s)", line_count, exc
                )
                continue

            metadata: Any = record.get("metadata")
            author: Optional[str] = (
                metadata.get("author")
                if isinstance(metadata, dict)
                else None
            )
            if isinstance(author, str):
                author = author.strip()
                if author:
                    authors.add(author)
            # Non-string / missing `author` fields are silently ignored

    logger.info(
        "✅  Streaming complete — %d lines read, %d parse errors, "
        "%d unique authors identified.",
        line_count,
        error_count,
        len(authors),
    )

    if not authors:
        raise ValueError(
            "No valid `author` fields found in the input file. "
            "Check that the JSON objects contain an `author` key."
        )

    return authors


# ===========================================================================
# ── HELPERS: HTTP WITH RETRY / BACK-OFF ────────────────────────────────────
# ===========================================================================


async def _fetch_json(
    session: aiohttp.ClientSession,
    semaphore: asyncio.Semaphore,
    params: Dict[str, str],
    *,
    context: str = "",
) -> Optional[Dict[str, Any]]:
    """
    Perform a single GET request against WIKIDATA_API with the given query
    parameters, respecting the concurrency semaphore and applying exponential
    back-off on HTTP 429 (rate-limit) and HTTP 5xx (server error) responses.

    Args:
        session:   Shared aiohttp.ClientSession.
        semaphore: Concurrency throttle (max MAX_CONCURRENT_REQUESTS).
        params:    URL query parameters dict (merged with `format=json`).
        context:   Human-readable label for log messages (e.g. author name).

    Returns:
        Parsed JSON response as a dict, or None if all retries are exhausted.
    """
    params = {**params, "format": "json"}

    async with semaphore:  # enforce concurrency cap
        for attempt in range(1, MAX_RETRIES + 2):  # 1..MAX_RETRIES+1
            try:
                async with session.get(
                    WIKIDATA_API,
                    params=params,
                    timeout=aiohttp.ClientTimeout(total=REQUEST_TIMEOUT_SECONDS),
                ) as response:

                    # ── Rate-limit and server errors → exponential back-off ──
                    if response.status == 429 or response.status >= 500:
                        if attempt > MAX_RETRIES:
                            logger.error(
                                "❌  [%s] HTTP %d after %d retries — giving up.",
                                context,
                                response.status,
                                MAX_RETRIES,
                            )
                            return None

                        # Respect `Retry-After` header if present, otherwise use
                        # exponential back-off: 2s, 4s, 8s, …
                        retry_after_header = response.headers.get("Retry-After")
                        if retry_after_header:
                            try:
                                delay = float(retry_after_header)
                            except ValueError:
                                delay = RETRY_BASE_DELAY * (2 ** (attempt - 1))
                        else:
                            delay = RETRY_BASE_DELAY * (2 ** (attempt - 1))

                        logger.warning(
                            "⏳  [%s] HTTP %d — retry %d/%d in %.1f s …",
                            context,
                            response.status,
                            attempt,
                            MAX_RETRIES,
                            delay,
                        )
                        await asyncio.sleep(delay)
                        continue  # retry

                    # ── Non-success, non-retryable ──
                    if response.status != 200:
                        logger.error(
                            "❌  [%s] Unexpected HTTP %d — skipping.",
                            context,
                            response.status,
                        )
                        return None

                    # ── Success ──
                    try:
                        return await response.json(content_type=None)
                    except (aiohttp.ContentTypeError, json.JSONDecodeError) as exc:
                        logger.error(
                            "❌  [%s] Failed to decode JSON response: %s",
                            context,
                            exc,
                        )
                        return None

            except asyncio.TimeoutError:
                if attempt > MAX_RETRIES:
                    logger.error(
                        "❌  [%s] Request timed out after %d retries.", context, MAX_RETRIES
                    )
                    return None
                delay = RETRY_BASE_DELAY * (2 ** (attempt - 1))
                logger.warning(
                    "⏳  [%s] Timeout — retry %d/%d in %.1f s …",
                    context, attempt, MAX_RETRIES, delay
                )
                await asyncio.sleep(delay)

            except aiohttp.ClientError as exc:
                logger.error("❌  [%s] Network error: %s", context, exc)
                return None

    return None  # unreachable but satisfies type checker


# ===========================================================================
# ── STEP A – ENTITY RESOLUTION ─────────────────────────────────────────────
# ===========================================================================


async def resolve_entity(
    session: aiohttp.ClientSession,
    semaphore: asyncio.Semaphore,
    author_name: str,
) -> Optional[str]:
    """
    Query Wikidata's `wbsearchentities` action to find the best-matching
    entity for the given author name and return its Q-identifier.

    The API returns an ordered list of matches. We take the first result
    whose description (if available) does not obviously indicate it is NOT
    a person (e.g. it's not a company, place, etc.). In practice, for poet
    names this heuristic works extremely well.

    Args:
        session:      Shared aiohttp.ClientSession.
        semaphore:    Concurrency throttle.
        author_name:  The author name string (e.g. "Charles Baudelaire").

    Returns:
        A Wikidata Q-identifier string (e.g. "Q47153"), or None if no
        suitable match is found.
    """
    params: Dict[str, str] = {
        "action": "wbsearchentities",
        "search": author_name,
        "language": "fr",      # search in French
        "uselang": "fr",       # return labels in French
        "type": "item",
        "limit": "5",          # fetch a few results for filtering
    }

    data = await _fetch_json(session, semaphore, params, context=author_name)

    if not data:
        return None

    search_results: List[Dict[str, Any]] = data.get("search", [])
    if not search_results:
        logger.warning("🔍  [%s] No Wikidata entities found.", author_name)
        return None

    # ── Heuristic: prefer results whose description mentions "poète",
    #    "écrivain", "auteur", "romancier", "dramaturge", or simply take
    #    the top result as a fall-back (Wikidata ranks by relevance). ──
    _PERSON_KEYWORDS = {
        "poète", "poétesse", "écrivain", "écrivaine", "auteur", "auteure",
        "romancier", "romancière", "dramaturge", "philosophe", "humaniste",
        "philosophe", "nouvelliste", "journaliste", "essayiste", "historien",
        "historienne", "linguiste", "académicien", "académicienne",
    }

    for result in search_results:
        description: str = result.get("description", "").lower()
        label: str = result.get("label", "")
        entity_id: str = result.get("id", "")

        if not entity_id.startswith("Q"):
            continue

        # Check for person-related keyword in description
        for kw in _PERSON_KEYWORDS:
            if kw in description:
                logger.debug("✅  [%s] Matched entity %s (%s)", author_name, entity_id, label)
                return entity_id

    # Fall back to the very first result (Wikidata ranks by relevance)
    first = search_results[0]
    qid: str = first.get("id", "")
    if qid.startswith("Q"):
        logger.debug(
            "ℹ️   [%s] Using first result (heuristic fallback): %s — %s",
            author_name,
            qid,
            first.get("label", ""),
        )
        return qid

    logger.warning("⚠️  [%s] No valid Q-identifier found.", author_name)
    return None


# ===========================================================================
# ── STEP B – CLAIMS EXTRACTION ─────────────────────────────────────────────
# ===========================================================================


async def fetch_claims(
    session: aiohttp.ClientSession,
    semaphore: asyncio.Semaphore,
    qid: str,
    context: str = "",
) -> Optional[ClaimsDict]:
    """
    Query `wbgetentities` with `props=claims` for the given Q-identifier
    and return the raw claims dictionary for that entity.

    Args:
        session:   Shared aiohttp.ClientSession.
        semaphore: Concurrency throttle.
        qid:       Wikidata entity ID (e.g. "Q47153").
        context:   Human-readable label for log messages.

    Returns:
        The `claims` sub-dict from the entity, or None on failure.
    """
    params: Dict[str, str] = {
        "action": "wbgetentities",
        "ids": qid,
        "props": "claims",
    }

    data = await _fetch_json(session, semaphore, params, context=context)
    if not data:
        return None

    entities: Dict[str, Any] = data.get("entities", {})
    entity: Dict[str, Any] = entities.get(qid, {})

    if "missing" in entity:
        logger.warning("⚠️  [%s] Entity %s is marked missing on Wikidata.", context, qid)
        return None

    return entity.get("claims")


# ===========================================================================
# ── HELPERS: CLAIMS VALUE EXTRACTION ───────────────────────────────────────
# ===========================================================================


def _get_string_claim(claims: ClaimsDict, prop: str) -> Optional[str]:
    """
    Extract the string value from the first main-snak of a claims property
    whose datatype is `string` (used for image filenames, etc.).

    Args:
        claims: The raw claims dict from Wikidata.
        prop:   Property ID (e.g. "P18").

    Returns:
        The string value, or None if not present.
    """
    statements: List[Any] = claims.get(prop, [])
    for stmt in statements:
        snak: Dict[str, Any] = stmt.get("mainsnak", {})
        if snak.get("snaktype") != "value":
            continue
        data_value: Dict[str, Any] = snak.get("datavalue", {})
        if data_value.get("type") == "string":
            return data_value.get("value")
    return None


def _get_time_claim(claims: ClaimsDict, prop: str) -> Optional[str]:
    """
    Extract the raw time string from the first main-snak of a claims property
    whose datatype is `time` (P569 birth date, P570 death date).

    Wikidata time strings look like: "+1821-04-09T00:00:00Z"

    Args:
        claims: The raw claims dict.
        prop:   Property ID (e.g. "P569").

    Returns:
        The raw time string, or None if not present.
    """
    statements: List[Any] = claims.get(prop, [])
    for stmt in statements:
        snak: Dict[str, Any] = stmt.get("mainsnak", {})
        if snak.get("snaktype") != "value":
            continue
        data_value: Dict[str, Any] = snak.get("datavalue", {})
        if data_value.get("type") == "time":
            time_val: Dict[str, Any] = data_value.get("value", {})
            return time_val.get("time")  # e.g. "+1821-04-09T00:00:00Z"
    return None


def _get_entity_id_claim(claims: ClaimsDict, prop: str) -> Optional[str]:
    """
    Extract the Q-identifier from the first main-snak of a claims property
    whose datatype is `wikibase-entityid` (P19 birth place, P20 death place).

    Args:
        claims: The raw claims dict.
        prop:   Property ID (e.g. "P19").

    Returns:
        A Q-identifier string (e.g. "Q90"), or None if not present.
    """
    statements: List[Any] = claims.get(prop, [])
    for stmt in statements:
        snak: Dict[str, Any] = stmt.get("mainsnak", {})
        if snak.get("snaktype") != "value":
            continue
        data_value: Dict[str, Any] = snak.get("datavalue", {})
        if data_value.get("type") == "wikibase-entityid":
            entity_val: Dict[str, Any] = data_value.get("value", {})
            qid = entity_val.get("id")
            if qid:
                return str(qid)
    return None


def _get_entity_id_claims_all(claims: ClaimsDict, prop: str) -> List[str]:
    """
    Extract ALL Q-identifiers from the main-snaks of a claims property
    whose datatype is `wikibase-entityid`.  Used for multi-valued properties
    such as P1412 (languages) and P135 (movements).

    Args:
        claims: The raw claims dict.
        prop:   Property ID (e.g. "P1412").

    Returns:
        A list of Q-identifier strings (may be empty).
    """
    result: List[str] = []
    statements: List[Any] = claims.get(prop, [])
    for stmt in statements:
        snak: Dict[str, Any] = stmt.get("mainsnak", {})
        if snak.get("snaktype") != "value":
            continue
        data_value: Dict[str, Any] = snak.get("datavalue", {})
        if data_value.get("type") == "wikibase-entityid":
            entity_val: Dict[str, Any] = data_value.get("value", {})
            qid = entity_val.get("id")
            if qid:
                result.append(str(qid))
    return result


def _get_monolingual_claim(claims: ClaimsDict, prop: str) -> Optional[str]:
    """
    Extract the text value from the first main-snak of a claims property
    whose datatype is `monolingualtext` (used for P1559 — name in native
    language, which Wikidata stores as {"text": "...", "language": "..."}).

    We iterate all statements and prefer ones whose language is "fr", then
    fall back to native-script languages (e.g. "ar", "zh", "ja"), and finally
    fall back to any non-empty value.

    Args:
        claims: The raw claims dict from Wikidata.
        prop:   Property ID (e.g. "P1559").

    Returns:
        The native-name text string, or None if not present.
    """
    statements: List[Any] = claims.get(prop, [])
    # Collect all (language, text) pairs first so we can apply preference logic.
    candidates: List[Tuple[str, str]] = []
    for stmt in statements:
        snak: Dict[str, Any] = stmt.get("mainsnak", {})
        if snak.get("snaktype") != "value":
            continue
        dv: Dict[str, Any] = snak.get("datavalue", {})
        if dv.get("type") == "monolingualtext":
            val: Dict[str, Any] = dv.get("value", {})
            text: str = val.get("text", "")
            lang: str = val.get("language", "")
            if text:
                candidates.append((lang, text))

    if not candidates:
        return None

    # Prefer French, then fall back to the first available value.
    for lang, text in candidates:
        if lang == "fr":
            return text
    return candidates[0][1]


# ===========================================================================
# ── STEP C½ – GENERIC ENTITY LABEL RESOLUTION ───────────────────────────────
# (for non-place Q-IDs: movements, languages, nationalities)
# ===========================================================================


async def resolve_entity_label(
    session: aiohttp.ClientSession,
    semaphore: asyncio.Semaphore,
    qid: str,
    entity_cache: Dict[str, str],
    context: str = "",
) -> Optional[str]:
    """
    Resolve any Wikidata Q-identifier to its French label using a single
    `wbgetentities?props=labels` call.  Results are cached in `entity_cache`
    (shared with all other coroutines) so common entities like "français" or
    "France" are never fetched more than once.

    This function is intentionally simpler than `resolve_place_label` — it
    does NOT walk P131 or check P31, because non-place entities (movements,
    languages, nationalities) do not need city-forcing.

    Args:
        session:      Shared aiohttp.ClientSession.
        semaphore:    Concurrency throttle.
        qid:          Wikidata Q-identifier to resolve (e.g. "Q150").
        entity_cache: Shared in-memory dict {qid → french_label}.
        context:      Human-readable log label.

    Returns:
        French label string (e.g. "français"), or None on failure.
    """
    if qid in entity_cache:
        cached = entity_cache[qid]
        return cached if cached else None

    params: Dict[str, str] = {
        "action": "wbgetentities",
        "ids": qid,
        "props": "labels",
        "languages": "fr|en",
    }

    data = await _fetch_json(
        session, semaphore, params, context=f"{context}/{qid}"
    )
    if not data:
        entity_cache[qid] = ""
        return None

    entities: Dict[str, Any] = data.get("entities", {})
    entity: Dict[str, Any] = entities.get(qid, {})

    if "missing" in entity:
        entity_cache[qid] = ""
        return None

    labels: Dict[str, Any] = entity.get("labels", {})
    for lang in ("fr", "en"):
        lv = labels.get(lang, {}).get("value")
        if lv:
            entity_cache[qid] = lv
            return lv

    logger.warning("⚠️   [%s] No label found for entity %s.", context, qid)
    entity_cache[qid] = ""
    return None


# ===========================================================================

# Wikidata property: "instance of" — used to test whether an entity IS a city.
P_INSTANCE_OF: str = "P31"
# Wikidata property: "located in administrative territorial entity"
P_LOCATED_IN: str = "P131"

# ── City-level Wikidata Q-identifiers ──────────────────────────────────────
# When a place's P31 contains any of these, it is already at city/municipality
# level and we can stop climbing P131.
#
# Key entries:
#   Q515       — city
#   Q1549591   — big city
#   Q484170    — municipality
#   Q532       — village
#   Q5119      — capital city
#   Q200250    — metropolis
#   Q3957      — town
#   Q3624078   — sovereign state (Paris / Londn treated as cities directly)
#   Q208511    — global city
#   Q1637706   — city with millions of inhabitants
#   Q3910384   — urban municipality (Canada / Québec-style)
#   Q134626    — arrondissement of France  ← accept Paris/Lyon arrondissements
#   Q702492    — arrondissement of Paris   ← direct arrondissement type
#   Q2981684   — arrondissement of Lyon
#   Q107390    — commune of France
#   Q15284     — municipality of Switzerland
#   Q22927512  — city in the United States
#   Q15221015  — municipality of Belgium
#   Q2514025   — municipality of Spain
#   Q747074    — municipality of Italy
#   Q2616791   — municipality of Germany (Gemeinde)
#   Q253019    — urban district / kreisfreie Stadt
#   Q5624962   — administrative seat
#   Q494721    — borough (treated as city-level)
CITY_QIDS: frozenset = frozenset({
    "Q515",       # city
    "Q1549591",   # big city
    "Q484170",    # municipality
    "Q532",       # village
    "Q5119",      # capital city
    "Q200250",    # metropolis
    "Q3957",      # town
    "Q208511",    # global city
    "Q1637706",   # city with millions of inhabitants
    "Q3910384",   # urban municipality
    "Q134626",    # arrondissement of France
    "Q702492",    # arrondissement of Paris
    "Q2981684",   # arrondissement of Lyon
    "Q107390",    # commune of France
    "Q15284",     # municipality of Switzerland
    "Q22927512",  # city in the United States
    "Q15221015",  # municipality of Belgium
    "Q2514025",   # municipality of Spain
    "Q747074",    # municipality of Italy
    "Q2616791",   # municipality of Germany
    "Q253019",    # urban district (kreisfreie Stadt)
    "Q5624962",   # administrative seat
    "Q494721",    # borough
    "Q1852859",   # commune of Belgium
    "Q278715",    # urban commune of France
    "Q484021",    # administrative seat of a first-level administrative division
    "Q15916867",  # municipality of France (pre-2016 administrative division)
})

# Maximum P131 hops before we give up climbing and accept whatever label we have.
# 4 covers:  hospital → neighbourhood → arrondissement → city → (stop)
MAX_P131_DEPTH: int = 4


async def _fetch_place_entity(
    session: aiohttp.ClientSession,
    semaphore: asyncio.Semaphore,
    place_qid: str,
    context: str,
) -> Tuple[Optional[str], Optional[str], bool]:
    """
    Fetch the French label, the P131 parent Q-ID, and the P31 city-detection
    flag for a place entity in a single API call (`props=claims|labels`).

    Args:
        session:    Shared aiohttp.ClientSession.
        semaphore:  Concurrency throttle.
        place_qid:  Wikidata Q-identifier for the place (e.g. "Q178790").
        context:    Human-readable log label (usually the author name).

    Returns:
        A 3-tuple:
            french_label  (str | None)  — the entity's own label in fr/en.
            p131_qid      (str | None)  — Q-ID of the P131 parent entity.
            is_city       (bool)        — True if P31 contains a CITY_QIDS entry,
                                          meaning we can stop climbing here.
    """
    params: Dict[str, str] = {
        "action": "wbgetentities",
        "ids": place_qid,
        "props": "claims|labels",
        "languages": "fr|en",  # French preferred, English fall-back
    }

    data = await _fetch_json(
        session, semaphore, params, context=f"{context}/{place_qid}"
    )
    if not data:
        return None, None, False

    entities: Dict[str, Any] = data.get("entities", {})
    entity: Dict[str, Any] = entities.get(place_qid, {})

    if "missing" in entity:
        return None, None, False

    # ── Extract French / English label ──
    labels: Dict[str, Any] = entity.get("labels", {})
    label_value: Optional[str] = None
    for lang in ("fr", "en"):
        lv = labels.get(lang, {}).get("value")
        if lv:
            label_value = lv
            break

    claims: Dict[str, Any] = entity.get("claims", {})

    # ── Check P31 (instance of) against the city frozenset ──
    # A place qualifies as "city-level" if ANY of its P31 values is in CITY_QIDS.
    is_city: bool = False
    p31_statements: List[Any] = claims.get(P_INSTANCE_OF, [])
    for stmt in p31_statements:
        snak = stmt.get("mainsnak", {})
        if snak.get("snaktype") != "value":
            continue
        dv = snak.get("datavalue", {})
        if dv.get("type") == "wikibase-entityid":
            p31_qid = dv.get("value", {}).get("id", "")
            if p31_qid in CITY_QIDS:
                is_city = True
                logger.debug(
                    "🏙️   [%s] %s is city-level via P31=%s — stopping climb.",
                    context, place_qid, p31_qid,
                )
                break

    # ── Extract P131 parent Q-ID (first preferred/normal-rank value only) ──
    parent_qid: Optional[str] = _get_entity_id_claim(claims, P_LOCATED_IN)

    return label_value, parent_qid, is_city


async def resolve_place_label(
    session: aiohttp.ClientSession,
    semaphore: asyncio.Semaphore,
    place_qid: str,
    place_cache: Dict[str, str],
    context: str = "",
) -> Optional[str]:
    """
    City-forced place resolver — resolves a place Q-identifier to a city-level
    French label by combining P31 type-checking with P131 hierarchy climbing.

    Algorithm
    ---------
    1.  Cache hit on the original Q-ID → return immediately.
    2.  Fetch the entity's label, P131 parent, and P31 city flag.
    3.  If `is_city` is True, the current entity IS already a city/municipality
        → use its label and stop.  No unnecessary P131 hops.
    4.  If `is_city` is False and a P131 parent exists AND depth < MAX_P131_DEPTH,
        climb to the parent and repeat from step 2.
        Example chain:
          "Hôpital Cochin"   [Q178790] → P31=hospital       → NOT a city → climb
          "14ᵉ arrondissement" [Q270230] → P31=Q702492 (arrondissement of Paris)
                                                              → IS a city → STOP ✅
    5.  If depth is exhausted before hitting a city, return the best label seen.
    6.  Back-fill the cache with the resolved label for ALL Q-IDs visited
        (including intermediate hops), so future callers hit the cache immediately.

    Args:
        session:     Shared aiohttp.ClientSession.
        semaphore:   Concurrency throttle.
        place_qid:   Wikidata Q-identifier for the place (e.g. "Q178790").
        place_cache: Shared in-memory dict {qid → resolved_french_label}.
        context:     Human-readable log label (usually the author name).

    Returns:
        Resolved French city/region label (e.g. "Paris"), or None on failure.
    """
    # ── Fast path: cache hit on original Q-ID ──
    if place_qid in place_cache:
        cached = place_cache[place_qid]
        return cached if cached else None

    # Track every Q-ID visited in this chain so we can back-fill the cache.
    visited_qids: List[str] = []
    current_qid: str = place_qid
    best_label: Optional[str] = None

    for depth in range(MAX_P131_DEPTH + 1):  # 0 … MAX_P131_DEPTH inclusive

        # ── Cache hit mid-chain: borrow the already-resolved label ──
        if current_qid in place_cache:
            cached = place_cache[current_qid]
            if cached:
                best_label = cached
            break

        # ── API fetch: label + P131 parent + P31 city flag ──
        label, parent_qid, is_city = await _fetch_place_entity(
            session, semaphore, current_qid, context
        )

        if label:
            best_label = label  # always keep the most recent non-empty label

        visited_qids.append(current_qid)

        # ── City detected via P31 → stop climbing NOW ──
        if is_city:
            logger.debug(
                "📍  [%s] Resolved city: %s → %r (depth=%d, P31 match)",
                context, current_qid, best_label, depth,
            )
            break

        # ── No P31 city match: try climbing P131 if we still have budget ──
        if parent_qid and depth < MAX_P131_DEPTH:
            logger.debug(
                "🔼  [%s] %s → P131 → %s (depth %d)",
                context, current_qid, parent_qid, depth + 1,
            )
            current_qid = parent_qid

            # Shortcut: if the parent is already cached, use it immediately
            if parent_qid in place_cache:
                cached_parent = place_cache[parent_qid]
                if cached_parent:
                    best_label = cached_parent
                break
        else:
            # No P131 available OR depth budget spent — use best_label as-is.
            logger.debug(
                "📍  [%s] %s → %r (depth=%d, no further P131)",
                context, place_qid, best_label, depth,
            )
            break

    # ── Back-fill cache for every Q-ID visited in this chain ──
    cache_value: str = best_label if best_label else ""
    for qid in visited_qids:
        if qid not in place_cache:
            place_cache[qid] = cache_value

    if not best_label:
        logger.warning(
            "⚠️   [%s] Could not resolve a city label for place %s.",
            context, place_qid,
        )
        return None

    return best_label



# ===========================================================================
# ── STEP D – IMAGE URL FORMATTING ──────────────────────────────────────────
# ===========================================================================


def build_image_url(filename: str) -> str:
    """
    Convert a bare Wikimedia Commons filename (as stored in Wikidata claims)
    into a direct URL using Special:FilePath, which automatically redirects
    to the maximum-resolution original file when no `width` parameter is
    supplied.

    Wikimedia stores filenames with spaces encoded as underscores. We must
    URL-encode the filename to handle special characters safely.

    Args:
        filename: Raw filename string from Wikidata (e.g. "Victor Hugo.jpg").

    Returns:
        Full URL string (e.g.
        "https://commons.wikimedia.org/wiki/Special:FilePath/Victor_Hugo.jpg").
    """
    # Replace spaces with underscores (Wikimedia convention)
    normalised: str = filename.replace(" ", "_")
    # Percent-encode everything except the characters that are safe in a
    # URL path segment (letters, digits, -, _, ., ~)
    encoded: str = urllib.parse.quote(normalised, safe="")
    return COMMONS_FILE_PATH.format(filename=encoded)


# ===========================================================================
# ── STEP E – DATE FORMATTING ────────────────────────────────────────────────
# ===========================================================================


def format_wikidata_date(raw_time: str) -> str:
    """
    Parse a Wikidata time string and return a clean human-readable date.

    Wikidata time strings have the format:
        +YYYY-MM-DDThh:mm:ssZ  (precision 11 = day)
        +YYYY-MM-00T00:00:00Z  (precision 10 = month — day unknown)
        +YYYY-00-00T00:00:00Z  (precision  9 = year only)
        +YYYY-00-00T00:00:00Z  with large/negative years also possible

    Precision is encoded in the `precision` sub-field of the `time` object,
    but since we only have the raw string here we infer precision from the
    presence of zero-padded month/day fields.

    The function returns:
        "YYYY-MM-DD" when full date is known
        "YYYY-MM"    when only year+month are known
        "YYYY"       when only the year is known
        "YYYY" (BC)  when the year is negative (BCE dates)

    Args:
        raw_time: Wikidata time string (e.g. "+1821-04-09T00:00:00Z").

    Returns:
        Formatted date string.
    """
    # Strip leading sign character and the trailing time component
    # Pattern: [+-]YYYY-MM-DDThh:mm:ssZ
    match = re.match(
        r"^([+-]?)(\d+)-(\d{2})-(\d{2})T",
        raw_time,
    )
    if not match:
        # Cannot parse — return the raw string stripped of leading sign
        return raw_time.lstrip("+-").split("T")[0]

    sign: str = match.group(1)
    year_str: str = match.group(2)
    month: str = match.group(3)
    day: str = match.group(4)

    # Format the year (handle BCE by prefixing with "-")
    year_int: int = int(year_str)
    if sign == "-":
        year_formatted: str = f"-{year_int:04d}"
    else:
        year_formatted = f"{year_int:04d}"

    # Determine precision level from zero-padding
    if month == "00":
        return year_formatted                        # year only
    if day == "00":
        return f"{year_formatted}-{month}"           # year + month
    return f"{year_formatted}-{month}-{day}"         # full date


# ===========================================================================
# ── MAIN ENRICHMENT COROUTINE – One Author ──────────────────────────────────
# ===========================================================================


async def enrich_author(
    session: aiohttp.ClientSession,
    semaphore: asyncio.Semaphore,
    author_name: str,
    place_cache: Dict[str, str],
    entity_cache: Dict[str, str],
    output_lock: asyncio.Lock,
    output_file: "aiofiles.threadpool.text.AsyncTextIOWrapper",
    stats: Dict[str, Any],
) -> None:
    """
    Full enrichment pipeline for a single author name.

    Executes Steps A → F and writes the result to the output file
    immediately upon completion (to prevent data loss on crash).

    Args:
        session:      Shared aiohttp.ClientSession.
        semaphore:    Concurrency limit (max 5 parallel requests).
        author_name:  The author name to enrich.
        place_cache:  Shared in-memory dict for place Q-ID → city label (with
                      P31 city-forcing and P131 hierarchy climbing).
        entity_cache: Shared in-memory dict for non-place Q-IDs → French label
                      (movements, languages, nationalities — simple label fetch).
        output_lock:  asyncio.Lock protecting concurrent writes to the file.
        output_file:  Open aiofiles text file handle for writing.
        stats:        Shared statistics dict updated in-place.
    """

    logger.info("🔎  Enriching: %s", author_name)

    # ──────────────────────────────────────────────────────────────────────
    # Step A: Entity Resolution
    # ──────────────────────────────────────────────────────────────────────
    qid: Optional[str] = await resolve_entity(session, semaphore, author_name)
    if not qid:
        logger.warning("⛔  [%s] Could not resolve Wikidata entity — skipping.", author_name)
        async with output_lock:
            stats["not_found"].append(author_name)
        return

    # ──────────────────────────────────────────────────────────────────────
    # Step B: Claims Extraction
    # ──────────────────────────────────────────────────────────────────────
    claims: Optional[ClaimsDict] = await fetch_claims(
        session, semaphore, qid, context=author_name
    )
    if claims is None:
        logger.warning("⛔  [%s] Could not fetch claims for %s — skipping.", author_name, qid)
        async with output_lock:
            stats["not_found"].append(author_name)
        return

    # ── Extract raw values from claims ──────────────────────────────────
    portrait_filename: Optional[str]  = _get_string_claim(claims, P_IMAGE)
    signature_filename: Optional[str] = _get_string_claim(claims, P_SIGNATURE)
    raw_birth_date: Optional[str]     = _get_time_claim(claims, P_BIRTH_DATE)
    raw_death_date: Optional[str]     = _get_time_claim(claims, P_DEATH_DATE)
    native_name: Optional[str]        = _get_monolingual_claim(claims, P_NATIVE_NAME)

    # Q-IDs that need external resolution
    birth_place_qid: Optional[str]    = _get_entity_id_claim(claims, P_BIRTH_PLACE)
    death_place_qid: Optional[str]    = _get_entity_id_claim(claims, P_DEATH_PLACE)
    nationality_qid: Optional[str]    = _get_entity_id_claim(claims, P_NATIONALITY)

    # P1412 (languages) can have multiple values — take the first for output.
    language_qids: List[str]          = _get_entity_id_claims_all(claims, P_LANGUAGE)
    language_qid: Optional[str]       = language_qids[0] if language_qids else None

    # P135 (movement) can have multiple values — we want ALL of them
    movement_qids: List[str]          = _get_entity_id_claims_all(claims, P_MOVEMENT)

    # P737 (influenced by) can have multiple values — we want ALL of them
    influenced_by_qids: List[str]     = _get_entity_id_claims_all(claims, P_INFLUENCED_BY)

    # ──────────────────────────────────────────────────────────────────────
    # Step C / C½: Concurrent Q-ID Resolution
    # Resolve all Q-based fields in one asyncio.gather call so we only
    # consume wall-clock time equal to the slowest single request.
    # ──────────────────────────────────────────────────────────────────────
    async def _noop() -> None:
        """Async no-op placeholder for asyncio.gather when a Q-ID is absent."""
        return None

    def _place_task(qid_val: Optional[str]):
        if qid_val:
            return asyncio.create_task(
                resolve_place_label(session, semaphore, qid_val, place_cache, context=author_name)
            )
        return asyncio.create_task(_noop())

    def _entity_task(qid_val: Optional[str]):
        if qid_val:
            return asyncio.create_task(
                resolve_entity_label(session, semaphore, qid_val, entity_cache, context=author_name)
            )
        return asyncio.create_task(_noop())

    movement_tasks = [_entity_task(q) for q in movement_qids]
    influenced_by_tasks = [_entity_task(q) for q in influenced_by_qids]

    all_tasks: List[Any] = [
        _place_task(birth_place_qid),   # index 0
        _place_task(death_place_qid),   # index 1
        _entity_task(language_qid),     # index 2
        _entity_task(nationality_qid),  # index 3
    ]
    all_tasks.extend(movement_tasks)
    all_tasks.extend(influenced_by_tasks)

    resolution_results: List[Any] = list(await asyncio.gather(*all_tasks))

    birth_place_label: Optional[str]  = resolution_results[0] if birth_place_qid  else None
    death_place_label: Optional[str]  = resolution_results[1] if death_place_qid  else None
    language_label: Optional[str]     = resolution_results[2] if language_qid     else None
    nationality_label: Optional[str]  = resolution_results[3] if nationality_qid  else None

    idx = 4
    movement_labels_raw = resolution_results[idx : idx + len(movement_tasks)]
    idx += len(movement_tasks)
    influenced_by_labels_raw = resolution_results[idx:]

    movement_labels: List[str] = [lbl for lbl in movement_labels_raw if lbl]
    influenced_by_labels: List[str] = [lbl for lbl in influenced_by_labels_raw if lbl]

    # ──────────────────────────────────────────────────────────────────────
    # Step D: Image URL Formatting
    # ──────────────────────────────────────────────────────────────────────
    image_url: Optional[str] = (
        build_image_url(portrait_filename) if portrait_filename else None
    )
    signature_url: Optional[str] = (
        build_image_url(signature_filename) if signature_filename else None
    )

    # ──────────────────────────────────────────────────────────────────────
    # Step E: Date Formatting
    # ──────────────────────────────────────────────────────────────────────
    birth_date: Optional[str] = (
        format_wikidata_date(raw_birth_date) if raw_birth_date else None
    )
    death_date: Optional[str] = (
        format_wikidata_date(raw_death_date) if raw_death_date else None
    )

    # ──────────────────────────────────────────────────────────────────────
    # Step F: Assemble output record + missing_fields list
    # ──────────────────────────────────────────────────────────────────────
    missing_fields: List[str] = []
    field_checks: List[Tuple[str, Any]] = [
        ("image_url",    image_url),
        ("signature_url", signature_url),
        ("birth_date",   birth_date),
        ("death_date",   death_date),
        ("birth_place",  birth_place_label),
        ("death_place",  death_place_label),
        ("native_name",  native_name),
        ("movement",     movement_labels),
        ("language",     language_label),
        ("nationality",  nationality_label),
        ("influenced_by", influenced_by_labels),
    ]
    for field_name, field_value in field_checks:
        if not field_value:
            missing_fields.append(field_name)

    record: AuthorRecord = {
        "name":          author_name,
        "native_name":   native_name,
        "wikidata_id":   qid,
        "image_url":     image_url,
        "signature_url": signature_url,
        "birth_date":    birth_date,
        "death_date":    death_date,
        "birth_place":   birth_place_label,
        "death_place":   death_place_label,
        "movement":      movement_labels,
        "language":      language_label,
        "nationality":   nationality_label,
        "influenced_by": influenced_by_labels,
        "missing_fields": missing_fields,
    }

    # ──────────────────────────────────────────────────────────────────────
    # Write to output file (thread-safe, immediate)
    # ──────────────────────────────────────────────────────────────────────
    json_line: str = json.dumps(record, ensure_ascii=False) + "\n"
    async with output_lock:
        await output_file.write(json_line)
        await output_file.flush()

        # ── Update aggregated statistics ──
        stats["total_enriched"] += 1
        for field_name, field_value in field_checks:
            if not field_value:
                stats["missing_counts"][field_name] += 1

        if not missing_fields:
            stats["fully_enriched"] += 1

    logger.info(
        "✅  [%s] Done (QID=%s | missing=%s)",
        author_name,
        qid,
        missing_fields if missing_fields else "none",
    )





# ===========================================================================
# ── REPORT GENERATION ───────────────────────────────────────────────────────
# ===========================================================================


def generate_report(
    authors: Set[str],
    stats: Dict[str, Any],
    elapsed_seconds: float,
    report_path: Path,
) -> None:
    """
    Build a comprehensive execution report dict, print a summary to stdout,
    and persist the full report to a JSON file.

    Args:
        authors:         The full set of unique author names.
        stats:           The aggregated statistics dict populated during the run.
        elapsed_seconds: Total wall-clock time of the async pipeline.
        report_path:     Path where the JSON report file should be written.
    """
    total_authors: int = len(authors)
    not_found: List[str] = stats.get("not_found", [])
    total_enriched: int = stats.get("total_enriched", 0)
    fully_enriched: int = stats.get("fully_enriched", 0)
    missing_counts: Dict[str, int] = stats.get("missing_counts", {})

    report: Dict[str, Any] = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "elapsed_seconds": round(elapsed_seconds, 2),
        "input_file": str(INPUT_FILE),
        "output_file": str(OUTPUT_FILE),
        "summary": {
            "total_unique_authors": total_authors,
            "authors_resolved_on_wikidata": total_enriched,
            "authors_not_found_on_wikidata": len(not_found),
            "authors_fully_enriched": fully_enriched,
            "authors_partially_enriched": total_enriched - fully_enriched,
        },
        "missing_field_counts": missing_counts,
        "authors_not_found": sorted(not_found),
    }

    # ── Console summary ──
    sep: str = "═" * 60
    print(f"\n{sep}")
    print("  📊  EXTRACTION REPORT")
    print(sep)
    print(f"  Total unique authors   : {total_authors}")
    print(f"  Resolved on Wikidata   : {total_enriched}")
    print(f"  Not found              : {len(not_found)}")
    print(f"  Fully enriched         : {fully_enriched}")
    print(f"  Partially enriched     : {total_enriched - fully_enriched}")
    print(f"\n  Missing field counts:")
    for field, count in sorted(missing_counts.items(), key=lambda kv: -kv[1]):
        print(f"    {field:<20s}: {count}")
    if not_found:
        print(f"\n  Authors not found ({len(not_found)}):")
        for name in sorted(not_found)[:20]:
            print(f"    • {name}")
        if len(not_found) > 20:
            print(f"    … and {len(not_found) - 20} more (see {report_path.name})")
    print(f"\n  Elapsed time           : {elapsed_seconds:.1f} s")
    print(f"  Report saved to        : {report_path}")
    print(sep + "\n")

    # ── Persist report to disk ──
    with open(report_path, "w", encoding="utf-8") as fh:
        json.dump(report, fh, ensure_ascii=False, indent=2)

    logger.info("📄  Report written to %s", report_path)


# ===========================================================================
# ── ASYNC MAIN PIPELINE ─────────────────────────────────────────────────────
# ===========================================================================


async def main() -> None:
    """
    Entry point for the asynchronous enrichment pipeline.

    Orchestrates all steps:
        1. Stream the input file and collect unique authors (synchronous).
        2. Open the output file and an aiohttp session.
        3. Spawn concurrent enrichment tasks (bounded by semaphore).
        4. Generate and save the execution report.
    """
    pipeline_start: float = time.monotonic()

    logger.info("🚀  OdePoetryAppBot — Author enrichment pipeline starting …")
    logger.info("    Input  : %s", INPUT_FILE)
    logger.info("    Output : %s", OUTPUT_FILE)

    # ── Step 1: collect unique authors (synchronous, memory-efficient) ──
    try:
        unique_authors: Set[str] = stream_unique_authors(INPUT_FILE)
    except (FileNotFoundError, ValueError) as exc:
        logger.error("💥  Fatal error reading input: %s", exc)
        sys.exit(1)

    # ── Shared mutable state ──
    # asyncio's single-threaded event loop means that the GIL provides
    # sufficient protection for plain Python dict/list mutations here,
    # BUT we still use a separate asyncio.Lock for file writes because
    # those are I/O operations that can interleave across coroutines.
    semaphore: asyncio.Semaphore = asyncio.Semaphore(MAX_CONCURRENT_REQUESTS)
    output_lock: asyncio.Lock = asyncio.Lock()
    place_cache: Dict[str, str] = {}   # {place_qid: resolved_city_label} (city-forced)
    entity_cache: Dict[str, str] = {}  # {entity_qid: french_label} (movements, langs, nationality)

    stats: Dict[str, Any] = {
        "total_enriched": 0,         # authors successfully written
        "fully_enriched": 0,         # authors with zero missing fields
        "not_found": [],             # authors with no Wikidata match
        "missing_counts": defaultdict(int),  # {field_name: count}
    }

    # ── Configure aiohttp session with the mandatory Wikimedia User-Agent ──
    headers: Dict[str, str] = {
        "User-Agent": USER_AGENT,
        "Accept": "application/json",
    }
    connector = aiohttp.TCPConnector(
        limit=MAX_CONCURRENT_REQUESTS + 2,  # a tiny buffer above semaphore
        ssl=True,
    )

    # ── Open output file and start all enrichment tasks ──
    async with aiofiles.open(OUTPUT_FILE, "w", encoding="utf-8") as out_file:
        async with aiohttp.ClientSession(
            headers=headers, connector=connector
        ) as session:

            # Build a list of coroutine tasks — one per unique author.
            # asyncio.gather runs them concurrently, but the semaphore inside
            # _fetch_json caps actual in-flight HTTP requests to 5 at a time.
            tasks: List[asyncio.Task] = [
                asyncio.create_task(
                    enrich_author(
                        session=session,
                        semaphore=semaphore,
                        author_name=name,
                        place_cache=place_cache,
                        entity_cache=entity_cache,
                        output_lock=output_lock,
                        output_file=out_file,
                        stats=stats,
                    )
                )
                for name in unique_authors
            ]

            logger.info(
                "⚡  Dispatching %d enrichment tasks (max %d concurrent requests) …",
                len(tasks),
                MAX_CONCURRENT_REQUESTS,
            )

            # return_exceptions=True ensures one failing task doesn't cancel
            # all others — errors are already handled inside enrich_author.
            results = await asyncio.gather(*tasks, return_exceptions=True)

            # Log any unexpected exceptions that bypassed the per-author
            # error handling (should not happen in normal operation).
            for i, result in enumerate(results):
                if isinstance(result, Exception):
                    logger.error(
                        "💥  Unexpected exception in task %d: %s", i, result
                    )

    # ── Pipeline finished — generate report ──
    elapsed: float = time.monotonic() - pipeline_start
    generate_report(unique_authors, stats, elapsed, REPORT_FILE)

    logger.info("🏁  Pipeline complete. Output: %s", OUTPUT_FILE)


# ===========================================================================
# ── ENTRY POINT ─────────────────────────────────────────────────────────────
# ===========================================================================

if __name__ == "__main__":
    # On Windows, the default asyncio event loop policy can cause issues with
    # subprocesses; ProactorEventLoop is the appropriate choice there.
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

    asyncio.run(main())
