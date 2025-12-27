import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import hooks from "eslint-plugin-react-hooks";
import refresh from "eslint-plugin-react-refresh";

export default tseslint.config(
  {
    ignores: ["dist", "node_modules", "jupyter-books", "public"],
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: {
      react: pluginReact,
      "react-hooks": hooks,
      "react-refresh": refresh,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...pluginReact.configs.flat.recommended.rules,
      ...pluginReact.configs.flat['jsx-runtime'].rules,
      ...hooks.configs.recommended.rules,
      "react-refresh/only-export-components": "warn",
    },
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parser: tseslint.parser,
      parserOptions: {
        project: "tsconfig.app.json",
      },
    },
  },
  {
    files: ["src/components/ModelViewer.tsx"],
    rules: {
      "react/no-unknown-property": "off",
    },
  }
);