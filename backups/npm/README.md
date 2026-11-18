# Published npm archive backup — Supr UI

This folder holds **verbatim published npm tarballs**, not regenerated builds or a substitute for the TypeScript source in `packages/`. Each tarball was fetched from npm and validated against the registry’s SHA-1 and SHA-512 integrity metadata before committing. `manifest.json` records the original immutable archive URLs, versions, and hashes.

Includes every version found at backup time for `@suprui/tokens`, `@suprui/ui`, and `@suprui/ui-native` (including `0.0.0-stage` placeholders). Files here are historical release artifacts, not instructions to publish or deploy.

For a read-only recovery check, download a tarball and run `npm pack --dry-run ./path/to/package.tgz` or `tar -tzf <archive>`. Inspect metadata before reusing old versions.
