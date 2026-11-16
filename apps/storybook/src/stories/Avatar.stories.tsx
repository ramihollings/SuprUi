import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar } from "@suprui/ui";

const meta: Meta<typeof Avatar> = {
  title: "Components/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: { fallback: "AK", size: "md", alt: "A. Khan" },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar fallback="AK" size="sm" alt="A. Khan, small" />
      <Avatar fallback="AK" size="md" alt="A. Khan, medium" />
      <Avatar fallback="AK" size="lg" alt="A. Khan, large" />
    </div>
  ),
};

export const FallbackOnFailedSrc: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar
        src="https://invalid.example/avatar.png"
        fallback="AK"
        size="md"
        alt="A. Khan"
      />
      <p className="text-sm text-text-muted">
        The image URL does not resolve, so the fallback initials show.
      </p>
    </div>
  ),
};
