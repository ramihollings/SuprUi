import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "@suprui/ui";

const meta: Meta<typeof Input> = {
  title: "Components/Input",
  component: Input,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

function ControlledInput(props: Omit<React.ComponentProps<typeof Input>, "value" | "onChange">) {
  const [value, setValue] = useState("");
  return <Input value={value} onChange={setValue} {...props} />;
}

export const Playground: Story = {
  render: () => (
    <ControlledInput label="Title" placeholder="Untitled document" />
  ),
};

export const WithError: Story = {
  render: () => (
    <ControlledInput
      label="Title"
      placeholder="Untitled document"
      error="A title is required."
    />
  ),
};

export const Disabled: Story = {
  render: () => (
    <ControlledInput
      label="Title"
      placeholder="Untitled document"
      disabled
    />
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex w-full flex-col gap-4">
      <ControlledInput label="Small" placeholder="Small input" size="sm" />
      <ControlledInput label="Medium" placeholder="Medium input" size="md" />
      <ControlledInput label="Large" placeholder="Large input" size="lg" />
    </div>
  ),
};

export const NoLabel: Story = {
  render: () => <ControlledInput placeholder="Search…" aria-label="Search" />,
};
