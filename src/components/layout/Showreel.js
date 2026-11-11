"use client";
import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

const VIDEO_SRC = "/video.mp4";
const TITLE = "Worlds in motion";
const BG = "#050a0f";
const STEP = 90;
const HIDDEN = 130;
const HIDE_AT = 0.97;
const PHRASES = [
  "Worlds designed with intention. Built to be experienced.",
  "Some worlds exist only in imagination. Until someone brings them to life.",
  "Every frame, a cinematic",
];

export default function Showreel() {
  const root = useRef(null);
  const videoRef = useRef(null);

  useGSAP(
    (_, contextSafe) => {
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const q = (s) => root.current.querySelector(s);
      const qa = (s) => Array.from(root.current.querySelectorAll(s));

      const section = q("[data-section]");
      const backdrop = q("[data-backdrop]");
      const video = videoRef.current;
      const dim = q("[data-dim]");
      const shade = q("[data-shade]");
      const label = q("[data-label]");
      const fills = qa("[data-fill]");
      const phrases = qa("[data-phrase]").map((el) =>
        Array.from(el.querySelectorAll("[data-word]")),
      );
      const allWords = phrases.flat();

      const progress = { a: 0, u: 0, r: 0 };
      const view = { o: 0, b: 0, d: 1, k: 1.1, l: 0, m: 0, h: 1 };
      let playing = false;
      let warmed = false;
      let projectsEl = null;
      let current = 0;
      let wanted = 0;
      let busy = false;
      let tl = null;
      let finished = false; // true once the text has been retired

      const maxBlur = () => (window.innerWidth < 1024 ? 8 : 14);
      const clamp = (v) => Math.min(1, Math.max(0, v));

      const target = () => {
        const mb = maxBlur();
        const { a, u, r } = progress;
        return {
          o: a * (1 - clamp((r - 0.9) / 0.1)),
          b: (1 - u) * mb,
          d: clamp(1 - u + r * 1.15),
          k: 1.1 - 0.1 * u + 0.1 * r,
          l: clamp((u - 0.6) / 0.4) * clamp(1 - r * 3),
          m: u,
        };
      };

      const setMask = (el, value) => {
        if (!el) return;
        el.style.webkitMaskImage = value;
        el.style.maskImage = value;
      };

      // The video is not downloaded with the page: it starts loading about a
      // screen before the Projects section, long before it becomes visible.
      const warm = () => {
        if (warmed) return;
        warmed = true;
        video.preload = "auto";
        video.load();
      };

      const apply = () => {
        backdrop.style.opacity = view.o;
        backdrop.style.visibility = view.o > 0.01 ? "visible" : "hidden";
        video.style.filter = `blur(${view.b.toFixed(2)}px)`;
        video.style.transform = `scale(${view.k.toFixed(4)})`;
        dim.style.opacity = view.d;
        // the bottom shade belongs to the text, so it goes away with it
        shade.style.opacity = view.l * view.h;
        label.style.opacity = view.l * view.h;
        label.style.transform = `translate3d(0, ${((1 - view.l) * 28).toFixed(2)}px, 0)`;

        if (projectsEl) {
          if (view.m > 0.001 && progress.r === 0) {
            const fade = Math.round(view.m * window.innerHeight * 0.6);
            setMask(
              projectsEl,
              `linear-gradient(to bottom, #000 calc(100% - ${fade}px), transparent 100%)`,
            );
          } else if (view.m <= 0.001) {
            setMask(projectsEl, "");
          }
        }

        const shouldPlay = view.o > 0.01 && view.d < 0.995;
        if (shouldPlay && !playing) {
          playing = true;
          warm();
          video.play().catch(() => {});
        } else if (!shouldPlay && playing) {
          playing = false;
          video.pause();
        }
      };

      const update = () => {
        const t = target();
        if (reduce) {
          Object.assign(view, t);
          apply();
          return;
        }
        gsap.to(view, {
          ...t,
          duration: 0.7,
          ease: "power3.out",
          overwrite: "auto",
          onUpdate: apply,
        });
      };

      const track = (key) => (self) => {
        progress[key] = self.progress;
        update();
      };

      const fillTo = fills.map((f) =>
        gsap.quickTo(f, "scaleX", { duration: 0.5, ease: "power3.out" }),
      );

      const syncFills = (self) => {
        const p = self.progress * PHRASES.length;
        fillTo.forEach((to, i) => to(clamp(p - i)));
      };

      const resetPhrases = () => {
        phrases.forEach((words, i) => {
          gsap.set(words, {
            yPercent: i === 0 ? 0 : HIDDEN,
            rotate: 0,
            opacity: i === 0 ? 1 : 0,
            transformOrigin: "0% 100%",
          });
        });
      };

      const settle = () => {
        phrases.forEach((words, i) => {
          if (i === current) return;
          gsap.set(words, { opacity: 0, yPercent: HIDDEN });
        });
      };

      const run = contextSafe(() => {
        if (finished || busy || wanted === current) return;

        const from = current;
        const to = wanted;
        const dir = to > from ? 1 : -1;
        current = to;

        if (reduce) {
          gsap.set(phrases[from], { opacity: 0, yPercent: HIDDEN });
          gsap.set(phrases[to], { opacity: 1, yPercent: 0, rotate: 0 });
          settle();
          run();
          return;
        }

        busy = true;
        tl = gsap.timeline({
          onComplete: () => {
            busy = false;
            tl = null;
            settle();
            run();
          },
        });

        tl.to(phrases[from], {
          yPercent: -HIDDEN * dir,
          rotate: -4 * dir,
          duration: 0.5,
          ease: "power3.in",
          stagger: 0.03,
        })
          .set(phrases[from], { opacity: 0 })
          .set(phrases[to], {
            yPercent: HIDDEN * dir,
            rotate: 4 * dir,
            opacity: 1,
          })
          .to(phrases[to], {
            yPercent: 0,
            rotate: 0,
            duration: 0.95,
            ease: "power4.out",
            stagger: 0.06,
          });

        if (wanted !== to) tl.timeScale(2);
      });

      const request = (index) => {
        if (finished) return;
        wanted = index;
        if (busy && tl && wanted !== current) tl.timeScale(2);
        run();
      };

      // Retire the text: fade it out once and ignore every later scroll update.
      const finish = () => {
        if (finished) return;
        finished = true;

        if (reduce) {
          view.h = 0;
          apply();
          return;
        }
        gsap.to(view, {
          h: 0,
          duration: 0.25,
          ease: "power2.out",
          overwrite: "auto",
          onUpdate: apply,
        });
      };

      // Bring the text back, but only while the section is fully off-screen
      // below the viewport, so the user never sees it pop in.
      const reset = () => {
        if (!finished) return;
        finished = false;

        if (tl) {
          tl.kill();
          tl = null;
        }
        busy = false;
        current = 0;
        wanted = 0;

        gsap.killTweensOf(view, "h");
        view.h = 1;
        resetPhrases();
        fillTo.forEach((to) => to(0));
        apply();
      };

      const build = () => {
        const projects = document.querySelector("#projects");
        if (!projects) return;

        projectsEl = projects;

        ScrollTrigger.create({
          trigger: projects,
          start: "top 250%",
          once: true,
          onEnter: warm,
        });

        const make = (trigger, start, end, key) =>
          ScrollTrigger.create({
            trigger,
            start,
            end,
            invalidateOnRefresh: true,
            onUpdate: track(key),
            onRefresh: track(key),
          });

        make(projects, "top bottom", "top 60%", "a");
        make(projects, "bottom 90%", "bottom top", "u");
        // the dim happens early, so the fixed video is already the dark
        // texture before the contact content appears
        make(section, "bottom 100%", "bottom 40%", "r");

        const indexFrom = (self) =>
          Math.min(
            PHRASES.length - 1,
            Math.floor(self.progress * PHRASES.length),
          );

        const onProgress = (self) => {
          if (finished) return; // retired: no phrase changes, no fills
          if (self.progress >= HIDE_AT) {
            finish();
            return;
          }
          request(indexFrom(self));
          syncFills(self);
        };

        ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          onUpdate: onProgress,
          onRefresh: onProgress,
        });

        // Re-arm only when the section is completely below the viewport.
        ScrollTrigger.create({
          trigger: section,
          start: "top bottom",
          onLeaveBack: reset,
          onRefresh: (self) => {
            if (self.progress === 0) reset();
          },
        });

        ScrollTrigger.refresh();
      };

      resetPhrases();
      gsap.set(fills, { scaleX: 0, transformOrigin: "0% 50%" });

      apply();
      build();

      return () => {
        video.pause();
        setMask(projectsEl, "");
        if (tl) tl.kill();
        gsap.killTweensOf(view);
        gsap.killTweensOf(allWords);
      };
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      <div
        data-backdrop
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-0"
      >
        <video
          ref={videoRef}
          src={VIDEO_SRC}
          muted
          loop
          playsInline
          preload="none"
          className="absolute inset-0 h-full w-full object-cover will-change-[filter,transform]"
        />
        <div
          data-dim
          className="grain absolute inset-0"
          style={{ backgroundColor: BG }}
        />
        <div
          data-shade
          className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-black/75 via-black/30 to-transparent opacity-0"
        />
      </div>

      <section
        data-section
        id="showreel"
        aria-label="Showreel"
        className="relative z-10"
        style={{ height: `${100 + PHRASES.length * STEP}svh` }}
      >
        <div className="sticky top-0 flex h-svh flex-col justify-end">
          <div className="relative px-(--gutter) pb-8 sm:pb-12 lg:pb-14">
            <div className="mx-auto w-full max-w-6xl px-6 sm:px-10 lg:px-14">
              <div data-label className="opacity-0">
                <h2 className="sr-only">{TITLE}</h2>

                <div className="grid">
                  {PHRASES.map((text) => (
                    <p
                      key={text}
                      data-phrase
                      aria-hidden="true"
                      className="pointer-events-none col-start-1 row-start-1 max-w-4xl text-balance text-[clamp(2rem,1.2rem+3.6vw,4rem)] font-medium leading-[1] tracking-[-0.045em] text-white"
                    >
                      {text.split(" ").map((w, i) => (
                        <span
                          key={i}
                          className="-mb-[0.14em] mr-[0.22em] inline-block overflow-hidden pb-[0.14em] align-top"
                        >
                          <span
                            data-word
                            className="inline-block will-change-transform"
                          >
                            {w}
                          </span>
                        </span>
                      ))}
                    </p>
                  ))}
                </div>

                <div
                  aria-hidden="true"
                  className="mt-8 grid w-full max-w-xl gap-2 sm:mt-12 sm:gap-3"
                  style={{
                    gridTemplateColumns: `repeat(${PHRASES.length}, minmax(0, 1fr))`,
                  }}
                >
                  {PHRASES.map((text) => (
                    <div
                      key={text}
                      className="relative h-0.5 overflow-hidden rounded-full bg-white/20"
                    >
                      <span
                        data-fill
                        className="absolute inset-0 rounded-full bg-white"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
