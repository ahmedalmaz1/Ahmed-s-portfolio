"use client";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useLenis } from "./SmoothScroll";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Lives for the whole client session: survives client-side navigation
// (project page -> Back), resets on a real browser reload.
const FLAG = "loader-played";

const wasPlayed = () => {
  if (typeof window === "undefined") return false;
  try {
    // a real browser refresh should show the loader again
    const nav = performance.getEntriesByType("navigation")[0];
    if (nav?.type === "reload") {
      sessionStorage.removeItem(FLAG);
      return false;
    }
    return sessionStorage.getItem(FLAG) === "1";
  } catch {
    return false;
  }
};

// survives client navigation AND full page loads (e.g. a plain <a> link)
let played = wasPlayed();

export default function Loader({
  progress, // 0 → 1 (real)
  onReveal, // fires as the halves start opening (start hero intro here)
  onComplete, // fires when fully gone (unmount the loader)
  name = "ARTIST NAME",
  minTime = 1.5, // seconds, avoids a flash
  maxTime = 5, // seconds, never trap the user
}) {
  const skip = played;

  const root = useRef(null);
  const content = useRef(null);
  const topHalf = useRef(null);
  const botHalf = useRef(null);
  const countEl = useRef(null);
  const barEl = useRef(null);
  const shown = useRef({ v: 0 });
  const exited = useRef(false);
  const lenisRef = useLenis();

  const [minDone, setMinDone] = useState(false);
  const [forced, setForced] = useState(false);
  const ready = (progress >= 1 && minDone) || forced;

  // already played this session: skip straight to the page
  useEffect(() => {
    if (!skip) return;
    onReveal?.();
    onComplete?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // timers
  useEffect(() => {
    if (skip) return;
    const a = setTimeout(() => setMinDone(true), minTime * 1000);
    const b = setTimeout(() => setForced(true), maxTime * 1000);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [skip, minTime, maxTime]);

  // lock scroll while loading
  useEffect(() => {
    if (skip) return;
    window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    document.documentElement.style.overflow = "hidden";
    // Lenis is created by the parent's effect, which runs after this one
    const id = requestAnimationFrame(() => lenisRef.current?.stop());
    return () => {
      cancelAnimationFrame(id);
      // never leave the page locked if we unmount early
      document.documentElement.style.overflow = "";
    };
  }, [skip, lenisRef]);

  // intro
  useGSAP(
    () => {
      if (skip) return;
      gsap.from(content.current, {
        opacity: 0,
        y: 24,
        duration: 1,
        ease: "power3.out",
      });
    },
    { scope: root },
  );

  // exit sequence
  const exit = () => {
    if (exited.current) return;
    exited.current = true;

    gsap
      .timeline({
        onComplete: () => {
          played = true;
          try {
            sessionStorage.setItem(FLAG, "1");
          } catch {}
          document.documentElement.style.overflow = "";
          lenisRef.current?.start();
          ScrollTrigger.refresh();
          onComplete?.();
        },
      })
      .to(content.current, {
        opacity: 0,
        y: -20,
        duration: 0.5,
        ease: "power2.in",
      })
      .to(
        topHalf.current,
        { yPercent: -100, duration: 1.1, ease: "expo.inOut" },
        "+=0.1",
      )
      .to(
        botHalf.current,
        { yPercent: 100, duration: 1.1, ease: "expo.inOut" },
        "<",
      )
      .add(() => onReveal?.(), "<0.35");
  };

  // smooth counter + bar
  useEffect(() => {
    if (skip) return;
    const target = ready ? 100 : Math.min(progress * 100, 99);
    gsap.to(shown.current, {
      v: target,
      duration: 0.5,
      ease: "power2.out",
      overwrite: true,
      onUpdate: () => {
        const v = shown.current.v;
        countEl.current.textContent = String(Math.round(v)).padStart(3, "0");
        barEl.current.style.transform = `scaleX(${v / 100})`;
      },
      onComplete: () => {
        if (ready) exit();
      },
    });
    return () => gsap.killTweensOf(shown.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip, progress, ready]);

  if (skip) return null;

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[100] text-neutral-200"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      {/* the two halves that open */}
      <div ref={topHalf} className="absolute inset-x-0 top-0 h-1/2 bg-black" />
      <div
        ref={botHalf}
        className="absolute inset-x-0 bottom-0 h-1/2 bg-black"
      />

      {/* soft fog glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 50%, rgba(255,120,60,0.07), transparent 70%)",
        }}
      />

      {/* content */}
      <div
        ref={content}
        className="absolute inset-0 flex flex-col items-center justify-center gap-8 px-6"
      >
        <h1 className="text-center text-sm font-light uppercase tracking-[0.5em] sm:text-lg">
          {name}
        </h1>

        <div className="w-48 sm:w-72">
          <div className="h-px w-full bg-white/15">
            <div
              ref={barEl}
              className="h-px origin-left bg-amber-400"
              style={{ transform: "scaleX(0)" }}
            />
          </div>
          <div className="mt-3 flex justify-between font-mono text-[10px] tracking-widest text-neutral-500">
            <span>LOADING</span>
            <span ref={countEl} className="tabular-nums">
              000
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
