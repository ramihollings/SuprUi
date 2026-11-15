import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@mrtechnology/ui";

const meta: Meta<typeof Tabs> = {
  title: "Components/Tabs",
  component: Tabs,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

function TabsDemo({ initial = "write" }: { initial?: string }) {
  const [tab, setTab] = useState(initial);
  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList>
        <TabsTrigger value="write">Write</TabsTrigger>
        <TabsTrigger value="review">Review</TabsTrigger>
        <TabsTrigger value="publish">Publish</TabsTrigger>
      </TabsList>
      <TabsContent value="write">Editor goes here.</TabsContent>
      <TabsContent value="review">Review queue goes here.</TabsContent>
      <TabsContent value="publish">Publishing settings go here.</TabsContent>
    </Tabs>
  );
}

export const Playground: Story = {
  render: () => <TabsDemo />,
};

export const SecondTab: Story = {
  render: () => <TabsDemo initial="review" />,
};
