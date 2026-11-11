"use client";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import { onReveal } from "@/components/PageTransition";
import { PROJECTS } from "@/data/projects";
import { pad } from "@/lib/format";
import ProjectCard from "@/components/project/ProjectCard";

export default function ProjectsIndex() {
  const root = useRef(null);

  useGSAP(
    () => {
      const lines = root.current.querySelectorAll("[data-line]");
      const fades = root.current.querySelectorAll("[data-fade]");
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reduce) {
        gsap.set(lines, { opacity: 1 });
        gsap.set(fades, { opacity: 1, y: 0 });
        return;
      }

      gsap.set(lines, { yPercent: 115, opacity: 1 });
      gsap.set(fades, { opacity: 0, y: 24 });

      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: "power4.out", force3D: true },
      });
      tl.to(lines, { yPercent: 0, duration: 1.4, stagger: 0.1 }, 0).to(
        fades,
        { opacity: 1, y: 0, duration: 1.1, stagger: 0.12 },
        0.35,
      );

      const off = onReveal(() => tl.play());
      return () => off();
    },
    { scope: root },
  );

  return (
    <>
      <Nav visible />

      <main
        ref={root}
        className="relative z-10 pb-[8vh] sm:pb-[10vh] text-white"
      >
        <header className="mx-(--gutter) pt-32 sm:pt-40 lg:pt-48">
          <div className="mx-auto max-w-6xl px-4 sm:px-10 xl:px-0">
            <p
              data-fade
              className="text-[11px] uppercase tracking-[0.35em] text-neutral-400 opacity-0"
            >
              Selected work
            </p>

            <h1 className="mt-6 text-5xl font-bold uppercase leading-[1.05] tracking-tight sm:text-7xl lg:text-8xl">
              <span className="block overflow-hidden pb-[0.12em]">
                <span data-line className="block opacity-0">
                  All Projects
                </span>
              </span>
            </h1>

            <div
              data-fade
              className="mt-8 flex items-center gap-4 text-xs uppercase tracking-[0.3em] text-neutral-400 opacity-0 sm:mt-10"
            >
              <span>{pad(PROJECTS.length)} Projects</span>
              <span className="h-px flex-1 bg-white/15" />
            </div>
          </div>
        </header>

        <div className="mx-(--gutter) mt-10 flex flex-col gap-3 sm:mt-14 sm:gap-4 lg:gap-6">
          {PROJECTS.map((p, i) => (
            <ProjectCard key={p.slug} project={p} index={i} priority={i < 2} />
          ))}
        </div>
      </main>

      <Footer />
    </>
  );
}
