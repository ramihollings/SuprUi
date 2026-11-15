/* Supr UI — Token Sync plugin (main thread).
 *
 * Reads the Tokens Studio document embedded below (generated from
 * tokens/*.json by scripts/sync-tokens.mjs — this file contains no token
 * values of its own) and creates/updates Figma Variables in six
 * collections: color, spacing, radius, border, typography, motion.
 * The color collection has Dark (default) and Light modes; semantic color
 * tokens alias the primitive ramp variables, so a primitive change follows
 * through everywhere. Re-running the plugin updates values in place —
 * it never duplicates a variable.
 *
 * Figma loads only this one file as the plugin's main code, which is why
 * the token document is embedded here. To regenerate: run
 *   node figma-plugin/scripts/sync-tokens.mjs
 * from the repo root. Do not edit the generated code.js by hand.
 */

// The sync script replaces this placeholder with the Tokens Studio document.
const TOKENS = __SUPR_TOKENS_JSON__;

// ---------------------------------------------------------------------------
// Token model (rebuilt from the embedded document — same rules as the sync
// script, so the plugin and the REST payload can never drift apart)
// ---------------------------------------------------------------------------

const COLLECTIONS = ['color', 'spacing', 'radius', 'border', 'typography', 'motion'];
const COLLECTION_MODES = {
  color: ['Dark', 'Light'],
  spacing: ['Default'],
  radius: ['Default'],
  border: ['Default'],
  typography: ['Default'],
  motion: ['Default'],
};
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

function hexToRgba(hex) {
  const m = /^#([0-9a-fA-F]{6})$/.exec(hex);
  if (!m) throw new Error('Unsupported color value (expected #RRGGBB): ' + hex);
  const n = parseInt(m[1], 16);
  return {
    r: round4(((n >> 16) & 255) / 255),
    g: round4(((n >> 8) & 255) / 255),
    b: round4((n & 255) / 255),
    a: 1,
  };
}

function convertLiteral(type, value) {
  switch (type) {
    case 'color':
      return hexToRgba(value);
    case 'dimension': {
      const m = /^([\d.]+)px$/.exec(value);
      if (!m) throw new Error('Unsupported dimension value (expected Npx): ' + value);
      return parseFloat(m[1]);
    }
    case 'duration': {
      const m = /^([\d.]+)ms$/.exec(value);
      if (!m) throw new Error('Unsupported duration value (expected Nms): ' + value);
      return parseFloat(m[1]);
    }
    case 'fontWeight':
    case 'number': {
      const n = Number(value);
      if (!Number.isFinite(n)) throw new Error('Unsupported numeric value: ' + value);
      return n;
    }
    case 'fontFamily':
    case 'cubicBezier':
      return String(value);
    default:
      throw new Error('Unsupported token $type: ' + type);
  }
}

/**
 * Flatten one Tokens Studio set into leaves { path, type, value, description }.
 * A node with $value is a leaf; anything else is a group. Keys starting
 * with '$' ($metadata, $themes) are skipped.
 */
function flattenSet(node, prefix, out) {
  if (node === null || typeof node !== 'object' || Array.isArray(node)) return;
  if (Object.prototype.hasOwnProperty.call(node, '$value')) {
    out.push({
      path: prefix.join('.'),
      type: node.$type,
      value: node.$value,
      description: typeof node.$description === 'string' ? node.$description : undefined,
    });
    return;
  }
  for (const key of Object.keys(node)) {
    if (key.startsWith('$')) continue;
    flattenSet(node[key], prefix.concat(key), out);
  }
}

