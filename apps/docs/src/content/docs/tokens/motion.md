---
title: Motion
description: Token durations, the ease-out curve, and the two springs — shared by Motion on web and Reanimated on Android.
---

Motion values are tokens, shared by both platforms. The runtime differs
— Motion on web, Reanimated on Android — but the values never do. Never
hand-roll a duration or a spring.

## Durations

| Token | Value | Use |
| --- | --- | --- |
| `--motion-duration-fast` | `120ms` | Hover / micro-feedback |
| `--motion-duration-base` | `200ms` | Default duration |
| `--motion-duration-slow` | `320ms` | Larger transitions (dialog / popover enter) |

Web: `duration-fast`, `duration-base`, `duration-slow`. Native:
`theme.motion.durationFast`, `theme.motion.durationBase`,
`theme.motion.durationSlow`.

Default to `base`; `fast` for hover/micro-feedback; `slow` only for larger
transitions (dialog/popover enter).

## Easing

| Token | Value |
| --- | --- |
| `--motion-ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` |

Easing is ease-out unless a spring is specified. Web: the `ease-out`
utility. Native: there is **no `easeOut` counterpart** in
`theme.motion` — do not invent one.

## Springs

| Token | Stiffness | Damping | Use |
| --- | --- | --- | --- |
| Gentle | `260` | `26` | Default spring |
| Snappy | `400` | `30` | Responsive controls: Switch, Tabs indicator, Button press |

Native: `theme.motion.springGentle`, `theme.motion.springSnappy`.

## Rules

- Web: Motion. Native: Reanimated. Never use the other platform's
  runtime, and never hand-roll a duration or spring.
- Respect reduced-motion preferences on web; on native, respect the
  platform reduced-motion setting.
- Motion must never be the only signal for a state change.
