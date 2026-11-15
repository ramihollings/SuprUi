# Publish runbook — Supr UI v0.1.0

Status: **PUBLISHED 2026-11-14 ~17:45 EST** — `@mrtechnology/tokens`, `@mrtechnology/ui`, `@mrtechnology/ui-native`, all 0.1.0, public. Install-verified in a scratch dir and `npm view` prints 0.1.0 for each. Source home: public GitHub repo [ramihollings/SuprUi](https://github.com/ramihollings/SuprUi) (decision D25). **No npm org is needed** — a scoped publish under the user's own username scope (`mrtechnology`) needs no org (decision D23, 2026-11-14). Publish route and staged-publishing behavior: decision D24 and `~/workspace/custom-connectors/custom.npm/CONNECTOR.md`.

## Packages to publish (in this order)

| # | Package | Version | Why this order |
|---|---------|---------|----------------|
| 1 | `@mrtechnology/tokens` | 0.1.0 | No Supr deps; both component packages depend on it |
| 2 | `@mrtechnology/ui` | 0.1.0 | Depends on `@mrtechnology/tokens` |
| 3 | `@mrtechnology/ui-native` | 0.1.0 | Depends on `@mrtechnology/tokens` |

All three already carry `publishConfig: { "access": "public" }`. `npm pack --dry-run`
was clean at M2 assembly (tokens 6.4 kB, web 10.5 kB, native 18.1 kB); `npm view`
confirmed all four names are free on the registry (404) on 2026-11-14:
`@mrtechnology/tokens`, `@mrtechnology/ui`, `@mrtechnology/ui-native`,
`@mrtechnology/mcp-server`.

Do **not** publish: `@mrtechnology/mcp-server` (private by design — stdio server, run from source),
`@mrtechnology/docs`, `@mrtechnology/demo` (apps, private).

## Step 1 — Create a granular access token (user, on npmjs.com, one-time)

No org, no org creation page — the `@mrtechnology` scope belongs to the user's
own npm username, so it already exists. What is needed is a token that can
publish under it:

1. Sign in at https://www.npmjs.com (account `mrtechnology`).
2. Profile → **Access Tokens** → **Generate New Token** → **Granular Access Token**.
3. Permissions: **Publish** (read-only is not enough). Scope: `@mrtechnology`.
   Set an expiry you are comfortable with; the token can be revoked any time.
4. Copy the token once — npm never shows it again.

No token exists yet (2026-11-14). Nothing in this repo stores one, and no
publish or login has been attempted from here.

**Done 2026-11-14 ~17:08 EST** — the user submitted the token via the secure
card. The token authenticates as npm user `ramihollings` (verified with
`whoami` via the `custom.npm` connector). Nothing in this repo stores the
token; the connector holds it.

## Step 2 — Configure the token locally (never commit it)

**Superseded by the connector route (D24) — no `~/.npmrc` entry was created.**
The token lives only in the registered `custom.npm` connection and publishing
goes through its helper. The commands below are kept as the manual fallback.

```bash
# Store the token in ~/.npmrc only (never in the repo, never in a file under version control)
npm config set //registry.npmjs.org/:_authToken=<paste the token here>

# Prove auth works (should print: mrtechnology)
npm whoami
```

## Step 3 — Rebuild, verify, publish (from repo root)

**Done 2026-11-14 ~17:45 EST** — rebuild + tests + typecheck re-run before
publishing (tokens 10/10, web 38/38, native 39/39 serialized, tsc clean), then
published in order via the `custom.npm` helper
(`python3 ~/workspace/custom-connectors/custom.npm/bin/npm_registry.py publish
<package-dir>`). Each PUT returned HTTP 202 `{"success":true}`; the real
version landed after the registry's staged processing (~1–3 min each), verified
through the abbreviated metadata, not the full packument GET (cached 404).

No `prepublishOnly` script exists, so rebuild explicitly first — `dist/` is what
ships (`files: ["dist", ...]`), and a stale `dist/` would publish old code.

```bash
cd ~/workspace/design-system

# Rebuild all three packages (tokens via Style Dictionary, web + native via tsc)
npm run build --workspaces --if-present

# Sanity: tests + typecheck green before anything goes public
npm test
npm run typecheck --workspaces --if-present

# Publish in dependency order — tokens first
npm publish --workspace=@mrtechnology/tokens
npm publish --workspace=@mrtechnology/ui
npm publish --workspace=@mrtechnology/ui-native
```

If a publish fails halfway (e.g. tokens published, ui failed), just fix and re-run
the failed step — already-published versions cannot be re-published, so bump the
version of the failed package only.

## Step 4 — Prove the install works

**Done 2026-11-14** — scratch dir was `~/workspace/install-test` (not `/tmp`,
to avoid the 512M tmpfs limit); removed after verification. All three
installed at 0.1.0. One gotcha: do not verify with
`require('<name>/package.json')` — the packages define an `exports` map that
does not export that path. Read the installed `package.json` files directly.

```bash
mkdir -p /tmp/mrtechnology-install-test && cd /tmp/mrtechnology-install-test
npm init -y
npm install @mrtechnology/ui @mrtechnology/tokens
npm install @mrtechnology/ui-native @mrtechnology/tokens   # Android side
```

`npm view @mrtechnology/tokens version` should print `0.1.0` afterwards.

## Step 5 — Registry (static host, still undecided)

The shadcn-style registry is built and validated (`npm run registry:validate` —
23 items, all files resolve). It just needs a static host. Suggested:
`registry.supr.technology` (undecided).

```bash
npm run registry:build    # regenerates registry/r/<slug>.json from registry.json
npm run registry:serve    # local preview only
```

Deploy the `registry/` directory as static files to the chosen host. No server,
no Verdaccio (rejected, D7).

## Step 6 — Docs hosting (still undecided)

`apps/docs/` is a Starlight site (Astro). It builds today, but `apps/docs/astro.config.mjs`
has **no `site` URL configured** — the sitemap integration warns on every build
until one is set.

Recommendation (not a decision): **Cloudflare Pages** — free, and the user's
stack already leans Cloudflare. Equivalent alternatives: Netlify, Vercel.

```bash
# 1. Set `site: "https://docs.supr.technology"` (or the chosen host) in apps/docs/astro.config.mjs
# 2. Build + preview
cd apps/docs && npm run build && npm run preview
# 3. Deploy the dist output to the chosen host (Pages: `npx wrangler pages deploy dist`
#    or connect the repo in the Pages dashboard)
```

## Still user-side after publishing

- **On-device demo check:** `npx expo run:android` in `apps/demo`, check all 10
  components render, and press a Select option — the one flow no test here can
  verify (it hangs Vitest; only a phone settles it).
- **Maestro:** Java 17+ + Maestro CLI, booted emulator/device, then `./run.sh`
  in `e2e-android/`.
- **Figma:** run the plugin in Figma (Tokens Studio import) and confirm the
  variables land.
- **Confirm** the `select-open` dropdown opening upward is intended (baselined as-is).
