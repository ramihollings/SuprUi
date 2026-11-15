import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { describe, expect, it } from "vitest";
import { Button } from "../button/Button";
import { Popover } from "./Popover";

describe("Popover", () => {
  it("renders content when open", () => {
    render(
      <Popover
        trigger={<Button>Open</Button>}
        content={<p>Popover body</p>}
        open
        onOpenChange={() => {}}
      />,
    );
    expect(screen.getByText("Popover body")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Open" })).toBeTruthy();
  });

  it("renders nothing but the trigger when closed", () => {
    render(
      <Popover
        trigger={<Button>Open</Button>}
        content={<p>Popover body</p>}
        open={false}
        onOpenChange={() => {}}
      />,
    );
    expect(screen.queryByText("Popover body")).toBeNull();
  });

  it("has no axe violations when open", async () => {
    render(
      <Popover
        trigger={<Button>Open</Button>}
        content={<p>Popover body</p>}
        open
        onOpenChange={() => {}}
      />,
    );
    const results = await axe(document.body);
    expect(results).toHaveNoViolations();
  });
});
