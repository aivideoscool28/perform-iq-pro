import dotenv from "dotenv";
dotenv.config({ path: ".env.e2e" });
import {
  defineConfig,
  devices,
} from "@playwright/test";

export default defineConfig({
  testDir:
    "./tests/coach-manager/e2e",

  timeout: 30_000,

  expect: {
    timeout: 8_000,
  },

  fullyParallel: false,
  retries: 0,
  workers: 1,

  reporter: [
    ["list"],
    [
      "html",
      {
        outputFolder:
          "playwright-report/coach-manager",
        open: "never",
      },
    ],
    [
      "json",
      {
        outputFile:
          "test-results/coach-manager/playwright-results.json",
      },
    ],
  ],

  outputDir:
    "test-results/coach-manager/playwright",

  use: {
    baseURL:
      "http://127.0.0.1:8080",

    trace:
      "retain-on-failure",

    screenshot:
      "only-on-failure",

    video:
      "retain-on-failure",
  },

  projects: [
    {
      name: "Coach Auth Setup",

      testMatch:
        /auth\.setup\.ts/,
    },

    {
      name:
        "Coach Manager Chromium",

      use: {
        ...devices[
          "Desktop Chrome"
        ],

        storageState:
          "tests/coach-manager/.auth/coach.json",
      },

      dependencies: [
        "Coach Auth Setup",
      ],

      testIgnore:
        /auth\.setup\.ts/,
    },
  ],

  webServer: {
    command:
      "npm run dev -- --host 127.0.0.1",

    url:
      "http://127.0.0.1:8080",

    reuseExistingServer:
      true,

    timeout:
      120_000,
  },
});

