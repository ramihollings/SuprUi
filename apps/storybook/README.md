# Supr UI — Storybook

Storybook workshop for the **web** package only (`@suprui/ui`). Native
(`@suprui/ui-native`) is out of scope here — Storybook is web-only in
Milestone 1.

## Run

```bash
# from the repo root (installs + links the workspace packages)
npm install
npm run storybook --workspace=@suprui/storybook
# or: cd apps/storybook && npm run storybook
```

Opens the workshop at http://localhost:6006.

## Build

```bash
npm run build-storybook --workspace=@suprui/storybook
```

The production build is the Milestone 1 gate: it must exit 0. Output goes
to `apps/storybook/storybook-static/`.

## Stories ↔ components

Every story imports the real component from `@suprui/ui` (workspace
dependency, resolved to `packages/web/dist/`). No component code is copied
into this app.

| Story file | Component |
| --- | --- |
| `src/stories/Button.stories.tsx` | `Button` — all 5 variants, 3 sizes, disabled, icon, icon-only |
| `src/stories/Input.stories.tsx` | `Input` — label, error, disabled, 3 sizes |
| `src/stories/Dialog.stories.tsx` | `Dialog` — open / closed, with and without footer actions |
| `src/stories/Popover.stories.tsx` | `Popover` — all 4 sides, align end |
| `src/stories/Select.stories.tsx` | `Select` — options, selected value, disabled |
| `src/stories/Tabs.stories.tsx` | `Tabs` — compound Tabs / List / Trigger / Content |
| `src/stories/Toast.stories.tsx` | `Toast` — all 4 variants via `toast()` + `<Toaster />` |
| `src/stories/Card.stories.tsx` | `Card` — compound Header / Title / Description / Content / Footer |
| `src/stories/Avatar.stories.tsx` | `Avatar` — fallback, 3 sizes, failed-src fallback |
| `src/stories/Switch.stories.tsx` | `Switch` — checked / unchecked / disabled, with label |

## Theming

Dark is the default. Use the **Theme** toolbar toggle (top bar) to switch
to the light theme — it sets `data-theme="light"` on the root element, the
same mechanism consumers use (`AGENTS.md`). Every story is viewable in
both themes; verify contrast in both.

## Accessibility

`@storybook/addon-a11y` is configured in `.storybook/main.ts` and runs
axe in every story (`a11y: { test: "error" }` in `.storybook/preview.ts`).
A violation fails the check — fix it, do not suppress it.

## Styling

Stories use token-mapped Tailwind utilities only (`bg-background`,
`text-text-muted`, `gap-4`, …) — no raw hex, spacing, or durations.
The stylesheet (`src/index.css`) imports `@suprui/ui/styles.css`, which
pulls in Tailwind v4 and the `@suprui/tokens` CSS variables; the
`@tailwindcss/vite` plugin is wired in `.storybook/main.ts` (`viteFinal`).
Because the component classes live in `@suprui/ui`'s built output
(`packages/web/dist/`, gitignored and therefore not auto-scanned by
Tailwind v4), `src/index.css` also carries an explicit
`@source "../../../packages/web/dist";` so every class the real
components use is generated.
