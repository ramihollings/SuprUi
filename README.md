# Supr UI

A design language and component library for **Supr** first, and
[mr.technology](https://mr.technology) second.

Supr UI is one look in two places: web components (React, shadcn/ui on
Base UI primitives) and Android components (React Native, NativeWind +
React Native Reusables), sharing a single token source of truth. It is
dark-first, dense, and built for a productivity workspace — black
backgrounds, cobalt accent, hairline borders, spring motion.

> **Brand color — confirmed 2026-11-13:** the cobalt primary is `#1456F0`, taken from supr.technology's stylesheet.
> See `decisions.md` (D12).

## Supr website design alignment

The live site's identity is the source of truth: pure black, cobalt `#1456F0`, Plus Jakarta Sans for UI copy, JetBrains Mono for technical labels, and pill-shaped public-facing CTAs. The shared workspace defaults stay compact and accessible: 8px controls, subtle borders, 4px spacing, visible keyboard focus. Use `<Button shape="pill">` for marketing CTAs; the default is `shape="control"`. Fonts are not downloaded by the package; consumers supply font assets. See [BRAND-ALIGNMENT.md](BRAND-ALIGNMENT.md) and the Storybook `WebsiteCTAs` example.

## Install

```bash
# Web
npm i @suprui/ui @suprui/tokens

# Android (React Native) — @suprui/ui-native instead of @suprui/ui
npm i @suprui/ui-native @suprui/tokens
```

## Quick usage (web)

Import the tokens once, then use the components. Dark is the default —
no theme setup is needed for the default look.

```css
/* e.g. in your global stylesheet */
@import "@suprui/tokens/web.css";
```

```tsx
import { Button } from "@suprui/ui";

export function Example() {
  return (
    <Button variant="primary" size="md" onClick={() => {}}>
      Deploy
    </Button>
  );
}
```

`Button` variants: `primary` | `secondary` | `outline` | `ghost` |
`danger`. Sizes: `sm` | `md` | `lg`.

## Theming

- **Default: dark.** Black backgrounds, cobalt accent.
- **Light theme (web):** set `data-theme="light"` on the root element.
- **Light theme (native):** use `theme.light` from `@suprui/tokens/native`
  (see below) instead of the default dark theme.

The theme is a token swap, not a rebuild: colors, radius, spacing, and
motion values live in the shared tokens, and components read them.

## Tokens

Tokens are the single source of truth, authored in W3C format (edited in
Figma via Tokens Studio) and built with Style Dictionary into each
platform's format. The token package is `@suprui/tokens`:

- Web: `@suprui/tokens/web.css` — CSS variables, mapped into Tailwind v4
  via `@theme`.
- Native: `{ theme }` from `@suprui/tokens/native`.

Token categories (see `AGENTS.md` for the full token contract; tokens
themselves live in `packages/tokens`):

- **Color** — semantic variables: `--color-background`,
  `--color-surface`, `--color-surface-raised`, `--color-border`,
  `--color-border-strong`, `--color-text`, `--color-text-muted`,
  `--color-brand` (`#1456F0`), `--color-brand-hover`,
  `--color-brand-foreground`, `--color-danger`, `--color-danger-hover`,
  `--color-danger-solid`, `--color-track`, `--color-success`,
  `--color-warning`, `--color-focus` (web only — no native counterpart).
- **Spacing** — 4pt scale: `0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64` (px).
- **Radius** — `--radius-sharp` (0), `--radius-rounded` (8px),
  `--radius-extra-rounded` (16px), `--radius-circular` (9999px).
- **Border width** — `--border-none` (0), `--border-thin` (1px),
  `--border-fat` (2px).
- **Type** — `xs` 12/16 through `3xl` 30/36, weights 400 / 500 / 600 / 700.
- **Motion** — durations `fast` 120ms, `base` 200ms, `slow` 320ms;
  springs `gentle { stiffness 260, damping 26 }`,
  `snappy { stiffness 400, damping 30 }`.

Native mirrors these as `theme.dark` / `theme.light` from
`@suprui/tokens/native` (`colors`, `spacing`, `radii`, `borderWidth`,
`typography`, `motion`). Never hard-code `#1456F0` or any raw hex,
spacing, or duration in a component — use a semantic token.

## Components

Milestone 1 ships ten components, with **identical export names on web
and native**. Each component lives at
`packages/<web|native>/src/components/<kebab>/<PascalCase>.tsx`. Milestone 2
added the docs site (`apps/docs`), the MCP server
(`packages/mcp-server`), the Expo demo app (`apps/demo`), the Figma sync
(`figma-plugin/`), visual regression baselines, and the Maestro e2e suite
(`e2e-android/`) — see `BUILD-REPORT-M2.md`.

| Component | Web | Native | Notes |
| --- | --- | --- | --- |
| `Button` | `@suprui/ui` | `@suprui/ui-native` | Variants `primary`/`secondary`/`outline`/`ghost`/`danger`; sizes `sm`/`md`/`lg`; `disabled`, `children`, `icon?` (Lucide) |
| `Input` | `@suprui/ui` | `@suprui/ui-native` | `label?`, `placeholder`, `value`, `onChange` / `onChangeText`, `error?`, `disabled`, `size` |
| `Dialog` | `@suprui/ui` | `@suprui/ui-native` | `open`, `onOpenChange`, `title`, `description`, `children`, `actions` |
| `Popover` | `@suprui/ui` | `@suprui/ui-native` | `trigger`, `content`, `open`, `onOpenChange`, `side`, `align` |
| `Select` | `@suprui/ui` | `@suprui/ui-native` | `options` (`{ label, value }[]`), `value`, `onValueChange`, `placeholder`, `label?`, `disabled` |
| `Tabs` | `@suprui/ui` | `@suprui/ui-native` | Compound `Tabs` / `TabsList` / `TabsTrigger` / `TabsContent`; `value`, `onValueChange` |
| `Toast` | `@suprui/ui` | `@suprui/ui-native` | `toast({ title, description, variant })` + `<Toaster />` |
| `Card` | `@suprui/ui` | `@suprui/ui-native` | Compound `Card` / `CardHeader` / `CardTitle` / `CardDescription` / `CardContent` / `CardFooter` |
| `Avatar` | `@suprui/ui` | `@suprui/ui-native` | `src?`, `fallback`, size `sm`/`md`/`lg`, `alt` |
| `Switch` | `@suprui/ui` | `@suprui/ui-native` | `checked`, `onCheckedChange`, `label?`, `disabled` |

Full per-component props, variants, and examples live in Storybook
(`apps/storybook`).

## Native usage

```tsx
import { Button } from "@suprui/ui-native";
import { theme } from "@suprui/tokens/native";

// theme.dark is the default; pass theme.light for the light theme.
export function Example() {
  return <Button variant="primary" size="md">Deploy</Button>;
}
```

Native components are styled with NativeWind (Tailwind in React Native)
on React Native Reusables primitives, use `lucide-react-native` icons,
and animate with React Native Reanimated using the shared motion tokens.
Behavior and export names match the web components above; only the
platform-specific props differ where the contract says so
(`onChangeText` instead of `onChange` on `Input`).

## Distribution

Two ways to get Supr UI (D7, hosting decided in M2):

- **npm** — versioned packages `@suprui/ui`, `@suprui/ui-native`, `@suprui/tokens`,
  version `0.1.0` published under `@suprui` on 2026-11-16. Earlier
  `@mrtechnology/*` versions have been superseded. Published tarballs
  and their verified checksums are archived under `backups/npm/`.
- **Registry** — copy-paste via the shadcn-style registry in
  `registry.json` (23 items; `name: supr-ui`, homepage
  <https://supr.technology>), statically hosted (suggested host
  `registry.supr.technology`, undecided). Registry items point at the component
  source files under `packages/web` and `packages/native`, so you own
  the files you copy. Validate with `npm run registry:validate`.

## Repo layout

```
.
├── decisions.md        # The decisions (D1–D26) behind this system — read first
├── AGENTS.md           # Agent interface: how AI agents build with Supr UI correctly
├── LICENSE             # MIT
├── NOTICE              # Third-party attributions
├── README.md           # This file
├── BUILD-REPORT-M1.md  # Milestone 1 build report
├── BUILD-REPORT-M2.md  # Milestone 2 build report
├── CONTRAST-AUDIT.md   # WCAG AA contrast audit (dark + light, all 10 components)
├── registry.json       # shadcn-style registry (23 items: 10 web + 10 native + 3 shared)
├── scripts/            # Repo scripts (contrast audit, registry build/validate)
├── packages/
│   ├── tokens/         # Shared W3C tokens (Style Dictionary + Tokens Studio)
│   ├── web/            # @suprui/ui — web components (shadcn/ui + Base UI + Tailwind v4)
│   ├── native/         # @suprui/ui-native — Android components (NativeWind + RNR)
│   └── mcp-server/     # @suprui/mcp-server — MCP server (stdio; 5 tools + 3 resources)
├── apps/
│   ├── storybook/      # Component workshop (Storybook + axe a11y addon)
│   ├── docs/           # Starlight docs site
│   └── demo/           # Expo demo app (all 10 native components)
├── figma-plugin/       # Figma token sync (Tokens Studio format)
└── e2e-android/        # Maestro Android e2e flows against apps/demo
```

## Links

- Decisions: [decisions.md](decisions.md)
- Agent guide: [AGENTS.md](AGENTS.md)
- Supr: <https://supr.technology>
- mr.technology: <https://mr.technology>

## License

MIT — see [LICENSE](LICENSE). Third-party attributions: see
[NOTICE](NOTICE).
