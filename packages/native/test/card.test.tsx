import { describe, expect, it } from 'vitest';
import { Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../src/components/card/Card';

describe('Card', () => {
  it('renders the compound parts', async () => {
    await render(
      <Card>
        <CardHeader>
          <CardTitle>Workspace</CardTitle>
          <CardDescription>Three active threads</CardDescription>
        </CardHeader>
        <CardContent>
          <Text>Body</Text>
        </CardContent>
        <CardFooter>
          <Text>Footer action</Text>
        </CardFooter>
      </Card>,
    );
    expect(screen.getByText('Workspace')).toBeOnTheScreen();
    expect(screen.getByText('Three active threads')).toBeOnTheScreen();
    expect(screen.getByText('Body')).toBeOnTheScreen();
    expect(screen.getByText('Footer action')).toBeOnTheScreen();
  });
});
