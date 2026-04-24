# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (http://localhost:5173)
npm run build     # tsc -b && vite build
npm run lint      # ESLint with max-warnings 0
npm run preview   # Preview production build locally
```

There is no test suite. Deploys automatically to GitHub Pages on push to `main` via `.github/workflows/deploy.yml`.

## Architecture

Personal technical blog — React 19 + TypeScript + Vite, client-side only, deployed as static files.

**Routing** (React Router DOM 7):
- `/` → Home with hero and 3D model viewer
- `/notes` → Searchable, tag-filtered post listing
- `/notes/:slug` → Individual post (MDX + TOC + comments)

**Content model** — posts are defined in two places:
1. **Metadata**: `/src/data/notes.ts` — a typed `Note[]` array (slug, title, date, tags, excerpt, category). No YAML frontmatter.
2. **Content**: `/src/content/notes/{slug}.mdx` — MDX files discovered and lazy-loaded at runtime via `import.meta.glob('../content/notes/*.mdx')` in `NoteView.tsx`.

Adding a new post requires entries in both files.

**MDX pipeline** (configured in `vite.config.ts`):
- `remark-gfm` + `remark-math` → parse GFM and `$$...$$` LaTeX
- `rehype-highlight` → code syntax highlighting
- `rehype-katex` → render math
- Components are injected via `MDXProvider` in `NoteView.tsx`, mapping HTML elements to MUI Typography variants

**Key libraries:**
- Three.js + React Three Fiber — 3D model rendering in `ModelViewer.tsx`
- `react-py` — Python WASM interpreter powering `PythonREPL.tsx`
- Material-UI 7 with Emotion — all styling; light/dark theme in `/src/theme/`
- KaTeX — math rendering
- Giscus — GitHub-backed comments (`GiscusComments.tsx`)

**Theme**: Light/dark toggle persisted in `localStorage`. MUI theme and a React context (`ThemeContext`) are set up in `/src/theme/`. The `ModelViewer` adapts its environment map based on the active theme.

**Interactive components** (embeddable in MDX): `PythonREPL`, `ModelViewer`, `AnatomyAttention` (loads external CDN libs dynamically and uses imperative DOM refs alongside React).

## Conventions

- ESLint flat config (`eslint.config.js`); `react/no-unknown-property` is disabled globally to allow Three.js JSX props.
- `tsconfig.json` uses project references: `tsconfig.app.json` for `/src`, `tsconfig.node.json` for Vite config.
- Static assets (`.glb` models, images) live in `/public/`.
