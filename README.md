# Streamly

A cinematic movie discovery and download platform — React 19 · TypeScript · Vite 8 · Tailwind CSS v4 · Supabase.

> Deep-black surfaces, purple → blue → cyan gradients, glass-morphism chrome, spring-eased
> motion and staggered grid entrances. Built to feel like a premium streaming product.

---

## Stack

| Layer      | Choice                                                    |
| ---------- | --------------------------------------------------------- |
| UI         | React 19 + TypeScript                                      |
| Build      | Vite 8 (`@vitejs/plugin-react`, `@tailwindcss/vite`)       |
| Styling    | Tailwind CSS v4 — **`@theme` tokens in `src/index.css`**   |
| Routing    | React Router DOM v7                                        |
| Icons      | lucide-react                                               |
| Backend    | Supabase (auth, Postgres, RLS) via `@supabase/supabase-js` |
| Font       | Inter                                                      |

There is **no `tailwind.config.js`** — every colour, radius and animation lives in the
`@theme` block of `src/index.css`.

---

## Getting started

```bash
npm install
cp .env.example .env      # optional — see "Demo mode" below
npm run dev               # http://localhost:5173
```

```bash
npm run build             # tsc -b && vite build
npm run preview
npm run typecheck
```

### Environment variables

```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_TMDB_API_KEY=your-tmdb-api-key   # enables admin TMDB auto-fill
VITE_APP_NAME=Streamly
VITE_APP_URL=http://localhost:5173
```

**Demo mode.** If the Supabase variables are missing or still contain the placeholders,
Streamly boots with mock movies, mock comments and mock auth instead of crashing — every
screen stays explorable, and the auth pages say so. Drop real keys into `.env` and the app
switches to live Supabase automatically (no code changes needed).

---

## Routes

```
/                     Home — hero carousel, search, trending, latest, genres, top rated
/movies               Full library with sort + genre filters
/movie/:slug          Details — backdrop, poster, cast, downloads, comments, related
/search               Instant search (deep-linkable via ?q=)
/genres               All twelve collections
/genre/:slug          Movies in a genre
/auth/signin          Standalone — no navbar/footer
/auth/signup          Standalone — no navbar/footer
/auth/reset           Standalone — no navbar/footer
/admin                AdminLayout (sidebar) → Dashboard · Movies · Comments · Reports
```

Auth pages render **outside** `Layout`; admin pages use their own `AdminLayout`.

---

## Project structure

```
public/
  favicon.png                  Streamly icon (dark rounded square)
src/
  assets/logo/                 icon.png · streamly-logo.png (+ .svg variants)
  components/
    layout/                    Layout · Navbar · Footer · AuthShell
    movie/                     MovieCard · MovieGrid
    ui/                        Button · SectionHeader · EmptyState
    download/                  DownloadModal · QualitySelector
    community/                 CommentSection
  context/                     AuthContext · DownloadContext
  data/                        mock-movies.ts · mock-community.ts
  lib/supabase.ts              createClient + demo-mode detection
  pages/                       Home · Movies · MovieDetails · Search · Genres · GenrePage
                               NotFound · auth/* · admin/*
  types/index.ts               Movie, Genre, CastMember, Comment, Reaction, Report, …
  utils/helpers.ts             formatFileSize · formatRuntime · slugify · timeAgo · …
  index.css                    Tailwind v4 theme + custom utilities
supabase/migrations/
  001_initial_schema.sql       Full schema, triggers, RLS policies, genre seed
```

### Custom CSS utilities

`gradient-text` · `glass` · `glass-strong` · `hover-lift` · `btn-primary` · `btn-secondary`
`premium-card` · `premium-card-hover` · `stagger-children` · `scrollbar-hide`
`hero-gradient-bottom` · `hero-gradient-left` · `film-grain` · `skeleton` · `gradient-rule`
`aurora` · `mask-fade-r`

### Theme tokens

Surfaces `streamly-black · dark · card · surface · border · border-light`
Accents `streamly-purple · indigo · blue · cyan`
Text `streamly-text · text-secondary · text-muted`
Semantic `streamly-success · warning · error · gold`
Radii `rounded-card · rounded-button · rounded-modal`

---

## Database

`supabase/migrations/001_initial_schema.sql` creates `profiles`, `genres`, `movies`,
`movie_genres`, `cast_members`, `movie_cast`, `download_links`, `comments`, `reactions`,
`reports`, `notifications` — with:

- RLS on every table
- Published movies public; drafts visible to admins only
- Users may only write their own comments, reactions and reports
- `is_admin()` helper (`exists (select 1 from profiles where id = auth.uid() and role = 'admin')`)
- Trigger that auto-creates a profile row on `auth.users` insert
- Reply / reaction notification triggers

Apply it with `supabase db push`, or paste it into the SQL editor.

**Migration run order.** `004_notifications_and_upcoming.sql` adds an `upcoming`
value to the `movie_status` / `series_status` enums. Postgres cannot reference a
new enum value inside the same transaction that creates it (error `55P04`), so the
read policies that expose upcoming titles live in a separate file:

1. Run `004_notifications_and_upcoming.sql` — wait for it to succeed.
2. Then run `005_upcoming_policies.sql` as a **separate** execution.

---

## Deployment (Vercel)

The app is a single-page client (`npm run build` → `dist/`). Hosting is configured
in [`vercel.json`](vercel.json), which:

- runs `npm run build` and serves the `dist` output directory;
- rewrites every route to `/index.html` so client-side deep links
  (e.g. `/series/:slug`, `/admin`) never 404 on a hard refresh.

Set these environment variables in **Vercel → Project → Settings → Environment
Variables**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_TMDB_API_KEY`.

> ⚠️ **Production builds from `main`.** Merge work into `main` for the production
> deployment to update — committing to a feature branch alone will not change the
> live site.

---

## Behaviour notes

- Navbar fades from transparent to blurred glass on scroll, with a gradient scroll-progress hairline
- Mobile navigation slides in from the right
- Scroll resets to top on navigation (and smooth-scrolls to `#comments` deep links)
- Download modal gates guests behind sign-in and offers a quality picker (1080p/720p/480p) to members
- Comments support spoiler blur-to-reveal, six reactions (❤️ 😂 🔥 😮 😢 🤯), threaded replies and reporting
