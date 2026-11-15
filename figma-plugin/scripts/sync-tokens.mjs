#!/usr/bin/env node
/**
 * Supr UI — Figma token sync (build step, runs on disk, zero dependencies).
 *
 * Reads the W3C DTCG token sources in tokens/*.json — the single source of
 * truth — and generates three artifacts in figma-plugin/:
 *
 *   tokens.json         Tokens Studio format. Sets: core, semantic-dark,
 *                       semantic-light; themes: Dark, Light. Import via
 *                       Tokens Studio -> Settings -> Import, or let the
 *                       plugin below consume it.
 *   variables-rest.json Figma Variables REST API request body for
 *                       POST /v1/files/:file_key/variables (Enterprise
 *                       only — see README). Temp ids link collections,
 *                       modes, variables and values in one atomic request.
 *   code.js             The plugin's main file, generated from
 *                       code.template.js with the Tokens Studio document
 *                       embedded. Figma loads exactly one main file, so the
 *                       token data travels inside code.js; the template
 *                       itself contains no token values.
 *
 * No token value is typed anywhere in this script or in the plugin template:
 * every value flows from tokens/*.json. Run from the repo root:
 *
 *   node figma-plugin/scripts/sync-tokens.mjs
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PLUGIN_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPO_ROOT = path.resolve(PLUGIN_DIR, '..');
const TOKENS_DIR = path.join(REPO_ROOT, 'tokens');
const TOKEN_FILES = ['color.json', 'spacing.json', 'radius.json', 'border.json', 'typography.json', 'motion.json'];

// ---------------------------------------------------------------------------
// Token model
// ---------------------------------------------------------------------------

/** Figma collection per top-level token group. Order is the creation order. */
const COLLECTIONS = ['color', 'spacing', 'radius', 'border', 'typography', 'motion'];

/** Modes per collection. Dark is the default (first) mode of the color set. */
const COLLECTION_MODES = {
  color: ['Dark', 'Light'],
  spacing: ['Default'],
  radius: ['Default'],
  border: ['Default'],
  typography: ['Default'],
  motion: ['Default'],
};

/** W3C DTCG $type -> Figma variable resolvedType. */
const FIGMA_TYPE = {
  color: 'COLOR',
  dimension: 'FLOAT',
  duration: 'FLOAT',
  fontWeight: 'FLOAT',
  number: 'FLOAT',
  fontFamily: 'STRING',
  cubicBezier: 'STRING',
};

const REFERENCE_RE = /^\{([^}]+)\}$/;

function round4(n) {
  return Math.round(n * 10000) / 10000;
}

/** "#RRGGBB" -> Figma { r, g, b, a } with 0-1 channels. */
function hexToRgba(hex) {
  const m = /^#([0-9a-fA-F]{6})$/.exec(hex);
  if (!m) throw new Error(`Unsupported color value (expected #RRGGBB): ${hex}`);
  const n = parseInt(m[1], 16);
  return {
    r: round4(((n >> 16) & 255) / 255),
    g: round4(((n >> 8) & 255) / 255),
    b: round4((n & 255) / 255),
    a: 1,
  };
}

/** A literal (non-reference) token value -> its Figma value. */
function convertLiteral(type, value) {
  switch (type) {
    case 'color':
      return hexToRgba(value);
    case 'dimension': {
      const m = /^([\d.]+)px$/.exec(value);
      if (!m) throw new Error(`Unsupported dimension value (expected Npx): ${value}`);
      return parseFloat(m[1]);
    }
    case 'duration': {
      const m = /^([\d.]+)ms$/.exec(value);
      if (!m) throw new Error(`Unsupported duration value (expected Nms): ${value}`);
      return parseFloat(m[1]);
    }
    case 'fontWeight':
    case 'number': {
      const n = Number(value);
      if (!Number.isFinite(n)) throw new Error(`Unsupported numeric value: ${value}`);
      return n;
    }
    case 'fontFamily':
    case 'cubicBezier':
      return String(value);
    default:
      throw new Error(`Unsupported token $type: ${type}`);
  }
}

