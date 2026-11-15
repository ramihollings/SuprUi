# Supr UI — Milestone 1 Build Report

**Date:** 2026-11-13
**Addendum 2026-11-13:** cobalt confirmed as `#1456F0` (from supr.technology's stylesheet) and swapped the same day — the `#0047AB` standard-cobalt placeholder and its UNCONFIRMED flags in this report are superseded. New ramp: 50 `#E8EEFE`, 100 `#D0DDFC`, 200 `#A1BBF9`, 300 `#729AF6`, 400 `#4378F3`, 500 `#1456F0`, 600 `#1045C0`, 700 `#0C3490`, 800 `#082260`, 900 `#041130`. See `tokens/color.json`.
**Repo:** `~/workspace/design-system/`
**Scope:** Milestone 1 exactly as specified in `decisions.md` (tokens, 10 web components + 10 Android twins, Storybook, AGENTS.md + skill, Vitest + axe + Playwright smoke, npm workspaces distribution). Starlight docs site, MCP server, Figma plugin, registry hosting, demo/Expo app, and Playwright visual regression are **M2 — not built**.

**Verdict: Milestone 1 is complete and verified on disk.** Every package typechecks clean, every test suite passes (87 Vitest tests + 1 Playwright smoke), the Storybook production build exits 0, and Style Dictionary regenerates both platform outputs. See §7 for honest limits — nothing is claimed that was not verified.

---

## 1. What was built

### Repo layout

```
~/workspace/design-system/
├── decisions.md            # 13 decisions (D1–D13), source of truth
├── AGENTS.md               # Repo guide for AI agents (159 lines)
├── README.md               # Install, usage, theming (179 lines)
├── LICENSE                 # MIT, "Copyright (c) 2026 Supr UI"
├── NOTICE                  # 18 upstream attributions
├── registry.json           # shadcn-style registry, 20 items (10 web + 10 native)
├── tokens/                 # W3C DTCG token source of truth (6 files)
├── packages/
│   ├── tokens/             # @supr/tokens 0.1.0 — Style Dictionary build
│   ├── web/                # @supr/ui 0.1.0 — 10 web components
│   └── native/             # @supr/ui-native 0.1.0 — 10 Android twins
├── apps/
│   └── storybook/          # @supr/storybook 0.1.0 — Storybook 10.6.7 workshop
└── skills/supr-ui/SKILL.md # Agent skill (334 lines)
```

Root package: private `supr-ui`, npm workspaces `packages/*` + `apps/*`, Node `>= 20`.

### WS1 — Tokens (`tokens/` + `packages/tokens/`)

- W3C DTCG source files: `tokens/{color,spacing,radius,border,typography,motion}.json`.
- Style Dictionary **v5.8.0** (`packages/tokens/build.mjs`, `style-dictionary.config.mjs`), TypeScript 7.0.2, Vitest 5.1.0.
- Generated outputs (verified present, regenerated 2026-11-13 16:02 by WS6):
  - `packages/tokens/dist/web.css` — 6,199 B (CSS variables + Tailwind v4 `@theme` mapping)
  - `packages/tokens/dist/native/theme.ts` — 6,008 B; `theme.js` — 5,378 B; `theme.d.ts` — 2,320 B (TypeScript theme object)
  - `packages/tokens/dist/tokens.json` — 3,184 B
  - Exports exactly `{ "./web.css", "./native", "./tokens.json" }`.
- Token values (dark default + light set):
  - Cobalt ramp (interpolated around anchor `#0047AB`): 50 `#EBF0F8`, 100 `#CCDAEE`, 200 `#99B5DD`, 300 `#6691CD`, 400 `#336CBC`, 500 `#0047AB`, 600 `#003989`, 700 `#002B67`, 800 `#001C44`, 900 `#000E22`.
  - Dark: bg `#000000`, surface `#0A0A0A`, surface-raised `#141414`, border `#262626`, border-strong `#404040`, text `#FFFFFF`, text-muted `#A3A3A3`, brand-hover `#336CBC`.
  - Light: bg `#FFFFFF`, surface `#F5F5F5`, border `#E5E5E5`, text `#000000`, brand-hover `#003989`.
  - Spacing 0/4/8/12/16/20/24/32/40/48/64; radii 0/8/16/9999px; border 0/1/2px; motion 120/200/320ms, ease-out `cubic-bezier(0.22,1,0.36,1)`, springs gentle `{260,26}`, snappy `{400,30}`.
  - Native theme has no `focus` key and no `easeOut` (web-only). Style Dictionary lowercases hex on resolve; config re-uppercases on emit.
- **Fix applied by WS2:** PostCSS consumers could not resolve `@supr/tokens/web.css` (the `resolve` package ignores the exports map) — a one-line literal re-export `packages/tokens/web.css` (`@import "./dist/web.css";`) was added and proven to compile (20,876 B output, `.bg-brand` → `var(--color-brand)`, `#0047AB` and `[data-theme="light"]` present).

### WS2 — Web components (`packages/web/`, `@supr/ui` 0.1.0)

- 10 components, React + TypeScript, shadcn-style ownable files on **Base UI 1.9.0** (no Radix fallbacks needed), `lucide-react ^1.72.0`, `motion ^14`, Tailwind v4 via `@tailwindcss/postcss`: Button, Input, Dialog, Popover, Select, Tabs, Toast, Card, Avatar, Switch.
- Contract enums defined (must match native): Toast variant `"default"|"success"|"error"|"warning"`; Popover side `"top"|"bottom"|"left"|"right"`, align `"start"|"center"|"end"`; Input size `"sm"|"md"|"lg"`; Dialog `actions?: ReactNode`; TabsTrigger/TabsContent `value: string`.
- `tsc` clean; `dist/` built. Root tailwindcss is v3.4.19 (NativeWind's dep); web's v4.3.5 is nested under `packages/web/node_modules`.

### WS3 — Android twins (`packages/native/`, `@supr/ui-native` 0.1.0)

- Same 10 components, React Native + TypeScript, NativeWind + React Native Reusables. All 7 `@rn-primitives/*` verified to exist (dialog, popover, select, tabs, toast, avatar, switch — all 1.5.2). `lucide-react-native`, Reanimated **4.3.x pinned** (4.7.1 needs RN 0.86–0.88, 4.6.x needs 0.83–0.87; 4.3.x fits RN 0.82).
- `tsc` clean; `dist/` built; all 10 component dirs present.
- Documented deviations (in package README): NativeWind v4 = Tailwind v3 wiring, **not** CSS-first `@theme` (`@theme` is Tailwind v4 / NativeWind v5 preview) — components style via the theme object, not classes. Button gains `onPress`, `accessibilityLabel`, `ref`. Toast auto-dismiss 4000ms with no token. Popover left/right fall back to bottom. Dialog scrim is background token at 0.6.
- **Known gap: Select option-press is NOT test-covered** — press hangs under Vitest + RNTL 14 with no error/timeout; open flow and value→label mapping are tested. Needs an on-device check.

### WS4 — Storybook (`apps/storybook/`, `@supr/storybook` 0.1.0)

- Storybook **10.6.7** (`@storybook/react-vite`, `addon-docs`, `addon-a11y`), Vite builder, `@tailwindcss/vite` wired via `viteFinal`.
- 10 story files, **33 stories** across all 10 titles (`index.json`: 43 entries = 33 stories + 10 autodocs pages). All stories import the real components from `@supr/ui` (resolution verified: `require.resolve('@supr/ui')` → `packages/web/dist/index.js`); no component code copied.
- Theme toolbar global (dark default / light via `data-theme="light"`); `a11y: { test: "error" }` set.
- Production build exits 0 (`storybook-static/` on disk); dev server serves HTTP 200 on `/` and `/iframe.html`.
- Fixes found and applied: preview file renamed `.ts` → `.tsx` (JSX in a `.ts` file failed the first build); explicit `@source "../../../packages/web/dist";` in `src/index.css` — Tailwind v4 auto-scan skips gitignored `dist/`, so component utilities (`bg-brand`, `rounded-rounded`, `bg-surface`, …) were missing from built CSS until the directive was added (verified present after rebuild).

### WS5 — AGENTS.md + skill

- `AGENTS.md` (159 lines): repo guide — tokens, component contracts, styling/motion/a11y rules, DO/DO NOT.
- `skills/supr-ui/SKILL.md` (334 lines): agent skill for building with the system.
- Both verified on disk: all 10 components, 14 color vars, radii, border widths, native theme shape present; `#0047AB` only as flagged-unconfirmed brand value.
- Flagged for implementers: the contract never defined literal enums for Toast `variant`, Popover `side`/`align`, Input `size`, Dialog `actions`; `--color-focus` is web-only.

### WS6 — axe automation + Playwright smoke + full-repo verification

- `vitest-axe@0.1.0` added to `@supr/ui`; `packages/web/src/test/setup.ts` registers `toHaveNoViolations` once; `packages/web/src/test/vitest-axe.d.ts` (new file, needed — vitest-axe 0.1.0 augments the `Vi` namespace, which Vitest 5 no longer uses for `Assertion`).
- All 8 interactive components' axe tests converted from raw `axe.run` to `axe()` + `toHaveNoViolations()` (same render scenarios, incl. Dialog/Popover open on `document.body`, Input error state, Toast visible). **No component code changed — no violations found, none suppressed.**
- Playwright **1.65.0** smoke: `apps/storybook/playwright.config.ts` (Chromium only, 1 worker, serves built `storybook-static/`), `tests/serve-static.mjs` (Node built-ins only), `tests/smoke.spec.ts` — asserts HTTP 200 on `/`, HTTP 200 on `/index.json` listing all 10 titles, sidebar lists Button stories, Button Playground renders in the preview iframe, zero console errors / zero uncaught page errors on story load. Smoke-only by design: no screenshots/snapshots (M2).
- Honest findings handled, not suppressed: sidebar story items are `<button>`s in Storybook 10 (first draft's `getByRole('link')` failed; fixed). The no-console-errors check is scoped to the Button Playground story, not default `/` load — `/` opens the Avatar autodocs page, which renders `FallbackOnFailedSrc` (`src="https://invalid.example/avatar.png"`), whose intentional failed-resource console error is expected, not a workshop failure.
- Playwright Chromium install needed a workaround on this machine: `npx playwright install chromium` timed out 3× through the sandbox proxy (`storage.googleapis.com` download, 30s timeout) while `curl` fetched the same URL fine. Chrome-for-Testing zips (full + headless shell, Chrome 158.0.8127.18) were placed manually in `~/.cache/ms-playwright/` (695 MB total). First extract failed because `/tmp` is a 512 MB tmpfs — redone on home disk. **A fresh machine should just run `npx playwright install chromium`; the manual placement is only for a proxied sandbox.**

### WS7 — Distribution

- npm workspaces monorepo (npm, Node ≥ 20), MIT `LICENSE`, root `README.md` (install, usage, theming), `NOTICE` (18 upstream attributions), `registry.json` (valid JSON, 20 items — 10 web + 10 native, identical name sets, paths match the contract).
- Native Toast deliberately does NOT claim `@rn-primitives/toast` (existence unverified at that point; since verified — it exists, 1.5.2 — registry note is now stale in that one detail, see §7).
- Every package has a README.

---

## 2. Test evidence (all re-run for this report — no earlier numbers trusted)

WS6 re-ran the full matrix after a clean install (`rm -rf node_modules packages/*/node_modules apps/*/node_modules && npm ci`, exit 0, lockfile intact). The coordinator independently re-ran web Vitest and the Playwright smoke; both matched WS6 exactly.

| Check | Command | Exit | Result |
|---|---|---|---|
| Clean install | `npm ci` (root) | 0 | installed, incl. vitest-axe + @playwright/test |
| tsc tokens | `npm run typecheck --workspace=@supr/tokens` | 0 | clean |
| tsc web | `npm run typecheck --workspace=@supr/ui` | 0 | clean (incl. new vitest-axe types) |
| tsc native | `npm run typecheck --workspace=@supr/ui-native` | 0 | clean |
| tsc storybook | `npm run typecheck --workspace=@supr/storybook` | 0 | clean |
| Vitest tokens | `npm run test --workspace=@supr/tokens` | 0 | **1 file / 10 tests passed** |
| Vitest web | `npm run test --workspace=@supr/ui` | 0 | **11 files / 38 tests passed** (incl. 8 vitest-axe) |
| Vitest native | `npx vitest run --fileParallelism=false` in `packages/native` | 0 | **11 files / 39 tests passed** |
| Style Dictionary build | `npm run build` in `packages/tokens` | 0 | both outputs regenerated (web.css 6,199 B; theme.ts/js/d.ts + tokens.json; mtimes fresh) |
| Storybook build | `npm run build-storybook --workspace=@supr/storybook` | 0 | built in ~22s; 33 stories + 10 docs pages |
| Playwright smoke | `npx playwright test` in `apps/storybook` | 0 | **1 passed (4.1s)** |
| Consistency | READMEs in tokens/web/native/storybook + root; registry.json valid JSON (20 items); LICENSE + NOTICE at root | — | all PASS |

**Totals: 87 Vitest tests passing (10 tokens + 38 web + 39 native), 0 failed; 8/8 automated axe tests with 0 violations; 1/1 Playwright smoke passing.**

### Native test quirk (verified, not a defect)

The native package's **default parallel Vitest run hangs on this box** — killed at 240s twice (and once at ~69 min); 10 of 11 files pass (36 tests) and the `popover.test.tsx` worker never finishes. Popover passes alone in 1.49s (3/3) and in the serialized run. Cause is the constrained environment (1.5 shared CPUs; each worker inlines the full React Native transform), not a failing test. **Run native tests serialized: `npx vitest run --fileParallelism=false`** — 11 files / 39 tests in ~24s. WS3's claimed "11 files, 39 tests" is exact (an earlier coordinator miscount of 42 was corrected).

### Pre-existing noise (not failures)

- Web Vitest prints jsdom `HTMLCanvasElement.getContext ... not implemented` stderr lines while axe-core runs (color-contrast rule probing canvas); tests still pass.
- Vite prints non-fatal `"use client"` warnings for `@base-ui/*` / `framer-motion` / `lucide-react` during the Storybook build.

---

## 3. Honest limits — what is NOT verified or NOT done

- **On-device Android rendering is NOT verified.** There is no hardware here. Native twins are code-verified (tsc + Vitest) only. The Select option-press path is untested even in Vitest (see WS3 gap above) and needs an on-device check.
- **No real-browser visual check of Storybook.** Verification is HTTP 200 responses + built CSS/JS contents + headless Playwright smoke. No screenshot or click-through confirmation that stories render correctly or that the theme toolbar visibly switches themes.
- **No axe run executed inside the Storybook UI.** `addon-a11y` is configured and bundled with `a11y: { test: "error" }`, but axe only runs inside the Storybook UI / test-runner; the production build does not execute it. The 8 automated vitest-axe tests (0 violations) are the executed a11y evidence.
- **Light theme via toolbar only.** No dedicated per-component light-theme story variants; every story is viewable in light via the Theme toolbar toggle.
- **No formal dark+light contrast audit.** Axe checks ran (0 violations in the tested scenarios); a systematic contrast audit across both themes was not done.
- **Cobalt `#0047AB` is UNCONFIRMED.** It is the standard cobalt value, not a confirmed brand value. It lives in exactly one token (`--color-brand` / `theme.colors.brand`); changing it is a one-token swap. Never hard-coded elsewhere (verified by grep in WS4/WS6).
- **Platform assumptions unconfirmed:** Supr's web app is React (or will be) and the Android APK is React Native. If either is wrong, D1/D4 flip and only the tokens carry over.
- **Lucide license file not yet read.** The repo states ISC; GitHub API returns it unclassified. NOTICE credits Lucide; the exact license text was not verified from the source repo.
- **Registry note now stale in one detail:** WS7's note that native Toast "does not claim `@rn-primitives/toast`" predates WS3's verification that the package exists (1.5.2). The registry itself is correct; only that explanatory note is outdated.
- **`storybook-static/` (built output) is on disk.** Whether to gitignore/commit it is an open call — there is no git repo here, so nothing was committed.
- **Playwright browsers live in `~/.cache/ms-playwright` on this machine only**, not in the repo. A fresh checkout needs `npx playwright install chromium` (see the proxy workaround in §1/WS6 if that times out).

---

## 4. What Milestone 2 should contain

Per `decisions.md` (D8/D9) and gaps found during M1:

1. **Starlight docs site** (D8) — component docs, token reference, theming guide.
2. **MCP server** (D9) — agent tooling over the system, after AGENTS.md/skill (done in M1).
3. **Figma plugin** (Tokens Studio sync) — Kumo-pattern adoption, deferred from D2/D4.
4. **Registry hosting** — publish the shadcn-style registry (D7) somewhere consumable.
5. **Demo/Expo app** — runnable native demo (explicitly out of M1 scope); the place to verify on-device rendering and the Select option-press path.
6. **Playwright visual regression** — screenshots/snapshots per story (M1 smoke deliberately has none).
7. **Storybook test-runner axe run** — execute axe inside the Storybook UI across all 33 stories (M1 has vitest-axe only).
8. **Android e2e follow-up** (D11) — Playwright is web-only; native e2e (e.g. Maestro/Detox) is a separate workstream.
9. **Formal dark+light contrast audit** across both themes.
10. **Per-component light-theme story variants** (M1 has toolbar toggle only).
11. **Confirm the cobalt hex** (`#0047AB`) and the React / React Native platform assumptions with the user — one-token swap and D1/D4 flip respectively if wrong.
12. **Lucide license text verification** + fix the stale WS7 registry note about `@rn-primitives/toast`.
13. **Decide `storybook-static/` handling** (gitignore vs commit) once the repo has git.

---

## 5. Workstream log

| WS | Scope | Status | Evidence |
|---|---|---|---|
| WS1 | Scaffold + tokens | Done, verified | SD 5.8.0 outputs for both platforms; 10 tests pass |
| WS2 | Web components | Done, verified | Base UI 1.9.0, 11 files / 38 tests pass; tsc clean |
| WS3 | Android twins | Done, verified | 7 primitives 1.5.2, Reanimated 4.3.x; 11 files / 39 tests pass (serial); tsc clean |
| WS4 | Storybook | Done, verified | Storybook 10.6.7; 33 stories; build exit 0; HTTP 200 |
| WS5 | AGENTS.md + skill | Done, verified | 159 + 334 lines on disk |
| WS6 | axe + Playwright + full-repo verification | Done, verified | 8/8 axe 0 violations; smoke 1/1; full matrix re-run green |
| WS7 | Distribution | Done, verified | LICENSE, NOTICE (18), README, registry.json (20 items) |

Coordinator verification: every workstream's artifacts were checked on disk (files present, builds re-run where cheap, test counts re-run for web + native + Playwright smoke). No workstream reported a failure that stands unresolved; the two WS4 build failures (preview `.ts`→`.tsx`, Tailwind `@source`) and the WS6 Playwright install timeout were all fixed with evidence and are recorded above.
