import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Select } from "@suprui/ui";

const options = [
  { label: "Draft", value: "draft" },
  { label: "In review", value: "review" },
  { label: "Published", value: "published" },
];

const meta: Meta<typeof Select> = {
  title: "Components/Select",
  component: Select,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>(null);
    return (
      <Select
        label="Status"
        placeholder="Choose a status"
        options={options}
        value={value}
        onValueChange={setValue}
      />
    );
  },
};

export const WithValue: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>("review");
    return (
      <Select
        label="Status"
        placeholder="Choose a status"
        options={options}
        value={value}
        onValueChange={setValue}
      />
    );
  },
};

export const Disabled: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>("draft");
    return (
      <Select
        label="Status"
        placeholder="Choose a status"
        options={options}
        value={value}
        onValueChange={setValue}
        disabled
      />
    );
  },
};

export const NoLabel: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>(null);
    return (
      <Select
        placeholder="Choose a status"
        options={options}
        value={value}
        onValueChange={setValue}
      />
    );
  },
};
