"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ProjectsScene({ targetRef }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const section = targetRef.current;
    const mount = mountRef.current;
    if (!section || !mount) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const styles = getComputedStyle(document.documentElement);
    const bg = styles.getPropertyValue("--color-bg").trim() || "#051317";
    const line = styles.getPropertyValue("--color-line").trim() || "#1D4A52";
    const accent =
      styles.getPropertyValue("--color-accent").trim() || "#F0B341";

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(bg, 0.045);

    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0, 9);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // one sculptural form, built from two overlapping wireframes for depth
    const group = new THREE.Group();

    const outerGeo = new THREE.TorusKnotGeometry(1.8, 0.5, 220, 20);
    const outerMat = new THREE.MeshBasicMaterial({
      color: accent,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    });
    const outer = new THREE.Mesh(outerGeo, outerMat);
    group.add(outer);

    const innerGeo = new THREE.IcosahedronGeometry(1.15, 1);
    const innerMat = new THREE.MeshBasicMaterial({
      color: line,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
    });
    const inner = new THREE.Mesh(innerGeo, innerMat);
    group.add(inner);

    scene.add(group);

    // a light scatter of faint distant points, just enough to suggest depth
    const dustGeo = new THREE.BufferGeometry();
    const dustCount = 40;
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 20;
      dustPos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 8;
    }
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      color: line,
      size: 0.03,
      transparent: true,
      opacity: 0.4,
    });
    const dust = new THREE.Points(dustGeo, dustMat);
    scene.add(dust);

    const resize = () => {
      const rect = section.getBoundingClientRect();
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
      renderer.setSize(rect.width, rect.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(section);

    const mouse = { x: 0, y: 0 };
    const onMove = (e) => {
      const rect = section.getBoundingClientRect();
      mouse.x = (e.clientX - rect.left) / rect.width - 0.5;
      mouse.y = (e.clientY - rect.top) / rect.height - 0.5;
    };
    section.addEventListener("mousemove", onMove);

    let visible = true;
    const io = new IntersectionObserver(
      ([entry]) => (visible = entry.isIntersecting),
      { threshold: 0 },
    );
    io.observe(section);

    let rafId;
    const clock = new THREE.Clock();

    const tick = () => {
      if (visible) {
        const t = clock.getElapsedTime();

        // slow autonomous spin, both shapes at different speeds for parallax between them
        outer.rotation.x = t * 0.08;
        outer.rotation.y = t * 0.06;
        inner.rotation.x = -t * 0.05;
        inner.rotation.y = t * 0.09;

        // whole group tilts gently toward the cursor
        group.rotation.y += (mouse.x * 0.6 - group.rotation.y) * 0.04;
        group.rotation.x += (-mouse.y * 0.4 - group.rotation.x) * 0.04;

        dust.rotation.y = t * 0.01;

        renderer.render(scene, camera);
      }
      if (!reduce) rafId = requestAnimationFrame(tick);
    };

    if (!reduce) {
      rafId = requestAnimationFrame(tick);
    } else {
      renderer.render(scene, camera);
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      ro.disconnect();
      io.disconnect();
      section.removeEventListener("mousemove", onMove);
      outerGeo.dispose();
      outerMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      dustGeo.dispose();
      dustMat.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, [targetRef]);

  return <div ref={mountRef} className="absolute inset-0" />;
}
