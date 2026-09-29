"use client";

import { useMemo } from "react";
import * as THREE from "three";

// Same seed = exactly the same moon texture every time.
function seededRandom(seed) {
  let value = seed >>> 0;

  return () => {
    value += 0x6d2b79f5;

    let t = value;

    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// CANVAS TEXTURE
function canvasTexture(draw, size = 1024) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;

  const ctx = canvas.getContext("2d");

  if (ctx) {
    draw(ctx, size);
  }

  const texture = new THREE.CanvasTexture(canvas);

  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  texture.needsUpdate = true;

  return texture;
}

const MOON_POSITION = [8, 22, -118];

/* ------------------------------------------------------------------ */
/* Helpers for the realistic moon surface                              */
/* ------------------------------------------------------------------ */

const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// Seeded fractal value-noise (returns ~0..1)
function makeFbm(seed) {
  const random = seededRandom(seed);
  const table = new Float32Array(256 * 256);

  for (let i = 0; i < table.length; i++) table[i] = random();

  const at = (x, y) => table[((y & 255) << 8) | (x & 255)];

  const noise = (x, y) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    const u = xf * xf * (3 - 2 * xf);
    const v = yf * yf * (3 - 2 * yf);

    const a = at(xi, yi);
    const b = at(xi + 1, yi);
    const c = at(xi, yi + 1);
    const d = at(xi + 1, yi + 1);

    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };

  return (x, y, octaves = 5) => {
    let sum = 0;
    let amp = 0.5;
    let freq = 1;
    let norm = 0;

    for (let o = 0; o < octaves; o++) {
      sum += noise(x * freq + o * 17.3, y * freq + o * 9.1) * amp;
      norm += amp;
      amp *= 0.5;
      freq *= 2.03;
    }

    return sum / norm;
  };
}

