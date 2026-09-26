"use client";
import { useEffect, useRef } from "react";

const PARTICLE_COUNT = 46;
const LINK_DISTANCE = 140;
const MOUSE_RADIUS = 160;

export default function ProjectsBackground({ targetRef }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef();
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = targetRef.current;
    if (!canvas || !section) return;

    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const styles = getComputedStyle(document.documentElement);
    const lineColor =
      styles.getPropertyValue("--color-line").trim() || "#1D4A52";
    const accentColor =
      styles.getPropertyValue("--color-accent").trim() || "#F0B341";

    const resize = () => {
      const rect = section.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      sizeRef.current = { w: rect.width, h: rect.height, dpr };
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const makeParticles = () => {
      const { w, h } = sizeRef.current;
      particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.6 + 0.8,
      }));
    };

    resize();
    makeParticles();

    const ro = new ResizeObserver(() => {
      resize();
    });
    ro.observe(section);

    const onMove = (e) => {
      const rect = section.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };
    section.addEventListener("mousemove", onMove);
    section.addEventListener("mouseleave", onLeave);

    let visible = true;
    const io = new IntersectionObserver(
      ([entry]) => (visible = entry.isIntersecting),
      { threshold: 0 },
    );
    io.observe(section);

    const tick = () => {
      const { w, h } = sizeRef.current;
      const particles = particlesRef.current;
      const mouse = mouseRef.current;

      if (visible) {
        ctx.clearRect(0, 0, w, h);

        // move + draw particles
        particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > w) p.vx *= -1;
          if (p.y < 0 || p.y > h) p.vy *= -1;

          // gentle push away from the cursor
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < MOUSE_RADIUS) {
            const force = (1 - dist / MOUSE_RADIUS) * 0.6;
            p.vx += (dx / (dist || 1)) * force * 0.05;
            p.vy += (dy / (dist || 1)) * force * 0.05;
          }
          // gentle speed cap so it never runs away
          const speed = Math.hypot(p.vx, p.vy);
          const max = 0.6;
          if (speed > max) {
            p.vx = (p.vx / speed) * max;
            p.vy = (p.vy / speed) * max;
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = accentColor;
          ctx.globalAlpha = 0.7;
          ctx.fill();
          ctx.globalAlpha = 1;
        });

        // connecting lines between nearby particles
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const a = particles[i];
            const b = particles[j];
            const dist = Math.hypot(a.x - b.x, a.y - b.y);
            if (dist < LINK_DISTANCE) {
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.strokeStyle = lineColor;
              ctx.globalAlpha = (1 - dist / LINK_DISTANCE) * 0.5;
              ctx.lineWidth = 1;
              ctx.stroke();
              ctx.globalAlpha = 1;
            }
          }
        }

        // lines from particles to the cursor
        particles.forEach((p) => {
          const dist = Math.hypot(p.x - mouse.x, p.y - mouse.y);
          if (dist < MOUSE_RADIUS) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = accentColor;
            ctx.globalAlpha = (1 - dist / MOUSE_RADIUS) * 0.4;
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        });
      }

      if (!reduce) rafRef.current = requestAnimationFrame(tick);
    };

    if (!reduce) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      tick(); // draw one static frame for reduced-motion users
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      io.disconnect();
      section.removeEventListener("mousemove", onMove);
      section.removeEventListener("mouseleave", onLeave);
    };
  }, [targetRef]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div
        className="absolute inset-0 opacity-10 mix-blend-overlay"
        style={{ backgroundImage: "var(--grain)" }}
      />
    </div>
  );
}
