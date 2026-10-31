# Lianyi Wang Curatorial Website

A lightweight static curatorial archive for Lianyi Wang.

## Edit Content

- Project records live in `src/content/projects.json`.
- Site profile, bio, CV, contact, and writing entries live in `src/content/site.json`.
- Styles live in `src/styles/site.css`.

Run:

```sh
npm run build
```

The static site is generated into `dist/` and deployed automatically with GitHub Pages.

## GitHub Pages

Every push to `main` runs the deployment workflow in `.github/workflows/deploy-pages.yml`:

- Build command: `npm run build`
- Published directory: `dist`
- Node version: 22

No backend, CMS, database, or server runtime is required.
