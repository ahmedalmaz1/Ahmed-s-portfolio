"use client";
import { useRef } from "react";
import Link from "next/link";
import ProjectRow from "./ProjectItem";
import ProjectsBackground from "./ProjectsBackground";

export default function ProjectsGallery({ projects }) {
  const sectionRef = useRef(null);

  return (
    <section
      ref={sectionRef}
      id="projects"
      className="relative overflow-hidden py-[clamp(88px,14vw,180px)]"
    >
      <ProjectsBackground targetRef={sectionRef} />

      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 md:px-16">
        {" "}
        <h2 className="font-display text-[clamp(2rem,4.4vw,3.5rem)] font-bold leading-[1.05] tracking-[-0.02em]">
          Selected work
        </h2>
        <p className="mt-4 max-w-xl text-ink2">
          Environments and cinematics, from blockout to final render.
        </p>
        <ul className="mt-16 flex flex-col gap-14 md:gap-20">
          {projects.slice(0, 3).map((project, i) => (
            <ProjectRow key={project.slug} project={project} index={i} />
          ))}
        </ul>
        <div className="mt-20 flex justify-center">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 rounded-full border border-line px-7 py-3 text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent"
          >
            See all projects
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
