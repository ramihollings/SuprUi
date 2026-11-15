#!/usr/bin/env node
/**
 * Supr UI — verify the Figma sync artifacts against the token sources.
 *
 * Independently re-derives what the outputs should contain from
 * tokens/*.json (its own flatten/resolve/convert code — it does not import
 * sync-tokens.mjs) and checks:
 *   1. tokens.json (Tokens Studio): every source token present with the
 *      identical $value in the right set, no extras, themes well-formed.
 *   2. variables-rest.json (REST payload): unique temp ids, 6 collections,
 *      valid modes, unique names per collection, no forbidden characters
 *      in names, every mode value equals the source value (or aliases the
 *      variable whose value equals it), payload under Figma's 4MB limit.
 *   3. code.js: placeholder replaced, valid JS (node --check), embedded
 *      document identical to tokens.json.
 *   4. code.template.js: exactly one placeholder, no hard-coded hex color.
 *   5. manifest.json + ui.html: required fields/files present.
 *
 * Run: node figma-plugin/scripts/verify-sync.mjs
 * Exit code 0 = all checks passed.
 */
import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const PLUGIN_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPO_ROOT = path.resolve(PLUGIN_DIR, '..');
const TOKENS_DIR = path.join(REPO_ROOT, 'tokens');
const TOKEN_FILES = ['color.json', 'spacing.json', 'radius.json', 'border.json', 'typography.json', 'motion.json'];

const COLLECTIONS = ['color', 'spacing', 'radius', 'border', 'typography', 'motion'];
const MODES = { color: ['Dark', 'Light'], spacing: ['Default'], radius: ['Default'], border: ['Default'], typography: ['Default'], motion: ['Default'] };
const FIGMA_TYPE = { color: 'COLOR', dimension: 'FLOAT', duration: 'FLOAT', fontWeight: 'FLOAT', number: 'FLOAT', fontFamily: 'STRING', cubicBezier: 'STRING' };
const REFERENCE_RE = /^\{([^}]+)\}$/;

let failures = 0;
let checks = 0;
function check(ok, label, detail = '') {
  checks += 1;
  if (ok) {
    console.log(`  PASS ${label}`);
  } else {
    failures += 1;
    console.log(`  FAIL ${label}${detail ? ` — ${detail}` : ''}`);
  }
}
function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b || a === null || b === null) return false;
  if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) < 0.0001;
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((v, i) => deepEqual(v, b[i]));
  }
  if (Array.isArray(a) || Array.isArray(b)) return false;
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  return [...keys].every((k) => deepEqual(a[k], b[k]));
}

// --- independent source reading (deliberately not shared with sync-tokens.mjs) ---
function* walk(node, prefix = []) {
  if (node === null || typeof node !== 'object' || Array.isArray(node)) return;
  if (Object.prototype.hasOwnProperty.call(node, '$value')) {
    yield { path: prefix.join('.'), type: node.$type, value: node.$value };
    return;
  }
  for (const [key, child] of Object.entries(node)) {
    if (key.startsWith('$')) continue;
    yield* walk(child, [...prefix, key]);
  }
}
function round4(n) {
  return Math.round(n * 10000) / 10000;
}
function convert(type, value) {
  if (type === 'color') {
    const n = parseInt(value.slice(1), 16);
    return { r: round4(((n >> 16) & 255) / 255), g: round4(((n >> 8) & 255) / 255), b: round4((n & 255) / 255), a: 1 };
  }
  if (type === 'dimension' || type === 'duration') return parseFloat(value);
  if (type === 'fontWeight' || type === 'number') return Number(value);
  return String(value);
}
function splitSemantic(dotted) {
  const p = dotted.split('.');
  if (p[0] === 'color' && p[1] === 'semantic' && (p[2] === 'dark' || p[2] === 'light')) {
    return { base: ['color', 'semantic', ...p.slice(3)].join('.'), mode: p[2] };
  }
  return { base: dotted, mode: null };
}

