import Image from "next/image";
import Link from "next/link";
import { PROJECTS } from "@/lib/projects";
import { getYouTubeMeta } from "@/lib/youtube";
import RevealBlock from "./RevealBlock";
import YouTubeFacade from "./YouTubeFacade";

export default async function ProjectDetail({ project }) {
  const index = PROJECTS.findIndex((p) => p.slug === project.slug);
  const next = PROJECTS[(index + 1) % PROJECTS.length];

  const videoMeta = project.video ? await getYouTubeMeta(project.video) : null;

  return (
    <main>
      {/* full-bleed hero with title overlay */}
      <section className="relative flex h-[70svh] min-h-[420px] items-end overflow-hidden md:h-[85svh]">
        <Image
          src={project.cover}
          alt={project.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-bg via-bg/30 to-transparent"
        />
        <div className="relative z-10 w-full px-5 pb-10 sm:px-8 md:px-16 md:pb-14">
          <div className="mx-auto max-w-[1240px]">
            <Link
              href="/#projects"
              className="inline-flex items-center gap-2 text-sm text-ink2 transition-colors hover:text-accent"
            >
              ← Back to projects
            </Link>
            <h1 className="mt-4 max-w-3xl font-display text-[clamp(2.25rem,6vw,4.5rem)] font-bold leading-[1.02] tracking-[-0.02em] text-ink">
              {project.title}
            </h1>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1240px] px-5 sm:px-8 md:px-16">
        <RevealBlock
          tilt={3}
          y={24}
          className="grid grid-cols-1 gap-8 border-b border-line py-14 md:grid-cols-[1fr_2.4fr] md:gap-16 md:py-20"
        >
          <div className="flex flex-col gap-8 md:sticky md:top-28 md:self-start">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
                Overview
              </p>
              <p className="mt-2 text-ink2">{project.summary}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
                Tools
              </p>
              <p className="mt-2 text-sm text-ink2">{project.stack}</p>
            </div>
            {project.links?.length > 0 && (
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
                  Links
                </p>
                <ul className="mt-2 flex flex-col gap-2">
                  {project.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="inline-flex items-center gap-1.5 text-sm text-ink transition-colors hover:text-accent"
                      >
                        {link.label}
                        <span aria-hidden="true">↗</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div>
            <p className="text-xl leading-relaxed text-ink md:text-2xl">
              {project.description}
            </p>
          </div>
        </RevealBlock>

        {project.images?.length > 0 && (
          <div className="flex flex-col gap-6 py-14 md:gap-8 md:py-20">
            {project.images.map((src, i) => (
              <RevealBlock key={src} tilt={5} y={36}>
                <div className="relative aspect-[18/10] w-full overflow-hidden  bg-surface shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)]">
                  <Image
                    src={src}
                    alt={`${project.title} — image ${i + 1}`}
                    fill
                    sizes="(min-width: 768px) 90vw, 100vw"
                    className="object-cover"
                    loading={i === 0 ? "eager" : "lazy"}
                  />
                </div>
              </RevealBlock>
            ))}
          </div>
        )}

        {project.video && (
          <RevealBlock tilt={3} y={24} className="pb-14 md:pb-20">
            <p className="mb-5 text-xs font-medium uppercase tracking-[0.14em] text-muted">
              Cinematic
            </p>
            <YouTubeFacade
              url={project.video}
              title={videoMeta?.title ?? `${project.title} — Cinematic`}
              channel={videoMeta?.channel}
            />
          </RevealBlock>
        )}
      </div>

      <Link
        href={`/projects/${next.slug}`}
        className="group relative flex h-[45svh] min-h-[280px] items-center justify-center overflow-hidden border-t border-line"
      >
        <Image
          src={next.cover}
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-30 transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-bg/70" />
        <div className="relative z-10 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
            Next project
          </p>
          <p className="mt-3 font-display text-[clamp(1.75rem,4vw,3rem)] font-bold tracking-[-0.02em] text-ink transition-colors group-hover:text-accent">
            {next.title}
          </p>
        </div>
      </Link>
    </main>
  );
}
