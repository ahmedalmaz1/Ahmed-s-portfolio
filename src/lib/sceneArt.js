/**
 * Deterministic little "environment" made of stacked ridgelines, rendered as
 * SVG by <SceneArt>. Pure and seeded, so the same options always draw the
 * same scene (needed for the blockout/final-render compare slider, where
 * both halves must be the exact same layout).
 *
 * @typedef {[number, number]} Point
 * @typedef {{ seed: number, tower?: 0|1, trees?: number, rocks?: number }} SceneOptions
 */

const VIEW_W = 600;
const VIEW_H = 340;

function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function ridge(seed, base, amp, f1, f2) {
  const r = rng(seed);
  const p1 = r() * Math.PI * 2;
  const p2 = r() * Math.PI * 2;
  /** @type {Point[]} */
  const pts = [];
  for (let x = 0; x <= VIEW_W; x += 12) {
    const a = 1 - Math.abs(Math.sin(x * f1 + p1));
    const b = 1 - Math.abs(Math.sin(x * f2 + p2));
    pts.push([x, base - amp * (0.62 * a + 0.3 * b + 0.08 * r())]);
  }
  return pts;
}

/** @param {Point[]} pts */
export function pointsToPolygon(pts) {
  return pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
}

/** The ground polygon needs to close along the bottom edge to fill correctly. */
export function closedPolygon(pts) {
  return `${pointsToPolygon(pts)} ${VIEW_W},${VIEW_H} 0,${VIEW_H}`;
}

function yAt(pts, x) {
  const i = Math.max(0, Math.min(pts.length - 1, Math.round(x / 12)));
  return pts[i]?.[1] ?? 0;
}

/**
 * @param {SceneOptions} opts
 */
export function buildScene(opts) {
  const { seed, tower = 0, trees = 0, rocks = 0 } = opts;
  const r = rng(seed + 11);

  const far = ridge(seed, 232, 78, 0.011, 0.027);
  const mid = ridge(seed + 3, 268, 62, 0.014, 0.034);
  const near = ridge(seed + 5, 300, 42, 0.018, 0.05);
  const fg = ridge(seed + 9, 326, 20, 0.03, 0.07);

  let sunX = 380;
  let best = 0;
  for (const [x, y] of far) {
    if (x > 220 && x < 480 && y > best) {
      best = y;
      sunX = x;
    }
  }
  const sun = { x: sunX, y: best - 4 };

  let towerData = null;
  if (tower) {
    let tx = 200;
    let top = Infinity;
    for (const [x, y] of mid) {
      if (x > 90 && x < 330 && y < top) {
        top = y;
        tx = x;
      }
    }
    const b = top + 3;
    towerData = {
      trunk: { x: tx - 7, y: b - 34, w: 14, h: 36 },
      points: [
        [tx - 8, b - 34],
        [tx - 3, b - 43],
        [tx + 1, b - 37],
        [tx + 5, b - 47],
        [tx + 8, b - 34],
      ],
    };
  }

  const foreground = [];
  for (let i = 0; i < trees; i++) {
    const x = 380 + r() * 210;
    const by = yAt(fg, x) + 4;
    const h = 30 + r() * 22;
    foreground.push({
      kind: 'tree',
      points: [
        [x - 9, by],
        [x, by - h],
        [x + 9, by],
      ],
    });
  }
  for (let i = 0; i < rocks; i++) {
    const x = 30 + r() * 300;
    const by = yAt(fg, x) + 4;
    const w = 14 + r() * 14;
    foreground.push({
      kind: 'rock',
      points: [
        [x - w, by],
        [x - w * 0.5, by - w * 0.8],
        [x + w * 0.3, by - w],
        [x + w, by],
      ],
    });
  }

  return { far, mid, near, fg, sun, tower: towerData, foreground };
}

export const SCENE_VIEWBOX = `0 0 ${VIEW_W} ${VIEW_H}`;