/**
 * Walk a token tree. A node with $value is a leaf token; anything else is a
 * group. Keys starting with '$' (e.g. $metadata) are skipped.
 * Yields { path, type, value, description } with a dot-joined path.
 */
function* walkTokens(node, prefix = []) {
  if (node === null || typeof node !== 'object' || Array.isArray(node)) return;
  if (Object.prototype.hasOwnProperty.call(node, '$value')) {
    yield {
      path: prefix.join('.'),
      type: node.$type,
      value: node.$value,
      description: typeof node.$description === 'string' ? node.$description : undefined,
    };
    return;
  }
  for (const [key, child] of Object.entries(node)) {
    if (key.startsWith('$')) continue;
    yield* walkTokens(child, [...prefix, key]);
  }
}

/** "color.semantic.dark.background" -> { basePath, mode } for semantic leaves. */
function splitSemanticPath(dotted) {
  const parts = dotted.split('.');
  if (parts[0] === 'color' && parts[1] === 'semantic' && (parts[2] === 'dark' || parts[2] === 'light')) {
    return { basePath: ['color', 'semantic', ...parts.slice(3)].join('.'), mode: parts[2] };
  }
  return { basePath: dotted, mode: null };
}

/** Dotted token path -> Figma variable name (slash-separated, mode dropped). */
function varNameFor(dotted) {
  return splitSemanticPath(dotted).basePath.replaceAll('.', '/');
}

function tempId(prefix, name) {
  return `${prefix}-${name.replaceAll('/', '-').replaceAll(/[^a-zA-Z0-9-]/g, '')}`;
}

// ---------------------------------------------------------------------------
// Load sources
// ---------------------------------------------------------------------------

const sources = {};
for (const file of TOKEN_FILES) {
  sources[file] = JSON.parse(await readFile(path.join(TOKENS_DIR, file), 'utf8'));
}

// Flatten every source file into leaves.
const leaves = [];
for (const file of TOKEN_FILES) {
  for (const leaf of walkTokens(sources[file])) leaves.push({ ...leaf, file });
}
if (leaves.length === 0) throw new Error('No tokens found in tokens/*.json');

const byPath = new Map(leaves.map((leaf) => [leaf.path, leaf]));

/** Resolve a leaf's $value: literal -> converted Figma value; reference -> alias. */
function resolveLeaf(leaf, trail = []) {
  if (typeof leaf.value === 'string') {
    const ref = REFERENCE_RE.exec(leaf.value);
    if (ref) {
      const targetPath = ref[1];
      if (trail.includes(targetPath)) {
        throw new Error(`Circular token reference: ${[...trail, targetPath].join(' -> ')}`);
      }
      const target = byPath.get(targetPath);
      if (!target) throw new Error(`Unresolved token reference {${targetPath}} in ${leaf.path}`);
      // Alias target: the variable the referenced token becomes. (References
      // may themselves be references; Figma aliases point at the variable,
      // so one hop is enough.)
      return { kind: 'alias', target: varNameFor(targetPath), targetType: target.type };
    }
  }
  if (!FIGMA_TYPE[leaf.type]) throw new Error(`Unsupported token $type "${leaf.type}" in ${leaf.path}`);
  return { kind: 'literal', value: convertLiteral(leaf.type, leaf.value) };
}

// ---------------------------------------------------------------------------
// Variable model: one Figma variable per token, semantic dark/light merged
// into a single variable with per-mode values.
// ---------------------------------------------------------------------------

/** Map varName -> { name, collection, type, description, values: { mode: resolved } } */
const variables = new Map();

function addVariable(varName, collection, type, description, mode, resolved) {
  let variable = variables.get(varName);
  if (!variable) {
    variable = { name: varName, collection, type, description, values: {} };
    variables.set(varName, variable);
  }
  if (variable.type !== type) {
    throw new Error(`Type conflict for ${varName}: ${variable.type} vs ${type}`);
  }
  if (variable.values[mode] !== undefined) {
    throw new Error(`Duplicate value for ${varName} in mode ${mode}`);
  }
  variable.values[mode] = resolved;
  if (description && !variable.description) variable.description = description;
}

