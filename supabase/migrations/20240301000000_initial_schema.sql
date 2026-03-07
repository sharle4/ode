-- 1. EXTENSIONS
-- (PostgreSQL native gen_random_uuid() is used instead of uuid-ossp)

-- 2. CORE TABLES (AUTHORS, COLLECTIONS, POEMS)

-- Auteurs
create table public.authors (
    id uuid primary key default gen_random_uuid(),
    name text unique not null,
    biography text,
    image_url text,
    signature_url text,
    date_of_birth text,
    date_of_death text,
    birth_place text,
    birth_place_detailed text,
    death_place text,
    death_place_detailed text,
    native_name text,
    movement text[],
    language text,
    nationality text,
    influenced_by text[],
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

-- Recueils
create table public.collections (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    author_id uuid references public.authors(id) on delete cascade,
    publication_year int,
    summary text,
    cover_url text,
    wikisource_page_id int,
    poems_count int default 0 not null,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

-- Poèmes
create table public.poems (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    slug text unique not null,
    author_id uuid references public.authors(id) on delete cascade not null,
    collection_id uuid references public.collections(id) on delete cascade,
    section_title text,
    poem_order int,
    content jsonb not null,
    normalized_text text,
    language text default 'fr' not null,
    publication_year int,
    wikisource_page_id int unique,
    hub_title text,
    hub_page_id int not null,
    average_review numeric(3,2) default 0.00 not null,
    reviews_count int default 0 not null,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

-- Index pour la recherche et les perfs sur le tri
create index idx_poems_author_id on public.poems(author_id);
create index idx_poems_collection_id on public.poems(collection_id);
create index idx_poems_slug on public.poems(slug);
create index idx_poems_hub_page_id on public.poems(hub_page_id);


-- 3. USERS & SOCIAL TABLES

-- Utilisateurs (Profiles) étendant auth.users (géré par Supabase)
create table public.users (
    id uuid primary key references auth.users(id) on delete cascade,
    username text unique not null,
    description text,
    avatar_url text,
    annotation_color text default '#FFD700',
    typography_preference text default 'serif',
    theme_preference text default 'system',
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

-- Table de liaison Top Poèmes (max 3 par contrainte applicative, unicité sur la position garantie en DB)
create table public.user_top_poems (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.users(id) on delete cascade not null,
    poem_id uuid references public.poems(id) on delete cascade not null,
    position int not null check (position in (1, 2, 3)),
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null,
    unique(user_id, position),
    unique(user_id, poem_id)
);

-- Table de liaison Top Auteurs
create table public.user_top_authors (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.users(id) on delete cascade not null,
    author_id uuid references public.authors(id) on delete cascade not null,
    position int not null check (position in (1, 2, 3)),
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null,
    unique(user_id, position),
    unique(user_id, author_id)
);

-- Followers
create table public.followers (
    follower_id uuid references public.users(id) on delete cascade not null,
    following_id uuid references public.users(id) on delete cascade not null,
    created_at timestamptz default now() not null,
    primary key (follower_id, following_id)
);

-- Reviews (Notes + Critiques fusionnées)
create table public.reviews (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.users(id) on delete cascade not null,
    poem_id uuid references public.poems(id) on delete cascade,
    collection_id uuid references public.collections(id) on delete cascade,
    score numeric(2,1) check (score >= 0.5 and score <= 5.0),
    emotion text,
    review_text text,
    likes_count int default 0 not null,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null,
    
    -- Le Exclusive Arc (soit poem, soit collection)
    check (
        (poem_id is not null and collection_id is null) or 
        (poem_id is null and collection_id is not null)
    ),
    
    unique(user_id, poem_id),
    unique(user_id, collection_id)
);

-- Likes sur les Reviews
create table public.review_likes (
    user_id uuid references public.users(id) on delete cascade not null,
    review_id uuid references public.reviews(id) on delete cascade not null,
    created_at timestamptz default now() not null,
    primary key (user_id, review_id)
);

-- Commentaires sur les Reviews
create table public.review_comments (
    id uuid primary key default gen_random_uuid(),
    review_id uuid references public.reviews(id) on delete cascade not null,
    user_id uuid references public.users(id) on delete cascade not null,
    content text not null,
    likes_count int default 0 not null,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

-- Likes sur les Commentaires de Reviews
create table public.review_comment_likes (
    user_id uuid references public.users(id) on delete cascade not null,
    comment_id uuid references public.review_comments(id) on delete cascade not null,
    created_at timestamptz default now() not null,
    primary key (user_id, comment_id)
);

-- Highlights
create table public.highlights (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.users(id) on delete cascade not null,
    poem_id uuid references public.poems(id) on delete cascade not null,
    stanza_index int not null,
    line_index int not null,
    text text not null,
    annotation text,
    is_private boolean default true not null,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);


-- 4. LISTS & CURATION

create table public.lists (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.users(id) on delete cascade not null,
    title text not null,
    description text,
    is_public boolean default true not null,
    likes_count int default 0 not null,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

create table public.list_items (
    list_id uuid references public.lists(id) on delete cascade not null,
    poem_id uuid references public.poems(id) on delete cascade not null,
    item_order int not null,
    notes text,
    created_at timestamptz default now() not null,
    primary key (list_id, poem_id)
);

create table public.list_likes (
    user_id uuid references public.users(id) on delete cascade not null,
    list_id uuid references public.lists(id) on delete cascade not null,
    created_at timestamptz default now() not null,
    primary key (user_id, list_id)
);

create table public.categories (
    id uuid primary key default gen_random_uuid(),
    name text unique not null,
    description text,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

create table public.poem_categories (
    poem_id uuid references public.poems(id) on delete cascade not null,
    category_id uuid references public.categories(id) on delete cascade not null,
    primary key (poem_id, category_id)
);

-- Index suggérés pour optimiser les jointures FK et interdire les full table scans on delete cascade
create index idx_reviews_user_id on public.reviews(user_id);
create index idx_reviews_poem_id on public.reviews(poem_id);
create index idx_reviews_collection_id on public.reviews(collection_id);

create index idx_review_comments_review_id on public.review_comments(review_id);

create index idx_highlights_user_id on public.highlights(user_id);
create index idx_highlights_poem_id on public.highlights(poem_id);

create index idx_list_items_list_id on public.list_items(list_id);
create index idx_lists_user_id on public.lists(user_id);

create index idx_user_top_poems_user_id on public.user_top_poems(user_id);
create index idx_user_top_authors_user_id on public.user_top_authors(user_id);

create table public.daily_poems (
    date date primary key,
    poem_id uuid references public.poems(id) on delete cascade not null,
    created_at timestamptz default now() not null
);


-- 5. GAMIFICATION & NOTIFICATIONS

create table public.badges (
    id uuid primary key default gen_random_uuid(),
    name text unique not null,
    description text not null,
    icon_url text,
    criteria_type text not null,
    criteria_threshold int not null,
    created_at timestamptz default now() not null
);

create table public.user_badges (
    user_id uuid references public.users(id) on delete cascade not null,
    badge_id uuid references public.badges(id) on delete cascade not null,
    unlocked_at timestamptz default now() not null,
    primary key (user_id, badge_id)
);

create table public.notifications (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.users(id) on delete cascade not null, -- receiver
    actor_id uuid references public.users(id) on delete set null, -- sender
    type text not null, -- 'new_follower', 'review_like', 'new_comment', 'badge_earned'
    reference_id uuid, -- review_id, comment_id, etc.
    is_read boolean default false not null,
    created_at timestamptz default now() not null
);

-- 6. BASIC ROW LEVEL SECURITY (RLS)
-- You can augment this later. For now, we enable it.

alter table public.authors enable row level security;
alter table public.collections enable row level security;
alter table public.poems enable row level security;
alter table public.users enable row level security;
alter table public.categories enable row level security;
alter table public.daily_poems enable row level security;
alter table public.badges enable row level security;

-- Public read access for static data
create policy "Authors are viewable by everyone." on public.authors for select using (true);
create policy "Collections are viewable by everyone." on public.collections for select using (true);
create policy "Poems are viewable by everyone." on public.poems for select using (true);
create policy "Categories are viewable by everyone." on public.categories for select using (true);
create policy "Daily poems are viewable by everyone." on public.daily_poems for select using (true);
create policy "Badges are viewable by everyone." on public.badges for select using (true);

-- User profiles are public
create policy "User profiles are viewable by everyone." on public.users for select using (true);
create policy "Users can update their own profile." on public.users for update using (auth.uid() = id);

-- Trigger to create a user profile when auth.users is created
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.users (id, username, avatar_url)
  values (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger for updating `updated_at` columns

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at_users before update on public.users for each row execute procedure handle_updated_at();
create trigger set_updated_at_authors before update on public.authors for each row execute procedure handle_updated_at();
create trigger set_updated_at_collections before update on public.collections for each row execute procedure handle_updated_at();
create trigger set_updated_at_poems before update on public.poems for each row execute procedure handle_updated_at();
create trigger set_updated_at_user_top_poems before update on public.user_top_poems for each row execute procedure handle_updated_at();
create trigger set_updated_at_user_top_authors before update on public.user_top_authors for each row execute procedure handle_updated_at();
create trigger set_updated_at_reviews before update on public.reviews for each row execute procedure handle_updated_at();
create trigger set_updated_at_review_comments before update on public.review_comments for each row execute procedure handle_updated_at();
create trigger set_updated_at_categories before update on public.categories for each row execute procedure handle_updated_at();
create trigger set_updated_at_highlights before update on public.highlights for each row execute procedure handle_updated_at();
create trigger set_updated_at_lists before update on public.lists for each row execute procedure handle_updated_at();
