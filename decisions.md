# Design System — Decisions to Pick From

**Date:** 2026-11-13. All star counts verified today from GitHub (API or repo page).
**Context:** build one design language / component library from five sources — each contributes a different layer, not a competing library:

| Source | Stars | License | What it contributes |
|---|---|---|---|
| [vercel-labs/ui (UI SDK)](https://github.com/vercel-labs/ui) | 1,925 | Apache 2.0 | Headless behaviors (keyboard, focus, ARIA) + agent skill. Beta. |
| [RealtimeKit design system](https://developers.cloudflare.com/realtime/realtimekit/humans/ui-kit/branding/design-system/) | — (docs) | — | Token shape: semantic shades, radius/width scales, 4pt spacing, theme presets. Works on React Native. |
| [cloudflare/kumo](https://github.com/cloudflare/kumo) | 4,218 | MIT | React components on Base UI, semantic tokens, CLI, Figma plugin, AGENTS.md + skill. |
| [carbon-design-system/carbon](https://github.com/carbon-design-system/carbon) | 9,619 | Apache 2.0 | Rigor: token packages, a11y-first, governance, Carbon MCP server. |
| [shadcn-labs/pin-ui](https://github.com/shadcn-labs/pin-ui) | 119 | MIT | Motion/animation layer (Motion) + copy-paste distribution + page sections (Blocx). |

**How to answer:** reply with your pick per decision, e.g. `D1: Web`, `D3: Radix`, or just name the repos you want. Anything you don't pick, I'll take the stated default. Defaults are flippable.

---

## Decisions — picked 2026-11-13

You delegated the picks: best fit for **web + Android APK**, main priority **Supr**, colors **black and cobalt**. These picks override the per-decision "My default" lines below where they differ.

| # | Decision | Pick |
|---|---|---|
| D1 | Target platform | **Both** — shared tokens, two component sets. Web: shadcn/ui. Android: NativeWind + React Native Reusables. |
| D2 | Token source of truth | Style Dictionary + Tokens Studio |
| D3 | Behavior primitives | Base UI on web (+ UI SDK skill); RN primitives come with React Native Reusables |
| D4 | Styled component base | **shadcn/ui** — flipped from Kumo (see below) |
| D5 | Styling engine | Tailwind v4 |
| D6 | Motion | Motion on web, Reanimated on Android; motion values shared as tokens |
| D7 | Distribution | Both (npm + registry) |
| D8 | Docs + workshop | Storybook + Starlight |
| D9 | Agent interface | AGENTS.md + skill first, MCP server second |
| D10 | Icons | Lucide (same repo ships lucide-react-native) |
| D11 | Testing + a11y | Vitest + Playwright + axe-core (Playwright is web-only; Android e2e is a follow-up) |
| D12 | Default look | **Black + cobalt** — Supr/MR brand |
| D13 | Name + license | MIT, working name **Supr UI** |

**The two flips, and why:**

- **D4 Kumo → shadcn/ui.** Kumo has no React Native story. shadcn/ui on web + React Native Reusables on Android is the same components, same names, same Tailwind tokens — one mental model on both platforms. Kumo stays as an influence: its semantic tokens, CLI, Figma sync, and AGENTS.md patterns are adopted, its components are not the base.
- **D12 Thread → black + cobalt.** The Thread look (obsidian/champagne) belongs to Task Thread. This system is Supr's: black backgrounds, cobalt accent. Cobalt primary is `#1456F0` — confirmed from supr.technology's stylesheet (2026-11-13); the old `#0047AB` standard-cobalt placeholder was swapped out the same day.

**Confirmed 2026-11-13:** Supr's web app is a JS SPA (app.supr.technology shows a "Loading Supr" shell, not Next.js) — consistent with React; the exact bundler is unconfirmed, but the React picks stand. The Android APK does **not exist yet** (user confirmed "Not built yet", 2026-11-13 17:09 EST; no Supr app on Google Play) — so React Native is the pick with no rewrite cost, and M1's native twins apply directly. The old fallback (native Kotlin APK → only tokens carry over) is moot.

---

## D1 — Target platform

The one decision everything else hangs on. Web components don't run in React Native; tokens do.

| Option | Stars | License | What it gives you | Watch out for |
|---|---|---|---|---|
| **Web React only** | — | — | Fastest build, all 5 sources apply directly | Can't drop into Task Thread (React Native) |
| **React Native only** | — | — | Directly serves Task Thread | Web sources become reference only; most component code is new |
| **Both — shared tokens, two component sets** | — | — | One look everywhere; tokens are the single source of truth | Two implementations to maintain |
| [tamagui/tamagui](https://github.com/tamagui/tamagui) | 14,309 | MIT | One codebase, web + RN parity, optimizing compiler, optional UI kit | Heaviest option; compiler adds build complexity |
| [nativewind/nativewind](https://github.com/nativewind/nativewind) | 8,126 | MIT | Tailwind classes in React Native | Styling only — still need components on top |
| [founded-labs/react-native-reusables](https://github.com/founded-labs/react-native-reusables) | 8,723 | MIT | shadcn/ui ported to React Native (NativeWind/Uniwind) | Smaller community; RN port of web patterns, not identical APIs |

**Picked:** Both — shared tokens, two component sets. Web: shadcn/ui. Android: NativeWind + React Native Reusables.

## D2 — Token source of truth

Where the design values live, and how they reach web + native.

| Option | Stars | License | What it gives you | Watch out for |
|---|---|---|---|---|
| [style-dictionary/style-dictionary](https://github.com/style-dictionary/style-dictionary) | 4,882 | Apache 2.0 | Build system: one token file → CSS vars, iOS, Android, JS. The industry standard. | Needs a build step; tokens authored as JSON, not in Figma |
| [tokens-studio/figma-plugin](https://github.com/tokens-studio/figma-plugin) | 1,630 | MIT | Designers edit tokens in Figma; exports W3C-format JSON | Figma-first workflow; pairs with Style Dictionary, doesn't replace it |
| Figma Variables (native) | — | — | Built into Figma, no plugin | Export story is weaker; no code generation |
| Carbon themes (`@carbon/themes`, in [carbon](https://github.com/carbon-design-system/carbon)) | 9,619 | Apache 2.0 | Battle-tested theme token sets (White/G10/G90/G100) | IBM's values, not yours — take the structure, swap the values |

**My default:** Style Dictionary + W3C-format tokens, Tokens Studio as the Figma editor. They stack, they don't compete.

## D3 — Behavior / headless primitives

Keyboard nav, focus, selection, dismissal, popups, drag-and-drop, and the ARIA they need. This is the "robust" layer — get it wrong and every component inherits the bugs.

| Option | Stars | License | What it gives you | Watch out for |
|---|---|---|---|---|
| [vercel-labs/ui](https://github.com/vercel-labs/ui) (`@ui-sdk/core`) | 1,925 | Apache 2.0 | Framework-agnostic behaviors + agent skill; the agent-first pick | Beta (Oct 2026); APIs may change; headless only, no styling |
| [radix-ui/primitives](https://github.com/radix-ui/primitives) | 19,495 | MIT | The proven headless standard; what shadcn is built on | React-only; no agent skill |
| [mui/base-ui](https://github.com/mui/base-ui) | 11,400 | MIT | Unstyled primitives from the Radix/Floating UI/MUI creators; what Kumo is built on | Younger than Radix; API still evolving |
| [adobe/react-spectrum](https://github.com/adobe/react-spectrum) (React Aria) | 16,029 | Apache 2.0 | Hooks + components; deepest a11y coverage of any option | Bigger API surface; heavier to adopt |

**Picked:** Base UI on web, with UI SDK's skill as the agent-facing behavior spec. Radix is the boring-safe swap if Base UI ever wobbles. On Android, behavior primitives come with React Native Reusables.

## D4 — Styled component base

The actual components you start from and restyle.

| Option | Stars | License | What it gives you | Watch out for |
|---|---|---|---|---|
| [cloudflare/kumo](https://github.com/cloudflare/kumo) | 4,218 | MIT | Closest to the brief: Base UI + semantic tokens + CLI + Figma sync | Smallest community of the four; Cloudflare's look must be re-skinned |
| [shadcn-ui/ui](https://github.com/shadcn-ui/ui) | 128,047 | MIT | Biggest ecosystem by far; copy-paste components you own; registry model | You own the code — no upstream updates; Tailwind-coupled |
| [mantinedev/mantine](https://github.com/mantinedev/mantine) | 31,938 | MIT | Fully-featured, batteries-included (hooks, forms, dates) | Its own look and its own styling system; heaviest to re-skin |
| [carbon-design-system/carbon](https://github.com/carbon-design-system/carbon) (`@carbon/react`) | 9,619 | Apache 2.0 | Most complete enterprise coverage; strictest a11y | IBM's visual identity is baked in deep; re-skinning is real work |

**Picked:** shadcn/ui. Kumo was the original default (closest to the brief), but it has no React Native story, and the brief is now web + Android APK. Kumo's patterns (semantic tokens, CLI, Figma sync, AGENTS.md) are adopted; its components are not the base.

## D5 — Styling engine

How styles get written and how tokens reach components.

| Option | Stars | License | What it gives you | Watch out for |
|---|---|---|---|---|
| [tailwindlabs/tailwindcss](https://github.com/tailwindlabs/tailwindcss) | 98,588 | MIT | Utility-first; v4 is CSS-first with `@theme` tokens; the shadcn default | Utility classes everywhere; theming = CSS variables |
| [chakra-ui/panda](https://github.com/chakra-ui/panda) | 6,251 | MIT | Type-safe, token-first, framework-agnostic; built for design systems | Smaller community; config-heavy |
| [vanilla-extract-css/vanilla-extract](https://github.com/vanilla-extract-css/vanilla-extract) | 10,448 | MIT | Zero-runtime styles in TypeScript; type-safe tokens | Needs a build plugin; no utility workflow |
| Plain CSS Modules / CSS variables | — | — | Zero dependencies; tokens as plain CSS vars | You hand-roll everything (variants, recipes) |

**Picked:** Tailwind v4 (tokens as CSS variables, `@theme` mapping). shadcn ↔ Tailwind is a matched pair on web, and NativeWind is Tailwind on Android — one styling language on both platforms. Panda is the swap if type-safe tokens outrank ecosystem.

## D6 — Motion / animation

| Option | Stars | License | What it gives you | Watch out for |
|---|---|---|---|---|
| [motiondivision/motion](https://github.com/motiondivision/motion) | 35,101 | MIT | Motion (ex-Framer Motion): springs, layout transitions, gestures; ships an agent skill + MCP server (`npx motion-ai`) | Some premium APIs/examples are paid (Motion+) |
| [software-mansion/react-native-reanimated](https://github.com/software-mansion/react-native-reanimated) | 11,070 | MIT | The React Native motion runtime | Motion values (durations, springs) live in tokens; Reanimated executes them on native |
| [pmndrs/react-spring](https://github.com/pmndrs/react-spring) | 29,275 | MIT | Spring-physics animations; long track record | Less maintained momentum than Motion; no agent tooling |
| Carbon motion (`@carbon/motion`, in [carbon](https://github.com/carbon-design-system/carbon)) | 9,619 | Apache 2.0 | Motion tokens + curves (productive/expressive) | Tokens only — still need a runtime library |
| CSS only | — | — | Zero deps; transitions + keyframes | No springs, no layout animation, no gestures |

**Picked:** Motion on web, Reanimated on Android. Motion values (durations, spring configs) are shared tokens; the runtime differs per platform. Carbon's motion curves are the token values inside both.

## D7 — Distribution

How people get the components.

| Option | What it gives you | Watch out for |
|---|---|---|
| **npm package** (standard) | Versioned, installable, updatable | Users can't easily restyle internals |
| **shadcn-style copy-paste registry** ([shadcn-ui/ui](https://github.com/shadcn-ui/ui) CLI pattern; pin-ui model) | Users own the files; trivial to customize; no lock-in | No upstream updates — forks drift |
| **Both** | npm for the versioned core + registry for ownable recipes/sections | Two things to maintain |

**My default:** Both — npm package for components, registry for Blocx-style sections and motion recipes.

**M2 update (2026-11-14):** hosting decided — **both, no registry server.** npm under the public `@supr` scope (each package now has `publishConfig: {access: "public"}`; names verified unused, which does not prove the `@supr` org is free) + a static-hosted shadcn-style registry (`registry.json` + generated `registry/r/<slug>.json`, 23 items; suggested host `registry.supr.technology`, undecided). Verdaccio rejected; private packages rejected per D13. The M1 `registry.json` was broken (44 problems: uncovered relative imports, wrong dependency lists both directions) and was fixed against actual imports; `npm run registry:validate` passes. Nothing published yet — user steps: create the `@supr` org, `npm login`, publish in dependency order, deploy `registry/` to a static host. **Superseded the same day by D23: scope is `@mrtechnology`, no org is created.**

## D8 — Docs + component workshop

Storybook is a workshop; Starlight/Docusaurus are docs sites. They're complementary, not exclusive.

| Option | Stars | License | What it gives you | Watch out for |
|---|---|---|---|---|
| [storybookjs/storybook](https://github.com/storybookjs/storybook) | 91,552 | MIT | Industry-standard component workshop; a11y addon runs axe in every story | Heavy; config is a project in itself |
| [withastro/starlight](https://github.com/withastro/starlight) | 9,557 | MIT | Fast, beautiful docs site on Astro | Docs only — no component playground |
| [meta/docusaurus](https://github.com/meta/docusaurus) | 66,724 | MIT | The default React docs site; huge plugin ecosystem | Heavier than Starlight; React-centric |
| [tajo/ladle](https://github.com/tajo/ladle) | 2,998 | MIT | Lightweight Storybook alternative (Vite, fast) | Small community; fewer addons |

**My default:** Storybook (workshop + a11y addon) + Starlight (docs). Skip Ladle unless Storybook's weight bothers you.

**M2 update (2026-11-14):** Starlight built — `apps/docs/` (`@supr/docs`, Astro 7.4.12 + Starlight 0.43.1 + sharp 0.35.5): 18 content pages (guides, tokens, all 10 components web + native), 1,239 lines, verified against real sources; build succeeds (19 pages incl. 404, Pagefind index); preview serves 200s. `site` URL not configured — set once hosting is chosen. No live-browser visual check yet.

## D9 — Agent interface

How AI agents (including Task Thread's) build with the system correctly instead of guessing.

| Option | Stars | License | What it gives you | Watch out for |
|---|---|---|---|---|
| **AGENTS.md + skill** (Kumo's pattern, in [kumo](https://github.com/cloudflare/kumo); UI SDK's skill in [vercel-labs/ui](https://github.com/vercel-labs/ui)) | 4,218 / 1,925 | MIT / Apache 2.0 | Cheapest to ship; agents read it directly | Passive — agents must know to look |
| **MCP server** built on [modelcontextprotocol/typescript-sdk](https://github.com/modelcontextprotocol/typescript-sdk) | 13,755 | Not SPDX-classified — check the LICENSE file before shipping | Agents query components/tokens live, like Carbon's MCP | A server to build, host, and version |
| **Motion skill + MCP** ([motiondivision/motion](https://github.com/motiondivision/motion)) | 35,101 | MIT | Already built for the motion layer; free, no account | Covers motion only, not your components |
| Carbon MCP (in [carbon](https://github.com/carbon-design-system/carbon)) | 9,619 | Apache 2.0 | The reference implementation of a design-system MCP | Tied to Carbon's content model |

**My default:** AGENTS.md + skill first (ship with milestone 1), MCP server second (TypeScript SDK) once the component set stabilizes.

**M2 update (2026-11-14):** MCP server built — see D15. SDK license flag closed: `@modelcontextprotocol/sdk` 1.32.2 is MIT as installed.

## D10 — Icons

| Option | Stars | License | What it gives you | Watch out for |
|---|---|---|---|---|
| [lucide-icons/lucide](https://github.com/lucide-icons/lucide) | 25,733 | Not SPDX-classified — check the LICENSE file (repo states ISC) | 2,000+ icons; the shadcn default; consistent stroke style | License file needs a read before shipping |
| [tabler/tabler-icons](https://github.com/tabler/tabler-icons) | 22,619 | MIT | 6,200+ icons; biggest set here | Larger, more varied — needs curation |
| [phosphor-icons/react](https://github.com/phosphor-icons/react) | 1,795 | MIT | Kumo's peer dependency; 6 weights per icon (thin → fill) | Smallest set; React package is quiet (last push Jan 2026) |
| Carbon icons (`@carbon/icons`, in [carbon](https://github.com/carbon-design-system/carbon)) | 9,619 | Apache 2.0 | Matches Carbon's system if you go that way | IBM-flavored set; tied to Carbon |

**Picked:** Lucide — the same repo ships lucide-react-native, so icons are identical on web and APK. (Verify the license file first.)

**M2 update (2026-11-14):** license verified from source — Lucide is **ISC AND MIT**: the LICENSE file is ISC; 115 Feather-derived icons stay MIT (Copyright 2013-present Cole Bemis). GitHub's API still reports unclassified (NOASSERTION) — the LICENSE file is the authority. `NOTICE` corrected accordingly.

## D11 — Testing + accessibility gate

Not really a pick — it's a stack. All three do different jobs.

| Option | Stars | License | Job |
|---|---|---|---|
| [vitest-dev/vitest](https://github.com/vitest-dev/vitest) | 17,379 | MIT | Unit + component tests (fast, Vite-native) |
| [microsoft/playwright](https://github.com/microsoft/playwright) | 100,039 | Apache 2.0 | Interaction + visual regression across browsers |
| [dequelabs/axe-core](https://github.com/dequelabs/axe-core) | 7,805 | MPL-2.0 | Automated a11y checks; runs inside Storybook and CI |

**Picked:** all three for web — Vitest for units, Playwright for visual/interaction, axe-core as the CI a11y gate (fail the build on violations, not just warn). Playwright doesn't test APKs; Android e2e is a follow-up decision (Maestro is the usual pick), not blocking milestone 1.

**M2 update (2026-11-14):** Storybook test-runner run — 33 stories / 10 titles, **0 axe violations, exit 0** (`.storybook/test-runner.ts`, `@storybook/test-runner` 0.26.0 + `axe-playwright` 2.2.2); fixes: preview decorator renders `<main>` + visually-hidden `<h1>` per story, `CardTitle` `h3` → `h2`. Light-theme axe pass not run (runner visits dark globals only). Visual regression baselined — see D17. Android e2e picked — see D16 (Maestro, suite unrun). **Stale-dist trap:** Storybook tests `dist/`, not `src/` — any `src` edit without a dist rebuild silently tests old code.

## D12 — Default look / theme

The system owns structure; the theme owns the look. This is a token swap, not a rebuild.

| Option | What it is |
|---|---|
| **Thread (yours)** | Obsidian `#0A0C10`, champagne `#FFE5B4` accent, 1dp hairlines, spring transitions — the Task Thread design language you already set |
| **Carbon look** | IBM: white/G10/G90/G100 themes, IBM Plex, blue 60 accent |
| **Kumo look** | Cloudflare's dashboard aesthetic |
| **RealtimeKit dark presets** | `darkest` / `dark` / `light` with brand `#2160FD` |

**Picked:** Black + cobalt — the Supr/MR brand. Black backgrounds, cobalt `#1456F0` accent (confirmed 2026-11-13 from supr.technology's stylesheet). The Thread look stays with Task Thread; this system is Supr's.

## D13 — Name + license of the system itself

| Option | Notes |
|---|---|
| **MIT** | Matches Kumo, shadcn, Radix, Tailwind — the most permissive, simplest attribution |
| **Apache 2.0** | Matches UI SDK, Carbon, React Aria — adds an explicit patent grant |
| **Name** | Undecided — needs a name before the first package ships |

**Picked:** MIT. Working name: Supr UI.

---

## Pick sheet — decided 2026-11-13, extended 2026-11-14 (M2)

| # | Decision | Pick (2026-11-13) |
|---|---|---|
| D1 | Target platform | Both — web shadcn/ui, Android NativeWind + RNR |
| D2 | Token source of truth | Style Dictionary + Tokens Studio |
| D3 | Behavior primitives | Base UI web (+ UI SDK skill); RNR primitives on Android |
| D4 | Styled component base | shadcn/ui |
| D5 | Styling engine | Tailwind v4 |
| D6 | Motion | Motion web / Reanimated Android |
| D7 | Distribution | Both (npm + registry) |
| D8 | Docs + workshop | Storybook + Starlight |
| D9 | Agent interface | AGENTS.md + skill first, MCP second |
| D10 | Icons | Lucide |
| D11 | Testing + a11y | Vitest + Playwright + axe (web); Android e2e follow-up |
| D12 | Default look | Black + cobalt |
| D13 | Name + license | MIT, Supr UI |
| D14 | Storybook built output | Gitignore `storybook-static/` (+ `test-results/`) |
| D15 | MCP server | stdio, `@supr/mcp-server`, 5 tools + 3 resources |
| D16 | Android e2e runner | Maestro (YAML flows, unrun) |
| D17 | Visual regression | Playwright, 26 baselines, 27 passed |
| D18 | Figma token sync | Plugin path (Tokens Studio format) |
| D19 | Demo app SDK | Expo SDK 55, RN 0.82.1 pinned |
| D20 | Demo app navigation | Hand-rolled state stack, no expo-router |
| D21 | Demo app TypeScript | TS 5.9.3 nested in `apps/demo` only |
| D22 | Contrast rules | Hover/pressed same bar; split tokens with opposite directions |
| D23 | Publish scope | `@mrtechnology`, no org; username scope |

## Milestone 2 decisions — picked 2026-11-14

## D14 — Storybook built output (commit vs gitignore)

| Option | What it gives you | Watch out for |
|---|---|---|
| Commit `storybook-static/` | Review apps always have the workshop; no build step to preview | 9.0 MB / 72 files, content-hashed assets churn every commit; noise in every diff |
| **Gitignore it** | Clean history; anyone can rebuild with `npm run build-storybook` | Reviewers must build it themselves |

**Picked 2026-11-14:** gitignore. `storybook-static/` is a build artifact — regenerable, content-hashed, 9.0 MB. Directory stays on disk, nothing deleted. Same rule at assembly: Playwright output `apps/storybook/test-results/` is also gitignored. Built outputs are never committed.

## D15 — MCP server

| Option | Stars | License | What it gives you | Watch out for |
|---|---|---|---|---|
| **stdio MCP server, `@supr/mcp-server`** | — | MIT | Agents query tokens/components live; no hosting, no auth surface | Client must launch the server process |
| HTTP/SSE MCP server | — | MIT | Hosted, shared | Auth + hosting + versioning to run |
| No MCP (skill only) | — | — | Nothing to maintain | Passive — agents must know to look |

**Picked 2026-11-14:** stdio only, package `@supr/mcp-server` 0.1.0 (private). 5 tools (`supr_list_tokens`, `supr_get_token`, `supr_list_components`, `supr_get_component`, `supr_guidance`) + 3 resources (`supr://tokens`, `supr://components`, `supr://guidance`). Tokens are read live from the built `@supr/tokens` output. 10/10 Vitest tests pass. License check closed: `@modelcontextprotocol/sdk` 1.32.2 is **MIT as installed** (Copyright 2024 Anthropic, PBC); GitHub `main` shows an in-progress MIT→Apache-2.0 transition — permissive either way. No live MCP client has connected yet. `src/data/rules.ts` is a structured summary of AGENTS.md and must be kept in sync with it.

## D16 — Android e2e runner

| Option | Stars | License | What it gives you | Watch out for |
|---|---|---|---|---|
| **[Maestro](https://github.com/mobile-dev-inc/Maestro)** | 16,399 | Apache 2.0 | Black-box YAML flows; zero changes to the demo app; no test code in the app | CLI + emulator/device needed to run; RN `<Modal>`/portal invisibility is a known first-run risk |
| [Detox](https://github.com/wix/Detox) | 12,057 | MIT | Gray-box, deep RN integration | Test hooks in the app; heavier setup |
| Espresso / UI Automator | — | Apache 2.0 | Native, no JS dependency | Kotlin/Java test code; separate toolchain |

**Picked 2026-11-14:** Maestro. Suite in `e2e-android/` (8 flows: home, Button, Select, Switch, Input+Dialog, Tabs+Toast, Popover+Card+Avatar, all-screens smoke) against the demo app (package `technology.supr.demo`); flows validated against the real demo source (8/8, all 22 id selectors exist). **Unrun**: no device/emulator/Java on the build machine — Maestro CLI not installed. User steps: Java 17+ + Maestro CLI (`curl -fsSL "https://get.maestro.mobile.dev" | bash`), booted emulator/device, `npx expo run:android`, then `./run.sh`.

## D17 — Visual regression

| Option | What it gives you | Watch out for |
|---|---|---|
| **Playwright screenshots vs Storybook iframe, committed baselines** | Catches visual drift per component per theme; 13 cases × dark/light = 26 baselines | Baselines are Chromium-only; hover/focus/keyboard and responsive widths not covered |
| Chromatic / Percy (hosted) | Hosted baselines + review UI | Paid, external service |

**Picked 2026-11-14:** Playwright, `apps/storybook/tests/visual/visual.spec.ts`, 26 baselines in `__snapshots__/` (13 cases × dark/light), 1280×720, animations disabled, theme asserted before screenshotting. Final run: 27 passed (smoke + 26 visual). Scripts: `npm run test:visual`, `npm run test:visual:update`. **Never run a Storybook rebuild concurrently with this suite** — the build wipes `storybook-static/` mid-run. Observation: `select-open` baselines show the dropdown opening upward, covering its own trigger and label — faithfully baselined; confirm placement is intended. Native components are not covered (web only).

## D18 — Figma token sync mechanism

| Option | What it gives you | Watch out for |
|---|---|---|
| **Figma plugin (Tokens Studio format)** | Recommended path; works on any plan; tokens.json import | Plugin must be run inside Figma (never run in the sandbox) |
| Variables REST API | Direct variable writes | Enterprise-only; writes need an Enterprise plan |
| Manual copy | Nothing to build | Drifts immediately |

**Picked 2026-11-14:** plugin path. `figma-plugin/` ships a hand-written `code.template.js` (no token values), generated `code.js` + Tokens Studio `tokens.json` (sets `core`, `semantic-dark`, `semantic-light`) + Variables REST payload, `ui.html`, and sync/verify/apply scripts + README. Regenerate after any token change: `node figma-plugin/scripts/sync-tokens.mjs`, verify with `node figma-plugin/scripts/verify-sync.mjs` (33/33 checks against `tokens/*.json`). Kumo's Figma token sync is the pattern (D4).

## D19 — Demo app: Expo SDK + React Native version

| Option | What it gives you | Watch out for |
|---|---|---|
| Expo SDK 54 (RN 0.81) | Stable, ships RN 0.81 | One minor behind the repo's 0.82.1 |
| **Expo SDK 55 (RN 0.82.1 pinned)** | Nearest New-Arch-only match to the repo's RN 0.82.1 | No Expo SDK ships RN 0.82.1 (SDK 54 → 0.81, SDK 55 → 0.83); the pin is deliberate |
| Bare React Native 0.82.1 | No Expo layer | Full native build setup to maintain |

**Picked 2026-11-14:** Expo SDK 55 tooling with React Native pinned 0.82.1 in `apps/demo/` (`@supr/demo` 0.1.0). `expo export` produces an Android bundle (5.8 MB). On-device rendering is still unverified (no hardware on the build machine) — that is the user's step.

## D20 — Demo app navigation

| Option | What it gives you | Watch out for |
|---|---|---|
| **Hand-rolled state-stack navigation** | Zero extra deps; exact control over test ids | Hand-maintained |
| expo-router | File-based routing, the Expo default | Extra dependency + config; test-id contract harder to hold |

**Picked 2026-11-14:** hand-rolled state stack, no expo-router. Navigation contract (also the Maestro e2e contract, D16): home lists all 10 components by name, tap opens its showcase, each showcase root carries `screen-<component>`, back is `nav-back`, theme toggle is `theme-toggle`.

## D21 — Demo app TypeScript version

| Option | What it gives you | Watch out for |
|---|---|---|
| Repo standard TypeScript 7.0.2 (native port) | One version everywhere | Expo CLI 55 calls `ts.sys`, which the 7.0.2 native port lacks — the CLI breaks |
| **TypeScript 5.9.3 nested in `apps/demo` only** | Expo CLI works | Two TypeScript versions in the repo |

**Picked 2026-11-14:** TypeScript 5.9.3 nested in `apps/demo` only. The repo standard stays 7.0.2 everywhere else. Revisit if Expo CLI drops the `ts.sys` dependency.

## D22 — Contrast rules (from the M2 audit)

No tool picked — two rules decided from the audit evidence (`CONTRAST-AUDIT.md`, 136 pairs, 0 non-exempt failures after fixes):

1. **Hover/pressed states must pass the same contrast bar as rest.** Filled buttons use a solid darker token for hover/pressed, never opacity — opacity feedback on a filled button drops white text below AA (the danger hover was 3.31:1 before the fix).
2. **A semantic token whose roles need opposite contrast directions must split.** One dark red cannot serve both white-on-red (needs luminance ≤ 0.183) and red-on-black (needs ≥ 0.175) — `danger` (text/border/icon, #EF4444 dark) split from `danger-solid` (filled Button bg, #DC2626) and `danger-hover` (#B91C1C).

**Gate:** after any color-token change, run `node scripts/contrast-audit.mjs` — it must report 0 non-exempt failures. Disabled states are WCAG-exempt (9 pairs sit below 4.5:1 after real alpha compositing) and are reported, not hidden. The audit also changed one existing value: dark `brand-hover` cobalt-400 #4378F3 → cobalt-600 #1045C0 (white text on it was 4.02:1, below AA 4.5:1); light already used #1045C0. The cobalt ramp itself is untouched.

## D23 — Publish scope: `@mrtechnology`, no `@supr` org

**Picked 2026-11-14 (user's decision):** the packages publish under the `@mrtechnology` scope — the user's own npm username — not `@supr`. No `@supr` org is created. A scoped publish under a username scope needs no org at all, so the runbook's org-creation step is deleted.

- All four names verified free on the npm registry the same day (404): `@mrtechnology/tokens`, `@mrtechnology/ui`, `@mrtechnology/ui-native`, `@mrtechnology/mcp-server`.
- Repo rename: 324 `@supr/` occurrences in 78 files → `@mrtechnology/` (package names, dependency entries, import specifiers, registry, docs, READMEs, AGENTS.md, skill, Figma payloads, demo/e2e configs), plus the bare-scope prose references in AGENTS.md and README.md; `package-lock.json` regenerated from the renamed manifests. Historical records left as written: `BUILD-REPORT-M1.md`, `BUILD-REPORT-M2.md`, and the D1–D22 entries in this file (this decision is the pointer that supersedes them).
- Auth: a granular access token with publish permission for the `@mrtechnology` scope, created by the user on npmjs.com and submitted 2026-11-14 ~17:08 EST (see `PUBLISH-RUNBOOK.md` and D24). The token authenticates as npm user `ramihollings`.
- Deliberately unchanged: the `supr://` MCP resource URIs, the `supr_*` MCP tool names, the "Supr UI" product name in prose, the `skills/supr-ui/` directory name, the `registry.supr.technology` static-host suggestion (still undecided), and the `you@supr.technology` placeholder email in the docs Input example.
- Publish order stays tokens → ui → ui-native, all 0.1.0, `publishConfig: {access: "public"}`; `@mrtechnology/mcp-server` stays private by design, `@mrtechnology/docs` and `@mrtechnology/demo` are private apps and are not published.
- Re-verified after the rename (2026-11-14, same matrix as M2): tokens 10/10, web 38/38, native 39/39 serialized, demo 4 passed + 1 skipped, MCP 10/10; `tsc` clean in all workspaces; all five workspace builds exit 0 (docs 19 pages); Storybook build succeeds; Playwright 27 passed (smoke 1 + visual 26, baselines unchanged); test-runner 33/33 stories, 0 axe violations; registry validator 23 items OK; e2e validator 8/8 flows, 22 ids; Figma verify 33/33; contrast audit 136 pairs, 0 non-exempt failures. No failures caused by the rename.

## D24 — Publish route: registry API via custom.npm connector

**Picked 2026-11-14 (Muse, following the token the user submitted):** the packages publish through the raw npm registry API (`PUT https://registry.npmjs.org/<name>` with the tarball as a base64 attachment) from the `custom.npm` connector (`~/workspace/custom-connectors/custom.npm/`, helper `bin/npm_registry.py`), not through `npm publish` and not through `~/.npmrc`. The credential never lands in a file: the helper sends an `hsurr:` surrogate and authd swaps in the real token on the approved request to registry.npmjs.org. The token authenticates as npm user `ramihollings` and publishes under the `@mrtechnology` scope.

- **Published 2026-11-14 ~17:45 EST, all 0.1.0, public:** `@mrtechnology/tokens`, `@mrtechnology/ui`, `@mrtechnology/ui-native`, in dependency order. Install-verified in a scratch dir (`npm install` resolves all three at 0.1.0) and `npm view <pkg> version` prints 0.1.0 for each.
- **Staged publishing:** a publish PUT returns HTTP 202 `{"success":true}` (accepted, not live). The registry first creates a `0.0.0-stage` stub placeholder ("Temporary package placeholder for staged publishing"), then adds the real version after async processing (about 1–3 minutes in these three publishes). Do not re-PUT while waiting; verify through the abbreviated metadata (`Accept: application/vnd.npm.install-v1+json`) because the full packument GET can return a cached 404 for a brand-new package.
- **Outage on the day:** the VM egress proxy was down for about 10 minutes during the publish (curl and Python both timed out); it recovered on its own. The whoami proof ran after recovery.
- The token cannot list org members (403 on that endpoint). `@mrtechnology/mcp-server` stays private by design and is not published.

## D25 — Source home: GitHub ramihollings/SuprUi (public)

**Picked 2026-11-14 (user's decision):** the design system source lives in a public GitHub repo, [ramihollings/SuprUi](https://github.com/ramihollings/SuprUi), created by the user 2026-11-14. The first push (217 text files, commit `dd24a163`) went through the GitHub connector's snapshot push (`push_files`), which only handles UTF-8 files. The 26 PNG visual-regression baselines (`apps/storybook/tests/visual/__snapshots__/`) cannot go through that route and were held back; they are handed to the user as a zip to upload. Sync provenance for snapshot pushes is recorded in `design-system.muse-github-snapshot-sync.json` next to the repo directory (never inside it). The npm packages are the distribution; GitHub is the source backup and home.

## D26 — Publish scope: `@mrtechnology` → `@suprui` (reverses D23)

**Picked 2026-11-15 (user's decision):** the packages publish under the `@suprui` scope, not `@mrtechnology`. The user: "Throughout the repo is mrtechnology. That looks so off and confusing." Product name stays "Supr UI", GitHub repo stays `ramihollings/SuprUi` — publish-scope only, as D23 was.

- **Correction to D23:** D23 said `@mrtechnology` was "the user's own npm username" needing no org. That was wrong. The token authenticates as npm user `ramihollings` (verified `whoami`), and the registry's org endpoint `/-/org/mrtechnology/package` returns 200 with write access to the three packages — an org named `mrtechnology` exists. The mechanism that made `@mrtechnology` publishable was the org, not a username scope.
- **What `@suprui` needs first (both user-side):** (1) a free npm org named `suprui` created at npmjs.com/org/create — `@suprui` is not the user's npm username, so the org must exist before anything can publish under it (same one-time step as the dropped `@supr` org); (2) a new granular access token scoped to `@suprui` — the 2026-11-14 token is scoped to `@mrtechnology` and almost certainly cannot publish under `@suprui`.
- **Names verified free 2026-11-15 (checked twice):** `@suprui/tokens`, `@suprui/ui`, `@suprui/ui-native`, `@suprui/mcp-server` all 404 on the registry; `/-/org/suprui/package` returns 404 "Scope not found" — the org does not exist yet.
- **Rename:** 356 `@mrtechnology` occurrences in 79 files → `@suprui` (package names, dependency entries, import specifiers, registry, docs, READMEs, AGENTS.md, skill, Figma payloads, demo/e2e configs); `package-lock.json` regenerated from the renamed manifests. Historical records left as written: `BUILD-REPORT-M1.md`, `BUILD-REPORT-M2.md`, and the D1–D25 entries in this file (this decision is the pointer that supersedes them).
- **Publish pending:** republish 0.1.0 as `@suprui/tokens`, `@suprui/ui`, `@suprui/ui-native` in dependency order once the org exists and the new token is submitted; then deprecate the live `@mrtechnology/*` 0.1.0 packages pointing at the new names (they cannot be renamed or removed). `@suprui/mcp-server` stays private by design.
- **Deliberately unchanged:** the `supr://` MCP resource URIs, the `supr_*` MCP tool names, the "Supr UI" product name in prose, the `skills/supr-ui/` directory name, the root `package.json` name `supr-ui`, the `registry.supr.technology` static-host suggestion (still undecided), and the `you@supr.technology` placeholder email in the docs Input example.
- **Re-verification after the rename (2026-11-15, full M2 matrix re-run):** GREEN — tokens 10/10, web 38/38, native 39/39 serialized, demo 4 passed + 1 skipped, MCP 10/10; `tsc` clean in all workspaces; all five workspace builds exit 0 (docs 19 pages); Storybook build succeeds; Playwright 27 passed (smoke 1 + visual 26, baselines unchanged); test-runner 33/33 stories, 0 axe violations; registry validator 23 items OK; e2e validator 8/8 flows, 22 ids; Figma verify 33/33; contrast audit 136 pairs, 0 non-exempt failures. No failures caused by the rename. `@mrtechnology` remains only as deliberate historical publish-record prose in decisions.md (D23/D24/D26), PUBLISH-RUNBOOK.md, AGENTS.md, and README.md — no live reference anywhere.

## Notes / things I did not put to a vote

- **Kumo is patterns, not base** — its semantic tokens, CLI, Figma sync, and AGENTS.md are adopted; its components aren't, because it has no React Native story.
- **Two licenses flagged "not SPDX-classified"** (MCP TypeScript SDK, Lucide) — **both closed in M2 (2026-11-14):** the MCP SDK is MIT as installed (1.32.2; GitHub `main` is mid-transition to Apache-2.0 — permissive either way), and Lucide is ISC AND MIT (see D10/D15).
- **Repo moves found while checking:** `react-native-reusables` now lives under `founded-labs` (was `mrzachnugent`); `style-dictionary` now under its own org (was `amzn`); `docusaurus` now under `meta` (was `facebook`). Links above use the current locations.
- **UI SDK is beta** — if its API moves, D3's fallback is Radix, no redesign needed.
