#!/usr/bin/env python3
"""Generate CONTRAST-AUDIT.md from the before/after audit outputs.

Reads /tmp/contrast-before.md and /tmp/contrast-after.md (produced by
`node scripts/contrast-audit.mjs`) and assembles the durable report.
Test numbers are filled in from the environment (TEST_TOKENS, TEST_WEB,
TEST_NATIVE, TEST_TSC) or left as placeholders.
"""
import os
import re

BEFORE = "/tmp/contrast-before.md"
AFTER = "/tmp/contrast-after.md"
OUT = "/home/hatch/workspace/design-system/CONTRAST-AUDIT.md"

def parse_table(path):
    rows = []
    for line in open(path):
        line = line.strip()
        if not line.startswith("|") or line.startswith("| Component") or line.startswith("|---"):
            continue
        cells = [c.strip() for c in line.strip("|").split("|")]
        if len(cells) != 9:
            continue
        rows.append(cells)
    return rows

def section_list(path):
    txt = open(path).read()
    m = re.search(r"## Failures\n(.*?)\n## Disabled", txt, re.S)
    body = m.group(1).strip() if m else ""
    fails = [l[2:] for l in body.splitlines() if l.startswith("- ")] if body != "None." else []
    m = re.search(r"## Disabled / exempt.*?\n(.*)$", txt, re.S)
    exempt = [l[2:] for l in m.group(1).strip().splitlines()] if m else []
    return fails, exempt

before_rows = parse_table(BEFORE)
after_rows = parse_table(AFTER)
before_fails, before_exempt = section_list(BEFORE)
after_fails, after_exempt = section_list(AFTER)

def key(r):
    return (r[0], r[1], r[2])

before_map = {key(r): r for r in before_rows}
after_map = {key(r): r for r in after_rows}

# Before -> after for every pair that failed before (matched by component+theme+label,
# with label renames handled explicitly).
RENAMES = {
    ("Button", "dark", "Danger label on danger"): ("Button", "dark", "Danger label on danger-solid"),
    ("Button", "light", "Danger label on danger"): ("Button", "light", "Danger label on danger-solid"),
    ("Button", "dark", "Danger label, hover (web, opacity 0.90)"): ("Button", "dark", "Danger label on danger-hover (hover/pressed)"),
    ("Button", "light", "Danger label, hover (web, opacity 0.90)"): ("Button", "light", "Danger label on danger-hover (hover/pressed)"),
    ("Button", "dark", "Danger label, pressed (native, opacity 0.85)"): ("Button", "dark", "Danger label on danger-hover (hover/pressed)"),
    ("Button", "light", "Danger label, pressed (native, opacity 0.85)"): ("Button", "light", "Danger label on danger-hover (hover/pressed)"),
    ("Switch", "dark", "Web thumb (text) on track surface, unchecked"): ("Switch", "dark", "Web thumb (text) on track, unchecked"),
    ("Switch", "light", "Web thumb (text) on track surface, unchecked"): ("Switch", "light", "Web thumb (text) on track, unchecked"),
    ("Switch", "dark", "Web track (surface) vs page, unchecked"): ("Switch", "dark", "Web/native track (track) vs page, unchecked"),
    ("Switch", "light", "Web track (surface) vs page, unchecked"): ("Switch", "light", "Web/native track (track) vs page, unchecked"),
    ("Switch", "dark", "Native track (border-strong) vs page, unchecked"): ("Switch", "dark", "Web/native track (track) vs page, unchecked"),
    ("Switch", "light", "Native track (border-strong) vs page, unchecked"): ("Switch", "light", "Web/native track (track) vs page, unchecked"),
    ("Switch", "dark", "Native thumb (brand-fg) on track (border-strong), unchecked"): ("Switch", "dark", "Native thumb (brand-fg) on track, unchecked"),
    ("Switch", "light", "Native thumb (brand-fg) on track (border-strong), unchecked"): ("Switch", "light", "Native thumb (brand-fg) on track, unchecked"),
}
changed = []
for r in before_rows:
    if "**FAIL**" in r[8]:
        k = key(r)
        ak = RENAMES.get(k, k)
        a = after_map.get(ak)
        changed.append((r, a))

test_tokens = os.environ.get("TEST_TOKENS", "pending")
test_web = os.environ.get("TEST_WEB", "pending")
test_native = os.environ.get("TEST_NATIVE", "pending")
test_tsc = os.environ.get("TEST_TSC", "pending")

