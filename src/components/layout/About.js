"use client";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useLenis } from "@/components/SmoothScroll";
import Image from "next/image";
gsap.registerPlugin(ScrollTrigger, useGSAP);

const STATEMENT =
  "I build cinematic worlds in Unreal Engine: moody, lived-in environments where light, fog and detail tell the story before a single character appears.";

const BIO = [
  "I'm Ahmed Almaz, an environment artist focused on cinematic scenes and real-time worlds. I care about atmosphere: how a wet street reflects a neon sign, how fog swallows a distant skyline.",
  "From blockout and lighting to final cinematic camera work, I take scenes from the first idea to a polished shot that feels like a frame from a film.",
];

export default function About() {
  const root = useRef(null);
  const statement = useRef(null);
  const lenisRef = useLenis();

  useGSAP(
    () => {
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const words = gsap.utils.toArray(".about-word");
      const reveals = gsap.utils.toArray("[data-reveal]");
      const counters = gsap.utils.toArray("[data-count]");
      const content = root.current.firstElementChild;
      const isMobile = () => window.innerWidth < 768;

      if (reduce) {
        gsap.set([...words, ...reveals], { opacity: 1, y: 0 });
        counters.forEach((el) => {
          el.textContent = el.dataset.count + (el.dataset.suffix || "");
        });
        return;
      }

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

      gsap.fromTo(
        words,
        { opacity: 0.15 },
        {
          opacity: 1,
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

      counters.forEach((el) => {
        const end = Number(el.dataset.count);
        const suffix = el.dataset.suffix || "";
        const o = { v: 0 };
        gsap.to(o, {
          v: end,
          duration: 1.8,
          ease: "power2.out",
          onUpdate: () => {
            el.textContent = Math.round(o.v) + suffix;
          },
          scrollTrigger: { trigger: el, start: "top 92%", once: true },
        });
      });
    },
    { scope: root },
  );

  const goContact = (e) => {
    e.preventDefault();
    lenisRef.current?.scrollTo("#contact", { duration: 1.4 });
  };

  return (
    <section
      ref={root}
      id="about"
      className="relative z-10 -mt-[100vh] mx-(--gutter) flex min-h-screen flex-col justify-center rounded-[2rem] bg-bg2 text-white lg:rounded-[3rem]"
    >
      <div className="mx-auto w-full max-w-6xl px-6 py-12 will-change-transform sm:px-10 sm:py-16 lg:px-14 lg:py-20">
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
            data-reveal
            className="relative aspect-square h-[clamp(13rem,min(36vh,56vw),22rem)] justify-self-center opacity-0 lg:col-span-4 lg:col-start-1 lg:row-start-1"
          >
            <div className="absolute inset-0 overflow-hidden rounded-full bg-gradient-to-b from-[#58514F] via-[#cfc4c1]/10 to-bg">
              <Image
                src="/ahmedalmaz.png"
                alt="Ahmed Almaz"
                fill
                sizes="(max-width: 1024px) 56vw, 352px"
                className="object-cover object-center brightness-90 contrast-105"
              />
            </div>
          </div>

          <div className="space-y-6 text-base text-center md:text-left leading-relaxed text-neutral-400 sm:text-lg lg:col-span-7 lg:col-start-6">
            {BIO.map((p, i) => (
              <p key={i} data-reveal className="opacity-0">
                {p}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
