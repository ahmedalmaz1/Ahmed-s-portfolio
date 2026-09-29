"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { scrollFx } from "./scrollFx";

const COUNT = 3200;

const COLORS = [
  { c: "#ffffff", w: 0.55 },
  { c: "#4D8195", w: 0.18 },
  { c: "#954918", w: 0.15 },
  { c: "#796499", w: 0.12 },
];

function pickColor() {
  let r = Math.random();
  for (const { c, w } of COLORS) {
    if ((r -= w) <= 0) return new THREE.Color(c).convertLinearToSRGB();
  }
  return new THREE.Color(COLORS[0].c).convertLinearToSRGB();
}

const vertexShader = /* glsl */ `
  attribute vec3 aOffset;
  attribute float aSize;
  attribute float aPhase;
  attribute float aSpeed;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uBurst;
  uniform float uPixelRatio;
  uniform vec3 uOrigin;
  varying vec3 vColor;
  varying float vTwinkle;

  void main() {
    // انطلاق فوري ثم تباطؤ ناعم، ولكل نقطة معدل مختلف
    float rate = 1.6 + aSpeed * 1.4;
    float e = 1.0 - exp(-uBurst * rate);

    vec3 drift = vec3(
      sin(uTime * 0.08 * aSpeed + aPhase * 3.0),
      cos(uTime * 0.07 * aSpeed + aPhase * 5.0),
      sin(uTime * 0.05 * aSpeed + aPhase * 7.0)
    ) * 3.0 * e;

    vec3 p = uOrigin + aOffset * e + drift;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;

    vTwinkle = 0.6 + 0.4 * sin(uTime * 0.7 * aSpeed + aPhase);
    vColor = aColor;
    // حجم يتناسب مع العمق ليظهر البعد الحقيقي
    gl_PointSize = clamp(aSize * uPixelRatio * (200.0 / -mv.z), 1.5, 16.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vTwinkle;

  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    if (d > 1.0) discard;

    float core = 1.0 - smoothstep(0.0, 0.55, d);
    float halo = pow(1.0 - d, 3.0) * 0.45;
    float a = (core + halo) * vTwinkle * uOpacity;

    vec3 col = mix(vColor * 1.5, vec3(1.0), core * 0.45);

    gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
  }
`;

function buildBurst() {
  const offsets = new Float32Array(COUNT * 3);
  const sizes = new Float32Array(COUNT);
  const phases = new Float32Array(COUNT);
  const speeds = new Float32Array(COUNT);
  const colors = new Float32Array(COUNT * 3);
  // الموضع النهائي بالنسبة لمركز الصورة. توزيع كروي كامل، فالنقاط تملأ العمق
  // (قريبة وبعيدة) وليست طبقة واحدة.
  const positions = new Float32Array(COUNT * 3);

  for (let i = 0; i < COUNT; i++) {
    const u = Math.random() * 2 - 1;
    const a = Math.random() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    const r = 10 + Math.pow(Math.random(), 0.65) * 150;

    offsets.set(
      [s * Math.cos(a) * r, s * Math.sin(a) * r, u * r * 0.5 - 25],
      i * 3,
    );

    const q = Math.random();
    sizes[i] =
      q < 0.7
        ? 1.0 + Math.random() * 1.2
        : q < 0.92
          ? 2.2 + Math.random() * 1.6
          : 3.8 + Math.random() * 2.5;

    phases[i] = Math.random() * Math.PI * 2;
    speeds[i] = 0.4 + Math.random() * 1.6;

    const col = pickColor();
    colors.set([col.r, col.g, col.b], i * 3);
  }
  return { positions, offsets, sizes, phases, speeds, colors };
}

const _v = new THREE.Vector3();
const _d = new THREE.Vector3();

function Burst() {
  const pointsRef = useRef(null);
  const materialRef = useRef(null);
  const burstTime = useRef(0);

  const { positions, offsets, sizes, phases, speeds, colors } = useMemo(
    () => buildBurst(),
    [],
  );

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uBurst: { value: 0 },
      uOpacity: { value: 0 },
      uPixelRatio: { value: 1 },
      uOrigin: { value: new THREE.Vector3() },
    }),
    [],
  );

  useEffect(() => {
    const mat = materialRef.current;
    if (mat)
      mat.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
  }, []);

  useFrame((state, delta) => {
    const mat = materialRef.current;
    const pts = pointsRef.current;
    if (!mat || !pts) return;
    const u = mat.uniforms;
    const landed = scrollFx.landed;

    // ظهور فوري عند وصول الصورة، وتلاشي أسرع قليلاً عند الرجوع
    const kO = 1 - Math.exp(-delta * (landed ? 14 : 6));
    u.uOpacity.value += ((landed ? 1 : 0) - u.uOpacity.value) * kO;
    pts.visible = u.uOpacity.value > 0.003;

    if (landed) burstTime.current += delta;
    else if (!pts.visible) burstTime.current = 0;

    if (!pts.visible) return;

    u.uTime.value = state.clock.elapsedTime;
    u.uBurst.value = burstTime.current;

    // مركز الانفجار = مركز الصورة في About، محوّلاً من الشاشة إلى العالم (z = 0)
    const slot = document.getElementById("about-portrait-slot");
    if (slot) {
      const r = slot.getBoundingClientRect();
      const c = state.gl.domElement.getBoundingClientRect();
      const nx = ((r.left + r.width / 2 - c.left) / c.width) * 2 - 1;
      const ny = -(((r.top + r.height / 2 - c.top) / c.height) * 2 - 1);
      const cam = state.camera;
      cam.updateMatrixWorld();
      _v.set(nx, ny, 0.5).unproject(cam);
      _d.copy(_v).sub(cam.position).normalize();
      const dist = -cam.position.z / _d.z;
      u.uOrigin.value.copy(cam.position).addScaledVector(_d, dist);
    }
  });

  return (
    <points ref={pointsRef} frustumCulled={false} visible={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aOffset" args={[offsets, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
        <bufferAttribute attach="attributes-aPhase" args={[phases, 1]} />
        <bufferAttribute attach="attributes-aSpeed" args={[speeds, 1]} />
        <bufferAttribute attach="attributes-aColor" args={[colors, 3]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function AboutEmbers() {
  return (
    <Canvas
      className="!pointer-events-none !absolute !inset-0 -z-10"
      dpr={[1, 1.6]}
      gl={{ alpha: true, antialias: true }}
      camera={{ fov: 40, near: 1, far: 600, position: [0, 0, 100] }}
    >
      <Burst />
    </Canvas>
  );
}
