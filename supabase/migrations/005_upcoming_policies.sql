-- ═══════════════════════════════════════════════════════════════
-- Streamly · 005 — Upcoming read policies
-- ═══════════════════════════════════════════════════════════════
--
-- RUN THIS FILE SEPARATELY, AFTER 004_notifications_and_upcoming.sql HAS
-- COMMITTED SUCCESSFULLY.
--
-- The 'upcoming' enum value is created by migration 004. Postgres forbids
-- referencing a new enum value inside the same transaction that added it
-- (error 55P04: "unsafe use of new value"), so the public read policies that
-- expose upcoming titles live here. These policies make 'upcoming' movies and
-- series visible to anonymous/public viewers in the "Coming Soon" rail.
--
-- Safe to re-run: policies are dropped before being recreated.

-- Public read policies must also expose upcoming titles.
drop policy if exists "movies are publicly readable" on public.movies;
create policy "movies are publicly readable"
  on public.movies for select
  using (status in ('published', 'upcoming') or public.is_admin());

drop policy if exists "series are publicly readable" on public.series;
create policy "series are publicly readable"
  on public.series for select
  using (status in ('published', 'upcoming') or public.is_admin());
