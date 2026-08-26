import {
  expect,
  test as setup,
} from "@playwright/test";

const authFile =
  "tests/coach-manager/.auth/coach.json";

setup(
  "authenticate coach",
  async ({ page }) => {
    const coachEmail =
      process.env.E2E_COACH_EMAIL;

    const coachPassword =
      process.env.E2E_COACH_PASSWORD;

    if (!coachEmail || !coachPassword) {
      throw new Error(
        "Missing E2E_COACH_EMAIL or E2E_COACH_PASSWORD.",
      );
    }

    page.on("console", (message) => {
      console.log(
        "BROWSER:",
        message.type(),
        message.text(),
      );
    });

    page.on("pageerror", (error) => {
      console.log(
        "PAGE ERROR:",
        error.message,
      );
    });

    page.on("request", (request) => {
      if (
        request.isNavigationRequest() ||
        request.url().includes("supabase")
      ) {
        console.log(
          "REQUEST:",
          request.method(),
          request.url(),
        );
      }
    });

    await page.goto(
      "/auth",
      {
        waitUntil: "networkidle",
      },
    );

    /*
     * Give TanStack Start/React hydration time
     * before interacting with the SSR form.
     */
    await page.waitForTimeout(
      1500,
    );

    const emailInput =
      page.getByPlaceholder(
        "E-Mail",
      );

    const passwordInput =
      page.getByPlaceholder(
        "Passwort (min. 6 Zeichen)",
      );

    await expect(
      emailInput,
    ).toBeVisible();

    await expect(
      passwordInput,
    ).toBeVisible();

    await emailInput.fill(
      coachEmail,
    );

    await passwordInput.fill(
      coachPassword,
    );

    console.log(
      "EMAIL:",
      await emailInput.inputValue(),
    );

    console.log(
      "PASSWORD LENGTH:",
      (
        await passwordInput.inputValue()
      ).length,
    );

    await page
      .getByRole(
        "button",
        {
          name: "Anmelden",
          exact: true,
        },
      )
      .click();

    await page.waitForTimeout(
      3000,
    );

    console.log(
      "URL AFTER CLICK:",
      page.url(),
    );

    console.log(
      "BODY:",
      await page.locator("body").innerText(),
    );

    await expect(
      page,
    ).toHaveURL(
      /\/coach-manager/,
      {
        timeout: 15_000,
      },
    );

    await page.context().storageState({
      path: authFile,
    });
  },
);
