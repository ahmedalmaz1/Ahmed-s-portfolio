"use client";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

const INTERACTIVE =
  'a, button, input, textarea, select, label, summary, [role="button"], [data-cursor]';

const RING_SCALE = { default: 1, hover: 1.28, view: 1.5 };
const DOT_SCALE_ON_HOVER = 0.6;
const RING_FOLLOW = 0.45;

export default function Cursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!fine.matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    const root = document.documentElement;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    root.classList.add("has-custom-cursor");

    gsap.set([dot, ring], { xPercent: -50, yPercent: -50, opacity: 0 });

    const dotX = gsap.quickTo(dot, "x", { duration: 0.05, ease: "power3" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.05, ease: "power3" });
    const ringDur = reduced ? 0 : RING_FOLLOW;
    const ringX = gsap.quickTo(ring, "x", {
      duration: ringDur,
      ease: "power3",
    });
    const ringY = gsap.quickTo(ring, "y", {
      duration: ringDur,
      ease: "power3",
    });

    let visible = false;
    const show = () => {
      if (visible) return;
      visible = true;
      gsap.to([dot, ring], { opacity: 1, duration: 0.25, overwrite: "auto" });
    };
    const hide = () => {
      visible = false;
      gsap.to([dot, ring], { opacity: 0, duration: 0.25, overwrite: "auto" });
    };

    const onMove = (e) => {
      if (!visible) gsap.set([dot, ring], { x: e.clientX, y: e.clientY }); // no fly-in
      show();
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
    };

    const setState = (ringScale, dotScale) => {
      gsap.to(ring, {
        scale: ringScale,
        duration: 0.3,
        ease: "power3.out",
        overwrite: "auto",
      });
      gsap.to(dot, {
        scale: dotScale,
        duration: 0.3,
        ease: "power3.out",
        overwrite: "auto",
      });
    };

    const onOver = (e) => {
      const target = e.target.closest?.(INTERACTIVE);
      if (!target) return setState(RING_SCALE.default, 1);
      const type = target.dataset.cursor;
      if (type === "hide") return hide();
      show();
      setState(
        type === "view" ? RING_SCALE.view : RING_SCALE.hover,
        DOT_SCALE_ON_HOVER,
      );
    };

    const onDown = () => gsap.to(ring, { scale: "*=0.85", duration: 0.15 });
    const onUp = () => gsap.to(ring, { scale: "/=0.85", duration: 0.25 });

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    root.addEventListener("mouseleave", hide);
    root.addEventListener("mouseenter", show);

    return () => {
      root.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      root.removeEventListener("mouseleave", hide);
      root.removeEventListener("mouseenter", show);
      gsap.killTweensOf([dot, ring]);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9999] [@media(hover:none)]:hidden"
    >
      <div
        ref={ringRef}
        className="absolute left-0 top-0 h-10 w-10 rounded-full border border-white mix-blend-difference will-change-transform"
      />
      <div
        ref={dotRef}
        className="absolute left-0 top-0 h-1 w-1 rounded-full bg-white mix-blend-difference will-change-transform"
      />
    </div>
  );
}
