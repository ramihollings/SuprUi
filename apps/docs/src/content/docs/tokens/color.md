---
title: Color
description: The Supr color tokens — the cobalt ramp, the black ramp, and the semantic colors in both themes. Values below are the token definitions; in code, always reference the token, never the value.
---

Supr is black + cobalt. The brand blue lives in exactly one token
(`--color-brand`); it is never hard-coded anywhere else. All color in a
component or a consuming app comes from these tokens — use the semantic
names (`--color-background`, `--color-text-muted`, …) in code, never the
values listed here.

## Cobalt ramp

Cobalt primary is step `500`. Step `600` is the brand-hover color in both
themes — white text on step `400` was 4.02:1, below AA 4.5:1, so dark no
longer uses it as brand-hover (see `CONTRAST-AUDIT.md`).

| Step | Token | Value |
| --- | --- | --- |
| 50 | `--color-cobalt-50` | `#E8EEFE` |
| 100 | `--color-cobalt-100` | `#D0DDFC` |
| 200 | `--color-cobalt-200` | `#A1BBF9` |
| 300 | `--color-cobalt-300` | `#729AF6` |
| 400 | `--color-cobalt-400` | `#4378F3` |
| 500 | `--color-cobalt-500` | `#1456F0` |
| 600 | `--color-cobalt-600` | `#1045C0` |
| 700 | `--color-cobalt-700` | `#0C3490` |
| 800 | `--color-cobalt-800` | `#082260` |
| 900 | `--color-cobalt-900` | `#041130` |

## Black ramp

The black ramp backs both themes: the low steps are the dark theme's
surfaces and borders, the high steps are the light theme's.

| Step | Token | Value |
| --- | --- | --- |
| 0 | `--color-black-0` | `#000000` |
| 100 | `--color-black-100` | `#0A0A0A` |
| 200 | `--color-black-200` | `#141414` |
| 300 | `--color-black-300` | `#1F1F1F` |
| 400 | `--color-black-400` | `#262626` |
| 500 | `--color-black-500` | `#404040` |
| 600 | `--color-black-600` | `#525252` |
| 700 | `--color-black-700` | `#737373` |
| 800 | `--color-black-800` | `#A3A3A3` |
| 900 | `--color-black-900` | `#D4D4D4` |
| 1000 | `--color-black-1000` | `#E5E5E5` |
| 1100 | `--color-black-1100` | `#F5F5F5` |
| 1200 | `--color-black-1200` | `#FFFFFF` |

## Semantic colors

These are the tokens components actually use. Dark is the default theme;
light overrides apply under `data-theme="light"` on web, and via
`theme.light` on native.

| Token | Dark | Light |
| --- | --- | --- |
| `--color-background` | `#000000` | `#FFFFFF` |
| `--color-surface` | `#0A0A0A` | `#F5F5F5` |
| `--color-surface-raised` | `#141414` | `#FFFFFF` |
| `--color-border` | `#262626` | `#E5E5E5` |
| `--color-border-strong` | `#404040` | `#D4D4D4` |
| `--color-text` | `#FFFFFF` | `#000000` |
| `--color-text-muted` | `#A3A3A3` | `#525252` |
| `--color-track` | `#737373` | `#737373` |
| `--color-brand` | `#1456F0` | `#1456F0` |
| `--color-brand-hover` | `#1045C0` | `#1045C0` |
| `--color-brand-foreground` | `#FFFFFF` | `#FFFFFF` |
| `--color-danger` | `#EF4444` | `#DC2626` |
| `--color-danger-hover` | `#B91C1C` | `#B91C1C` |
| `--color-danger-solid` | `#DC2626` | `#DC2626` |
| `--color-success` | `#22C55E` | `#16A34A` |
| `--color-warning` | `#F59E0B` | `#D97706` |
| `--color-focus` | `#1456F0` | `#1456F0` |

### Usage

```css
/* Web — Tailwind v4 utilities mapped from these variables */
.my-panel {
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}
```

```tsx
// Web — utility classes
<div className="bg-surface text-text border border-border" />
```

## Native

```ts
import { theme } from "@mrtechnology/tokens/native";

// theme.dark.colors / theme.light.colors:
theme.dark.colors.background; // dark background
theme.dark.colors.brand; // cobalt primary
theme.dark.colors.brandHover; // brand hover (dark)
theme.light.colors.brandHover; // brand hover (light)
```

Native `colors` keys: `background`, `surface`, `surfaceRaised`, `border`,
`borderStrong`, `text`, `textMuted`, `brand`, `brandHover`,
`brandForeground`, `danger`, `dangerHover`, `dangerSolid`, `success`,
`warning`, `track`.

:::caution
The native `colors` object has **no `focus` entry** — the web
`--color-focus` variable has no native counterpart in the token contract.
Do not invent one.
:::

## Rules

- Use `--color-text-muted` for secondary text, `--color-border` for
  hairlines, `--color-border-strong` only where a border must read as a
  boundary (e.g. focused/active controls). Do not use `border-strong`
  as a default border.
- `danger` / `success` / `warning` states pair color with text or an
  icon — color is never the only signal.
- Contrast must hold in every state, not just rest — see
  `CONTRAST-AUDIT.md`. Hover/pressed feedback on a filled button uses a
  solid darker token (`danger-hover`), never an opacity multiplier. The
  unchecked Switch track uses `--color-track` with no border.
