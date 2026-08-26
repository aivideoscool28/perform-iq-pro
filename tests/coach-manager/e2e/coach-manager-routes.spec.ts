import {
  expect,
  test,
} from "@playwright/test";

const coachPages = [
  {
    path: "/coach-manager",
    name: "Dashboard",
  },
  {
    path: "/coach-manager/athletes",
    name: "Athletes",
  },
  {
    path: "/coach-manager/training",
    name: "Training",
  },
  {
    path: "/coach-manager/analyses",
    name: "Analyses",
  },
  {
    path: "/coach-manager/video",
    name: "Video",
  },
  {
    path: "/coach-manager/competitions",
    name: "Competitions",
  },
  {
    path: "/coach-manager/notes",
    name: "Notes",
  },
];

test.describe(
  "Coach Manager route health",
  () => {
    for (const coachPage of coachPages) {
      test(
        `${coachPage.name} loads without crashing`,
        async ({ page }) => {
          const pageErrors: string[] = [];
          const serverErrors: string[] = [];

          page.on(
            "pageerror",
            (error) => {
              pageErrors.push(
                error.message,
              );
            },
          );

          page.on(
            "response",
            (response) => {
              if (
                response.status() >= 500
              ) {
                serverErrors.push(
                  `${response.status()} ${response.url()}`,
                );
              }
            },
          );

          const response =
            await page.goto(
              coachPage.path,
              {
                waitUntil:
                  "domcontentloaded",
              },
            );

          expect(
            response,
          ).not.toBeNull();

          expect(
            response?.status(),
          ).toBeLessThan(
            500,
          );

          await expect(
            page.locator("body"),
          ).toBeVisible();

          await expect(
            page.locator("body"),
          ).not.toBeEmpty();

          await page.waitForTimeout(
            1500,
          );

          const bodyText =
            await page
              .locator("body")
              .innerText();

          expect(
            bodyText,
          ).not.toContain(
            "Application Error",
          );

          expect(
            bodyText,
          ).not.toContain(
            "Internal Server Error",
          );

          expect(
            bodyText,
          ).not.toContain(
            "Something went wrong",
          );

          expect(
            pageErrors,
            pageErrors.join("\n"),
          ).toEqual([]);

          expect(
            serverErrors,
            serverErrors.join("\n"),
          ).toEqual([]);
        },
      );
    }
  },
);
