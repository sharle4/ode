-- ============================================================================
-- Migration: 20240406000000_enhance_user_lists.sql
-- Description: World-class enhancement for User Lists (Curations & Top Lists)
-- Features:
--   1. Slugs & SEO URLs: /[username]/lists/[slug] with user-scoped uniqueness
--   2. Ranked vs Thematic mode: `is_ranked` flag (Top 10 vs free collections)
--   3. Cover identity: `cover_url` support for custom or dynamic artwork
--   4. Denormalized, atomic counters: `poems_count` & `likes_count`
--   5. Full-text / Trigram search index on public lists
--   6. High-performance composite indexes for instant 0ms retrieval
--   7. Bulletproof, explicit Row-Level Security (RLS) policies
-- ============================================================================

-- 1. ADD NEW COLUMNS TO public.lists
ALTER TABLE public.lists
    ADD COLUMN IF NOT EXISTS slug text,
    ADD COLUMN IF NOT EXISTS is_ranked boolean DEFAULT false NOT NULL,
    ADD COLUMN IF NOT EXISTS poems_count int DEFAULT 0 NOT NULL,
    ADD COLUMN IF NOT EXISTS cover_url text;

-- 2. IMMUTABLE SLUGIFY HELPER FUNCTION (HANDLING FRENCH LIGATURES & DIACRITICS)
CREATE OR REPLACE FUNCTION public.slugify(value text)
RETURNS text AS $$
DECLARE
    clean text;
BEGIN
    IF value IS NULL OR trim(value) = '' THEN
        RETURN 'liste';
    END IF;
    clean := value;
    -- Handle French ligatures
    clean := regexp_replace(clean, 'œ', 'oe', 'gi');
    clean := regexp_replace(clean, 'æ', 'ae', 'gi');
    -- Unaccent using existing immutable function and lowercase
    clean := lower(public.immutable_unaccent(trim(clean)));
    -- Replace any non-alphanumeric character with hyphen
    clean := regexp_replace(clean, '[^a-z0-9]+', '-', 'g');
    -- Strip leading and trailing hyphens
    clean := regexp_replace(clean, '^-+|-+$', '', 'g');
    IF clean = '' THEN
        clean := 'liste';
    END IF;
    RETURN clean;
END;
$$ LANGUAGE plpgsql IMMUTABLE PARALLEL SAFE;

-- 3. AUTOMATIC SLUG GENERATION & COLLISION RESOLUTION TRIGGER
CREATE OR REPLACE FUNCTION public.handle_list_slug()
RETURNS trigger AS $$
DECLARE
    base_slug text;
    final_slug text;
    counter int := 1;
BEGIN
    -- On UPDATE: freeze slug, preserving existing URLs and shares
    IF (TG_OP = 'UPDATE') THEN
        IF OLD.slug IS NOT NULL AND OLD.slug <> '' THEN
            NEW.slug := OLD.slug;
            RETURN NEW;
        END IF;
    END IF;

    -- On INSERT (or UPDATE if slug was previously null):
    IF NEW.slug IS NULL OR trim(NEW.slug) = '' THEN
        base_slug := public.slugify(NEW.title);
    ELSE
        base_slug := public.slugify(NEW.slug);
    END IF;

    final_slug := base_slug;

    -- Resolve collisions per user_id
    WHILE EXISTS (
        SELECT 1 FROM public.lists
        WHERE user_id = NEW.user_id
          AND slug = final_slug
          AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    ) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;

    NEW.slug := final_slug;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_handle_list_slug ON public.lists;
CREATE TRIGGER trg_handle_list_slug
    BEFORE INSERT OR UPDATE ON public.lists
    FOR EACH ROW EXECUTE PROCEDURE public.handle_list_slug();

-- 4. BACKFILL EXISTING LISTS (IF ANY) AND ENFORCE CONSTRAINTS
DO $$
DECLARE
    r RECORD;
    base_s text;
    final_s text;
    cnt int;
BEGIN
    FOR r IN SELECT id, user_id, title FROM public.lists WHERE slug IS NULL OR slug = '' LOOP
        base_s := public.slugify(r.title);
        final_s := base_s;
        cnt := 1;
        WHILE EXISTS (
            SELECT 1 FROM public.lists
            WHERE user_id = r.user_id AND slug = final_s AND id <> r.id
        ) LOOP
            cnt := cnt + 1;
            final_s := base_s || '-' || cnt;
        END LOOP;
        UPDATE public.lists SET slug = final_s WHERE id = r.id;
    END LOOP;
END $$;

ALTER TABLE public.lists
    ALTER COLUMN slug SET NOT NULL;

-- Unique constraint: a user cannot have two lists with the same slug
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'lists_user_id_slug_key'
    ) THEN
        ALTER TABLE public.lists ADD CONSTRAINT lists_user_id_slug_key UNIQUE (user_id, slug);
    END IF;
END $$;

-- Check constraint on item_order (non-negative)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'list_items_item_order_check'
    ) THEN
        ALTER TABLE public.list_items ADD CONSTRAINT list_items_item_order_check CHECK (item_order >= 0);
    END IF;
END $$;

-- Backfill poems_count and likes_count
UPDATE public.lists l
SET poems_count = (
    SELECT count(*) FROM public.list_items li WHERE li.list_id = l.id
),
likes_count = (
    SELECT count(*) FROM public.list_likes ll WHERE ll.list_id = l.id
);

-- 5. ATOMIC COUNTERS & TIMESTAMPS TRIGGERS

