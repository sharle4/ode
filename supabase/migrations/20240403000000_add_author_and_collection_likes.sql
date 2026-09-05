-- 20240403000000_add_author_and_collection_likes.sql
-- Add support for liking authors and collections, and maintain likes_count on poems, collections, and authors.

-- 1. Create table public.author_likes
create table if not exists public.author_likes (
    user_id uuid references public.users(id) on delete cascade not null,
    author_id uuid references public.authors(id) on delete cascade not null,
    created_at timestamptz default now() not null,
    primary key (user_id, author_id)
);

create index if not exists idx_author_likes_author_id on public.author_likes(author_id);
create index if not exists idx_author_likes_user_created on public.author_likes(user_id, created_at desc);

alter table public.author_likes enable row level security;

create policy "Author likes are viewable by everyone"
    on public.author_likes for select
    using (true);

create policy "Users can manage their own author likes"
    on public.author_likes for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);


-- 2. Create table public.collection_likes
create table if not exists public.collection_likes (
    user_id uuid references public.users(id) on delete cascade not null,
    collection_id uuid references public.collections(id) on delete cascade not null,
    created_at timestamptz default now() not null,
    primary key (user_id, collection_id)
);

create index if not exists idx_collection_likes_collection_id on public.collection_likes(collection_id);
create index if not exists idx_collection_likes_user_created on public.collection_likes(user_id, created_at desc);

alter table public.collection_likes enable row level security;

create policy "Collection likes are viewable by everyone"
    on public.collection_likes for select
    using (true);

create policy "Users can manage their own collection likes"
    on public.collection_likes for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);


-- 3. Composite index on poem_likes for fast user profile retrieval
create index if not exists idx_poem_likes_user_created on public.poem_likes(user_id, created_at desc);


-- 4. Add likes_count column to core entities
alter table public.poems add column if not exists likes_count int default 0 not null;
alter table public.collections add column if not exists likes_count int default 0 not null;
alter table public.authors add column if not exists likes_count int default 0 not null;


-- 5. Triggers for maintaining likes_count atomically

-- Poems likes_count trigger
create or replace function public.handle_poem_likes_count()
returns trigger as $$
begin
    if (tg_op = 'INSERT') then
        update public.poems
        set likes_count = likes_count + 1
        where id = new.poem_id;
        return new;
    elsif (tg_op = 'DELETE') then
        update public.poems
        set likes_count = greatest(0, likes_count - 1)
        where id = old.poem_id;
        return old;
    end if;
    return null;
end;
$$ language plpgsql security definer;

drop trigger if exists on_poem_like_change on public.poem_likes;
create trigger on_poem_like_change
    after insert or delete on public.poem_likes
    for each row execute procedure public.handle_poem_likes_count();


-- Collections likes_count trigger
create or replace function public.handle_collection_likes_count()
returns trigger as $$
begin
    if (tg_op = 'INSERT') then
        update public.collections
        set likes_count = likes_count + 1
        where id = new.collection_id;
        return new;
    elsif (tg_op = 'DELETE') then
        update public.collections
        set likes_count = greatest(0, likes_count - 1)
        where id = old.collection_id;
        return old;
    end if;
    return null;
end;
$$ language plpgsql security definer;

drop trigger if exists on_collection_like_change on public.collection_likes;
create trigger on_collection_like_change
    after insert or delete on public.collection_likes
    for each row execute procedure public.handle_collection_likes_count();


-- Authors likes_count trigger
create or replace function public.handle_author_likes_count()
returns trigger as $$
begin
    if (tg_op = 'INSERT') then
        update public.authors
        set likes_count = likes_count + 1
        where id = new.author_id;
        return new;
    elsif (tg_op = 'DELETE') then
        update public.authors
        set likes_count = greatest(0, likes_count - 1)
        where id = old.author_id;
        return old;
    end if;
    return null;
end;
$$ language plpgsql security definer;

drop trigger if exists on_author_like_change on public.author_likes;
create trigger on_author_like_change
    after insert or delete on public.author_likes
    for each row execute procedure public.handle_author_likes_count();


-- 6. Initial count sync
update public.poems p
set likes_count = (select count(*) from public.poem_likes pl where pl.poem_id = p.id);

update public.collections c
set likes_count = (select count(*) from public.collection_likes cl where cl.collection_id = c.id);

update public.authors a
set likes_count = (select count(*) from public.author_likes al where al.author_id = a.id);
