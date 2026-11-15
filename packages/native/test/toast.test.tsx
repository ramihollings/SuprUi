import { afterEach, describe, expect, it } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Toaster, dismissToast, toast } from '../src/components/toast/Toast';

const shownIds: number[] = [];

afterEach(() => {
  // The toast store is module-level: clear anything a test left behind
  // so tests cannot leak into each other.
  [...shownIds].forEach((id) => dismissToast(id));
  shownIds.length = 0;
});

describe('Toast', () => {
  it('shows a toast after toast() is called', async () => {
    await render(<Toaster />);
    expect(screen.queryByText('Saved')).not.toBeOnTheScreen();
    await act(async () => {
      shownIds.push(toast({ title: 'Saved', description: 'Workspace updated' }));
    });
    expect(await screen.findByText('Saved')).toBeOnTheScreen();
    expect(screen.getByText('Workspace updated')).toBeOnTheScreen();
  });

  it('shows every variant with its title', async () => {
    await render(<Toaster />);
    await act(async () => {
      shownIds.push(toast({ title: 'All good', variant: 'success' }));
      shownIds.push(toast({ title: 'Something broke', variant: 'error' }));
      shownIds.push(toast({ title: 'Heads up', variant: 'warning' }));
    });
    expect(await screen.findByText('All good')).toBeOnTheScreen();
    expect(screen.getByText('Something broke')).toBeOnTheScreen();
    expect(screen.getByText('Heads up')).toBeOnTheScreen();
  });

  it('dismisses a toast from its close button', async () => {
    await render(<Toaster />);
    await act(async () => {
      shownIds.push(toast({ title: 'Dismiss me' }));
    });
    expect(await screen.findByText('Dismiss me')).toBeOnTheScreen();
    await fireEvent.press(screen.getByLabelText('Dismiss notification'));
    await waitFor(() => {
      expect(screen.queryByText('Dismiss me')).not.toBeOnTheScreen();
    });
  });
});
