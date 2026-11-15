# Supr UI — WCAG Contrast Audit

**Date:** 2026-11-13/14 (workstream 9, Milestone 2). **Auditor:** workstream 9.
**Reproduce:** `node scripts/contrast-audit.mjs` — reads the token source of truth
(`tokens/color.json`), resolves W3C DTCG references, and computes WCAG 2.x
contrast ratios for every meaningful text/background pair in all 10 components,
both themes. Exit code is always 0; this is a report, not a gate.

## Result

- **Before fixes:** 13 failures out of 142 pairs checked (71 per theme).
- **After fixes:** 0 failures out of 136 pairs checked (68 per theme).
- **Disabled states:** 9 pairs below 4.5:1 after compositing real opacity —
  WCAG exempts inactive/disabled controls, so these are reported, not failures.
  (Same 9 pairs as before the fix; only the dark danger-disabled ratio moved,
  3.71:1 → 3.94:1, because the disabled danger Button now sits on `danger-solid`.)

## Method and assumptions

- **Thresholds:** normal text 4.5:1, large text 3:1, non-text UI components /
  icons / focus indicators 3:1 (WCAG 1.4.11). **No component text qualifies as
  large:** the largest text is 18px semibold (Dialog title, Card title — 13.5pt
  bold; large needs 18pt, or 14pt bold), so every text pair is judged at 4.5:1.
- **Transparent backgrounds** (Button outline/ghost) are judged against the page
  background — components sit on `--color-background` unless a surface is stated.
- **Disabled states** are composited with real alpha math: the element at its
  opacity over the page background, then its text over the resulting background.
  WCAG 1.4.3 exempts disabled controls; they are listed for information only.
