# Supr UI — AGENTS.md

Repo guide for AI agents working in this monorepo. Read this before writing or editing any component, token, or doc. Decisions behind these rules: `decisions.md`.

## What Supr UI is

A design language / component library, MIT licensed, working name **Supr UI**, package `@mrtechnology/ui`.

- **First consumer:** Supr (https://supr.technology) — a dense productivity workspace: SuprOS workspace, SuprCMS publishing, SuprInbox mail. Expect review/approval flows, composers, navigation, and data display.
- **Second consumer:** mr.technology.
- **Brand:** black and cobalt, dark-first. Cobalt primary is `#1456F0` — confirmed from supr.technology's stylesheet (2026-11-13). It lives in exactly one token (`--color-brand`); do not hard-code it anywhere else.
- **Platforms:** web (React + TypeScript) and Android (React Native + TypeScript), from one shared token source of truth. Component export names are identical on web and native.
- **Stack:** shared W3C tokens via Style Dictionary (+ Tokens Studio as the Figma editor); web = shadcn/ui on Base UI primitives (Radix is the fallback if Base UI wobbles) + Tailwind v4; Android = NativeWind + React Native Reusables; Motion on web, Reanimated on Android; Lucide icons (`lucide-react` / `lucide-react-native`); Vitest + Playwright + axe-core.

## Repo layout

```
packages/tokens/     @mrtechnology/tokens — token source of truth (Style Dictionary build)
packages/web/        @mrtechnology/ui — web components
packages/native/     @mrtechnology/ui-native — Android components (same export names as web)
packages/mcp-server/ @mrtechnology/mcp-server — MCP server (stdio; 5 tools + 3 resources)
apps/storybook/      Storybook workshop (a11y addon runs axe in every story)
apps/docs/           Starlight docs site (tokens, components, theming, usage)
apps/demo/           Expo demo app (all 10 native components; on-device vehicle)
figma-plugin/        Figma token sync (Tokens Studio format; regenerate after token changes)
e2e-android/         Maestro Android e2e flows against apps/demo (unrun — no device here)
scripts/             Repo scripts, incl. contrast-audit.mjs (run after any color-token change)
```

Distribution is both npm (public `@mrtechnology` scope, `publishConfig: {access: "public"}`) and a static-hosted shadcn-style registry (`registry.json`, 23 items; suggested host `registry.supr.technology`, undecided). Nothing is published yet — see decisions.md D7. Docs: Storybook workshop + Starlight site (`apps/docs`). MCP server: `packages/mcp-server` (stdio). Figma sync: `figma-plugin/`.

## Install

```bash
npm install @mrtechnology/ui @mrtechnology/tokens
# Android only, instead of @mrtechnology/ui:
npm install @mrtechnology/ui-native @mrtechnology/tokens
```

Peer dependencies (web): React + TypeScript, Tailwind v4, Base UI, `lucide-react`, Motion. Peer dependencies (native): React Native + TypeScript, NativeWind, React Native Reusables, `lucide-react-native`, Reanimated. Do not add a new styling, icon, or motion dependency without a decision recorded in `decisions.md`.

## Tokens — the only source of truth

Tokens live in `packages/tokens/` and are built by Style Dictionary. Never edit generated token output by hand; edit the token source and rebuild. Never put a raw hex, raw pixel value, or raw duration in a component — use a semantic token.

### Web: CSS variables

Import the tokens once, at the app root:

```css
@import "@mrtechnology/tokens/web.css";
```

| Token group | Variables |
|---|---|
| Color | `--color-background`, `--color-surface`, `--color-surface-raised`, `--color-border`, `--color-border-strong`, `--color-text`, `--color-text-muted`, `--color-brand` (`#1456F0`), `--color-brand-hover`, `--color-brand-foreground`, `--color-danger`, `--color-danger-hover`, `--color-danger-solid`, `--color-track`, `--color-success`, `--color-warning`, `--color-focus` |
| Radius | `--radius-sharp` (0), `--radius-rounded` (8px), `--radius-extra-rounded` (16px), `--radius-circular` (9999px) |
| Border width | `--border-none` (0), `--border-thin` (1px), `--border-fat` (2px) |
| Spacing | `0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64` (px) |
| Type | `xs` 12/16, `sm` 14/20, `base` 16/24, `lg` 18/28, `xl` 20/28, `2xl` 24/32, `3xl` 30/36 (font-size/line-height, px); weights `400 / 500 / 600 / 700` |
| Motion | `fast` 120ms, `base` 200ms, `slow` 320ms; ease-out `cubic-bezier(0.22, 1, 0.36, 1)`; springs `gentle { stiffness 260, damping 26 }`, `snappy { stiffness 400, damping 30 }` |

In Tailwind v4, use these via the `@theme` mapping (e.g. `bg-background`, `text-muted`, `rounded-rounded`) — never `bg-[#1456F0]` or any other literal value.

### Native: theme object

```ts
import { theme } from "@mrtechnology/tokens/native";
// theme.dark is the default; theme.light is the light theme.
```

`theme.dark` / `theme.light` each have:

- `colors`: `background`, `surface`, `surfaceRaised`, `border`, `borderStrong`, `text`, `textMuted`, `brand`, `brandHover`, `brandForeground`, `danger`, `dangerHover`, `dangerSolid`, `track`, `success`, `warning`
- `spacing`: steps `0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16`
- `radii`: `sharp`, `rounded`, `extraRounded`, `circular`
- `borderWidth`: `none`, `thin`, `fat`
- `typography`: the type scale above (sizes, line heights, weights)
- `motion`: `durationFast`, `durationBase`, `durationSlow`, `springGentle`, `springSnappy` (same values as the web motion tokens)

Note: the native `colors` object has no `focus` entry — the web `--color-focus` variable has no native counterpart in the token contract. Do not invent one.

## Theming

- **Dark is the default** on both platforms. Ship dark first; light must also work, not just exist.
- **Web:** light theme via `data-theme="light"` on the root element. Dark is the default when the attribute is absent.
- **Native:** use `theme.light` instead of `theme.dark` from `@mrtechnology/tokens/native`.
- Never theme by swapping hex values in a component. Theme by switching the token set.

## Components

Milestone 1 ships exactly these 10, with identical export names on web and native. Do not add an 11th component without a decision. Props listed are the contract — do not invent extra props, and do not rename these.

| Component | Props |
|---|---|
| `Button` | `variant` (`primary` / `secondary` / `outline` / `ghost` / `danger`), `size` (`sm` / `md` / `lg`), `disabled`, `children`, `icon?` |
| `Input` | `label?`, `placeholder`, `value`, `onChange` (web) / `onChangeText` (native), `error?`, `disabled`, `size` |
| `Dialog` | `open`, `onOpenChange`, `title`, `description`, `children`, `actions` |
| `Popover` | `trigger`, `content`, `open`, `onOpenChange`, `side`, `align` |
| `Select` | `options` (`{ label, value }[]`), `value`, `onValueChange`, `placeholder`, `label?`, `disabled` |
| `Tabs` | Compound: `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`; `value`, `onValueChange` |
| `Toast` | `toast({ title, description, variant })` + `<Toaster />` |
| `Card` | Compound: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` |
| `Avatar` | `src?`, `fallback`, `size` (`sm` / `md` / `lg`), `alt` |
| `Switch` | `checked`, `onCheckedChange`, `label?`, `disabled` |

Usage notes:

- `Button` `icon?` takes a Lucide icon. Icon-only buttons must have an accessible label (see Accessibility).
- `Input` `error?` renders the error state and message; an input with an error is still labelled by `label?`.
- `Dialog` `actions` renders the footer actions. `Dialog` and `Popover` are controlled via `open` / `onOpenChange`.
- `Select` `options` are `{ label, value }` objects. Do not pass children as options.
- `Tabs` and `Card` are compound components — use the named subcomponents, not ad-hoc divs/views.
- `Toast` is imperative: call `toast({ title, description, variant })` and render `<Toaster />` once at the app root. Do not render a toast inline.
- `Avatar` `fallback` is shown when `src` is absent or fails to load. `alt` describes the person/image.

## Styling rules

- Tailwind v4 utilities mapped from tokens on both platforms (NativeWind on Android). Semantic tokens only.
- Never use a raw hex, raw rgb, or literal pixel spacing/radius/duration inside a component. If the value you need has no token, add a token in `packages/tokens/` — do not inline it.
- Use `--color-text-muted` for secondary text, `--color-border` for hairlines, `--color-border-strong` only where a border must read as a boundary (e.g. focused/active controls). Do not use `borderStrong` as a default border.
- Radius: `sharp` (0) for flush/dense surfaces, `rounded` (8px) as the default control radius, `extra-rounded` (16px) for cards/panels, `circular` (9999px) for avatars/pills only.
- Density is a Supr requirement (dense workspace): prefer the `sm`/`md` sizes and the smaller spacing steps unless the surface is a primary reading surface.

## Motion rules

- Web: Motion. Native: Reanimated. Never use the other platform's runtime, and never hand-roll a duration or spring.
- Durations come from tokens: `fast` 120ms, `base` 200ms, `slow` 320ms. Default to `base`; `fast` for hover/micro-feedback, `slow` only for larger transitions (dialog/popover enter).
- Easing: ease-out `cubic-bezier(0.22, 1, 0.36, 1)` unless a spring is specified.
- Springs come from tokens: `gentle { stiffness 260, damping 26 }` (default), `snappy { stiffness 400, damping 30 }` (responsive controls: Switch, Tabs indicator, Button press).
- Respect reduced-motion preferences on web; on native, respect the platform reduced-motion setting. Motion must never be the only signal for a state change.

## Accessibility rules

- Every interactive component must be keyboard-operable (web) with a visible focus indicator using `--color-focus`. No `outline: none` without a replacement focus style.
- Icon-only controls (e.g. a `Button` with only `icon`) must have an accessible label.
- `Input` with `error?` must expose the error to assistive technology; `Switch` and `Select` must expose their state; `Dialog` must trap focus and return it on close; `Tabs` must support arrow-key navigation.
- Color is never the only signal: `danger` / `success` / `warning` states pair color with text or an icon.
- Contrast must hold in both themes, dark and light — **in every state, including hover/pressed** (D22). Filled buttons use a solid darker token for hover/pressed, never opacity. The Switch unchecked track is `--color-track` (`track` on native) with no border. A semantic token whose roles need opposite contrast directions must split (`danger` vs `danger-solid` / `danger-hover`).
- **Gate:** after any color-token change, run `node scripts/contrast-audit.mjs` — it must report 0 non-exempt failures (disabled states are WCAG-exempt and are reported, not hidden). Full report: `CONTRAST-AUDIT.md`.
- **Gate:** axe-core clean in Storybook and CI. A new axe violation fails the build — fix it, do not suppress it. The Storybook test-runner (`npm run test:storybook` in `apps/storybook`, against a dev server on port 6006) is 33 stories / 0 violations; the light-theme axe pass has not been run yet. Playwright covers web interaction + visual regression (`npm run test:visual`, 26 baselines, 27 total with smoke); Android e2e is Maestro (`e2e-android/`, suite unrun — no device/emulator/Java here).
- **Stale-dist trap:** Storybook tests `dist/`, not `src/` — rebuild token/web/native dist before running Storybook tests after any `src` edit. Never run a Storybook rebuild concurrently with the visual regression suite.

## Testing

- Vitest for unit + component tests; Playwright for web interaction + visual regression; axe-core as the CI a11y gate; Maestro for Android e2e (suite in `e2e-android/`, unrun here).
- Native Vitest parallel run hangs on this box — always run native tests serialized (`--fileParallelism=false`).
- Full matrix (M2): tokens 10, web 38, native 39 serialized, demo 4 passed + 1 skipped, MCP 10; `tsc` clean all workspaces; Storybook build; Playwright smoke 1 + visual 26 (27 total); test-runner 33 stories / 0 violations; docs build; `npm run registry:validate`; `node scripts/contrast-audit.mjs` 0 non-exempt failures.
- Every component ships with tests for its props, its disabled/error states, and its keyboard behaviour (web). Do not ship an untested component.

## DO / DO NOT

**DO**

- Use semantic tokens for every color, spacing, radius, border width, type size, and motion value.
- Use the same export name on web and native for the same component.
- Build on Base UI (web) / React Native Reusables (native) primitives — do not re-implement focus, keyboard, or dismissal behaviour.
- Use Lucide icons, and only Lucide icons, in components.
- Keep dark the default and verify every change in both themes.
- Re-run the contrast audit after any color-token change, and regenerate the Figma sync artifacts (`node figma-plugin/scripts/sync-tokens.mjs` + verify) after any token change.
- Run Vitest + axe before calling a component done.

**DO NOT**

- Do not use raw hex, literal spacing, or literal durations in components.
- Do not invent component APIs, prop names, or token names — if it is not in this file or `skills/supr-ui/SKILL.md`, it does not exist.
- Do not add a component, dependency, or platform without a decision in `decisions.md`.
- Do not put sideload-only, Task Thread-only, or Thread-design-language (obsidian/champagne) styling in this repo — that look belongs to Task Thread, not Supr UI.
- Do not hard-code `#1456F0` anywhere except the `--color-brand` token definition.
- Do not suppress axe violations or ship a component that is not keyboard-operable.
- Do not run a Storybook rebuild concurrently with the visual regression suite.
