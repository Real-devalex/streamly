-- ═══════════════════════════════════════════════════════════════
--  STREAMLY · TV SERIES SUPPORT
--  Adds: series, series_genres, seasons, episodes, series_cast
-- ═══════════════════════════════════════════════════════════════

-- ── Enums ──────────────────────────────────────────────────────
do $$ begin
  create type series_status as enum ('draft', 'published', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type episode_status as enum ('draft', 'published');
exception when duplicate_object then null; end $$;

-- ── series ─────────────────────────────────────────────────────
create table if not exists public.series (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  slug              text not null unique,
  description       text,
  poster_url        text,
  backdrop_url      text,
  trailer_url       text,
  release_year      int check (release_year between 1888 and 2100),
  status            series_status not null default 'draft',
  featured          boolean not null default false,
  rating            numeric(3,1) not null default 0 check (rating between 0 and 10),
  total_seasons     int not null default 0,
  total_episodes    int not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists series_slug_idx      on public.series (slug);
create index if not exists series_status_idx    on public.series (status);
create index if not exists series_featured_idx  on public.series (featured) where featured;
create index if not exists series_rating_idx    on public.series (rating desc);
create index if not exists series_created_idx   on public.series (created_at desc);

-- ── series_genres (join) ──────────────────────────────────────
create table if not exists public.series_genres (
  series_id  uuid not null references public.series(id) on delete cascade,
  genre_id   uuid not null references public.genres(id) on delete cascade,
  primary key (series_id, genre_id)
);

create index if not exists series_genres_genre_idx on public.series_genres (genre_id);

-- ── series_cast (join + character) ────────────────────────────
create table if not exists public.series_cast (
  series_id       uuid not null references public.series(id) on delete cascade,
  cast_member_id  uuid not null references public.cast_members(id) on delete cascade,
  character_name  text,
  billing_order   int not null default 0,
  primary key (series_id, cast_member_id)
);

create index if not exists series_cast_cast_idx on public.series_cast (cast_member_id);

-- ── seasons ────────────────────────────────────────────────────
create table if not exists public.seasons (
  id                uuid primary key default gen_random_uuid(),
  series_id         uuid not null references public.series(id) on delete cascade,
  season_number     int not null check (season_number > 0),
  title             text,
  description       text,
  poster_url        text,
  episode_count     int not null default 0,
  release_year      int,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (series_id, season_number)
);

create index if not exists seasons_series_idx on public.seasons (series_id, season_number);

-- ── episodes ───────────────────────────────────────────────────
create table if not exists public.episodes (
  id                uuid primary key default gen_random_uuid(),
  season_id         uuid not null references public.seasons(id) on delete cascade,
  episode_number    int not null check (episode_number > 0),
  title             text not null,
  description       text,
  still_url         text,
  runtime_minutes   int check (runtime_minutes > 0),
  air_date          date,
  status            episode_status not null default 'draft',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (season_id, episode_number)
);

create index if not exists episodes_season_idx  on public.episodes (season_id, episode_number);

-- ── episode_download_links ────────────────────────────────────
create table if not exists public.episode_download_links (
  id                 uuid primary key default gen_random_uuid(),
  episode_id         uuid not null references public.episodes(id) on delete cascade,
  quality            quality_type not null,
  url                text not null,
  file_size_bytes    bigint check (file_size_bytes > 0),
  destination_label  text not null default 'Streamly CDN',
  created_at         timestamptz not null default now(),
  unique (episode_id, quality)
);

create index if not exists ep_download_episode_idx on public.episode_download_links (episode_id);

-- ═══════════════════════════════════════════════════════════════
--  TRIGGERS
-- ═══════════════════════════════════════════════════════════════

drop trigger if exists series_set_updated_at on public.series;
create trigger series_set_updated_at before update on public.series
  for each row execute function public.set_updated_at();

drop trigger if exists seasons_set_updated_at on public.seasons;
create trigger seasons_set_updated_at before update on public.seasons
  for each row execute function public.set_updated_at();

drop trigger if exists episodes_set_updated_at on public.episodes;
create trigger episodes_set_updated_at before update on public.episodes
  for each row execute function public.set_updated_at();

-- ═══════════════════════════════════════════════════════════════
--  ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════

alter table public.series                  enable row level security;
alter table public.series_genres           enable row level security;
alter table public.series_cast             enable row level security;
alter table public.seasons                 enable row level security;
alter table public.episodes                enable row level security;
alter table public.episode_download_links  enable row level security;

-- ── series ─────────────────────────────────────────────────────
drop policy if exists "Published series are public" on public.series;
create policy "Published series are public"
  on public.series for select
  using (status = 'published' or public.is_admin());

drop policy if exists "Admins manage series" on public.series;
create policy "Admins manage series"
  on public.series for all
  using (public.is_admin())
  with check (public.is_admin());

-- ── series_genres ──────────────────────────────────────────────
drop policy if exists "Series genres are public" on public.series_genres;
create policy "Series genres are public" on public.series_genres for select using (true);

drop policy if exists "Admins manage series genres" on public.series_genres;
create policy "Admins manage series genres" on public.series_genres
  for all using (public.is_admin()) with check (public.is_admin());

-- ── series_cast ────────────────────────────────────────────────
drop policy if exists "Series cast is public" on public.series_cast;
create policy "Series cast is public" on public.series_cast for select using (true);

drop policy if exists "Admins manage series cast" on public.series_cast;
create policy "Admins manage series cast" on public.series_cast
  for all using (public.is_admin()) with check (public.is_admin());

-- ── seasons ────────────────────────────────────────────────────
drop policy if exists "Seasons follow series visibility" on public.seasons;
create policy "Seasons follow series visibility"
  on public.seasons for select
  using (
    exists (
      select 1 from public.series s
      where s.id = seasons.series_id
        and (s.status = 'published' or public.is_admin())
    )
  );

drop policy if exists "Admins manage seasons" on public.seasons;
create policy "Admins manage seasons"
  on public.seasons for all
  using (public.is_admin()) with check (public.is_admin());

-- ── episodes ───────────────────────────────────────────────────
drop policy if exists "Episodes follow series visibility" on public.episodes;
create policy "Episodes follow series visibility"
  on public.episodes for select
  using (
    exists (
      select 1 from public.seasons sea
      join public.series s on s.id = sea.series_id
      where sea.id = episodes.season_id
        and (s.status = 'published' or public.is_admin())
    )
  );

drop policy if exists "Admins manage episodes" on public.episodes;
create policy "Admins manage episodes"
  on public.episodes for all
  using (public.is_admin()) with check (public.is_admin());

-- ── episode download links ────────────────────────────────────
drop policy if exists "Episode downloads follow series visibility" on public.episode_download_links;
create policy "Episode downloads follow series visibility"
  on public.episode_download_links for select
  using (
    exists (
      select 1 from public.episodes ep
      join public.seasons sea on sea.id = ep.season_id
      join public.series s on s.id = sea.series_id
      where ep.id = episode_download_links.episode_id
        and (s.status = 'published' or public.is_admin())
    )
  );

drop policy if exists "Admins manage episode downloads" on public.episode_download_links;
create policy "Admins manage episode downloads"
  on public.episode_download_links for all
  using (public.is_admin()) with check (public.is_admin());
