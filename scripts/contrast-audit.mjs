#!/usr/bin/env node
/**
 * Supr UI — WCAG contrast audit.
 *
 * Reads the token source of truth (tokens/color.json), resolves W3C DTCG
 * references, and computes WCAG 2.x contrast ratios for every meaningful
 * text/background pair used by the 10 components, in both themes.
 *
 * Thresholds: normal text 4.5:1, large text 3:1, non-text UI / focus
 * indicators 3:1 (WCAG 1.4.11). No component text qualifies as large
 * (largest is 18px semibold = 13.5pt bold; large needs 18pt, or 14pt bold).
 *
 * Disabled pairs are composited with real alpha math (element opacity over
 * the page background) and reported for information — WCAG exempts
 * inactive/disabled controls, so they do not count as failures.
 *
 * Run: node scripts/contrast-audit.mjs [--json]
 * Exit code: 0 always (this is a report, not a gate); failures are listed.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const colorTokens = JSON.parse(readFileSync(path.join(root, 'tokens', 'color.json'), 'utf8'));

// --- resolve {color.group.name} references ---------------------------------
const flat = {};
function walk(node, prefix) {
  for (const [key, val] of Object.entries(node)) {
    if (val && typeof val === 'object' && '$value' in val) {
      flat[prefix ? `${prefix}.${key}` : key] = val.$value;
    } else if (val && typeof val === 'object') {
      walk(val, prefix ? `${prefix}.${key}` : key);
    }
  }
}
walk(colorTokens.color, 'color');
function resolve(ref) {
  let v = flat[ref];
  if (v == null) throw new Error(`unknown token ref ${ref}`);
  while (typeof v === 'string' && v.startsWith('{') && v.endsWith('}')) {
    v = flat[v.slice(1, -1)];
  }
  return v;
}

// Semantic + ramp colors per theme.
const T = {};
for (const theme of ['dark', 'light']) {
  T[theme] = {};
  for (const [name, def] of Object.entries(colorTokens.color.semantic[theme])) {
    T[theme][name] = resolve(`color.semantic.${theme}.${name}`);
  }
}
// Ramp aliases used directly by a pair (cobalt-400 etc. are token values too).
for (const theme of ['dark', 'light']) {
  for (const [group, steps] of Object.entries(colorTokens.color)) {
    if (group === 'semantic') continue;
    for (const [step, def] of Object.entries(steps)) {
      T[theme][`${group}-${step}`] = resolve(`color.${group}.${step}`);
    }
  }
}

// --- WCAG math --------------------------------------------------------------
function srgbToLin(c) {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}
function luminance(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return 0.2126 * srgbToLin(r) + 0.7152 * srgbToLin(g) + 0.0722 * srgbToLin(b);
}
function ratio(fg, bg) {
  const l1 = luminance(fg);
  const l2 = luminance(bg);
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}
function hexToRgb(hex) {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
}
function rgbToHex([r, g, b]) {
  return `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`.toUpperCase();
}
// Composite a foreground color at opacity `a` over a background color.
function over(fg, bg, a) {
  const f = hexToRgb(fg);
  const b = hexToRgb(bg);
  return rgbToHex(f.map((v, i) => v * a + b[i] * (1 - a)));
}
// Disabled element (opacity `a`) over the page background: the element's own
// bg blends with the page, then its fg blends with the resulting bg.
function disabledPair(fg, bg, page, a) {
  const effBg = over(bg, page, a);
  const effFg = over(fg, effBg, a);
  return { fg: effFg, bg: effBg, ratio: ratio(effFg, effBg) };
}

// --- pair inventory ----------------------------------------------------------
// kind: 'text' (4.5:1) | 'non-text' (3:1, UI components / icons / focus).
// bg 'transparent' resolves to the page background (components sit on it).
// alpha: element opacity — composited over the page background.
// exempt: WCAG exempts disabled controls; reported, never counted as a fail.
const PAIRS = [
  // Global / shared
  ['Global', 'Primary text on page', 'text', 'background', 'text'],
  ['Global', 'Muted text on page', 'text-muted', 'background', 'text'],
  ['Global', 'Primary text on surface', 'text', 'surface', 'text'],
  ['Global', 'Muted text on surface', 'text-muted', 'surface', 'text'],
  ['Global', 'Primary text on raised surface', 'text', 'surface-raised', 'text'],
  ['Global', 'Muted text on raised surface', 'text-muted', 'surface-raised', 'text'],
  ['Global', 'Focus indicator on page', 'focus', 'background', 'non-text'],
  ['Global', 'Focus indicator on surface', 'focus', 'surface', 'non-text'],
  ['Global', 'Focus indicator on raised surface', 'focus', 'surface-raised', 'non-text'],

  // Button
  ['Button', 'Primary label on brand', 'brand-foreground', 'brand', 'text'],
  ['Button', 'Primary label on brand-hover (hover/pressed)', 'brand-foreground', 'brand-hover', 'text'],
  ['Button', 'Secondary label on raised surface', 'text', 'surface-raised', 'text'],
  ['Button', 'Secondary label on surface (hover/pressed)', 'text', 'surface', 'text'],
  ['Button', 'Outline label on page (transparent bg)', 'text', 'background', 'text'],
  ['Button', 'Outline label on surface (hover)', 'text', 'surface', 'text'],
  ['Button', 'Ghost label on page (transparent bg)', 'text', 'background', 'text'],
  ['Button', 'Ghost label on surface (hover)', 'text', 'surface', 'text'],
  ['Button', 'Danger label on danger-solid', 'brand-foreground', 'danger-solid', 'text'],
  ['Button', 'Danger label on danger-hover (hover/pressed)', 'brand-foreground', 'danger-hover', 'text'],
  ['Button', 'Primary label, disabled (opacity 0.50)', 'brand-foreground', 'brand', 'text', { alpha: 0.5, exempt: true }],
  ['Button', 'Secondary label, disabled (opacity 0.50)', 'text', 'surface-raised', 'text', { alpha: 0.5, exempt: true }],
  ['Button', 'Outline label, disabled (opacity 0.50)', 'text', 'background', 'text', { alpha: 0.5, exempt: true }],
  ['Button', 'Danger label, disabled (opacity 0.50)', 'brand-foreground', 'danger-solid', 'text', { alpha: 0.5, exempt: true }],

  // Input
  ['Input', 'Value text on surface', 'text', 'surface', 'text'],
  ['Input', 'Placeholder (muted) on surface', 'text-muted', 'surface', 'text'],
  ['Input', 'Label on page', 'text', 'background', 'text'],
  ['Input', 'Error text on page', 'danger', 'background', 'text'],
  ['Input', 'Error border on surface', 'danger', 'surface', 'non-text'],
  ['Input', 'Value text, disabled (opacity 0.50)', 'text', 'surface', 'text', { alpha: 0.5, exempt: true }],

  // Dialog
  ['Dialog', 'Title on raised surface', 'text', 'surface-raised', 'text'],
  ['Dialog', 'Description (muted) on raised surface', 'text-muted', 'surface-raised', 'text'],
  ['Dialog', 'Body text on raised surface', 'text', 'surface-raised', 'text'],
  ['Dialog', 'Close icon (muted) on raised surface', 'text-muted', 'surface-raised', 'non-text'],
  ['Dialog', 'Close icon on surface (hover bg)', 'text', 'surface', 'non-text'],

  // Popover
  ['Popover', 'Content text on raised surface', 'text', 'surface-raised', 'text'],

  // Select
  ['Select', 'Trigger value on surface', 'text', 'surface', 'text'],
  ['Select', 'Trigger placeholder (muted) on surface', 'text-muted', 'surface', 'text'],
  ['Select', 'Label on page', 'text', 'background', 'text'],
  ['Select', 'Option text on raised surface', 'text', 'surface-raised', 'text'],
  ['Select', 'Selected option text on surface', 'text', 'surface', 'text'],
  ['Select', 'Check icon (brand) on raised surface', 'brand', 'surface-raised', 'non-text'],
  ['Select', 'Check icon (brand) on surface (selected row)', 'brand', 'surface', 'non-text'],
  ['Select', 'Chevron icon (muted) on surface', 'text-muted', 'surface', 'non-text'],
  ['Select', 'Trigger value, disabled (opacity 0.50)', 'text', 'surface', 'text', { alpha: 0.5, exempt: true }],

  // Tabs
  ['Tabs', 'Unselected trigger (muted) on surface', 'text-muted', 'surface', 'text'],
  ['Tabs', 'Selected trigger on raised surface', 'text', 'surface-raised', 'text'],
  ['Tabs', 'Unselected trigger on surface (hover)', 'text', 'surface', 'text'],
  ['Tabs', 'Panel content on page', 'text', 'background', 'text'],

  // Toast
  ['Toast', 'Title on raised surface', 'text', 'surface-raised', 'text'],
  ['Toast', 'Description (muted) on raised surface', 'text-muted', 'surface-raised', 'text'],
  ['Toast', 'Default icon (muted) on raised surface', 'text-muted', 'surface-raised', 'non-text'],
  ['Toast', 'Success icon on raised surface', 'success', 'surface-raised', 'non-text'],
  ['Toast', 'Error icon (danger) on raised surface', 'danger', 'surface-raised', 'non-text'],
  ['Toast', 'Warning icon on raised surface', 'warning', 'surface-raised', 'non-text'],
  ['Toast', 'Close icon (muted) on raised surface', 'text-muted', 'surface-raised', 'non-text'],

  // Card
  ['Card', 'Title on surface', 'text', 'surface', 'text'],
  ['Card', 'Description (muted) on surface', 'text-muted', 'surface', 'text'],
  ['Card', 'Content text on surface', 'text', 'surface', 'text'],

  // Avatar
  ['Avatar', 'Web fallback initials on brand', 'brand-foreground', 'brand', 'text'],
  ['Avatar', 'Native fallback initials on raised surface', 'text', 'surface-raised', 'text'],

  // Switch
  ['Switch', 'Label on page', 'text', 'background', 'text'],
  ['Switch', 'Web thumb (text) on track, unchecked', 'text', 'track', 'non-text'],
  ['Switch', 'Web thumb (text) on brand track, checked', 'text', 'brand', 'non-text'],
  ['Switch', 'Web/native track (track) vs page, unchecked', 'track', 'background', 'non-text'],
  ['Switch', 'Web/native track (brand) vs page, checked', 'brand', 'background', 'non-text'],
  ['Switch', 'Native thumb (brand-fg) on track, unchecked', 'brand-foreground', 'track', 'non-text'],
  ['Switch', 'Native thumb (brand-fg) on brand track, checked', 'brand-foreground', 'brand', 'non-text'],
  ['Switch', 'Label, disabled (opacity 0.50)', 'text', 'background', 'text', { alpha: 0.5, exempt: true }],
];

const rows = [];
for (const theme of ['dark', 'light']) {
  for (const [component, label, fgTok, bgTok, kind, opts = {}] of PAIRS) {
    const fg = T[theme][fgTok];
    const bg = T[theme][bgTok];
    const threshold = kind === 'text' ? 4.5 : 3.0;
    let effFg = fg;
    let effBg = bg;
    let r;
    if (opts.alpha != null) {
      const d = disabledPair(fg, bg, T[theme].background, opts.alpha);
      effFg = d.fg;
      effBg = d.bg;
      r = d.ratio;
    } else {
      r = ratio(fg, bg);
    }
    const pass = r >= threshold;
    rows.push({
      theme, component, label, kind, threshold,
      fg: opts.alpha != null ? `${fg} → ${effFg}` : fg,
      bg: opts.alpha != null ? `${bg} → ${effBg}` : bg,
      ratio: Math.round(r * 100) / 100,
      pass,
      exempt: !!opts.exempt,
      fail: !pass && !opts.exempt,
    });
  }
}

const asJson = process.argv.includes('--json');
if (asJson) {
  console.log(JSON.stringify({ tokens: T, rows }, null, 1));
  process.exit(0);
}

const fails = rows.filter((r) => r.fail);
const exemptFails = rows.filter((r) => !r.pass && r.exempt);
console.log(`# Contrast audit — computed ${new Date().toISOString().slice(0, 10)}`);
console.log(`Pairs checked: ${rows.length} (${rows.length / 2} per theme). Failures (AA, non-exempt): ${fails.length}. Disabled/exempt below threshold: ${exemptFails.length} (WCAG exempts disabled controls).`);
console.log('');
console.log('| Component | Theme | Pair | Kind | FG | BG | Ratio | Req. | Result |');
console.log('|---|---|---|---|---|---|---|---|---|');
for (const r of rows) {
  console.log(`| ${r.component} | ${r.theme} | ${r.label} | ${r.kind} | ${r.fg} | ${r.bg} | ${r.ratio.toFixed(2)}:1 | ${r.threshold.toFixed(1)}:1 | ${r.pass ? 'PASS' : r.exempt ? 'below (exempt: disabled)' : '**FAIL**'} |`);
}
console.log('');
console.log('## Failures');
if (fails.length === 0) console.log('None.');
for (const r of fails) {
  console.log(`- ${r.component} / ${r.theme} / ${r.label}: ${r.ratio.toFixed(2)}:1 (needs ${r.threshold.toFixed(1)}:1) — ${r.fg} on ${r.bg}`);
}
console.log('');
console.log('## Disabled / exempt pairs below threshold (WCAG-exempt, informational)');
if (exemptFails.length === 0) console.log('None.');
for (const r of exemptFails) {
  console.log(`- ${r.component} / ${r.theme} / ${r.label}: ${r.ratio.toFixed(2)}:1 (needs ${r.threshold.toFixed(1)}:1) — ${r.fg} on ${r.bg}`);
}
