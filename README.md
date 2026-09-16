# Movie Rank Shuffle

Personal Top 100 movie rankings with TMDB posters, drag-and-drop order, search, filters, and shareable ranking tokens.

## Live sites

- **Lovable (live now):** https://movie-rank-shuffle.lovable.app/
- **GitHub Pages:** https://shaftwell.github.io/movie-rank-shuffle/
- **Source:** https://github.com/Shaftwell/movie-rank-shuffle

GitHub Pages needs a one-time switch in repo settings (see Deploy below). The `gh-pages` branch is already published by Actions.

## Run locally

Requires Node.js 18+ and npm.

```sh
git clone https://github.com/Shaftwell/movie-rank-shuffle.git
cd movie-rank-shuffle
cp .env.example .env
# set VITE_TMDB_API_KEY in .env (optional; a fallback key is currently in source)
npm i
npm run dev
```

The Vite dev server listens on http://localhost:8080.

```sh
npm run build    # production build to dist/
npm run preview  # serve the production build locally
```

## Deploy

Pushes to `main` build the site and update the `gh-pages` branch
(`.github/workflows/deploy-pages.yml`).

Enable the public Pages URL once:

1. Open https://github.com/Shaftwell/movie-rank-shuffle/settings/pages
2. Under **Build and deployment → Source**, choose **Deploy from a branch**
3. Branch: **gh-pages**, folder: **/ (root)**
4. Save

The site will be at https://shaftwell.github.io/movie-rank-shuffle/ a minute later.

## Stack

Vite, TypeScript, React, shadcn/ui, Tailwind CSS, TMDB API.

Movie data is stored in the browser (`localStorage`). There is no backend.
