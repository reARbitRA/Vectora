import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: [
      "src/**/*.test.ts",
      "src/**/*.test.tsx",
      "server/**/*.test.ts",
    ],
    environment: "node",
    // DOM-dependent tests (sanitizer, svgParser) declare their environment
    // with a `// @vitest-environment jsdom` docblock at the top of the file.
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
});