for (const leaf of leaves) {
  const { basePath, mode } = splitSemanticPath(leaf.path);
  const collection = basePath.split('.')[0];
  if (!COLLECTIONS.includes(collection)) {
    throw new Error(`Token ${leaf.path} is in unknown group "${collection}" (expected one of ${COLLECTIONS.join(', ')})`);
  }
  const resolved = resolveLeaf(leaf);
  const type = FIGMA_TYPE[leaf.type];
  if (mode) {
    // Semantic token: Dark mode from the dark leaf, Light mode from the light leaf.
    addVariable(varNameFor(leaf.path), collection, type, leaf.description, mode === 'dark' ? 'Dark' : 'Light', resolved);
  } else if (collection === 'color') {
    // Primitive color: same value in both modes.
    addVariable(varNameFor(leaf.path), collection, type, leaf.description, 'Dark', resolved);
    addVariable(varNameFor(leaf.path), collection, type, leaf.description, 'Light', resolved);
  } else {
    addVariable(varNameFor(leaf.path), collection, type, leaf.description, 'Default', resolved);
  }
}

// Every variable must have a value for every mode of its collection.
for (const variable of variables.values()) {
  for (const mode of COLLECTION_MODES[variable.collection]) {
    if (variable.values[mode] === undefined) {
      throw new Error(`Variable ${variable.name} is missing a value for mode ${mode}`);
    }
  }
}

