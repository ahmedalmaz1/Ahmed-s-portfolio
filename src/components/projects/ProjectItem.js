"use client";
import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function ProjectRow({ project, index }) {
  const rootRef = useRef(null);
  const cardRef = useRef(null);
  const glassRef = useRef(null);
  const imgWrapRef = useRef(null);
  const copyRef = useRef(null);

  useGSAP(
    () => {
      const card = cardRef.current;
      const glass = glassRef.current;
      const img = imgWrapRef.current;
      const copy = copyRef.current;

      if (!rootRef.current || !card || !glass || !img || !copy) return;

      const mm = gsap.matchMedia();

      mm.add(
        {
          desktop: "(min-width: 768px)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { desktop, reduce } = ctx.conditions;
          if (reduce) return;

          const k = desktop ? 1 : 0.55;
          const col = index % 2;
          const dir = col === 0 ? 1 : -1;

          gsap.set(card, {
            transformPerspective: 1300,
            transformOrigin: "50% 60%",
          });

          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: rootRef.current,
              start: desktop ? `top ${100 - col * 7}%` : "top 100%",
              end: "bottom 0%",
              scrub: 0.8,
            },
          });

          tl.fromTo(
            card,
            {
              rotateX: 42 * k,
              rotateY: -16 * dir * k,
              rotateZ: 3 * dir * k,
              z: -300 * k,
              y: 120 * k,
            },
            {
              rotateX: 0,
              rotateY: 0,
              rotateZ: 0,
              z: 0,
              y: 0,
              ease: "power2.out",
              duration: 0.4,
            },
            0,
          )
            .fromTo(glass, { opacity: 0 }, { opacity: 1, duration: 0.22 }, 0)
            .fromTo(img, { opacity: 0 }, { opacity: 1, duration: 0.22 }, 0.04)
            .fromTo(copy, { opacity: 0 }, { opacity: 1, duration: 0.22 }, 0.1)
            .to(
              card,
              {
                rotateX: -24 * k,
                rotateY: 12 * dir * k,
                rotateZ: -2 * dir * k,
                z: -220 * k,
                y: -90 * k,
                ease: "power2.in",
                duration: 0.4,
              },
              0.6,
            )
            .to(
              [glass, img, copy],
              {
                opacity: 0,
                duration: 0.25,
              },
              0.75,
            );
        },
      );

      return () => mm.revert();
    },
    {
      scope: rootRef,
      dependencies: [index],
    },
  );

  return (
    <li ref={rootRef} className="h-full">
      <div
        ref={cardRef}
        className="relative flex h-full flex-col overflow-hidden rounded-md will-change-transform "
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Transparent glass background */}
        <div
          ref={glassRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-md bg-surface/5 backdrop-blur-xs"
        />

        {/* Card content */}
        <div
          className="relative flex flex-1 flex-col"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Image */}
          <Link
            href={`/projects/${project.slug}`}
            className="group block w-full"
            style={{ transform: "translateZ(22px)" }}
          >
            <div
              ref={imgWrapRef}
              className="
                relative
                aspect-[16/9]
                w-full
                overflow-hidden
              "
            >
              {project.cover ? (
                <Image
                  src={project.cover}
                  alt={project.title}
                  fill
                  sizes="(min-width: 768px) 45vw, 100vw"
                  className="
                    object-cover
                    transition-transform
                    duration-700
                    ease-out
                    group-hover:scale-[1.04]
                  "
                  priority={index < 2}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-muted">
                  No image
                </div>
              )}
            </div>
          </Link>

          {/* Details — same width as image + padding */}
          {/* <div
            ref={copyRef}
            className="
              flex
              min-h-[220px]
              w-full
              flex-1
              flex-col
              items-start
              p-6
              md:p-7
            "
            style={{ transform: "translateZ(40px)" }}
          >
            <h3
              className="
                font-display
                text-[clamp(1.4rem,2.2vw,2rem)]
                font-bold
                leading-[1.05]
                tracking-[-0.02em]
                text-ink
              "
            >
              {project.title}
            </h3>

            <p className="mt-3 max-w-md text-ink2">{project.summary}</p>

            <Link
              href={`/projects/${project.slug}`}
              className="
                group
                mt-auto
                inline-flex
                items-center
                gap-2
                pt-5
                text-sm
                font-medium
                text-ink
                transition-colors
                hover:text-accent
              "
            >
              View project
              <span
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          </div>

           */}
        </div>
      </div>
    </li>
  );
}
