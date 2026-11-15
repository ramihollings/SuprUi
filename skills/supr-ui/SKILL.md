# Supr UI

---
name: supr-ui
description: Build interfaces with Supr UI — the black-and-cobalt, dark-first design system for Supr (and mr.technology). Use when adding or editing any UI in a Supr app, choosing a component, applying Supr tokens, theming, motion, or checking accessibility. Covers the 10 components, the shared token system, the web (React) and Android (React Native) implementations, plus the docs site, MCP server, and Figma sync.
---

## When to use

- Use this skill whenever you build, restyle, or fix UI for Supr (https://supr.technology — SuprOS workspace, SuprCMS publishing, SuprInbox mail) or mr.technology.
- Use it instead of guessing at colors, spacing, radii, motion, or component APIs. If a component, prop, or token is not listed here, it does not exist — do not invent it.
- Do not use this skill for Task Thread's design language (obsidian/champagne, "Thread" avatar). That look belongs to Task Thread, not Supr UI.

## Background

Supr UI is MIT licensed, working name **Supr UI**, package `@mrtechnology/ui`. Brand: black and cobalt, dark-first. Cobalt primary is `#1456F0` — confirmed from supr.technology's stylesheet (2026-11-13).

- **Web:** React + TypeScript, Tailwind v4, shadcn/ui on Base UI primitives (Radix is the fallback), `lucide-react`, Motion.
- **Android:** React Native + TypeScript, NativeWind, React Native Reusables, `lucide-react-native`, Reanimated.
- **Tokens:** shared W3C tokens via Style Dictionary (+ Tokens Studio as the Figma editor), package `@mrtechnology/tokens`. Component export names are identical on web and native.
- **Testing / a11y:** Vitest + Playwright + axe-core (web) + Maestro Android e2e (suite in `e2e-android/`, unrun — no device here); Storybook test-runner 33 stories / 0 violations; Playwright visual baselines 26 (13 cases × dark/light); contrast audit via `node scripts/contrast-audit.mjs` (0 non-exempt failures).
- **Monorepo:** `packages/tokens` (`@mrtechnology/tokens`), `packages/web` (`@mrtechnology/ui`), `packages/native` (`@mrtechnology/ui-native`), `apps/storybook`, `apps/docs` (Starlight), `apps/demo` (Expo), `packages/mcp-server` (stdio MCP), `figma-plugin`, `e2e-android`.

## Install

```bash
npm install @mrtechnology/ui @mrtechnology/tokens
# Android only, instead of @mrtechnology/ui:
npm install @mrtechnology/ui-native @mrtechnology/tokens
```

Import tokens once, at the app root. Web:

```css
@import "@mrtechnology/tokens/web.css";
```

Native:

```ts
import { theme } from "@mrtechnology/tokens/native";
```

## Instructions

1. Pick the component from the catalog below — do not build a one-off control when a catalog component fits.
2. Use only the props listed for that component, with the exact prop names given.
3. Style only with semantic tokens (see Token reference). Never use a raw hex, literal spacing, or literal duration in a component.
4. Use Lucide icons only. An icon-only `Button` must have an accessible label.
5. Keep dark the default; verify every change in the light theme too.
6. Motion: Motion on web, Reanimated on native, durations/springs from tokens only.
7. Check accessibility (see Accessibility requirements) and run Vitest + axe before finishing.

## Token reference

### Colors (web CSS variables)

| Token | Notes |
|---|---|
| `--color-background` | App background (black in dark theme) |
| `--color-surface` | Cards, panels, inputs |
| `--color-surface-raised` | Elevated surfaces (menus, dialogs) |
| `--color-border` | Default hairline border |
| `--color-border-strong` | Borders that must read as a boundary |
| `--color-text` | Primary text |
| `--color-text-muted` | Secondary text |
| `--color-brand` | Cobalt primary — `#1456F0` |
| `--color-brand-hover` | Brand hover state |
| `--color-brand-foreground` | Text/icons on a brand background |
| `--color-danger` | Destructive / error (text, border, icon) |
| `--color-danger-solid` | Filled danger background (e.g. danger Button) |
| `--color-danger-hover` | Danger hover/pressed background |
| `--color-track` | Switch unchecked track |
| `--color-success` | Success |
| `--color-warning` | Warning |
| `--color-focus` | Visible focus indicator (web only — see note below) |

Use them in Tailwind v4 via the `@theme` mapping (e.g. `bg-background`, `text-muted`, `border-border`, `bg-brand`, `text-brand-foreground`). Never write `bg-[#1456F0]` or any other literal color. Never hard-code `#1456F0` anywhere except the `--color-brand` token definition.

### Colors (native theme object)

`theme.dark` / `theme.light` (from `@mrtechnology/tokens/native`) each have `colors` with exactly these keys: `background`, `surface`, `surfaceRaised`, `border`, `borderStrong`, `text`, `textMuted`, `brand`, `brandHover`, `brandForeground`, `danger`, `dangerHover`, `dangerSolid`, `track`, `success`, `warning`.

Note: native `colors` has **no `focus` key** — `--color-focus` is web-only in the token contract. Do not invent a native `focus` color.

### Spacing

- Web: `0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64` (px).
- Native: `theme.*.spacing` steps `0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16`.

### Radii

| Token | Value | Use |
|---|---|---|
| `--radius-sharp` / `radii.sharp` | `0` | Flush / dense surfaces |
| `--radius-rounded` / `radii.rounded` | `8px` | Default control radius |
| `--radius-extra-rounded` / `radii.extraRounded` | `16px` | Cards / panels |
| `--radius-circular` / `radii.circular` | `9999px` | Avatars / pills only |

### Border widths

| Token | Value |
|---|---|
| `--border-none` / `borderWidth.none` | `0` |
| `--border-thin` / `borderWidth.thin` | `1px` |
| `--border-fat` / `borderWidth.fat` | `2px` |

### Type scale

Sizes are font-size/line-height in px: `xs` 12/16, `sm` 14/20, `base` 16/24, `lg` 18/28, `xl` 20/28, `2xl` 24/32, `3xl` 30/36. Weights: `400 / 500 / 600 / 700`. On native these live under `theme.*.typography`.

### Motion

- Durations: `fast` 120ms, `base` 200ms, `slow` 320ms. Default to `base`; `fast` for hover/micro-feedback; `slow` only for larger transitions (dialog/popover enter).
- Ease-out: `cubic-bezier(0.22, 1, 0.36, 1)`.
- Springs: `gentle { stiffness 260, damping 26 }` (default), `snappy { stiffness 400, damping 30 }` (responsive controls: Switch, Tabs indicator, Button press).
- Native: `theme.*.motion` has `durationFast`, `durationBase`, `durationSlow`, `springGentle`, `springSnappy` — the same values as above.

## Theming

- **Dark is the default** on both platforms. Ship dark first; light must also work.
- **Web:** light theme via `data-theme="light"` on the root element. Dark is the default when the attribute is absent.
- **Native:** use `theme.light` instead of `theme.dark` from `@mrtechnology/tokens/native`.
- Never theme by swapping hex values in a component. Theme by switching the token set.

## Component catalog

Milestone 1 ships exactly these 10 components, with identical export names on web and native. Props listed are the contract — do not invent extra props or rename these.

### Button

Props: `variant` (`primary` / `secondary` / `outline` / `ghost` / `danger`), `size` (`sm` / `md` / `lg`), `disabled`, `children`, `icon?` (a Lucide icon).

```tsx
import { Button } from "@mrtechnology/ui";
import { Plus } from "lucide-react";

<Button variant="primary" size="md" icon={<Plus />}>
  New document
</Button>
<Button variant="danger" size="sm" disabled>Delete</Button>
```

### Input

Props: `label?`, `placeholder`, `value`, `onChange` (web) / `onChangeText` (native), `error?`, `disabled`, `size`.

```tsx
import { Input } from "@mrtechnology/ui";

<Input
  label="Title"
  placeholder="Untitled document"
  value={title}
  onChange={(e) => setTitle(e.target.value)}
  error={titleError}
/>
```

On native, use `onChangeText` instead of `onChange`: `onChangeText={setTitle}`. `error?` renders the error state and message.

### Dialog

Props: `open`, `onOpenChange`, `title`, `description`, `children`, `actions`.

```tsx
import { Dialog, Button } from "@mrtechnology/ui";

<Dialog
  open={open}
  onOpenChange={setOpen}
  title="Publish document?"
  description="This will make the document visible to your workspace."
  actions={
    <>
      <Button variant="ghost">Cancel</Button>
      <Button variant="primary">Publish</Button>
    </>
  }
>
  <p>Review the changes before publishing.</p>
</Dialog>
```

`Dialog` is controlled via `open` / `onOpenChange`. `actions` renders the footer actions.

### Popover

Props: `trigger`, `content`, `open`, `onOpenChange`, `side`, `align`.

```tsx
import { Popover, Button } from "@mrtechnology/ui";

<Popover
  trigger={<Button variant="outline">Options</Button>}
  content={<p>Popover content goes here.</p>}
  open={open}
  onOpenChange={setOpen}
  side={side}
  align={align}
/>
```

`Popover` is controlled via `open` / `onOpenChange`. `side` and `align` position the popover relative to `trigger`.

### Select

Props: `options` (`{ label, value }[]`), `value`, `onValueChange`, `placeholder`, `label?`, `disabled`.

```tsx
import { Select } from "@mrtechnology/ui";

<Select
  label="Status"
  placeholder="Choose a status"
  options={[
    { label: "Draft", value: "draft" },
    { label: "In review", value: "review" },
    { label: "Published", value: "published" },
  ]}
  value={status}
  onValueChange={setStatus}
/>
```

`options` are `{ label, value }` objects. Do not pass children as options.

### Tabs

Compound: `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`. Props: `value`, `onValueChange` (on `Tabs`).

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@mrtechnology/ui";

<Tabs value={tab} onValueChange={setTab}>
  <TabsList>
    <TabsTrigger value="write">Write</TabsTrigger>
    <TabsTrigger value="review">Review</TabsTrigger>
  </TabsList>
  <TabsContent value="write">Editor goes here.</TabsContent>
  <TabsContent value="review">Review queue goes here.</TabsContent>
</Tabs>
```

Use the named subcomponents — do not build tabs from ad-hoc divs/views.

### Toast

API: `toast({ title, description, variant })` + `<Toaster />`.

```tsx
import { toast, Toaster } from "@mrtechnology/ui";

// Render once, at the app root:
<Toaster />;

// Anywhere else, call imperatively:
toast({ title: "Saved", description: "Your changes are saved.", variant });
```

Do not render a toast inline. `variant` selects the toast style; do not invent variant names outside the component's own contract.

### Card

Compound: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`. No additional props are defined in the Milestone 1 contract — compose with the subcomponents.

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button } from "@mrtechnology/ui";