/** Build the variable list from the embedded document. */
function buildVariables(doc) {
  // set -> dotted path -> leaf. Semantic leaves live in their own sets
  // (semantic-dark / semantic-light) under color.semantic.<name>.
  const leavesBySet = {};
  for (const set of ['core', 'semantic-dark', 'semantic-light']) {
    const leaves = [];
    flattenSet(doc[set] || {}, [], leaves);
    leavesBySet[set] = new Map(leaves.map((leaf) => [leaf.path, leaf]));
  }
  const core = leavesBySet['core'];

  function findLeaf(refPath) {
    return core.get(refPath) || leavesBySet['semantic-dark'].get(refPath) || leavesBySet['semantic-light'].get(refPath);
  }

  // Resolve a leaf value: literal -> converted Figma value; {ref} -> alias.
  function resolve(leaf) {
    if (typeof leaf.value === 'string') {
      const ref = REFERENCE_RE.exec(leaf.value);
      if (ref) {
        const target = findLeaf(ref[1]);
        if (!target) throw new Error('Unresolved token reference {' + ref[1] + '} in ' + leaf.path);
        return { kind: 'alias', target: ref[1].replaceAll('.', '/') };
      }
    }
    if (!FIGMA_TYPE[leaf.type]) throw new Error('Unsupported token $type "' + leaf.type + '" in ' + leaf.path);
    return { kind: 'literal', value: convertLiteral(leaf.type, leaf.value) };
  }

  const variables = new Map();
  function add(varName, collection, type, description, mode, resolved) {
    let variable = variables.get(varName);
    if (!variable) {
      variable = { name: varName, collection, type, description, values: {} };
      variables.set(varName, variable);
    }
    if (variable.type !== type) throw new Error('Type conflict for ' + varName);
    if (variable.values[mode] !== undefined) throw new Error('Duplicate value for ' + varName + ' in mode ' + mode);
    variable.values[mode] = resolved;
    if (description && !variable.description) variable.description = description;
  }

  for (const leaf of core.values()) {
    const collection = leaf.path.split('.')[0];
    if (COLLECTIONS.indexOf(collection) === -1) throw new Error('Unknown token group in ' + leaf.path);
    const resolved = resolve(leaf);
    const type = FIGMA_TYPE[leaf.type];
    const varName = leaf.path.replaceAll('.', '/');
    if (collection === 'color') {
      add(varName, collection, type, leaf.description, 'Dark', resolved);
      add(varName, collection, type, leaf.description, 'Light', resolved);
    } else {
      add(varName, collection, type, leaf.description, 'Default', resolved);
    }
  }
  // Semantic tokens: one variable, Dark value from semantic-dark, Light from semantic-light.
  for (const mode of ['Dark', 'Light']) {
    const set = mode === 'Dark' ? 'semantic-dark' : 'semantic-light';
    for (const leaf of leavesBySet[set].values()) {
      const varName = leaf.path.replaceAll('.', '/');
      add(varName, 'color', FIGMA_TYPE[leaf.type], leaf.description, mode, resolve(leaf));
    }
  }

  for (const variable of variables.values()) {
    for (const mode of COLLECTION_MODES[variable.collection]) {
      if (variable.values[mode] === undefined) {
        throw new Error('Variable ' + variable.name + ' is missing a value for mode ' + mode);
      }
    }
    for (const resolved of Object.values(variable.values)) {
      if (resolved.kind === 'alias' && !variables.has(resolved.target)) {
        throw new Error('Alias ' + variable.name + ' points at missing variable ' + resolved.target);
      }
    }
  }
  return [...variables.values()].sort((a, b) =>
    a.collection === b.collection
      ? a.name.localeCompare(b.name)
      : COLLECTIONS.indexOf(a.collection) - COLLECTIONS.indexOf(b.collection),
  );
}

// ---------------------------------------------------------------------------
// Figma sync
// ---------------------------------------------------------------------------

function valuesEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  if (a.type === 'VARIABLE_ALIAS' || b.type === 'VARIABLE_ALIAS') {
    return a.type === 'VARIABLE_ALIAS' && b.type === 'VARIABLE_ALIAS' && a.id === b.id;
  }
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of keys) {
    if (typeof a[key] === 'number' && typeof b[key] === 'number') {
      if (Math.abs(a[key] - b[key]) > 0.0001) return false;
    } else if (a[key] !== b[key]) {
      return false;
    }
  }
  return true;
}

