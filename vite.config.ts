import fs from 'fs'
import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeHighlight from 'rehype-highlight'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    {
      enforce: 'pre',
      ...mdx({
        remarkPlugins: [remarkGfm, remarkMath],
        rehypePlugins: [rehypeKatex, rehypeHighlight],
        providerImportSource: "@mdx-js/react",
      })
    },
    react(),
    // In dev mode, Vite bundles react-py into .vite/deps/react-py.js.
    // import.meta.url in that bundle resolves worker paths relative to
    // .vite/deps/, so the browser requests .vite/workers/service-worker
    // and .vite/workers/python-worker — paths that don't exist. This
    // middleware serves the actual react-py worker files at those paths.
    {
      name: 'react-py-workers',
      configureServer(server) {
        // react-py bundles into .vite/deps/react-py.js; import.meta.url resolves
        // worker paths relative to .vite/deps/, so the browser requests
        // .vite/workers/{name}. We serve pre-bundled files from public/workers/
        // directly, bypassing Vite's bundler (which leaves comlink as a broken
        // ESM import in a classic Worker context).
        const publicWorkers = path.resolve('public/workers');
        server.middlewares.use((req, res, next) => {
          const urlPath = req.url?.split('?')[0];
          const match = urlPath?.match(/\/node_modules\/\.vite\/workers\/(.+)$/);
          if (match) {
            const file = path.join(publicWorkers, match[1] + '.js');
            if (fs.existsSync(file)) {
              res.setHeader('Content-Type', 'application/javascript');
              res.end(fs.readFileSync(file));
              return;
            }
          }
          next();
        });
      },
    },
  ],
  server: {
    headers: {
      'Service-Worker-Allowed': '/',
    },
  },
})
