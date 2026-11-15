# @mrtechnology/tokens

Supr UI design tokens — black + cobalt, dark-first. The single source of
truth for every color, spacing, radius, border width, type size, and motion
value in Supr UI (web + Android).

## Source

Tokens live in `tokens/` at the repo root as W3C DTCG JSON (`$value` /
`$type`, `{...}` references):

| File | Contents |
| --- | --- |
| `tokens/color.json` | Cobalt ramp 50–900, black scale, semantic aliases (dark + light) |
| `tokens/spacing.json` | 4pt scale: 0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64 |
| `tokens/radius.json` | sharp 0, rounded 8px, extra-rounded 16px, circular 9999px |
| `tokens/border.json` | Widths: none 0, thin 1px, fat 2px |
| `tokens/typography.json` | System font stack; sizes xs–3xl; weights 400/500/600/700 |
| `tokens/motion.json` | Durations 120/200/320ms; ease-out; gentle + snappy springs |

**Cobalt primary `#1456F0`** (confirmed from supr.technology's stylesheet, 2026-11-13). It lives in one token: `color.cobalt.500` in `tokens/color.json`. Do not hard-code it anywhere else.

**Dark is the default theme.** Semantic colors resolve to the dark set in
`:root`; the light set lives under `[data-theme="light"]` (web) and
`theme.light` (native).

## Rebuild

```bash
npm install          # from the repo root
npm run build        # from packages/tokens, or the repo root (all workspaces)
```

The build runs Style Dictionary v5 (`style-dictionary.config.mjs`) and then
compiles `dist/native/theme.ts` to `theme.js` + `theme.d.ts` with `tsc`.
Generated output lives in `dist/` (gitignored) — never edit it by hand;
edit the token source and rebuild.

## Outputs

| File | Contents |
| --- | --- |
| `dist/web.css` | `:root` custom properties (dark) + `[data-theme="light"]` overrides + Tailwind v4 `@theme` mapping |
| `dist/native/theme.ts` (+ `.js` / `.d.ts`) | Typed `theme = { dark, light }` object |
| `dist/tokens.json` | Resolved token tree (plain values) for tooling |

## Web

```css
@import "@mrtechnology/tokens/web.css";
```

CSS variables (dark default; light overrides under `[data-theme="light"]`):

- Color: `--color-background`, `--color-surface`, `--color-surface-raised`,
  `--color-border`, `--color-border-strong`, `--color-text`,
  `--color-text-muted`, `--color-brand`, `--color-brand-hover`,
  `--color-brand-foreground`, `--color-danger`, `--color-success`,
  `--color-warning`, `--color-focus`
- Radius: `--radius-sharp`, `--radius-rounded`, `--radius-extra-rounded`,
  `--radius-circular`
- Border width: `--border-none`, `--border-thin`, `--border-fat`
- Spacing: `--spacing-0` … `--spacing-16`
- Motion: `--motion-duration-fast/base/slow`, `--motion-ease-out`

The `@theme` block maps these to Tailwind v4 utilities, so `bg-background`,
`text-text-muted`, `border-border`, `bg-brand`, `text-brand-foreground`,
`rounded-rounded`, `p-4`, `duration-base` etc. work. The `@theme inline`
block references the `:root` variables with `var()`, so switching
`data-theme` updates utilities. Notes:

- `border-none` is **not** mapped in `@theme` — Tailwind's `border-none`
  already means border-style: none. Use the `--border-none` variable
  directly if you need a 0 width.
- The cobalt ramp (`--color-cobalt-50` … `--color-cobalt-900`) and black
  scale (`--color-black-0` … `--color-black-1200`) are also exposed as
  variables/utilities, but components must use the semantic tokens.

## Native

```ts
import { theme } from "@mrtechnology/tokens/native";
// theme.dark is the default; theme.light is the light theme.
```

Each of `theme.dark` / `theme.light` has:

- `colors`: `background`, `surface`, `surfaceRaised`, `border`,
  `borderStrong`, `text`, `textMuted`, `brand`, `brandHover`,
  `brandForeground`, `danger`, `success`, `warning`
  (no `focus` — the web `--color-focus` variable has no native counterpart
  in the token contract)
- `spacing`: steps `0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16` (px numbers)
- `radii`: `sharp`, `rounded`, `extraRounded`, `circular` (px numbers)
- `borderWidth`: `none`, `thin`, `fat` (px numbers)
- `typography`: `fontFamily`, `sizes` (`xs`–`3xl`, each
  `{ fontSize, lineHeight }` in px), `weights`
  (`regular` 400, `medium` 500, `semibold` 600, `bold` 700)
- `motion`: `durationFast` 120, `durationBase` 200, `durationSlow` 320
  (milliseconds), `springGentle` `{ stiffness 260, damping 26 }`,
  `springSnappy` `{ stiffness 400, damping 30 }`
  (the ease-out curve is not in the native object — same contract reason
  as `focus`; it lives in `tokens.json` and in web.css as
  `--motion-ease-out`)

## Brand hover

One step on the cobalt ramp from brand (`500`): **lighter** on dark
(`400`, `#336CBC`) so it reads on black, **darker** on light (`600`,
`#003989`).

## Tests

```bash
npm test        # builds, then runs Vitest (test/tokens.test.ts)
npm run typecheck
```

Tests assert the contract values (cobalt 500, dark background, spacing and
radius scales, both themes, motion values) and that all dist files exist
after a build.
