import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Avatar } from "./Avatar";

describe("Avatar", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows the fallback when no src is given", () => {
    render(<Avatar fallback="AD" alt="Ada Lovelace" />);
    expect(screen.getByText("AD")).toBeTruthy();
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("renders the image with alt text when src is given", () => {
    // Base UI only mounts the <img> once its probe Image reports loaded;
    // jsdom never loads images, so stub window.Image to report success.
    class LoadedImage {
      complete = true;
      naturalWidth = 1;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_value: string) {
        this.onload?.();
      }
    }
    vi.stubGlobal("Image", LoadedImage);

    render(
      <Avatar
        src="https://example.com/ada.jpg"
        fallback="AD"
        alt="Ada Lovelace"
      />,
    );
    const img = screen.getByRole("img", { name: "Ada Lovelace" });
    expect(img.getAttribute("src")).toBe("https://example.com/ada.jpg");
  });

  it("applies the size variant", () => {
    const { container } = render(
      <Avatar fallback="AD" alt="Ada Lovelace" size="lg" />,
    );
    expect(container.firstElementChild?.className).toContain("size-12");
  });
});
