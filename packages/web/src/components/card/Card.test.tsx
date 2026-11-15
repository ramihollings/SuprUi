import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./Card";

describe("Card", () => {
  it("renders the compound parts", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Workspace</CardTitle>
          <CardDescription>Three members, two spaces.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Body copy</p>
        </CardContent>
        <CardFooter>
          <button type="button">Open</button>
        </CardFooter>
      </Card>,
    );
    expect(screen.getByText("Workspace")).toBeTruthy();
    expect(screen.getByText("Three members, two spaces.")).toBeTruthy();
    expect(screen.getByText("Body copy")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Open" })).toBeTruthy();
  });
});
