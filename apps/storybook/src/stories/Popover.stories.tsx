import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Popover } from "@suprui/ui";

const meta: Meta<typeof Popover> = {
  title: "Components/Popover",
  component: Popover,
  tags: ["autodocs"],
  argTypes: {
    side: {
      control: "select",
      options: ["top", "bottom", "left", "right"],
    },
    align: { control: "select", options: ["start", "center", "end"] },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

function PopoverDemo({
  side = "bottom",
  align = "center",
}: {
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex justify-center p-16">
      <Popover
        trigger={<Button variant="outline">Options</Button>}
        content={<p>Popover content goes here.</p>}
        open={open}
        onOpenChange={setOpen}
        side={side}
        align={align}
      />
    </div>
  );
}

export const Playground: Story = {
  render: () => <PopoverDemo />,
};

export const AllSides: Story = {
  render: () => (
    <div className="flex flex-wrap items-center justify-center gap-16 p-16">
      {(["top", "bottom", "left", "right"] as const).map((side) => (
        <PopoverDemo key={side} side={side} />
      ))}
    </div>
  ),
};

export const AlignEnd: Story = {
  render: () => <PopoverDemo side="bottom" align="end" />,
};
