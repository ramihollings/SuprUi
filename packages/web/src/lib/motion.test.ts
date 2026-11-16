import { describe, expect, it } from "vitest";
import tokens from "@suprui/tokens/tokens.json";
import {
  motionDurations,
  motionEaseOut,
  motionSpringGentle,
  motionSpringSnappy,
} from "./motion";

/**
 * Guards the hand-mirrored Motion values in motion.ts against the token
 * source of truth. If a token changes, this test fails first — update the
 * token, then the mirror.
 */
describe("motion token mirror", () => {
  it("durations match tokens/motion.json", () => {
    expect(motionDurations.fast).toBe(Number.parseFloat(tokens.motion.duration.fast) / 1000);
    expect(motionDurations.base).toBe(Number.parseFloat(tokens.motion.duration.base) / 1000);
    expect(motionDurations.slow).toBe(Number.parseFloat(tokens.motion.duration.slow) / 1000);
  });

  it("ease-out matches tokens/motion.json", () => {
    expect(`cubic-bezier(${motionEaseOut.join(", ")})`).toBe(tokens.motion.easing["ease-out"]);
  });

  it("springs match tokens/motion.json", () => {
    expect(motionSpringGentle).toEqual(tokens.motion.spring.gentle);
    expect(motionSpringSnappy).toEqual(tokens.motion.spring.snappy);
  });
});
