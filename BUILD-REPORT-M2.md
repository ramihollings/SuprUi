# Supr UI — Milestone 2 Build Report

**Date:** 2026-11-14. **Status: complete — 10 of 10 workstreams built and verified on disk.**
Repo: `~/workspace/design-system/`. M1 baseline: 87 Vitest tests, 10 + 10 components, Storybook 33 stories / 10 titles, tokens + web + native, cobalt `#1456F0`.

Milestone 2 adds the distribution and verification layer around those components: docs site, MCP server, Figma sync, registry hosting, demo app, visual regression, axe test-runner, Android e2e, contrast audit, license verification. **No component behavior changed** except the two styling-only fixes the contrast audit required (Button danger colors, Switch track — tokens only, no API/prop changes).

## Verification matrix — re-run personally at assembly (2026-11-14, machine quiet)

| Check | Result |
|---|---|
| Tokens Vitest | **10/10 passed** |
| Web Vitest | **38/38 passed** |
| Native Vitest (serialized, single uninterrupted run) | **39/39 passed** |
| Demo Vitest | **4 passed / 1 skipped** (Select option-press, still untestable — see limits) |
| MCP Vitest | **10/10 passed** |
| `tsc` all workspaces (root `npm run typecheck`) | **clean, exit 0** |
| Web build (`tsc -p tsconfig.build.json`) | **exit 0** |
| Native build (`tsc -p tsconfig.json`) | **exit 0** |
| Tokens build (Style Dictionary) | **exit 0**, dist regenerated |
| MCP build | **exit 0** (via `npm test`) |
| Storybook build | **success** (39s, `storybook-static/`) |
| Playwright smoke + visual | **27 passed** (smoke + 26 visual baselines) |
| Storybook test-runner + axe | **33/33 stories, 0 violations, exit 0** ("No accessibility violations detected!" ×10) |
| Docs build (Astro/Starlight) | **19 pages built** (18 content + 404, Pagefind index) |
| Registry validate | **23 items, all files resolve, all imports covered** |
| Maestro flow validator | **8/8 flows valid, all 22 id selectors exist in `apps/demo/src`** |
| Figma sync verify | **33/33 checks passed** (regenerated from final tokens at assembly) |
| Contrast audit (`node scripts/contrast-audit.mjs`) | **136 pairs, 0 non-exempt failures** |
| Demo `expo export` (Android) | **success, 5.6 MB bundle** (re-run at assembly) |

Root `npm run build` was interrupted by a service restart mid-run (05:06 UTC); every workspace build was verified individually afterwards (table above), so nothing in the matrix depends on that one invocation.

## Per-workstream outcomes

### WS1 — Starlight docs site — DONE
`apps/docs/` (`@supr/docs`, Astro 7.4.12 + Starlight 0.43.1 + sharp 0.35.5): 18 content pages (guides, tokens, all 10 components web + native), 1,239 lines, verified against real sources; build succeeds (19 pages incl. 404, Pagefind index); preview serves 200s. `src/styles/custom.css` maps Starlight vars onto token vars only. Caveats: no live-browser visual check; `site` URL not configured (set once hosting is chosen — the sitemap integration warns about it on every build). The docs reference `CONTRAST-AUDIT.md`, which now exists (WS9).

### WS2 — MCP server — DONE
`packages/mcp-server/` (`@supr/mcp-server` 0.1.0, MIT, private): stdio transport only; 5 tools (`supr_list_tokens`, `supr_get_token`, `supr_list_components`, `supr_get_component`, `supr_guidance`) + 3 resources (`supr://tokens`, `supr://components`, `supr://guidance`); tokens read live from built `@supr/tokens` output; **10/10 Vitest tests pass** (re-run at assembly). SDK license verified: `@modelcontextprotocol/sdk` 1.32.2, **MIT as installed** (Copyright 2024 Anthropic, PBC); GitHub `main` shows an in-progress MIT→Apache-2.0 transition — permissive either way. D9 "check the LICENSE file" flag closed. Limits: no live MCP client has connected yet; no HTTP/SSE by design; `src/data/rules.ts` is a structured summary of AGENTS.md and must be kept in sync with it.

### WS3 — Figma plugin — DONE
`figma-plugin/`: manifest, hand-written `code.template.js` (no token values), generated `code.js` + Tokens Studio `tokens.json` (sets `core`, `semantic-dark`, `semantic-light`) + Variables REST payload, `ui.html`, sync/verify/apply scripts, README. Sync re-run at assembly from the final tokens: **33/33 checks pass**, real values flow through (cobalt ramp, `#1456F0` → `{r:0.0784, g:0.3373, b:0.9412}`). Untested Figma-side (no Figma access; REST writes are Enterprise-only — plugin path is recommended, D18).

