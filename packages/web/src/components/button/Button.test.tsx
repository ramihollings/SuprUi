import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { describe, expect, it } from "vitest";
import { Plus } from "lucide-react";
import { Button } from "./Button";

describe("Button", () => {
  it("renders children and applies the variant", () => {
    render(<Button variant="primary">Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toBeTruthy();
    expect(button.className).toContain("bg-brand");
  });

  it("retains compact controls while supporting site-style pill CTAs", () => {
    render(<><Button>Save</Button><Button shape="pill">Request access</Button></>);
    expect(screen.getByRole("button", { name: "Save" }).className).toContain("rounded-rounded");
    expect(screen.getByRole("button", { name: "Request access" }).className).toContain("rounded-circular");
  });

  it("renders the icon before the label", () => {
    render(
      <Button icon={<Plus data-testid="plus-icon" />}>Add</Button>,
    );
    expect(screen.getByTestId("plus-icon")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Add" })).toBeTruthy();
  });

  it("renders the danger variant and respects disabled", () => {
    render(
      <Button variant="danger" disabled>
        Delete
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Delete" });
    expect(button.className).toContain("bg-danger-solid");
    expect(button.hasAttribute("disabled")).toBe(true);
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <div>
        <Button>Save</Button>
        <Button variant="secondary">Cancel</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Delete</Button>
        <Button aria-label="Add item" icon={<Plus />} />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
