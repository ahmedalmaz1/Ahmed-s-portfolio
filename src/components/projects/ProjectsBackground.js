"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// each line lives at its own depth (z) so the mouse tilt visibly separates them
const LINES = [
  { top: "10%", rotate: -10, z: -120, driftSpeed: 55, opacity: 0.3 },
  { top: "28%", rotate: 7, z: -220, driftSpeed: -45, opacity: 0.2 },
  { top: "48%", rotate: -6, z: -60, driftSpeed: 80, opacity: 0.35 },
  { top: "68%", rotate: 12, z: -180, driftSpeed: -60, opacity: 0.22 },
  { top: "86%", rotate: -8, z: -140, driftSpeed: 40, opacity: 0.2 },
];

const NODES = [
  { top: "16%", left: "22%", z: 40 },
  { top: "34%", left: "78%", z: -60 },
  { top: "52%", left: "12%", z: 80 },
  { top: "70%", left: "65%", z: -30 },
  { top: "88%", left: "35%", z: 60 },
  { top: "22%", left: "50%", z: -90 },
];

export default function ProjectsBackground({ targetRef }) {
  const groupRef = useRef(null);
  const lineRefs = useRef([]);
  const nodeRefs = useRef([]);
  const tiltMove = useRef(null);
  const idleTl = useRef(null);

  useGSAP(
    () => {
      if (!targetRef.current) return;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // place lines/nodes at their depth immediately
        lineRefs.current.forEach((el, i) => {
          if (el) gsap.set(el, { z: LINES[i].z });
        });
        nodeRefs.current.forEach((el, i) => {
          if (el) gsap.set(el, { z: NODES[i].z });
        });

        // slow, continuous idle drift so it's alive with no input at all
        idleTl.current = gsap.timeline({ repeat: -1, yoyo: true });
        lineRefs.current.forEach((el, i) => {
          if (!el) return;
          idleTl.current.to(
            el,
            {
              xPercent: `+=${LINES[i].driftSpeed * 0.4}`,
              duration: 8 + i,
              ease: "sine.inOut",
            },
            i * 0.3,
          );
        });
        nodeRefs.current.forEach((el, i) => {
          if (!el) return;
          idleTl.current.to(
            el,
            {
              y: (i % 2 === 0 ? -1 : 1) * 18,
              duration: 6 + i * 0.7,
              ease: "sine.inOut",
            },
            i * 0.25,
          );
        });

        // scroll: additional horizontal drift + whole-field tilt
        gsap.fromTo(
          groupRef.current,
          { rotateX: 8, rotateZ: -2 },
          {
            rotateX: -8,
            rotateZ: 2,
            ease: "none",
            scrollTrigger: {
              trigger: targetRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.8,
            },
          },
        );
        lineRefs.current.forEach((el, i) => {
          if (!el) return;
          gsap.to(el, {
            xPercent: `+=${LINES[i].driftSpeed}`,
            ease: "none",
            scrollTrigger: {
              trigger: targetRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.8,
            },
          });
        });

        // continuous mouse-driven 3D tilt on the whole scene (the main "3D" feel)
        tiltMove.current = {
          rotateX: gsap.quickTo(groupRef.current, "rotateX", {
            duration: 0.9,
            ease: "power3",
          }),
          rotateY: gsap.quickTo(groupRef.current, "rotateY", {
            duration: 0.9,
            ease: "power3",
          }),
        };
      });
    },
    { scope: groupRef, dependencies: [targetRef] },
  );

  useEffect(() => {
    const section = targetRef.current;
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const onMove = (e) => {
      if (!tiltMove.current) return;
      const rect = section.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5; // -0.5..0.5
      const py = (e.clientY - rect.top) / rect.height - 0.5;

      // tilt the whole 3D field toward the cursor
      tiltMove.current.rotateY(px * 14);
      tiltMove.current.rotateX(-py * 10);
    };
    const onLeave = () => {
      tiltMove.current?.rotateX(0);
      tiltMove.current?.rotateY(0);
    };

    section.addEventListener("mousemove", onMove);
    section.addEventListener("mouseleave", onLeave);
    return () => {
      section.removeEventListener("mousemove", onMove);
      section.removeEventListener("mouseleave", onLeave);
    };
  }, [targetRef]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      style={{ perspective: "1000px" }}
    >
      <div
        ref={groupRef}
        className="absolute inset-[-15%]"
        style={{ transformStyle: "preserve-3d" }}
      >
        {LINES.map((line, i) => (
          <div
            key={i}
            ref={(el) => (lineRefs.current[i] = el)}
            className="absolute h-px w-[160%]"
            style={{
              top: line.top,
              left: "-30%",
              transform: `rotate(${line.rotate}deg)`,
              background:
                "linear-gradient(90deg, transparent, var(--color-line) 30%, var(--color-accent) 50%, var(--color-line) 70%, transparent)",
              opacity: line.opacity,
            }}
          />
        ))}

        {NODES.map((node, i) => (
          <span
            key={i}
            ref={(el) => (nodeRefs.current[i] = el)}
            className="absolute h-2 w-2 rounded-full bg-accent"
            style={{
              top: node.top,
              left: node.left,
              opacity: 0.75,
              boxShadow: "0 0 16px 3px var(--color-accent)",
            }}
          />
        ))}
      </div>

      <div
        className="absolute inset-0 opacity-10 mix-blend-overlay"
        style={{ backgroundImage: "var(--grain)" }}
      />
    </div>
  );
}
