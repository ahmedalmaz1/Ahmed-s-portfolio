"use client";
import { Canvas } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import CameraRig from "./CameraRig";
import Fireflies from "./Fireflies";
import Moon from "./Moon";
import Terrain from "./Terrain";
import { useHeroPointer } from "./useHeroPointer";

/**
 * @param {{ heroRef: React.RefObject<HTMLElement>, fovDegrees: number }} props
 */
export default function HeroCanvas({ heroRef, fovDegrees }) {
  const pointerRef = useHeroPointer(heroRef);
  const cursorRef = useRef(new THREE.Vector2(0, 0));
  const [inView, setInView] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Pause rendering when the hero scrolls out of view — the main perf win
  // for a full-viewport WebGL scene on a long page.
  useEffect(() => {
    const el = heroRef.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([entry]) =>
      setInView(!!entry?.isIntersecting),
    );
    io.observe(el);
    return () => io.disconnect();
  }, [heroRef]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <Canvas
      className="!absolute !inset-0 -z-30"
      dpr={[1, 1.6]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ fov: 37.6, near: 0.1, far: 420, position: [0, 7.4, 72] }}
      onCreated={({ gl }) => gl.setClearColor("#050A0E", 1)}
      frameloop={inView ? "always" : "never"}
    >
      <CameraRig
        heroRef={heroRef}
        pointerRef={pointerRef}
        cursorRef={cursorRef}
        fovDegrees={fovDegrees}
        reducedMotion={reducedMotion}
      />
      <Terrain cursorRef={cursorRef} />
      <Moon />
      <Fireflies />
    </Canvas>
  );
}
