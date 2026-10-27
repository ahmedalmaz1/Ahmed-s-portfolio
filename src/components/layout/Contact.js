"use client";
import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const EMAIL = "hello@ahmedalmaz.com";
const TITLE = "Let's build your next world together.";
const EASE = "ease-[cubic-bezier(0.76,0,0.24,1)]";

const CHANNELS = [
  { label: "Email", value: EMAIL, href: `mailto:${EMAIL}` },
  {
    label: "ArtStation",
    value: "artstation.com/ahmedalmaz",
    href: "https://www.artstation.com/ahmedalmaz",
  },
  {
    label: "LinkedIn",
    value: "linkedin.com/in/ahmedalmaz",
    href: "https://www.linkedin.com/",
  },
  {
    label: "Instagram",
    value: "@ahmedalmaz",
    href: "https://www.instagram.com/",
  },
];

export default function Contact() {
  const root = useRef(null);
  const [copied, setCopied] = useState(false);

  useGSAP(
    () => {
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const card = root.current;
      const lines = card.querySelectorAll("[data-line]");
      const fades = card.querySelectorAll("[data-fade]");
      const rules = card.querySelectorAll("[data-rule]");
      const isMobile = () => window.innerWidth < 1024;

      if (reduce) {
        gsap.set(fades, { opacity: 1, y: 0 });
        gsap.set(rules, { scaleX: 1 });
        return;
      }

      gsap.fromTo(
        card,
        { y: () => (isMobile() ? 40 : 80) },
        {
          y: 0,
          ease: "none",
          force3D: true,
          scrollTrigger: {
            trigger: card,
            start: "top 100%",
            end: "top 55%",
            scrub: 1,
            invalidateOnRefresh: true,
          },
        },
      );

      gsap.set(lines, { yPercent: 115 });
      gsap.set(fades, { opacity: 0, y: 24 });
      gsap.set(rules, { scaleX: 0, transformOrigin: "0% 50%" });

      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: "power4.out", force3D: true },
      });

      tl.to(rules, { scaleX: 1, duration: 1.4, ease: "power3.inOut" }, 0)
        .to(lines, { yPercent: 0, duration: 1.3, stagger: 0.08 }, 0.1)
        .to(fades, { opacity: 1, y: 0, duration: 1.1, stagger: 0.09 }, 0.5);

      ScrollTrigger.create({
        trigger: card,
        start: () => (isMobile() ? "top 78%" : "top 62%"),
        end: () => (isMobile() ? "bottom 12%" : "bottom 20%"),
        invalidateOnRefresh: true,
        onEnter: () => tl.timeScale(1).play(),
        onEnterBack: () => tl.timeScale(1).play(),
        onLeave: () => tl.timeScale(1.8).reverse(),
        onLeaveBack: () => tl.timeScale(1.8).reverse(),
      });
    },
    { scope: root },
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section
      ref={root}
      data-showreel-next
      id="contact"
      className="relative z-10 mx-(--gutter) mb-4 flex min-h-svh flex-col justify-center overflow-hidden rounded-[2rem] bg-bg2 text-white sm:mb-6 lg:mb-8 lg:rounded-[3rem]"
    >
      <div className="relative mx-auto w-full max-w-6xl px-6 py-24 sm:px-10 sm:py-28 lg:px-14 lg:py-32">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <h2
              aria-label={TITLE}
              className="text-4xl font-light leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl"
            >
              {TITLE.split(" ").map((w, i) => (
                <span
                  key={i}
                  aria-hidden="true"
                  className="mr-[0.25em] inline-block overflow-hidden pb-[0.12em] align-top"
                >
                  <span data-line className="inline-block">
                    {w}
                  </span>
                </span>
              ))}
            </h2>

            <p
              data-fade
              className="mt-8 max-w-md text-base leading-relaxed text-neutral-400 opacity-0 sm:text-lg"
            >
              Have a cinematic, a game environment or a full world in mind? Tell
              me about it and I will get back to you within 24 hours.
            </p>

            <button
              data-fade
              type="button"
              onClick={copy}
              className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full border border-white/20 px-6 text-sm font-medium text-white opacity-0 transition-colors duration-500 hover:border-accent hover:text-accent"
            >
              {copied ? "Copied" : "Copy email"}
            </button>
          </div>

          <ul className="lg:col-span-5 lg:pt-3">
            {CHANNELS.map((c) => (
              <li key={c.label} data-fade className="opacity-0">
                <a
                  href={c.href}
                  target={c.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel="noreferrer"
                  className="group/row relative flex items-center justify-between gap-6 py-5 sm:py-6"
                >
                  <span className="min-w-0">
                    <span className="block text-[11px] uppercase tracking-[0.3em] text-neutral-500">
                      {c.label}
                    </span>
                    <span
                      className={`mt-1 block truncate text-base text-neutral-200 transition-transform duration-500 ${EASE} group-hover/row:translate-x-2 sm:text-lg`}
                    >
                      {c.value}
                    </span>
                  </span>

                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className={`shrink-0 -rotate-45 text-neutral-500 transition-[transform,color] duration-500 ${EASE} group-hover/row:rotate-0 group-hover/row:text-accent transition-all duration-300`}
                  >
                    <path d="M5 12h14" />
                    <path d="m13 6 6 6-6 6" />
                  </svg>

                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-px bg-white/10"
                  />
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-accent transition-transform duration-700 ${EASE} group-hover/row:scale-x-100`}
                  />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
