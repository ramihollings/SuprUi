import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@suprui/ui";
import { Plus, Search } from "lucide-react";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "outline", "ghost", "danger"],
    },
    size: { control: "select", options: ["sm", "md", "lg"] },
    shape: { control: "select", options: ["control", "pill"] },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: { variant: "primary", size: "md", children: "New document" },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Button disabled>Primary disabled</Button>
      <Button variant="secondary" disabled>
        Secondary disabled
      </Button>
      <Button variant="danger" disabled>
        Danger disabled
      </Button>
    </div>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Button icon={<Plus aria-hidden="true" />}>New document</Button>
      <Button variant="outline" icon={<Search aria-hidden="true" />}>
        Search
      </Button>
    </div>
  ),
};

export const IconOnly: Story = {
  render: () => (
    <Button aria-label="Search" icon={<Search aria-hidden="true" />} />
  ),
};

/** The Supr public site uses pill CTAs; workspace controls keep their compact shape. */
export const WebsiteCTAs: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button shape="pill" size="lg">Request access</Button>
      <Button shape="pill" size="lg" variant="outline">Explore products</Button>
      <Button size="md">Workspace action</Button>
    </div>
  ),
};