// Alias targets must exist and share the variable type.
for (const variable of variables.values()) {
  for (const resolved of Object.values(variable.values)) {
    if (resolved.kind === 'alias') {
      const target = variables.get(resolved.target);
      if (!target) throw new Error(`Alias ${variable.name} points at missing variable ${resolved.target}`);
      if (target.type !== variable.type) {
        throw new Error(`Alias type mismatch: ${variable.name} (${variable.type}) -> ${resolved.target} (${target.type})`);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Output 1: Tokens Studio format (tokens.json)
// ---------------------------------------------------------------------------

const tokensStudio = {
  $metadata: { tokenSetOrder: ['core', 'semantic-dark', 'semantic-light'] },
  $themes: [
    {
      id: 'supr-dark',
      name: 'Dark',
      group: 'Supr UI',
      selectedTokenSets: { core: 'enabled', 'semantic-dark': 'enabled', 'semantic-light': 'disabled' },
    },
    {
      id: 'supr-light',
      name: 'Light',
      group: 'Supr UI',
      selectedTokenSets: { core: 'enabled', 'semantic-dark': 'disabled', 'semantic-light': 'enabled' },
    },
  ],
  core: {
    color: {
      black: structuredClone(sources['color.json'].color.black),
      cobalt: structuredClone(sources['color.json'].color.cobalt),
    },
    spacing: structuredClone(sources['spacing.json'].spacing),
    radius: structuredClone(sources['radius.json'].radius),
    border: structuredClone(sources['border.json'].border),
    typography: structuredClone(sources['typography.json'].typography),
    motion: structuredClone(sources['motion.json'].motion),
  },
  'semantic-dark': {
    color: { semantic: structuredClone(sources['color.json'].color.semantic.dark) },
  },
  'semantic-light': {
    color: { semantic: structuredClone(sources['color.json'].color.semantic.light) },
  },
};

await writeFile(path.join(PLUGIN_DIR, 'tokens.json'), `${JSON.stringify(tokensStudio, null, 2)}\n`, 'utf8');

// ---------------------------------------------------------------------------
// Output 2: Figma Variables REST API request body (variables-rest.json)
// ---------------------------------------------------------------------------

const payload = { variableCollections: [], variableModes: [], variables: [], variableModeValues: [] };
const modeTempId = (collection, mode) => tempId('mode', `${collection}-${mode.toLowerCase()}`);
const varTempId = (varName) => tempId('var', varName);

for (const collection of COLLECTIONS) {
  const modes = COLLECTION_MODES[collection];
  const collId = tempId('coll', collection);
  payload.variableCollections.push({
    action: 'CREATE',
    id: collId,
    name: collection,
    initialModeId: modeTempId(collection, modes[0]),
  });
  // Rename the collection's initial mode, then create the rest.
  payload.variableModes.push({
    action: 'UPDATE',
    id: modeTempId(collection, modes[0]),
    name: modes[0],
    variableCollectionId: collId,
  });
  for (const mode of modes.slice(1)) {
    payload.variableModes.push({
      action: 'CREATE',
      id: modeTempId(collection, mode),
      name: mode,
      variableCollectionId: collId,
    });
  }
}

const sortedVariables = [...variables.values()].sort((a, b) =>
  a.collection === b.collection ? a.name.localeCompare(b.name) : COLLECTIONS.indexOf(a.collection) - COLLECTIONS.indexOf(b.collection),
);

for (const variable of sortedVariables) {
  const collId = tempId('coll', variable.collection);
  const entry = {
    action: 'CREATE',
    id: varTempId(variable.name),
    name: variable.name,
    variableCollectionId: collId,
    resolvedType: variable.type,
  };
  if (variable.description) entry.description = variable.description;
  payload.variables.push(entry);
  for (const mode of COLLECTION_MODES[variable.collection]) {
    const resolved = variable.values[mode];
    payload.variableModeValues.push({
      variableId: varTempId(variable.name),
      modeId: modeTempId(variable.collection, mode),
      value:
        resolved.kind === 'alias'
          ? { type: 'VARIABLE_ALIAS', id: varTempId(resolved.target) }
          : resolved.value,
    });
  }
}

const restJson = `${JSON.stringify(payload, null, 2)}\n`;
if (Buffer.byteLength(restJson, 'utf8') > 4 * 1024 * 1024) {
  throw new Error('REST payload exceeds Figma\'s 4MB limit — split the sync');
}
await writeFile(path.join(PLUGIN_DIR, 'variables-rest.json'), restJson, 'utf8');

// ---------------------------------------------------------------------------
// Output 3: plugin main file (code.js) — template + embedded Tokens Studio doc
// ---------------------------------------------------------------------------

const templatePath = path.join(PLUGIN_DIR, 'code.template.js');
const template = await readFile(templatePath, 'utf8');
const PLACEHOLDER = '__SUPR_TOKENS_JSON__';
if (template.split(PLACEHOLDER).length !== 2) {
  throw new Error(`code.template.js must contain exactly one ${PLACEHOLDER} placeholder`);
}
// Guardrail: the template must not contain a hard-coded token value.
if (/#[0-9a-fA-F]{6}\b/.test(template)) {
  throw new Error('code.template.js contains a hard-coded hex color — token values must come from tokens/*.json');
}
const codeJs = `// GENERATED by scripts/sync-tokens.mjs — do not edit by hand.\n// Edit code.template.js, then re-run: node figma-plugin/scripts/sync-tokens.mjs\n${template.replace(PLACEHOLDER, JSON.stringify(tokensStudio, null, 2))}`;
await writeFile(path.join(PLUGIN_DIR, 'code.js'), codeJs, 'utf8');

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

const aliasCount = [...variables.values()].reduce(
  (n, v) => n + Object.values(v.values).filter((r) => r.kind === 'alias').length,
  0,
);
console.log(`Supr UI Figma sync — read ${leaves.length} tokens from tokens/*.json`);
for (const collection of COLLECTIONS) {
  const count = [...variables.values()].filter((v) => v.collection === collection).length;
  console.log(`  ${collection}: ${count} variables (modes: ${COLLECTION_MODES[collection].join(', ')})`);
}
console.log(`  aliases: ${aliasCount} mode values point at another variable`);
console.log('Wrote:');
console.log(`  figma-plugin/tokens.json (${Buffer.byteLength(JSON.stringify(tokensStudio), 'utf8')} bytes, Tokens Studio)`);
console.log(`  figma-plugin/variables-rest.json (${Buffer.byteLength(restJson, 'utf8')} bytes, REST POST body)`);
console.log(`  figma-plugin/code.js (${Buffer.byteLength(codeJs, 'utf8')} bytes, plugin main file)`);