function drawCrater(ctx, x, y, rad, s) {
  if (rad < 1.2) {
    ctx.fillStyle = `rgba(60,66,74,${0.22 * s})`;
    ctx.beginPath();
    ctx.arc(x, y, Math.max(rad, 0.6), 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  // floor
  const floor = ctx.createRadialGradient(
    x + rad * 0.12,
    y + rad * 0.12,
    rad * 0.1,
    x,
    y,
    rad,
  );
  floor.addColorStop(0, `rgba(70,76,84,${0.34 * s})`);
  floor.addColorStop(0.7, `rgba(90,98,108,${0.2 * s})`);
  floor.addColorStop(1, "rgba(120,128,138,0)");

  ctx.beginPath();
  ctx.arc(x, y, rad, 0, Math.PI * 2);
  ctx.fillStyle = floor;
  ctx.fill();

  ctx.lineCap = "round";

  // shadowed inner wall (upper-left, away from the light)
  ctx.beginPath();
  ctx.arc(
    x + rad * 0.06,
    y + rad * 0.06,
    rad * 0.82,
    Math.PI * 0.9,
    Math.PI * 1.6,
  );
  ctx.strokeStyle = `rgba(28,32,38,${0.32 * s})`;
  ctx.lineWidth = Math.max(0.6, rad * 0.26);
  ctx.stroke();

  // lit inner wall (lower-right, facing the light)
  ctx.beginPath();
  ctx.arc(
    x - rad * 0.04,
    y - rad * 0.04,
    rad * 0.86,
    -Math.PI * 0.1,
    Math.PI * 0.5,
  );
  ctx.strokeStyle = `rgba(255,255,255,${0.3 * s})`;
  ctx.lineWidth = Math.max(0.6, rad * 0.2);
  ctx.stroke();

  // raised rim
  ctx.beginPath();
  ctx.arc(x, y, rad * 1.02, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(240,244,248,${0.1 * s})`;
  ctx.lineWidth = Math.max(0.5, rad * 0.12);
  ctx.stroke();
}

function drawRays(ctx, x, y, random, count, maxLen, alpha) {
  for (let i = 0; i < count; i++) {
    const a = random() * Math.PI * 2;
    const len = maxLen * (0.35 + random() * 0.65);
    const x2 = x + Math.cos(a) * len;
    const y2 = y + Math.sin(a) * len;

    const g = ctx.createLinearGradient(x, y, x2, y2);
    const al = alpha * (0.4 + random() * 0.6);
    g.addColorStop(0, `rgba(255,255,255,${al})`);
    g.addColorStop(1, "rgba(255,255,255,0)");

    ctx.strokeStyle = g;
    ctx.lineWidth = 0.6 + random() * 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
}

// The moon disc (same radius as before: size * 0.24)
function drawMoon(ctx, size) {
  const c = size / 2;
  const r = size * 0.24;
  const random = seededRandom(133742);
  const fbm = makeFbm(90210);

  const lo = Math.max(0, Math.floor(c - r - 2));
  const hi = Math.min(size, Math.ceil(c + r + 2));
  const aa = 1.5 / r;

  const maria = [
    [-0.34, -0.2, 0.2],
    [0.28, -0.34, 0.14],
    [0.35, 0.2, 0.22],
    [-0.18, 0.38, 0.15],
    [-0.48, 0.12, 0.11],
    [0.04, 0.02, 0.09],
    [-0.02, -0.43, 0.08],
    [0.48, -0.08, 0.08],
  ];

  /* ---- Pass 1: surface albedo (highlands + maria + grain) ---- */
  const img = ctx.createImageData(size, size);
  const px = img.data;

  for (let y = lo; y < hi; y++) {
    for (let x = lo; x < hi; x++) {
      const nx = (x - c) / r;
      const ny = (y - c) / r;
      const d = Math.hypot(nx, ny);

      if (d > 1) continue;

      const big = fbm(nx * 1.8 + 3, ny * 1.8 + 7, 4);
      const mid = fbm(nx * 6 + 11, ny * 6 + 2, 5);
      const fine = fbm(nx * 28, ny * 28, 3);

      let v = 0.86 + (big - 0.5) * 0.2 + (mid - 0.5) * 0.2 + (fine - 0.5) * 0.1;

      let m = 0;

      for (const [dx, dy, rr] of maria) {
        const reach = rr * 1.6;
        const dist = Math.hypot(nx - dx, ny - dy);

        if (dist > reach * 1.6) continue;

        const wobble = (fbm(nx * 5 + dx * 13, ny * 5 + dy * 13, 3) - 0.5) * 0.8;
        const k = dist / reach + wobble * 0.6;

        m = Math.max(m, 1 - smoothstep(0.55, 1.0, k));
      }

      const mare = 0.5 + (mid - 0.5) * 0.16 + (fine - 0.5) * 0.08;
      v += (mare - v) * m * 0.88;

      const i = (y * size + x) * 4;

      px[i] = Math.min(255, v * (0.99 - m * 0.04) * 255);
      px[i + 1] = Math.min(255, v * 0.985 * 255);
      px[i + 2] = Math.min(255, v * (0.97 + m * 0.07) * 255);
      px[i + 3] = 255 * (1 - smoothstep(1 - aa, 1, d));
    }
  }

  ctx.putImageData(img, 0, 0);

  /* ---- Craters + bright rays ---- */
  ctx.save();
  ctx.beginPath();
  ctx.arc(c, c, r, 0, Math.PI * 2);
  ctx.clip();

  // Tycho rays (south) and a smaller set around Copernicus
  const tycho = [-0.12, 0.6];
  const copernicus = [-0.22, -0.05];

  drawRays(ctx, c + tycho[0] * r, c + tycho[1] * r, random, 52, r * 1.3, 0.16);
  drawRays(
    ctx,
    c + copernicus[0] * r,
    c + copernicus[1] * r,
    random,
    18,
    r * 0.35,
    0.1,
  );

  const craters = [
    [tycho[0], tycho[1], 0.038, 1.0],
    [copernicus[0], copernicus[1], 0.042, 0.9],
    [-0.5, -0.06, 0.024, 0.8],
    [0.3, -0.3, 0.03, 0.8],
    [0.5, 0.2, 0.03, 0.7],
  ];

  for (let i = 0; i < 280; i++) {
    const a = random() * Math.PI * 2;
    const dd = Math.sqrt(random()) * 0.96;
    const rr = 0.006 + 0.045 * Math.pow(random(), 3.4);

    craters.push([
      Math.cos(a) * dd,
      Math.sin(a) * dd,
      rr,
      0.5 + random() * 0.5,
    ]);
  }

  for (const [dx, dy, rr, s] of craters) {
    const d = Math.hypot(dx, dy);
    const x = c + dx * r;
    const y = c + dy * r;
    const rad = rr * r;

    // craters fade toward the limb (foreshortening)
    drawCrater(ctx, x, y, rad, s * (1 - 0.65 * d * d));
  }

  ctx.restore();

  /* ---- Pass 2: spherical lighting + limb darkening ---- */
  const shaded = ctx.getImageData(0, 0, size, size);
  const sd = shaded.data;
  const L = new THREE.Vector3(-0.5, -0.45, 0.75).normalize();

  for (let y = lo; y < hi; y++) {
    for (let x = lo; x < hi; x++) {
      const nx = (x - c) / r;
      const ny = (y - c) / r;
      const d2 = nx * nx + ny * ny;

      if (d2 >= 1) continue;

      const nz = Math.sqrt(1 - d2);
      const lam = Math.max(0, nx * L.x + ny * L.y + nz * L.z);
      const k = (0.62 + 0.38 * lam) * (0.86 + 0.14 * Math.pow(nz, 0.45)) * 1.12;

      const i = (y * size + x) * 4;

      sd[i] = Math.min(255, sd[i] * k);
      sd[i + 1] = Math.min(255, sd[i + 1] * k);
      sd[i + 2] = Math.min(255, sd[i + 2] * k);
    }
  }

  ctx.putImageData(shaded, 0, 0);
}

export default function Moon() {
  const haloMap = useMemo(
    () =>
      canvasTexture((ctx, size) => {
        const c = size / 2;

        const g = ctx.createRadialGradient(c, c, 0, c, c, c);

        g.addColorStop(0, "rgba(225,240,255,0.45)");
        g.addColorStop(0.12, "rgba(200,225,250,0.30)");
        g.addColorStop(0.28, "rgba(160,200,240,0.15)");
        g.addColorStop(0.55, "rgba(125,170,225,0.055)");
        g.addColorStop(1, "rgba(80,120,190,0)");

        ctx.fillStyle = g;
        ctx.fillRect(0, 0, size, size);
      }),
    [],
  );

  const discMap = useMemo(() => canvasTexture(drawMoon), []);

  // MOON
  return (
    <group position={MOON_POSITION}>
      {/* SAME HALO SIZE */}
      <sprite scale={[190, 190, 1]}>
        <spriteMaterial
          map={haloMap}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          transparent
        />
      </sprite>

      {/* SAME MOON SIZE */}
      <sprite scale={[46, 46, 1]}>
        <spriteMaterial map={discMap} depthWrite={false} transparent />
      </sprite>
    </group>
  );
}
