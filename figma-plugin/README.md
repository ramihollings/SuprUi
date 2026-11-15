# Supr UI — Figma plugin / token sync

Syncs the W3C DTCG tokens in `tokens/*.json` (the single source of truth)
into Figma, three ways. Every value flows from the token sources — no token
value is typed in the plugin code or in the sync script.

## Three paths, one source

| Path | Who it's for | How |
|---|---|---|
| **Figma plugin** (recommended) | Anyone with the Figma file | Import `manifest.json` once, run the plugin, click **Sync tokens**. Works on any Figma plan. Idempotent — re-running updates values in place. |
| **Tokens Studio import** | Designers editing tokens in Figma | Import `tokens.json` in Tokens Studio; apply the Dark / Light themes. Per decision D2, Tokens Studio stays the Figma editor. |
| **Variables REST API** | CI / automation | POST `variables-rest.json` to `POST /v1/files/:file_key/variables` (see below). **Enterprise-only** — Figma gates this endpoint to full members of Enterprise orgs. |

## Files

| File | What it is |
|---|---|
| `manifest.json` | Plugin manifest (name, `code.js` main, `ui.html`, Figma only, no network access). The `id` is a placeholder — Figma assigns the real one on publish. |
| `code.template.js` | Hand-written plugin logic. Reads the embedded token document, creates/updates variables, resolves `{references}` to `VARIABLE_ALIAS`. Contains **no token values**. |
| `code.js` | **Generated.** `code.template.js` + the token document embedded. Figma loads exactly one main file, so the data travels inside `code.js`. Never edit by hand. |
| `ui.html` | Plugin UI (Sync / Close + log). Uses Figma's own UI CSS variables, no hard-coded colors. |
| `tokens.json` | **Generated.** Tokens Studio format. Sets: `core` (primitives + spacing/radius/border/typography/motion), `semantic-dark`, `semantic-light`; themes Dark / Light. |
| `variables-rest.json` | **Generated.** Figma Variables REST `POST` body (4 arrays: `variableCollections`, `variableModes`, `variables`, `variableModeValues`, temp ids linking them). |
| `scripts/sync-tokens.mjs` | The generator. Reads `tokens/*.json`, writes the three files above, fails loudly on unresolved references, type conflicts, or duplicate names. Zero dependencies, Node >= 20. |
| `scripts/verify-sync.mjs` | Independent check: re-derives expectations from `tokens/*.json` with its own code and asserts the artifacts match (values, aliases, structure, no hard-coded hex in the template). |
| `scripts/apply-rest.mjs` | POSTs `variables-rest.json` to Figma. Needs `FIGMA_TOKEN` (personal access token, `file_variables:write` scope) and `FIGMA_FILE_KEY`. |
| `package.json` | Standalone (not in the root workspaces): `npm --prefix figma-plugin run sync \| verify \| test \| apply:rest`. No install needed — zero dependencies. |

## Regenerate after a token change

```bash
node figma-plugin/scripts/sync-tokens.mjs   # from the repo root
node figma-plugin/scripts/verify-sync.mjs   # 33 checks, must all pass
```

Then re-run the plugin in Figma (or re-import `tokens.json` / re-POST the
REST payload). Do not hand-edit `code.js`, `tokens.json`, or
`variables-rest.json` — they are overwritten on every sync.

## What lands in Figma

Six variable collections, named exactly after the token groups:

| Collection | Variables | Modes | Figma types |
|---|---|---|---|
| `color` | `color/black/*` (13), `color/cobalt/*` (10), `color/semantic/*` (17) | **Dark** (default), **Light** | COLOR |
| `spacing` | `spacing/0` … `spacing/16` (11) | Default | FLOAT (px) |
| `radius` | `radius/sharp|rounded|extra-rounded|circular` (4) | Default | FLOAT (px) |
| `border` | `border/width/none|thin|fat` (3) | Default | FLOAT (px) |
| `typography` | `typography/font-family` (STRING), `typography/size/*/font-size|line-height` (14), `typography/weight/*` (4) | Default | STRING / FLOAT |
| `motion` | `motion/duration/*` (3), `motion/easing/ease-out` (STRING), `motion/spring/*/stiffness|damping` (4) | Default | FLOAT (ms) / STRING |

