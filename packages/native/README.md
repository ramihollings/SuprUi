# @suprui/ui-native

Supr UI for Android — the black + cobalt design language as React Native
components. Same export names as `@suprui/ui` (web), same token source of
truth (`@suprui/tokens`). Dark-first; light works too.

> **Code-verified only — no device, no on-device rendering verified.**
> This package was verified with `tsc` and Vitest + React Native Testing
> Library in Node only. There is no Android hardware in this environment,
> so no component has been seen running on a device. Treat on-device look,
> layout, and animation as unverified until someone runs it on hardware.

## Install

```bash
npm install @suprui/ui-native @suprui/tokens
```

Peer dependencies (installed by the consuming app): `react ^19`,
`react-native ^0.82`, `nativewind ^4.2.7`, `react-native-reanimated 4.3.x`,
`react-native-worklets 0.8.x`, `tailwindcss ^3.4.0`.

> **Reanimated version note (deviation from the brief):** the brief asked
> for a `react-native-reanimated ^4` peer. Reanimated 4.7.1 requires
> React Native 0.86–0.88 and 4.6.x requires 0.83–0.87, while 4.3.x
> requires RN 0.81–0.85 — so with RN 0.82 the peer is pinned to `4.3.x`
> (installed 4.3.4) and `react-native-worklets 0.8.x` is an extra peer
> (Reanimated 4 depends on it). `tailwindcss ^3.4.0` is also a peer:
> stable NativeWind v4 requires Tailwind v3 (see below).

## Usage

```tsx
import { ThemeProvider, Button, Input, Toaster, toast } from '@suprui/ui-native';
import { PortalHost } from '@rn-primitives/portal';

export default function App() {
  return (
    <ThemeProvider mode="dark">
      <PortalHost />
      <Button variant="primary" onPress={() => toast({ title: 'Saved' })}>
        Save
      </Button>
      <Toaster />
    </ThemeProvider>
  );
}
```

### PortalHost

`Dialog`, `Popover`, and `Select` render their overlay content into a
portal. Mount `<PortalHost />` once at the app root (from
`@rn-primitives/portal`), or their content has nowhere to mount.

### Theming

Components style from the token theme object (`useTheme()`), never from
raw values. Dark is the default; opt into light once at the root:

```tsx
<ThemeProvider mode="light">…</ThemeProvider>
```

`useTheme()` returns `theme.dark` by default and `theme.light` inside a
light provider. The `theme` object and its types are re-exported from
`@suprui/tokens/native` (`theme.dark` / `theme.light`).

## NativeWind setup (consumer screens)

The components in this package do **not** style themselves with
NativeWind classes — they style from the `theme` object. That is
deliberate: NativeWind's CSS variables are static at build time and
there is no `data-theme` equivalent on React Native, so class-based
colours cannot switch dark/light at runtime; the theme object can.

`src/global.css` and `tailwind.config.js` are still shipped for
**consumer screens** that want the same token utilities
(`bg-background`, `text-text-muted`, `border-border`, `bg-brand`,
`rounded-rounded`, …). Note that those utilities always resolve to the
dark token set — runtime light/dark switching belongs to the components,
not to the classes.

Setup in the consuming app (bare React Native; Expo differs only in the
Metro wrapper):

```js
// babel.config.js
module.exports = {
  presets: [['module:metro-react-native-babel-preset', { jsxImportSource: 'nativewind' }]],
  plugins: ['nativewind/babel'],
};
// metro.config.js
const { withNativeWind } = require('nativewind/metro');
module.exports = withNativeWind(config, { input: './global.css' });
```

```tsx
// App entry point
import '@suprui/ui-native/global.css';
```

