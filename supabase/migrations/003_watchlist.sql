/* ═══════════════════════════════════════════════════════════════
   003 — Watchlist / Favorites
   ═══════════════════════════════════════════════════════════════ */

CREATE TABLE IF NOT EXISTS public.watchlist (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id   uuid NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, movie_id)
);

ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

-- Users can read their own watchlist
CREATE POLICY "watchlist_select_own"
  ON public.watchlist FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert into their own watchlist
CREATE POLICY "watchlist_insert_own"
  ON public.watchlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete from their own watchlist
CREATE POLICY "watchlist_delete_own"
  ON public.watchlist FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_watchlist_user ON public.watchlist(user_id);
CREATE INDEX idx_watchlist_movie ON public.watchlist(movie_id);