### WS4 — Registry hosting — DONE
Decision: **both, no registry server** — public npm under `@supr` scope (each package now has `publishConfig: {access: "public"}`) + static-hosted shadcn-style registry (`registry.json` + generated `registry/r/<slug>.json`, 23 files; suggested host `registry.supr.technology`, undecided). Verdaccio rejected; private packages rejected per D13. **Headline fix: `registry.json` was broken — 44 problems** (uncovered relative imports `../../lib/utils`, `../../lib/motion`, `../../theme`; wrong dependency lists both directions). Fixed against actual imports; validator passes: **23 items, all files resolve, all imports covered** (re-run at assembly). `npm pack --dry-run` clean for all three packages (tokens 6.4 kB, web 10.5 kB, native 18.1 kB); `npm view` confirms names unused (does not prove the `@supr` org is free). Nothing published — user steps: create `@supr` org, `npm login`, publish in dependency order, deploy `registry/` to a static host. Root `package.json` gained `registry:validate` / `registry:build` / `registry:serve` scripts.

### WS5 — Demo/Expo app — DONE
`apps/demo/` (`@supr/demo` 0.1.0): Expo SDK 55 tooling with **React Native pinned 0.82.1** (no Expo SDK ships RN 0.82.1 — SDK 54 → 0.81, SDK 55 → 0.83; SDK 55 chosen as nearest New-Arch-only match); TypeScript 5.9.3 nested in `apps/demo` only (Expo CLI 55 calls `ts.sys`, which TS 7.0.2 native port lacks; repo standard stays 7.0.2). Hand-rolled state-stack navigation (no expo-router). **Navigation contract implemented verbatim**: home lists all 10 components by name, tap opens showcase, each showcase root carries `screen-<component>`, back is `nav-back`, theme toggle `theme-toggle`. Verified at assembly: typecheck clean, tests **4 passed / 1 skipped**, `expo export` Android bundle re-run (5.6 MB). **Select option-press STILL UNTESTABLE** — reproduced the exact M1 hang in the demo context (render passes, trigger opens the list, pressing an option hangs Vitest with no error); retry test kept as `it.skip`; on-device remains the only verification path. Quirk: native package ships raw JSX in `dist`, so the demo's Vitest config must transform `@supr/ui-native/dist`.

### WS6 — Playwright visual regression — DONE
`apps/storybook/tests/visual/visual.spec.ts` + README + **26 baselines** (13 cases × dark/light) in `__snapshots__/`; re-run at assembly: **27 passed, 0 failed** (smoke + 26 visual). Stories loaded directly via `/iframe.html` with `globals=theme:<theme>`; theme asserted before screenshotting; 1280×720; animations disabled; Motion settled by opacity polling. `playwright.config.ts` gained `snapshotPathTemplate`. Scripts added at assembly: `"test:visual": "playwright test tests/visual"`, `"test:visual:update": "playwright test tests/visual --update-snapshots"`. Warning: **never run a Storybook rebuild concurrently with this suite** — the build wipes `storybook-static/` mid-run. Observation: `select-open` baselines show the dropdown opening upward, covering its own trigger and label — faithfully baselined, worth confirming placement is intended. Not covered: hover/focus/keyboard, responsive widths, cross-browser (Chromium-only), native components.

### WS7 — Storybook test-runner + axe — DONE
`.storybook/test-runner.ts` (`@storybook/test-runner` 0.26.0 + `axe-playwright` 2.2.2): re-run at assembly: **33 stories / 10 titles, 0 axe violations, exit 0** (two runs: first 33/33 passed; second printed "No accessibility violations detected!" for all 10 suites). Whole-document scan so portals are covered, no suppressions. Fixes made: preview decorator now renders `<main>` + visually-hidden `<h1>` per story (fixed 76 page-level violations); `CardTitle` `h3` → `h2` (a11y fix only, classes unchanged). Script added at assembly: `"test:storybook": "test-storybook --url http://localhost:6006"`. Gaps: **light-theme axe pass not run** (runner visits dark globals only). WS7 flag, recorded in AGENTS.md: **stale-dist trap** — Storybook tests `dist/`, not `src/`; any `src` edit without a dist rebuild silently tests old code.

