import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

const require = createRequire(import.meta.url);

/**
 * Transform React Native's published source — and the primitives' —
 * so Vitest can load them.
 *
 * `react-native` ships Flow annotations in its `.js` files (e.g.
 * `import typeof ...` and `} as ReactNativePublicAPI;` in `index.js`),
 * which plain Node / esbuild cannot parse. Jest handles this with
 * `babel-jest` + `@react-native/babel-preset`; Vitest needs the same
 * transform here. The preset version (0.82.1) matches the installed
 * `react-native` version exactly. Only files under
 * `node_modules/react-native/` are transformed this way — nothing else.
 *
 * `@rn-primitives/*` ships raw JSX in BOTH its `.js` and `.mjs` builds.
 * Its ESM (`.mjs`) builds are the ones loaded here, and they are
 * transformed with ONLY Flow-strip + JSX (automatic runtime) — the
 * module syntax is deliberately left intact. That matters: Vite's SSR
 * transform then rewrites the primitives' `import` statements to
 * runner imports, so every primitive — and the portal's zustand store
 * they share — loads exactly once, through the same module runner.
 * Converting them to CJS (what `@react-native/babel-preset` does) makes
 * Vite hand them to Node's native `require` instead, which creates a
 * SECOND copy of the portal store: a `Portal` registered from a
 * primitive's internal require never reaches a `PortalHost` loaded
 * through the runner, so Dialog / Popover / Select content never
 * appears. That split was diagnosed 2026-11-13 (probe: a Portal
 * imported in the test file rendered; a Dialog primitive's Portal did
 * not) and this ESM-preserving transform is the fix.
 */
function rnBabelPlugin(): Plugin {
  return {
    name: 'supr-ui-rn-babel',
    transform(code, id) {
      const isRn =
        id.includes('node_modules/react-native/') && id.endsWith('.js');
      const isPrimitive =
        id.includes('node_modules/@rn-primitives/') &&
        (id.endsWith('.js') || id.endsWith('.mjs'));
      if (!isRn && !isPrimitive) {
        return null;
      }
      if (isPrimitive) {
        const result = transformSync(code, {
          filename: id,
          babelrc: false,
          configFile: false,
          plugins: [
            require('@babel/plugin-transform-flow-strip-types'),
            [
              require('@babel/plugin-transform-react-jsx'),
              { runtime: 'automatic' },
            ],
          ],
        });
        return result?.code ? { code: result.code, map: null } : null;
      }
      const result = transformSync(code, {
        filename: id,
        babelrc: false,
        configFile: false,
        presets: [require('@react-native/babel-preset')],
      });
      return result?.code ? { code: result.code, map: null } : null;
    },
  };
}

export default defineConfig({
  define: {
    // Metro defines this global for RN apps; the Jest RN preset sets it in
    // its setup file. RN source guards dev-only branches on it.
    __DEV__: 'true',
  },
  plugins: [rnBabelPlugin()],
  test: {
    environment: 'node',
    globals: true,
    include: ['test/**/*.test.{ts,tsx}'],
    setupFiles: ['./test/setup.ts'],
    // Everything is inlined so Vite's SSR transform (not Node's native
    // `require`) loads React Native's CJS entry and the primitives' ESM
    // entries: a native `require('react-native')` from them would
    // bypass this pipeline — and Node cannot parse the Flow types in
    // react-native's published source. Inlining lets the transforms
    // above run on them. Slower startup, correct loading.
    server: {
      deps: {
        inline: true,
      },
    },
  },
});