- **Focus indicators** (`--color-focus`, cobalt #1456F0) are judged at 3:1 against
  each surface they can appear on. Dark worst case is 3.17:1 (on surface-raised).
- **Not covered:** the Dialog backdrop (`bg-background/70`) carries no text;
  Toast `limit` and motion are out of scope. No real-browser visual check was
  done (see Unverified).

## Token values audited (from `tokens/color.json`, resolved)

| Token | Dark | Light |
|---|---|---|
| `background` | #000000 | #FFFFFF |
| `surface` | #0A0A0A | #F5F5F5 |
| `surface-raised` | #141414 | #FFFFFF |
| `border` | #262626 | #E5E5E5 |
| `border-strong` | #404040 | #D4D4D4 |
| `text` | #FFFFFF | #000000 |
| `text-muted` | #A3A3A3 | #525252 |
| `brand` | #1456F0 | #1456F0 |
| `brand-hover` | #1045C0 | #1045C0 |
| `brand-foreground` | #FFFFFF | #FFFFFF |
| `danger` | #EF4444 | #DC2626 |
| `danger-hover` | #B91C1C | #B91C1C |
| `danger-solid` | #DC2626 | #DC2626 |
| `success` | #22C55E | #16A34A |
| `warning` | #F59E0B | #D97706 |
| `focus` | #1456F0 | #1456F0 |
| `track` | #737373 | #737373 |

## The 13 failures found — and what fixed each one

Before → after ratios for every pair that failed the first run.

| Component | Theme | Pair | Before | After | Fix |
|---|---|---|---|---|---|
| Button | dark | Primary label on brand-hover (hover/pressed) | 4.02:1 | 7.97:1 | dark `brand-hover`: cobalt-400 #4378F3 → cobalt-600 #1045C0 (existing-value change, see below) |
| Button | dark | Danger label on danger | 3.76:1 | 4.83:1 | dark `danger` split: Button rest bg is now `danger-solid` #DC2626 (new token); see the revert note below |
| Button | dark | Danger label, hover (web, opacity 0.90) | 3.96:1 | 6.47:1 | web danger hover: `hover:opacity-90` → `hover:bg-danger-hover` #B91C1C (new token) |
| Button | dark | Danger label, pressed (native, opacity 0.85) | 4.00:1 | 6.47:1 | native danger pressed: opacity 0.85 → solid `danger-hover` #B91C1C (new token) |
| Switch | dark | Web track (surface) vs page, unchecked | 1.06:1 | 4.43:1 | web Switch track: `bg-surface` → `bg-track` #737373 (new token); border removed |
| Switch | dark | Web track border (border-strong) vs page, unchecked | 2.03:1 | — (pair removed with the border) | web Switch border removed — the track fill is the boundary now |
| Switch | dark | Native track (border-strong) vs page, unchecked | 2.03:1 | 4.43:1 | native Switch track: `borderStrong` → `track` #737373 (new token); border removed |
| Button | light | Danger label, hover (web, opacity 0.90) | 3.76:1 | 6.47:1 | web danger hover: `hover:opacity-90` → `hover:bg-danger-hover` #B91C1C (new token) |
| Button | light | Danger label, pressed (native, opacity 0.85) | 3.31:1 | 6.47:1 | native danger pressed: opacity 0.85 → solid `danger-hover` #B91C1C (new token) |
| Switch | light | Web track (surface) vs page, unchecked | 1.09:1 | 4.74:1 | web Switch track: `bg-surface` → `bg-track` #737373 (new token); border removed |
| Switch | light | Web track border (border-strong) vs page, unchecked | 1.48:1 | — (pair removed with the border) | web Switch border removed — the track fill is the boundary now |
| Switch | light | Native thumb (brand-fg) on track (border-strong), unchecked | 1.48:1 | 4.74:1 | native Switch track is now `track` #737373 (new token) |
| Switch | light | Native track (border-strong) vs page, unchecked | 1.48:1 | 4.74:1 | native Switch track: `borderStrong` → `track` #737373 (new token); border removed |

### Fix 1 — dark `brand-hover`: cobalt-400 → cobalt-600 (existing value changed)

White text on dark `brand-hover` (#4378F3, cobalt-400) was **4.02:1**, below AA
4.5:1 — every primary Button hover/press in dark failed. Light already used
cobalt-600 (#1045C0, 7.97:1), so dark now uses the same value: **7.97:1** in both
themes. The cobalt ramp itself is untouched (#4378F3 stays as cobalt-400); only
the dark semantic mapping changed, and the stale ramp descriptions were corrected
(cobalt-400 is no longer any theme's brand-hover).

### Fix 2 — danger: one red could not serve two roles in dark (value changed, then reverted)

The first attempt unified dark `danger` to #DC2626 (the light value). That fixed
the danger Button — white on #DC2626 is 4.83:1 — but **broke Input error text**:
#DC2626 on a black page is **4.35:1** (was 5.58:1 with #EF4444). The two roles
are mathematically incompatible in dark: white-on-red needs the red's luminance
≤ 0.183, red-on-black needs it ≥ 0.175, and #DC2626 sits at 0.168. So the roles
were split and dark `danger` was **reverted to #EF4444** (final value):

- `danger` #EF4444 (dark) / #DC2626 (light) — error *text*, error border, Toast
  error icon. Dark error text on black: 5.58:1.
- `danger-solid` #DC2626 (both themes, **new token**) — filled danger Button
  background (rest state). White label: 4.83:1 in both themes.
- `danger-hover` #B91C1C (both themes, **new token**) — danger Button hover (web)
  / pressed (native) background. White label: 6.47:1 in both themes.

Opacity-based press/hover feedback on the danger Button is gone on both platforms:
blending white-on-red toward the page at 0.85–0.90 opacity dropped the label to
3.31:1 (light, native pressed) – 4.00:1 (dark, native pressed) / 3.76:1 (light, web
hover) / 3.96:1 (dark, web hover). A solid darker token is the only fix — no
opacity < 1 on a filled button can pass 4.5:1 in light, because the page shows
through both the background and the text.

### Fix 3 — Switch unchecked track: new `track` token, borders removed

The unchecked Switch was the worst light-theme failure and a dark-theme one too:
web track `surface` vs page was 1.06:1 dark / 1.09:1 light; the `border-strong`
rim was 2.03:1 dark / 1.48:1 light; and the native white thumb on the light track
was 1.48:1. The new semantic token `track` (#737373, black-700, both themes)
fixes all of them: track vs page is 4.43:1 dark / 4.74:1 light, web thumb on it
4.74:1 dark / 4.43:1 light, native thumb 4.74:1 both themes (WCAG 1.4.11 needs
3:1). The 1px `border-strong` rim was removed from the Switch track on both
platforms — the fill itself is now the control boundary, and a rim in
`border-strong` would still fail 3:1 against the page in both themes. (House rule:
`border-strong` is only for borders that must read as a boundary; here it isn't one.)

### What did NOT fail — closest calls worth knowing

- Focus indicator on dark raised surfaces: **3.17:1** (needs 3:1) — passes, but
  it is the thinnest margin in the system. Any future darkening of
  `surface-raised` or lightening of `focus` breaks it; re-run the audit.
- Toast success icon, light: **3.30:1**; warning icon, light: **3.19:1** (non-text,
  need 3:1). Both pass, both are thin — do not lighten `success`/`warning` light.
- Select check icon (brand) on dark raised surfaces: **3.17:1** — same thin margin
  as the focus indicator (same color, same background).
- Light danger Button label: **4.83:1** (needs 4.5:1). Comfortable, but it is the
  lowest text ratio in the system after the fixes.

## Full ratio table — after fixes (136 pairs, 0 failures)

| Component | Theme | Pair | Kind | FG | BG | Ratio | Req. | Result |
|---|---|---|---|---|---|---|---|---|
| Global | dark | Primary text on page | text | #FFFFFF | #000000 | 21.00:1 | 4.5:1 | PASS |
| Global | dark | Muted text on page | text | #A3A3A3 | #000000 | 8.33:1 | 4.5:1 | PASS |
| Global | dark | Primary text on surface | text | #FFFFFF | #0A0A0A | 19.80:1 | 4.5:1 | PASS |
| Global | dark | Muted text on surface | text | #A3A3A3 | #0A0A0A | 7.85:1 | 4.5:1 | PASS |
| Global | dark | Primary text on raised surface | text | #FFFFFF | #141414 | 18.42:1 | 4.5:1 | PASS |
| Global | dark | Muted text on raised surface | text | #A3A3A3 | #141414 | 7.30:1 | 4.5:1 | PASS |
| Global | dark | Focus indicator on page | non-text | #1456F0 | #000000 | 3.62:1 | 3.0:1 | PASS |
| Global | dark | Focus indicator on surface | non-text | #1456F0 | #0A0A0A | 3.41:1 | 3.0:1 | PASS |
| Global | dark | Focus indicator on raised surface | non-text | #1456F0 | #141414 | 3.17:1 | 3.0:1 | PASS |
| Button | dark | Primary label on brand | text | #FFFFFF | #1456F0 | 5.80:1 | 4.5:1 | PASS |
| Button | dark | Primary label on brand-hover (hover/pressed) | text | #FFFFFF | #1045C0 | 7.97:1 | 4.5:1 | PASS |
| Button | dark | Secondary label on raised surface | text | #FFFFFF | #141414 | 18.42:1 | 4.5:1 | PASS |
| Button | dark | Secondary label on surface (hover/pressed) | text | #FFFFFF | #0A0A0A | 19.80:1 | 4.5:1 | PASS |
| Button | dark | Outline label on page (transparent bg) | text | #FFFFFF | #000000 | 21.00:1 | 4.5:1 | PASS |
| Button | dark | Outline label on surface (hover) | text | #FFFFFF | #0A0A0A | 19.80:1 | 4.5:1 | PASS |
| Button | dark | Ghost label on page (transparent bg) | text | #FFFFFF | #000000 | 21.00:1 | 4.5:1 | PASS |
| Button | dark | Ghost label on surface (hover) | text | #FFFFFF | #0A0A0A | 19.80:1 | 4.5:1 | PASS |
| Button | dark | Danger label on danger-solid | text | #FFFFFF | #DC2626 | 4.83:1 | 4.5:1 | PASS |
| Button | dark | Danger label on danger-hover (hover/pressed) | text | #FFFFFF | #B91C1C | 6.47:1 | 4.5:1 | PASS |
| Button | dark | Primary label, disabled (opacity 0.50) | text | #FFFFFF → #8595BC | #1456F0 → #0A2B78 | 4.31:1 | 4.5:1 | below (exempt: disabled) |
| Button | dark | Secondary label, disabled (opacity 0.50) | text | #FFFFFF → #858585 | #141414 → #0A0A0A | 5.37:1 | 4.5:1 | PASS |
| Button | dark | Outline label, disabled (opacity 0.50) | text | #FFFFFF → #808080 | #000000 → #000000 | 5.32:1 | 4.5:1 | PASS |
| Button | dark | Danger label, disabled (opacity 0.50) | text | #FFFFFF → #B78989 | #DC2626 → #6E1313 | 3.94:1 | 4.5:1 | below (exempt: disabled) |
| Input | dark | Value text on surface | text | #FFFFFF | #0A0A0A | 19.80:1 | 4.5:1 | PASS |
| Input | dark | Placeholder (muted) on surface | text | #A3A3A3 | #0A0A0A | 7.85:1 | 4.5:1 | PASS |
| Input | dark | Label on page | text | #FFFFFF | #000000 | 21.00:1 | 4.5:1 | PASS |
| Input | dark | Error text on page | text | #EF4444 | #000000 | 5.58:1 | 4.5:1 | PASS |
| Input | dark | Error border on surface | non-text | #EF4444 | #0A0A0A | 5.26:1 | 3.0:1 | PASS |
| Input | dark | Value text, disabled (opacity 0.50) | text | #FFFFFF → #828282 | #0A0A0A → #050505 | 5.30:1 | 4.5:1 | PASS |
| Dialog | dark | Title on raised surface | text | #FFFFFF | #141414 | 18.42:1 | 4.5:1 | PASS |
| Dialog | dark | Description (muted) on raised surface | text | #A3A3A3 | #141414 | 7.30:1 | 4.5:1 | PASS |
| Dialog | dark | Body text on raised surface | text | #FFFFFF | #141414 | 18.42:1 | 4.5:1 | PASS |
| Dialog | dark | Close icon (muted) on raised surface | non-text | #A3A3A3 | #141414 | 7.30:1 | 3.0:1 | PASS |
| Dialog | dark | Close icon on surface (hover bg) | non-text | #FFFFFF | #0A0A0A | 19.80:1 | 3.0:1 | PASS |
| Popover | dark | Content text on raised surface | text | #FFFFFF | #141414 | 18.42:1 | 4.5:1 | PASS |
| Select | dark | Trigger value on surface | text | #FFFFFF | #0A0A0A | 19.80:1 | 4.5:1 | PASS |
| Select | dark | Trigger placeholder (muted) on surface | text | #A3A3A3 | #0A0A0A | 7.85:1 | 4.5:1 | PASS |
| Select | dark | Label on page | text | #FFFFFF | #000000 | 21.00:1 | 4.5:1 | PASS |
| Select | dark | Option text on raised surface | text | #FFFFFF | #141414 | 18.42:1 | 4.5:1 | PASS |
| Select | dark | Selected option text on surface | text | #FFFFFF | #0A0A0A | 19.80:1 | 4.5:1 | PASS |
| Select | dark | Check icon (brand) on raised surface | non-text | #1456F0 | #141414 | 3.17:1 | 3.0:1 | PASS |
| Select | dark | Check icon (brand) on surface (selected row) | non-text | #1456F0 | #0A0A0A | 3.41:1 | 3.0:1 | PASS |
| Select | dark | Chevron icon (muted) on surface | non-text | #A3A3A3 | #0A0A0A | 7.85:1 | 3.0:1 | PASS |
| Select | dark | Trigger value, disabled (opacity 0.50) | text | #FFFFFF → #828282 | #0A0A0A → #050505 | 5.30:1 | 4.5:1 | PASS |
| Tabs | dark | Unselected trigger (muted) on surface | text | #A3A3A3 | #0A0A0A | 7.85:1 | 4.5:1 | PASS |
| Tabs | dark | Selected trigger on raised surface | text | #FFFFFF | #141414 | 18.42:1 | 4.5:1 | PASS |
| Tabs | dark | Unselected trigger on surface (hover) | text | #FFFFFF | #0A0A0A | 19.80:1 | 4.5:1 | PASS |
| Tabs | dark | Panel content on page | text | #FFFFFF | #000000 | 21.00:1 | 4.5:1 | PASS |
| Toast | dark | Title on raised surface | text | #FFFFFF | #141414 | 18.42:1 | 4.5:1 | PASS |
| Toast | dark | Description (muted) on raised surface | text | #A3A3A3 | #141414 | 7.30:1 | 4.5:1 | PASS |
| Toast | dark | Default icon (muted) on raised surface | non-text | #A3A3A3 | #141414 | 7.30:1 | 3.0:1 | PASS |
| Toast | dark | Success icon on raised surface | non-text | #22C55E | #141414 | 8.08:1 | 3.0:1 | PASS |
| Toast | dark | Error icon (danger) on raised surface | non-text | #EF4444 | #141414 | 4.90:1 | 3.0:1 | PASS |
| Toast | dark | Warning icon on raised surface | non-text | #F59E0B | #141414 | 8.58:1 | 3.0:1 | PASS |
| Toast | dark | Close icon (muted) on raised surface | non-text | #A3A3A3 | #141414 | 7.30:1 | 3.0:1 | PASS |
| Card | dark | Title on surface | text | #FFFFFF | #0A0A0A | 19.80:1 | 4.5:1 | PASS |
| Card | dark | Description (muted) on surface | text | #A3A3A3 | #0A0A0A | 7.85:1 | 4.5:1 | PASS |
| Card | dark | Content text on surface | text | #FFFFFF | #0A0A0A | 19.80:1 | 4.5:1 | PASS |
| Avatar | dark | Web fallback initials on brand | text | #FFFFFF | #1456F0 | 5.80:1 | 4.5:1 | PASS |
| Avatar | dark | Native fallback initials on raised surface | text | #FFFFFF | #141414 | 18.42:1 | 4.5:1 | PASS |
| Switch | dark | Label on page | text | #FFFFFF | #000000 | 21.00:1 | 4.5:1 | PASS |
| Switch | dark | Web thumb (text) on track, unchecked | non-text | #FFFFFF | #737373 | 4.74:1 | 3.0:1 | PASS |
| Switch | dark | Web thumb (text) on brand track, checked | non-text | #FFFFFF | #1456F0 | 5.80:1 | 3.0:1 | PASS |
| Switch | dark | Web/native track (track) vs page, unchecked | non-text | #737373 | #000000 | 4.43:1 | 3.0:1 | PASS |
| Switch | dark | Web/native track (brand) vs page, checked | non-text | #1456F0 | #000000 | 3.62:1 | 3.0:1 | PASS |
| Switch | dark | Native thumb (brand-fg) on track, unchecked | non-text | #FFFFFF | #737373 | 4.74:1 | 3.0:1 | PASS |
| Switch | dark | Native thumb (brand-fg) on brand track, checked | non-text | #FFFFFF | #1456F0 | 5.80:1 | 3.0:1 | PASS |
| Switch | dark | Label, disabled (opacity 0.50) | text | #FFFFFF → #808080 | #000000 → #000000 | 5.32:1 | 4.5:1 | PASS |
| Global | light | Primary text on page | text | #000000 | #FFFFFF | 21.00:1 | 4.5:1 | PASS |
| Global | light | Muted text on page | text | #525252 | #FFFFFF | 7.81:1 | 4.5:1 | PASS |
| Global | light | Primary text on surface | text | #000000 | #F5F5F5 | 19.26:1 | 4.5:1 | PASS |
| Global | light | Muted text on surface | text | #525252 | #F5F5F5 | 7.17:1 | 4.5:1 | PASS |
| Global | light | Primary text on raised surface | text | #000000 | #FFFFFF | 21.00:1 | 4.5:1 | PASS |
| Global | light | Muted text on raised surface | text | #525252 | #FFFFFF | 7.81:1 | 4.5:1 | PASS |
| Global | light | Focus indicator on page | non-text | #1456F0 | #FFFFFF | 5.80:1 | 3.0:1 | PASS |
| Global | light | Focus indicator on surface | non-text | #1456F0 | #F5F5F5 | 5.32:1 | 3.0:1 | PASS |
| Global | light | Focus indicator on raised surface | non-text | #1456F0 | #FFFFFF | 5.80:1 | 3.0:1 | PASS |
| Button | light | Primary label on brand | text | #FFFFFF | #1456F0 | 5.80:1 | 4.5:1 | PASS |
| Button | light | Primary label on brand-hover (hover/pressed) | text | #FFFFFF | #1045C0 | 7.97:1 | 4.5:1 | PASS |
| Button | light | Secondary label on raised surface | text | #000000 | #FFFFFF | 21.00:1 | 4.5:1 | PASS |
| Button | light | Secondary label on surface (hover/pressed) | text | #000000 | #F5F5F5 | 19.26:1 | 4.5:1 | PASS |
| Button | light | Outline label on page (transparent bg) | text | #000000 | #FFFFFF | 21.00:1 | 4.5:1 | PASS |
| Button | light | Outline label on surface (hover) | text | #000000 | #F5F5F5 | 19.26:1 | 4.5:1 | PASS |
| Button | light | Ghost label on page (transparent bg) | text | #000000 | #FFFFFF | 21.00:1 | 4.5:1 | PASS |
| Button | light | Ghost label on surface (hover) | text | #000000 | #F5F5F5 | 19.26:1 | 4.5:1 | PASS |
| Button | light | Danger label on danger-solid | text | #FFFFFF | #DC2626 | 4.83:1 | 4.5:1 | PASS |
| Button | light | Danger label on danger-hover (hover/pressed) | text | #FFFFFF | #B91C1C | 6.47:1 | 4.5:1 | PASS |
| Button | light | Primary label, disabled (opacity 0.50) | text | #FFFFFF → #C5D5FC | #1456F0 → #8AABF8 | 1.54:1 | 4.5:1 | below (exempt: disabled) |
| Button | light | Secondary label, disabled (opacity 0.50) | text | #000000 → #808080 | #FFFFFF → #FFFFFF | 3.95:1 | 4.5:1 | below (exempt: disabled) |
| Button | light | Outline label, disabled (opacity 0.50) | text | #000000 → #808080 | #FFFFFF → #FFFFFF | 3.95:1 | 4.5:1 | below (exempt: disabled) |
| Button | light | Danger label, disabled (opacity 0.50) | text | #FFFFFF → #F7C9C9 | #DC2626 → #EE9393 | 1.53:1 | 4.5:1 | below (exempt: disabled) |
| Input | light | Value text on surface | text | #000000 | #F5F5F5 | 19.26:1 | 4.5:1 | PASS |
| Input | light | Placeholder (muted) on surface | text | #525252 | #F5F5F5 | 7.17:1 | 4.5:1 | PASS |
| Input | light | Label on page | text | #000000 | #FFFFFF | 21.00:1 | 4.5:1 | PASS |
| Input | light | Error text on page | text | #DC2626 | #FFFFFF | 4.83:1 | 4.5:1 | PASS |
| Input | light | Error border on surface | non-text | #DC2626 | #F5F5F5 | 4.43:1 | 3.0:1 | PASS |
| Input | light | Value text, disabled (opacity 0.50) | text | #000000 → #7D7D7D | #F5F5F5 → #FAFAFA | 3.94:1 | 4.5:1 | below (exempt: disabled) |
| Dialog | light | Title on raised surface | text | #000000 | #FFFFFF | 21.00:1 | 4.5:1 | PASS |
| Dialog | light | Description (muted) on raised surface | text | #525252 | #FFFFFF | 7.81:1 | 4.5:1 | PASS |
| Dialog | light | Body text on raised surface | text | #000000 | #FFFFFF | 21.00:1 | 4.5:1 | PASS |
| Dialog | light | Close icon (muted) on raised surface | non-text | #525252 | #FFFFFF | 7.81:1 | 3.0:1 | PASS |
| Dialog | light | Close icon on surface (hover bg) | non-text | #000000 | #F5F5F5 | 19.26:1 | 3.0:1 | PASS |
| Popover | light | Content text on raised surface | text | #000000 | #FFFFFF | 21.00:1 | 4.5:1 | PASS |
| Select | light | Trigger value on surface | text | #000000 | #F5F5F5 | 19.26:1 | 4.5:1 | PASS |
| Select | light | Trigger placeholder (muted) on surface | text | #525252 | #F5F5F5 | 7.17:1 | 4.5:1 | PASS |
| Select | light | Label on page | text | #000000 | #FFFFFF | 21.00:1 | 4.5:1 | PASS |
| Select | light | Option text on raised surface | text | #000000 | #FFFFFF | 21.00:1 | 4.5:1 | PASS |
| Select | light | Selected option text on surface | text | #000000 | #F5F5F5 | 19.26:1 | 4.5:1 | PASS |
| Select | light | Check icon (brand) on raised surface | non-text | #1456F0 | #FFFFFF | 5.80:1 | 3.0:1 | PASS |
| Select | light | Check icon (brand) on surface (selected row) | non-text | #1456F0 | #F5F5F5 | 5.32:1 | 3.0:1 | PASS |
| Select | light | Chevron icon (muted) on surface | non-text | #525252 | #F5F5F5 | 7.17:1 | 3.0:1 | PASS |
| Select | light | Trigger value, disabled (opacity 0.50) | text | #000000 → #7D7D7D | #F5F5F5 → #FAFAFA | 3.94:1 | 4.5:1 | below (exempt: disabled) |
| Tabs | light | Unselected trigger (muted) on surface | text | #525252 | #F5F5F5 | 7.17:1 | 4.5:1 | PASS |
| Tabs | light | Selected trigger on raised surface | text | #000000 | #FFFFFF | 21.00:1 | 4.5:1 | PASS |
| Tabs | light | Unselected trigger on surface (hover) | text | #000000 | #F5F5F5 | 19.26:1 | 4.5:1 | PASS |
| Tabs | light | Panel content on page | text | #000000 | #FFFFFF | 21.00:1 | 4.5:1 | PASS |
| Toast | light | Title on raised surface | text | #000000 | #FFFFFF | 21.00:1 | 4.5:1 | PASS |
| Toast | light | Description (muted) on raised surface | text | #525252 | #FFFFFF | 7.81:1 | 4.5:1 | PASS |
| Toast | light | Default icon (muted) on raised surface | non-text | #525252 | #FFFFFF | 7.81:1 | 3.0:1 | PASS |
| Toast | light | Success icon on raised surface | non-text | #16A34A | #FFFFFF | 3.30:1 | 3.0:1 | PASS |
| Toast | light | Error icon (danger) on raised surface | non-text | #DC2626 | #FFFFFF | 4.83:1 | 3.0:1 | PASS |
| Toast | light | Warning icon on raised surface | non-text | #D97706 | #FFFFFF | 3.19:1 | 3.0:1 | PASS |
| Toast | light | Close icon (muted) on raised surface | non-text | #525252 | #FFFFFF | 7.81:1 | 3.0:1 | PASS |
| Card | light | Title on surface | text | #000000 | #F5F5F5 | 19.26:1 | 4.5:1 | PASS |
| Card | light | Description (muted) on surface | text | #525252 | #F5F5F5 | 7.17:1 | 4.5:1 | PASS |
| Card | light | Content text on surface | text | #000000 | #F5F5F5 | 19.26:1 | 4.5:1 | PASS |
| Avatar | light | Web fallback initials on brand | text | #FFFFFF | #1456F0 | 5.80:1 | 4.5:1 | PASS |
| Avatar | light | Native fallback initials on raised surface | text | #000000 | #FFFFFF | 21.00:1 | 4.5:1 | PASS |
| Switch | light | Label on page | text | #000000 | #FFFFFF | 21.00:1 | 4.5:1 | PASS |
| Switch | light | Web thumb (text) on track, unchecked | non-text | #000000 | #737373 | 4.43:1 | 3.0:1 | PASS |
| Switch | light | Web thumb (text) on brand track, checked | non-text | #000000 | #1456F0 | 3.62:1 | 3.0:1 | PASS |
| Switch | light | Web/native track (track) vs page, unchecked | non-text | #737373 | #FFFFFF | 4.74:1 | 3.0:1 | PASS |
| Switch | light | Web/native track (brand) vs page, checked | non-text | #1456F0 | #FFFFFF | 5.80:1 | 3.0:1 | PASS |
| Switch | light | Native thumb (brand-fg) on track, unchecked | non-text | #FFFFFF | #737373 | 4.74:1 | 3.0:1 | PASS |
| Switch | light | Native thumb (brand-fg) on brand track, checked | non-text | #FFFFFF | #1456F0 | 5.80:1 | 3.0:1 | PASS |
| Switch | light | Label, disabled (opacity 0.50) | text | #000000 → #808080 | #FFFFFF → #FFFFFF | 3.95:1 | 4.5:1 | below (exempt: disabled) |

## Disabled / exempt pairs below threshold (WCAG-exempt, informational)

Disabled controls are exempt from WCAG 1.4.3. These are listed so the low
numbers are not mistaken for hidden failures. Composited with real alpha math
(element opacity over the page background).

- Button / dark / Primary label, disabled (opacity 0.50): 4.31:1 (needs 4.5:1) — #FFFFFF → #8595BC on #1456F0 → #0A2B78
- Button / dark / Danger label, disabled (opacity 0.50): 3.94:1 (needs 4.5:1) — #FFFFFF → #B78989 on #DC2626 → #6E1313
- Button / light / Primary label, disabled (opacity 0.50): 1.54:1 (needs 4.5:1) — #FFFFFF → #C5D5FC on #1456F0 → #8AABF8
- Button / light / Secondary label, disabled (opacity 0.50): 3.95:1 (needs 4.5:1) — #000000 → #808080 on #FFFFFF → #FFFFFF
- Button / light / Outline label, disabled (opacity 0.50): 3.95:1 (needs 4.5:1) — #000000 → #808080 on #FFFFFF → #FFFFFF
- Button / light / Danger label, disabled (opacity 0.50): 1.53:1 (needs 4.5:1) — #FFFFFF → #F7C9C9 on #DC2626 → #EE9393
- Input / light / Value text, disabled (opacity 0.50): 3.94:1 (needs 4.5:1) — #000000 → #7D7D7D on #F5F5F5 → #FAFAFA
- Select / light / Trigger value, disabled (opacity 0.50): 3.94:1 (needs 4.5:1) — #000000 → #7D7D7D on #F5F5F5 → #FAFAFA
- Switch / light / Label, disabled (opacity 0.50): 3.95:1 (needs 4.5:1) — #000000 → #808080 on #FFFFFF → #FFFFFF

## Files created / changed

### Created

- `scripts/contrast-audit.mjs` — the reproducible audit (reads `tokens/color.json`,
  computes all ratios, prints the table; `--json` for machine-readable output).
- `scripts/generate-contrast-report.py` — assembles this report from the audit's
  before/after outputs (deterministic; re-run with the TEST_* env vars to
  refresh the verification numbers).
- `CONTRAST-AUDIT.md` — this report.

### Changed — tokens (source of truth; `dist/` rebuilt, never hand-edited)

- `tokens/color.json`
  - **Added** `danger-hover` #B91C1C (both themes), `danger-solid` #DC2626 (both
    themes), `track` #737373 = `{color.black.700}` (both themes) to the semantic
    sets, dark and light.
  - **Changed (explicit, justified above):** dark `brand-hover`
    `{color.cobalt.400}` → `{color.cobalt.600}`; dark `danger` was briefly #DC2626
    and was **reverted to #EF4444** (final). The cobalt ramp is untouched.
  - Description-only: cobalt-400/600 descriptions corrected (400 is no longer
    any theme's brand-hover).
- `packages/tokens/style-dictionary.config.mjs` — `SEMANTIC_COLORS` gains the three
  new keys; native `buildThemeObject` + `ThemeColors` interface gain
  `dangerHover`, `dangerSolid`, `track`. (Config, not generated output — the
  format functions enumerate semantic colors explicitly, so new tokens do not
  flow through unless listed here. All three are wired into **both** the web CSS
  vars (`--color-danger-hover`, `--color-danger-solid`, `--color-track`, in `:root`,
  `[data-theme="light"]`, and the `@theme inline` mapping, so `bg-danger-hover`,
  `bg-danger-solid`, `bg-track` utilities exist) **and** the native theme object
  (`theme.dark.colors` / `theme.light.colors` + compiled `theme.js`). Verified on
  disk after the final build; the tokens test's `toEqual` on the full colors
  object independently proves it.)
- `packages/tokens/test/tokens.test.ts` — contract updated to the new color sets
  (dark `brandHover` #1045C0, dark `danger` #EF4444, new keys both themes) plus
  `web.css` assertions for the three new variables and their `@theme` mappings.

### Changed — components (theme/styling fixes only; no API, prop, or behavior changes)

- `packages/web/src/components/button/Button.tsx` — danger variant:
  `bg-danger … hover:opacity-90` → `bg-danger-solid … hover:bg-danger-hover`.
- `packages/native/src/components/button/Button.tsx` — danger variant: pressed state
  now swaps to `t.colors.dangerHover` (rest: `t.colors.dangerSolid`); the 0.85
  opacity press multiplier is removed (disabled 0.5 stays).
- `packages/web/src/components/switch/Switch.tsx` — unchecked track `bg-surface` →
  `bg-track`; `border border-border-strong` and `data-[checked]:border-brand` removed.
- `packages/native/src/components/switch/Switch.tsx` — unchecked track
  `borderStrong` → `t.colors.track`; `borderWidth.thin` + `borderColor` removed
  (`borderWidth.none`).
- `packages/web/src/components/button/Button.test.tsx` — danger assertion tightened
  from `bg-danger` to `bg-danger-solid` (the old substring assertion would still
  have passed; the class actually changed).
- `packages/native/test/theme.test.tsx` — contract test updated: dark `brandHover`
  #4378F3 → #1045C0, plus assertions locking the new keys (`dangerHover`,
  `dangerSolid`, `track`) and dark `danger` #EF4444. (This file was missed in
  the first test update and failed the first native re-run — 38/39 — before
  being fixed; see Verification.)
- `apps/docs/src/content/docs/tokens/color.md` — Starlight docs synced to the new
  values: `brand-hover` dark #1045C0, new `danger-hover` / `danger-solid` /
  `track` rows, native keys list, and a Rules line pointing at this audit.
  (Docs only — no code. Figma plugin artifacts regenerate at assembly per the
  coordinator; `figma-plugin/tokens.json` was not hand-edited.)

### NOT changed (per scope)

- `decisions.md`, `AGENTS.md`, `skills/supr-ui/SKILL.md` — untouched. Proposed
  updates for the new tokens are at the end of this report.
- No existing token value was changed except dark `brand-hover` (justified above)
  and the reverted dark `danger` excursion (final value = original #EF4444).
- No component APIs, props, or behavior changed. No 11th component. No raw hex,
  pixel, or duration literals in components — tokens only.

## Verification — full M1 test matrix re-run after the last token edit

- Tokens Vitest: **10/10 passed** (was 10 in M1)
- Web Vitest: **38/38 passed** (was 38 in M1)
- Native Vitest (`--fileParallelism=false`, serialized): **39/39 passed (15/15 + 24/24 across two serialized runs — see note)** (was 39 in M1)
- `tsc` across all workspaces: **clean across all workspaces (tokens, web, native, demo, storybook)**

Native-run note (honest accounting): the first full-suite run after the
fixes showed 38/39, with the single failure being `test/theme.test.tsx`
asserting the old dark `brandHover` #4378F3 — a contract test I had missed
when updating the tokens test (fixed in the test, not the code; see Files).
Two subsequent full-suite runs wedged mid-run: after a few files, the main
vitest process and its fork worker both sat idle in `epoll_wait` with no log
progress for 10+ minutes — a tinypool IPC stall under the shared machine's
load (load average was 6.08 at the time; other workstreams were running
vitest concurrently), not a test failure. The 39/39 above is therefore
composed of two serialized runs with the identical flags:
15/15 (theme 7, select 5, tabs 3) plus 24/24 (avatar 3, button 5, card 1,
dialog 3, input 3, popover 3, switch 3, toast 3) — every one of the 11 test
files green, no file run twice counted twice. If the parent wants a single
uninterrupted 39/39 run, re-run it when the machine is quiet; the suite
itself is green.

## Unverified — and why

- **No real-browser / on-device visual check.** Ratios are computed from token
  values, which is exact for contrast math, but the Switch's new gray track and
  the danger Button's new hover color have not been eyeballed in a browser or on
  Android. (Subagent cannot drive a live browser; Storybook visual check is a
  follow-up for the parent.)
- **Tailwind utility existence** for `bg-track` / `bg-danger-solid` /
  `bg-danger-hover` is proven by the `@theme inline` mapping in the rebuilt
  `dist/web.css` (all three `--color-*` vars mapped with `var()`), not by a
  compiled-CSS grep — Tailwind v4 generates utilities from `@theme` at build time.
- **Playwright / axe were not re-run.** This workstream's matrix is Vitest + tsc;
  the changes are color-only (no DOM/ARIA/structure change), so no new axe
  violation is expected — but the Storybook axe gate should still run at assembly.
- **No axe suppression was added or needed.** No violations were suppressed anywhere.

## Proposed decisions.md entry (not added — decisions.md is not mine to edit)

No new tool or dependency was picked (the audit is a dependency-free Node script),
so no D-entry is proposed. For the record, the contrast fixes rest on two rules
that a future D-entry could capture if the parent wants them decided rather than
merely documented:

- Hover/pressed states must pass the same contrast bar as rest states — opacity
  feedback on a filled button cannot pass AA in light, so press/hover feedback on
  filled buttons uses a solid darker token, never an opacity multiplier.
- A semantic token's roles must share one contrast direction: if a color is both a
  text color on dark surfaces and a filled background for white text, it needs two
  tokens (`danger` vs `danger-solid`), because no single dark-theme red satisfies both.

## Proposed AGENTS.md / SKILL.md edits (not applied — those files are not mine to edit)

AGENTS.md — Tokens table, Color row: add `--color-danger-hover`,
`--color-danger-solid`, `--color-track` to the listed variables. Add to the
Accessibility rules, after 'Contrast must hold in both themes, dark and light.':

> Contrast must hold in every state, not just rest: hover/pressed labels are
> judged at the same bar as rest labels. Never use an opacity multiplier for
> press/hover feedback on a filled button — use a solid darker token
> (`danger-hover`). The Switch unchecked track uses `--color-track`; do not give
> it a `border-strong` rim (the rim fails 3:1 against the page in both themes).
> Re-run `node scripts/contrast-audit.mjs` after any color-token change; it must
> report 0 non-exempt failures.

SKILL.md — token table (line ~68-73): add rows for `--color-danger-hover`,
`--color-danger-solid`, `--color-track`; and update the native `colors` key list
(line ~79) to: `background`, `surface`, `surfaceRaised`, `border`,
`borderStrong`, `text`, `textMuted`, `brand`, `brandHover`, `brandForeground`,
`danger`, `dangerHover`, `dangerSolid`, `success`, `warning`, `track`.
