-- ═══════════════════════════════════════════════════════════════
--  STREAMLY · INITIAL SCHEMA
--  PostgreSQL (Supabase) · Row Level Security enabled everywhere
--  Run: supabase db push  (or paste into the SQL editor)
-- ═══════════════════════════════════════════════════════════════

-- ── Extensions ─────────────────────────────────────────────────
create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- ── Enums ──────────────────────────────────────────────────────
do $$ begin
  create type user_role        as enum ('user', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type movie_status     as enum ('draft', 'published', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type comment_status   as enum ('active', 'hidden', 'deleted');
exception when duplicate_object then null; end $$;

do $$ begin
  create type quality_type     as enum ('1080p', '720p', '480p');
exception when duplicate_object then null; end $$;

do $$ begin
  create type reaction_type    as enum ('love', 'funny', 'fire', 'wow', 'sad', 'mindblown');
exception when duplicate_object then null; end $$;

do $$ begin
  create type report_reason    as enum ('spam', 'harassment', 'abuse', 'spoiler', 'other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type report_status    as enum ('pending', 'reviewed', 'resolved');
exception when duplicate_object then null; end $$;

do $$ begin
  create type report_target    as enum ('comment', 'user');
exception when duplicate_object then null; end $$;

do $$ begin
  create type notification_type as enum ('reaction', 'reply', 'mention');
exception when duplicate_object then null; end $$;

-- ── Helper: is the current user an admin? ──────────────────────
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ── Helper: touch updated_at ───────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ═══════════════════════════════════════════════════════════════
--  TABLES
-- ═══════════════════════════════════════════════════════════════

-- profiles ──────────────────────────────────────────────────────
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  username      citext not null unique check (char_length(username) between 3 and 32),
  display_name  text,
  avatar_url    text,
  bio           text check (char_length(bio) <= 280),
  role          user_role not null default 'user',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists profiles_username_idx on public.profiles (username);
create index if not exists profiles_role_idx     on public.profiles (role);

-- genres ────────────────────────────────────────────────────────
create table if not exists public.genres (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  slug        text not null unique,
  icon        text,
  color       text,
  created_at  timestamptz not null default now()
);

create index if not exists genres_slug_idx on public.genres (slug);

-- movies ────────────────────────────────────────────────────────
create table if not exists public.movies (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  slug              text not null unique,
  description       text,
  poster_url        text,
  backdrop_url      text,
  trailer_url       text,
  release_year      int check (release_year between 1888 and 2100),
  runtime_minutes   int check (runtime_minutes > 0),
  rating            numeric(3,1) not null default 0 check (rating between 0 and 10),
  status            movie_status not null default 'draft',
  featured          boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists movies_slug_idx      on public.movies (slug);
create index if not exists movies_status_idx    on public.movies (status);
create index if not exists movies_featured_idx  on public.movies (featured) where featured;
create index if not exists movies_rating_idx    on public.movies (rating desc);
create index if not exists movies_created_idx   on public.movies (created_at desc);

-- movie_genres (join) ───────────────────────────────────────────
create table if not exists public.movie_genres (
  movie_id  uuid not null references public.movies(id) on delete cascade,
  genre_id  uuid not null references public.genres(id) on delete cascade,
  primary key (movie_id, genre_id)
);

create index if not exists movie_genres_genre_idx on public.movie_genres (genre_id);

-- cast_members ──────────────────────────────────────────────────
create table if not exists public.cast_members (
  id        uuid primary key default gen_random_uuid(),
  name      text not null,
  photo_url text,
  created_at timestamptz not null default now()
);

create index if not exists cast_members_name_idx on public.cast_members (name);

-- movie_cast (join + character) ──────────────────────────────────
create table if not exists public.movie_cast (
  movie_id        uuid not null references public.movies(id) on delete cascade,
  cast_member_id  uuid not null references public.cast_members(id) on delete cascade,
  character_name  text,
  billing_order   int not null default 0,
  primary key (movie_id, cast_member_id)
);

create index if not exists movie_cast_cast_idx on public.movie_cast (cast_member_id);

-- download_links ────────────────────────────────────────────────
create table if not exists public.download_links (
  id                 uuid primary key default gen_random_uuid(),
  movie_id           uuid not null references public.movies(id) on delete cascade,
  quality            quality_type not null,
  url                text not null,
  file_size_bytes    bigint check (file_size_bytes > 0),
  destination_label  text not null default 'Streamly CDN',
  created_at         timestamptz not null default now(),
  unique (movie_id, quality)
);

create index if not exists download_links_movie_idx on public.download_links (movie_id);

-- comments ──────────────────────────────────────────────────────
create table if not exists public.comments (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  movie_id    uuid not null references public.movies(id) on delete cascade,
  parent_id   uuid references public.comments(id) on delete cascade,
  content     text not null check (char_length(content) between 1 and 1000),
  is_spoiler  boolean not null default false,
  status      comment_status not null default 'active',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists comments_movie_idx  on public.comments (movie_id, created_at desc);
create index if not exists comments_user_idx   on public.comments (user_id);
create index if not exists comments_parent_idx on public.comments (parent_id);
create index if not exists comments_status_idx on public.comments (status);

-- reactions ─────────────────────────────────────────────────────
create table if not exists public.reactions (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  comment_id     uuid references public.comments(id) on delete cascade,
  movie_id       uuid references public.movies(id) on delete cascade,
  reaction_type  reaction_type not null,
  created_at     timestamptz not null default now(),
  constraint reactions_has_target check (
    (comment_id is not null and movie_id is null) or
    (comment_id is null and movie_id is not null)
  )
);

create unique index if not exists reactions_comment_unique
  on public.reactions (user_id, comment_id, reaction_type) where comment_id is not null;
create unique index if not exists reactions_movie_unique
  on public.reactions (user_id, movie_id, reaction_type) where movie_id is not null;
create index if not exists reactions_comment_idx on public.reactions (comment_id);

-- reports ───────────────────────────────────────────────────────
create table if not exists public.reports (
  id           uuid primary key default gen_random_uuid(),
  reporter_id  uuid not null references public.profiles(id) on delete cascade,
  target_type  report_target not null,
  target_id    uuid not null,
  reason       report_reason not null,
  details      text check (char_length(details) <= 1000),
  status       report_status not null default 'pending',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists reports_status_idx on public.reports (status, created_at desc);
create index if not exists reports_target_idx on public.reports (target_type, target_id);

-- notifications ─────────────────────────────────────────────────
create table if not exists public.notifications (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  type            notification_type not null,
  title           text not null,
  message         text not null,
  read            boolean not null default false,
  reference_type  text,
  reference_id    uuid,
  created_at      timestamptz not null default now()
);

create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);

-- ═══════════════════════════════════════════════════════════════
--  TRIGGERS
-- ═══════════════════════════════════════════════════════════════

-- 1. Auto-create a profile row whenever a new auth user signs up ──
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url, role)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'username',
      split_part(new.email, '@', 1),
      'member-' || substr(new.id::text, 1, 8)
    ),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    'user'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. updated_at triggers ───────────────────────────────────────
drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists movies_set_updated_at on public.movies;
create trigger movies_set_updated_at before update on public.movies
  for each row execute function public.set_updated_at();

drop trigger if exists comments_set_updated_at on public.comments;
create trigger comments_set_updated_at before update on public.comments
  for each row execute function public.set_updated_at();

drop trigger if exists reports_set_updated_at on public.reports;
create trigger reports_set_updated_at before update on public.reports
  for each row execute function public.set_updated_at();

-- 3. Notify a comment author when someone replies ───────────────
create or replace function public.notify_on_reply()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  parent_author uuid;
begin
  if new.parent_id is null then
    return new;
  end if;

  select user_id into parent_author
  from public.comments
  where id = new.parent_id;

  if parent_author is not null and parent_author <> new.user_id then
    insert into public.notifications (user_id, type, title, message, reference_type, reference_id)
    values (parent_author, 'reply', 'Someone replied to you',
            left(new.content, 120), 'comment', new.id);
  end if;

  return new;
end;
$$;

drop trigger if exists comments_notify_reply on public.comments;
create trigger comments_notify_reply
  after insert on public.comments
  for each row execute function public.notify_on_reply();

-- 4. Notify a comment author when someone reacts ────────────────
create or replace function public.notify_on_reaction()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  comment_author uuid;
begin
  if new.comment_id is null then
    return new;
  end if;

  select user_id into comment_author
  from public.comments
  where id = new.comment_id;

  if comment_author is not null and comment_author <> new.user_id then
    insert into public.notifications (user_id, type, title, message, reference_type, reference_id)
    values (comment_author, 'reaction', 'New reaction on your comment',
            'Someone reacted with ' || new.reaction_type::text, 'comment', new.comment_id);
  end if;

  return new;
end;
$$;

drop trigger if exists reactions_notify on public.reactions;
create trigger reactions_notify
  after insert on public.reactions
  for each row execute function public.notify_on_reaction();

-- ═══════════════════════════════════════════════════════════════
--  ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════

alter table public.profiles       enable row level security;
alter table public.genres        enable row level security;
alter table public.movies        enable row level security;
alter table public.movie_genres  enable row level security;
alter table public.cast_members  enable row level security;
alter table public.movie_cast    enable row level security;
alter table public.download_links enable row level security;
alter table public.comments      enable row level security;
alter table public.reactions     enable row level security;
alter table public.reports       enable row level security;
alter table public.notifications enable row level security;

-- ── profiles ───────────────────────────────────────────────────
drop policy if exists "Profiles are public" on public.profiles;
create policy "Profiles are public"
  on public.profiles for select
  using (true);

drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Admins update any profile" on public.profiles;
create policy "Admins update any profile"
  on public.profiles for update
  using (public.is_admin());

-- ── genres / cast / joins: public read, admin write ─────────────
drop policy if exists "Genres are public" on public.genres;
create policy "Genres are public" on public.genres for select using (true);

drop policy if exists "Admins manage genres" on public.genres;
create policy "Admins manage genres" on public.genres for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Cast is public" on public.cast_members;
create policy "Cast is public" on public.cast_members for select using (true);

drop policy if exists "Admins manage cast" on public.cast_members;
create policy "Admins manage cast" on public.cast_members for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Movie genres are public" on public.movie_genres;
create policy "Movie genres are public" on public.movie_genres for select using (true);

drop policy if exists "Admins manage movie genres" on public.movie_genres;
create policy "Admins manage movie genres" on public.movie_genres for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Movie cast is public" on public.movie_cast;
create policy "Movie cast is public" on public.movie_cast for select using (true);

drop policy if exists "Admins manage movie cast" on public.movie_cast;
create policy "Admins manage movie cast" on public.movie_cast for all using (public.is_admin()) with check (public.is_admin());

-- ── movies: published visible to all, drafts admin-only ────────
drop policy if exists "Published movies are public" on public.movies;
create policy "Published movies are public"
  on public.movies for select
  using (status = 'published' or public.is_admin());

drop policy if exists "Admins manage movies" on public.movies;
create policy "Admins manage movies"
  on public.movies for all
  using (public.is_admin())
  with check (public.is_admin());

-- ── download links: visible with a published movie ─────────────
drop policy if exists "Download links follow movie visibility" on public.download_links;
create policy "Download links follow movie visibility"
  on public.download_links for select
  using (
    exists (
      select 1 from public.movies m
      where m.id = download_links.movie_id
        and (m.status = 'published' or public.is_admin())
    )
  );

drop policy if exists "Admins manage download links" on public.download_links;
create policy "Admins manage download links"
  on public.download_links for all
  using (public.is_admin())
  with check (public.is_admin());

-- ── comments ───────────────────────────────────────────────────
drop policy if exists "Active comments are public" on public.comments;
create policy "Active comments are public"
  on public.comments for select
  using (status = 'active' or auth.uid() = user_id or public.is_admin());

drop policy if exists "Users insert own comments" on public.comments;
create policy "Users insert own comments"
  on public.comments for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users update own comments" on public.comments;
create policy "Users update own comments"
  on public.comments for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users delete own comments" on public.comments;
create policy "Users delete own comments"
  on public.comments for delete
  using (auth.uid() = user_id);

drop policy if exists "Admins moderate comments" on public.comments;
create policy "Admins moderate comments"
  on public.comments for all
  using (public.is_admin())
  with check (public.is_admin());

-- ── reactions ──────────────────────────────────────────────────
drop policy if exists "Reactions are public" on public.reactions;
create policy "Reactions are public" on public.reactions for select using (true);

drop policy if exists "Users insert own reactions" on public.reactions;
create policy "Users insert own reactions"
  on public.reactions for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users delete own reactions" on public.reactions;
create policy "Users delete own reactions"
  on public.reactions for delete
  using (auth.uid() = user_id);

drop policy if exists "Admins manage reactions" on public.reactions;
create policy "Admins manage reactions"
  on public.reactions for all
  using (public.is_admin())
  with check (public.is_admin());

-- ── reports ────────────────────────────────────────────────────
drop policy if exists "Users see own reports" on public.reports;
create policy "Users see own reports"
  on public.reports for select
  using (auth.uid() = reporter_id or public.is_admin());

drop policy if exists "Users file reports" on public.reports;
create policy "Users file reports"
  on public.reports for insert
  with check (auth.uid() = reporter_id);

drop policy if exists "Admins manage reports" on public.reports;
create policy "Admins manage reports"
  on public.reports for all
  using (public.is_admin())
  with check (public.is_admin());

-- ── notifications ──────────────────────────────────────────────
drop policy if exists "Users see own notifications" on public.notifications;
create policy "Users see own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

drop policy if exists "Users update own notifications" on public.notifications;
create policy "Users update own notifications"
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "System inserts notifications" on public.notifications;
create policy "System inserts notifications"
  on public.notifications for insert
  with check (true);

-- ═══════════════════════════════════════════════════════════════
--  SEED — the twelve genres the UI ships with
-- ═══════════════════════════════════════════════════════════════
insert into public.genres (name, slug, icon, color) values
  ('Action',    'action',    '💥', '#f97316'),
  ('Adventure', 'adventure', '🧭', '#22c55e'),
  ('Sci-Fi',    'sci-fi',    '🚀', '#22d3ee'),
  ('Thriller',  'thriller',  '🔪', '#ef4444'),
  ('Drama',     'drama',     '🎭', '#a855f7'),
  ('Comedy',    'comedy',    '😂', '#fbbf24'),
  ('Horror',    'horror',    '👻', '#7c3aed'),
  ('Romance',   'romance',   '💖', '#f472b6'),
  ('Animation', 'animation', '🎨', '#38bdf8'),
  ('Crime',     'crime',     '🕵️', '#64748b'),
  ('Mystery',   'mystery',   '🔍', '#14b8a6'),
  ('Fantasy',   'fantasy',   '🪄', '#8b5cf6')
on conflict (slug) do nothing;
