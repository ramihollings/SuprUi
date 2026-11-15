/**
 * Playwright — smoke + visual regression (Milestones 1 + 2).
 *
 * Serves the built Storybook (`storybook-static/`, produced by
 * `npm run build-storybook`) on localhost:6006 and runs two suites
 * against it. Headless, Chromium only.
 *
 * - `tests/smoke.spec.ts` — workshop loads, all 10 component stories are
 *   listed, no console errors.
 * - `tests/visual/` — screenshot baselines for all 10 components in dark
 *   and light themes (Milestone 2, D11). Baselines live in
 *   `tests/visual/__snapshots__/` (see `snapshotPathTemplate` below).
 *   Regenerate them with `playwright test tests/visual --update-snapshots`
 *   after an intentional visual change — never hand-edit a baseline.
 */
import { defineConfig } from "@playwright/test";

const port = Number(process.env.PORT ?? 6006);

export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  // Visual baselines: one file per case + theme, e.g.
  // tests/visual/__snapshots__/button-all-variants-dark.png
  snapshotPathTemplate: "{testDir}/visual/__snapshots__/{arg}{ext}",
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: `http://localhost:${port}`,
    trace: "on-first-retry",
  },
  webServer: {
    command: "node tests/serve-static.mjs",
    port,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
