import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/release/browser",
  workers: 1,
  retries: 0,
  timeout: 30000,
  expect: { timeout: 10000 },
  use: {
    baseURL: "http://127.0.0.1:8180",
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_USE_BUNDLED_CHROMIUM
        ? undefined
        : (process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? "/usr/bin/chromium"),
      args: ["--no-sandbox"],
    },
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "node scripts/start-release-test-app.mjs",
    url: "http://127.0.0.1:8180/auth",
    reuseExistingServer: false,
    timeout: 120000,
  },
  reporter: [["list"]],
  outputDir: "test-results/release",
});
