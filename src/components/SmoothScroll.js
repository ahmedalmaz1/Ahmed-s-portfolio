"use client";
import { createContext, useContext, useEffect, useRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import gsap from "gsap";

gsap.registerPlugin(ScrollTrigger);

export const SCROLL_PRESETS = {
  hero: { lerp: 0.08, wheelMultiplier: 0.9 },
  site: { lerp: 0.04, wheelMultiplier: 0.3 },
};

const LenisContext = createContext({ current: null });
export const useLenis = () => useContext(LenisContext);

export function useScrollPreset(targetRef, { inside, outside, end }) {
  const lenisRef = useLenis();

  useEffect(() => {
    let active = null;

    const apply = (preset) => {
      const lenis = lenisRef.current;
      if (!lenis || active === preset) return;
      active = preset;
      Object.assign(lenis.options, preset);
    };

    const trigger = ScrollTrigger.create({
      trigger: targetRef.current,
      start: "top top",
      end,
      onUpdate: (self) => apply(self.progress < 1 ? inside : outside),
      onRefresh: (self) => apply(self.progress < 1 ? inside : outside),
    });

    return () => trigger.kill();
  }, [targetRef, lenisRef, inside, outside, end]);
}

export default function SmoothScroll({ children }) {
  const lenisRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({
      ...SCROLL_PRESETS.hero,
      touchMultiplier: 1.5,
      smoothWheel: true,
      syncTouch: false,
    });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return (
    <LenisContext.Provider value={lenisRef}>{children}</LenisContext.Provider>
  );
}
