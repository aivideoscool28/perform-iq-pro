import {
  expect,
  test,
  type Page,
} from "@playwright/test";


async function openNotes(
  page: Page,
) {
  await page.goto(
    "/coach-manager",
  );

  await page
    .getByRole(
      "link",
      {
        name: "Notes",
      },
    )
    .click();

  await expect(
    page,
  ).toHaveURL(
    /\/coach-manager\/notes/,
  );

  await expect(
    page.getByRole(
      "button",
      {
        name: "Save Note",
      },
    ),
  ).toBeVisible({
    timeout: 10_000,
  });
}


async function reopenNotes(
  page: Page,
) {
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
        name: "Notes",
      },
    )
    .click();

  await expect(
    page,
  ).toHaveURL(
    /\/coach-manager\/notes/,
  );
}


async function deleteNoteByText(
  page: Page,
  text: string,
) {
  const textNode =
    page.getByText(
      text,
      {
        exact: true,
      },
    );

  if (
    await textNode.count() === 0
  ) {
    return;
  }

  const container =
    textNode.locator(
      "xpath=ancestor::*[.//button][1]",
    );

  const buttons =
    container.locator(
      "button",
    );

  page.once(
    "dialog",
    async (
      dialog,
    ) => {
      await dialog.accept();
    },
  );

  await buttons
    .last()
    .click();

  await expect(
    page.getByText(
      text,
      {
        exact: true,
      },
    ),
  ).toHaveCount(
    0,
    {
      timeout: 10_000,
    },
  );
}


