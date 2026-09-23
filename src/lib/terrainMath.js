/**
 * Pure functions describing the canyon terrain. Kept free of THREE/React so
 * they're trivial to reason about and reuse (camera path, height field).
 */

/** The x offset of the canyon's centerline at a given z (depth). */
export function pathX(z) {
  return Math.sin(z * 0.035) * 12 + Math.sin(z * 0.013 + 1.3) * 9;
}

/** Terrain height at world (x, z), shaped around the canyon path. */
export function heightAt(x, z) {
  const dx = Math.abs(x - pathX(z));
  const v = Math.min(1, Math.max(0, (dx - 5) / 40));
  const s = v * v * (3 - 2 * v); // smoothstep

  let h = 0;
  h += Math.sin(x * 0.07 + Math.sin(z * 0.05) * 1.7) * 3.2;
  h += Math.cos(z * 0.06 + Math.sin(x * 0.09) * 1.4) * 2.6;
  h += (1 - Math.abs(Math.sin(x * 0.045 + z * 0.03))) * 7.0;
  h += (1 - Math.abs(Math.sin(z * 0.05 - x * 0.035 + 1.7))) * 5.0;
  h += Math.sin(x * 0.23 + z * 0.19) * 0.6;

  return h * (0.1 + 0.95 * s) + s * s * 9;
}

/** Ease-out-ish smoothstep, used for scroll progress. */
export function ease(p) {
  return p * p * (3 - 2 * p);
}

export function clamp01(n) {
  return Math.min(1, Math.max(0, n));
}

/** Vertical field of view (degrees) for a given "lens" focal length, on a 24mm-tall sensor. */
export function fovForFocalLength(mm) {
  return 2 * Math.atan(12 / mm) * (180 / Math.PI);
}
