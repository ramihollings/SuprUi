import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Toaster, toast, type ToastVariant } from "@suprui/ui";

const meta: Meta = {
  title: "Components/Toast",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

function ToastDemo() {
  return (
    <>
      <Toaster />
      <div className="flex flex-wrap gap-2">
        {(
          ["default", "success", "error", "warning"] as ToastVariant[]
        ).map((variant) => (
          <Button
            key={variant}
            variant="outline"
            onClick={() =>
              toast({
                title: `Toast: ${variant}`,
                description: "Your changes are saved.",
                variant,
              })
            }
          >
            Show {variant}
          </Button>
        ))}
      </div>
      <p className="mt-4 text-sm text-text-muted">
        Click a button to fire a toast. The Toaster is rendered once, at the
        story root.
      </p>
    </>
  );
}

export const AllVariants: Story = {
  render: () => <ToastDemo />,
};
