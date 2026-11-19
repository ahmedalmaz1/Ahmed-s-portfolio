"use client";
import { useRef } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import LiquidButton from "@/components/LiquidButton";

const STATEMENT =
  "I build cinematic worlds in Unreal Engine: moody, lived-in environments where light, fog and detail tell the story before a single character appears.";

const BIO = [
  "I'm Ahmed Almaz, an environment artist focused on cinematic scenes and real-time worlds. I care about atmosphere: how a wet street reflects a neon sign, how fog swallows a distant skyline.",
  "From blockout and lighting to final cinematic camera work, I take scenes from the first idea to a polished shot that feels like a frame from a film.",
];

// The CV is uploaded from the admin panel (Profile > CV). Until one is uploaded the
// buttons keep using this static file from the "public" folder, so nothing breaks.
const CV_FALLBACK = {
  view: "/Ahmed-Almaz-CV.pdf",
  download: "/Ahmed-Almaz-CV.pdf",
};

export default function About({ name, bio, avatar, cv }) {
  const paragraphs = bio.length ? bio : BIO;
  const cvLinks = cv ?? CV_FALLBACK;
  const root = useRef(null);
  const statement = useRef(null);

  useGSAP(
    () => {
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const fine = window.matchMedia(
        "(hover: hover) and (pointer: fine)",
      ).matches;
      const q = gsap.utils.selector(root.current);
      const words = q(".about-word");
      const bioParas = q("[data-bio]");
      const reveals = q("[data-reveal]");
      const content = q("[data-content]")[0];
      const photo = q("[data-photo]")[0];
      const mask = q("[data-photo-mask]")[0];
      const zoom = q("[data-photo-zoom]")[0];
      const isMobile = () => window.innerWidth < 768;
      const k =
        parseFloat(getComputedStyle(document.documentElement).fontSize) / 16;

      if (reduce) {
        gsap.set([...words, ...q(".bio-word"), ...reveals], {
          opacity: 1,
          y: 0,
        });
        gsap.set(mask, { clipPath: "none" });
        return;
      }

      const cleanups = [];

      /* ---------- scroll ---------- */

      // the block settles into place as the card slides over the hero
      gsap.fromTo(
        content,
        {
          y: () => (isMobile() ? 16 : 32),
          scale: () => (isMobile() ? 0.985 : 0.97),
          transformOrigin: "50% 0%",
        },
        {
          y: 0,
          scale: 1,
          ease: "none",
          force3D: true,
          scrollTrigger: {
            trigger: root.current,
            start: "top bottom",
            end: "top top",
            scrub: 1.4,
            invalidateOnRefresh: true,
          },
        },
      );

      // statement: words light up one by one, rising a little
      gsap.fromTo(
        words,
        { opacity: 0.15, y: 10 },
        {
          opacity: 1,
          y: 0,
          ease: "none",
          stagger: 0.1,
          scrollTrigger: {
            trigger: statement.current,
            start: "top 85%",
            end: "bottom 50%",
            scrub: 0.8,
          },
        },
      );

      // bio: each paragraph is "read" word by word as it passes
      bioParas.forEach((p) => {
        gsap.fromTo(
          p.querySelectorAll(".bio-word"),
          { opacity: 0.25 },
          {
            opacity: 1,
            ease: "none",
            stagger: 0.08,
            scrollTrigger: {
              trigger: p,
              start: "top 88%",
              end: "bottom 58%",
              scrub: 0.6,
            },
          },
        );
      });

      // paragraphs rise in one after another
      gsap.set(reveals, { opacity: 0, y: () => (isMobile() ? 24 : 40) });
      ScrollTrigger.batch(reveals, {
        start: "top 90%",
        once: true,
        interval: 0.1,
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: 1.6,
            ease: "power4.out",
            stagger: 0.15,
            overwrite: true,
            force3D: true,
          }),
      });

      // portrait: appears once, bottom-up, then stays perfectly still
      gsap.set(mask, { clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(zoom, { scale: 1.3 });
      ScrollTrigger.create({
        trigger: photo,
        start: "top 85%",
        once: true,
        onEnter: () => {
          gsap.to(mask, {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.6,
            ease: "power3.inOut",
          });
          gsap.to(zoom, { scale: 1, duration: 2.2, ease: "power3.out" });
        },
      });

      /* ---------- pointer (mouse devices only) ---------- */

      if (fine) {
        const section = root.current;
        const wordScale = words.map((w) =>
          gsap.quickTo(w, "scale", { duration: 0.5, ease: "power3.out" }),
        );

        // words close to the cursor swell slightly
        let last = null;
        let raf = 0;
        const proximity = () => {
          raf = 0;
          if (!last) return;
          const s = statement.current.getBoundingClientRect();
          const inside = last.y > s.top - 80 && last.y < s.bottom + 80;
          const reach = 160 * k;
          words.forEach((w, i) => {
            let sc = 1;
            if (inside) {
              const r = w.getBoundingClientRect();
              const d = Math.hypot(
                last.x - (r.left + r.width / 2),
                last.y - (r.top + r.height / 2),
              );
              sc = 1 + 0.1 * Math.max(0, 1 - d / reach);
            }
            wordScale[i](sc);
          });
        };

        const onMove = (e) => {
          last = { x: e.clientX, y: e.clientY };
          if (!raf) raf = requestAnimationFrame(proximity);
        };

        const onLeave = () => {
          last = null;
          wordScale.forEach((f) => f(1));
        };

        section.addEventListener("pointermove", onMove);
        section.addEventListener("pointerleave", onLeave);

        cleanups.push(() => {
          if (raf) cancelAnimationFrame(raf);
          section.removeEventListener("pointermove", onMove);
          section.removeEventListener("pointerleave", onLeave);
        });
      }

      return () => cleanups.forEach((fn) => fn());
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="about"
      className="relative z-10 -mt-[100vh] mx-(--gutter) flex min-h-screen flex-col justify-center rounded-[2rem] bg-bg2 text-white lg:rounded-[3rem]"
    >
      <div
        data-content
        className="relative mx-auto w-full max-w-6xl px-6 py-12 will-change-transform sm:px-10 sm:py-16 lg:px-14 lg:py-20"
      >
        <h2
          ref={statement}
          aria-label={STATEMENT}
          className="max-w-5xl text-center sm:text-left text-3xl font-light leading-[1.2] tracking-tight sm:text-5xl lg:text-6xl"
        >
          {STATEMENT.split(" ").map((w, i) => (
            <span
              key={i}
              aria-hidden="true"
              className="about-word mr-[0.25em] inline-block opacity-[0.15]"
            >
              {w}
            </span>
          ))}
        </h2>

        <div className="grid items-center mt-20 lg:mt-28 gap-8 lg:grid-cols-12">
          <div
            data-photo
            className="relative aspect-square h-[clamp(13rem,min(36vh,56vw),22rem)] justify-self-center lg:col-span-4 lg:col-start-1 lg:row-start-1"
          >
            <div
              data-photo-mask
              className="absolute inset-0 overflow-hidden rounded-full bg-gradient-to-b from-[#58514F] via-[#cfc4c1]/10 to-bg"
              style={{ clipPath: "inset(100% 0% 0% 0%)" }}
            >
              <div data-photo-zoom className="absolute inset-0">
                <Image
                  src={avatar || "/ahmedalmaz.png"}
                  alt={name}
                  fill
                  sizes="(max-width: 1024px) 56vw, 25vw"
                  className="object-cover object-center brightness-90 contrast-105"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6 text-base text-center md:text-left leading-relaxed text-neutral-400 sm:text-lg lg:col-span-7 lg:col-start-6">
            {paragraphs.map((p, i) => (
              <p
                key={i}
                data-reveal
                data-bio
                aria-label={p}
                className="opacity-0"
              >
                {p.split(" ").map((w, j) => (
                  <span
                    key={j}
                    aria-hidden="true"
                    className="bio-word mr-[0.25em] inline-block opacity-25"
                  >
                    {w}
                  </span>
                ))}
              </p>
            ))}

            <div
              data-reveal
              className="flex items-center justify-center gap-3 pt-4 opacity-0 md:justify-start"
            >
              {/* opens the CV in the browser's PDF viewer (new tab) */}
              <LiquidButton
                href={cvLinks.view}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View CV (opens in a new tab)"
              >
                <span>View CV</span>
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-4 w-4 transition-transform duration-500 ease-out group-hover/cv:translate-x-0.5 group-hover/cv:-translate-y-0.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M7 17L17 7M9 7h8v8" />
                </svg>
              </LiquidButton>

              {/* saves the PDF */}
              <LiquidButton
                href={cvLinks.download}
                download
                shape="circle"
                aria-label="Download CV (PDF)"
                title="Download CV"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path className="cv-arrow" d="M12 4v12m0 0l-5-5m5 5l5-5" />
                  <path d="M5 20h14" />
                </svg>
              </LiquidButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