### WS8 — Android e2e — DONE, UNRUN
Tool pick: **Maestro** (mobile-dev-inc/Maestro, 16,399 stars, Apache-2.0, verified from GitHub API 2026-11-13) over Detox (wix/Detox, 12,057 stars, MIT): black-box YAML, zero changes to the demo app. Suite in `e2e-android/` (README, 8 flows, `run.sh`, `scripts/validate-flows.py`, `package.json` scripts-only, not in workspaces): home, Button, Select, Switch, Input+Dialog, Tabs+Toast, Popover+Card+Avatar, all-screens smoke. Flows rewritten against the real demo source (package `technology.supr.demo`); validator re-run at assembly: **8/8 flows OK, all 22 id selectors exist in `apps/demo/src`**. **Unrun**: no device/emulator/Java on this machine — Maestro CLI not installed; user steps: Java 17+ + Maestro CLI (`curl -fsSL "https://get.maestro.mobile.dev" | bash`), booted emulator/device, `npx expo run:android`, then `./run.sh`. First-run risks documented: RN `<Modal>`/portal invisibility, toast auto-dismiss timing, Switch tap by label text.

### WS9 — Formal contrast audit + per-component light variants — DONE
Report: `CONTRAST-AUDIT.md` (434 lines — full 136-row ratio table, before→after table for all 13 failures, method, closest calls, files, verification). Reproduce with `node scripts/contrast-audit.mjs` (report assembled by `scripts/generate-contrast-report.py`).
**Before fixes: 13 AA failures out of 142 pairs. After fixes: 0 failures out of 136 pairs** (68 per theme), computed from the actual token values. 9 disabled-state pairs sit below 4.5:1 after real alpha compositing — WCAG-exempt, reported, not hidden.

| Failure | Before | After | Fix |
|---|---|---|---|
| Button primary hover/pressed, dark | 4.02:1 | 7.97:1 | Dark `brand-hover`: cobalt-400 #4378F3 → cobalt-600 #1045C0 (the only existing value changed net; light already used #1045C0; cobalt ramp untouched) |
| Button danger label, dark | 3.76:1 | 4.83:1 | New `danger-solid` #DC2626 as Button rest bg |
| Button danger hover (web 0.90) / pressed (native 0.85), both themes | 3.31–4.00:1 | 6.47:1 | New `danger-hover` #B91C1C replaces opacity feedback on both platforms |
| Switch unchecked track vs page, both platforms/themes | 1.06–2.03:1 | 4.43–4.74:1 | New `track` #737373 (black-700); 1px `border-strong` rim removed from Switch on both platforms |
| Switch native thumb on light track | 1.48:1 | 4.74:1 | Same `track` token |

The dark `danger` value is final at its original #EF4444: unifying it to #DC2626 fixed the Button (4.83:1) but broke Input error text (4.35:1, was 5.58:1) — one dark red cannot serve both roles, so the roles split: `danger` = text/border/icon, `danger-solid` = filled Button bg, `danger-hover` = hover/pressed bg. **Per-component light variants: none needed** — the fixes are token-level and apply to both themes. The 3 new tokens are wired into BOTH outputs (web `--color-*` in `:root`, `[data-theme="light"]`, and `@theme inline`; native `ThemeColors` + `theme.dark/light.colors` + compiled `theme.js`); this required editing `packages/tokens/style-dictionary.config.mjs` (its `SEMANTIC_COLORS` list is explicit) — the config, not generated output. Final semantic keys: **17 per theme, identical** (background, border, border-strong, brand, brand-foreground, brand-hover, danger, danger-hover, danger-solid, focus, success, surface, surface-raised, text, text-muted, track, warning). Files changed (styling only, tokens only, no raw literals, no API/prop/behavior changes): `packages/web/src/components/button/Button.tsx`, `packages/web/src/components/switch/Switch.tsx`, `packages/native/src/components/button/Button.tsx`, `packages/native/src/components/switch/Switch.tsx`; tests `packages/tokens/test/tokens.test.ts`, `packages/web/src/components/button/Button.test.tsx`, `packages/native/test/theme.test.tsx`; docs `apps/docs/src/content/docs/tokens/color.md`. No real-browser/on-device visual check of the new gray Switch track or danger hover; Tailwind utility existence is proven by the `@theme inline` mapping, not a compiled-CSS grep.

### WS10 — Lucide license verification + storybook-static decision — DONE
Lucide **ISC CONFIRMED**, with MIT carve-out: 115 Feather-derived icons stay MIT (Copyright 2013-present Cole Bemis) — correct SPDX **ISC AND MIT**. Sources: `node_modules/lucide-react/LICENSE` + `lucide-react-native/LICENSE` (byte-identical) + GitHub `main` (matches); GitHub API still reports unclassified (NOASSERTION) — the LICENSE file is the authority. `NOTICE` line 16 corrected. D10 "verify before shipping" flag closed (MCP SDK was the other flagged license — closed by WS2). **storybook-static: gitignored** (D14) — 9.0 MB / 72 files, regenerable, content-hashed assets would churn every commit; `.gitignore` entry added; directory stays on disk, nothing deleted. At assembly, `apps/storybook/test-results/` (Playwright output) was also gitignored under the same rule. Note: this checkout has **no `.git` directory**, so gitignore enforcement itself is untested here — the entries are present and correct in `.gitignore`, and WS10's "verified with `git check-ignore`" claim could not be reproduced in this checkout.

