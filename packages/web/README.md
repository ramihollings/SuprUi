# @suprui/ui

Supr UI web components — black + cobalt, dark-first. shadcn-style ownable
components built on [Base UI](https://base-ui.com) primitives, styled with
Tailwind v4 and the shared `@suprui/tokens` token set. MIT licensed.

> Cobalt primary `#1456F0` (confirmed from supr.technology's stylesheet, 2026-11-13). It lives in one token in `@suprui/tokens` (`tokens/color.json`); it is never hard-coded in this package.

## Install

```bash
npm install @suprui/ui @suprui/tokens
```

Peer dependencies: `react ^19`, `react-dom ^19`. Runtime dependencies are
bundled with the package: `@base-ui/react`, `lucide-react`, `motion`,
`class-variance-authority`, `clsx`, `tailwind-merge`.

## Setup

Import the stylesheet once, at the app root. It pulls in Tailwind v4 and the
token CSS variables, and maps tokens to utilities (`bg-background`,
`text-text-muted`, `border-border`, `bg-brand`, `rounded-rounded`, …).

```css
/* src/index.css */
@import "@suprui/ui/styles.css";
```

If you use PostCSS, this package ships `postcss.config.json` wiring
`@tailwindcss/postcss` (that is the documented choice; `@tailwindcss/vite`
works the same way if your app is Vite-based — the CSS itself is identical).

## Usage

```tsx
import { Button, Dialog, Input, Toaster, toast } from "@suprui/ui";

function App() {
  return (
    <>
      <Toaster />
      <Button onClick={() => toast({ title: "Saved", variant: "success" })}>
        Save
      </Button>
    </>
  );
}
```

### Theming

Dark is the default. Light theme: set `data-theme="light"` on the root
element. Utilities resolve through CSS variables, so the theme switches
without rebuilding:

```html
<html data-theme="light">
```

Never hard-code colors in consuming code either — use the same token-mapped
utilities (`bg-surface`, `text-text`, `border-border`, `bg-brand`,
`text-danger`, …). Motion durations come from tokens too (`duration-base`
is 200ms, `duration-fast` 120ms, `duration-slow` 320ms).

## Components

| Component | Description |
| --- | --- |
| `Button` | `variant`: primary / secondary / outline / ghost / danger; `size`: sm / md / lg; `disabled`; `icon?` (Lucide node). Icon-only buttons need an `aria-label`. |
| `Input` | `label?`, `placeholder`, `value`, `onChange(value)`, `error?` (renders the error state + message), `disabled`, `size`: sm / md / lg. |
| `Dialog` | Controlled: `open`, `onOpenChange`; `title`, `description?`, `children`, `actions?` (footer). Focus is trapped while open. |
| `Popover` | Controlled: `open`, `onOpenChange`; `trigger`, `content`, `side` (top / bottom / left / right), `align` (start / center / end). |
| `Select` | `options` (`{ label, value }[]`), `value`, `onValueChange`, `placeholder?`, `label?`, `disabled?`. |
| `Tabs` | Compound: `Tabs` (`value`, `onValueChange`), `TabsList`, `TabsTrigger` (`value`), `TabsContent` (`value`). Arrow-key navigation built in. |
| `Toast` | Imperative: `toast({ title, description?, variant? })` where `variant` is default / success / error / warning. Render `<Toaster />` once at the app root. |
| `Card` | Compound: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`. |
| `Avatar` | `src?`, `fallback`, `size`: sm / md / lg, `alt`. Fallback shows when `src` is absent or fails to load. |
| `Switch` | `checked`, `onCheckedChange`, `label?`, `disabled?`. |

Export names are identical to the native package (`@suprui/ui-native`) — the
same component, same props, on both platforms.

## Accessibility

Every interactive component is keyboard-operable with a visible focus
indicator (`--color-focus`). Automated axe checks run in Vitest for every
interactive component (Button, Input, Dialog, Popover, Select, Tabs,
Switch) plus Toast — zero violations is the gate. Color is never the only signal:
danger / success / warning states pair color with text or an icon.

## Development

```bash
npm run typecheck   # tsc --noEmit (covers src, including tests)
npm test            # vitest run (component + axe tests, jsdom)
npm run build       # tsc -p tsconfig.build.json — emits declarations + JS to dist/
```

The build uses a separate `tsconfig.build.json` (same settings, tests
excluded) so test files are typechecked but never shipped in `dist/`.
Test-only dev dependencies are `axe-core` (a11y assertions via `axe.run`)
and `@testing-library/user-event` (keyboard/pointer interactions).

To verify the Tailwind/token wiring by hand, compile the stylesheet and
check a utility resolves through the token variable:

```bash
npx tailwindcss -i src/styles.css -o /tmp/supr-ui-web.css
grep -A2 '\.bg-brand {' /tmp/supr-ui-web.css
# .bg-brand { background-color: var(--color-brand); }
```

Two environment notes, verified 2026-11-13:

- The repo root's `tailwindcss` is v3.4.19 (another workstream's dep);
  this package's v4.3.5 is nested under `packages/web/node_modules`, and
  the standalone v4 CLI lives in the separate `@tailwindcss/cli` package
  (not installed). The check above was run through the installed
  `@tailwindcss/postcss` plugin instead, with identical output.
- `@import "@suprui/tokens/web.css"` resolves in exports-aware tooling
  (Node, Vite), but `postcss-import` (used by the Tailwind CLI and
  `@tailwindcss/postcss`) resolves with `resolve@1.22`, which does not
  honour the tokens package's `exports` map for that subpath — the tokens
  package has no literal `web.css` at its root, only `dist/web.css`.
  The wiring proof above therefore compiled the identical stylesheet with
  the import pointed at the literal `dist/web.css`. A one-line
  `packages/tokens/web.css` re-export (`@import "./dist/web.css";`) would
  close the gap for PostCSS-based consumers; that file belongs to the
  tokens workstream.

## Primitives

Behavior comes from `@base-ui/react` v1 — Dialog, Popover, Select, Tabs,
Switch, Toast, Avatar are all Base UI parts, so no Radix fallback was
needed. Motion comes from `motion/react`; icons from `lucide-react`.
