import { act, render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { describe, expect, it } from "vitest";
import { Toaster, toast } from "./Toast";

describe("Toast", () => {
  it("shows a toast when toast() is called", async () => {
    render(<Toaster />);
    act(() => {
      toast({ title: "Saved", description: "Your changes are live." });
    });
    expect(await screen.findByText("Saved")).toBeTruthy();
    expect(await screen.findByText("Your changes are live.")).toBeTruthy();
  });

  it("shows each variant", async () => {
    render(<Toaster />);
    act(() => {
      toast({ title: "Done", variant: "success" });
      toast({ title: "Failed", variant: "error" });
      toast({ title: "Heads up", variant: "warning" });
    });
    expect(await screen.findByText("Done")).toBeTruthy();
    expect(await screen.findByText("Failed")).toBeTruthy();
    expect(await screen.findByText("Heads up")).toBeTruthy();
  });

  it("has no axe violations with a toast visible", async () => {
    render(<Toaster />);
    act(() => {
      toast({ title: "Axe check", description: "This toast is visible." });
    });
    await screen.findByText("Axe check");
    const results = await axe(document.body);
    expect(results).toHaveNoViolations();
  });
});
