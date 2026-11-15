#!/usr/bin/env node
/**
 * Build the hosted registry from registry.json.
 *
 * Output: registry/
 *   registry.json        — verbatim copy of the index (the shadcn registry)
 *   r/<slug>.json        — one shadcn item file per registry item, with the
 *                          source embedded as `content`, ready to be served
 *                          from any static host and fetched directly:
 *                            npx shadcn@latest add https://<host>/r/button.json
 *
 * Slugs: web items keep their component name (button); react-native items
 * get a -native suffix (button-native), because the two platforms share
 * component names and hosted item files must be unique per registry.
 *
 * Install targets preserve the relative imports between a component and
 * its lib files: components land at components/ui/<slug>.tsx and lib files
 * at lib/<file>, so a web component's `../../lib/utils` still resolves.
 * Native components import `../../theme` in the repo; the generated
 * content rewrites that to `../../lib/theme` to match the lib target
 * (lib/theme.tsx).
 *
 * Usage: node scripts/registry/build-registry.mjs
 * (Validates first; refuses to build an invalid registry.)
 */

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { join, dirname, resolve, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { validate, } from "./validate-registry.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = join(ROOT, "registry");

function slugFor(item) {
  return item.platform === "react-native" ? `${item.name}-native` : item.name;
}

function build() {
  const { errors } = validate();
  if (errors.length > 0) {
    console.error("registry.json is invalid — fix it before building:");
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }

  const registry = JSON.parse(readFileSync(join(ROOT, "registry.json"), "utf8"));
  const items = registry.items;
  const byName = new Map(items.map((i) => [i.name, i]));

  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(join(OUT, "r"), { recursive: true });

  writeFileSync(join(OUT, "registry.json"), readFileSync(join(ROOT, "registry.json"), "utf8"));

  const built = [];
  for (const item of items) {
    const slug = slugFor(item);
    const files = (item.files ?? []).map((f) => {
      let content = readFileSync(join(ROOT, f.path), "utf8");
      let target;
      if (item.type === "registry:lib") {
        target = `lib/${basename(f.path)}`;
      } else {
        target = `components/ui/${slug}.tsx`;
      }
      // Native components import ../../theme; in the consumer layout the
      // theme lib lives at lib/theme.tsx, so rewrite the import.
      if (item.platform === "react-native" && item.type === "registry:ui") {
        content = content.replace(
          /from\s*(['"])\.\.\/\.\.\/theme\1/g,
          "from $1../../lib/theme$1",
        );
      }
      return { path: f.path, content, type: f.type, target };
    });

    const out = {
      $schema: "https://ui.shadcn.com/schema/registry-item.json",
      name: slug,
      type: item.type,
      title: item.title,
      description: item.description,
      dependencies: item.dependencies ?? [],
      registryDependencies: (item.registryDependencies ?? []).map(
        (d) => slugFor(byName.get(d)),
      ),
      files,
    };
    if (item.platform) out.platform = item.platform;
    writeFileSync(join(OUT, "r", `${slug}.json`), JSON.stringify(out, null, 2) + "\n");
    built.push(slug);
  }

  console.log(`registry built — ${built.length} items -> ${OUT}/`);
  console.log(`  index: registry.json`);
  console.log(`  items: r/{${built.join(", ")}}.json`);
}

build();
