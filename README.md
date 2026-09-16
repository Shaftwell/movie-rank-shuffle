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

Pushes to `main` build and publish GitHub Pages via `.github/workflows/deploy-pages.yml`.

If the Pages site 404s after the first workflow run, enable Pages once:

1. Open https://github.com/Shaftwell/movie-rank-shuffle/settings/pages
2. Under **Build and deployment → Source**, choose **GitHub Actions**
3. Re-run the **Deploy to GitHub Pages** workflow if needed

## Stack

Vite, TypeScript, React, shadcn/ui, Tailwind CSS, TMDB API.

Movie data is stored in the browser (`localStorage`). There is no backend.