lines = []
lines.append("# Supr UI — WCAG Contrast Audit")
lines.append("")
lines.append("**Date:** 2026-11-13/14 (workstream 9, Milestone 2). **Auditor:** workstream 9.")
lines.append("**Reproduce:** `node scripts/contrast-audit.mjs` — reads the token source of truth")
lines.append("(`tokens/color.json`), resolves W3C DTCG references, and computes WCAG 2.x")
lines.append("contrast ratios for every meaningful text/background pair in all 10 components,")
lines.append("both themes. Exit code is always 0; this is a report, not a gate.")
lines.append("")
lines.append("## Result")
lines.append("")
lines.append(f"- **Before fixes:** 13 failures out of 142 pairs checked (71 per theme).")
lines.append(f"- **After fixes:** 0 failures out of 136 pairs checked (68 per theme).")
lines.append("- **Disabled states:** 9 pairs below 4.5:1 after compositing real opacity —")
lines.append("  WCAG exempts inactive/disabled controls, so these are reported, not failures.")
lines.append("  (Same 9 pairs as before the fix; only the dark danger-disabled ratio moved,")
lines.append("  3.71:1 → 3.94:1, because the disabled danger Button now sits on `danger-solid`.)")
lines.append("")
lines.append("## Method and assumptions")
lines.append("")
lines.append("- **Thresholds:** normal text 4.5:1, large text 3:1, non-text UI components /")
lines.append("  icons / focus indicators 3:1 (WCAG 1.4.11). **No component text qualifies as")
lines.append("  large:** the largest text is 18px semibold (Dialog title, Card title — 13.5pt")
lines.append("  bold; large needs 18pt, or 14pt bold), so every text pair is judged at 4.5:1.")
lines.append("- **Transparent backgrounds** (Button outline/ghost) are judged against the page")
lines.append("  background — components sit on `--color-background` unless a surface is stated.")
lines.append("- **Disabled states** are composited with real alpha math: the element at its")
lines.append("  opacity over the page background, then its text over the resulting background.")
lines.append("  WCAG 1.4.3 exempts disabled controls; they are listed for information only.")
lines.append("- **Focus indicators** (`--color-focus`, cobalt #1456F0) are judged at 3:1 against")
lines.append("  each surface they can appear on. Dark worst case is 3.17:1 (on surface-raised).")
lines.append("- **Not covered:** the Dialog backdrop (`bg-background/70`) carries no text;")
lines.append("  Toast `limit` and motion are out of scope. No real-browser visual check was")
lines.append("  done (see Unverified).")
lines.append("")
lines.append("## Token values audited (from `tokens/color.json`, resolved)")
lines.append("")
lines.append("| Token | Dark | Light |")
lines.append("|---|---|---|")
for name, dark, light in [
    ("background", "#000000", "#FFFFFF"),
    ("surface", "#0A0A0A", "#F5F5F5"),
    ("surface-raised", "#141414", "#FFFFFF"),
    ("border", "#262626", "#E5E5E5"),
    ("border-strong", "#404040", "#D4D4D4"),
    ("text", "#FFFFFF", "#000000"),
    ("text-muted", "#A3A3A3", "#525252"),
    ("brand", "#1456F0", "#1456F0"),
    ("brand-hover", "#1045C0", "#1045C0"),
    ("brand-foreground", "#FFFFFF", "#FFFFFF"),
    ("danger", "#EF4444", "#DC2626"),
    ("danger-hover", "#B91C1C", "#B91C1C"),
    ("danger-solid", "#DC2626", "#DC2626"),
    ("success", "#22C55E", "#16A34A"),
    ("warning", "#F59E0B", "#D97706"),
    ("focus", "#1456F0", "#1456F0"),
    ("track", "#737373", "#737373"),
]:
    lines.append(f"| `{name}` | {dark} | {light} |")
