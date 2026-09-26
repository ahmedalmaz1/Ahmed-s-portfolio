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
  const imgWrapRef = useRef(null);
  const copyRef = useRef(null);

  useGSAP(
    () => {
      if (!rootRef.current || !imgWrapRef.current || !copyRef.current) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(imgWrapRef.current, { autoAlpha: 0, x: -60 });
        gsap.set(copyRef.current.children, { autoAlpha: 0, x: 60 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top 82%",
            end: "top 42%",
            scrub: 0.7,
          },
        });

        tl.to(
          imgWrapRef.current,
          { autoAlpha: 1, x: 0, ease: "power3.out" },
          0,
        ).to(
          copyRef.current.children,
          { autoAlpha: 1, x: 0, stagger: 0.1, ease: "power3.out" },
          0.12,
        );
      });
    },
    { scope: rootRef },
  );

  return (
    <li
      ref={rootRef}
      className="flex flex-col items-start gap-8 md:flex-row md:items-center md:gap-16"
    >
      <Link
        href={`/projects/${project.slug}`}
        className="group block w-full md:w-[48%]"
      >
        <div
          ref={imgWrapRef}
          className="relative aspect-[16/9] w-full overflow-hidden  bg-surface will-change-transform"
        >
          {project.cover ? (
            <Image
              src={project.cover}
              alt={project.title}
              fill
              sizes="(min-width: 768px) 48vw, 100vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              priority={index === 0}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-muted">
              No image
            </div>
          )}
        </div>
      </Link>

      <div ref={copyRef} className="w-full md:w-[45%]">
        {/* <span className="font-mono text-xs text-accent">
          {String(index + 1).padStart(2, "0")}
        </span> */}
        <h3 className="mt-3 font-display text-[clamp(1.75rem,3vw,2.5rem)] font-bold leading-[1.05] tracking-[-0.02em] text-ink">
          {project.title}
        </h3>
        <p className="mt-4 max-w-md text-ink2">{project.summary}</p>
        <Link
          href={`/projects/${project.slug}`}
          className="group mt-5 inline-flex items-center gap-2 text-sm font-medium text-ink transition-colors hover:text-accent"
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
    </li>
  );
}
