# Gemini Code Context: `const-correctness.github.io`

This document provides context for the AI assistant to understand the structure, conventions, and purpose of this codebase.

## Project Overview

This is a personal website and blog built with React, TypeScript, and Vite. It features interactive 3D elements using `three.js` and `react-three-fiber`, and hosts technical articles written in a Jupyter Book.

- **Frontend**: A single-page application built with React and TypeScript, styled with Material-UI. The main application logic is in `src/App.tsx`.
- **3D Graphics**: The site includes a 3D model viewer (`src/components/ModelViewer.tsx`) that displays a `.glb` model.
- **Blog Content**: The technical articles are managed in the `jupyter-books` directory. These are converted to HTML using Jupyter Book and served as part of the React application.
- **Deployment**: The site is deployed to GitHub Pages via a GitHub Actions workflow defined in `.github/workflows/deploy.yml`.

## Building and Running the Project

The project uses `npm` for package management.

- **Install dependencies**:
  ```bash
  npm install
  ```

- **Run the development server**:
  Starts the Vite dev server at `http://localhost:5173`.
  ```bash
  npm run dev
  ```

- **Build for production**:
  This command transpiles the TypeScript and builds the Vite project.
  ```bash
  npm run build
  ```

- **Build and serve the Jupyter Book**:
  The Jupyter Book content needs to be built and copied to the `public` directory to be accessible by the Vite application.
  ```bash
  npm run build:book
  npm run copy:book
  ```

- **Linting**:
  This project uses ESLint for code linting.
  ```bash
  npm run lint
  ```

## Development Conventions

- **Styling**: The project uses Material-UI for UI components. Styling is done via the `sx` prop.
- **State Management**: Component-level state is managed with React hooks (`useState`).
- **3D Models**: 3D models are stored in the `public/models` directory.
- **Blog Posts**: Blog posts are written in Markdown (`.md`) or Jupyter Notebooks (`.ipynb`) in the `jupyter-books` directory. To create a new post, add a file to this directory and update the `_toc.yml` file.
- **Proxy**: The Vite development server is configured with proxies in `vite.config.ts` to correctly serve the Jupyter Book content.
