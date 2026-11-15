import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Switch } from "@mrtechnology/ui";

const meta: Meta<typeof Switch> = {
  title: "Components/Switch",
  component: Switch,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <Switch
        label="Email notifications"
        checked={checked}
        onCheckedChange={setChecked}
      />
    );
  },
};

export const Checked: Story = {
  render: () => {
    const [checked, setChecked] = useState(true);
    return (
      <Switch
        label="Email notifications"
        checked={checked}
        onCheckedChange={setChecked}
      />
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Switch label="Off, disabled" checked={false} onCheckedChange={() => {}} disabled />
      <Switch label="On, disabled" checked onCheckedChange={() => {}} disabled />
    </div>
  ),
};

export const WithLongLabel: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <Switch
        label="Send me a weekly digest of workspace activity"
        checked={checked}
        onCheckedChange={setChecked}
      />
    );
  },
};
