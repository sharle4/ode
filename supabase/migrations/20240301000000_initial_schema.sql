-- 1. EXTENSIONS
-- (PostgreSQL native gen_random_uuid() is used instead of uuid-ossp)

-- 2. CORE TABLES (AUTHORS, COLLECTIONS, POEMS)

-- Auteurs
create table public.authors (
    id uuid primary key default gen_random_uuid(),
    name text unique not null,
    slug text unique not null,
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
    slug text unique not null,
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
    reads_count int default 0 not null,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

-- Index pour la recherche et les perfs sur le tri
create index idx_poems_collection_id on public.poems(collection_id);
create index idx_poems_slug on public.poems(slug);
create index idx_poems_hub_page_id on public.poems(hub_page_id);

-- Tables de jointure pour Auteurs
create table public.poem_authors (
    poem_id uuid references public.poems(id) on delete cascade not null,
    author_id uuid references public.authors(id) on delete cascade not null,
    created_at timestamptz default now() not null,
    primary key (poem_id, author_id)
);

create table public.collection_authors (
    collection_id uuid references public.collections(id) on delete cascade not null,
    author_id uuid references public.authors(id) on delete cascade not null,
    created_at timestamptz default now() not null,
    primary key (collection_id, author_id)
);

-- Index pour les tables de jointure
create index idx_poem_authors_author_id on public.poem_authors(author_id);
create index idx_collection_authors_author_id on public.collection_authors(author_id);


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

-- Reads (Historique de lecture)
create table public.reads (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.users(id) on delete cascade not null,
    poem_id uuid references public.poems(id) on delete cascade not null,
    processed boolean default false not null,
    created_at timestamptz default now() not null,
    unique(user_id, poem_id)
);

create index idx_reads_user_id on public.reads(user_id);
create index idx_reads_poem_id on public.reads(poem_id);

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
alter table public.collection_authors enable row level security;
alter table public.poems enable row level security;
alter table public.poem_authors enable row level security;
alter table public.users enable row level security;
alter table public.categories enable row level security;
alter table public.daily_poems enable row level security;
alter table public.badges enable row level security;
alter table public.reads enable row level security;

-- Enable RLS on all social tables
alter table public.user_top_poems enable row level security;
alter table public.user_top_authors enable row level security;
alter table public.followers enable row level security;
alter table public.reviews enable row level security;
alter table public.review_likes enable row level security;
alter table public.review_comments enable row level security;
alter table public.review_comment_likes enable row level security;
alter table public.highlights enable row level security;
alter table public.lists enable row level security;
alter table public.list_items enable row level security;
alter table public.list_likes enable row level security;
alter table public.user_badges enable row level security;
alter table public.notifications enable row level security;

-- Public read access for static data
create policy "Authors are viewable by everyone." on public.authors for select using (true);
create policy "Collections are viewable by everyone." on public.collections for select using (true);
create policy "Collection authors are viewable by everyone." on public.collection_authors for select using (true);
create policy "Poems are viewable by everyone." on public.poems for select using (true);
create policy "Poem authors are viewable by everyone." on public.poem_authors for select using (true);
create policy "Categories are viewable by everyone." on public.categories for select using (true);
create policy "Daily poems are viewable by everyone." on public.daily_poems for select using (true);
create policy "Badges are viewable by everyone." on public.badges for select using (true);
create policy "Reads are viewable by everyone." on public.reads for select using (true);

-- User profiles are public
create policy "User profiles are viewable by everyone." on public.users for select using (true);
create policy "Users can update their own profile." on public.users for update using (auth.uid() = id);

-- Reads policies (INSERT/DELETE for self)
create policy "Users can insert their own reads." on public.reads for insert with check (auth.uid() = user_id);
create policy "Users can delete their own reads." on public.reads for delete using (auth.uid() = user_id);

-- SOCIAL TABLES RLS POLICIES

-- User Top Poems & Authors
create policy "Top poems are viewable by everyone" on public.user_top_poems for select using (true);
create policy "Users can manage their top poems" on public.user_top_poems for all using (auth.uid() = user_id);

create policy "Top authors are viewable by everyone" on public.user_top_authors for select using (true);
create policy "Users can manage their top authors" on public.user_top_authors for all using (auth.uid() = user_id);

-- Followers
create policy "Followers are viewable by everyone" on public.followers for select using (true);
create policy "Users can manage their follows" on public.followers for all using (auth.uid() = follower_id);

-- Reviews
create policy "Reviews are viewable by everyone" on public.reviews for select using (true);
create policy "Users can manage their reviews" on public.reviews for all using (auth.uid() = user_id);

create policy "Review likes viewable by everyone" on public.review_likes for select using (true);
create policy "Users can manage their review likes" on public.review_likes for all using (auth.uid() = user_id);

create policy "Review comments viewable by everyone" on public.review_comments for select using (true);
create policy "Users can manage their review comments" on public.review_comments for all using (auth.uid() = user_id);

create policy "Review comment likes viewable by everyone" on public.review_comment_likes for select using (true);
create policy "Users can manage their review comment likes" on public.review_comment_likes for all using (auth.uid() = user_id);

-- Highlights (Conditional SELECT)
create policy "Highlights conditional visibility" on public.highlights for select using (
  is_private = false or auth.uid() = user_id
);
create policy "Users can manage their highlights" on public.highlights for all using (auth.uid() = user_id);

-- Lists (Conditional SELECT)
create policy "Lists conditional visibility" on public.lists for select using (
  is_public = true or auth.uid() = user_id
);
create policy "Users can manage their lists" on public.lists for all using (auth.uid() = user_id);

create policy "List items conditional visibility" on public.list_items for select using (
  exists (
    select 1 from public.lists l 
    where l.id = list_items.list_id and (l.is_public = true or l.user_id = auth.uid())
  )
);
create policy "Users can manage their list items" on public.list_items for all using (
  exists (
    select 1 from public.lists l 
    where l.id = list_items.list_id and l.user_id = auth.uid()
  )
);

create policy "List likes viewable by everyone" on public.list_likes for select using (true);
create policy "Users can manage their list likes" on public.list_likes for all using (auth.uid() = user_id);

-- User Badges (Public view, system manages inserts)
create policy "User badges viewable by everyone" on public.user_badges for select using (true);

-- Notifications (Private)
create policy "Users can view their notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "Users can update their notifications" on public.notifications for update using (auth.uid() = user_id);
create policy "Users can delete their notifications" on public.notifications for delete using (auth.uid() = user_id);

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

-- 7. BACKGROUND JOBS & CRON (pg_cron)
create extension if not exists pg_cron;
create extension if not exists tsm_system_rows;

-- Job 1: Aggregate reads periodically without row locks
create or replace function public.aggregate_reads_count()
returns void as $$
begin
  with unprocessed_reads as (
    select poem_id, count(*) as new_reads
    from public.reads
    where processed = false
    group by poem_id
  ),
  updated_poems as (
    update public.poems p
    set reads_count = p.reads_count + ur.new_reads
    from unprocessed_reads ur
    where p.id = ur.poem_id
    returning p.id
  )
  update public.reads r
  set processed = true
  from unprocessed_reads ur
  where r.poem_id = ur.poem_id and r.processed = false;
end;
$$ language plpgsql security definer;

-- Schedule reads aggregation (every 5 minutes)
select cron.schedule('aggregate-reads', '*/5 * * * *', 'select public.aggregate_reads_count()');

-- Job 2: Generate Daily Poem Fast Selection
create or replace function public.select_daily_poem()
returns void as $$
declare
  random_poem_id uuid;
  today date := current_date;
begin
  select id into random_poem_id
  from public.poems tablesample system_rows(1);

  if random_poem_id is not null then
    insert into public.daily_poems (date, poem_id)
    values (today, random_poem_id)
    on conflict (date) do nothing;
  end if;
end;
$$ language plpgsql security definer;

-- Schedule daily poem generation (every day at midnight)
select cron.schedule('generate-daily-poem', '0 0 * * *', 'select public.select_daily_poem()');
