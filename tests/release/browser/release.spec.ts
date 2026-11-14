import { test, expect } from "@playwright/test";
const browserErrors = new WeakMap<import("@playwright/test").Page, string[]>();
test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  browserErrors.set(page, errors);
  page.on("pageerror", (error) => errors.push(error.message));
});
test.afterEach(async ({ page }) => {
  expect(browserErrors.get(page) ?? []).toEqual([]);
});
const athlete = "00000000-0000-0000-0000-000000000001",
  coach = "00000000-0000-0000-0000-000000000011";
async function login(page: import("@playwright/test").Page, id = athlete) {
  await page.addInitScript(
    ({ id }) => {
      const b64 = (value: unknown) =>
        btoa(JSON.stringify(value)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
      const access_token =
        b64({ alg: "HS256", typ: "JWT" }) +
        "." +
        b64({
          sub: id,
          role: "authenticated",
          aud: "authenticated",
          exp: Math.floor(Date.now() / 1000) + 3600,
        }) +
        "." +
        b64("local-test-signature");
      localStorage.setItem(
        "sb-127-auth-token",
        JSON.stringify({
          access_token,
          refresh_token: "local-only",
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          expires_in: 3600,
          token_type: "bearer",
          user: {
            id,
            aud: "authenticated",
            role: "authenticated",
            email: "test@example.invalid",
            user_metadata: {},
            app_metadata: {},
          },
        }),
      );
    },
    { id },
  );
}
test("protected pages redirect and chat rejects unauthenticated requests", async ({
  page,
  request,
}) => {
  await page.goto("/profile");
  await expect(page).toHaveURL(/\/auth/);
  const response = await request.post("/api/chat", { data: { messages: [] } });
  expect(response.status()).toBe(401);
});
test("profile editing persists validated data and permissions", async ({ page }) => {
  await login(page);
  await page.goto("/profile");
  await expect(page.getByRole("button", { name: "Profil bearbeiten", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Profil bearbeiten", exact: true }).click();
  await page.getByLabel("Name", { exact: true }).fill("Updated Test Athlete");
  await page.getByRole("button", { name: "Änderungen speichern" }).click();
  await expect(
    page.getByRole("heading", { name: "Updated Test Athlete", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Updated Test Athlete", exact: true }),
  ).toBeVisible();
});
test("HTML snapshots are ignored and scanner remains interactive", async ({ page }) => {
  await login(page);
  await page.addInitScript(() =>
    localStorage.setItem("athleticiq.edit.nutrition.v1", "<button>Stale snapshot</button>"),
  );
  await page.goto("/nutrition");
  await expect(page.getByText("Funktionsvorschau · Beispieldaten", { exact: true })).toBeVisible();
  await expect(page.getByText("Stale snapshot", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Bearbeiten", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Scannen", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
});
test("empty athlete training contains no invented workouts", async ({ page }) => {
  await login(page);
  await page.goto("/training");
  await expect(page.getByRole("status")).toContainText("noch kein Trainingsplan");
  await expect(page.getByText("Beschleunigung", { exact: true })).toHaveCount(0);
});
test("coach direct navigation and refresh retain the session", async ({ page }) => {
  await login(page, coach);
  await page.goto("/coach-manager");
  await expect(page).toHaveURL(/\/coach-manager/);
  await expect(page.locator("body")).not.toContainText("Willkommen zurück");
  await page.reload();
  await expect(page).toHaveURL(/\/coach-manager/);
  await expect(page.locator("body")).not.toContainText("Willkommen zurück");
});
test("athlete cannot open coach manager", async ({ page }) => {
  await login(page);
  await page.goto("/coach-manager");
  await expect(page).toHaveURL(/\/$/);
});

test("coach can reach the private invitation code and return to Coach Manager", async ({
  page,
}) => {
  await login(page, coach);
  await page.goto("/coach-manager");
  await page.getByRole("link", { name: "Profil & Einladung", exact: true }).click();
  await expect(page.getByText("local-test-code", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Zum Coach Manager", exact: true }).click();
  await expect(page).toHaveURL(/\/coach-manager/);
});