test.describe(
  "Coach Manager Notes",
  () => {

    test(
      "basic note CRUD, persistence and search",
      async ({ page }) => {
        const text =
          `E2E BASIC ${Date.now()}`;

        await openNotes(
          page,
        );

        const textarea =
          page.getByPlaceholder(
            "Add coaching context...",
          );

        await textarea.fill(
          text,
        );

        await page
          .getByRole(
            "button",
            {
              name:
                "Save Note",
            },
          )
          .click();

        await expect(
          page.getByText(
            text,
            {
              exact: true,
            },
          ),
        ).toBeVisible();


        /*
         * Persistence
         */
        await reopenNotes(
          page,
        );

        await expect(
          page.getByText(
            text,
            {
              exact: true,
            },
          ),
        ).toBeVisible();


        /*
         * Search
         */
        const search =
          page.getByPlaceholder(
            "Search notes...",
          );

        await search.fill(
          text,
        );

        await expect(
          page.getByText(
            text,
            {
              exact: true,
            },
          ),
        ).toBeVisible();

        await search.fill(
          "THIS SHOULD FIND NOTHING",
        );

        await expect(
          page.getByText(
            text,
            {
              exact: true,
            },
          ),
        ).toHaveCount(
          0,
        );

        await search.fill(
          "",
        );


        /*
         * Delete
         */
        await deleteNoteByText(
          page,
          text,
        );

        await reopenNotes(
          page,
        );

        await expect(
          page.getByText(
            text,
            {
              exact: true,
            },
          ),
        ).toHaveCount(
          0,
        );
      },
    );


    test(
      "pin persists",
      async ({ page }) => {
        const text =
          `E2E PIN ${Date.now()}`;

        await openNotes(page);

        await page
          .getByPlaceholder(
            "Add coaching context...",
          )
          .fill(text);

        await page
          .getByRole(
            "button",
            {
              name: "Save Note",
            },
          )
          .click();

        const textNode =
          page.getByText(
            text,
            {
              exact: true,
            },
          );

        await expect(
          textNode,
        ).toBeVisible();

        const noteRow =
          textNode.locator(
            "xpath=ancestor::div[contains(@class,'border-b')][1]",
          );

        await expect(
          noteRow,
        ).toBeVisible();

        const buttons =
          noteRow.locator(
            "button",
          );

        await expect(
          buttons,
        ).toHaveCount(2);

        const pinButton =
          buttons.first();

        await pinButton.click();

        await expect
          .poll(
            async () => {
              const pinnedCard =
                page
                  .getByText(
                    "Pinned Notes",
                    {
                      exact: true,
                    },
                  )
                  .locator(
                    "xpath=ancestor::article[1]",
                  );

              return await pinnedCard.textContent();
            },
            {
              timeout: 10_000,
            },
          )
          .not.toBe(
            "Pinned Notes0",
          );

        await reopenNotes(page);

        const refreshedText =
          page.getByText(
            text,
            {
              exact: true,
            },
          );

        await expect(
          refreshedText,
        ).toBeVisible();

        const refreshedRow =
          refreshedText.locator(
            "xpath=ancestor::div[contains(@class,'border-b')][1]",
          );

        const refreshedPinButton =
          refreshedRow
            .locator("button")
            .first();

        await expect(
          refreshedPinButton,
        ).toHaveClass(
          /text-violet-600/,
        );

        await deleteNoteByText(
          page,
          text,
        );
      },
    );


    test(
      "creates and persists a measurement",
      async ({ page }) => {
        const text =
          `E2E MEASUREMENT ${Date.now()}`;

        await openNotes(
          page,
        );

        await page
          .getByRole(
            "button",
            {
              name:
                "Measurement",
              exact: true,
            },
          )
          .click();

        await page
          .getByPlaceholder(
            "Measurement type",
          )
          .fill(
            "Flying 30m E2E",
          );

        await page
          .getByPlaceholder(
            "Result",
          )
          .fill(
            "3.21",
          );

        await page
          .getByPlaceholder(
            "Unit",
          )
          .fill(
            "s",
          );

        await page
          .getByPlaceholder(
            "Add coaching context...",
          )
          .fill(
            text,
          );

        await page
          .getByRole(
            "button",
            {
              name:
                "Save Measurement",
            },
          )
          .click();

        await expect(
          page.getByText(
            text,
            {
              exact: true,
            },
          ),
        ).toBeVisible();

        await expect(
          page.getByText(
            "Flying 30m E2E",
            {
              exact: true,
            },
          ),
        ).toBeVisible();

        await reopenNotes(
          page,
        );

        await expect(
          page.getByText(
            text,
            {
              exact: true,
            },
          ),
        ).toBeVisible();

        await page
          .getByRole(
            "button",
            {
              name:
                "Measurements",
            },
          )
          .click();

        await expect(
          page.getByText(
            text,
            {
              exact: true,
            },
          ),
        ).toBeVisible();

        await deleteNoteByText(
          page,
          text,
        );
      },
    );


    test(
      "creates, completes and persists a follow-up",
      async ({ page }) => {
        const text =
          `E2E FOLLOWUP ${Date.now()}`;

        await openNotes(
          page,
        );

        await page
          .getByRole(
            "button",
            {
              name:
                "Follow-up",
              exact: true,
            },
          )
          .click();

        await page
          .getByPlaceholder(
            "Add coaching context...",
          )
          .fill(
            text,
          );

        await page
          .getByRole(
            "button",
            {
              name:
                "Save Follow-up",
            },
          )
          .click();

        const noteText =
          page.getByText(
            text,
            {
              exact: true,
            },
          );

        await expect(
          noteText,
        ).toBeVisible();

        const container =
          noteText.locator(
            "xpath=ancestor::*[.//button][1]",
          );

        await expect(
          container.getByRole(
            "button",
            {
              name:
                "Open",
            },
          ),
        ).toBeVisible();

        await container
          .getByRole(
            "button",
            {
              name:
                "Open",
            },
          )
          .click();

        await expect(
          container.getByRole(
            "button",
            {
              name:
                "Completed",
            },
          ),
        ).toBeVisible();

        await reopenNotes(
          page,
        );

        const refreshedContainer =
          page
            .getByText(
              text,
              {
                exact: true,
              },
            )
            .locator(
              "xpath=ancestor::*[.//button][1]",
            );

        await expect(
          refreshedContainer.getByRole(
            "button",
            {
              name:
                "Completed",
            },
          ),
        ).toBeVisible();

        await deleteNoteByText(
          page,
          text,
        );
      },
    );


    test(
      "athlete visibility requires a recipient",
      async ({ page }) => {
        const text =
          `E2E VALIDATION ${Date.now()}`;

        await openNotes(page);

        const visibilitySelect =
          page
            .getByText(
              "Visibility",
              {
                exact: true,
              },
            )
            .locator(
              "xpath=following::select[1]",
            );

        await visibilitySelect
          .selectOption(
            "Athlete",
          );

        const textarea =
          page.getByPlaceholder(
            "Add coaching context...",
          );

        await textarea.fill(
          text,
        );

        await page
          .getByRole(
            "button",
            {
              name: "Save Note",
            },
          )
          .click();

        await expect(
          page.getByText(
            "Select at least one athlete to publish this note to.",
            {
              exact: true,
            },
          ),
        ).toBeVisible();

        await expect(
          textarea,
        ).toHaveValue(
          text,
        );

        await reopenNotes(
          page,
        );


        await expect(
          page.getByText(
            text,
            {
              exact: true,
            },
          ),
        ).toHaveCount(
          0,
        );
      },
    );


    test(
      "publishes to selected athletes",
      async ({ page }) => {
        const text =
          `E2E SELECTED ${Date.now()}`;

        await openNotes(
          page,
        );

        const visibilitySelect =
          page
            .getByText(
              "Visibility",
              {
                exact: true,
              },
            )
            .locator(
              "xpath=following::select[1]",
            );

        await visibilitySelect
          .selectOption(
            "Athlete",
          );

        await expect(
          page.getByText(
            "Selected athletes",
            {
              exact: true,
            },
          ),
        ).toBeVisible();

        const checkboxes =
          page.locator(
            'input[type="checkbox"]',
          );

        const checkboxCount =
          await checkboxes.count();

        expect(
          checkboxCount,
        ).toBeGreaterThan(
          0,
        );

        /*
         * Select first linked athlete.
         */
        await checkboxes
          .first()
          .check();

        /*
         * If multiple linked athletes exist,
         * select a second one as well.
         */
        if (
          checkboxCount >
          1
        ) {
          await checkboxes
            .nth(
              1,
            )
            .check();
        }

        await page
          .getByPlaceholder(
            "Add coaching context...",
          )
          .fill(
            text,
          );

        await page
          .getByRole(
            "button",
            {
              name:
                "Save Note",
            },
          )
          .click();

        await expect(
          page.getByText(
            text,
            {
              exact: true,
            },
          ),
        ).toBeVisible();

        await reopenNotes(
          page,
        );

        await expect(
          page.getByText(
            text,
            {
              exact: true,
            },
          ),
        ).toBeVisible();

        await deleteNoteByText(
          page,
          text,
        );
      },
    );


    test(
      "publishes to all linked athletes",
      async ({ page }) => {
        const text =
          `E2E ALL ATHLETES ${Date.now()}`;

        await openNotes(
          page,
        );

        const visibilitySelect =
          page
            .getByText(
              "Visibility",
              {
                exact: true,
              },
            )
            .locator(
              "xpath=following::select[1]",
            );

        await visibilitySelect
          .selectOption(
            "Athlete",
          );

        await page
          .getByRole(
            "button",
            {
              name:
                "All linked athletes",
            },
          )
          .click();

        await expect(
          page.getByText(
            /linked athlete.*will receive this note/,
          ),
        ).toBeVisible();

        await page
          .getByPlaceholder(
            "Add coaching context...",
          )
          .fill(
            text,
          );

        await page
          .getByRole(
            "button",
            {
              name:
                "Save Note",
            },
          )
          .click();

        await expect(
          page.getByText(
            text,
            {
              exact: true,
            },
          ),
        ).toBeVisible({
          timeout: 10_000,
        });

        await reopenNotes(
          page,
        );

        await expect(
          page.getByText(
            text,
            {
              exact: true,
            },
          ),
        ).toBeVisible();

        await deleteNoteByText(
          page,
          text,
        );
      },
    );
  },
);