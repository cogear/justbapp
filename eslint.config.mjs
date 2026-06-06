import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// ── Gatherings seam ──────────────────────────────────────────────────────────────
// The Gatherings engine is a bounded context. Host code must reach it ONLY through
// the server actions (src/app/gatherings/*) and route handlers (src/app/api/gatherings/*),
// never by importing its domain core or data layer directly. This rule fails the
// build if that seam is crossed. See src/lib/gatherings/ARCHITECTURE.md.
const gatheringsSeam = {
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: [
              "@/lib/gatherings/core",
              "@/lib/gatherings/core/*",
              "@/lib/gatherings/data",
              "@/lib/gatherings/data/*",
            ],
            message:
              "Host code must not import Gatherings internals. Call the server actions in src/app/gatherings/* or the /api/gatherings/* routes instead (the engine's seam).",
          },
        ],
      },
    ],
  },
};

// Inside the Gatherings bounded context, the layers are free to import each other.
const gatheringsInternal = {
  files: ["src/lib/gatherings/**", "src/app/gatherings/**", "src/app/api/gatherings/**"],
  rules: {
    "no-restricted-imports": "off",
  },
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  gatheringsSeam,
  gatheringsInternal,
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
