import { describe, it, expect } from "vitest";
import {
  interpolateValue,
  getTrackDuration,
  getTotalDuration,
  addKeyframe,
  removeKeyframe,
} from "./useKeyframeEngine";
import type { Keyframe, KeyframeTrack } from "../lib/ograf/types";

describe("interpolateValue", () => {
  it("returns 0 for an empty track", () => {
    expect(interpolateValue([], 100)).toBe(0);
  });

  it("clamps before the first keyframe", () => {
    const keyframes: Keyframe[] = [
      { time: 100, value: 10, easing: "linear" },
      { time: 200, value: 20, easing: "linear" },
    ];

    expect(interpolateValue(keyframes, 50)).toBe(10);
  });

  it("clamps after the last keyframe", () => {
    const keyframes: Keyframe[] = [
      { time: 100, value: 10, easing: "linear" },
      { time: 200, value: 20, easing: "linear" },
    ];

    expect(interpolateValue(keyframes, 250)).toBe(20);
  });

  it("interpolates linear numeric values", () => {
    const keyframes: Keyframe[] = [
      { time: 0, value: 0, easing: "linear" },
      { time: 1000, value: 100, easing: "linear" },
    ];

    expect(interpolateValue(keyframes, 500)).toBe(50);
  });

  it("snaps string values to the nearest keyframe", () => {
    const keyframes: Keyframe[] = [
      { time: 0, value: "a", easing: "linear" },
      { time: 1000, value: "b", easing: "linear" },
    ];

    expect(interpolateValue(keyframes, 400)).toBe("a");
    expect(interpolateValue(keyframes, 600)).toBe("b");
  });
});

describe("track helpers", () => {
  const track: KeyframeTrack = {
    elementId: "el-1",
    property: "x",
    keyframes: [
      { time: 0, value: 0, easing: "linear" },
      { time: 500, value: 50, easing: "linear" },
    ],
  };

  it("computes track duration", () => {
    expect(getTrackDuration(track)).toBe(500);
  });

  it("computes total duration across tracks", () => {
    const tracks: KeyframeTrack[] = [track, { ...track, keyframes: [] }];
    expect(getTotalDuration(tracks)).toBe(500);
  });

  it("replaces keyframes at the same time", () => {
    const updated = addKeyframe(track, {
      time: 500,
      value: 75,
      easing: "linear",
    });

    expect(updated.keyframes).toHaveLength(2);
    expect(updated.keyframes[1]?.value).toBe(75);
  });

  it("removes a keyframe by time", () => {
    const updated = removeKeyframe(track, 500);

    expect(updated.keyframes).toHaveLength(1);
    expect(updated.keyframes[0]?.time).toBe(0);
  });
});