const sources = {};
for (const file of TOKEN_FILES) sources[file] = JSON.parse(await readFile(path.join(TOKENS_DIR, file), 'utf8'));
const leaves = [];
for (const file of TOKEN_FILES) for (const leaf of walk(sources[file])) leaves.push(leaf);
const byPath = new Map(leaves.map((l) => [l.path, l]));
function resolveLiteral(leaf, trail = []) {
  if (typeof leaf.value === 'string') {
    const ref = REFERENCE_RE.exec(leaf.value);
    if (ref) {
      if (trail.includes(ref[1])) throw new Error(`Circular reference at ${leaf.path}`);
      const target = byPath.get(ref[1]);
      if (!target) throw new Error(`Unresolved reference {${ref[1]}}`);
      return resolveLiteral(target, [...trail, ref[1]]);
    }
  }
  return convert(leaf.type, leaf.value);
}
// Expected variable model, derived from the sources only.
const expected = new Map(); // varName -> { collection, type, values: { mode: { kind, value|target } } }
for (const leaf of leaves) {
  const { base, mode } = splitSemantic(leaf.path);
  const collection = base.split('.')[0];
  const varName = base.replaceAll('.', '/');
  const type = FIGMA_TYPE[leaf.type];
  const resolved = (() => {
    if (typeof leaf.value === 'string') {
      const ref = REFERENCE_RE.exec(leaf.value);
      if (ref) return { kind: 'alias', target: splitSemantic(ref[1]).base.replaceAll('.', '/') };
    }
    return { kind: 'literal', value: convert(leaf.type, leaf.value) };
  })();
  let variable = expected.get(varName);
  if (!variable) {
    variable = { name: varName, collection, type, values: {} };
    expected.set(varName, variable);
  }
  if (mode) {
    variable.values[mode === 'dark' ? 'Dark' : 'Light'] = resolved;
  } else if (collection === 'color') {
    variable.values.Dark = resolved;
    variable.values.Light = resolved;
  } else {
    variable.values.Default = resolved;
  }
}

console.log(`Source: ${leaves.length} tokens -> ${expected.size} expected variables`);

// --- 1. tokens.json (Tokens Studio) ---
console.log('\n[1] tokens.json (Tokens Studio format)');
const tokensStudio = JSON.parse(await readFile(path.join(PLUGIN_DIR, 'tokens.json'), 'utf8'));
check(
  JSON.stringify(tokensStudio.$metadata?.tokenSetOrder) === JSON.stringify(['core', 'semantic-dark', 'semantic-light']),
  'tokenSetOrder is [core, semantic-dark, semantic-light]',
);
check(Array.isArray(tokensStudio.$themes) && tokensStudio.$themes.length === 2, 'two themes (Dark, Light)');
const themeNames = (tokensStudio.$themes || []).map((t) => t.name).sort();
check(JSON.stringify(themeNames) === JSON.stringify(['Dark', 'Light']), 'theme names are Dark and Light');
const darkTheme = (tokensStudio.$themes || []).find((t) => t.name === 'Dark');
check(
  darkTheme?.selectedTokenSets?.core === 'enabled' &&
    darkTheme?.selectedTokenSets?.['semantic-dark'] === 'enabled' &&
    darkTheme?.selectedTokenSets?.['semantic-light'] === 'disabled',
  'Dark theme enables core + semantic-dark only',
);
const lightTheme = (tokensStudio.$themes || []).find((t) => t.name === 'Light');
check(
  lightTheme?.selectedTokenSets?.core === 'enabled' &&
    lightTheme?.selectedTokenSets?.['semantic-light'] === 'enabled' &&
    lightTheme?.selectedTokenSets?.['semantic-dark'] === 'disabled',
  'Light theme enables core + semantic-light only',
);
// Every source leaf present with identical $value in the right set.
function getNested(obj, dotted) {
  return dotted.split('.').reduce((o, k) => (o === undefined ? undefined : o[k]), obj);
}
let tsMissing = 0;
let tsMismatch = 0;
for (const leaf of leaves) {
  const { base, mode } = splitSemantic(leaf.path);
  const set = mode ? `semantic-${mode}` : 'core';
  const node = getNested(tokensStudio[set], base);
  if (!node || node.$value === undefined) tsMissing += 1;
  else if (node.$value !== leaf.value) tsMismatch += 1;
}
check(tsMissing === 0 && tsMismatch === 0, 'every source token present with identical $value', `missing=${tsMissing} mismatch=${tsMismatch}`);
let tsCount = 0;
for (const set of ['core', 'semantic-dark', 'semantic-light']) for (const _ of walk(tokensStudio[set])) tsCount += 1;
check(tsCount === leaves.length, 'no extra tokens in tokens.json', `found=${tsCount} expected=${leaves.length}`);
// Spot-check the brand value, read from the source (not hard-coded here).
const brand = getNested(tokensStudio.core, 'color.cobalt.500');
console.log(`  INFO brand color.cobalt.500 = ${brand?.$value} (from source, via tokens.json)`);
const cobaltRamp = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'].map(
  (s) => getNested(tokensStudio.core, `color.cobalt.${s}`)?.$value,
);
check(cobaltRamp.every(Boolean), 'full cobalt ramp 50-900 present', cobaltRamp.join(', '));
const spacingSteps = Object.keys(tokensStudio.core.spacing || {}).sort();
check(
  JSON.stringify(spacingSteps.map(Number).sort((a, b) => a - b)) === JSON.stringify([0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16]),
  'spacing steps 0..16 present',
  spacingSteps.join(','),
);

