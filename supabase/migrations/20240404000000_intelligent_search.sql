-- ==========================================================
-- Migration: Intelligent, Fault-Tolerant & High-Performance Search
-- ==========================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- 2. IMMUTABLE UNACCENT & NORMALIZATION HELPERS
CREATE OR REPLACE FUNCTION public.immutable_unaccent(text)
RETURNS text AS $$
    SELECT public.unaccent('public.unaccent', $1);
$$ LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT;

CREATE OR REPLACE FUNCTION public.normalize_search_text(input_text text)
RETURNS text AS $$
DECLARE
    cleaned text;
BEGIN
    IF input_text IS NULL THEN
        RETURN '';
    END IF;
    -- Replace typographic apostrophes with standard single quote
    cleaned := regexp_replace(input_text, '[’‘ʼ´`]', '''', 'g');
    -- Replace ligatures
    cleaned := regexp_replace(cleaned, 'œ', 'oe', 'g');
    cleaned := regexp_replace(cleaned, 'Œ', 'Oe', 'g');
    cleaned := regexp_replace(cleaned, 'æ', 'ae', 'g');
    cleaned := regexp_replace(cleaned, 'Æ', 'Ae', 'g');
    -- Replace typographic dashes with hyphen
    cleaned := regexp_replace(cleaned, '[—–]', '-', 'g');
    -- Strip accents and lowercase
    cleaned := lower(public.immutable_unaccent(cleaned));
    -- Collapse multiple spaces and trim
    cleaned := regexp_replace(cleaned, '\s+', ' ', 'g');
    RETURN trim(cleaned);
END;
$$ LANGUAGE plpgsql IMMUTABLE PARALLEL SAFE;

-- 3. GIN & B-TREE INDEXES FOR LIGHTNING SEARCH
CREATE INDEX IF NOT EXISTS idx_poems_title_trgm 
ON public.poems USING gin (immutable_unaccent(lower(title)) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_authors_name_trgm 
ON public.authors USING gin (immutable_unaccent(lower(name)) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_collections_title_trgm 
ON public.collections USING gin (immutable_unaccent(lower(title)) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_categories_name_trgm 
ON public.categories USING gin (immutable_unaccent(lower(name)) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_poems_publication_year 
ON public.poems (publication_year);

CREATE INDEX IF NOT EXISTS idx_poems_verses_fts 
ON public.poems USING gin (to_tsvector('french', immutable_unaccent(coalesce(normalized_text, ''))));

-- 4. INTELLIGENT PROCEDURAL SEARCH CATALOG FUNCTION
CREATE OR REPLACE FUNCTION public.search_catalog_v2(
    query_text text,
    match_limit int DEFAULT 20
)
RETURNS jsonb AS $$
DECLARE
    clean_query text;
    norm_query text;
    extracted_year int;
    query_without_year text;
    norm_without_year text;
    tokens text[];
    result_json jsonb;
    title_match_count int;
BEGIN
    clean_query := trim(coalesce(query_text, ''));
    IF clean_query = '' THEN
        RETURN jsonb_build_object(
            'poems', '[]'::jsonb,
            'authors', '[]'::jsonb,
            'collections', '[]'::jsonb,
            'categories', '[]'::jsonb,
            'total', 0
        );
    END IF;

    norm_query := public.normalize_search_text(clean_query);
    
    -- Extract 4-digit year (between 1400 and 2099)
    extracted_year := (substring(clean_query FROM '\y(1[4-9][0-9]{2}|20[0-9]{2})\y'))::int;
    IF extracted_year IS NOT NULL THEN
        query_without_year := trim(regexp_replace(clean_query, '\y(1[4-9][0-9]{2}|20[0-9]{2})\y', ''));
        norm_without_year := trim(regexp_replace(norm_query, '\y(1[4-9][0-9]{2}|20[0-9]{2})\y', ''));
    ELSE
        query_without_year := clean_query;
        norm_without_year := norm_query;
    END IF;

    -- Tokenize meaningful terms (length >= 2)
    tokens := ARRAY(
        SELECT t FROM unnest(string_to_array(norm_without_year, ' ')) t 
        WHERE length(t) >= 2 AND t NOT IN ('le', 'la', 'les', 'de', 'du', 'des', 'un', 'une', 'et', 'en', 'au', 'aux', 'mon', 'ton', 'son', 'mes', 'tes', 'ses', 'qui', 'que', 'par', 'sur', 'dans', 'pour', 'avec')
    );

    -- Create temporary table for candidates
    CREATE TEMPORARY TABLE IF NOT EXISTS tmp_search_candidates (
        id uuid PRIMARY KEY,
        base_score int,
        match_source text
    ) ON COMMIT DROP;
    TRUNCATE tmp_search_candidates;

    -- 1. Candidate poems: Title matches (using immutable_unaccent(lower(title)) for GIN trigram index)
    INSERT INTO tmp_search_candidates (id, base_score, match_source)
    SELECT 
        p.id,
        (
            CASE 
                WHEN public.immutable_unaccent(lower(p.title)) = norm_query THEN 1500
                WHEN norm_without_year <> '' AND public.immutable_unaccent(lower(p.title)) = norm_without_year THEN 1400
                WHEN public.immutable_unaccent(lower(p.title)) LIKE norm_query || '%' THEN 900
                WHEN norm_without_year <> '' AND public.immutable_unaccent(lower(p.title)) LIKE norm_without_year || '%' THEN 850
                WHEN public.immutable_unaccent(lower(p.title)) LIKE '%' || norm_query || '%' THEN 700
                WHEN norm_without_year <> '' AND public.immutable_unaccent(lower(p.title)) LIKE '%' || norm_without_year || '%' THEN 650
                ELSE 300
            END
        ) as base_score,
        'title' as match_source
    FROM public.poems p
    WHERE 
        public.immutable_unaccent(lower(p.title)) LIKE '%' || norm_query || '%'
        OR (norm_without_year <> '' AND public.immutable_unaccent(lower(p.title)) LIKE '%' || norm_without_year || '%')
        OR (cardinality(tokens) > 0 AND public.immutable_unaccent(lower(p.title)) ILIKE ANY(ARRAY(SELECT '%' || t || '%' FROM unnest(tokens) t WHERE length(t) >= 3)))
    LIMIT 30
    ON CONFLICT (id) DO UPDATE 
    SET base_score = GREATEST(tmp_search_candidates.base_score, EXCLUDED.base_score);

    -- 2. Author + Title Cross Match (e.g. "marine Verlaine", "albatros baudelaire")
    IF cardinality(tokens) >= 2 OR norm_without_year <> '' THEN
        INSERT INTO tmp_search_candidates (id, base_score, match_source)
        SELECT 
            p.id,
            (
                CASE 
                    WHEN cardinality(tokens) > 0 AND public.immutable_unaccent(lower(p.title)) = ANY(tokens) THEN 1600
                    WHEN cardinality(tokens) > 0 AND EXISTS (SELECT 1 FROM unnest(tokens) t WHERE length(t) >= 3 AND public.immutable_unaccent(lower(p.title)) LIKE t || '%') THEN 1200
                    ELSE 950
                END
            ) as base_score,
            'author_title' as match_source
        FROM public.poems p
        JOIN public.poem_authors pa ON pa.poem_id = p.id
        JOIN public.authors a ON a.id = pa.author_id
        WHERE 
            (
                public.immutable_unaccent(lower(a.name)) LIKE '%' || norm_query || '%'
                OR (cardinality(tokens) > 0 AND public.immutable_unaccent(lower(a.name)) ILIKE ANY(ARRAY(SELECT '%' || t || '%' FROM unnest(tokens) t WHERE length(t) >= 3)))
            )
            AND (
                cardinality(tokens) > 0 
                AND public.immutable_unaccent(lower(p.title)) ILIKE ANY(ARRAY(SELECT '%' || t || '%' FROM unnest(tokens) t WHERE length(t) >= 3))
            )
        LIMIT 25
        ON CONFLICT (id) DO UPDATE 
        SET base_score = GREATEST(tmp_search_candidates.base_score, EXCLUDED.base_score),
            match_source = EXCLUDED.match_source;
    END IF;

    GET DIAGNOSTICS title_match_count = ROW_COUNT;

    -- 3. Verse matches: Run if we do NOT have strong title/author matches (base_score >= 800) OR query has >= 3 words
    IF NOT EXISTS (SELECT 1 FROM tmp_search_candidates WHERE base_score >= 800) AND length(norm_without_year) >= 3 THEN
        INSERT INTO tmp_search_candidates (id, base_score, match_source)
        SELECT 
            p.id,
            (
                CASE 
                    WHEN to_tsvector('french', public.immutable_unaccent(coalesce(p.normalized_text, ''))) @@ phraseto_tsquery('french', public.immutable_unaccent(norm_without_year)) THEN 1300
                    ELSE 500
                END
            ) as base_score,
            'verse' as match_source
        FROM public.poems p
        WHERE 
            to_tsvector('french', public.immutable_unaccent(coalesce(p.normalized_text, ''))) @@ phraseto_tsquery('french', public.immutable_unaccent(norm_without_year))
            OR (
                cardinality(tokens) >= 2 
                AND to_tsvector('french', public.immutable_unaccent(coalesce(p.normalized_text, ''))) @@ websearch_to_tsquery('french', public.immutable_unaccent(norm_without_year))
            )
        LIMIT 15
        ON CONFLICT (id) DO UPDATE
        SET base_score = GREATEST(tmp_search_candidates.base_score, EXCLUDED.base_score),
            match_source = EXCLUDED.match_source;
    END IF;

    -- Build final JSON
    WITH 
    matching_authors AS (
        SELECT 
            a.id, a.name, a.slug, a.image_url, a.date_of_birth, a.date_of_death, a.nationality, a.movement,
            (
                CASE WHEN public.immutable_unaccent(lower(a.name)) = norm_query THEN 1000
                     WHEN public.immutable_unaccent(lower(a.name)) LIKE norm_query || '%' THEN 700
                     WHEN public.immutable_unaccent(lower(a.name)) LIKE '%' || norm_query || '%' THEN 500
                     WHEN cardinality(tokens) > 0 AND public.immutable_unaccent(lower(a.name)) ILIKE ANY(ARRAY(SELECT '%' || t || '%' FROM unnest(tokens) t WHERE length(t) >= 3)) THEN 350
                     ELSE 100
                END
            ) as author_score
        FROM public.authors a
        WHERE 
            public.immutable_unaccent(lower(a.name)) LIKE '%' || norm_query || '%'
            OR (norm_without_year <> '' AND public.immutable_unaccent(lower(a.name)) LIKE '%' || norm_without_year || '%')
            OR (cardinality(tokens) > 0 AND public.immutable_unaccent(lower(a.name)) ILIKE ANY(ARRAY(SELECT '%' || t || '%' FROM unnest(tokens) t WHERE length(t) >= 3)))
        ORDER BY author_score DESC
        LIMIT 6
    ),

    matching_collections AS (
        SELECT 
            c.id, c.title, c.slug, c.publication_year, c.poems_count, c.cover_url,
            coalesce(
                (
                    SELECT jsonb_agg(jsonb_build_object('id', a.id, 'name', a.name, 'slug', a.slug))
                    FROM public.collection_authors ca
                    JOIN public.authors a ON a.id = ca.author_id
                    WHERE ca.collection_id = c.id
                ),
                '[]'::jsonb
            ) as authors,
            (
                CASE WHEN public.immutable_unaccent(lower(c.title)) = norm_query THEN 1000
                     WHEN public.immutable_unaccent(lower(c.title)) LIKE '%' || norm_query || '%' THEN 500
                     WHEN norm_without_year <> '' AND public.immutable_unaccent(lower(c.title)) LIKE '%' || norm_without_year || '%' THEN 400
                     ELSE 100
                END +
                CASE WHEN extracted_year IS NOT NULL AND c.publication_year = extracted_year THEN 400 ELSE 0 END
            ) as collection_score
        FROM public.collections c
        WHERE 
            public.immutable_unaccent(lower(c.title)) LIKE '%' || norm_query || '%'
            OR (norm_without_year <> '' AND public.immutable_unaccent(lower(c.title)) LIKE '%' || norm_without_year || '%')
            OR (cardinality(tokens) > 0 AND public.immutable_unaccent(lower(c.title)) ILIKE ANY(ARRAY(SELECT '%' || t || '%' FROM unnest(tokens) t WHERE length(t) >= 4)))
        ORDER BY collection_score DESC
        LIMIT 6
    ),

    matching_categories AS (
        SELECT 
            id, name, slug, type, color, ornament_id, description
        FROM public.categories
        WHERE 
            public.immutable_unaccent(lower(name)) LIKE '%' || norm_query || '%'
            OR (description IS NOT NULL AND public.immutable_unaccent(lower(description)) LIKE '%' || norm_query || '%')
        LIMIT 4
    ),

    scored_poems AS (
        SELECT 
            tc.id,
            tc.base_score + 
            -- Year exact match bonus!
            (CASE WHEN extracted_year IS NOT NULL AND p.publication_year = extracted_year THEN 1000 ELSE 0 END) +
            -- Popularity tie-breaker
            (coalesce(p.reads_count, 0) * 0.01 + coalesce(p.average_review, 0) * 2) as final_score,
            tc.match_source as primary_match_source
        FROM tmp_search_candidates tc
        JOIN public.poems p ON p.id = tc.id
        ORDER BY final_score DESC
        LIMIT match_limit
    ),

    enriched_poems AS (
        SELECT 
            p.id,
            p.title,
            p.slug,
            p.publication_year,
            p.average_review,
            p.reviews_count,
            p.reads_count,
            sp.primary_match_source as "matchType",
            CASE WHEN sp.primary_match_source = 'verse' THEN
                coalesce(
                    (
                        SELECT trim(line)
                        FROM unnest(string_to_array(p.normalized_text, E'\n')) as line
                        WHERE length(trim(line)) > 0 AND public.immutable_unaccent(lower(line)) LIKE '%' || norm_without_year || '%'
                        LIMIT 1
                    ),
                    (
                        SELECT trim(line)
                        FROM unnest(string_to_array(p.normalized_text, E'\n')) as line
                        WHERE length(trim(line)) > 0 AND cardinality(tokens) > 0 AND public.immutable_unaccent(lower(line)) ILIKE ANY(ARRAY(SELECT '%' || t || '%' FROM unnest(tokens) t WHERE length(t) >= 4))
                        LIMIT 1
                    )
                )
            ELSE NULL END as snippet,
            coalesce(
                (
                    SELECT jsonb_agg(jsonb_build_object('id', a.id, 'name', a.name, 'slug', a.slug))
                    FROM public.poem_authors pa
                    JOIN public.authors a ON a.id = pa.author_id
                    WHERE pa.poem_id = p.id
                ),
                '[]'::jsonb
            ) as authors,
            (
                SELECT jsonb_build_object('id', col.id, 'title', col.title, 'slug', col.slug)
                FROM public.collections col
                WHERE col.id = p.collection_id
            ) as collections,
            (
                SELECT jsonb_build_object(
                    'seed', rp.seed,
                    'palette_id', rp.palette_id,
                    'shape_type', rp.shape_type,
                    'layout_bias', rp.layout_bias,
                    'complexity', rp.complexity,
                    'texture_profile', rp.texture_profile,
                    'blend_mode', rp.blend_mode,
                    'density', rp.density,
                    'opacity_style', rp.opacity_style
                )
                FROM public.rothko_params rp
                WHERE rp.poem_id = p.id
                LIMIT 1
            ) as rothko_params
        FROM scored_poems sp
        JOIN public.poems p ON p.id = sp.id
        ORDER BY sp.final_score DESC
    )
    SELECT jsonb_build_object(
        'poems', coalesce((SELECT jsonb_agg(ep) FROM enriched_poems ep), '[]'::jsonb),
        'authors', coalesce((SELECT jsonb_agg(ma) FROM matching_authors ma), '[]'::jsonb),
        'collections', coalesce((SELECT jsonb_agg(mc) FROM matching_collections mc), '[]'::jsonb),
        'categories', coalesce((SELECT jsonb_agg(mcat) FROM matching_categories mcat), '[]'::jsonb),
        'total', (
            (SELECT count(*) FROM enriched_poems) +
            (SELECT count(*) FROM matching_authors) +
            (SELECT count(*) FROM matching_collections) +
            (SELECT count(*) FROM matching_categories)
        )
    ) INTO result_json;

    RETURN result_json;
END;
$$ LANGUAGE plpgsql VOLATILE;
