"use client";
import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import ProjectCard from "./ProjectCard";
import { PROJECTS } from "@/data/projects";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function Projects() {
  const root = useRef(null);

  useGSAP(
    () => {
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const heading = root.current.querySelector("[data-heading]");
      const more = root.current.querySelector("[data-more]");
      const rules = root.current.querySelectorAll("[data-rule]");
      const cta = root.current.querySelector("[data-cta]");

      if (reduce) {
        gsap.set([heading, cta], { opacity: 1, y: 0 });
        gsap.set(rules, { scaleX: 1 });
        return;
      }

      const reveal = (trigger, start, end, build) => {
        const tl = gsap.timeline({
          paused: true,
          defaults: { ease: "power4.out", force3D: true },
        });
        build(tl);
        ScrollTrigger.create({
          trigger,
          start,
          end,
          onEnter: () => tl.timeScale(1).play(),
          onEnterBack: () => tl.timeScale(1).play(),
          onLeave: () => tl.timeScale(1.8).reverse(),
          onLeaveBack: () => tl.timeScale(1.8).reverse(),
        });
      };

      gsap.set(heading, { opacity: 0, y: 24 });
      reveal(heading, "top 92%", "bottom 8%", (tl) =>
        tl.to(heading, { opacity: 1, y: 0, duration: 1 }),
      );

      gsap.set(rules, {
        scaleX: 0,
        transformOrigin: (i) => (i === 0 ? "100% 50%" : "0% 50%"),
      });
      gsap.set(cta, { opacity: 0, y: 24 });
      reveal(more, "top 95%", "bottom 5%", (tl) =>
        tl
          .to(rules, { scaleX: 1, duration: 1.4, ease: "power3.inOut" }, 0)
          .to(cta, { opacity: 1, y: 0, duration: 1 }, 0.5),
      );
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="projects"
      className="relative z-10 pb-[35vh] pt-8 text-white sm:pt-10 lg:pt-12"
    >
      <div className="mx-(--gutter)">
        
        <div className="mx-auto mb-10 mt-6 flex max-w-6xl flex-col items-center justify-center px-4 sm:mb-14 sm:mt-8 sm:px-10 lg:mb-16 lg:mt-12 xl:px-0">
          <div data-heading className="opacity-0">
            <h2 className="mt-6 max-w-3xl text-3xl font-bold uppercase leading-[1.15] tracking-tight sm:text-5xl lg:text-6xl">
              Projects
            </h2>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:gap-4 lg:gap-6">
          {PROJECTS.map((p, i) => (
            <ProjectCard
              key={p.title}
              project={p}
              index={i}
              priority={i === 0}
            />
          ))}
        </div>

        <div
          data-more
          className="mt-8 flex items-center justify-center gap-4 sm:mt-10 sm:gap-6 lg:mt-14"
        >
          <span data-rule className="h-px flex-1 bg-white/15" />

          <Link
            data-cta
            href="/projects"
            className="group/cta relative inline-flex shrink-0 items-center gap-3 overflow-hidden rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white opacity-0 transition-colors duration-500 hover:border-accent hover:text-bg"
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 origin-left scale-x-0 bg-accent transition-transform duration-500 ease-out group-hover/cta:scale-x-100"
            />
            <span className="relative">See all projects</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="relative transition-transform duration-500 group-hover/cta:translate-x-1"
            >
              <path d="M5 12h14" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </Link>

          <span data-rule className="h-px flex-1 bg-white/15" />
        </div>
      </div>
    </section>
  );
}
