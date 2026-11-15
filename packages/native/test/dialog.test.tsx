import { describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import { Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Dialog } from '../src/components/dialog/Dialog';
import { Button } from '../src/components/button/Button';
import { renderWithPortal } from './helpers';

function ControlledDialog(props: { initialOpen?: boolean }) {
  const [open, setOpen] = useState(props.initialOpen ?? false);
  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      title="Delete workspace?"
      description="This cannot be undone."
      actions={
        <Button variant="danger" onPress={() => setOpen(false)}>
          Delete
        </Button>
      }
    >
      <Text>Body content</Text>
    </Dialog>
  );
}

describe('Dialog', () => {
  it('renders nothing when closed', async () => {
    await renderWithPortal(<ControlledDialog initialOpen={false} />);
    expect(screen.queryByText('Delete workspace?')).not.toBeOnTheScreen();
  });

  it('renders title, description, children and actions when open', async () => {
    await renderWithPortal(<ControlledDialog initialOpen />);
    expect(await screen.findByText('Delete workspace?')).toBeOnTheScreen();
    expect(screen.getByText('This cannot be undone.')).toBeOnTheScreen();
    expect(screen.getByText('Body content')).toBeOnTheScreen();
    expect(screen.getByText('Delete')).toBeOnTheScreen();
  });

  it('close button reports onOpenChange(false)', async () => {
    const onOpenChange = vi.fn();
    await renderWithPortal(
      <Dialog open onOpenChange={onOpenChange} title="T">
        <Text>Body</Text>
      </Dialog>,
    );
    expect(await screen.findByText('T')).toBeOnTheScreen();
    await fireEvent.press(screen.getByLabelText('Close dialog'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
