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
import TransitionLink from "@/components/TransitionLink";
import Image from "next/image";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useLenis } from "@/components/SmoothScroll";
import { onReveal } from "@/components/PageTransition";
import { useGoBack } from "@/hooks/useGoBack";
import { pad } from "@/lib/format";
import ImageTile from "@/components/project/ImageTile";
import YouTubeEmbed from "@/components/project/YouTubeEmbed";
import Lightbox from "@/components/project/Lightbox";

const DESKTOP_QUERY =
  "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";
const MOBILE_QUERY =
  "(max-width: 1023.98px) and (prefers-reduced-motion: no-preference)";
const DESKTOP_WIDTH = "(min-width: 1024px)";

const SHOT_H = "lg:[--h:86svh]";

const CARD_H =
  "h-[24svh] min-h-40 sm:h-[28svh] lg:h-[calc(var(--media-w)*9/16)] lg:min-h-0";
const PACE = 1.5;
const DIM = 0.6;
const GLYPH_ON = "#050a0f";
const GLYPH_OFF = "#ffffff";

/* ---------- small static pieces ---------- */
function Icon({ children, size = 16, fill = false }) {
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
}

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
    <TransitionLink
      href={next.href}
      data-reveal
      className={`group relative block w-full overflow-hidden rounded-none bg-bg lg:w-(--media-w) lg:rounded-[2.5rem] ${CARD_H}`}
    >
      <Image
        src={next.image}
        alt=""
        fill
        sizes="(min-width: 1024px) 60vw, 100vw"
        className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-105"
      />
      {/* mobile layer: even dark tint so the text is always readable */}
      <span className="absolute inset-0 bg-[#050a0f]/55 lg:bg-transparent" />
      <span className="absolute inset-0 bg-linear-to-r from-[#050a0f]/90 via-[#050a0f]/40 to-transparent" />

      <span className="absolute inset-0 flex flex-col justify-center gap-1.5 p-4 sm:gap-2.5 sm:p-8 lg:gap-3 lg:p-12">
        <span className="text-[11px] uppercase tracking-[0.4em] text-accent sm:text-xs">
          Next project
        </span>
        <span className="font-display text-2xl font-light leading-[1.05] tracking-tight sm:text-4xl lg:text-5xl">
          {next.title}
        </span>

        {/* button: label only */}
        <span className="mt-1.5 inline-flex w-fit items-center rounded-full border border-white/25 bg-white/10 px-5 py-2 text-xs font-medium text-white backdrop-blur-md transition-colors duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-[#050a0f] sm:mt-2 sm:px-6 sm:py-2.5 sm:text-sm">
          View project
        </span>
      </span>
    </TransitionLink>
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

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    lenisRef.current?.scrollTo(0, { immediate: true, force: true });
  }, [lenisRef, project.slug]);

  // freeze page scrolling only while the lightbox is open (never on mount,
  // so a running page transition keeps control of Lenis)
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lightbox || !lenis) return;
    lenis.stop();
    return () => lenis.start();
  }, [lightbox, lenisRef]);

  useGSAP(
    (context, contextSafe) => {
      const stageEl = stage.current;
      const trackEl = track.current;
      const wrapEl = wrap.current;
      const counterEl = counter.current;
      const currentEl = counterEl?.querySelector("[data-current]");
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      let offReveal = () => {};
      if (!reduce) {
        gsap.set("[data-intro-line]", { yPercent: 115 });
        gsap.set("[data-intro]", { opacity: 0, y: 24 });

        const playIntro = contextSafe(() => {
          gsap.to("[data-intro-line]", {
            yPercent: 0,
            duration: 1.4,
            ease: "power4.out",
            stagger: 0.1,
            delay: 0.15,
          });
          gsap.to("[data-intro]", {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "power4.out",
            stagger: 0.12,
            delay: 0.45,
          });
        });
        offReveal = onReveal(playIntro);
      }

      const mm = gsap.matchMedia();

      /* ---------- desktop: vertical scroll drives a horizontal track ---------- */
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

      /* ---------- mobile / tablet: plain vertical page, light reveals ---------- */
      mm.add(MOBILE_QUERY, () => {
        gsap.utils.toArray("[data-shot]", trackEl).forEach((shot) => {
          const frame = shot.querySelector("[data-frame]");
          const media = shot.querySelector("[data-media]");
          const st = { trigger: shot, start: "top 88%", once: true };

          gsap.fromTo(
            frame,
            { clipPath: "inset(10% 0% 0% 0%)", opacity: 0 },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              opacity: 1,
              duration: 1.1,
              ease: "power3.out",
              scrollTrigger: st,
            },
          );
          gsap.fromTo(
            media,
            { scale: 1.15 },
            { scale: 1, duration: 1.4, ease: "power3.out", scrollTrigger: st },
          );
        });

        gsap.utils.toArray("[data-reveal]", trackEl).forEach((item) => {
          gsap.fromTo(
            item,
            { opacity: 0, y: 32 },
            {
              opacity: 1,
              y: 0,
              duration: 1,
              ease: "power3.out",
              scrollTrigger: { trigger: item, start: "top 98%", once: true },
            },
          );
        });
      });

      return () => {
        offReveal();
        mm.revert();
      };
    },
    { scope: wrap, dependencies: [project.slug], revertOnUpdate: true },
  );

  const goToVideo = useCallback(() => {
    const panel = track.current?.querySelector("[data-video]");
    if (!panel) return;

    if (pinned.current) {
      // desktop, pinned: map the panel position to a vertical scroll offset
      const dist = track.current.scrollWidth - window.innerWidth;
      const left =
        panel.offsetLeft - (window.innerWidth - panel.offsetWidth) / 2;
      const y =
        wrap.current.offsetTop + Math.min(Math.max(left, 0), dist) / PACE;
      if (lenisRef.current) lenisRef.current.scrollTo(y, { duration: 1.8 });
      else window.scrollTo({ top: y, behavior: "smooth" });
    } else if (window.matchMedia(DESKTOP_WIDTH).matches) {
      // desktop with reduced motion: native horizontal scroll
      stage.current.scrollTo({
        left: Math.max(panel.offsetLeft - 16, 0),
        behavior: "smooth",
      });
    } else if (lenisRef.current) {
      // mobile / tablet: the page is vertical
      lenisRef.current.scrollTo(panel, { offset: -80, duration: 1.4 });
    } else {
      panel.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [lenisRef]);

  return (
    <main className="grain bg-bg text-white">
      {/* fixed top controls */}
      <div className="pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top)+1.5rem)] z-40 flex items-start justify-between px-4 sm:top-6 sm:px-6 lg:px-12">
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
          className="pointer-events-none fixed bottom-7 left-32 z-40 hidden items-baseline gap-2 text-xs tabular-nums tracking-[0.3em] text-white opacity-0 mix-blend-difference lg:flex"
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
        {/* < lg: normal flow.  lg+: sticky stage with a horizontal track */}
        <div
          ref={stage}
          role="region"
          aria-label={`${project.title} project details`}
          className="outline-none [scrollbar-width:none] lg:sticky lg:top-0 lg:h-svh lg:overflow-x-auto lg:overflow-y-hidden lg:overscroll-x-contain [&::-webkit-scrollbar]:hidden"
        >
          <div
            ref={track}
            className="relative flex w-full flex-col gap-12 px-4 pb-0 pt-[calc(env(safe-area-inset-top)+6.5rem)] sm:gap-16 sm:px-6 sm:pt-36 lg:h-full lg:w-max lg:flex-row lg:items-center lg:gap-14 lg:px-[6vw] lg:py-0 lg:will-change-transform lg:[--media-w:min(104svh,60vw)]"
          >
            {/* intro panel */}
            <section
              data-panel
              className="flex w-full shrink-0 flex-col justify-center py-4 sm:py-6 lg:w-[44rem] lg:py-0"
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
                className="mt-6 max-w-lg text-sm leading-relaxed text-neutral-400 sm:mt-7 sm:text-base lg:text-lg"
              >
                {project.description}
              </p>

              <Toolkit tools={project.tools} />

              {/* scroll hint: desktop only */}
              <p
                data-intro
                className="mt-10 hidden items-center gap-4 text-[11px] uppercase tracking-[0.35em] text-neutral-500 lg:flex"
              >
                <span className="h-px w-12 bg-accent/60" />
                <span>Scroll</span>
              </p>
            </section>

            {/* screenshots */}
            {shots.length > 0 && (
              <div
                data-shots
                className="flex w-full shrink-0 flex-col gap-4 sm:gap-6 lg:w-auto lg:flex-row lg:gap-0"
              >
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
                className="w-full shrink-0 lg:w-(--media-w)"
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

            {/* next project: full-bleed on mobile (cancels the track's side padding) */}
            <div data-panel className="-mx-4 shrink-0 sm:-mx-6 lg:mx-0">
              <NextCard next={next} />
            </div>
          </div>
        </div>
      </div>

      <Lightbox image={lightbox} onClose={closeLightbox} />
    </main>
  );
}
