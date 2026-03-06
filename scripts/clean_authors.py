import gzip
import json
import re
import os
import time
import unicodedata
from collections import defaultdict
from typing import Dict, Tuple, Optional, Any
from dataclasses import dataclass, field

class RuleEngine:
    """
    Hardcoded rule engine for cleaning author names purely in memory.
    """
    def __init__(self, known_authors: set):
        self.known_authors = known_authors
        # Specific Rules (Exact Matches - O(1) lookup)
        # Formatted as Old Name : New Name
        raw_specific_rules: Dict[str, str] = {
            "Ad. van Bever": "Adolphe Van Bever",
            "A.M. Blanchecotte": "Augustine-Malvina Blanchecotte",
            "B. de Fourcaud": "Louis Boussès de Fourcaud",
            "Berryer fils": "Pierre-Antoine Berryer",
            "Berthe Ponselet-Dronsart": "Berthe Poncelet-Dronsart",
            "Bluet d’Arbères": "Bernard Bluet d’Arbères",
            "Ch. L. Livet": "Charles-Louis Livet",
            "C. P. Kavafis": "Constantin Cavafy",
            "Camille Macaigne, Camille Macaigne, [[Alphonse Lemerre": "Camille Macaigne",
            "Catulle MendèsetCharles Baudelaire": "Catulle Mendès",
            "ChapelleetBachaumont": "Claude-Emmanuel Lhuillier ; François Le Coigneux de Bachaumont",
            "Chapelle": "Claude-Emmanuel Lhuillier",
            "Charlier Nodier": "Charles Nodier",
            "Clothilde de Surville": "Marguerite-Eléonore Clotilde de Vallon-Chalys de Surville",
            "Comtesse Mathieu de Noailles": "Anna de Noailles",
            "CteAlfred de Vigny": "Alfred de Vigny",
            "D.V.Z.": "Jean de Vauzelles",
            "Dorat, SaurinetLa Roche": "Claude-Joseph Dorat ; Bernard-Joseph Saurin ; Pierre-Louis Lefebvre-Laroche",
            "Estienne DurandGuillaume Colletet": "Estienne Durand ; Guillaume Colletet",
            "Auguste Barthélemy, Joseph Méry": "Auguste Barthélemy ; Joseph Méry",
            "François CoppéeetPetœfi<link itemprop='mainEntityOfPage' href='https://fr.wikisource.org/wiki/Auteur:Fran%C3%A7ois_Copp%C3%A9e' />": "François Coppée",
            "François Malherbe, commentaire parAndré Chénier": "François de Malherbe",
            "Félicie d'Aïzac": "Félicie d'Ayzac",
            "G. Dubois-Desaulle": "Gaston Dubois-Desaulle",
            "G.-N. Humilis": "Germain Nouveau",
            "Gabriel Monavon(parole)Félicien David": "Gabriel Monavon",
            "Georges Montéhus": "Montéhus",
            "Germain Léonard": "Nicolas-Germain Léonard",
            "Henry d'Andichon": "Henri d'Andichon",
            "Horace, Perse": "Horace ; Perse",
            "I.D.V.": "Jean de Vauzelles",
            "I.K. Bonset": "Theo van Doesburg",
            "Isis Copia(pseudonyme deMay Ziadé": "May Ziadé",
            "J.Autran": "Joseph Autran",
            "J.-J. Ampère": "Jean-Jacques Ampère",
            "J. Fleury": "Jean Fleury",
            "Jean Bertaut, Jacques Davy du Perron, Jean de Sponde": "Jean Bertaut ; Jacques Davy du Perron ; Jean de Sponde",
            "Joseph PastureletGabriel Pasturel": "Joseph Pasturel ; Gabriel Pasturel",
            "Joseph-N. Dupuis": "Joseph-Nazaire-Odilon Dupuis",
            "Jules de Vernay(Article de presse) etGeorge Sand": "George Sand",
            "L. Ackermann": "Louise-Victorine Ackermann",
            "Le Sire de Chambley": "Edmond Haraucourt",
            "Le Vicomte de Guerne": "André de Guerne",
            "Lucile Duplessis, deSylvain Maréchal": "Sylvain Maréchal",
            "Lucile Duplessis": "Lucile Desmoulins",
            "L’Abbé de Chaulieu": "Guillaume Amfrye de Chaulieu",
            "L’Auteur de Marie": "Auguste Brizeux",
            "L’auteur de Marie": "Auguste Brizeux",
            "M. Guyau": "Jean-Marie Guyau",
            "M. le vicomte de Nugent": "Charles de Nugent",
            "MlleDeshoulières": "Antoinette-Thérèse Des Houlières",
            "Mllede Sasserno": "Agathe-Sophie Sasserno",
            "Mme Alphonse Daudet": "Julia Daudet",
            "Mme Amable Tastu": "Amable Tastu",
            "Mme De LA VÉRANDIÈRE": "Marie-Amable Petiteau",
            "Mme Dufresnoy": "Adélaïde-Gillette Dufrénoy",
            "Mme Perdriel-Vaissière": "Jeanne Perdriel-Vaissière",
            "Mme de Salm": "Constance de Théis",
            "MmeAlphonse Daudet": "Julia Daudet",
            "MmeAnaïs Ségalas": "Anaïs Ségalas",
            "MmeBlanchecotte": "Augustine-Malvina Blanchecotte",
            "MmeCaroline Olivier": "Caroline Olivier",
            "MmeDesbordes-Valmore": "Marceline Desbordes-Valmore",
            "MmeDeshoulières": "Antoinette Des Houlières",
            "MmeG. de Montgomery": "Lucy Ditte",
            "MmeJanvier": "Adèle Gennevraye",
            "MmeLouise Collet": "Louise Colet",
            "MmeMennessier-Nodier": "Marie Antoinette Mennessier-Nodier",
            "MmeVerdier": "Suzanne Verdier",
            "Nicole Estienne Liébaut": "Nicole Estienne",
            "Nikolaus Becker, Alphonse de Lamartine": "Alphonse de Lamartine",
            "non signé": "Charles-Augustin Sainte-Beuve",
            "O.-W. Milosz": "Oscar Venceslas de Lubicz-Milosz",
            "P. V. Delaporte, S. J.": "Victor Delaporte",
            "Paule Riversdale(Renée VivienetHélène de Zuylen de Nyevelt de Haar": "Renée Vivien ; Hélène de Zuylen de Nyevelt de Haar",
            "Petőfi": "Sándor Petőfi",
            "Pierre-Édouard Alletz": "Édouard Alletz",
            "Ponce-Denis (Écouchard) Lebrun": "Ponce-Denis Écouchard-Lebrun",
            "R. de Collerye": "Roger de Collerye",
            "Racan": "Honorat de Bueil",
            "Marquis de Racan": "Honorat de Bueil",
            "Raymond de la Tailhède": "Raymond de La Tailhède",
            "Robert de Montesquiou-Fezensac": "Robert de Montesquiou",
            "Sainte-Beuve": "Charles-Augustin Sainte-Beuve",
            "Samuel Isarn, Mademoiselle de Scudéry": "Samuel Isarn",
            "Scarron": "Paul Scarron",
            "Schiller": "Friedrich Schiller",
            "Sybil (Elsa Kœberlé)": "Elsa Koeberlé",
            "Victor-Marie Hugo": "Victor Hugo",
            "Villenave": "Mathieu-Guillaume-Thérèse Villenave",
            "W.C. Bryant": "William Cullen Bryant",
            "xxx": "J. Clinchamp",
            "Zola": "Émile Zola",
            "…": "Alfred de Musset",
            "***": "Marie de Régnier"
        }
        
        # Cache Specific Rules stripped to ensure spacing issues in text-file imports don't break lookups
        self.specific_rules = {k.strip(): v for k, v in raw_specific_rules.items()}

        # General Rules (Schema Transformations)
        # Pre-compiled regular expressions for efficiency
        self.general_rules = [
            # Alexandre Macédonski; Alexandru Bogdan-Piteşti : prendre ce qu'il y a avant le ;
            ("Regex (Remove after Semicolon)", re.compile(r'\s*;.*$'), r''),
            # Alfred de Musset<link...> : supprimer le contenu entre <>
            ("Regex (Remove HTML Tags)", re.compile(r'<[^>]+>'), r''),
            # Anonyme, attribué àClaude d’Esternod : garder ce qu'il ya a après "attribué à"
            ("Regex (Keep after 'attribué à')", re.compile(r'^.*?attribué à\s*'), r''),
            # Gérard [de Nerval] : enlever les crochets
            ("Regex (Remove brackets)", re.compile(r'[\[\]]'), r''),
            # Jacques Madeleineavec une préface deCatulle Mendès : prendre ce qu'il y a avant "avec une préface de"
            ("Regex (Remove 'avec une préface de...')", re.compile(r'\s*avec une préface de.*$'), r''),
            # Jacques Normand, préface deSully Prudhomme : prendre ce qu'il y a avant ", préface de"
            ("Regex (Remove ', préface de...')", re.compile(r'\s*, préface de.*$'), r''),
            # Pétrus Borel; préface parJules Claretie : prendre ce qu'il y a avant "; préface par"
            ("Regex (Remove '; préface par...')", re.compile(r'\s*; préface par.*$'), r''),

            # General default cleanups
            # 1. Reverse "Lastname, Firstname" to "Firstname Lastname"
            #("Regex (Lastname, Firstname)", re.compile(r'^([^,]+),\s*([^,]+)$'), r'\2 \1'),
            # Collapse multiple whitespaces into a single space BEFORE punctuation check
            ("Regex (Extra Whitespace)", re.compile(r'\s{2,}'), r' '),
            # Strip trailing and leading punctuation (EXCEPT dots that might be initials)
            #("Regex (Punctuation Strip)", re.compile(r'^[,;:\-\s]+|[,;:\-\s]+$'), r'')
        ]
        
    def apply_rules(self, author_name: str) -> Tuple[str, Optional[str]]:
        """
        Applies rules to the author name to sanitize and format it.
        Returns a tuple of (new_name, rule_applied_type).
        If no rules needed to be applied, rule_applied_type is None.
        """
        if not author_name or not isinstance(author_name, str):
            return author_name, None
            
        # Initial deterministic clean
        cleaned_name = author_name.strip()
        
        # 1. Exact match lookup in Specific Rules (Pre-processing)
        if cleaned_name in self.specific_rules:
            return self.specific_rules[cleaned_name], "Specific"
            
        # 2. Iterative application of General Rules (Stop at first match that mutates string)
        for rule_name, pattern, replacement in self.general_rules:
            new_name = pattern.sub(replacement, cleaned_name).strip()
            
            # If the regex successfully mutated the name, stop and return the change
            if new_name != cleaned_name:
                cleaned_name = new_name
                
                # After the regex extraction, maybe it instantly resolves to a specific rule?
                if cleaned_name in self.specific_rules:
                    return self.specific_rules[cleaned_name], f"General ({rule_name}) + Specific Pipeline"
                    
                # Continue and see if it can be resolved via Initials Resolution instead of just returning early
                break
                
        # 3. Exact Match Lookup (Post-processing check)
        # Check against Specific Rules ONE MORE TIME.
        # This catches names like "Ch. L. Livet" that could have been skipped due to invisible padding
        # but match after a general cleanup regex or simple strip.
        if cleaned_name in self.specific_rules:
             rule_applied = "Specific" if cleaned_name == author_name.strip() else "General + Specific Pipeline"
             return self.specific_rules[cleaned_name], rule_applied

        # 4. Dynamic Initials Lookup
        resolved_name, initials_status = self._resolve_initials(cleaned_name)
        if initials_status == "resolved":
            rule_applied = "General + Dynamic Initials" if author_name != cleaned_name else "Dynamic Initials Resolution"
            return resolved_name, rule_applied
        elif initials_status == "failed":
            rule_applied = "Failed - Unresolved Initials"
            return cleaned_name, rule_applied
                
        # If we mutated via General Rule (but NOT Initials and NOT Specific)
        if cleaned_name != author_name:
            # We already matched a general rule or stripped cleanly
            return cleaned_name, "General Rule Match / Whitespace Trimming"
            
        # No rules matched, and string was already clean
        return author_name, None

    def _normalize(self, text: str) -> str:
        """Removes accents and converts to lowercase for robust matching."""
        return unicodedata.normalize('NFD', text.lower()).encode('ascii', 'ignore').decode('utf-8')

    def _resolve_initials(self, name: str) -> Tuple[str, str]:
        """
        Extracts content after the last dot in the name, treating the prefix as initials.
        Searches `self.known_authors` for a matching suffix and matching initials.
        Returns (Best_Candidate, "resolved") if resolved, (name, "failed") if eligible but failed, or (name, "not_applicable").
        """
        parts = name.rsplit('.', 1)
        if len(parts) != 2 or not parts[1].strip():
            return name, "not_applicable"
            
        initials_part = parts[0] + '.'
        last_name_part = parts[1].strip()
        last_name_norm = self._normalize(last_name_part)
        
        # Extract letters representing initials from the initial part
        initial_letters = [self._normalize(char) for char in initials_part if char.isalpha()]
        if not initial_letters:
            return name, "not_applicable"
            
        for candidate in self.known_authors:
            # We don't want to replace an author with initials by ANOTHER author with initials
            if '.' in candidate:
                continue
                
            candidate_norm = self._normalize(candidate)
                
            if candidate_norm.endswith(last_name_norm) and len(candidate_norm) > len(last_name_norm):
                # Ensure it's separated correctly as a last name
                prefix_len = len(candidate_norm) - len(last_name_norm)
                prefix = candidate[:prefix_len]
                if prefix[-1] not in (' ', '-'):
                    continue
                    
                first_name_part = prefix.strip()
                if not first_name_part:
                    continue
                    
                words = re.split(r'[\s\-]+', first_name_part)
                candidate_initials = [self._normalize(w[0]) for w in words if w]
                
                if candidate_initials == initial_letters:
                    return candidate, "resolved"
                    
        return name, "failed"