-- A. List Items count & list updated_at
CREATE OR REPLACE FUNCTION public.handle_list_items_count()
RETURNS trigger AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.lists
        SET poems_count = poems_count + 1,
            updated_at = now()
        WHERE id = NEW.list_id;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.lists
        SET poems_count = greatest(0, poems_count - 1),
            updated_at = now()
        WHERE id = OLD.list_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_list_item_change ON public.list_items;
CREATE TRIGGER on_list_item_change
    AFTER INSERT OR DELETE ON public.list_items
    FOR EACH ROW EXECUTE PROCEDURE public.handle_list_items_count();

-- B. List Likes count
CREATE OR REPLACE FUNCTION public.handle_list_likes_count()
RETURNS trigger AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.lists
        SET likes_count = likes_count + 1
        WHERE id = NEW.list_id;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.lists
        SET likes_count = greatest(0, likes_count - 1)
        WHERE id = OLD.list_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_list_like_change ON public.list_likes;
CREATE TRIGGER on_list_like_change
    AFTER INSERT OR DELETE ON public.list_likes
    FOR EACH ROW EXECUTE PROCEDURE public.handle_list_likes_count();

-- 6. HIGH-PERFORMANCE INDEXING STRATEGY

-- Drop redundant index (already covered by PK (list_id, poem_id))
DROP INDEX IF EXISTS public.idx_list_items_list_id;

-- Fast item retrieval ordered by item_order
CREATE INDEX IF NOT EXISTS idx_list_items_list_order 
ON public.list_items (list_id, item_order ASC);

-- Foreign key cascade and reverse lookups ("lists containing this poem")
CREATE INDEX IF NOT EXISTS idx_list_items_poem_id 
ON public.list_items (poem_id);

-- Foreign key cascade & like lookups for a list
CREATE INDEX IF NOT EXISTS idx_list_likes_list_id 
ON public.list_likes (list_id);

-- User profile liked lists tab
CREATE INDEX IF NOT EXISTS idx_list_likes_user_created 
ON public.list_likes (user_id, created_at DESC);

-- User profile lists tab
CREATE INDEX IF NOT EXISTS idx_lists_user_created 
ON public.lists (user_id, created_at DESC);

-- Public lists exploration / ranking (by popularity)
CREATE INDEX IF NOT EXISTS idx_lists_public_ranking 
ON public.lists (is_public, likes_count DESC, created_at DESC) 
WHERE is_public = true;

-- Fast lookup by user_id and slug
CREATE INDEX IF NOT EXISTS idx_lists_user_slug 
ON public.lists (user_id, slug);

-- Trigram fuzzy search on public lists
CREATE INDEX IF NOT EXISTS idx_lists_title_trgm 
ON public.lists USING gin (immutable_unaccent(lower(title)) gin_trgm_ops) 
WHERE is_public = true;

-- 7. REINFORCED ROW LEVEL SECURITY (RLS) POLICIES

-- lists
DROP POLICY IF EXISTS "Lists conditional visibility" ON public.lists;
DROP POLICY IF EXISTS "Users can manage their lists" ON public.lists;
DROP POLICY IF EXISTS "Lists are viewable if public or owner" ON public.lists;
DROP POLICY IF EXISTS "Users can create their own lists" ON public.lists;
DROP POLICY IF EXISTS "Users can update their own lists" ON public.lists;
DROP POLICY IF EXISTS "Users can delete their own lists" ON public.lists;

CREATE POLICY "Lists are viewable if public or owner"
    ON public.lists FOR SELECT
    USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their own lists"
    ON public.lists FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lists"
    ON public.lists FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lists"
    ON public.lists FOR DELETE
    USING (auth.uid() = user_id);

-- list_items
DROP POLICY IF EXISTS "List items conditional visibility" ON public.list_items;
DROP POLICY IF EXISTS "Users can manage their list items" ON public.list_items;
DROP POLICY IF EXISTS "List items are viewable if parent list is public or owner" ON public.list_items;
DROP POLICY IF EXISTS "Users can insert items into their own lists" ON public.list_items;
DROP POLICY IF EXISTS "Users can update items in their own lists" ON public.list_items;
DROP POLICY IF EXISTS "Users can delete items from their own lists" ON public.list_items;

CREATE POLICY "List items are viewable if parent list is public or owner"
    ON public.list_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.lists l
            WHERE l.id = list_items.list_id
              AND (l.is_public = true OR l.user_id = auth.uid())
        )
    );

CREATE POLICY "Users can insert items into their own lists"
    ON public.list_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.lists l
            WHERE l.id = list_items.list_id
              AND l.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update items in their own lists"
    ON public.list_items FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.lists l
            WHERE l.id = list_items.list_id
              AND l.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.lists l
            WHERE l.id = list_items.list_id
              AND l.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete items from their own lists"
    ON public.list_items FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.lists l
            WHERE l.id = list_items.list_id
              AND l.user_id = auth.uid()
        )
    );

-- list_likes
DROP POLICY IF EXISTS "List likes viewable by everyone" ON public.list_likes;
DROP POLICY IF EXISTS "Users can manage their list likes" ON public.list_likes;
DROP POLICY IF EXISTS "List likes are viewable by everyone" ON public.list_likes;
DROP POLICY IF EXISTS "Users can insert their own list likes" ON public.list_likes;
DROP POLICY IF EXISTS "Users can delete their own list likes" ON public.list_likes;

CREATE POLICY "List likes are viewable by everyone"
    ON public.list_likes FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own list likes"
    ON public.list_likes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own list likes"
    ON public.list_likes FOR DELETE
    USING (auth.uid() = user_id);
