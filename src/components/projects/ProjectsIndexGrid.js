"use client";
import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";

// cycles through a few row-heights so the grid doesn't look like a flat table
const SPANS = ["row-span-5", "row-span-6", "row-span-5", "row-span-7"];

export default function ProjectsIndexGrid({ projects }) {
  return (
    <ul
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 md:gap-6"
      style={{ gridAutoRows: "2.5vw" }}
    >
      {projects.map((project, i) => (
        <ProjectTile
          key={project.slug}
          project={project}
          className={SPANS[i % SPANS.length]}
        />
      ))}
    </ul>
  );
}

function ProjectTile({ project, className }) {
  const cardRef = useRef(null);

  // a light cursor-driven tilt, disabled for touch/reduced-motion via CSS media query below
  const onMove = (e) => {
    const el = cardRef.current;
    if (!el || window.matchMedia("(pointer: coarse)").matches) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty("--rx", `${(-py * 6).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(px * 6).toFixed(2)}deg`);
  };
  const onLeave = () => {
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  return (
    <li className={className}>
      <Link
        ref={cardRef}
        href={`/projects/${project.slug}`}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="group relative block h-full w-full overflow-hidden rounded-2xl bg-surface transition-transform duration-300 ease-out motion-reduce:!transform-none"
        style={{
          transform:
            "perspective(900px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))",
        }}
      >
        {project.cover ? (
          <Image
            src={project.cover}
            alt={project.title}
            fill
            sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-muted">
            No image
          </div>
        )}

        {/* dark reveal overlay */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-bg/0 transition-colors duration-300 group-hover:bg-bg/70"
        />

        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:p-7">
          <span className="font-mono text-xs text-accent">
            {String(project.index + 1).padStart(2, "0")}
          </span>

          <div className="flex items-end justify-between gap-4">
            <div>
              <h3 className="font-display text-2xl font-bold italic leading-tight tracking-[-0.01em] text-ink md:text-3xl">
                {project.title}
              </h3>
              <p className="mt-2 max-w-[22ch] text-sm text-ink2">
                {project.summary}
              </p>
            </div>

            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-accent bg-bg/60 text-xs font-medium text-accent backdrop-blur-sm">
              View
            </span>
          </div>
        </div>

        {/* bare title strip for mobile / no-hover devices */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg/90 to-transparent p-5 opacity-100 transition-opacity duration-300 group-hover:opacity-0"
        >
          <h3 className="font-display text-lg font-bold text-ink">
            {project.title}
          </h3>
        </div>
      </Link>
    </li>
  );
}
