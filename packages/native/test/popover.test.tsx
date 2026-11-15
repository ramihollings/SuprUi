import { describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import { Text } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';
import { Popover } from '../src/components/popover/Popover';
import { Button } from '../src/components/button/Button';
import { renderWithPortal } from './helpers';

function ControlledPopover(props: { side?: 'top' | 'bottom' | 'left' | 'right' }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover
      trigger={<Button onPress={() => {}}>Open menu</Button>}
      content={<Text>Popover body</Text>}
      open={open}
      onOpenChange={setOpen}
      side={props.side}
      align="center"
    />
  );
}

describe('Popover', () => {
  it('content is hidden until the trigger is pressed', async () => {
    await renderWithPortal(<ControlledPopover />);
    expect(screen.queryByText('Popover body')).not.toBeOnTheScreen();
    await fireEvent.press(screen.getByText('Open menu'));
    expect(await screen.findByText('Popover body')).toBeOnTheScreen();
  });

  it('reports onOpenChange when toggled', async () => {
    const onOpenChange = vi.fn();
    await renderWithPortal(
      <Popover
        trigger={<Button onPress={() => {}}>Trigger</Button>}
        content={<Text>Body</Text>}
        open={false}
        onOpenChange={onOpenChange}
      />,
    );
    await fireEvent.press(screen.getByText('Trigger'));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('accepts left/right sides (native falls back to bottom)', async () => {
    for (const side of ['left', 'right'] as const) {
      const { unmount } = await renderWithPortal(<ControlledPopover side={side} />);
      await fireEvent.press(screen.getByText('Open menu'));
      expect(await screen.findByText('Popover body')).toBeOnTheScreen();
      await unmount();
    }
  });
});
