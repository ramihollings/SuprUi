import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { describe, expect, it, vi } from "vitest";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./Tabs";

function renderTabs(value = "a") {
  return render(
    <Tabs value={value} onValueChange={() => {}}>
      <TabsList>
        <TabsTrigger value="a">Tab A</TabsTrigger>
        <TabsTrigger value="b">Tab B</TabsTrigger>
      </TabsList>
      <TabsContent value="a">Content A</TabsContent>
      <TabsContent value="b">Content B</TabsContent>
    </Tabs>,
  );
}

describe("Tabs", () => {
  it("renders the active panel and its triggers", () => {
    renderTabs("a");
    expect(screen.getByRole("tab", { name: "Tab A" })).toBeTruthy();
    expect(screen.getByText("Content A")).toBeTruthy();
    expect(screen.queryByText("Content B")).toBeNull();
  });

  it("calls onValueChange when a trigger is clicked", () => {
    const onValueChange = vi.fn();
    render(
      <Tabs value="a" onValueChange={onValueChange}>
        <TabsList>
          <TabsTrigger value="a">Tab A</TabsTrigger>
          <TabsTrigger value="b">Tab B</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Content A</TabsContent>
        <TabsContent value="b">Content B</TabsContent>
      </Tabs>,
    );
    fireEvent.click(screen.getByRole("tab", { name: "Tab B" }));
    expect(onValueChange).toHaveBeenCalledWith("b");
  });

  it("supports arrow-key navigation between tabs", async () => {
    const user = userEvent.setup();
    renderTabs("a");
    const tabA = screen.getByRole("tab", { name: "Tab A" });
    tabA.focus();
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(
      screen.getByRole("tab", { name: "Tab B" }),
    );
  });

  it("has no axe violations", async () => {
    const { container } = renderTabs("a");
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
