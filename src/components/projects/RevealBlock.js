"use client";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function RevealBlock({
  children,
  className = "",
  tilt = 6,
  y = 36,
}) {
  const ref = useRef(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(ref.current, {
          autoAlpha: 0,
          y,
          rotateX: tilt,
          transformPerspective: 800,
          transformOrigin: "top center",
        });
        gsap.to(ref.current, {
          autoAlpha: 1,
          y: 0,
          rotateX: 0,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 88%",
            end: "top 55%",
            scrub: 0.6,
          },
        });
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={`will-change-transform ${className}`}>
      {children}
    </div>
  );
}
