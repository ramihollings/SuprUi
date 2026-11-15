#!/usr/bin/env node
/**
 * Serve the built registry locally for testing.
 *
 * Serves registry/ (built by `npm run registry:build`) over HTTP so the
 * shadcn CLI and a browser can fetch it exactly as a static host would:
 *
 *   http://127.0.0.1:8787/registry.json
 *   http://127.0.0.1:8787/r/button.json
 *   http://127.0.0.1:8787/r/button-native.json
 *
 * Try it against a scratch app with:
 *   npx shadcn@latest add http://127.0.0.1:8787/r/button.json
 *
 * Zero dependencies, Node >= 20. Port: $PORT or 8787.
 * Usage: node scripts/registry/serve-registry.mjs
 */

import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, resolve, extname, normalize } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const DIR = join(ROOT, "registry");
const PORT = Number(process.env.PORT ?? 8787);
const HOST = "127.0.0.1";

const TYPES = {
  ".json": "application/json",
  ".html": "text/html",
  ".md": "text/markdown",
  ".txt": "text/plain",
};

if (!existsSync(join(DIR, "registry.json"))) {
  console.error(`No built registry at ${DIR}/ — run \`npm run registry:build\` first.`);
  process.exit(1);
}

const server = createServer((req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url, `http://${HOST}`).pathname);
  const file = join(DIR, normalize(urlPath).replace(/^(\.\.[/\\])+/, ""));
  if (!file.startsWith(DIR) || !existsSync(file) || !statSync(file).isFile()) {
    res.writeHead(404, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "not found", path: urlPath }));
    return;
  }
  res.writeHead(200, {
    "content-type": TYPES[extname(file)] ?? "application/octet-stream",
    "access-control-allow-origin": "*",
  });
  res.end(readFileSync(file));
});

server.listen(PORT, HOST, () => {
  console.log(`Supr UI registry serving ${DIR}/`);
  console.log(`  index:  http://${HOST}:${PORT}/registry.json`);
  console.log(`  web:    http://${HOST}:${PORT}/r/button.json`);
  console.log(`  native: http://${HOST}:${PORT}/r/button-native.json`);
});
