import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.spec.ts"],
  },
  // Workspace package is CommonJS; Vite 7 rejects a false "import" ESM entry.
  // Alias to built dist so enums resolve under vitest.
  resolve: {
    alias: {
      "@zharfa/database": path.resolve(
        __dirname,
        "../../packages/database/dist/index.js",
      ),
    },
  },
});
