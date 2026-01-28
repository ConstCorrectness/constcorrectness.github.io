# Gemini Code Context: `constcorrectness.github.io`

This document provides context for the AI assistant to understand the structure, conventions, and purpose of this codebase.

## Project Overview

This is a personal website and blog built with **React**, **TypeScript**, and **Vite**. It features interactive 3D elements using `three.js` and `react-three-fiber`, and technical articles written in **MDX**.

- **Frontend**: A single-page application built with React and TypeScript, styled with Material-UI.
- **Routing**: Client-side routing is handled by `react-router-dom`.
- **Blog**: 
    - Content is written in `.mdx` files in `src/content/notes/`.
    - Supports LaTeX math (via `rehype-katex`).
    - Supports executable Python code blocks in the browser (via `react-py` / WebAssembly).
- **3D Graphics**: `src/components/ModelViewer.tsx` displays `.glb` models.
- **Deployment**: The site is deployed to GitHub Pages via a GitHub Actions workflow defined in `.github/workflows/deploy.yml`.

## Architecture

- **`src/main.tsx`**: Entry point, wraps the app in `BrowserRouter`.
- **`src/App.tsx`**: Defines the routes (`/`, `/notes`, `/notes/:slug`).
- **`src/pages/`**: Top-level page components (Home, NotesList, NoteView).
- **`src/components/PythonREPL.tsx`**: A component that runs Python code in the browser using WASM.

## Building and Running the Project

- **Install dependencies**:
  ```bash
  npm install
  ```

- **Run the development server**:
  ```bash
  npm run dev
  ```

- **Build for production**:
  ```bash
  npm run build
  ```

- **Linting**:
  ```bash
  npm run lint
  ```

## Development Conventions

- **Styling**: Material-UI for components. Custom CSS for code highlighting and math.
- **Content**: To add a new blog post, create a `.mdx` file in `src/content/notes/` and add an entry to the list in `src/pages/NotesList.tsx`.