Copy `tailwind.config.js` from this package into the app (or merge its
`theme.extend` into the app's own config) and point its `content` at
the app's source.

> **NativeWind v4 wiring (deviation from the brief):** the brief
> suggested CSS-first `@theme` wiring. That belongs to Tailwind v4 /
> NativeWind v5 (preview at the time of writing). Stable NativeWind v4
> pairs with Tailwind CSS v3: `tailwind.config.js` + `nativewind/preset`,
> `@tailwind base/components/utilities` in `global.css`, and the
> `nativewind/babel` preset with `jsxImportSource: "nativewind"`.
> Verified against NativeWind's own docs (2026-11-13). When the system
> moves to NativeWind v5, `global.css` becomes an
> `@import "tailwindcss"` + `@theme inline` file and the config file
> goes away; the token variables it references do not change.

## Components

All ten export names are identical to the web package. Black/cobalt
theme; motion uses token durations (fast 120ms / base 200ms / slow
320ms) and springs (gentle `{stiffness 260, damping 26}`, snappy
`{stiffness 400, damping 30}`) via Reanimated for Dialog, Popover, and
Toast.

| Component | Props (the contract) |
|---|---|
| `Button` | `variant` primary/secondary/outline/ghost/danger, `size` sm/md/lg, `disabled`, `children`, `icon?` |
| `Input` | `label?`, `placeholder`, `value`, `onChangeText`, `error?`, `disabled`, `size` sm/md/lg |
| `Dialog` | `open`, `onOpenChange`, `title`, `description`, `children`, `actions?` |
| `Popover` | `trigger`, `content`, `open`, `onOpenChange`, `side` top/bottom/left/right, `align` start/center/end |
| `Select` | `options` `{label, value}[]`, `value`, `onValueChange`, `placeholder`, `label?`, `disabled` |
| `Tabs` (compound) | `Tabs` (`value`, `onValueChange`), `TabsList`, `TabsTrigger` (`value`), `TabsContent` (`value`) |
| `Toast` | `toast({title, description, variant: default/success/error/warning})` + `<Toaster />` |
| `Card` (compound) | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` |
| `Avatar` | `src?`, `fallback`, `size` sm/md/lg, `alt` |
| `Switch` | `checked`, `onCheckedChange`, `label?`, `disabled` |

Notes on the implementations:

- **Primitives:** all seven `@rn-primitives/*` packages used exist
  (dialog, popover, select, tabs, toast, avatar, switch — all 1.5.2 —
  plus slot/portal/types/hooks as transitive pieces). Nothing had to
  be implemented from scratch: `Toast`'s imperative `toast()` +
  `<Toaster />` queue is custom code built on top of the toast
  primitive (the primitive itself is presentational), and `Card` has
  no primitive — it is layout.
- **`Button` gains three props the web contract does not list**
  (documented deviation): `onPress` (the native equivalent of the
  web Button's inherited `onClick`), `accessibilityLabel` (required
  for icon-only buttons per the repo a11y rules), and `ref`
  (forwarded to the Pressable — needed when a Button is a Popover
  trigger via `asChild`, since the primitive attaches imperative
  open/close to the ref).
- **Dialog** traps focus and returns it on close (via the primitive);
  its scrim is the background token at 0.6 opacity (no scrim token
  exists — black veil in dark, white veil in light).
- **Popover** `side="left" | "right"` are accepted for web parity but
  fall back to `"bottom"`: the primitive natively supports only
  top/bottom. The primitive's Root is uncontrolled — the wrapper syncs
  controlled `open` through the Trigger ref.
- **Toast** auto-dismisses after 4000 ms. That lifetime has **no
  token** — the token set defines motion durations, not a toast
  lifetime (documented gap).
- **Danger text** uses `brandForeground` (white in both themes) as
  text-on-danger; no on-danger token exists.
- **Native theme gaps** (from the token contract, not this package):
  no `focus` colour and no `easeOut` motion natively (web-only), and
  the typography `fontFamily` is a web stack string — not usable as a
  React Native font family, so components use the platform system font.

## Verification

Run from `packages/native/`:

```bash
npm install        # succeeds
npm run typecheck  # tsc --noEmit — clean
npm run build      # tsc -p tsconfig.json — emits dist/
npm test           # vitest run
```

Last full run (2026-11-13): **39 tests passed, 0 failed, 11 files** —
theme (7), button (5), input (3), dialog (3), popover (3), select (5),
tabs (3), toast (3), card (1), avatar (3), switch (3). `tsc --noEmit`
clean; `npm run build` succeeds and emits `dist/` (`index.js` /
`index.d.ts`, `theme.*`, `components/*`).

`import { theme } from "@suprui/tokens/native"` is asserted in
`test/theme.test.tsx` (dark/light values for background, surface,
border, text, brand, danger, success, warning, spacing, radii,
typography, motion).

## Test harness notes

Vitest + React Native Testing Library v14 (on the `test-renderer`
package) works, but only with test-only infrastructure in `test/` —
none of it ships:

- **`test/rn-register.ts`** — a Babel require-hook installed before
  anything imports `react-native`. React Native ships Flow types in
  its published source, which Node cannot parse; the hook compiles
  `react-native` (and `@rn-primitives`) files with
  `@react-native/babel-preset`. It also prefers `.android.*` platform
  files (mirroring Metro), sets `__DEV__`, and stubs the native
  module registries (`nativeModuleProxy`, `__turboModuleProxy`) so
  imports do not throw `__fbBatchedBridgeConfig is not set`.
- **`vitest.config.ts`** — a Vite plugin that transforms
  `react-native` source with the RN preset and `@rn-primitives/*`
  ESM builds with Flow-strip + JSX only (module syntax deliberately
  left intact). That last point matters: converting the primitives to
  CJS makes Vite hand them to Node's native `require`, which creates
  a **second copy of the portal's zustand store** — a `Portal`
  registered from a primitive's internal require then never reaches a
  `PortalHost` loaded through the runner, so Dialog / Popover /
  Select content never appears. The ESM-preserving transform is the
  fix (diagnosed 2026-11-13 with a probe: a Portal imported in the
  test file rendered; a Dialog primitive's Portal did not).
- **`test/setup.ts`** — hand-mocks `react-native-reanimated` (the
  published mock requires its own TS sources, which Vitest cannot
  load) and `react-native-svg`, and patches `TestInstance.prototype
  .measure` with a zero-rect double: the test renderer's host refs
  have no `measure` method, but the primitives call
  `triggerRef.current.measure(...)` on press and for content
  positioning. The patch is applied through RNTL's own `render`
  (RNTL loads `test-renderer` through Node's `require`, a different
  module instance from a direct Vite import — patching the wrong copy
  silently does nothing).
- **RNTL v14 quirks the tests work around:** `fireEvent` is async
  and must be awaited; `getByPlaceholderText` only matches host
  elements named exactly `TextInput`, but on Android the host renders
  as `AndroidTextInput`, so Input tests use `getByLabelText` instead;
  `fireEvent.press` on a Text bubbles to the Pressable via the fiber
  chain.
- **Known test warnings:** the toast tests log a few "not wrapped in
  act(...)" warnings — the 4000 ms auto-dismiss timer fires after the
  test's act scope. Warnings only; the tests pass.
- **Known gap — Select option press:** pressing an option inside the
  portal list is not covered. The value change itself lands (verified
  in a scratch probe: the controlled value re-rendered to the new
  option), but under Vitest + RNTL 14 the press's `act()` never
  settles and the tree is empty afterwards — the run hangs with no
  error, no timeout, and no pending timers. The open flow and the
  value→label mapping are tested instead; the primitive's own
  option-press behaviour is covered by `@rn-primitives/select`'s own
  test suite, and the flow needs an on-device check.
