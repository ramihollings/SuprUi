/**
 * Storybook test-runner config — axe a11y gate (Milestone 2, workstream 7).
 *
 * Runs axe on EVERY story via the @storybook/addon-a11y + axe-playwright
 * integration. A violation fails the story — never suppress one; fix the
 * component or the story instead.
 *
 * Why the whole document, not `#storybook-root`: Dialog, Popover, Select
 * and Toast render into portals attached to `document.body`, outside
 * `#storybook-root`. Scoping axe to the root would silently skip the
 * overlay content. The test-runner visits the preview iframe directly, so
 * the whole document here is just the story — no Storybook manager chrome.
 *
 * Run: `npx test-storybook --url http://localhost:6006` against a running
 * Storybook (dev server on 6006, or the static build served on 6006).
 * Script line for package.json (coordinator adds it):
 *   "test:storybook": "test-storybook --url http://localhost:6006"
 */
import { checkA11y, injectAxe } from "axe-playwright";
import type { TestRunnerConfig } from "@storybook/test-runner";

const config: TestRunnerConfig = {
  async preVisit(page) {
    await injectAxe(page);
  },
  async postVisit(page) {
    await checkA11y(page, undefined, {
      detailedReport: true,
      detailedReportOptions: { html: true },
      verbose: true,
    });
  },
};

export default config;
