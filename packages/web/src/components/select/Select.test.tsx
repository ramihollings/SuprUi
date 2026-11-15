import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { describe, expect, it, vi } from "vitest";
import { Select } from "./Select";

const options = [
  { label: "Cobalt", value: "cobalt" },
  { label: "Black", value: "black" },
  { label: "White", value: "white" },
];

describe("Select", () => {
  it("renders the selected option label and placeholder when empty", () => {
    const { rerender } = render(
      <Select
        options={options}
        value={null}
        onValueChange={() => {}}
        placeholder="Pick a color"
        label="Color"
      />,
    );
    expect(screen.getByText("Pick a color")).toBeTruthy();
    expect(screen.getByText("Color")).toBeTruthy();

    rerender(
      <Select
        options={options}
        value="cobalt"
        onValueChange={() => {}}
        placeholder="Pick a color"
        label="Color"
      />,
    );
    expect(screen.getByText("Cobalt")).toBeTruthy();
  });

  it("opens the list and calls onValueChange with the chosen value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Select
        options={options}
        value={null}
        onValueChange={onValueChange}
        placeholder="Pick a color"
      />,
    );
    await user.click(screen.getByRole("combobox"));
    const option = await screen.findByRole("option", { name: "Black" });
    await user.click(option);
    expect(onValueChange).toHaveBeenCalledWith("black");
  });

  it("respects disabled", () => {
    render(
      <Select
        options={options}
        value={null}
        onValueChange={() => {}}
        placeholder="Pick a color"
        disabled
      />,
    );
    expect(screen.getByRole("combobox").hasAttribute("disabled")).toBe(true);
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <Select
        options={options}
        value="cobalt"
        onValueChange={() => {}}
        placeholder="Pick a color"
        label="Color"
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
