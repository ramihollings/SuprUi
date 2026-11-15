import { fireEvent, render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../button/Button";
import { Dialog } from "./Dialog";

describe("Dialog", () => {
  it("renders title, description, children and actions when open", () => {
    render(
      <Dialog
        open
        onOpenChange={() => {}}
        title="Delete workspace?"
        description="This cannot be undone."
        actions={<Button variant="danger">Delete</Button>}
      >
        <p>The workspace and its contents will be removed.</p>
      </Dialog>,
    );
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByText("Delete workspace?")).toBeTruthy();
    expect(screen.getByText("This cannot be undone.")).toBeTruthy();
    expect(
      screen.getByText("The workspace and its contents will be removed."),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Delete" })).toBeTruthy();
  });

  it("renders nothing when closed", () => {
    render(
      <Dialog open={false} onOpenChange={() => {}} title="Hidden">
        <p>Not shown</p>
      </Dialog>,
    );
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.queryByText("Not shown")).toBeNull();
  });

  it("calls onOpenChange(false) when the close button is pressed", () => {
    const onOpenChange = vi.fn();
    render(
      <Dialog open onOpenChange={onOpenChange} title="Close me">
        <p>Body</p>
      </Dialog>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Close dialog" }));
    expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything());
  });

  it("has no axe violations when open", async () => {
    render(
      <Dialog
        open
        onOpenChange={() => {}}
        title="Delete workspace?"
        description="This cannot be undone."
        actions={<Button variant="danger">Delete</Button>}
      >
        <p>The workspace and its contents will be removed.</p>
      </Dialog>,
    );
    const results = await axe(document.body);
    expect(results).toHaveNoViolations();
  });
});
