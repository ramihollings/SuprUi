# Supr UI — Android e2e (Maestro)

End-to-end smoke + interaction flows for the Supr UI demo app (`apps/demo/`),
written in Maestro YAML. Maestro drives the real app on a device or emulator
as a black box: no test code inside the demo app, no native build changes —
the flows only need the demo app to honour the contract below.

> **Status 2026-11-13: UNRUN.** The suite was written against the real demo
> app (all flows verified against `apps/demo/src` on disk — every `testID`
> and label used below exists in the demo source) and YAML-validated in
> this sandbox, but never executed: there is no device or emulator here
> (`adb devices` is empty, no emulator package, no AVDs, no `/dev/kvm`),
> and no Java (Maestro CLI requires Java 17+). The demo app itself is
> built (Expo, `technology.supr.demo`); only the first live run is owed.
> See [Running](#running) for exactly what the user must do to run it.

## Tool pick — Maestro

D11 named Vitest + Playwright + axe for web and left Android e2e open
("Maestro is the usual pick"). The pick is **Maestro**.

| | Maestro | Detox |
|---|---|---|
| Repo | [mobile-dev-inc/Maestro](https://github.com/mobile-dev-inc/maestro) | [wix/Detox](https://github.com/wix/detox) |
| Stars (GitHub API, 2026-11-13) | **16,399** | 12,057 |
| Forks | 1,022 | 1,903 |
| License | Apache-2.0 | MIT |
| Last push (2026-11-13) | 2026-11-13 | 2026-11-02 |
| Test language | YAML flows | JavaScript / Jest |
| App changes needed | None (black box; only `testID`s) | Native build integration: Detox config + Gradle setup + a test build of the app |
| RN versions | Any (drives the UI, not the runtime) | Officially RN 0.77–0.84 (our repo pins RN 0.82.1, so it would fit) |

Why Maestro wins for this repo:

- **Zero changes to `apps/demo/`.** This workstream is forbidden from writing
  into the demo app, and Detox requires exactly that — Gradle wiring and a
  Detox-aware build. Maestro needs only the `testID`s the demo app already
  renders (`nav-*`, `screen-*`, and the per-screen state IDs).
- **YAML is readable by everyone on the team**, including whoever writes the
  next showcase screen; a new component screen is a few lines of YAML.
- **More stars, actively maintained** (pushed today at pick time), Apache-2.0
  is permissive; the license difference vs Detox (MIT) is immaterial for a
  test runner that never ships inside the app.
- Detox's real advantage — gray-box sync with the JS thread, which kills a
  class of timing flakes — matters most for large suites. For a 10-screen
  showcase suite, Maestro's built-in retry-on-every-step covers the same
  ground. If the suite ever grows past smoke coverage or flakes appear,
  re-evaluate Detox then; the flows' selectors (`testID`s) transfer 1:1.

## Prerequisites

- Java 17+ (`java -version`) — the Maestro CLI is a Java program.
- Maestro CLI: `curl -fsSL "https://get.maestro.mobile.dev" | bash`
  (macOS alternative: `brew install maestro`). Verify with `maestro --version`.
- Android SDK with `adb` on `PATH`, plus **one** of:
  - a booted Android emulator (API 34+ recommended), or
  - a physical device with USB debugging on (`adb devices` must list it).
- The demo app built and installed on that device/emulator:
  `cd apps/demo && npx expo run:android` (or install the built APK with
  `adb install <apk>`). The flows launch it by package name — see below.

## Running

```bash
cd e2e-android
./run.sh                 # runs every flow in flows/, in order
./run.sh flows/02-button.yaml   # one flow
```

`run.sh` checks for `maestro`, a connected device, and the installed app,
then runs `maestro test -e APP_ID=<package> flows/…`.

The demo app's Android package is `technology.supr.demo` (from
`apps/demo/app.json`). If it ever changes, override it — do not edit
the flow files:

```bash
APP_ID=com.example.other ./run.sh
# or, for a direct Maestro invocation:
maestro test -e APP_ID=com.example.other flows/02-button.yaml
```

Every flow starts with `launchApp: { clearState: true }`, so flows are
independent and can be run in any order or alone.

## Flows

| Flow | Covers |
|---|---|
| `flows/01-home.yaml` | Launch; home lists all 10 components by name |
| `flows/02-button.yaml` | Open Button screen; tap Primary; press count goes 0 → 1 |
| `flows/03-select.yaml` | Open Select screen; change value Cobalt → Black |
| `flows/04-switch.yaml` | Open Switch screen; toggle off → on → off |
| `flows/05-input-dialog.yaml` | Input screen: type "Hello Supr", echo shows it; Dialog screen: open, confirm via Publish, count goes 0 → 1 |
| `flows/06-tabs-toast.yaml` | Tabs screen: switch to Details, panel + active-tab line update; Toast screen: fire the Success toast, "Published" appears |
| `flows/07-popover-card-avatar.yaml` | Popover screen: open, pick Duplicate, picked line updates; Card screen: Open inbox, count goes 0 → 1; Avatar screen: "SK" and "JT" fallbacks show |
| `flows/08-all-screens.yaml` | Smoke: visit all 10 screens, assert each `screen-<component>` root |

Selectors: `testID` first (`{ id: "…" }`) — navigation uses the demo's
`nav-<component>` row IDs and `nav-back`; visible text second (Maestro text
selectors are regexes matched against the whole element text, so e.g.
`tapOn: "Primary"` matches exactly that button). No coordinate taps
anywhere; no sleeps — Maestro retries each step until it succeeds or
times out.

## Demo-app contract (verified on disk 2026-11-13)

Every `testID` and label below was read from `apps/demo/src` — the flows
do not invent any. Home rows carry `nav-<component>` (`nav-button` …
`nav-switch`); every showcase root carries `screen-<component>`; every
showcase has an in-app back button `nav-back` ("All components").

| Screen | Interaction (real `testID` / text) | Behaviour the flow asserts |
|---|---|---|
| `screen-home` | Rows `nav-button` … `nav-switch` | All 10 component names visible. |
| `screen-button` | Button text `Primary`; count `button-press-count` | Tap Primary → count reads "Pressed 1 time" (starts "Pressed 0 times"). |
| `screen-select` | Trigger shows current value (`Cobalt`); options `Cobalt` / `Black` / `Paper`; value `select-value` | Tap `Cobalt`, tap `Black` → "Selected: Black". |
| `screen-switch` | Switch label text `Email notifications`; state `switch-state` | Starts "Email notifications: Off"; each tap on the label flips it Off → On → Off. |
| `screen-input` | Field placeholder `e.g. Supr HQ`; echo `input-echo` | Typing "Hello Supr" shows "You typed: Hello Supr". (Typed text is 10 chars, so the 1–2-char error never fires.) |
| `screen-dialog` | Button `Open dialog`; title `Publish workspace?`; actions `Cancel` / `Publish`; count `dialog-confirm-count` | Tap Publish → dialog closes, count reads "Confirmed 1 time". |
| `screen-tabs` | Triggers `Overview` / `Details` / `Settings`; state `tabs-value` | Tap `Details` → panel "Details: members, activity, and storage." shows, "Active tab: details". |
| `screen-toast` | Buttons `Default` / `Success` / `Error` / `Warning` | Tap `Success` → toast titled `Published` appears. Asserted immediately — toasts auto-dismiss. |
| `screen-popover` | Trigger `Open popover`; content heading `Quick actions`; options `Duplicate` / `Archive`; picked `popover-picked` | Tap `Duplicate` → popover closes, "Picked: Duplicate". |
| `screen-card` | Button `Open inbox`; count `card-open-count` | Tap → "Opened 1 time". |
| `screen-avatar` | Fallback texts `SK` (×3) and `JT` (broken `src`) | Both fallback initials visible. |

## Validating without a device

```bash
python3 scripts/validate-flows.py   # parses every flow: valid YAML, known
                                     # Maestro commands, no coordinate taps,
                                     # screen IDs all in the 10-component set
npm run validate                    # same thing via the package script
```

This checks syntax and selector discipline only — it does not run the app.

## Known limits / first-run checks

- **Never executed** (see status note at the top). First green run on a real
  device/emulator is still owed.
- **React Native `<Modal>` / portal caveat.** Maestro reads the Android view
  hierarchy; content rendered inside a React Native `<Modal>` has
  historically been invisible to it. The Dialog, Popover, and Select
  overlays render through `@rn-primitives/portal` (`<PortalHost />` at the
  app root), and the Toast through `<Toaster />` at the root — if any of
  those assertions fail on first run while the overlay is visibly on
  screen, that is the likely cause, not a broken component. Fix options,
  in order: (1) check whether the primitive renders inline in the
  showcase (then it just works); (2) drop the overlay assertion and keep
  the trigger tap; (3) ask the demo workstream to render the showcase
  overlay inline.
- **Home list scrolling.** The home list holds 10 items; Maestro auto-scrolls
  scrollable views while searching for an element, so no explicit scroll steps
  are in the flows. If a tap ever misses on a small screen, add a `scroll`
  step before it rather than coordinates.
- **House rules respected:** no raw hex, no raw pixel values, no raw durations
  anywhere in the flows (Maestro defaults handle all timing); dark is the
  demo app's default theme, light is not exercised here — theme coverage
  belongs to Storybook/Playwright, not this suite.
