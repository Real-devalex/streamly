-- ═══════════════════════════════════════════════════════════════
-- Streamly · 004 — Upcoming queue + in-app notifications
-- ═══════════════════════════════════════════════════════════════

-- ── 1. Upcoming status ────────────────────────────────────────
-- Add an 'upcoming' member to the movie/series status enums.
-- Titles in this state are visible in "Coming Soon" but need no download links.
--
-- ⚠️  Postgres cannot use a brand-new enum value in the SAME transaction that
--     creates it (error 55P04 "unsafe use of new value"). This migration only
--     ADDS the value. The read policies that reference 'upcoming' live in
--     005_upcoming_policies.sql — run that file as a SEPARATE execution AFTER
--     this one commits. Do not merge the two back together.
alter type movie_status  add value if not exists 'upcoming' before 'published';
alter type series_status add value if not exists 'upcoming' before 'published';

-- ── 2. Notifications ──────────────────────────────────────────
create table if not exists public.notifications (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  type           text not null check (type in ('new_movie', 'new_series', 'reply', 'reaction', 'mention')),
  title          text not null,
  message        text not null,
  read           boolean not null default false,
  reference_type text,          -- 'movie' | 'series' | 'comment'
  reference_id   text,
  created_at     timestamptz not null default now()
);

create index if not exists notifications_user_idx
  on public.notifications (user_id, created_at desc);
create index if not exists notifications_unread_idx
  on public.notifications (user_id) where read = false;

alter table public.notifications enable row level security;

-- Users read only their own notifications.
drop policy if exists "read own notifications" on public.notifications;
create policy "read own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

-- Admins may fan out notifications to anyone; users may insert their own.
drop policy if exists "admins create notifications" on public.notifications;
create policy "admins create notifications"
  on public.notifications for insert
  with check (public.is_admin() or auth.uid() = user_id);

-- Users mark their own as read.
drop policy if exists "update own notifications" on public.notifications;
create policy "update own notifications"
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Users delete their own.
drop policy if exists "delete own notifications" on public.notifications;
create policy "delete own notifications"
  on public.notifications for delete
  using (auth.uid() = user_id);

-- ── 3. Auto-notify every member on newly published content ────
create or replace function public.notify_users_new_movie()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'published' and (tg_op = 'INSERT' or old.status is distinct from 'published') then
    insert into public.notifications (user_id, type, title, message, reference_type, reference_id)
    select p.id,
           'new_movie',
           '🎬 New Movie: ' || new.title,
           new.title || ' is now available!',
           'movie',
           new.slug
    from public.profiles p;
  end if;
  return new;
end;
$$;

drop trigger if exists movies_notify_new on public.movies;
create trigger movies_notify_new
  after insert or update of status on public.movies
  for each row execute function public.notify_users_new_movie();

create or replace function public.notify_users_new_series()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'published' and (tg_op = 'INSERT' or old.status is distinct from 'published') then
    insert into public.notifications (user_id, type, title, message, reference_type, reference_id)
    select p.id,
           'new_series',
           '📺 New Series: ' || new.title,
           new.title || ' — Season ' || greatest(coalesce(new.total_seasons, 1), 1) || ' is live!',
           'series',
           new.slug
    from public.profiles p;
  end if;
  return new;
end;
$$;

drop trigger if exists series_notify_new on public.series;
create trigger series_notify_new
  after insert or update of status on public.series
  for each row execute function public.notify_users_new_series();
