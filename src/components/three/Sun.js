'use client';

import { useMemo } from 'react';
import * as THREE from 'three';

function glowTexture(stops) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    stops.forEach(([offset, color]) => gradient.addColorStop(offset, color));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
  }
  return new THREE.CanvasTexture(canvas);
}

const SUN_Z = -118;

export default function Sun() {
  const haloMap = useMemo(
    () =>
      glowTexture([
        [0, 'rgba(255,190,90,.75)'],
        [0.25, 'rgba(240,140,50,.35)'],
        [1, 'rgba(240,140,50,0)'],
      ]),
    []
  );
  const coreMap = useMemo(
    () =>
      glowTexture([
        [0, 'rgba(255,244,210,1)'],
        [0.35, 'rgba(255,205,115,.9)'],
        [1, 'rgba(255,190,90,0)'],
      ]),
    []
  );

  return (
    <group position={[8, 22, SUN_Z]}>
      <sprite scale={[84, 84, 1]}>
        <spriteMaterial map={haloMap} blending={THREE.AdditiveBlending} depthWrite={false} transparent />
      </sprite>
      <sprite scale={[15, 15, 1]}>
        <spriteMaterial map={coreMap} blending={THREE.AdditiveBlending} depthWrite={false} transparent />
      </sprite>
    </group>
  );
}
