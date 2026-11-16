# @suprui/demo — Supr UI Demo App (Expo)

The first real React Native consumer of `@suprui/ui-native`. An Expo app that
shows all 10 Supr UI components, each on its own interactive showcase screen.
Dark is the default theme; the header toggle switches to light.

> **On-device rendering is NOT verified here.** There is no Android
> hardware in this environment, so no screen has been seen running on a
> device. The app typechecks and bundles (`expo export`) clean — see
> Verification below. On-device look, layout, animation, and the Select
> option-press flow are the user's step.

## Run it

```bash
npm install            # from the repo root (installs this workspace too)
npm run start --workspace=@suprui/demo   # Expo dev server — open in Expo Go or a dev build
```

Bundle without a device (JS only, no native build):

```bash
npm run export --workspace=@suprui/demo  # expo export --platform android → dist/
```

Typecheck / tests:

```bash
npm run typecheck --workspace=@suprui/demo
npm run test --workspace=@suprui/demo     # Select option-press retry only (see below)
```

## Navigation contract (for the e2e suite)

- Home (`screen-home`) lists all 10 components by name — Button, Input,
  Dialog, Popover, Select, Tabs, Toast, Card, Avatar, Switch — in that
  order. Each row carries `nav-<component>` (e.g. `nav-button`).
- Tapping a name opens that component's showcase screen. Each showcase
  root View carries `screen-<component>` in lowercase
  (`screen-button`, `screen-input`, `screen-dialog`, `screen-popover`,
  `screen-select`, `screen-tabs`, `screen-toast`, `screen-card`,
  `screen-avatar`, `screen-switch`).
- Every showcase renders the real component in an interactive state
  (counters, controlled inputs, open/close flows) — nothing is a static
  screenshot. The back button on every showcase carries `nav-back`.
- The header theme toggle carries `theme-toggle`.

## Version notes (read before upgrading anything)

- **React Native is pinned to 0.82.1** — the version `@suprui/ui-native`
  was built and verified against. Do not upgrade it here; the native
  package's peer range is `^0.82`.
- **No Expo SDK ships React Native 0.82.1.** The official mapping is
  SDK 54 → RN 0.81, SDK 55 → RN 0.83 (reactnative.dev version matrix;
  Expo docs). This app therefore uses **Expo SDK 55 tooling**
  (`expo ~55.0.32`, `@expo/metro-config ~55.0.8`,
  `babel-preset-expo ~55.0.7`) with `react-native` pinned at **0.82.1**
  — the nearest SDK whose New Architecture-only runtime matches RN
  0.82's (RN 0.82 removed the legacy bridge entirely). SDK 55's default
  RN 0.83 was deliberately NOT taken, so the pinned RN version stands.
  If the repo later moves the native package to RN 0.83, this app should
  move to the plain SDK 55 versions with it.
- **Reanimated 4.3.x pinned** (`~4.3.0`, installed 4.3.4) with
  `react-native-worklets 0.8.x` — 4.6.x needs RN 0.83–0.87 and 4.7.x
  needs RN 0.86–0.88, so 4.3.x is the only 4.x line that fits RN 0.82.
  The Babel plugin is `react-native-worklets/plugin`, listed last.
- **TypeScript 5.9 in this workspace only** (`typescript ^5.9.0`,
  nested under `apps/demo/node_modules`). The repo standard is TS 7.0.2,
  but `@expo/cli` 55 evaluates `tsconfig.json` through the project's
  TypeScript module and calls `ts.sys.getCurrentDirectory` — and the TS 7
  native port ships `ts.sys === undefined`, so `expo export` crashes
  before bundling starts. A nested TS 5.9 is what Expo resolves from this
  project root, so the export works; the demo's own `tsc --noEmit` runs
  under that same 5.9. The app source is plain TS with no version-specific
  syntax and was also checked clean under the repo's TS 7.0.2 (one-off
  run, see Verification). If Expo ships a TS 7-compatible CLI, drop this
  pin back to the repo standard.
  has exactly two levels (list → showcase), no deep links, and no other
  navigation need; a router would add `expo-constants`, `expo-linking`,
  and file-based routing for zero benefit here. If deep linking or a
  third level ever appears, revisit.
- **No NativeWind wiring.** Demo screens style from the token theme
  object (`useTheme()` from `@suprui/ui-native`), like the components
  themselves — NativeWind classes resolve to the static dark set and
  cannot switch dark/light at runtime. `nativewind` + `tailwindcss`
  are still declared dependencies because they are peers of
  `@suprui/ui-native`; the `nativewind/babel` plugin is intentionally
  absent. If a screen ever needs Tailwind classes, that wiring is a
  decision, not a drive-by.
- **No `global.css` import.** Same reason: the theme object, not CSS
  variables, drives runtime theming on native.

## Styling rules (same as the repo)

Tokens are the only source of truth. No raw hex, no literal pixel value,
no literal duration in app code — every color/spacing/radius/border/type
value comes from `useTheme()`. No Task Thread (obsidian/champagne)
styling; this is Supr black + cobalt.

## Tests

`test/` holds the demo's Vitest suite (same RNTL harness as
`packages/native`, adapted: `vitest.config.mts` also transforms
`@suprui/ui-native/dist` — the native package ships raw JSX in its dist
files, which Vite cannot parse untransformed).

- `screens.test.tsx` — harness renders; Button showcase renders with
  its contract testID. **Passes.**
- `select-open.test.tsx` — SelectScreen renders and the trigger opens
  the option list. **Passes.**
- `select-press.test.tsx` — the M1-known Select option-press retry.
  **Still untestable, skipped.** Bisect 2026-11-13: render passes, open
  passes, pressing an option hangs (RUN banner, then nothing; killed by
  shell `timeout`, no error, vitest's 20 s testTimeout never fires) —
  the exact M1 signature. To retry, remove `.skip` and run only that
  file under `timeout 90`. The flow needs the on-device check; the
  primitive's own option-press behaviour is covered by
  `@rn-primitives/select`'s own test suite.

Run serialized (native Vitest always serialized on this box):

```bash
npm run test --workspace=@suprui/demo
```

## Verification

- `npm run typecheck --workspace=@suprui/demo` — clean under the
  workspace's TS 5.9.3 (2026-11-13) and also clean under the repo's
  TS 7.0.2 in a one-off run (`../../node_modules/.bin/tsc --noEmit`).
- `npm run export --workspace=@suprui/demo` — `expo export --platform
  android` exit 0 (2026-11-13): 3,139 modules, Android bundle
  `dist/_expo/static/js/android/index-*.hbc` 5,785,057 B. All 11
  contract testIDs (`screen-home` + 10 `screen-<component>`) verified
  present in the bundle, once each.
- `npm run test --workspace=@suprui/demo` — 4 passed, 1 skipped (the
  Select option-press retry), 2026-11-13.
- No raw hex / literal pixel / literal duration in app code (grep audit
  2026-11-13); `#1456F0` appears in the bundle only via the
  `@suprui/tokens` theme object, never in app source.
