import { cleanup } from "@testing-library/react";
import { afterEach, expect } from "vitest";
import * as matchers from "vitest-axe/matchers";

// Register vitest-axe's `toHaveNoViolations` matcher once, for every test
// file. Every interactive component's axe check goes through it, so a
// failure prints the rule, the offending nodes, and the fix guidance
// instead of a bare `violations: [...]` array diff.
expect.extend(matchers);

// jsdom has no PointerEvent constructor, but Base UI dispatches one in its
// click path (Switch, Select, ...). Alias it to MouseEvent so those
// handlers run in tests the way they do in a real browser.
if (typeof window !== "undefined" && typeof window.PointerEvent === "undefined") {
  window.PointerEvent = window.MouseEvent as unknown as typeof PointerEvent;
}

// Vitest runs with `globals: false`, so Testing Library's auto-cleanup
// (which hooks the global `afterEach`) never registers. Clean up explicitly
// so renders from one test cannot leak into the next.
afterEach(() => {
  cleanup();
});
