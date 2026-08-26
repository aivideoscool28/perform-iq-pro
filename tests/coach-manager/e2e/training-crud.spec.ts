import { test, expect } from "@playwright/test";

test.describe("Coach Manager Training", () => {
  test("creates and persists a training session", async ({ page }) => {
    const unique = Date.now();
    const title = `E2E TRAINING ${unique}`;

    await page.goto("/coach-manager");

    await page.getByText("Training", { exact: true }).first().click();

    await expect(
      page.getByText("Create Training & Exercise Library", {
        exact: true,
      }),
    ).toBeVisible();

    await page
      .getByText("Create Training & Exercise Library", {
        exact: true,
      })
      .click();

    await page
      .getByRole("button", {
        name: "Start from scratch",
      })
      .click();

    await expect(
      page.getByRole("heading", {
        name: "Create Training",
        level: 2,
      }),
    ).toBeVisible();

    const modal = page
      .getByRole("heading", {
        name: "Create Training",
      })
      .locator("xpath=ancestor::div[contains(@class,'max-w-4xl')][1]");

    await modal
      .locator("input")
      .nth(0)
      .fill(title);

    await modal
      .locator("input")
      .nth(1)
      .fill("E2E Sprint Group");

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const date = [
      tomorrow.getFullYear(),
      String(tomorrow.getMonth() + 1).padStart(2, "0"),
      String(tomorrow.getDate()).padStart(2, "0"),
    ].join("-");

    await modal
      .locator('input[type="date"]')
      .fill(date);

    await modal
      .locator('input[type="time"]')
      .nth(0)
      .fill("18:00");

    await modal
      .locator('input[type="time"]')
      .nth(1)
      .fill("19:30");

    await modal
      .getByRole("button", {
        name: "Save Training",
      })
      .click();

    await expect(
      page.getByText(title, {
        exact: true,
      }),
    ).toBeVisible({
      timeout: 10000,
    });

    await page
      .getByRole(
        "link",
        {
          name: "Overview",
        },
      )
      .click();

    await page
      .getByRole(
        "link",
        {
          name: "Training",
        },
      )
      .click();

    await expect(
      page.getByText(title, {
        exact: true,
      }),
    ).toBeVisible({
      timeout: 10000,
    });
  });
});
