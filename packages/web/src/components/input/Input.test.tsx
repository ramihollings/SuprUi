import { fireEvent, render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { describe, expect, it, vi } from "vitest";
import { Input } from "./Input";

describe("Input", () => {
  it("renders a labelled input with the given value", () => {
    render(
      <Input label="Name" placeholder="Your name" value="Ada" onChange={() => {}} />,
    );
    const input = screen.getByLabelText("Name") as HTMLInputElement;
    expect(input.value).toBe("Ada");
    expect(input.placeholder).toBe("Your name");
  });

  it("calls onChange with the new value", () => {
    const onChange = vi.fn();
    render(<Input value="" onChange={onChange} placeholder="Type" />);
    fireEvent.change(screen.getByPlaceholderText("Type"), {
      target: { value: "hi" },
    });
    expect(onChange).toHaveBeenCalledWith("hi");
  });

  it("renders the error state and exposes it to assistive tech", () => {
    render(
      <Input
        label="Email"
        value="not-an-email"
        onChange={() => {}}
        error="Enter a valid email address."
      />,
    );
    const input = screen.getByLabelText("Email");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByRole("alert").textContent).toBe(
      "Enter a valid email address.",
    );
  });

  it("respects disabled", () => {
    render(<Input value="" onChange={() => {}} disabled placeholder="Off" />);
    expect(screen.getByPlaceholderText("Off").hasAttribute("disabled")).toBe(true);
  });

  it("has no axe violations, including in the error state", async () => {
    const { container } = render(
      <div>
        <Input label="Name" value="Ada" onChange={() => {}} />
        <Input label="Email" value="bad" onChange={() => {}} error="Enter a valid email address." />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