lines.append("")
lines.append("## The 13 failures found — and what fixed each one")
lines.append("")
lines.append("Before → after ratios for every pair that failed the first run.")
lines.append("")
lines.append("| Component | Theme | Pair | Before | After | Fix |")
lines.append("|---|---|---|---|---|---|")
FIX = {
    "Primary label on brand-hover (hover/pressed)": "dark `brand-hover`: cobalt-400 #4378F3 → cobalt-600 #1045C0 (existing-value change, see below)",
    "Danger label on danger": "dark `danger` split: Button rest bg is now `danger-solid` #DC2626 (new token); see the revert note below",
    "Danger label, hover (web, opacity 0.90)": "web danger hover: `hover:opacity-90` → `hover:bg-danger-hover` #B91C1C (new token)",
    "Danger label, pressed (native, opacity 0.85)": "native danger pressed: opacity 0.85 → solid `danger-hover` #B91C1C (new token)",
    "Danger label on danger-hover (hover/pressed)": "solid `danger-hover` #B91C1C (new token) replaces opacity feedback",
    "Web track (surface) vs page, unchecked": "web Switch track: `bg-surface` → `bg-track` #737373 (new token); border removed",
    "Web track border (border-strong) vs page, unchecked": "web Switch border removed — the track fill is the boundary now",
    "Native track (border-strong) vs page, unchecked": "native Switch track: `borderStrong` → `track` #737373 (new token); border removed",
    "Native thumb (brand-fg) on track (border-strong), unchecked": "native Switch track is now `track` #737373 (new token)",
}
for b, a in changed:
    label = b[2]
    fix = FIX.get(label, "")
    after_ratio = a[6] if a else "— (pair removed with the border)"
    lines.append(f"| {b[0]} | {b[1]} | {label} | {b[6]} | {after_ratio} | {fix} |")
lines.append("")
lines.append("### Fix 1 — dark `brand-hover`: cobalt-400 → cobalt-600 (existing value changed)")
lines.append("")
lines.append("White text on dark `brand-hover` (#4378F3, cobalt-400) was **4.02:1**, below AA")
lines.append("4.5:1 — every primary Button hover/press in dark failed. Light already used")
lines.append("cobalt-600 (#1045C0, 7.97:1), so dark now uses the same value: **7.97:1** in both")
lines.append("themes. The cobalt ramp itself is untouched (#4378F3 stays as cobalt-400); only")
lines.append("the dark semantic mapping changed, and the stale ramp descriptions were corrected")
lines.append("(cobalt-400 is no longer any theme's brand-hover).")
lines.append("")
lines.append("### Fix 2 — danger: one red could not serve two roles in dark (value changed, then reverted)")
lines.append("")
lines.append("The first attempt unified dark `danger` to #DC2626 (the light value). That fixed")
lines.append("the danger Button — white on #DC2626 is 4.83:1 — but **broke Input error text**:")
lines.append("#DC2626 on a black page is **4.35:1** (was 5.58:1 with #EF4444). The two roles")
lines.append("are mathematically incompatible in dark: white-on-red needs the red's luminance")
lines.append("≤ 0.183, red-on-black needs it ≥ 0.175, and #DC2626 sits at 0.168. So the roles")
lines.append("were split and dark `danger` was **reverted to #EF4444** (final value):")
lines.append("")
lines.append("- `danger` #EF4444 (dark) / #DC2626 (light) — error *text*, error border, Toast")
lines.append("  error icon. Dark error text on black: 5.58:1.")
lines.append("- `danger-solid` #DC2626 (both themes, **new token**) — filled danger Button")
lines.append("  background (rest state). White label: 4.83:1 in both themes.")
lines.append("- `danger-hover` #B91C1C (both themes, **new token**) — danger Button hover (web)")
lines.append("  / pressed (native) background. White label: 6.47:1 in both themes.")
lines.append("")
lines.append("Opacity-based press/hover feedback on the danger Button is gone on both platforms:")
lines.append("blending white-on-red toward the page at 0.85–0.90 opacity dropped the label to")
lines.append("3.31:1 (light, native pressed) – 4.00:1 (dark, native pressed) / 3.76:1 (light, web")
lines.append("hover) / 3.96:1 (dark, web hover). A solid darker token is the only fix — no")
lines.append("opacity < 1 on a filled button can pass 4.5:1 in light, because the page shows")
lines.append("through both the background and the text.")
lines.append("")
lines.append("### Fix 3 — Switch unchecked track: new `track` token, borders removed")
lines.append("")
lines.append("The unchecked Switch was the worst light-theme failure and a dark-theme one too:")
lines.append("web track `surface` vs page was 1.06:1 dark / 1.09:1 light; the `border-strong`")
lines.append("rim was 2.03:1 dark / 1.48:1 light; and the native white thumb on the light track")
lines.append("was 1.48:1. The new semantic token `track` (#737373, black-700, both themes)")
lines.append("fixes all of them: track vs page is 4.43:1 dark / 4.74:1 light, web thumb on it")
lines.append("4.74:1 dark / 4.43:1 light, native thumb 4.74:1 both themes (WCAG 1.4.11 needs")
lines.append("3:1). The 1px `border-strong` rim was removed from the Switch track on both")
lines.append("platforms — the fill itself is now the control boundary, and a rim in")
lines.append("`border-strong` would still fail 3:1 against the page in both themes. (House rule:")
lines.append("`border-strong` is only for borders that must read as a boundary; here it isn't one.)")
lines.append("")
lines.append("### What did NOT fail — closest calls worth knowing")
lines.append("")
lines.append("- Focus indicator on dark raised surfaces: **3.17:1** (needs 3:1) — passes, but")
lines.append("  it is the thinnest margin in the system. Any future darkening of")
lines.append("  `surface-raised` or lightening of `focus` breaks it; re-run the audit.")
lines.append("- Toast success icon, light: **3.30:1**; warning icon, light: **3.19:1** (non-text,")
lines.append("  need 3:1). Both pass, both are thin — do not lighten `success`/`warning` light.")
lines.append("- Select check icon (brand) on dark raised surfaces: **3.17:1** — same thin margin")
lines.append("  as the focus indicator (same color, same background).")
lines.append("- Light danger Button label: **4.83:1** (needs 4.5:1). Comfortable, but it is the")
lines.append("  lowest text ratio in the system after the fixes.")
lines.append("")
lines.append("## Full ratio table — after fixes (136 pairs, 0 failures)")
lines.append("")
lines.append("| Component | Theme | Pair | Kind | FG | BG | Ratio | Req. | Result |")
lines.append("|---|---|---|---|---|---|---|---|---|")
for r in after_rows:
    lines.append("| " + " | ".join(r) + " |")
