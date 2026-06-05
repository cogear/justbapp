import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// ── Circles seam ──────────────────────────────────────────────────────────────
// The Circles engine is a bounded context. Host code must reach it ONLY through
// the server actions (src/app/circles/*) and route handlers (src/app/api/circles/*),
// never by importing its domain core or data layer directly. This rule fails the
// build if that seam is crossed. See src/lib/circles/ARCHITECTURE.md.
const circlesSeam = {
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: [
              "@/lib/circles/core",
              "@/lib/circles/core/*",
              "@/lib/circles/data",
              "@/lib/circles/data/*",
            ],
            message:
              "Host code must not import Circles internals. Call the server actions in src/app/circles/* or the /api/circles/* routes instead (the engine's seam).",
          },
        ],
      },
    ],
  },
};

// Inside the Circles bounded context, the layers are free to import each other.
const circlesInternal = {
  files: ["src/lib/circles/**", "src/app/circles/**", "src/app/api/circles/**"],
  rules: {
    "no-restricted-imports": "off",
  },
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  circlesSeam,
  circlesInternal,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