<Card>
  <CardHeader>
    <CardTitle>Q3 launch plan</CardTitle>
    <CardDescription>Review status and open approvals.</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Three approvals are still pending.</p>
  </CardContent>
  <CardFooter>
    <Button variant="primary">Open review</Button>
  </CardFooter>
</Card>
```

### Avatar

Props: `src?`, `fallback`, `size` (`sm` / `md` / `lg`), `alt`.

```tsx
import { Avatar } from "@mrtechnology/ui";

<Avatar src={user.avatarUrl} fallback="AK" size="md" alt="A. Khan" />
```

`fallback` is shown when `src` is absent or fails to load. `alt` describes the person/image.

### Switch

Props: `checked`, `onCheckedChange`, `label?`, `disabled`.

```tsx
import { Switch } from "@mrtechnology/ui";

<Switch
  label="Email notifications"
  checked={emailOn}
  onCheckedChange={setEmailOn}
/>
```

## Accessibility requirements

- Every interactive component must be keyboard-operable (web) with a visible focus indicator using `--color-focus`. No `outline: none` without a replacement focus style.
- Icon-only controls (e.g. a `Button` with only `icon`) must have an accessible label.
- `Input` with `error?` must expose the error to assistive technology; `Switch` and `Select` must expose their state; `Dialog` must trap focus and return it on close; `Tabs` must support arrow-key navigation.
- Color is never the only signal: `danger` / `success` / `warning` states pair color with text or an icon.
- Contrast must hold in both themes, dark and light — **in every state, including hover/pressed**. Filled buttons use a solid darker token for hover/pressed, never opacity. The Switch unchecked track is `--color-track` (`track` on native) with no border. A semantic token whose roles need opposite contrast directions must split (`danger` vs `danger-solid` / `danger-hover`). After any color-token change, run `node scripts/contrast-audit.mjs` — it must report 0 non-exempt failures (full report: `CONTRAST-AUDIT.md`).
- **Gate:** axe-core clean in Storybook and CI. A new axe violation fails the build — fix it, do not suppress it.

## DO / DO NOT

**DO**

- Use semantic tokens for every color, spacing, radius, border width, type size, and motion value.
- Use the same export name on web and native for the same component.
- Build on Base UI (web) / React Native Reusables (native) primitives — do not re-implement focus, keyboard, or dismissal behaviour.
- Use Lucide icons, and only Lucide icons, in components.
- Keep dark the default and verify every change in both themes.
- Re-run the contrast audit (`node scripts/contrast-audit.mjs`) after any color-token change, and regenerate the Figma sync artifacts after any token change.
- Run Vitest + axe before calling a component done.

**DO NOT**

- Do not use raw hex, literal spacing, or literal durations in components.
- Do not invent component APIs, prop names, or token names — if it is not in this skill or `AGENTS.md`, it does not exist.
- Do not add a component, dependency, or platform without a decision in `decisions.md`.
- Do not put sideload-only, Task Thread-only, or Thread-design-language (obsidian/champagne) styling in this repo.
- Do not hard-code `#1456F0` anywhere except the `--color-brand` token definition.
- Do not suppress axe violations or ship a component that is not keyboard-operable.
