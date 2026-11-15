---
title: Theming
description: Dark is the default theme on both platforms; light must work, not just exist. Theme by switching the token set, never by swapping values in a component.
---

Dark is the default on both platforms. Ship dark first; light must also
work, not just exist. Never theme by swapping hex values in a component —
theme by switching the token set.

## Web

Light theme: set `data-theme="light"` on the root element. Dark is the
default when the attribute is absent. Utilities resolve through CSS
variables, so the theme switches without rebuilding:

```html
<html data-theme="light">
```

```tsx
// Toggle at runtime — the attribute is all it takes.
document.documentElement.setAttribute("data-theme", "light");
document.documentElement.removeAttribute("data-theme"); // back to dark
```

Use the token-mapped utilities in consuming code too (`bg-surface`,
`text-text`, `border-border`, `bg-brand`, `text-danger`, …) — never
hard-code colors there either. Motion durations come from tokens as well
(`duration-base`, `duration-fast`, `duration-slow`).

## Android (React Native)

Opt into light once at the root with `<ThemeProvider mode="light">`:

```tsx
import { ThemeProvider } from "@mrtechnology/ui-native";

<ThemeProvider mode="light">{/* … */}</ThemeProvider>;
```

`useTheme()` returns `theme.dark` by default and `theme.light` inside a
light provider. The `theme` object is re-exported from
`@mrtechnology/tokens/native` (`theme.dark` / `theme.light`), with the same shape
on both sides:

```ts
import { theme } from "@mrtechnology/tokens/native";

theme.dark.colors.background; // dark background
theme.light.colors.background; // light background
theme.dark.spacing[4]; // spacing step 4
theme.dark.radii.rounded; // default control radius
theme.dark.motion.durationBase; // default duration
```

## Token gaps between platforms

The token contract is shared, but three web-only pieces have no native
counterpart — do not invent one:

- **Focus color.** The web `--color-focus` variable has no entry in the
  native `colors` object.
- **Ease-out.** The web `--motion-ease-out` curve has no native
  counterpart (`theme.motion` carries durations and springs only).
- **Font family.** The typography `fontFamily` token is a web system
  stack string — not usable as a React Native font family, so native
  components use the platform system font.

## Rules

- Use `--color-text-muted` for secondary text, `--color-border` for
  hairlines, `--color-border-strong` only where a border must read as a
  boundary (e.g. focused/active controls). Do not use `border-strong`
  as a default border.
- Radius: `sharp` for flush/dense surfaces, `rounded` as the default
  control radius, `extra-rounded` for cards/panels, `circular` for
  avatars/pills only.
- Density is a Supr requirement (dense workspace): prefer the `sm`/`md`
  sizes and the smaller spacing steps unless the surface is a primary
  reading surface.
