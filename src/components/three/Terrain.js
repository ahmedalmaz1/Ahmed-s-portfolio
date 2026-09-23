'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo } from 'react';
import * as THREE from 'three';
import { heightAt } from '@/lib/terrainMath';

const SEGMENTS = 160;
const SIZE = 250;
const BG = '#051317';

const VERTEX_SHADER = /* glsl */ `
  varying float vDepth;
  varying vec3 vW;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vDepth = -mv.z;
    vW = position;
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uBg; uniform vec3 uLow; uniform vec3 uHigh; uniform vec3 uAccent;
  uniform vec2 uCursor; uniform float uFog; uniform float uTime;
  varying float vDepth;
  varying vec3 vW;
  void main() {
    float h = clamp((vW.y + 1.0) / 26.0, 0.0, 1.0);
    vec3 col = mix(uLow, uHigh, h);
    float d = distance(vW.xz, uCursor);
    float g = smoothstep(18.0, 0.0, d);
    float r = mod(uTime * 9.0, 32.0);
    float q = (d - r) * 0.55;
    float pulse = exp(-q * q) * (1.0 - r / 32.0) * 0.8;
    col = mix(col, uAccent, clamp(g * 0.85 + pulse, 0.0, 1.0));
    float fd = uFog * vDepth;
    float f = 1.0 - exp(-fd * fd);
    col = mix(col, uBg, clamp(f, 0.0, 1.0));
    gl_FragColor = vec4(col, 1.0);
  }
`;

/**
 * @param {{ cursorRef: React.MutableRefObject<THREE.Vector2> }} props
 */
export default function Terrain({ cursorRef }) {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(SIZE, SIZE, SEGMENTS, SEGMENTS);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      pos.setY(i, heightAt(pos.getX(i), pos.getZ(i)));
    }
    pos.needsUpdate = true;
    return geo;
  }, []);

  // Wireframe drawn as explicit line segments (grid edges only, not diagonals)
  // so it reads as a clean topographic mesh rather than a triangulated one.
  const lineGeometry = useMemo(() => {
    const n = SEGMENTS + 1;
    const indices = [];
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const a = i * n + j;
        if (j < n - 1) indices.push(a, a + 1);
        if (i < n - 1) indices.push(a, a + n);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', geometry.attributes.position);
    geo.setIndex(indices);
    return geo;
  }, [geometry]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uBg: { value: new THREE.Color(BG) },
          uLow: { value: new THREE.Color(0x184a52) },
          uHigh: { value: new THREE.Color(0x86c9c0) },
          uAccent: { value: new THREE.Color(0xf0b341) },
          uCursor: { value: new THREE.Vector2(0, 0) },
          uFog: { value: 0.0125 },
          uTime: { value: 0 },
        },
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
      }),
    []
  );

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uCursor.value.copy(cursorRef.current);
  });

  return (
    <>
      {/* Occludes lines behind ridges so distant grid lines don't show through the terrain. */}
      <mesh geometry={geometry}>
        <meshBasicMaterial color={BG} polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} />
      </mesh>
      <lineSegments geometry={lineGeometry} material={material} />
    </>
  );
}
