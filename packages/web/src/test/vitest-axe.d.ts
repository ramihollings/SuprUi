/**
 * vitest-axe matcher types for Vitest 5.
 *
 * vitest-axe 0.1.0 ships `vitest-axe/extend-expect`, but that file augments
 * the `Vi` namespace, which Vitest 5 no longer uses for its `Assertion`
 * interface — so the augmentation would be a no-op here and
 * `toHaveNoViolations()` would fail typecheck. Augment the `vitest`
 * module directly instead (the documented Vitest custom-matcher shape).
 * Runtime registration lives in `./setup.ts`.
 */
import type { AxeMatchers } from "vitest-axe";

declare module "vitest" {
  interface Assertion<T = any> extends AxeMatchers {}
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}
