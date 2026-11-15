import { describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { Select } from '../src/components/select/Select';
import { renderWithPortal } from './helpers';

const OPTIONS = [
  { label: 'Cobalt', value: 'cobalt' },
  { label: 'Black', value: 'black' },
  { label: 'Paper', value: 'paper' },
];

function ControlledSelect() {
  const [value, setValue] = useState('cobalt');
  return (
    <Select
      options={OPTIONS}
      value={value}
      onValueChange={setValue}
      placeholder="Pick a colour"
      label="Theme colour"
    />
  );
}

function ValueSelect({ value }: { value: string }) {
  return (
    <Select
      options={OPTIONS}
      value={value}
      onValueChange={() => {}}
      placeholder="Pick a colour"
      label="Theme colour"
    />
  );
}

describe('Select', () => {
  it('shows the selected label and the field label', async () => {
    await renderWithPortal(<ControlledSelect />);
    expect(screen.getByText('Theme colour')).toBeOnTheScreen();
    expect(screen.getByText('Cobalt')).toBeOnTheScreen();
  });

  // NOTE (2026-11-13): there is deliberately no test that presses an
  // option inside the portal list. Pressing an option closes the portal
  // and the value change lands (verified in a scratch probe: the
  // controlled value re-rendered to "black"), but under Vitest +
  // RNTL 14 the press's act() never settles and the tree is empty
  // afterwards — the run hangs with no error, no timeout, and no
  // pending timers. The open flow above and the value mapping below
  // are the parts of this wrapper the harness can verify; the
  // primitive's own option-press behaviour is covered by
  // @rn-primitives/select's own test suite, and the flow needs an
  // on-device check.
  it('opens the list on trigger press', async () => {
    await renderWithPortal(<ControlledSelect />);
    await fireEvent.press(screen.getByText('Cobalt'));
    expect(await screen.findByText('Black')).toBeOnTheScreen();
    expect(screen.getByText('Paper')).toBeOnTheScreen();
  });

  it('shows the new selection when the value changes', async () => {
    const rendered = await renderWithPortal(<ValueSelect value="cobalt" />);
    expect(screen.getByText('Cobalt')).toBeOnTheScreen();
    await rendered.rerender(<ValueSelect value="black" />);
    expect(screen.getByText('Black')).toBeOnTheScreen();
  });

  it('shows the placeholder when nothing is selected', async () => {
    const onValueChange = vi.fn();
    await renderWithPortal(
      <Select
        options={OPTIONS}
        value=""
        onValueChange={onValueChange}
        placeholder="Pick a colour"
      />,
    );
    expect(screen.getByText('Pick a colour')).toBeOnTheScreen();
  });

  it('is disabled when asked', async () => {
    await renderWithPortal(
      <Select
        options={OPTIONS}
        value="cobalt"
        onValueChange={() => {}}
        placeholder="Pick a colour"
        disabled
      />,
    );
    // The trigger carries role="combobox" (from the primitive) over the
    // wrapper's accessibilityRole="button".
    expect(screen.getByRole('combobox')).toBeDisabled();
  });
});