## Decisions added (decisions.md)

| # | Decision | Pick |
|---|---|---|
| D14 | Storybook built output | Gitignore `storybook-static/` (+ `test-results/`) |
| D15 | MCP server | stdio, `@supr/mcp-server`, 5 tools + 3 resources |
| D16 | Android e2e runner | Maestro (YAML flows, unrun) |
| D17 | Visual regression | Playwright, 26 baselines, 27 passed |
| D18 | Figma token sync | Plugin path (Tokens Studio format) |
| D19 | Demo app SDK | Expo SDK 55, RN 0.82.1 pinned |
| D20 | Demo app navigation | Hand-rolled state stack, no expo-router |
| D21 | Demo app TypeScript | TS 5.9.3 nested in `apps/demo` only |
| D22 | Contrast rules | Hover/pressed same bar as rest; split tokens with opposite contrast directions |

D7/D8/D9/D10/D11 sections also carry M2 updates (hosting decision, Starlight built, MCP built + SDK license, Lucide ISC AND MIT, test-runner + visual + Maestro + stale-dist trap). The "two licenses flagged not SPDX-classified" note is closed. Nine D14–D22 sections verified present in `decisions.md`.

## Docs updated at assembly

- `AGENTS.md`: expanded repo layout (docs, demo, mcp-server, figma-plugin, e2e-android, scripts); 17 semantic colors (new `danger-hover`, `danger-solid`, `track` in web table + native keys); D22 contrast rules + audit gate; test-runner/visual/Maestro + stale-dist trap; full M2 matrix in Testing; distribution/hosting paragraph.
- `skills/supr-ui/SKILL.md`: same token additions (web table + native keys), contrast rules + audit command, M2 testing/monorepo lines.
- `README.md`: color list, distribution (npm public scope + static registry, 23 items), expanded repo layout, M2 additions note.
- `apps/storybook/package.json`: added `test:visual`, `test:visual:update`, `test:storybook` scripts (WS6/WS7 left them unwritten).
- `figma-plugin/` artifacts regenerated from the final `tokens/color.json` at assembly (33/33 verify).
- `.gitignore`: added `apps/storybook/test-results/`.

## Honest limits — what is still unverified

- **On-device Android rendering: not verified** (no hardware here). The demo app assembles, typechecks, tests pass, and `expo export` produces a bundle — but nobody has seen it on a phone. The demo app exists precisely so the user can do this check.
- **Select option-press: still untestable** — reproduced the M1 RNTL hang in the demo context; test kept as `it.skip`; on-device is the only verification path.
- **Maestro e2e suite: never executed** — no device/emulator/Java on this machine; Maestro CLI not installed.
- **Figma plugin: never run inside Figma** — sync scripts verified against tokens (33/33), but no Figma-side run; REST writes are Enterprise-only.
- **MCP server: never connected to a live client** — 10/10 unit tests only.
- **Light-theme axe pass: not run** — the test-runner visits dark globals only.
- **Docs site: never visually checked in a live browser** — build + preview 200s only.
- **Contrast audit: no real-browser/on-device visual check** of the new gray Switch track or danger hover; Tailwind utility existence proven by the `@theme inline` mapping, not a compiled-CSS grep.
- **Native 39/39** is a single uninterrupted serialized run at assembly (this resolves WS9's composed 15/15 + 24/24 run, which was split by a tinypool IPC stall while other workstreams ran Vitest concurrently).
- **`select-open` baseline quirk:** the dropdown opens upward, covering its own trigger and label — faithfully baselined; confirm placement is intended.
- **No `.git` directory in this checkout** — gitignore entries are present but enforcement is untested here.
- **Docs `site` URL not configured** (Astro sitemap warning on every build) — set once hosting is chosen.

## User steps remaining

1. **Publish:** create the `@supr` npm org, `npm login`, publish `@supr/tokens` → `@supr/ui` → `@supr/ui-native` in dependency order; deploy `registry/` to a static host (suggested `registry.supr.technology`, undecided).
2. **On-device:** install the demo app (`npx expo run:android`), check all 10 components render, and press a Select option — the one flow no test here can verify.
3. **Maestro:** Java 17+ + Maestro CLI, booted emulator/device, `npx expo run:android`, then `./run.sh` in `e2e-android/`.
4. **Figma:** run the plugin in Figma (Tokens Studio import) and confirm the variables land.
5. **Docs hosting:** pick a host, set the `site` URL in `apps/docs/astro.config.mjs`.
6. **Confirm** the `select-open` upward dropdown placement is intended.
