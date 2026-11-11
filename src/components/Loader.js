"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useLenis } from "@/components/SmoothScroll";
import { start as startSound, setPreference } from "@/lib/ambient";

const FLAG = "loader-played";

const wasPlayed = () => {
  if (typeof window === "undefined") return false;
  try {
    const nav = performance.getEntriesByType("navigation")[0];
    if (nav?.type === "reload" && window.location.pathname === "/") {
      sessionStorage.removeItem(FLAG);
      return false;
    }
    return sessionStorage.getItem(FLAG) === "1";
  } catch {
    return false;
  }
};

let played = wasPlayed();

// The server always renders the loader; the client reads the flag through
// useSyncExternalStore so a revisit hydrates without a mismatch.
const subscribeNone = () => () => {};
const getPlayed = () => played;
const getPlayedOnServer = () => false;

export default function Loader({
  progress, // 0 → 1 (real)
  onComplete, // fires when fully gone (unmount the loader)
  name = "ARTIST NAME",
  minTime = 1.5, // seconds, avoids a flash
  maxTime = 5, // seconds, never trap the user
  soundGate = true, // ask "with / without sound" before entering
}) {
  const skip = useSyncExternalStore(
    subscribeNone,
    getPlayed,
    getPlayedOnServer,
  );

  const root = useRef(null);
  const content = useRef(null);
  const topHalf = useRef(null);
  const botHalf = useRef(null);
  const glow = useRef(null);
  const countEl = useRef(null);
  const barEl = useRef(null);
  const shown = useRef({ v: 0 });
  const exited = useRef(false);
  const lenisRef = useLenis();

  const [minDone, setMinDone] = useState(false);
  const [forced, setForced] = useState(false);
  const [gate, setGate] = useState(false);
  const gateEl = useRef(null);
  const ready = (progress >= 1 && minDone) || forced;

  // already played in this tab: hand control back straight away
  useEffect(() => {
    if (played) onComplete?.();
  }, [onComplete]);

  // timers
  useEffect(() => {
    if (played) return;
    const a = setTimeout(() => setMinDone(true), minTime * 1000);
    const b = setTimeout(() => setForced(true), maxTime * 1000);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [minTime, maxTime]);

  useEffect(() => {
    if (played) return;
    window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    document.documentElement.style.overflow = "hidden";
    const id = requestAnimationFrame(() => lenisRef.current?.stop());
    return () => {
      cancelAnimationFrame(id);
      document.documentElement.style.overflow = "";
    };
  }, [lenisRef]);

  useGSAP(
    () => {
      if (played) return;
      gsap.from(content.current, {
        opacity: 0,
        y: 24,
        duration: 1,
        ease: "power3.out",
      });
    },
    { scope: root },
  );

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
      // the warm glow must fade out too, otherwise it sits on top of the hero
      // and disappears in one frame when the loader unmounts
      .to(glow.current, { opacity: 0, duration: 0.5, ease: "power2.in" }, "<")
      .to(
        topHalf.current,
        { yPercent: -100, duration: 1.1, ease: "expo.inOut" },
        "+=0.1",
      )
      .to(
        botHalf.current,
        { yPercent: 100, duration: 1.1, ease: "expo.inOut" },
        "<",
      );
  };

  useEffect(() => {
    if (played) return;
    const counter = shown.current;
    const target = ready ? 100 : Math.min(progress * 100, 99);
    gsap.to(counter, {
      v: target,
      duration: 0.5,
      ease: "power2.out",
      overwrite: true,
      onUpdate: () => {
        const v = counter.v;
        countEl.current.textContent = String(Math.round(v)).padStart(3, "0");
        barEl.current.style.transform = `scaleX(${v / 100})`;
      },
      onComplete: () => {
        if (!ready) return;
        if (soundGate) setGate(true);
        else exit();
      },
    });
    return () => gsap.killTweensOf(counter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress, ready]);

  useEffect(() => {
    if (!gate) return;
    gsap.from(gateEl.current, {
      opacity: 0,
      y: 14,
      duration: 0.9,
      ease: "power3.out",
    });
    gateEl.current.querySelector("button")?.focus({ preventScroll: true });
  }, [gate]);

  const choose = (withSound) => {
    if (withSound) startSound();
    else setPreference("off");
    exit();
  };

  if (skip) return null;

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[100] text-ink"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div
        ref={topHalf}
        className="grain absolute inset-x-0 top-0 h-1/2 bg-bg"
      />
      <div
        ref={botHalf}
        className="grain absolute inset-x-0 bottom-0 h-1/2 bg-bg"
      />

      <div
        ref={glow}
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 50%, rgba(120,160,190,0.09), transparent 70%)",
        }}
      />

      <div
        ref={content}
        className="absolute inset-0 flex flex-col items-center justify-center gap-8 px-6"
      >
        <h1 className="text-center text-sm font-light uppercase tracking-[0.5em] sm:text-lg">
          {name}
        </h1>

        <div className="w-48 sm:w-72">
          <div className="h-px w-full bg-ink/15">
            <div
              ref={barEl}
              className="h-px origin-left bg-accent"
              style={{ transform: "scaleX(0)" }}
            />
          </div>
          <div className="mt-3 flex justify-between font-mono text-[10px] tracking-widest text-ink/45">
            <span>LOADING</span>
            <span ref={countEl} className="tabular-nums">
              000
            </span>
          </div>
        </div>

        {gate && (
          <div
            ref={gateEl}
            className="flex flex-col items-center gap-5 sm:flex-row sm:gap-8"
          >
            <button
              type="button"
              onClick={() => choose(true)}
              className="rounded-full border border-ink/30 px-7 py-3 text-xs uppercase tracking-[0.3em] text-ink transition-colors duration-500 hover:border-accent hover:bg-accent hover:text-bg"
            >
              Enter with sound
            </button>
            <button
              type="button"
              onClick={() => choose(false)}
              className="text-xs uppercase tracking-[0.3em] text-ink/50 transition-colors duration-300 hover:text-ink"
            >
              Enter without sound
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
