/**
 * Vitest setup for @mrtechnology/ui-native.
 *
 * Import order matters: `./rn-register` FIRST — it installs the Babel
 * require-hook for `react-native` source before anything imports it.
 *
 * React Native Testing Library v14 runs on the `test-renderer` package
 * (React 19, no device/emulator) and explicitly supports non-Jest runners.
 * Importing RNTL extends Vitest's global `expect` with the RN matchers
 * (globals: true in vitest.config.ts).
 */
import './rn-register';
import '@testing-library/react-native';

// As in react-native/jest/setup.js: tell React this is a test environment
// so act() warnings stay meaningful instead of noisy.
(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
(globalThis as Record<string, unknown>).IS_REACT_NATIVE_TEST_ENVIRONMENT = true;

// Reanimated's published mock (`react-native-reanimated/mock`) requires its
// own TypeScript sources (`./src/mock`), which Vitest cannot load through
// the plain CJS `require` in mock.js. So the mock below re-implements only
// the Reanimated API surface this package uses, with animations resolved
// synchronously to their target values. It is a test-only stand-in, not a
// behaviour check: real animation is verified by code inspection against
// the token springs/durations, never claimed from these tests.
import { vi } from 'vitest';

vi.mock('react-native-reanimated', async () => {
  const React = await import('react');
  const { View } = await import('react-native');
  const AnimatedView = React.forwardRef(
    (props: Record<string, unknown>, ref: React.Ref<unknown>) =>
      React.createElement(View, { ...(props as object), ref: ref as never }),
  );
  AnimatedView.displayName = 'AnimatedView';
  const Animated = { View: AnimatedView };
  return {
    __esModule: true,
    default: Animated,
    Animated,
    useSharedValue: (initial: unknown) => ({ value: initial }),
    useAnimatedStyle: (fn: () => Record<string, unknown>) => fn(),
    withTiming: (value: unknown) => value,
    withSpring: (value: unknown) => value,
    withDelay: (_delay: number, value: unknown) => value,
    withSequence: (...values: unknown[]) => values[values.length - 1],
    runOnJS: (fn: (...args: never[]) => unknown) => fn,
    Easing: { linear: (t: number) => t, ease: (t: number) => t },
    ReduceMotion: { System: 'system', Never: 'never', Always: 'always' },
  };
});

// The test renderer's host refs resolve to a TestInstance, which has no
// `measure` method — but `@rn-primitives/*` call `triggerRef.current
// .measure(...)` on the native host instance (Popover's measureTrigger on
// press; `useRelativePosition` for Dialog / Popover / Select content).
// On a real device the host instance implements `measure`; here it is
// patched once on the TestInstance prototype, reporting a zero rect —
// which is what layout is in the test renderer anyway. Without it every
// Popover press and every positioned overlay throws
// `TypeError: triggerRef.current.measure is not a function` (diagnosed
// 2026-11-13). The patch is applied through RNTL's own `render`, not
// through a direct `createRoot` import: RNTL loads `test-renderer`
// through Node's `require`, which is a DIFFERENT module instance from
// the one Vite's runner loads for a direct import in this file, so
// patching that copy's prototype would miss every instance RNTL
// renders. (Verified 2026-11-13: a direct-import patch left
// `measure` undefined on RNTL-rendered refs.)
import { createElement } from 'react';
import { render as rntlRender } from '@testing-library/react-native';
import { View } from 'react-native';

{
  // RNTL's render is async; top-level await is fine here — setup files
  // finish before any test runs.
  const { container, unmount } = await rntlRender(createElement(View));
  const host =
    (container.children.find(
      (child) => typeof child === 'object' && child !== null,
    ) as object | undefined) ?? container;
  const proto = Object.getPrototypeOf(host) as {
    measure?: (
      cb: (
        x: number,
        y: number,
        width: number,
        height: number,
        pageX: number,
        pageY: number,
      ) => void,
    ) => void;
  };
  if (typeof proto.measure !== 'function') {
    proto.measure = (cb) => cb(0, 0, 0, 0, 0, 0);
  }
  await unmount();
}

// lucide-react-native draws through react-native-svg, whose native module

// cannot load in Node. Stub every SVG host element as a plain View so icon
// rendering can be exercised without native code.
vi.mock('react-native-svg', async () => {
  const React = await import('react');
  const { View } = await import('react-native');
  const stub = (displayName: string) => {
    const C = React.forwardRef(
      (props: Record<string, unknown>, ref: React.Ref<unknown>) =>
        React.createElement(View, {
          ...(props as object),
          ref: ref as never,
          testID: (props.testID as string | undefined) ?? displayName,
        }),
    );
    C.displayName = displayName;
    return C;
  };
  return {
    __esModule: true,
    default: stub('Svg'),
    Svg: stub('Svg'),
    Path: stub('Path'),
    Circle: stub('Circle'),
    Rect: stub('Rect'),
    Line: stub('Line'),
    Polyline: stub('Polyline'),
    Polygon: stub('Polygon'),
    Ellipse: stub('Ellipse'),
    G: stub('G'),
    Defs: stub('Defs'),
    ClipPath: stub('ClipPath'),
    LinearGradient: stub('LinearGradient'),
    Stop: stub('Stop'),
  };
});
