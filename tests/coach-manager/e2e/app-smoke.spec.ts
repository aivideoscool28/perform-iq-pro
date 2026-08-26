import {
  expect,
  test,
} from "@playwright/test";

test.describe(
  "Aether Athlete IQ browser smoke test",
  () => {
    test(
      "application starts and auth page loads without crashing",
      async ({
        page,
      }) => {
        const seriousErrors:
          string[] = [];

        page.on(
          "pageerror",
          (error) => {
            seriousErrors.push(
              `PAGE ERROR: ${error.message}`,
            );
          },
        );

        page.on(
          "console",
          (message) => {
            if (
              message.type() ===
              "error"
            ) {
              seriousErrors.push(
                `CONSOLE ERROR: ${message.text()}`,
              );
            }
          },
        );

        const response =
          await page.goto(
            "/auth",
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
          page.locator(
            "body",
          ),
        ).toBeVisible();

        await expect(
          page.locator(
            "body",
          ),
        ).not.toBeEmpty();

        expect(
          seriousErrors,
          seriousErrors.join(
            "\n",
          ),
        ).toEqual(
          [],
        );
      },
    );
  },
);
