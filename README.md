# Movie Rank Shuffle

Personal Top 100 movie rankings with TMDB posters, drag-and-drop order, search, filters, and shareable ranking tokens.

## Live sites

- **GitHub Pages:** https://shaftwell.github.io/movie-rank-shuffle/
- **Lovable:** https://movie-rank-shuffle.lovable.app/
- **Source:** https://github.com/Shaftwell/movie-rank-shuffle

## Run locally

Requires Node.js 18+ and npm.

```sh
git clone https://github.com/Shaftwell/movie-rank-shuffle.git
cd movie-rank-shuffle
cp .env.example .env
# set VITE_TMDB_API_KEY in .env
npm i
npm run dev
```

The Vite dev server listens on http://localhost:8080.

## Deploy

Pushes to `main` build the site and update the `gh-pages` branch.

For TMDB search/posters on GitHub Pages, add a repository secret:

1. Open https://github.com/Shaftwell/movie-rank-shuffle/settings/secrets/actions
2. New repository secret named `VITE_TMDB_API_KEY`
3. Paste your TMDB v3 API key
4. Re-run **Deploy to GitHub Pages** if the last build had an empty key

Restrict that key to `https://shaftwell.github.io/*` and `http://localhost:8080/*` in the TMDB dashboard.

## Stack

Vite, TypeScript, React, shadcn/ui, Tailwind CSS, TMDB API, `@hello-pangea/dnd`.

Movie data is stored in the browser (`localStorage`). There is no backend.
