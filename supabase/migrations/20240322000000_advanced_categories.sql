-- 1. Add unaccent extension for slug generation
CREATE EXTENSION IF NOT EXISTS unaccent;

-- 2. Alter categories table
ALTER TABLE public.categories ADD COLUMN slug text UNIQUE;
ALTER TABLE public.categories ADD COLUMN ornament_id text;
ALTER TABLE public.categories ADD COLUMN color text;

-- 3. Backfill slugs (auto-generate for existing rows)
-- We use a simple lowercase and regex replace on unaccented text
UPDATE public.categories 
SET slug = lower(regexp_replace(unaccent(name), '[^a-zA-Z0-9]+', '-', 'g')) 
WHERE slug IS NULL;

-- Ensure no trailing or leading dashes
UPDATE public.categories
SET slug = trim(both '-' from slug);

-- Make slug NOT NULL after backfill
ALTER TABLE public.categories ALTER COLUMN slug SET NOT NULL;

-- 4. Trigger for auto-slug generation
CREATE OR REPLACE FUNCTION public.set_category_slug()
RETURNS trigger AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := lower(regexp_replace(unaccent(NEW.name), '[^a-zA-Z0-9]+', '-', 'g'));
    NEW.slug := trim(both '-' from NEW.slug);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_category_insert_update
  BEFORE INSERT OR UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_category_slug();

-- 5. Create new junction tables with ordering
create table public.author_categories (
    author_id uuid references public.authors(id) on delete cascade not null,
    category_id uuid references public.categories(id) on delete cascade not null,
    position int not null default 0,
    created_at timestamptz default now() not null,
    primary key (author_id, category_id)
);

create table public.collection_categories (
    collection_id uuid references public.collections(id) on delete cascade not null,
    category_id uuid references public.categories(id) on delete cascade not null,
    position int not null default 0,
    created_at timestamptz default now() not null,
    primary key (collection_id, category_id)
);

-- 6. Add position to poem_categories (existing table)
ALTER TABLE public.poem_categories ADD COLUMN position int not null default 0;

-- 7. Add Foreign Key Indexes to prevent Full Table Scans
create index idx_author_categories_category_id on public.author_categories(category_id);
create index idx_author_categories_author_id on public.author_categories(author_id);

create index idx_collection_categories_category_id on public.collection_categories(category_id);
create index idx_collection_categories_collection_id on public.collection_categories(collection_id);

-- 8. Enable Row Level Security (RLS) and add Policies
alter table public.author_categories enable row level security;
alter table public.collection_categories enable row level security;
alter table public.poem_categories enable row level security;

create policy "Author categories viewable by everyone" on public.author_categories for select using (true);
create policy "Collection categories viewable by everyone" on public.collection_categories for select using (true);
create policy "Poem categories viewable by everyone" on public.poem_categories for select using (true);
