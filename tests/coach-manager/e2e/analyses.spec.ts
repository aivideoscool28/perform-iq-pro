import { expect, test } from "@playwright/test";

test.describe("Coach Manager Analyses", () => {
  test("opens Analyses and switches through all analysis tabs", async ({
    page,
  }) => {
    await page.goto("/coach-manager/analyses");

    /*
     * OVERVIEW
     */
    await expect(
      page.getByRole("heading", {
        name: "Analyses",
        exact: true,
      }),
    ).toBeVisible({
      timeout: 10000,
    });

    await expect(
      page.getByRole("heading", {
        name: "Choose what you want to investigate",
      }),
    ).toBeVisible();

    /*
     * CHECK-IN ANALYSIS
     */
    await page
      .getByRole("button", {
        name: /Check-In Analysis/,
      })
      .click();

    await expect(
      page.getByRole("heading", {
        name: "Check-In Analysis",
        exact: true,
      }),
    ).toBeVisible({
      timeout: 10000,
    });

    await expect(
      page.getByRole("heading", {
        name: "1. How are athletes responding?",
      }),
    ).toBeVisible({
      timeout: 10000,
    });

    await expect(
      page.getByRole("button", {
        name: "Compare previous 4 weeks",
      }),
    ).toBeVisible();

    /*
     * REGENERATION ANALYSIS
     */
    await page
      .getByRole("button", {
        name: /Regeneration Analysis/,
      })
      .click();

    await expect(
      page.getByRole("heading", {
        name: "Regeneration Analysis",
        exact: true,
      }),
    ).toBeVisible({
      timeout: 10000,
    });

    await expect(
      page.getByRole("heading", {
        name: "Regeneration over time",
      }),
    ).toBeVisible({
      timeout: 10000,
    });

    /*
     * TRAINING RESPONSE
     */
    await page
      .getByRole("button", {
        name: /Training Response/,
      })
      .click();

    await expect(
      page.getByRole("heading", {
        name: "Training Response",
        exact: true,
      }),
    ).toBeVisible({
      timeout: 10000,
    });

    await expect(
      page.getByRole("heading", {
        name: "Which training types stand out?",
      }),
    ).toBeVisible({
      timeout: 10000,
    });

    /*
     * SESSION COMPARISON
     */
    await page
      .getByRole("button", {
        name: /Session Comparison/,
      })
      .click();

    await expect(
      page.getByRole("heading", {
        name: "Session Comparison",
        exact: true,
      }),
    ).toBeVisible({
      timeout: 10000,
    });

    await expect(
      page.getByRole("heading", {
        name: "Comparison Summary",
      }),
    ).toBeVisible({
      timeout: 10000,
    });

    /*
     * TRENDS — intentionally not implemented yet.
     */
    await page
      .getByRole("button", {
        name: /Trends Over Time/,
      })
      .click();

    await expect(
      page.getByText("This analysis is next", {
        exact: true,
      }),
    ).toBeVisible();

    /*
     * RETURN TO OVERVIEW
     */
    await page
      .getByRole("button", {
        name: /Overview/,
      })
      .click();

    await expect(
      page.getByRole("heading", {
        name: "Analyses",
        exact: true,
      }),
    ).toBeVisible();

    await expect(
      page.getByRole("heading", {
        name: "Choose what you want to investigate",
      }),
    ).toBeVisible();
  });
});