lines.append("")
lines.append("## Disabled / exempt pairs below threshold (WCAG-exempt, informational)")
lines.append("")
lines.append("Disabled controls are exempt from WCAG 1.4.3. These are listed so the low")
lines.append("numbers are not mistaken for hidden failures. Composited with real alpha math")
lines.append("(element opacity over the page background).")
lines.append("")
for e in after_exempt:
    lines.append(f"- {e}")
lines.append("")
lines.append("## Files created / changed")
lines.append("")
lines.append("### Created")
lines.append("")
lines.append("- `scripts/contrast-audit.mjs` — the reproducible audit (reads `tokens/color.json`,")
lines.append("  computes all ratios, prints the table; `--json` for machine-readable output).")
lines.append("- `scripts/generate-contrast-report.py` — assembles this report from the audit's")
lines.append("  before/after outputs (deterministic; re-run with the TEST_* env vars to")
lines.append("  refresh the verification numbers).")
lines.append("- `CONTRAST-AUDIT.md` — this report.")
lines.append("")
lines.append("### Changed — tokens (source of truth; `dist/` rebuilt, never hand-edited)")
lines.append("")
lines.append("- `tokens/color.json`")
lines.append("  - **Added** `danger-hover` #B91C1C (both themes), `danger-solid` #DC2626 (both")
lines.append("    themes), `track` #737373 = `{color.black.700}` (both themes) to the semantic")
lines.append("    sets, dark and light.")
lines.append("  - **Changed (explicit, justified above):** dark `brand-hover`")
lines.append("    `{color.cobalt.400}` → `{color.cobalt.600}`; dark `danger` was briefly #DC2626")
lines.append("    and was **reverted to #EF4444** (final). The cobalt ramp is untouched.")
lines.append("  - Description-only: cobalt-400/600 descriptions corrected (400 is no longer")
lines.append("    any theme's brand-hover).")
lines.append("- `packages/tokens/style-dictionary.config.mjs` — `SEMANTIC_COLORS` gains the three")
lines.append("  new keys; native `buildThemeObject` + `ThemeColors` interface gain")
lines.append("  `dangerHover`, `dangerSolid`, `track`. (Config, not generated output — the")
lines.append("  format functions enumerate semantic colors explicitly, so new tokens do not")
lines.append("  flow through unless listed here. All three are wired into **both** the web CSS")
lines.append("  vars (`--color-danger-hover`, `--color-danger-solid`, `--color-track`, in `:root`,")
lines.append("  `[data-theme=\"light\"]`, and the `@theme inline` mapping, so `bg-danger-hover`,")
lines.append("  `bg-danger-solid`, `bg-track` utilities exist) **and** the native theme object")
lines.append("  (`theme.dark.colors` / `theme.light.colors` + compiled `theme.js`). Verified on")
lines.append("  disk after the final build; the tokens test's `toEqual` on the full colors")
lines.append("  object independently proves it.)")
lines.append("- `packages/tokens/test/tokens.test.ts` — contract updated to the new color sets")
lines.append("  (dark `brandHover` #1045C0, dark `danger` #EF4444, new keys both themes) plus")
lines.append("  `web.css` assertions for the three new variables and their `@theme` mappings.")
lines.append("")
lines.append("### Changed — components (theme/styling fixes only; no API, prop, or behavior changes)")
lines.append("")
lines.append("- `packages/web/src/components/button/Button.tsx` — danger variant:")
lines.append("  `bg-danger … hover:opacity-90` → `bg-danger-solid … hover:bg-danger-hover`.")
lines.append("- `packages/native/src/components/button/Button.tsx` — danger variant: pressed state")
lines.append("  now swaps to `t.colors.dangerHover` (rest: `t.colors.dangerSolid`); the 0.85")
lines.append("  opacity press multiplier is removed (disabled 0.5 stays).")
lines.append("- `packages/web/src/components/switch/Switch.tsx` — unchecked track `bg-surface` →")
lines.append("  `bg-track`; `border border-border-strong` and `data-[checked]:border-brand` removed.")
lines.append("- `packages/native/src/components/switch/Switch.tsx` — unchecked track")
lines.append("  `borderStrong` → `t.colors.track`; `borderWidth.thin` + `borderColor` removed")
lines.append("  (`borderWidth.none`).")
lines.append("- `packages/web/src/components/button/Button.test.tsx` — danger assertion tightened")
lines.append("  from `bg-danger` to `bg-danger-solid` (the old substring assertion would still")
lines.append("  have passed; the class actually changed).")
lines.append("- `packages/native/test/theme.test.tsx` — contract test updated: dark `brandHover`")
lines.append("  #4378F3 → #1045C0, plus assertions locking the new keys (`dangerHover`,")
lines.append("  `dangerSolid`, `track`) and dark `danger` #EF4444. (This file was missed in")
lines.append("  the first test update and failed the first native re-run — 38/39 — before")
lines.append("  being fixed; see Verification.)")
lines.append("- `apps/docs/src/content/docs/tokens/color.md` — Starlight docs synced to the new")
lines.append("  values: `brand-hover` dark #1045C0, new `danger-hover` / `danger-solid` /")
lines.append("  `track` rows, native keys list, and a Rules line pointing at this audit.")
lines.append("  (Docs only — no code. Figma plugin artifacts regenerate at assembly per the")
lines.append("  coordinator; `figma-plugin/tokens.json` was not hand-edited.)")
lines.append("")
lines.append("### NOT changed (per scope)")
lines.append("")
lines.append("- `decisions.md`, `AGENTS.md`, `skills/supr-ui/SKILL.md` — untouched. Proposed")
lines.append("  updates for the new tokens are at the end of this report.")
lines.append("- No existing token value was changed except dark `brand-hover` (justified above)")
lines.append("  and the reverted dark `danger` excursion (final value = original #EF4444).")
lines.append("- No component APIs, props, or behavior changed. No 11th component. No raw hex,")
lines.append("  pixel, or duration literals in components — tokens only.")
lines.append("")
lines.append("## Verification — full M1 test matrix re-run after the last token edit")
lines.append("")
lines.append(f"- Tokens Vitest: **{test_tokens}** (was 10 in M1)")
lines.append(f"- Web Vitest: **{test_web}** (was 38 in M1)")
lines.append(f"- Native Vitest (`--fileParallelism=false`, serialized): **{test_native}** (was 39 in M1)")
lines.append(f"- `tsc` across all workspaces: **{test_tsc}**")
lines.append("")
lines.append("Native-run note (honest accounting): the first full-suite run after the")
lines.append("fixes showed 38/39, with the single failure being `test/theme.test.tsx`")
lines.append("asserting the old dark `brandHover` #4378F3 — a contract test I had missed")
lines.append("when updating the tokens test (fixed in the test, not the code; see Files).")
lines.append("Two subsequent full-suite runs wedged mid-run: after a few files, the main")
lines.append("vitest process and its fork worker both sat idle in `epoll_wait` with no log")
lines.append("progress for 10+ minutes — a tinypool IPC stall under the shared machine's")
lines.append("load (load average was 6.08 at the time; other workstreams were running")
lines.append("vitest concurrently), not a test failure. The 39/39 above is therefore")
lines.append("composed of two serialized runs with the identical flags:")
lines.append("15/15 (theme 7, select 5, tabs 3) plus 24/24 (avatar 3, button 5, card 1,")
lines.append("dialog 3, input 3, popover 3, switch 3, toast 3) — every one of the 11 test")
lines.append("files green, no file run twice counted twice. If the parent wants a single")
lines.append("uninterrupted 39/39 run, re-run it when the machine is quiet; the suite")
lines.append("itself is green.")
lines.append("")
lines.append("## Unverified — and why")
lines.append("")
lines.append("- **No real-browser / on-device visual check.** Ratios are computed from token")
lines.append("  values, which is exact for contrast math, but the Switch's new gray track and")
lines.append("  the danger Button's new hover color have not been eyeballed in a browser or on")
lines.append("  Android. (Subagent cannot drive a live browser; Storybook visual check is a")
lines.append("  follow-up for the parent.)")
lines.append("- **Tailwind utility existence** for `bg-track` / `bg-danger-solid` /")
lines.append("  `bg-danger-hover` is proven by the `@theme inline` mapping in the rebuilt")
lines.append("  `dist/web.css` (all three `--color-*` vars mapped with `var()`), not by a")
lines.append("  compiled-CSS grep — Tailwind v4 generates utilities from `@theme` at build time.")
lines.append("- **Playwright / axe were not re-run.** This workstream's matrix is Vitest + tsc;")
lines.append("  the changes are color-only (no DOM/ARIA/structure change), so no new axe")
lines.append("  violation is expected — but the Storybook axe gate should still run at assembly.")
lines.append("- **No axe suppression was added or needed.** No violations were suppressed anywhere.")
lines.append("")
lines.append("## Proposed decisions.md entry (not added — decisions.md is not mine to edit)")
lines.append("")
lines.append("No new tool or dependency was picked (the audit is a dependency-free Node script),")
lines.append("so no D-entry is proposed. For the record, the contrast fixes rest on two rules")
lines.append("that a future D-entry could capture if the parent wants them decided rather than")
lines.append("merely documented:")
lines.append("")
lines.append("- Hover/pressed states must pass the same contrast bar as rest states — opacity")
lines.append("  feedback on a filled button cannot pass AA in light, so press/hover feedback on")
lines.append("  filled buttons uses a solid darker token, never an opacity multiplier.")
lines.append("- A semantic token's roles must share one contrast direction: if a color is both a")
lines.append("  text color on dark surfaces and a filled background for white text, it needs two")
lines.append("  tokens (`danger` vs `danger-solid`), because no single dark-theme red satisfies both.")
lines.append("")
lines.append("## Proposed AGENTS.md / SKILL.md edits (not applied — those files are not mine to edit)")
lines.append("")
lines.append("AGENTS.md — Tokens table, Color row: add `--color-danger-hover`,")
lines.append("`--color-danger-solid`, `--color-track` to the listed variables. Add to the")
lines.append("Accessibility rules, after 'Contrast must hold in both themes, dark and light.':")
lines.append("")
lines.append("> Contrast must hold in every state, not just rest: hover/pressed labels are")
lines.append("> judged at the same bar as rest labels. Never use an opacity multiplier for")
lines.append("> press/hover feedback on a filled button — use a solid darker token")
lines.append("> (`danger-hover`). The Switch unchecked track uses `--color-track`; do not give")
lines.append("> it a `border-strong` rim (the rim fails 3:1 against the page in both themes).")
lines.append("> Re-run `node scripts/contrast-audit.mjs` after any color-token change; it must")
lines.append("> report 0 non-exempt failures.")
lines.append("")
lines.append("SKILL.md — token table (line ~68-73): add rows for `--color-danger-hover`,")
lines.append("`--color-danger-solid`, `--color-track`; and update the native `colors` key list")
lines.append("(line ~79) to: `background`, `surface`, `surfaceRaised`, `border`,")
lines.append("`borderStrong`, `text`, `textMuted`, `brand`, `brandHover`, `brandForeground`,")
lines.append("`danger`, `dangerHover`, `dangerSolid`, `success`, `warning`, `track`.")
lines.append("")

open(OUT, "w").write("\n".join(lines))
print(f"wrote {OUT}")
print(f"before rows: {len(before_rows)}, after rows: {len(after_rows)}")
print(f"before failures: {len(before_fails)}, after failures: {len(after_fails)}")
print(f"after exempt: {len(after_exempt)}")
