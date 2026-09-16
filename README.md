# Movie Rank Shuffle

Personal Top 100 movie rankings with TMDB posters, drag-and-drop order, search, filters, and shareable ranking tokens.

**Live app:** https://shaftwell.github.io/movie-rank-shuffle/

**Source:** https://github.com/Shaftwell/movie-rank-shuffle

This repo is the source of truth. Changes land on `main` and GitHub Actions publishes GitHub Pages.

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

Dev server: http://localhost:8080

## Deploy

Push to `main`. The workflow builds and updates the `gh-pages` branch.

GitHub Pages needs the Actions secret `VITE_TMDB_API_KEY`:

https://github.com/Shaftwell/movie-rank-shuffle/settings/secrets/actions

Restrict that TMDB key to `https://shaftwell.github.io/*` and `http://localhost:8080/*`.

## Stack

Vite, TypeScript, React, shadcn/ui, Tailwind CSS, TMDB API, `@hello-pangea/dnd`.

Movie data lives in the browser (`localStorage`). There is no backend.
