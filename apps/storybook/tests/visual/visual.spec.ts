/**
 * Visual regression (Milestone 2, D11).
 *
 * Screenshot baselines for all 10 web components, in both themes, against
 * the built Storybook (`storybook-static/`, served by the same webServer as
 * the smoke test). Chromium only, headless.
 *
 * How a story is captured:
 * - The story is loaded directly in the preview iframe
 *   (`/iframe.html?id=<story>&viewMode=story&globals=theme:<theme>`),
 *   bypassing the Storybook manager UI so the screenshot holds only the
 *   story itself. The preview decorator sets `data-theme="light"` on
 *   `<html>` for light; dark is the default (attribute absent). The test
 *   asserts the attribute matches the theme it asked for, so a Storybook
 *   URL-format change fails loudly instead of silently baselining the
 *   wrong theme.
 * - The viewport is fixed (1280x720, the Playwright default, made explicit)
 *   so baselines are comparable run to run.
 * - `animations: "disabled"` freezes CSS transitions at their end state
 *   (backdrop fade, Select popup) and hides the text caret.
 * - Motion (JS) enter animations — Dialog, Popover, Toast — drive opacity
 *   through inline style, so the test polls until no element still has an
 *   inline opacity below 1 before screenshotting. No durations are
 *   hard-coded here: the wait is driven by the rendered state, not by the
 *   token values (fast 120ms / base 200ms / slow 320ms).
 * - Screenshots are full-viewport (`expect(page).toHaveScreenshot`), not
 *   `#storybook-root` element shots: Dialog, Popover, Select and Toast
 *   render into a portal on `document.body`, outside `#storybook-root`.
 *
 * Coverage: one baseline per component per theme at minimum, plus cheap
 * open-state variants for the overlay components (Popover open, Select
 * open, all four Toast variants fired) and the error/checked states for
 * Input and Switch. See README.md in this directory for the full list and
 * for how to regenerate baselines.
 *
 * Baselines live in `__snapshots__/` next to this file (see
 * `snapshotPathTemplate` in `playwright.config.ts`). They are Chromium
 * screenshots from the cached headless build; regenerating after a
 * Playwright upgrade may be needed if rendering changes.
 */
import { expect, test, type Page } from "@playwright/test";

type Theme = "dark" | "light";

const THEMES: Theme[] = ["dark", "light"];

// Fixed viewport so baselines are comparable run to run.
test.use({ viewport: { width: 1280, height: 720 } });

/**
 * Load a story in the preview iframe in the given theme and wait until it
 * has rendered. Fails if the theme the page actually shows is not the one
 * requested.
 */
async function openStory(page: Page, storyId: string, theme: Theme) {
  await page.goto(
    `/iframe.html?id=${storyId}&viewMode=story&globals=theme:${theme}`,
  );
  await expect(page.locator("#storybook-root")).toBeVisible();
  const expectedTheme = theme === "light" ? "light" : null;
  await expect
    .poll(() =>
      page.evaluate(() =>
        document.documentElement.getAttribute("data-theme"),
      ),
    )
    .toBe(expectedTheme);
  // Fonts loading mid-screenshot is the classic source of 1px diffs.
  await page.evaluate(() => document.fonts.ready);
}

/**
 * Wait until every Motion (JS) enter animation has finished. Motion drives
 * opacity through inline style, so an element still mid-animation has an
 * inline opacity below 1. CSS-only transitions are not covered here — they
 * are frozen at their end state by `animations: "disabled"` at screenshot
 * time. Deliberately state-driven, not a fixed wait.
 */
async function waitForMotionSettled(page: Page) {
  await page.waitForFunction(() => {
    for (const el of document.querySelectorAll<HTMLElement>("*")) {
      const opacity = el.style.opacity;
      if (opacity !== "" && Number(opacity) < 1) return false;
    }
    return true;
  });
}

async function screenshot(page: Page, name: string) {
  await expect(page).toHaveScreenshot(`${name}.png`, {
    animations: "disabled",
  });
}

interface StaticCase {
  name: string;
  story: string;
  /** True when the story mounts with a Motion enter animation to settle. */
  motion?: boolean;
}

const STATIC_CASES: StaticCase[] = [
  { name: "avatar-all-sizes", story: "components-avatar--all-sizes" },
  { name: "button-all-variants", story: "components-button--all-variants" },
  { name: "card-playground", story: "components-card--playground" },
  {
    name: "dialog-open",
    story: "components-dialog--open",
    motion: true,
  },
  { name: "input-playground", story: "components-input--playground" },
  { name: "input-with-error", story: "components-input--with-error" },
  { name: "select-with-value", story: "components-select--with-value" },
  { name: "switch-checked", story: "components-switch--checked" },
  { name: "switch-playground", story: "components-switch--playground" },
  { name: "tabs-playground", story: "components-tabs--playground" },
];

for (const theme of THEMES) {
  for (const shot of STATIC_CASES) {
    test(`${shot.name} — ${theme}`, async ({ page }) => {
      await openStory(page, shot.story, theme);
      if (shot.motion) {
        await expect(page.getByRole("dialog")).toBeVisible();
        await waitForMotionSettled(page);
      }
      await screenshot(page, `${shot.name}-${theme}`);
    });
  }

  test(`popover-open — ${theme}`, async ({ page }) => {
    await openStory(page, "components-popover--playground", theme);
    await page.getByRole("button", { name: "Options" }).click();
    await expect(page.locator('[aria-label="Popover"]')).toBeVisible();
    await waitForMotionSettled(page);
    await screenshot(page, `popover-open-${theme}`);
  });

  test(`select-open — ${theme}`, async ({ page }) => {
    await openStory(page, "components-select--with-value", theme);
    await page.getByRole("combobox", { name: "Status" }).click();
    await expect(page.getByRole("listbox")).toBeVisible();
    await expect(
      page.getByRole("option", { name: "In review" }),
    ).toBeVisible();
    await screenshot(page, `select-open-${theme}`);
  });

  test(`toast-all-variants — ${theme}`, async ({ page }) => {
    await openStory(page, "components-toast--all-variants", theme);
    for (const variant of ["default", "success", "error", "warning"]) {
      await page.getByRole("button", { name: `Show ${variant}` }).click();
    }
    for (const variant of ["default", "success", "error", "warning"]) {
      await expect(page.getByText(`Toast: ${variant}`)).toBeVisible();
    }
    await waitForMotionSettled(page);
    await screenshot(page, `toast-all-variants-${theme}`);
  });
}
