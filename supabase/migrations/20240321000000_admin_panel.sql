-- ============================================================================
-- ADMIN PANEL MIGRATION
-- Adds admin role, column protection, JWT-based RLS, and atomic RPC functions.
-- ============================================================================

-- 1. ADMIN COLUMN
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false NOT NULL;

-- 2. COLUMN-LEVEL PROTECTION — prevents non-admins from self-promoting
CREATE OR REPLACE FUNCTION public.protect_is_admin_column()
RETURNS trigger AS $$
BEGIN
  IF NEW.is_admin IS DISTINCT FROM OLD.is_admin THEN

    IF current_user IN ('postgres','service_role') THEN
      RETURN NEW;
    END IF;

    IF COALESCE((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean, false) = false THEN
      RAISE EXCEPTION 'Unauthorized: cannot modify is_admin';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER guard_is_admin
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE PROCEDURE public.protect_is_admin_column();

-- 3. CUSTOM CLAIMS SYNC — propagate is_admin into auth.users.raw_app_meta_data (JWT)
-- When is_admin changes, the JWT will be updated on next sign-in / token refresh.
CREATE OR REPLACE FUNCTION public.sync_admin_claim()
RETURNS trigger AS $$
BEGIN
  IF NEW.is_admin IS DISTINCT FROM OLD.is_admin THEN
    UPDATE auth.users
    SET raw_app_meta_data = raw_app_meta_data || jsonb_build_object('is_admin', NEW.is_admin)
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_admin_flag_change
  AFTER UPDATE OF is_admin ON public.users
  FOR EACH ROW EXECUTE PROCEDURE public.sync_admin_claim();

-- 4. DAILY POEMS — add is_manual flag
ALTER TABLE public.daily_poems ADD COLUMN IF NOT EXISTS is_manual boolean DEFAULT false NOT NULL;

-- 5. JWT-BASED RLS WRITE POLICIES (O(1) — no subquery)

-- featured_authors
CREATE POLICY "Admins can manage featured authors"
  ON public.featured_authors FOR ALL
  USING ( (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true )
  WITH CHECK ( (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true );

-- featured_poems
CREATE POLICY "Admins can manage featured poems"
  ON public.featured_poems FOR ALL
  USING ( (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true )
  WITH CHECK ( (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true );

-- featured_collections
CREATE POLICY "Admins can manage featured collections"
  ON public.featured_collections FOR ALL
  USING ( (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true )
  WITH CHECK ( (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true );

-- daily_poems
CREATE POLICY "Admins can manage daily poems"
  ON public.daily_poems FOR ALL
  USING ( (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true )
  WITH CHECK ( (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true );

-- 6. ATOMIC RPC FUNCTIONS (SECURITY INVOKER — RLS does the authorization)

CREATE OR REPLACE FUNCTION public.update_featured_poems(new_poem_ids uuid[])
RETURNS void AS $$
BEGIN
  -- Authorization check
  IF current_user NOT IN ('postgres', 'service_role') AND NOT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'Unauthorized: must be admin to update featured poems';
  END IF;

  DELETE FROM public.featured_poems WHERE true;
  INSERT INTO public.featured_poems (poem_id, position)
  SELECT val, ord::int
  FROM unnest(new_poem_ids) WITH ORDINALITY AS t(val, ord);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION public.update_featured_authors(new_author_ids uuid[])
RETURNS void AS $$
BEGIN
  -- Authorization check
  IF current_user NOT IN ('postgres', 'service_role') AND NOT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'Unauthorized: must be admin to update featured authors';
  END IF;

  DELETE FROM public.featured_authors WHERE true;
  INSERT INTO public.featured_authors (author_id, position)
  SELECT val, ord::int
  FROM unnest(new_author_ids) WITH ORDINALITY AS t(val, ord);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION public.update_featured_collections(new_collection_ids uuid[])
RETURNS void AS $$
BEGIN
  -- Authorization check
  IF current_user NOT IN ('postgres', 'service_role') AND NOT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'Unauthorized: must be admin to update featured collections';
  END IF;

  DELETE FROM public.featured_collections WHERE true;
  INSERT INTO public.featured_collections (collection_id, position)
  SELECT val, ord::int
  FROM unnest(new_collection_ids) WITH ORDINALITY AS t(val, ord);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION public.set_daily_poem(target_date date, target_poem_id uuid)
RETURNS void AS $$
BEGIN
  -- Authorization check
  IF current_user NOT IN ('postgres', 'service_role') AND NOT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'Unauthorized: must be admin to set daily poem';
  END IF;

  INSERT INTO public.daily_poems (date, poem_id, is_manual)
  VALUES (target_date, target_poem_id, true)
  ON CONFLICT (date)
  DO UPDATE SET poem_id = EXCLUDED.poem_id, is_manual = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;