// --- 2. variables-rest.json (REST payload) ---
console.log('\n[2] variables-rest.json (Figma Variables REST payload)');
const restRaw = await readFile(path.join(PLUGIN_DIR, 'variables-rest.json'), 'utf8');
const payload = JSON.parse(restRaw);
check(Buffer.byteLength(restRaw, 'utf8') < 4 * 1024 * 1024, 'payload under Figma 4MB limit', `${Buffer.byteLength(restRaw, 'utf8')} bytes`);
const tempIds = new Set();
let dupTemp = 0;
for (const arr of [payload.variableCollections, payload.variableModes, payload.variables]) {
  for (const item of arr || []) {
    if (item.id) {
      if (tempIds.has(item.id)) dupTemp += 1;
      tempIds.add(item.id);
    }
  }
}
check(dupTemp === 0, 'all temp ids unique');
check(
  (payload.variableCollections || []).length === COLLECTIONS.length &&
    COLLECTIONS.every((c) => payload.variableCollections.some((x) => x.name === c && x.action === 'CREATE')),
  'one CREATE collection per group (color, spacing, radius, border, typography, motion)',
);
const modeIdByName = {}; // "collection/mode" -> temp id
for (const coll of payload.variableCollections || []) {
  if (coll.initialModeId) modeIdByName[`${coll.name}/${MODES[coll.name][0]}`] = coll.initialModeId;
}
for (const mode of payload.variableModes || []) {
  const coll = (payload.variableCollections || []).find((c) => c.id === mode.variableCollectionId);
  if (coll && mode.action === 'CREATE') modeIdByName[`${coll.name}/${mode.name}`] = mode.id;
}
check(
  COLLECTIONS.every((c) => MODES[c].every((m) => modeIdByName[`${c}/${m}`])),
  'every collection mode has a temp id',
);
const varById = new Map((payload.variables || []).map((v) => [v.id, v]));
const varByName = new Map();
let nameDup = 0;
let badName = 0;
for (const v of payload.variables || []) {
  const key = `${v.variableCollectionId}/${v.name}`;
  if (varByName.has(key)) nameDup += 1;
  varByName.set(key, v);
  if (/[.{}]/.test(v.name)) badName += 1;
}
check(nameDup === 0, 'variable names unique within each collection');
check(badName === 0, 'variable names contain no . { } (Figma rule)');
check(varById.size === expected.size, 'variable count matches expected', `found=${varById.size} expected=${expected.size}`);
let restBad = 0;
const restProblems = [];
for (const variable of payload.variables || []) {
  const coll = (payload.variableCollections || []).find((c) => c.id === variable.variableCollectionId);
  const exp = expected.get(variable.name);
  if (!exp) {
    restBad += 1;
    restProblems.push(`${variable.name}: unexpected variable`);
    continue;
  }
  if (exp.collection !== coll?.name) {
    restBad += 1;
    restProblems.push(`${variable.name}: wrong collection`);
  }
  if (exp.type !== variable.resolvedType) {
    restBad += 1;
    restProblems.push(`${variable.name}: type ${variable.resolvedType} != ${exp.type}`);
  }
}
for (const mv of payload.variableModeValues || []) {
  const variable = varById.get(mv.variableId);
  if (!variable) {
    restBad += 1;
    restProblems.push(`mode value for unknown variable ${mv.variableId}`);
    continue;
  }
  const coll = (payload.variableCollections || []).find((c) => c.id === variable.variableCollectionId);
  const modeName = Object.entries(modeIdByName).find(([k, id]) => id === mv.modeId && k.startsWith(`${coll.name}/`))?.[0]?.split('/')[1];
  const exp = expected.get(variable.name);
  if (!modeName || !exp) continue;
  const expValue = exp.values[modeName];
  if (!expValue) {
    restBad += 1;
    restProblems.push(`${variable.name}: unexpected mode ${modeName}`);
    continue;
  }
  if (expValue.kind === 'alias') {
    const expectedTargetId = `var-${expValue.target.replaceAll('/', '-')}`;
    if (!(mv.value && mv.value.type === 'VARIABLE_ALIAS' && mv.value.id === expectedTargetId)) {
      restBad += 1;
      restProblems.push(`${variable.name} (${modeName}): expected alias to ${expValue.target}, got ${JSON.stringify(mv.value)}`);
    } else {
      // The alias target's own value must equal the resolved source literal.
      const targetLeaf = [...byPath.values()].find((l) => splitSemantic(l.path).base.replaceAll('.', '/') === expValue.target);
      const targetVar = [...varById.values()].find((v) => v.name === expValue.target);
      const targetModeValue = (payload.variableModeValues || []).find(
        (x) => x.variableId === targetVar?.id && x.modeId === mv.modeId,
      );
      if (!targetLeaf || !deepEqual(targetModeValue?.value, resolveLiteral(targetLeaf))) {
        restBad += 1;
        restProblems.push(`${variable.name} (${modeName}): alias target ${expValue.target} value mismatch`);
      }
    }
  } else if (!deepEqual(mv.value, expValue.value)) {
    restBad += 1;
    restProblems.push(`${variable.name} (${modeName}): value ${JSON.stringify(mv.value)} != ${JSON.stringify(expValue.value)}`);
  }
}
check(restBad === 0, 'every REST mode value matches its source token (or aliases the right variable)', restProblems.slice(0, 5).join('; '));
const modeValueCount = (payload.variableModeValues || []).length;
const expectedModeValues = [...expected.values()].reduce((n, v) => n + Object.keys(v.values).length, 0);
check(modeValueCount === expectedModeValues, 'mode value count matches expected', `found=${modeValueCount} expected=${expectedModeValues}`);

