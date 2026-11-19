"use client";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/* Shared "liquid tide" button (About CV buttons, "See all projects", ...).
   Cousin of the round social buttons in Contact: same ring + liquid fill +
   magnetic pull, but the tide comes in sideways (left to right) with a wavy
   leading edge, and the content flips to dark ink as the liquid passes under it.
   The dark copy slides the opposite way inside the moving layer, so it stays
   perfectly still and is simply revealed by the liquid (no timing drift).

   Props
   - as:           element/component to render (default "a"; pass TransitionLink
                   for internal links)
   - shape:        "pill" (label + icon) or "circle" (icon only)
   - className:    extra classes for the link (e.g. a dark blurred backdrop when
                   the button sits over photos)
   - wrapperProps: props for the outer span (e.g. data-* hooks for GSAP reveals)
   - everything else (href, target, rel, download, aria-label, title...) goes
     to the link itself. */

const EASE_TIDE = "ease-[cubic-bezier(0.65,0,0.2,1)]";
const WAVE_V =
  "M0 0H5Q10 12.5 5 25T5 50T5 75T5 100T5 125T5 150T5 175T5 200H0Z";

export default function LiquidButton({
  as: Tag = "a",
  shape = "pill",
  wrapperProps,
  className = "",
  children,
  ...linkProps
}) {
  const el = useRef(null);

  useEffect(() => {
    const node = el.current;
    return () => gsap.killTweensOf(node);
  }, []);

  const move = (e) => {
    if (e.pointerType !== "mouse") return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.current.getBoundingClientRect();
    gsap.to(el.current, {
      x: (e.clientX - (r.left + r.width / 2)) * 0.18,
      y: (e.clientY - (r.top + r.height / 2)) * 0.25,
      duration: 0.4,
      ease: "power3.out",
      overwrite: "auto",
    });
  };

  const leave = () =>
    gsap.to(el.current, {
      x: 0,
      y: 0,
      duration: 0.9,
      ease: "elastic.out(1, 0.45)",
      overwrite: "auto",
    });

  const pill = shape === "pill";
  const size = pill
    ? "px-6 py-3 text-xs font-bold uppercase tracking-[0.3em]"
    : "size-[46px]";

  const { className: wrapperClass = "", ...wrapperRest } = wrapperProps ?? {};

  return (
    <span {...wrapperRest} className={`inline-flex ${wrapperClass}`}>
      <span
        ref={el}
        onPointerMove={move}
        onPointerLeave={leave}
        className="inline-flex"
      >
        <Tag
          {...linkProps}
          className={`cv-btn group/cv relative isolate inline-flex items-center justify-center rounded-full text-white transition-shadow duration-700 hover:shadow-[0_0_28px_rgba(255,255,255,0.16)] focus-visible:shadow-[0_0_28px_rgba(255,255,255,0.16)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white ${size} ${className}`}
        >
          {/* ring */}
          <span
            aria-hidden="true"
            className="absolute inset-0 z-20 rounded-full border border-white/20 transition-colors duration-700 group-hover/cv:border-white group-focus-visible/cv:border-white"
          />

          {/* base content (white) */}
          <span
            className={`relative z-0 flex items-center justify-center gap-3 ${pill ? "" : "h-full w-full"}`}
          >
            {children}
          </span>

          {/* tide: slides in from the left, wavy edge on its right side */}
          <span
            aria-hidden="true"
            className="absolute inset-0 z-10 overflow-hidden rounded-full"
          >
            <span
              className={`absolute inset-0 -translate-x-[calc(100%+7px)] transition-transform duration-[900ms] ${EASE_TIDE} group-hover/cv:translate-x-0 group-focus-visible/cv:translate-x-0`}
            >
              <svg
                viewBox="0 0 10 100"
                preserveAspectRatio="none"
                className="absolute left-full top-0 h-full w-[7px]"
              >
                <path d={WAVE_V} fill="#fff">
                  <animateTransform
                    attributeName="transform"
                    type="translate"
                    from="0 0"
                    to="0 -50"
                    dur="1.8s"
                    repeatCount="indefinite"
                  />
                </path>
              </svg>
              <span className="absolute inset-0 overflow-hidden bg-white">
                {/* dark copy, counter-moving so it never shifts */}
                <span
                  style={{ color: "#050a0f" }}
                  className={`absolute inset-0 flex translate-x-[calc(100%+7px)] items-center justify-center gap-3 transition-transform duration-[900ms] ${EASE_TIDE} group-hover/cv:translate-x-0 group-focus-visible/cv:translate-x-0`}
                >
                  {children}
                </span>
              </span>
            </span>
          </span>
        </Tag>
      </span>
    </span>
  );
}