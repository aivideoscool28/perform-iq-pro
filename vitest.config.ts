import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    include: ["tests/coach-manager/*.test.ts", "tests/release/*.test.ts"],
    exclude: ["**/e2e/**", "**/node_modules/**"],
  },
});