// --- 3. code.js ---
console.log('\n[3] code.js (generated plugin main file)');
const codeJs = await readFile(path.join(PLUGIN_DIR, 'code.js'), 'utf8');
check(!codeJs.includes('__SUPR_TOKENS_JSON__'), 'placeholder replaced in code.js');
check(codeJs.startsWith('// GENERATED'), 'code.js marked GENERATED');
try {
  await execFileAsync(process.execPath, ['--check', path.join(PLUGIN_DIR, 'code.js')]);
  check(true, 'code.js passes node --check');
} catch {
  check(false, 'code.js passes node --check');
}
const embeddedMatch = /const TOKENS = (\{[\s\S]*?\n\});/.exec(codeJs);
let embedded = null;
try {
  embedded = embeddedMatch ? JSON.parse(embeddedMatch[1]) : null;
} catch {
  embedded = null;
}
check(embedded !== null, 'embedded Tokens Studio document parses');
check(deepEqual(embedded, tokensStudio), 'embedded document identical to tokens.json');

// --- 4. code.template.js ---
console.log('\n[4] code.template.js (hand-written plugin logic)');
const template = await readFile(path.join(PLUGIN_DIR, 'code.template.js'), 'utf8');
check(template.split('__SUPR_TOKENS_JSON__').length === 2, 'template contains exactly one placeholder');
check(!/#[0-9a-fA-F]{6}\b/.test(template), 'template contains no hard-coded hex color');
try {
  await execFileAsync(process.execPath, ['--check', path.join(PLUGIN_DIR, 'code.template.js')]);
  check(true, 'code.template.js passes node --check (placeholder aside, syntax valid)');
} catch {
  // node --check fails on the bare placeholder identifier? It is a valid
  // identifier, so a failure here is a real syntax error.
  check(false, 'code.template.js passes node --check');
}

// --- 5. manifest + ui ---
console.log('\n[5] manifest.json + ui.html');
const manifest = JSON.parse(await readFile(path.join(PLUGIN_DIR, 'manifest.json'), 'utf8'));
check(typeof manifest.name === 'string' && manifest.name.length > 0, 'manifest has a name');
check(manifest.api === '1.0.0', 'manifest api is 1.0.0');
check(manifest.main === 'code.js', 'manifest main is code.js');
check(manifest.ui === 'ui.html', 'manifest ui is ui.html');
check(Array.isArray(manifest.editorType) && manifest.editorType.includes('figma'), 'manifest editorType includes figma');
const ui = await readFile(path.join(PLUGIN_DIR, 'ui.html'), 'utf8');
check(ui.includes("type: 'sync'") && ui.includes('onmessage'), 'ui.html wires sync + message handling');
check(!/#[0-9a-fA-F]{6}\b/.test(ui), 'ui.html contains no hard-coded hex color (uses Figma UI variables)');

console.log(`\n${checks - failures}/${checks} checks passed.`);
if (failures > 0) process.exit(1);
console.log('Figma sync artifacts verified against tokens/*.json.');
