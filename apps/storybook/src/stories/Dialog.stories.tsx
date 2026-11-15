import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Dialog } from "@mrtechnology/ui";

const meta: Meta<typeof Dialog> = {
  title: "Components/Dialog",
  component: Dialog,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

function DialogDemo({ initiallyOpen = false }: { initiallyOpen?: boolean }) {
  const [open, setOpen] = useState(initiallyOpen);
  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        Publish document
      </Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Publish document?"
        description="This will make the document visible to your workspace."
        actions={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setOpen(false)}>
              Publish
            </Button>
          </>
        }
      >
        <p>Review the changes before publishing.</p>
      </Dialog>
    </>
  );
}

export const Closed: Story = {
  render: () => <DialogDemo initiallyOpen={false} />,
};

export const Open: Story = {
  render: () => <DialogDemo initiallyOpen />,
};

export const WithoutActions: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <>
        <Button variant="outline" onClick={() => setOpen(true)}>
          Open dialog
        </Button>
        <Dialog
          open={open}
          onOpenChange={setOpen}
          title="About this document"
          description="Read-only details."
        >
          <p>Created in SuprCMS. No actions are available here.</p>
        </Dialog>
      </>
    );
  },
};
