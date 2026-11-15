#!/usr/bin/env node
/**
 * Validate registry.json against the actual repo.
 *
 * Checks, per item:
 *  - every listed file exists on disk
 *  - name/type/title/description present; type is registry:ui or registry:lib
 *  - hosted slug is unique (web: <name>; react-native: <name>-native)
 *  - registryDependencies name items that exist
 *  - every relative import in a listed file resolves to a file in the same
 *    item or in one of its registryDependencies (extensionless resolved)
 *  - every bare import is either in the item's `dependencies` or a peer
 *    (react, react-dom, react-native) of the owning package
 *  - every entry in `dependencies` is actually imported by one of the
 *    item's files (no spurious deps) and exists in the owning package's
 *    dependencies / peerDependencies / devDependencies
 *  - all 10 components exist on both platforms, plus the lib items the
 *    components depend on (utils, motion, theme)
 *
 * Usage: node scripts/registry/validate-registry.mjs
 * Exit 0 when clean, 1 when any check fails. Also importable: validate().
 */

import { readFileSync, existsSync } from "node:fs";
import { join, dirname, resolve, relative, extname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const REGISTRY_PATH = join(ROOT, "registry.json");

const COMPONENTS = [
  "button",
  "input",
  "dialog",
  "popover",
  "select",
  "tabs",
  "toast",
  "card",
  "avatar",
  "switch",
];
const PEER_ALLOWLIST = new Set(["react", "react-dom", "react-native"]);
const SLUG_SUFFIX = { "react-native": "-native" };

function slugFor(item) {
  return item.name + (SLUG_SUFFIX[item.platform] ?? "");
}

function owningPackage(item) {
  // Lib and component items live under packages/web (web) or
  // packages/native (react-native); decide by the first file's path.
  const first = item.files?.[0]?.path ?? "";
  if (first.startsWith("packages/native/")) return "packages/native";
  return "packages/web";
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

/** Root package name of a bare import specifier: "@scope/name" or "name". */
function rootPackage(spec) {
  const parts = spec.split("/");
  return spec.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0];
}

const IMPORT_RE =
  /(?:from\s+['"]([^'"]+)['"]|import\s+['"]([^'"]+)['"]|require\(\s*['"]([^'"]+)['"]\s*\))/g;

function importSpecifiers(source) {
  const out = [];
  for (const m of source.matchAll(IMPORT_RE)) {
    out.push(m[1] ?? m[2] ?? m[3]);
  }
  return out;
}

/** Resolve an extensionless relative import to a repo-relative file path. */
function resolveRelative(fromFile, spec) {
  const base = resolve(ROOT, dirname(fromFile), spec);
  const candidates = [base, `${base}.ts`, `${base}.tsx`, `${base}.js`, `${base}.jsx`];
  for (const c of candidates) {
    if (existsSync(c)) return relative(ROOT, c);
  }
  return null;
}

export function validate() {
  const errors = [];
  const warnings = [];
  const registry = readJson(REGISTRY_PATH);
  const items = registry.items ?? [];

  // --- index -------------------------------------------------------------
  if (registry.name !== "supr-ui") {
    errors.push(`registry.name is ${JSON.stringify(registry.name)}, expected "supr-ui"`);
  }

  const byName = new Map();
  const slugs = new Map();
  for (const item of items) {
    const key = `${item.platform ?? "web"}:${item.name}`;
    if (byName.has(key)) errors.push(`duplicate item ${key}`);
    byName.set(key, item);

    const slug = slugFor(item);
    if (slugs.has(slug)) {
      errors.push(
        `slug collision: "${slug}" claimed by both ${slugs.get(slug)} and ${key} — ` +
          `hosted per-item files (/r/<slug>.json) must be unique`,
      );
    }
    slugs.set(slug, key);

    for (const field of ["name", "type", "title", "description"]) {
      if (!item[field]) errors.push(`${key}: missing ${field}`);
    }
    if (item.type && !["registry:ui", "registry:lib"].includes(item.type)) {
      errors.push(`${key}: unknown type ${JSON.stringify(item.type)}`);
    }
    if (!Array.isArray(item.files) || item.files.length === 0) {
      errors.push(`${key}: no files listed`);
    }
    for (const dep of item.registryDependencies ?? []) {
      if (!items.some((i) => i.name === dep)) {
        errors.push(`${key}: registryDependency ${JSON.stringify(dep)} names no item`);
      }
    }
  }

  // --- coverage: 10 components x 2 platforms + lib items ------------------
  for (const name of COMPONENTS) {
    if (!byName.has(`web:${name}`)) errors.push(`missing web component item "${name}"`);
    if (!byName.has(`react-native:${name}`)) {
      errors.push(`missing react-native component item "${name}"`);
    }
  }
  for (const lib of ["utils", "motion", "theme"]) {
    if (!items.some((i) => i.name === lib && i.type === "registry:lib")) {
      errors.push(`missing registry:lib item "${lib}" (components import it)`);
    }
  }

  // --- per-item file + import checks --------------------------------------
  for (const item of items) {
    const key = `${item.platform ?? "web"}:${item.name}`;
    const pkg = readJson(join(ROOT, owningPackage(item), "package.json"));
    const available = new Set([
      ...Object.keys(pkg.dependencies ?? {}),
      ...Object.keys(pkg.peerDependencies ?? {}),
      ...Object.keys(pkg.devDependencies ?? {}),
    ]);

    // Files this item owns, plus files its registryDependencies own.
    const ownFiles = new Set();
    for (const f of item.files ?? []) {
      const abs = join(ROOT, f.path);
      if (!existsSync(abs)) {
        errors.push(`${key}: file not found: ${f.path}`);
        continue;
      }
      ownFiles.add(f.path);
    }
    const depFiles = new Set();
    for (const depName of item.registryDependencies ?? []) {
      const dep = items.find((i) => i.name === depName);
      for (const f of dep?.files ?? []) depFiles.add(f.path);
    }

    const importedBare = new Set();
    for (const f of item.files ?? []) {
      const abs = join(ROOT, f.path);
      if (!existsSync(abs)) continue;
      const source = readFileSync(abs, "utf8");
      for (const spec of importSpecifiers(source)) {
        if (spec.startsWith(".")) {
          const resolved = resolveRelative(f.path, spec);
          if (!resolved) {
            errors.push(`${key}: ${f.path} imports ${JSON.stringify(spec)} — no such file`);
          } else if (!ownFiles.has(resolved) && !depFiles.has(resolved)) {
            errors.push(
              `${key}: ${f.path} imports ${spec} (-> ${resolved}), which is in no ` +
                `file of this item nor of its registryDependencies ` +
                `(${[...(item.registryDependencies ?? [])].join(", ") || "none"})`,
            );
          }
        } else {
          importedBare.add(rootPackage(spec));
        }
      }
    }

    for (const dep of item.dependencies ?? []) {
      if (!available.has(dep)) {
        errors.push(`${key}: dependency ${JSON.stringify(dep)} is not in ${owningPackage(item)}/package.json`);
      }
      if (!importedBare.has(dep)) {
        errors.push(`${key}: dependency ${JSON.stringify(dep)} is listed but imported by no file of this item`);
      }
    }
    for (const bare of importedBare) {
      if (PEER_ALLOWLIST.has(bare)) continue;
      if (!(item.dependencies ?? []).includes(bare)) {
        errors.push(`${key}: imports ${JSON.stringify(bare)} but does not list it in dependencies`);
      }
    }
  }

  return { errors, warnings, itemCount: items.length };
}

function main() {
  const { errors, itemCount } = validate();
  if (errors.length === 0) {
    console.log(`registry.json OK — ${itemCount} items, all files resolve, all imports covered.`);
    process.exit(0);
  }
  console.log(`registry.json INVALID — ${errors.length} problem(s) across ${itemCount} items:`);
  for (const e of errors) console.log(`  - ${e}`);
  process.exit(1);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main();
