---
title: Spacing, radius & borders
description: The 4pt spacing scale, the four radii, and the three border widths — shared by web and native.
---

## Spacing

A 4pt scale. Steps are named by their multiplier, not their pixel value:
step `4` is the fourth step, and its value follows from the scale.

| Step | Token | Value |
| --- | --- | --- |
| 0 | `--spacing-0` | `0px` |
| 1 | `--spacing-1` | `4px` |
| 2 | `--spacing-2` | `8px` |
| 3 | `--spacing-3` | `12px` |
| 4 | `--spacing-4` | `16px` |
| 5 | `--spacing-5` | `20px` |
| 6 | `--spacing-6` | `24px` |
| 8 | `--spacing-8` | `32px` |
| 10 | `--spacing-10` | `40px` |
| 12 | `--spacing-12` | `48px` |
| 16 | `--spacing-16` | `64px` |

Web: Tailwind maps these to the spacing utilities (`p-4`, `gap-2`,
`mt-6`, …) through the `@theme` mapping in the token CSS. Native:
`theme.dark.spacing[4]` (and `theme.light.spacing[4]` — same values),
with keys `0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16`.

Density is a Supr requirement (dense workspace): prefer the smaller
spacing steps unless the surface is a primary reading surface.

## Radius

| Token | Value | Use |
| --- | --- | --- |
| `--radius-sharp` | `0px` | Flush / dense surfaces |
| `--radius-rounded` | `8px` | Default control radius |
| `--radius-extra-rounded` | `16px` | Cards / panels |
| `--radius-circular` | `9999px` | Avatars / pills only |

Web: `rounded-sharp`, `rounded-rounded`, `rounded-extra-rounded`,
`rounded-circular`. Native: `theme.radii.sharp`, `theme.radii.rounded`,
`theme.radii.extraRounded`, `theme.radii.circular`.

## Border width

| Token | Value | Use |
| --- | --- | --- |
| `--border-none` | `0px` | No border |
| `--border-thin` | `1px` | Default hairline — pair with `--color-border` |
| `--border-fat` | `2px` | Heavier boundary where one is needed |

Web: `border-thin`, `border-fat` (via the `--border-width-*` theme
mapping). Native: `theme.borderWidth.none`, `theme.borderWidth.thin`,
`theme.borderWidth.fat`.
