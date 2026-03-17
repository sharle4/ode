-- 1. Create the new one-to-one rothko_params table
create table public.rothko_params (
    poem_id uuid primary key references public.poems(id) on delete cascade not null,
    seed bigint not null,
    palette_id text not null,
    shape_type text not null,
    layout_bias text not null,
    complexity int not null,
    texture_profile text not null,
    blend_mode text not null,
    density text not null,
    opacity_style text not null,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

-- 2. Add RLS Policies
alter table public.rothko_params enable row level security;
create policy "Rothko params are viewable by everyone." on public.rothko_params for select using (true);
create policy "Admins can manage rothko params" on public.rothko_params for all using ( (select auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true );

-- 3. Trigger for updated_at
create trigger set_updated_at_rothko_params before update on public.rothko_params for each row execute procedure handle_updated_at();

-- 4. Indexes for performance
create index idx_rothko_palette on public.rothko_params(palette_id);

-- 5. If the column existed in the poems table previously, drop it (Assuming migration from old jsonb state)
alter table public.poems drop column if exists rothko_params;
