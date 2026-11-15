import { describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import { Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../src/components/tabs/Tabs';

function ControlledTabs() {
  const [value, setValue] = useState('one');
  return (
    <Tabs value={value} onValueChange={setValue}>
      <TabsList>
        <TabsTrigger value="one">One</TabsTrigger>
        <TabsTrigger value="two">Two</TabsTrigger>
      </TabsList>
      <TabsContent value="one">
        <Text>First panel</Text>
      </TabsContent>
      <TabsContent value="two">
        <Text>Second panel</Text>
      </TabsContent>
    </Tabs>
  );
}

describe('Tabs', () => {
  it('shows the active panel only', async () => {
    await render(<ControlledTabs />);
    expect(screen.getByText('First panel')).toBeOnTheScreen();
    expect(screen.queryByText('Second panel')).not.toBeOnTheScreen();
  });

  it('switches panels on trigger press', async () => {
    await render(<ControlledTabs />);
    await fireEvent.press(screen.getByText('Two'));
    expect(await screen.findByText('Second panel')).toBeOnTheScreen();
    expect(screen.queryByText('First panel')).not.toBeOnTheScreen();
  });

  it('reports onValueChange', async () => {
    const onValueChange = vi.fn();
    await render(
      <Tabs value="one" onValueChange={onValueChange}>
        <TabsList>
          <TabsTrigger value="one">One</TabsTrigger>
          <TabsTrigger value="two">Two</TabsTrigger>
        </TabsList>
        <TabsContent value="one">
          <Text>First panel</Text>
        </TabsContent>
        <TabsContent value="two">
          <Text>Second panel</Text>
        </TabsContent>
      </Tabs>,
    );
    await fireEvent.press(screen.getByText('Two'));
    expect(onValueChange).toHaveBeenCalledWith('two');
  });
});
