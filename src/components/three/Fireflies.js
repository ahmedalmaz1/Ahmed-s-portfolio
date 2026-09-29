"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { scrollFx } from "../scrollFx";

const COUNT = 2400;
const RADIUS = 220;
const BAND_SHARE = 0.3;

const COLORS = [
  { c: "#ffffff", w: 0.55 },
  { c: "#4D8195", w: 0.18 },
  { c: "#954918", w: 0.15 },
  { c: "#796499", w: 0.12 },
];

function pickColor() {
  let r = Math.random();
  for (const { c, w } of COLORS) {
    if ((r -= w) <= 0) {
      // الشيدر لا يحوّل مساحة اللون، فنرجع القيمة إلى sRGB
      return new THREE.Color(c).convertLinearToSRGB();
    }
  }
  return new THREE.Color(COLORS[0].c).convertLinearToSRGB();
}

const vertexShader = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute float aSpeed;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uAspect;
  uniform vec2 uMouse;
  uniform float uStrength;
  uniform float uPull;
  uniform vec2 uTarget;
  varying vec3 vColor;
  varying float vTwinkle;

  void main() {
    vec3 p = position + vec3(
      sin(uTime * 0.08 * aSpeed + aPhase * 3.0),
      cos(uTime * 0.07 * aSpeed + aPhase * 5.0),
      sin(uTime * 0.05 * aSpeed + aPhase * 7.0)
    ) * 3.0;

    vec4 clip = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    vec2 ndc = clip.xy / clip.w;

    // منطقة التأثير حول المؤشر (جاوسية ناعمة)
    vec2 d = ndc - uMouse;
    d.x *= uAspect;
    float sigma = 0.35;
    float g = exp(-dot(d, d) / (sigma * sigma));

    // انجذاب خفيف نحو المؤشر، ينعدم في المركز وعند الأطراف
    float depth = 0.6 + aSize / 8.0;
    vec2 pull = -d * g * 0.25 * uStrength * depth;
    pull.x /= uAspect;
    ndc += pull;

    // سحب الفلاي فلايز نحو الصورة أثناء الانتقال إلى About.
    // عند uPull = 0 لا يتغير أي شيء، فمواضعها في الـ landing كما هي.
    // الأقرب للصورة يتحرك أولاً، فيظهر السحب كموجة ناعمة.
    vec2 toT = (ndc - uTarget) * vec2(uAspect, 1.0);
    float delay = clamp(length(toT) * 0.25, 0.0, 0.4) + fract(aPhase * 0.318) * 0.1;
    float k = clamp((uPull - delay) / 0.5, 0.0, 1.0);
    k = k * k * k * (k * (k * 6.0 - 15.0) + 10.0);
    vec2 scatter = vec2(sin(aPhase * 13.0), cos(aPhase * 17.0)) * (0.02 + 0.08 * fract(aPhase * 3.7));
    ndc = mix(ndc, uTarget + scatter, k);

    clip.xy = ndc * clip.w;
    gl_Position = clip;

    vTwinkle = 0.6 + 0.4 * sin(uTime * 0.7 * aSpeed + aPhase);
    vColor = aColor;
    gl_PointSize = max(aSize * uPixelRatio, 1.5)*2.2;
  }
`;

const fragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vTwinkle;

  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    if (d > 1.0) discard;

    // نواة حادة + هالة رفيعة
    float core = 1.0 - smoothstep(0.0, 0.55, d);
    float halo = pow(1.0 - d, 3.0) * 0.45;
    float a = (core + halo) * vTwinkle;

    vec3 col = mix(vColor * 1.5, vec3(1.0), core * 0.45);

    gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
  }
`;

