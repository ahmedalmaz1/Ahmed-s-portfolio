"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useToast } from "@/providers/ToastProvider";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const EMAIL = "hello@example.com";
const LINKS = ["ArtStation", "Vimeo", "LinkedIn", "Download CV"];

export default function Contact() {
  const { show } = useToast();
  const sectionRef = useRef(null);
  const curtainRef = useRef(null);
  const headingRef = useRef(null);
  const colRef = useRef(null);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      show("Email copied");
    } catch {
      show("Could not copy automatically. Select and copy the email above.");
    }
  };

  useGSAP(
    () => {
      if (!sectionRef.current || !curtainRef.current) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(curtainRef.current, { yPercent: 0 });
        gsap.set(headingRef.current, { autoAlpha: 0, x: -60 });
        gsap.set(colRef.current.children, { autoAlpha: 0, x: 60 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            end: "top 20%",
            scrub: 0.7,
          },
        });

        tl.to(curtainRef.current, { yPercent: -100, ease: "power2.inOut" }, 0)
          .to(headingRef.current, { autoAlpha: 1, x: 0, ease: "power2.out" }, 0.15)
          .to(
            colRef.current.children,
            { autoAlpha: 1, x: 0, stagger: 0.1, ease: "power2.out" },
            0.25,
          );
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative overflow-hidden px-5 py-[clamp(88px,12vw,150px)] sm:px-8 md:px-16"
    >
      <div
        ref={curtainRef}
        aria-hidden="true"
        className="absolute inset-0 z-20 bg-black motion-reduce:hidden"
      />

      <div className="relative mx-auto grid max-w-[1240px] grid-cols-1 gap-8 md:grid-cols-[5fr_7fr] md:gap-16">
        <h2
          ref={headingRef}
          className="font-display text-[clamp(2rem,4.4vw,3.5rem)] font-bold leading-[1.05] tracking-[-0.02em]"
        >
          Need a world built or a shot lit?
        </h2>

        <div ref={colRef}>
          <p className="max-w-lg text-ink2">
            I&rsquo;m open to environment art and cinematic work, full-time or
            freelance. Email is the fastest way to reach me.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <a
              href={`mailto:${EMAIL}`}
              className="bg-gradient-to-r from-accent to-accent bg-[length:0%_2px] bg-no-repeat bg-bottom font-display text-[clamp(1.3rem,3vw,2.1rem)] font-bold tracking-[-0.01em] transition-[background-size] duration-300 hover:bg-[length:100%_2px]"
            >
              {EMAIL}
            </a>
            <button
              type="button"
              onClick={copyEmail}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-line px-6 font-semibold transition-colors hover:border-muted"
            >
              Copy email
            </button>
          </div>
          <ul className="mt-9 flex flex-wrap gap-7">
            {LINKS.map((label) => (
              <li key={label}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    show("Placeholder link. Add your own URL.");
                  }}
                  className="border-b border-line pb-0.5 text-ink transition-colors hover:border-accent"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}