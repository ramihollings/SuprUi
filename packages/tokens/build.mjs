/**
 * Supr UI tokens — build script.
 *
 * 1. Runs Style Dictionary (style-dictionary.config.mjs) to generate
 *    dist/web.css, dist/native/theme.ts and dist/tokens.json from
 *    ../../tokens/*.json.
 * 2. Compiles dist/native/theme.ts to dist/native/theme.js + theme.d.ts
 *    with tsc, because package.json exports "./native" as theme.js
 *    (with types from theme.d.ts).
 *
 * Run: npm run build   (from packages/tokens, or via the repo root)
 */
import { execFile } from 'node:child_process';
import { readdir, stat } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import StyleDictionary from 'style-dictionary';
import config from './style-dictionary.config.mjs';

const execFileAsync = promisify(execFile);
const packageDir = fileURLToPath(new URL('.', import.meta.url));

async function listDist(dir, prefix = '') {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listDist(full, rel)));
    } else {
      const { size } = await stat(full);
      files.push({ rel, size });
    }
  }
  return files;
}

const sd = new StyleDictionary(config);
await sd.buildAllPlatforms();

// theme.ts -> theme.js + theme.d.ts (exports "./native" points at theme.js).
// Resolve tsc via the typescript package entry: TS 7's package exports do
// not expose './bin/tsc', so go through lib/typescript.js -> ../bin/tsc.
const require = createRequire(import.meta.url);
const tsLib = require.resolve('typescript');
const tscBin = path.join(path.dirname(tsLib), '..', 'bin', 'tsc');
await execFileAsync(
  process.execPath,
  [
    tscBin,
    'dist/native/theme.ts',
    '--ignoreConfig',
    '--outDir',
    'dist/native',
    '--module',
    'esnext',
    '--target',
    'es2022',
    '--moduleResolution',
    'bundler',
    '--declaration',
    'true',
    '--skipLibCheck',
    'true',
  ],
  { cwd: packageDir },
);

const files = await listDist(path.join(packageDir, 'dist'));
for (const { rel, size } of files.sort((a, b) => a.rel.localeCompare(b.rel))) {
  console.log(`  dist/${rel} (${size} bytes)`);
}
console.log('@mrtechnology/tokens build complete.');
