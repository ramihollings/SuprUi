/**
 * Babel require-hook for `react-native` source, loaded BEFORE anything
 * imports `react-native` (see test/setup.ts import order).
 *
 * Why this exists: `react-native` ships Flow annotations in its `.js`
 * files (`import typeof ...`, `} as X;`), which plain Node cannot parse,
 * and `@rn-primitives/*` ships raw JSX in both its `.js` and `.mjs`
 * builds. Jest solves both with `babel-jest` +
 * `@react-native/babel-preset`. In Vitest, the Vite plugin transform
 * (`vitest.config.ts`) never sees these files: RNTL and the primitives
 * are CJS, and their internal `require(...)` calls are executed by
 * Node's own `require`, bypassing Vite's transform pipeline entirely
 * (proven by transform logging: only RNTL's entry was ever transformed
 * before the SyntaxError).
 *
 * This hook patches Node's `require.extensions` so every `.js`/`.ts` file
 * under `node_modules/react-native/` or `node_modules/@rn-primitives/`
 * is compiled with `@react-native/babel-preset@0.82.1` (the version
 * matching the installed `react-native@0.82.1`) before Node parses it. Transformed output is
 * cached under `node_modules/.cache/supr-ui-rn/` keyed by source
 * path + mtime + size, so repeat runs only transform changed files.
 *
 * This is test-only infrastructure. It does not ship in the package.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { transformSync } from '@babel/core';

const require = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Module = require('node:module') as typeof import('node:module');

// Resolve by package, not by import.meta.url: under Vitest's module
// runner import.meta.url is not guaranteed to be a plain file path.
const rnDir = path.dirname(require.resolve('react-native/package.json'));
const primitivesDir = path.join(rnDir, '..', '@rn-primitives');
const cacheDir = path.join(rnDir, '..', '.cache', 'supr-ui-rn');

function cachePathFor(filename: string): { file: string; key: string } {
  const stat = statSync(filename);
  const key = createHash('sha1')
    .update(`${filename}\n${stat.mtimeMs}\n${stat.size}`)
    .digest('hex')
    .slice(0, 12);
  return { file: path.join(cacheDir, key, `${path.basename(filename)}.js`), key };
}

function compile(filename: string): string {
  const { file: cached } = cachePathFor(filename);
  if (existsSync(cached)) {
    return readFileSync(cached, 'utf8');
  }
  const source = readFileSync(filename, 'utf8');
  const result = transformSync(source, {
    filename,
    babelrc: false,
    configFile: false,
    presets: [require('@react-native/babel-preset')],
  });
  const code = result?.code ?? source;
  mkdirSync(path.dirname(cached), { recursive: true });
  writeFileSync(cached, code);
  return code;
}

function needsTransform(filename: string): boolean {
  return (
    filename.startsWith(rnDir + path.sep) ||
    filename.startsWith(primitivesDir + path.sep)
  );
}

function installHook(extension: string) {
  const original = Module._extensions[extension];
  Module._extensions[extension] = function (
    mod: NodeModule,
    filename: string,
  ) {
    if (needsTransform(filename)) {
      mod._compile(compile(filename), filename);
      return;
    }
    if (original) {
      original(mod, filename);
      return;
    }
    // No previous handler (only possible for '.ts', which Node does not
    // handle natively): compile as plain JS after the preset strips types.
    const source = readFileSync(filename, 'utf8');
    mod._compile(source, filename);
  };
}

installHook('.js');
installHook('.ts');

/**
 * Android platform resolution for `react-native` internals.
 *
 * Metro and the Jest RN preset resolve platform-suffixed files
 * (`Platform.android.js` over the `Platform.js` shim) for the target
 * platform. Node's `require` does not: it loads the shim, which
 * circularly re-exports itself, so `Platform.OS` is undefined. This
 * package targets Android, so when a resolved file under `react-native`
 * has a `.android.*` sibling, prefer it (then `.native.*`), mirroring
 * the bundler's resolution for the android platform.
 */
const originalResolveFilename = Module._resolveFilename;
Module._resolveFilename = function (
  request: string,
  parent: NodeModule,
  isMain: boolean,
  options: Record<string, unknown>,
) {
  const resolved = originalResolveFilename.call(
    this,
    request,
    parent,
    isMain,
    options,
  ) as string;
  if (typeof resolved === 'string' && resolved.startsWith(rnDir + path.sep)) {
    const match = resolved.match(
      /^(.*?)(\.(android|ios|native|web))?\.(js|ts|tsx|json)$/,
    );
    if (match) {
      const base = match[1];
      const ext = match[4];
      for (const variant of [`${base}.android.${ext}`, `${base}.native.${ext}`]) {
        if (variant !== resolved && existsSync(variant)) {
          return variant;
        }
      }
    }
  }
  return resolved;
};

// Metro defines this global for RN apps; the Jest RN preset sets it in its
// setup file. Files compiled through this hook run under Node's require,
// where Vite's `define` does not apply, so set it on the global object.
(globalThis as Record<string, unknown>).__DEV__ = true;

// React Native's legacy bridge reads native modules from
// `global.nativeModuleProxy` when present, and otherwise throws
// "__fbBatchedBridgeConfig is not set". There is no bridge in Node, so
// expose an empty proxy: NativeModules becomes `{}` and TurboModule
// lookups return null, which the JS fallbacks in RN (feature flags,
// Platform constants) are written to tolerate. This mirrors what the
// Jest RN preset does with its NativeModules mock, minus Jest's mock
// registry.
(globalThis as Record<string, unknown>).nativeModuleProxy = {};

/**
 * Stand-in for the native binary's TurboModule registry.
 *
 * `TurboModuleRegistry.getEnforcing(name)` throws when the proxy returns
 * null, and several RN modules call it at import time (SourceCode,
 * PlatformConstants, UIManager, …). This double returns a stub module
 * for any name: `getConstants()` yields `{}`, every other method is a
 * no-op. Named stubs below carry the constants RN's JS actually reads
 * at import/render time. It is a test double for "no native binary",
 * the same role the Jest RN preset's `jest/mocks/` play — it says
 * nothing about on-device behaviour.
 */
const turboConstantStubs: Record<string, () => Record<string, unknown>> = {
  SourceCode: () => ({
    getConstants: () => ({ scriptURL: 'http://localhost:8081/index.bundle' }),
  }),
  PlatformConstants: () => ({
    getConstants: () => ({}),
  }),
  // Constants copied from react-native's own Jest mock
  // (node_modules/react-native/jest/mocks/NativeModules.js), which is the
  // same "no native binary" double for Jest.
  DeviceInfo: () => ({
    getConstants: () => ({
      Dimensions: {
        window: { fontScale: 2, height: 1334, scale: 2, width: 750 },
        screen: { fontScale: 2, height: 1334, scale: 2, width: 750 },
      },
    }),
  }),
  UIManager: () => ({
    getConstants: () => ({}),
    getViewManagerConfig: () => undefined,
    hasViewManagerConfig: () => false,
  }),
};
(globalThis as Record<string, unknown>).__turboModuleProxy = (
  name: string,
) => {
  if (name in turboConstantStubs) {
    return turboConstantStubs[name]();
  }
  return new Proxy(
    () => undefined,
    {
      get(_target, prop) {
        if (prop === 'getConstants') {
          return () => ({});
        }
        return () => undefined;
      },
    },
  );
};

