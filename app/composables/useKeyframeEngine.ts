import type { Keyframe, KeyframeTrack, EasingType } from "../lib/ograf/types";

/**
 * Interpolates a value at a given time from a sorted array of keyframes.
 */
export function interpolateValue(
  keyframes: Keyframe[],
  time: number,
): number | string {
  if (keyframes.length === 0) return 0;
  const sorted = [...keyframes].sort((a, b) => a.time - b.time);

  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  if (!first || !last) return 0;

  if (time <= first.time) return first.value;
  if (time >= last.time) return last.value;

  for (let i = 0; i < sorted.length - 1; i++) {
    const kf1 = sorted[i];
    const kf2 = sorted[i + 1];
    if (!kf1 || !kf2) continue;
    if (time >= kf1.time && time <= kf2.time) {
      const t = (time - kf1.time) / (kf2.time - kf1.time);
      const eased = applyEasing(t, kf1.easing, kf1.cubicBezier);

      // String values: snap to nearest keyframe (no interpolation for strings)
      if (typeof kf1.value === "string" || typeof kf2.value === "string") {
        return eased < 0.5 ? kf1.value : kf2.value;
      }

      return kf1.value + (kf2.value - kf1.value) * eased;
    }
  }

  return last.value;
}

function applyEasing(
  t: number,
  easing: EasingType,
  cubicBezier?: [number, number, number, number],
): number {
  switch (easing) {
    case "linear":
      return t;
    case "ease-in":
      return t * t;
    case "ease-out":
      return 1 - (1 - t) * (1 - t);
    case "ease-in-out":
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    case "cubic-bezier":
      if (cubicBezier) {
        return cubicBezierInterpolation(t, cubicBezier);
      }
      return t;
    default:
      return t;
  }
}

function cubicBezierInterpolation(
  t: number,
  [x1, y1, x2, y2]: [number, number, number, number],
): number {
  // Newton-Raphson iteration to find the x value that maps to t
  let guess = t;
  for (let i = 0; i < 8; i++) {
    const x = bezierComponent(guess, x1, x2) - t;
    if (Math.abs(x) < 0.001) break;
    const dx = bezierDerivative(guess, x1, x2);
    if (Math.abs(dx) < 0.001) break;
    guess = guess - x / dx;
  }
  return bezierComponent(guess, y1, y2);
}

function bezierComponent(t: number, p1: number, p2: number): number {
  const ct = 1 - t;
  return 3 * ct * ct * t * p1 + 3 * ct * t * t * p2 + t * t * t;
}

function bezierDerivative(t: number, p1: number, p2: number): number {
  const ct = 1 - t;
  return 3 * ct * ct * p1 + 6 * ct * t * (p2 - p1) + 3 * t * t * (1 - p2);
}

/**
 * Gets the total duration of a keyframe track in milliseconds.
 */
export function getTrackDuration(track: KeyframeTrack): number {
  if (track.keyframes.length === 0) return 0;
  return Math.max(...track.keyframes.map((k) => k.time));
}

/**
 * Gets the total duration across all tracks in milliseconds.
 */
export function getTotalDuration(tracks: KeyframeTrack[]): number {
  if (tracks.length === 0) return 500; // Default 500ms
  return Math.max(...tracks.map(getTrackDuration), 500);
}

/**
 * Adds a keyframe to a track, replacing any existing keyframe at the same time.
 */
export function addKeyframe(
  track: KeyframeTrack,
  keyframe: Keyframe,
): KeyframeTrack {
  const filtered = track.keyframes.filter((k) => k.time !== keyframe.time);
  return {
    ...track,
    keyframes: [...filtered, keyframe].sort((a, b) => a.time - b.time),
  };
}

/**
 * Removes a keyframe at a given time from a track.
 */
export function removeKeyframe(
  track: KeyframeTrack,
  time: number,
): KeyframeTrack {
  return {
    ...track,
    keyframes: track.keyframes.filter((k) => k.time !== time),
  };
}

/**
 * Updates a keyframe at a given time.
 */
export function updateKeyframe(
  track: KeyframeTrack,
  oldTime: number,
  newKeyframe: Keyframe,
): KeyframeTrack {
  const filtered = track.keyframes.filter((k) => k.time !== oldTime);
  return {
    ...track,
    keyframes: [...filtered, newKeyframe].sort((a, b) => a.time - b.time),
  };
}