// Runs outside the component, so the purity rule doesn't flag Math.random()
function buildEmbers() {
  const positions = new Float32Array(COUNT * 3);
  const sizes = new Float32Array(COUNT);
  const phases = new Float32Array(COUNT);
  const speeds = new Float32Array(COUNT);
  const colors = new Float32Array(COUNT * 3);
  const bandNormal = new THREE.Vector3(0.35, 1, 0.2).normalize();
  const v = new THREE.Vector3();

  for (let i = 0; i < COUNT; i++) {
    const u = Math.random() * 2 - 1;
    const a = Math.random() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    v.set(s * Math.cos(a), u, s * Math.sin(a));

    if (Math.random() < BAND_SHARE) {
      const off = v.dot(bandNormal);
      v.addScaledVector(
        bandNormal,
        -off * (0.85 + Math.random() * 0.1),
      ).normalize();
    }
    if (v.y < -0.15) v.y = -v.y * 0.5;
    v.normalize().multiplyScalar(RADIUS * (0.9 + Math.random() * 0.1));
    positions.set([v.x, v.y, v.z], i * 3);

    // معظمها صغير جداً، وقلة كبيرة
    const r = Math.random();
    sizes[i] =
      r < 0.7
        ? 1.0 + Math.random() * 1.2
        : r < 0.92
          ? 2.2 + Math.random() * 1.6
          : 3.8 + Math.random() * 2.5;

    phases[i] = Math.random() * Math.PI * 2;
    speeds[i] = 0.4 + Math.random() * 1.6;

    const col = pickColor();
    colors.set([col.r, col.g, col.b], i * 3);
  }
  return { positions, sizes, phases, speeds, colors };
}

function buildUniforms() {
  return {
    uTime: { value: 0 },
    uPixelRatio: { value: 1 },
    uAspect: { value: 1 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uStrength: { value: 0 },
    uPull: { value: 0 },
    uTarget: { value: new THREE.Vector2(0, 0) },
  };
}

export default function Embers() {
  const groupRef = useRef(null);
  const materialRef = useRef(null);
  const moverRef = useRef(null);
  const target = useRef({ x: 0, y: 0, on: 0, snap: false });

  const { positions, sizes, phases, speeds, colors } = useMemo(
    () => buildEmbers(),
    [],
  );

  const uniforms = useMemo(() => buildUniforms(), []);

  useEffect(() => {
    const mat = materialRef.current;
    if (mat) {
      mat.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
    }

    const move = (e) => {
      // أول دخول للماوس: ابدأ من مكانه مباشرة بدون قفزة
      if (!target.current.on) target.current.snap = true;
      target.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
      target.current.on = 1;
    };
    const leave = () => (target.current.on = 0);
    window.addEventListener("mousemove", move);
    document.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseleave", leave);
    };
  }, []);

  useFrame((state, delta) => {
    const mat = materialRef.current;
    const g = groupRef.current;
    if (!mat || !g) return;

    const u = mat.uniforms;
    const t = target.current;
    u.uTime.value = state.clock.elapsedTime;
    u.uAspect.value = state.size.width / state.size.height;

    if (t.snap) {
      u.uMouse.value.set(t.x, t.y);
      t.snap = false;
    }

    // مؤشر ناعم بدون تجاوز أو ارتداد
    const kM = 1 - Math.exp(-delta * 4);
    u.uMouse.value.x += (t.x - u.uMouse.value.x) * kM;
    u.uMouse.value.y += (t.y - u.uMouse.value.y) * kM;

    // ظهور وتلاشي بطيئين لمنطقة التأثير
    const kF = 1 - Math.exp(-delta * (t.on ? 2 : 1.2));
    u.uStrength.value += (t.on - u.uStrength.value) * kF;

    // تقدّم السحب يتبع تقدّم الـ scroll بنعومة
    const kP = 1 - Math.exp(-delta * 6);
    u.uPull.value += (scrollFx.progress - u.uPull.value) * kP;

    // موضع الصورة المتحركة على الشاشة، محوّلاً إلى إحداثيات الكانفاس
    if (u.uPull.value > 0.001) {
      if (!moverRef.current) {
        moverRef.current = document.getElementById("portrait-mover");
      }
      const el = moverRef.current;
      if (el) {
        const r = el.getBoundingClientRect();
        const c = state.gl.domElement.getBoundingClientRect();
        u.uTarget.value.set(
          ((r.left + r.width / 2 - c.left) / c.width) * 2 - 1,
          -(((r.top + r.height / 2 - c.top) / c.height) * 2 - 1),
        );
      }
    }

    g.position.copy(state.camera.position);
    g.rotation.y += delta * 0.006;
    g.rotation.x += delta * 0.001;
  });

  return (
    <group ref={groupRef}>
      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
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
    </group>
  );
}
