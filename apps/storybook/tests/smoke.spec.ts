/**
 * Storybook smoke test (Milestone 1 — basic smoke only).
 *
 * Loads the built Storybook workshop and asserts:
 * 1. The workshop responds HTTP 200.
 * 2. The story index lists all 10 Milestone 1 components.
 * 3. The workshop UI loads in a real (headless) browser with no console
 *    errors and no uncaught page errors.
 *
 * Headless Chromium via the Playwright CLI — this is not a visual check
 * and not an on-device check.
 *
 * Why the no-console-errors check runs on the Button Playground story,
 * not on the default `/` load: `/` opens the Avatar autodocs page, which
 * renders every Avatar story inline — including `FallbackOnFailedSrc`,
 * whose whole point is an `<Avatar src="https://invalid.example/…">`
 * that does not resolve. The browser logs that intentional fixture as a
 * failed-resource console error. That error is expected, not a workshop
 * failure, so the error-free assertion is scoped to a story load with no
 * external fixture instead of suppressing the fixture's error.
 */
import { expect, test } from "@playwright/test";

const expectedTitles = [
  "Components/Avatar",
  "Components/Button",
  "Components/Card",
  "Components/Dialog",
  "Components/Input",
  "Components/Popover",
  "Components/Select",
  "Components/Switch",
  "Components/Tabs",
  "Components/Toast",
];

test("storybook workshop loads: HTTP 200, all 10 component stories, no console errors", async ({
  page,
  request,
}) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => pageErrors.push(String(err)));

  const home = await request.get("/");
  expect(home.status(), "GET / should return HTTP 200").toBe(200);

  const index = await request.get("/index.json");
  expect(index.status(), "GET /index.json should return HTTP 200").toBe(200);
  const entries = Object.values(
    (await index.json()).entries as Record<string, { title: string }>,
  );
  const titles = [...new Set(entries.map((entry) => entry.title))].sort();
  expect(
    titles,
    "story index should list all 10 Milestone 1 components",
  ).toEqual([...expectedTitles].sort());

  await page.goto("/");
  // Sidebar story items are buttons in Storybook 10's manager UI.
  await expect(
    page.getByRole("button", { name: "Button", exact: true }).first(),
    "sidebar should list the Button stories",
  ).toBeVisible();

  // Fresh error window for the story load (see header comment: the `/`
  // autodocs load intentionally logs the Avatar fallback fixture's
  // failed image request).
  consoleErrors.length = 0;
  pageErrors.length = 0;

  await page.goto("/?path=/story/components-button--playground");
  await expect(
    page
      .frameLocator("#storybook-preview-iframe")
      .getByRole("button", { name: "New document" }),
    "Button Playground story should render in the preview iframe",
  ).toBeVisible();

  expect(pageErrors, "no uncaught page errors on story load").toEqual([]);
  expect(consoleErrors, "no console errors on story load").toEqual([]);
});
