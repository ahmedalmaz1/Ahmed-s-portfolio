'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { pathX } from '@/lib/terrainMath';

const COUNT = 240;

export default function Embers() {
  const pointsRef = useRef(null);

  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const speeds = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      const z = -90 + Math.random() * 170;
      positions[i * 3] = pathX(z) + (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = 0.5 + Math.random() * 20;
      positions[i * 3 + 2] = z;
      speeds[i] = 0.4 + Math.random() * 0.8;
    }
    return { positions, speeds };
  }, []);

  useFrame((state, delta) => {
    const geo = pointsRef.current?.geometry;
    const attr = geo?.attributes.position;
    if (!attr) return;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < COUNT; i++) {
      let y = attr.getY(i) + speeds[i] * delta * 0.8;
      const x = attr.getX(i) + Math.sin(t + i) * 0.004;
      if (y > 21) y = 0.5;
      attr.setXY(i, x, y);
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={0xf0b341}
        size={0.45}
        transparent
        opacity={0.75}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
