// The VS Code MDX Preview extension evaluates workspace modules directly in a
// browser webview. Unlike Vite, it does not replace process.env.NODE_ENV before
// loading MUI. Import this module before components that import MUI.
(() => {
  type PreviewRuntime = typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
  };

  const mdxPreviewRuntime = globalThis as PreviewRuntime;
  mdxPreviewRuntime.process ??= { env: {} };
  mdxPreviewRuntime.process.env ??= {};
  mdxPreviewRuntime.process.env.NODE_ENV ??= 'development';
})();
