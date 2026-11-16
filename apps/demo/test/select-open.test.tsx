/**
 * Select open-flow tests (the part of the Select flow the Vitest + RNTL 14
 * harness CAN verify — see select-press.test.tsx for the option-press
 * step, which hangs under this harness).
 */
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { PortalHost } from '@rn-primitives/portal';
import { ThemeProvider } from '@suprui/ui-native';
import { SelectScreen } from '../src/screens/showcases';

async function renderSelect() {
  await render(
    <ThemeProvider mode="dark">
      <PortalHost />
      <SelectScreen onBack={() => {}} />
    </ThemeProvider>,
  );
}

describe('select open flow', () => {
  it('renders the Select showcase', async () => {
    await renderSelect();
    expect(screen.getByTestId('screen-select')).toBeOnTheScreen();
    expect(screen.getByTestId('select-value')).toHaveTextContent('Selected: Cobalt');
  });

  it('opens the list on trigger press', async () => {
    await renderSelect();
    await fireEvent.press(screen.getByText('Cobalt'));
    expect(await screen.findByText('Black')).toBeOnTheScreen();
  });
});
