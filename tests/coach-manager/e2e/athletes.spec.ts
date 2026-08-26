import {
  expect,
  test,
} from "@playwright/test";

test.describe(
  "Coach Manager Athletes",
  () => {
    test(
      "opens linked athlete, shows correct detail data and returns",
      async ({ page }) => {
        await page.goto("/coach-manager");

        await page
          .getByRole("link", {
            name: "Athletes",
            exact: true,
          })
          .click();

        await expect(
          page.getByRole("heading", {
            name: "Manage Your Athletes",
          }),
        ).toBeVisible({
          timeout: 10000,
        });

        const athleteRow =
          page
            .locator("button")
            .filter({
              hasText: "Linked athlete",
            })
            .first();

        await expect(
          athleteRow,
        ).toBeVisible();

        const athleteName =
          (
            await athleteRow
              .locator("p")
              .first()
              .textContent()
          )?.trim();

        expect(athleteName).toBeTruthy();

        await athleteRow.click();

        await expect(page).toHaveURL(
          /\/coach-manager\/athletes\/[^/?]+/,
        );

        await expect(
          page.getByRole("heading", {
            name: athleteName!,
          }),
        ).toBeVisible({
          timeout: 10000,
        });

        await expect(
          page.getByRole("heading", {
            name: "Current Evidence",
          }),
        ).toBeVisible();

        await expect(
          page.getByText(
            "Check-In Evidence",
            {
              exact: true,
            },
          ),
        ).toBeVisible();

        await expect(
          page.getByText(
            "Regeneration Evidence",
            {
              exact: true,
            },
          ),
        ).toBeVisible();

        await expect(
          page.getByText(
            "Training Evidence",
            {
              exact: true,
            },
          ),
        ).toBeVisible();

        await expect(
          page.getByText(
            "Analysis Evidence",
            {
              exact: true,
            },
          ),
        ).toBeVisible();

        await page
          .getByRole("link", {
            name: "Back to Athletes",
            exact: true,
          })
          .click();

        await expect(
          page.getByRole("heading", {
            name: "Manage Your Athletes",
          }),
        ).toBeVisible();
      },
    );
  },
);
