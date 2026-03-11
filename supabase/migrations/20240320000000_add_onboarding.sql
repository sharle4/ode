-- Migration: Add Onboarding Schema & RPC

-- 1. Add onboarding_status and font_size to users table
ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS onboarding_status text DEFAULT 'pending' NOT NULL,
  ADD COLUMN IF NOT EXISTS font_size text DEFAULT 'medium' NOT NULL,
  ADD CONSTRAINT users_onboarding_status_check CHECK (onboarding_status IN ('pending', 'completed', 'skipped')),
  ADD CONSTRAINT users_font_size_check CHECK (font_size IN ('small', 'medium', 'large', 'xlarge'));

-- 2. Create user_favorite_categories
CREATE TABLE IF NOT EXISTS public.user_favorite_categories (
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    category_id uuid REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    PRIMARY KEY (user_id, category_id)
);

-- Note: We use the same RLS policies as the rest of the application.
ALTER TABLE public.user_favorite_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own favorite categories" ON public.user_favorite_categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favorite categories" ON public.user_favorite_categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own favorite categories" ON public.user_favorite_categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorite categories" ON public.user_favorite_categories FOR DELETE USING (auth.uid() = user_id);

-- 3. Create user_favorite_authors
CREATE TABLE IF NOT EXISTS public.user_favorite_authors (
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    author_id uuid REFERENCES public.authors(id) ON DELETE CASCADE NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    PRIMARY KEY (user_id, author_id)
);

ALTER TABLE public.user_favorite_authors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own favorite authors" ON public.user_favorite_authors FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favorite authors" ON public.user_favorite_authors FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own favorite authors" ON public.user_favorite_authors FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorite authors" ON public.user_favorite_authors FOR DELETE USING (auth.uid() = user_id);


-- 4. Enable Update policy on public.users so the RPC can modify the status
DROP POLICY IF EXISTS "Users can update their own status" ON public.users;
CREATE POLICY "Users can update their own status" ON public.users FOR UPDATE USING (auth.uid() = id);

-- 5. Create RPC for User Onboarding (Wipe & Replace, Idempotent, SECURITY INVOKER)
CREATE OR REPLACE FUNCTION public.complete_user_onboarding(
    p_status text,
    p_typography text,
    p_theme text,
    p_font_size text,
    p_authors uuid[],
    p_categories uuid[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER -- Crucial: Respects RLS
AS $$
DECLARE
    v_user_id uuid := auth.uid();
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Validate status bounds
    IF p_status NOT IN ('completed', 'skipped') THEN
        RAISE EXCEPTION 'Invalid status';
    END IF;

    -- Update User profile preferences
    UPDATE public.users 
    SET 
        onboarding_status = p_status,
        typography_preference = p_typography,
        theme_preference = p_theme,
        font_size = p_font_size,
        updated_at = now()
    WHERE id = v_user_id;

    -- WIPE AND REPLACE for idempotency
    DELETE FROM public.user_favorite_authors WHERE user_id = v_user_id;
    DELETE FROM public.user_favorite_categories WHERE user_id = v_user_id;
    
    -- Insert authors (Max 5 limit enforced strictly at the database level)
    IF array_length(p_authors, 1) > 0 THEN
        IF array_length(p_authors, 1) > 5 THEN
            RAISE EXCEPTION 'Maximum 5 authors allowed';
        END IF;
        
        -- Expand the array into rows and insert
        INSERT INTO public.user_favorite_authors (user_id, author_id)
        SELECT v_user_id, a.author_id
        FROM unnest(p_authors) AS a(author_id);
    END IF;

    -- Insert categories (Max 5 limit enforced strictly at the database level)
    IF array_length(p_categories, 1) > 0 THEN
        IF array_length(p_categories, 1) > 5 THEN
            RAISE EXCEPTION 'Maximum 5 categories allowed';
        END IF;

        INSERT INTO public.user_favorite_categories (user_id, category_id)
        SELECT v_user_id, c.category_id
        FROM unnest(p_categories) AS c(category_id);
    END IF;
END;
$$;


-- 6. PostgreSQL Trigger to sync `onboarding_status` to `auth.users.raw_user_meta_data`
-- This prevents the Split-Brain paradox where public.users says 'completed' but the JWT says 'pending'
CREATE OR REPLACE FUNCTION public.handle_onboarding_status_change()
RETURNS trigger AS $$
BEGIN
    -- Only act if the status changing from pending to completed/skipped 
    -- Or if it's the first time being inserted
    IF (TG_OP = 'UPDATE' AND NEW.onboarding_status IS DISTINCT FROM OLD.onboarding_status) OR (TG_OP = 'INSERT') THEN
         UPDATE auth.users
         SET raw_user_meta_data = 
            jsonb_set(
                COALESCE(raw_user_meta_data, '{}'::jsonb),
                '{onboarding_status}', 
                to_jsonb(NEW.onboarding_status)
            )
         WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; -- SECURITY DEFINER needed to update auth schema

DROP TRIGGER IF EXISTS on_user_onboarding_status_updated ON public.users;
CREATE TRIGGER on_user_onboarding_status_updated
    AFTER INSERT OR UPDATE OF onboarding_status ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_onboarding_status_change();