85 variables total (102 source tokens; the 17 semantic colors collapse into
17 variables with per-mode values). Semantic colors **alias** the primitive
ramp where the token is a reference (e.g. dark `color/semantic/background`
aliases `color/black/0`, light aliases `color/black/1200`), so changing a
primitive follows through. Tokens with a literal value per theme (e.g.
`danger`, `success`, `warning`) get concrete per-mode values instead.

## Install the plugin in Figma (do this in Figma — untested here)

1. Figma desktop app → **Plugins → Development → Import plugin from manifest…**
2. Select this folder's `manifest.json`. (Figma may assign its own plugin id
   on first import; the `id` in the manifest is a placeholder.)
3. Open the design file → **Plugins → Development → Supr UI — Token Sync**.
4. Click **Sync tokens**. Watch the log; it reports created / updated /
   unchanged / aliases and any warnings.
5. Verify in the Variables panel (right sidebar → Variables): six
   collections exist; `color` has Dark and Light modes; switching modes
   changes the semantic colors; `color/cobalt/500` is the brand blue and
   `color/semantic/brand` aliases it in both modes.

## Import into Tokens Studio (alternative designer path)

1. In Figma, open the Tokens Studio plugin → **Settings → Import** (or the
   sync providers' file import) and choose `tokens.json`.
2. Three sets appear: `core`, `semantic-dark`, `semantic-light`, plus the
   **Dark** and **Light** themes. Apply Dark to see dark values, Light for
   light values. References (`{color.cobalt.500}`) resolve across sets.
3. To push Tokens Studio edits back into code, export from Tokens Studio
   and replace `tokens/*.json`, then re-run the sync script — the repo
   stays the source of truth.

## REST path (Enterprise only)

```bash
FIGMA_TOKEN=... FIGMA_FILE_KEY=... node figma-plugin/scripts/apply-rest.mjs
```

- The file key is the middle segment of the Figma file URL.
- The payload is **CREATE-only and one atomic request**: on a file that
  already has these collections it fails with duplicate-name errors. For a
  re-sync, delete the six collections in Figma first — or use the plugin,
  which updates in place.
- A 403 with `Limited by Figma plan` means the file's org is not
  Enterprise; use the plugin path instead.

## What is untested (read this before trusting it)

- **Everything Figma-side.** This sandbox has no Figma access, no Figma
  account, and no token, so the plugin has never run inside Figma and the
  REST payload has never been POSTed. The manifest shape, the Plugin API
  calls (`createVariableCollection`, `createVariable`, `setValueForMode`,
  `createVariableAlias`, async getters), and the REST body shape were
  verified against Figma's developer docs
  (developers.figma.com, Variables guide + Variables REST endpoints,
  checked 2026-11-13), not by execution.
- **What was verified on disk:** `sync-tokens.mjs` ran against the real
  `tokens/*.json` (102 tokens → 85 variables, 24 alias mode values) and
  `verify-sync.mjs` passes 33/33 checks — every output value equals its
  source token (or aliases the right variable), temp ids are unique, names
  are valid, the payload is 42 KB (limit 4 MB), `code.js` passes
  `node --check`, and the template contains no hard-coded token values.
- **First-run checklist for the user:** import the manifest, run the sync,
  and confirm (a) 6 collections, (b) Dark/Light modes on `color`, (c)
  `color/cobalt/500` is the brand blue, (d) `color/semantic/background` is
  black in Dark and white in Light, (e) re-running the plugin reports
  everything "already correct" instead of duplicating variables.
