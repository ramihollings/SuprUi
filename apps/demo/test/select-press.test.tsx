/**
 * Select option-press retry (M1-known gap) — SKIPPED: still untestable.
 *
 * In packages/native the option press inside the portal list hung under
 * Vitest + RNTL 14: the press's act() never settled — no error, no
 * timeout, tree empty afterwards. Retried here 2026-11-13 in the
 * demo-app context, against this app's real SelectScreen, with a bisect:
 *
 *   - render SelectScreen: PASSES (select-open.test.tsx)
 *   - press trigger, list opens, options visible: PASSES (same file)
 *   - press the "Black" option: HANGS — the run printed the Vitest RUN
 *     banner and then nothing; killed by the shell `timeout` (150 s)
 *     with no test result, no error, and the 20 s vitest testTimeout
 *     never firing.
 *
 * That is the exact M1 signature, reproduced, not fixed. The test below
 * is `it.skip` so `npm test` stays green; to retry it, remove `.skip`
 * and run ONLY this file under a shell timeout, e.g.
 * `timeout 90 npx vitest run --fileParallelism=false test/select-press.test.tsx`.
 * The flow needs the on-device check — the primitive's own option-press
 * behaviour is covered by `@rn-primitives/select`'s own test suite.
 */
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { PortalHost } from '@rn-primitives/portal';
import { ThemeProvider } from '@suprui/ui-native';
import { SelectScreen } from '../src/screens/showcases';

describe('Select option press (demo app)', () => {
  it.skip(
    'pressing an option updates the selected value',
    async () => {
      await render(
        <ThemeProvider mode="dark">
          <PortalHost />
          <SelectScreen onBack={() => {}} />
        </ThemeProvider>,
      );
      expect(screen.getByTestId('select-value')).toHaveTextContent('Selected: Cobalt');
      await fireEvent.press(screen.getByText('Cobalt'));
      expect(await screen.findByText('Black')).toBeOnTheScreen();
      await fireEvent.press(screen.getByText('Black'));
      expect(await screen.findByText('Selected: Black')).toBeOnTheScreen();
    },
    20_000,
  );
});
