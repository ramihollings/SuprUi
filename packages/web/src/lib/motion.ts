/**
 * Motion values for the Motion runtime, mirroring the token source of truth
 * (`tokens/motion.json`, built into `@suprui/tokens`). Durations are seconds
 * here because Motion takes seconds; the values are the token values
 * (120ms / 200ms / 320ms). Kept in sync by `src/lib/motion.test.ts` —
 * do not change a value here without changing the token.
 */
export const motionDurations = {
  /** Token `motion.duration.fast` — 120ms. Hover / micro-feedback. */
  fast: 0.12,
  /** Token `motion.duration.base` — 200ms. Default transition. */
  base: 0.2,
  /** Token `motion.duration.slow` — 320ms. Larger transitions (dialog/popover enter). */
  slow: 0.32,
} as const;

/** Token `motion.easing.ease-out` — cubic-bezier(0.22, 1, 0.36, 1). */
export const motionEaseOut = [0.22, 1, 0.36, 1] as const;

/** Token `motion.spring.gentle` — stiffness 260, damping 26. */
export const motionSpringGentle = { stiffness: 260, damping: 26 } as const;

/** Token `motion.spring.snappy` — stiffness 400, damping 30. */
export const motionSpringSnappy = { stiffness: 400, damping: 30 } as const;