async function syncAll(doc, log) {
  const variables = buildVariables(doc);
  log('Found ' + variables.length + ' variables in the embedded token document.');

  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const allVariables = await figma.variables.getLocalVariablesAsync();

  const report = { collections: 0, created: 0, updated: 0, unchanged: 0, aliases: 0, warnings: [] };

  // Pass 1 — collections, modes, and variable shells (no values yet, so
  // aliases can always find their target in pass 2).
  const createdVariables = new Map(); // varName -> Variable
  for (const collectionName of COLLECTIONS) {
    let collection = collections.find((c) => c.name === collectionName);
    if (!collection) {
      collection = figma.variables.createVariableCollection(collectionName);
      log('Created collection "' + collectionName + '".');
      report.collections += 1;
    }
    const modes = COLLECTION_MODES[collectionName];
    const modeIdByName = {};
    for (const mode of collection.modes) modeIdByName[mode.name] = mode.modeId;
    // First mode is the default: rename it to the expected name.
    const defaultMode = collection.modes[0];
    if (defaultMode.name !== modes[0]) {
      collection.renameMode(defaultMode.modeId, modes[0]);
      modeIdByName[modes[0]] = defaultMode.modeId;
      delete modeIdByName[defaultMode.name];
    }
    for (const mode of modes.slice(1)) {
      if (!modeIdByName[mode]) {
        modeIdByName[mode] = collection.addMode(mode);
        log('Added mode "' + mode + '" to "' + collectionName + '".');
      }
    }

    const inCollection = allVariables.filter((v) => v.variableCollectionId === collection.id);
    for (const spec of variables.filter((v) => v.collection === collectionName)) {
      let variable = inCollection.find((v) => v.name === spec.name);
      if (!variable) {
        variable = figma.variables.createVariable(spec.name, collection, spec.type);
        report.created += 1;
      } else if (variable.resolvedType !== spec.type) {
        report.warnings.push(
          'Skipped ' + spec.name + ': existing variable is ' + variable.resolvedType + ', token needs ' + spec.type + '. Delete it in Figma and re-run to fix.',
        );
        continue;
      }
      if (spec.description && variable.description !== spec.description) {
        variable.description = spec.description;
      }
      createdVariables.set(spec.name, { variable, modeIdByName, spec });
    }
  }

  // Pass 2 — values (aliases resolve because every variable now exists).
  for (const { variable, modeIdByName, spec } of createdVariables.values()) {
    let touched = false;
    for (const mode of COLLECTION_MODES[spec.collection]) {
      const resolved = spec.values[mode];
      let value;
      if (resolved.kind === 'alias') {
        const target = createdVariables.get(resolved.target);
        if (!target) {
          report.warnings.push('Skipped alias for ' + spec.name + ': target ' + resolved.target + ' was not created.');
          continue;
        }
        value = figma.variables.createVariableAlias(target.variable);
        report.aliases += 1;
      } else {
        value = resolved.value;
      }
      const modeId = modeIdByName[mode];
      const current = variable.valuesByMode[modeId];
      if (valuesEqual(current, value)) {
        report.unchanged += 1;
      } else {
        variable.setValueForMode(modeId, value);
        report.updated += 1;
        touched = true;
      }
    }
    if (!touched && variable.valuesByMode && Object.keys(variable.valuesByMode).length === 0) {
      // New variable with no values set yet (e.g. all modes skipped) — leave it.
    }
  }

  log(
    'Done: ' +
      report.created +
      ' created, ' +
      report.updated +
      ' values set, ' +
      report.unchanged +
      ' already correct, ' +
      report.aliases +
      ' aliases.',
  );
  if (report.warnings.length > 0) {
    for (const warning of report.warnings) log('Warning: ' + warning);
  }
  return report;
}

// ---------------------------------------------------------------------------
// UI wiring
// ---------------------------------------------------------------------------

figma.showUI(__html__, { width: 360, height: 340, title: 'Supr UI — Token Sync' });

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'close') {
    figma.closePlugin();
    return;
  }
  if (msg.type !== 'sync') return;
  const log = (line) => figma.ui.postMessage({ type: 'log', line });
  try {
    const report = await syncAll(TOKENS, log);
    figma.ui.postMessage({ type: 'done', report });
    figma.notify(
      'Supr UI tokens synced: ' + report.created + ' created, ' + report.updated + ' updated' +
        (report.warnings.length > 0 ? ', ' + report.warnings.length + ' warnings' : ''),
    );
  } catch (err) {
    const message = err && err.message ? err.message : String(err);
    figma.ui.postMessage({ type: 'error', message });
    figma.notify('Token sync failed: ' + message, { error: true });
  }
};