def main():
    # File Paths configuration
    script_dir = os.path.dirname(os.path.abspath(__file__))
    input_file = os.path.join(script_dir, "poems.jsonl.gz")
    output_file = os.path.join(script_dir, "poems.cleaned.jsonl.gz")
    log_file = os.path.join(script_dir, "cleaned_authors.json")

    print(f"Pass 1: Discovering all unique author names to support rule resolution...")
    known_authors = set()
    try:
        with gzip.open(input_file, 'rt', encoding='utf-8', errors='replace') as infile:
            for line in infile:
                try:
                    poem = json.loads(line)
                    if isinstance(poem, dict):
                        author = poem.get("metadata", {}).get("author")
                        if isinstance(author, str):
                            author_cleaned = author.strip()
                            if author_cleaned:
                                known_authors.add(author_cleaned)
                except:
                    continue
    except FileNotFoundError:
        print(f"CRITICAL ERROR: Input file '{input_file}' not found.")
        return
        
    print(f"Pass 1 Complete. Collected {len(known_authors)} unique author names.")

    rule_engine = RuleEngine(known_authors)
    
    # Custom class for strong type inference of tracking logs
    @dataclass
    class TrackingEntry:
        occurrences: int = 0
        example_page_ids: list = field(default_factory=list)

    # Execution metrics and log tracking dictionary
    total_poems_processed = 0
    total_names_modified = 0
    specific_rules_applied = 0
    general_rules_applied = 0
    
    # Tracking dictionary schema:
    # Key: (original_name, new_name, rule_type) -> Value: TrackingEntry
    tracking: Dict[Tuple[str, str, str], TrackingEntry] = defaultdict(TrackingEntry)
    
    print(f"Starting pipeline...")
    print(f"Input : {input_file}")
    print(f"Output: {output_file}")
    print(f"Log   : {log_file}")
    
    start_time = time.time()
    
    try:
        # Utilize line-by-line processing via generator yield natively in gzip to optimize memory footprint
        with gzip.open(input_file, 'rt', encoding='utf-8', errors='replace') as infile, \
             gzip.open(output_file, 'wt', encoding='utf-8', errors='replace') as outfile:
             
            for line_num, line in enumerate(infile, 1):
                total_poems_processed += 1
                
                try:
                    poem = json.loads(line)
                except json.JSONDecodeError:
                    # Failsafe: Re-emit identical unparseable line to prevent data loss
                    outfile.write(line)
                    continue
                
                if not isinstance(poem, dict):
                    outfile.write(line)
                    continue

                # Safely extract page identifier for telemetry
                page_id = poem.get("id", poem.get("page_id", f"line_{line_num}"))
                
                # Verify structure exists before navigation
                metadata = poem.get("metadata", {})
                if isinstance(metadata, dict) and "author" in metadata:
                    original_author = metadata["author"]
                    
                    if isinstance(original_author, str):
                        new_author, rule_type = rule_engine.apply_rules(original_author)
                        
                        if rule_type:
                            if "Failed -" in rule_type:
                                # We record the breakdown but don't overwrite poem author dict
                                key = (original_author, "UNRESOLVED", rule_type)
                                entry = tracking[key]
                                entry.occurrences += 1
                                if len(entry.example_page_ids) < 5:
                                    entry.example_page_ids.append(page_id)
                            else:
                                # Apply the modification to the dictionary dynamically
                                poem["metadata"]["author"] = new_author
                                total_names_modified += 1
                                
                                # Increment categorical application stats
                                if "Specific" in rule_type:
                                    specific_rules_applied += 1
                                else:
                                    general_rules_applied += 1
                                    
                                # Register memory for logs aggregation
                                key = (original_author, new_author, rule_type)
                                entry = tracking[key]
                                entry.occurrences += 1
                                # Boundary block to prevent unchecked list growth
                                if len(entry.example_page_ids) < 5:
                                    entry.example_page_ids.append(page_id)
                                
                # Re-serialize modified dictionary stream out dynamically
                try:
                    outfile.write(json.dumps(poem, ensure_ascii=False) + '\n')
                except TypeError:
                    # Redundant safety catch for nested un-serializable properties beyond our scope
                    outfile.write(line)
                    
                if total_poems_processed % 50000 == 0:
                    print(f"Processed {total_poems_processed} records footprint...")

    except FileNotFoundError:
        print(f"CRITICAL ERROR: Input file '{input_file}' not found. Verify the path.")
        return
    except Exception as e:
        print(f"CRITICAL ERROR: A catastrophic failure occurred during I/O loop: {e}")
        return
        
    print("\nFile processing completed. Emitting log aggregation...")
    
    # Generate structural output report
    modifications_list = []
    for (orig_name, new_name, r_type), entry in tracking.items():
        modifications_list.append({
            "original_name": orig_name,
            "new_name": new_name,
            "rule_type": r_type,
            "occurrences": entry.occurrences,
            "example_page_ids": entry.example_page_ids
        })
        
    # Standardize output format by heaviest occurrences descending
    modifications_list.sort(key=lambda x: x["occurrences"], reverse=True)
    
    report_data = {
        "summary": {
            "total_poems_processed": total_poems_processed,
            "total_names_modified": total_names_modified,
            "specific_rules_applied": specific_rules_applied,
            "general_rules_applied": general_rules_applied
        },
        "modifications": modifications_list
    }
    
    try:
        with open(log_file, 'w', encoding='utf-8') as f_log:
            json.dump(report_data, f_log, ensure_ascii=False, indent=2)
        print(f"Aggregated statistics written securely to {log_file}")
    except Exception as e:
        print(f"WARNING: Encountered issue while writing local log metrics: {e}")

    elapsed_time = time.time() - start_time
    print(f"\n[PIPELINE SUCCESS] 100% processing in {elapsed_time:.2f} seconds.")
    print(f" -> Processed : {total_poems_processed} items")
    print(f" -> Modified  : {total_names_modified} authors")

if __name__ == "__main__":
    main()
