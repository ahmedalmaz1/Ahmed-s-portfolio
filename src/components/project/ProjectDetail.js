"use client";
import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useLenis } from "@/components/SmoothScroll";
import { useGoBack } from "./ScrollRestoration";
import ImageTile from "./ImageTile";
import YouTubeEmbed from "./YouTubeEmbed";
import Lightbox from "./Lightbox";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* ---------- constants ---------- */
const DESKTOP_QUERY =
  "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";
const SHOT_H = "[--h:62svh] sm:[--h:68svh] lg:[--h:86svh]";
const CARD_H = "h-[34svh] sm:h-[40svh] lg:h-[54svh]";
const PACE = 1.5;
const DIM = 0.6;
const GLYPH_ON = "#050a0f";
const GLYPH_OFF = "#ffffff";

const pad = (n) => String(n).padStart(2, "0");

/* ---------- small static pieces (memoized: never re-render on lightbox toggle) ---------- */
const Icon = memo(function Icon({ children, size = 16, fill = false }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill ? "currentColor" : "none"}
      stroke={fill ? "none" : "currentColor"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
});

const Toolkit = memo(function Toolkit({ tools }) {
  if (!tools?.length) return null;
  return (
    <div data-intro className="mt-8 max-w-lg border-t border-white/10 pt-6">
      <p className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">
        Toolkit
      </p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {tools.map((t) => (
          <li
            key={t}
            className="rounded-full border border-white/15 px-3.5 py-1.5 text-xs text-white/90 sm:text-sm"
          >
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
});

const NextCard = memo(function NextCard({ next }) {
  return (
    <Link
      href={next.href}
      data-reveal
      className={`group relative block w-[86vw] overflow-hidden rounded-[1.25rem] bg-bg sm:w-[70vw] sm:rounded-[1.75rem] lg:w-[60vw] lg:rounded-[2.5rem] ${CARD_H}`}
    >
      <Image
        src={next.image}
        alt=""
        fill
        sizes="(min-width: 1024px) 60vw, 86vw"
        className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-105"
      />
      <span className="absolute inset-0 bg-linear-to-r from-[#050a0f]/90 via-[#050a0f]/40 to-transparent" />
      <span className="absolute inset-0 flex flex-col justify-center gap-2 p-5 sm:gap-3 sm:p-10 lg:p-16">
        <span className="text-xs uppercase tracking-[0.4em] text-accent">
          Next project
        </span>
        <span className="text-3xl font-light leading-[1.05] tracking-tight sm:text-5xl lg:text-7xl">
          {next.title}
        </span>
        <span className="mt-1 inline-flex w-fit items-center gap-3 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-[#050a0f] transition-colors duration-300 group-hover:bg-accent/85 sm:mt-3">
          View project
          <span className="transition-transform duration-300 group-hover:translate-x-1">
            <Icon>
              <path d="M5 12h14" />
              <path d="m13 6 6 6-6 6" />
            </Icon>
          </span>
        </span>
      </span>
    </Link>
  );
});

/* ---------- main ---------- */
export default function ProjectDetail({ project, next }) {
  const wrap = useRef(null);
  const stage = useRef(null);
  const track = useRef(null);
  const counter = useRef(null);
  const pinned = useRef(false);
  const lenisRef = useLenis();
  const goBack = useGoBack();
  const [lightbox, setLightbox] = useState(null);
  const closeLightbox = useCallback(() => setLightbox(null), []);

  const shots = useMemo(() => {
    const seen = new Set();
    return (project.images ?? []).filter(
      (s) => !seen.has(s.src) && seen.add(s.src),
    );
  }, [project.images]);

  // Always start a project at the very beginning. The home page's old scroll
  // value (kept inside Lenis) would otherwise be applied once the tall
  // horizontal-scroll wrapper gets its height, making the page "fall" from the end.
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    lenisRef.current?.scrollTo(0, { immediate: true, force: true });
  }, [lenisRef, project.slug]);

  // pause smooth scroll while the lightbox is open
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    lightbox ? lenis.stop() : lenis.start();
    return () => lenis.start();
  }, [lightbox, lenisRef]);

  useGSAP(
    () => {
      const stageEl = stage.current;
      const trackEl = track.current;
      const wrapEl = wrap.current;
      const counterEl = counter.current;
      const currentEl = counterEl?.querySelector("[data-current]");
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      /* intro (all screen sizes) */
      if (!reduce) {
        gsap.from("[data-intro-line]", {
          yPercent: 115,
          duration: 1.4,
          ease: "power4.out",
          stagger: 0.1,
          delay: 0.15,
        });
        gsap.from("[data-intro]", {
          opacity: 0,
          y: 24,
          duration: 1.2,
          ease: "power4.out",
          stagger: 0.12,
          delay: 0.45,
        });
      }

      /* desktop: vertical scroll drives a horizontal track */
      const mm = gsap.matchMedia();
      mm.add(DESKTOP_QUERY, () => {
        pinned.current = true;
        stageEl.style.overflowX = "hidden";
        stageEl.scrollLeft = 0;

        const dist = () => Math.max(0, trackEl.scrollWidth - window.innerWidth);
        const sync = () => {
          wrapEl.style.height = `${dist() / PACE + window.innerHeight}px`;
        };
        sync();

        const move = gsap.to(trackEl, {
          x: () => -dist(),
          ease: "none",
          scrollTrigger: {
            trigger: wrapEl,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            invalidateOnRefresh: true,
            onRefreshInit: sync,
          },
        });

        // counter: one cached setter, no per-change tween
        let shown = -1;
        const setCurrent = (i) => {
          if (!currentEl || shown === i) return;
          shown = i;
          currentEl.textContent = pad(i + 1);
          gsap.fromTo(
            currentEl,
            { yPercent: 70, opacity: 0 },
            {
              yPercent: 0,
              opacity: 1,
              duration: 0.6,
              ease: "power3.out",
              overwrite: true,
            },
          );
        };

        gsap.utils.toArray("[data-shot]", trackEl).forEach((shot, i) => {
          const q = gsap.utils.selector(shot);
          const [frame] = q("[data-frame]");
          const [media] = q("[data-media]");
          const [dim] = q("[data-dim]");
          const [fill] = q("[data-icon-fill]");
          const [glyph] = q("[data-icon-glyph]");

          // enter
          gsap
            .timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                trigger: shot,
                containerAnimation: move,
                start: "left 98%",
                end: "left 35%",
                scrub: 0.4,
              },
            })
            .fromTo(
              frame,
              { clipPath: "inset(0% 40% 0% 0%)" },
              { clipPath: "inset(0% 0% 0% 0%)", ease: "power2.out" },
              0,
            )
            .fromTo(media, { scale: 1.25 }, { scale: 1, ease: "power2.out" }, 0)
            .fromTo(dim, { opacity: DIM }, { opacity: 0 }, 0)
            .fromTo(fill, { opacity: 0 }, { opacity: 1, ease: "sine.inOut" }, 0)
            .fromTo(
              glyph,
              { color: GLYPH_OFF },
              { color: GLYPH_ON, ease: "sine.inOut" },
              0,
            );

          // exit
          gsap
            .timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                trigger: shot,
                containerAnimation: move,
                start: "right 65%",
                end: "right 0%",
                scrub: 0.4,
              },
            })
            // explicit start values + immediateRender:false so the exit never
            // captures the enter's initial state (that caused the "pump" jump)
            .fromTo(
              media,
              { scale: 1 },
              { scale: 0.94, ease: "power1.in", immediateRender: false },
              0,
            )
            .fromTo(
              dim,
              { opacity: 0 },
              { opacity: DIM, immediateRender: false },
              0,
            )
            .fromTo(
              fill,
              { opacity: 1 },
              { opacity: 0, ease: "sine.inOut", immediateRender: false },
              0,
            )
            .fromTo(
              glyph,
              { color: GLYPH_ON },
              { color: GLYPH_OFF, ease: "sine.inOut", immediateRender: false },
              0,
            );

          ScrollTrigger.create({
            trigger: shot,
            containerAnimation: move,
            start: "left center",
            end: "right center",
            onToggle: (self) => self.isActive && setCurrent(i),
          });
        });

        // counter visibility
        const group = trackEl.querySelector("[data-shots]");
        if (group && counterEl) {
          gsap.set(counterEl, { opacity: 0 });
          ScrollTrigger.create({
            trigger: group,
            containerAnimation: move,
            start: "left center",
            end: "right center",
            onToggle: (self) =>
              gsap.to(counterEl, {
                opacity: self.isActive ? 1 : 0,
                duration: 0.4,
                overwrite: true,
              }),
          });
        }

        // panel reveals (video + next card)
        gsap.utils.toArray("[data-panel]", trackEl).forEach((panel) => {
          const items = panel.querySelectorAll("[data-reveal]");
          if (!items.length) return;
          gsap.from(items, {
            opacity: 0,
            y: 40,
            duration: 1.2,
            ease: "power4.out",
            stagger: 0.12,
            scrollTrigger: {
              trigger: panel,
              containerAnimation: move,
              start: "left 82%",
              toggleActions: "play none none none",
            },
          });
        });

        return () => {
          pinned.current = false;
          stageEl.style.overflowX = "";
          wrapEl.style.height = "";
        };
      });

      return () => mm.revert();
    },
    { scope: wrap, dependencies: [project.title], revertOnUpdate: true },
  );

  const goToVideo = useCallback(() => {
    const panel = track.current?.querySelector("[data-video]");
    if (!panel) return;

    if (pinned.current) {
      const dist = track.current.scrollWidth - window.innerWidth;
      const left =
        panel.offsetLeft - (window.innerWidth - panel.offsetWidth) / 2;
      const y =
        wrap.current.offsetTop + Math.min(Math.max(left, 0), dist) / PACE;
      if (lenisRef.current) lenisRef.current.scrollTo(y, { duration: 1.8 });
      else window.scrollTo({ top: y, behavior: "smooth" });
    } else {
      stage.current.scrollTo({
        left: Math.max(panel.offsetLeft - 16, 0),
        behavior: "smooth",
      });
    }
  }, [lenisRef]);

  return (
    <main className="grain bg-bg text-white">
      {/* fixed top controls */}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-40 flex items-start justify-between px-4 sm:top-6 sm:px-6 lg:px-12">
        <button
          type="button"
          onClick={goBack}
          aria-label="Back to projects"
          className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-[#050a0f] transition-colors duration-300 hover:bg-accent/85"
        >
          <Icon>
            <path d="M19 12H5" />
            <path d="m11 18-6-6 6-6" />
          </Icon>
          Back
        </button>

        {project.video && (
          <button
            type="button"
            onClick={goToVideo}
            className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#050a0f]/60 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-md transition-colors duration-300 hover:border-accent hover:text-accent"
          >
            <Icon size={14} fill>
              <path d="M8 5v14l11-7z" />
            </Icon>
            Watch video
          </button>
        )}
      </div>

      {/* image counter (desktop only) */}
      {shots.length > 0 && (
        <div
          ref={counter}
          aria-hidden="true"
          className="pointer-events-none fixed bottom-7 left-12 z-40 hidden items-baseline gap-2 text-xs tabular-nums tracking-[0.3em] text-white opacity-0 mix-blend-difference lg:flex"
        >
          <span className="inline-block overflow-hidden">
            <span data-current className="inline-block">
              01
            </span>
          </span>
          <span className="text-white/50">/ {pad(shots.length)}</span>
        </div>
      )}

      <div ref={wrap}>
        <div
          ref={stage}
          tabIndex={0}
          role="region"
          aria-label={`${project.title} project details`}
          className="sticky top-0 h-svh overflow-x-auto overflow-y-hidden overscroll-x-contain outline-none [scrollbar-width:none] max-lg:snap-x max-lg:snap-proximity [&::-webkit-scrollbar]:hidden"
        >
          <div
            ref={track}
            className="relative flex h-full w-max items-center gap-5 px-4 sm:gap-8 sm:px-6 lg:gap-14 lg:px-[6vw] lg:will-change-transform"
          >
            {/* intro panel */}
            <section
              data-panel
              className="flex w-[86vw] shrink-0 flex-col justify-center max-lg:snap-start sm:w-[32rem] lg:w-[44rem]"
            >
              <p
                data-intro
                className="text-xs uppercase tracking-[0.4em] text-accent"
              >
                {project.category}
              </p>

              <h1
                aria-label={project.title}
                className="mt-4 text-[clamp(2.75rem,12vw,3.75rem)] font-light leading-none tracking-tight sm:mt-5 sm:text-6xl lg:text-[clamp(4rem,10svh,7.5rem)]"
              >
                {project.title.split(" ").map((w, i) => (
                  <span
                    key={i}
                    aria-hidden="true"
                    className="mr-[0.25em] inline-block overflow-hidden pb-[0.12em] align-top"
                  >
                    <span data-intro-line className="inline-block">
                      {w}
                    </span>
                  </span>
                ))}
              </h1>

              <p
                data-intro
                className="mt-5 max-w-lg text-sm leading-relaxed text-neutral-400 sm:mt-6 sm:text-base lg:text-lg"
              >
                {project.description}
              </p>

              <Toolkit tools={project.tools} />

              <p
                data-intro
                className="mt-8 flex items-center gap-4 text-[11px] uppercase tracking-[0.35em] text-neutral-500 sm:mt-10"
              >
                <span className="h-px w-12 bg-accent/60" />
                <span className="lg:hidden">Swipe</span>
                <span className="hidden lg:inline">Scroll</span>
              </p>
            </section>

            {/* screenshots */}
            {shots.length > 0 && (
              <div data-shots className="flex shrink-0">
                {shots.map((s, i) => (
                  <ImageTile
                    key={s.src}
                    src={s.src}
                    width={s.width}
                    height={s.height}
                    alt={`${project.title} — ${i + 1}`}
                    className={SHOT_H}
                    priority={i === 0}
                    onExpand={setLightbox}
                  />
                ))}
              </div>
            )}

            {/* video */}
            {project.video && (
              <div
                data-panel
                data-video
                className="w-[86vw] shrink-0 max-lg:snap-center sm:w-[64vw] lg:w-[min(122svh,66vw)]"
              >
                <div data-reveal>
                  <YouTubeEmbed
                    id={project.video.id}
                    title={project.video.title}
                    channel={project.video.channel}
                    poster={project.video.poster}
                  />
                </div>
              </div>
            )}

            {/* next project */}
            <div data-panel className="shrink-0 max-lg:snap-center">
              <NextCard next={next} />
            </div>
          </div>
        </div>
      </div>

      <Lightbox image={lightbox} onClose={closeLightbox} />
    </main>
  );
}
