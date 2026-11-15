import { fireEvent, render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { describe, expect, it, vi } from "vitest";
import { Switch } from "./Switch";

describe("Switch", () => {
  it("renders with its label and checked state", () => {
    render(
      <Switch checked label="Notifications" onCheckedChange={() => {}} />,
    );
    const control = screen.getByRole("switch", { name: "Notifications" });
    expect(control.getAttribute("aria-checked")).toBe("true");
  });

  it("calls onCheckedChange with the toggled value", () => {
    const onCheckedChange = vi.fn();
    render(
      <Switch checked={false} label="Notifications" onCheckedChange={onCheckedChange} />,
    );
    fireEvent.click(screen.getByRole("switch", { name: "Notifications" }));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("respects disabled", () => {
    render(
      <Switch checked label="Notifications" onCheckedChange={() => {}} disabled />,
    );
    // Base UI renders the switch as a span (not a button), so the disabled
    // state is exposed via aria-disabled / data-disabled, not a disabled
    // attribute.
    const control = screen.getByRole("switch", { name: "Notifications" });
    expect(control.getAttribute("aria-disabled")).toBe("true");
    expect(control.hasAttribute("data-disabled")).toBe(true);
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <div>
        <Switch checked label="Notifications" onCheckedChange={() => {}} />
        <Switch checked={false} label="Email digest" onCheckedChange={() => {}} />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
