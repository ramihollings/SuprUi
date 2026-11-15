import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@mrtechnology/ui";

const meta: Meta<typeof Card> = {
  title: "Components/Card",
  component: Card,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Q3 launch plan</CardTitle>
        <CardDescription>Review status and open approvals.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Three approvals are still pending.</p>
      </CardContent>
      <CardFooter>
        <Button variant="primary">Open review</Button>
        <Button variant="ghost">Dismiss</Button>
      </CardFooter>
    </Card>
  ),
};

export const WithoutFooter: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Inbox zero</CardTitle>
        <CardDescription>SuprInbox summary for today.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>No unread mail. Everything is filed.</p>
      </CardContent>
    </Card>
  ),
};
