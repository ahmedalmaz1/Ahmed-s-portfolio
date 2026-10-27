"use client";
import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function ProjectCard({ project, index, priority = false }) {
  const root = useRef(null);
  const right = index % 2 === 0;

  useGSAP(
    () => {
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const isMobile = () => window.innerWidth < 1024;
      const card = root.current;
      const img = card.querySelector("[data-img]");
      const shade = card.querySelector("[data-shade]");
      const lines = card.querySelectorAll("[data-line]");
      const fades = card.querySelectorAll("[data-fade]");

      if (reduce) {
        gsap.set(fades, { opacity: 1, y: 0 });
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
            end: "top 50%",
            scrub: 1,
            invalidateOnRefresh: true,
          },
        },
      );

      gsap.fromTo(
        img,
        { yPercent: -3 },
        {
          yPercent: 3,
          ease: "none",
          force3D: true,
          scrollTrigger: {
            trigger: card,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );

      gsap.set(fades, { opacity: 0, y: 24 });
      gsap.set(lines, { yPercent: 115 });
      gsap.set(shade, { opacity: 0 });

      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: "power4.out", force3D: true },
      });

      tl.to(shade, { opacity: 1, duration: 1.4, ease: "power2.out" }, 0)
        .to(lines, { yPercent: 0, duration: 1.3, stagger: 0.12 }, 0.2)
        .to(fades, { opacity: 1, y: 0, duration: 1.1, stagger: 0.14 }, 0.6);

      const forward = () => tl.timeScale(1).play();
      const backward = () => tl.timeScale(2).reverse();

      ScrollTrigger.create({
        trigger: card,
        start: () => (isMobile() ? "top 80%" : "top 62%"),
        end: () => (isMobile() ? "bottom 20%" : "bottom 30%"),
        invalidateOnRefresh: true,
        onEnter: forward,
        onEnterBack: forward,
        onLeave: backward,
        onLeaveBack: backward,
      });
    },
    { scope: root },
  );

  return (
    <article
      ref={root}
      className="group relative isolate aspect-video overflow-hidden rounded-[1.5rem] bg-[#0c131b] will-change-transform sm:aspect-[2.4/1] sm:rounded-[2rem] lg:rounded-[3rem]"
    >
      <div
        data-img
        className="absolute inset-x-0 -top-[4%] h-[108%] will-change-transform"
      >
        <div className="absolute inset-0">
          <Image
            src={project.image}
            alt={project.title}
            fill
            sizes="100vw"
            priority={priority}
            className="object-cover"
          />
        </div>
      </div>

      <div
        data-shade
        className={`pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050a0f]/85 via-[#050a0f]/20 to-transparent lg:via-[#050a0f]/10 ${
          right ? "lg:bg-gradient-to-l" : "lg:bg-gradient-to-r"
        } lg:from-[#050a0f]/90 lg:to-transparent`}
      />

      {/* client-side navigation: keeps app state (loader, scroll positions) */}
      <Link
        href={project.href}
        aria-label={project.title}
        className="absolute inset-0 z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      />

      <div
        className={`absolute inset-0 flex items-end p-4 sm:p-7 lg:items-center lg:p-12 ${
          right ? "lg:justify-end" : "lg:justify-start"
        }`}
      >
        <div className="w-full lg:max-w-md">
          <h3 className="text-2xl font-light leading-[1.05] tracking-tight drop-shadow-[0_2px_16px_rgba(5,10,15,0.7)] sm:text-4xl lg:mt-4 lg:text-6xl">
            {project.title.split(" ").map((w, k) => (
              <span
                key={k}
                className="mr-[0.25em] inline-block overflow-hidden pb-[0.12em] align-top"
              >
                <span data-line className="inline-block">
                  {w}
                </span>
              </span>
            ))}
          </h3>

          <p
            data-fade
            className="mt-4 hidden text-base leading-relaxed text-neutral-300 opacity-0 lg:block"
          >
            {project.description}
          </p>

          <Link
            data-fade
            href={project.href}
            className="group/link z-20 relative mt-7 hidden items-center gap-1.5 border-b border-transparent pb-1 text-sm font-medium text-accent opacity-0 lg:inline-flex"
          >
            MORE DETAILS
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="-rotate-45 transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover/link:rotate-0"
            >
              <path d="M5 12h14" />
              <path d="m13 6 6 6-6 6" />
            </svg>
            <span
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-[0.5px] origin-right bg-accent transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover/link:scale-x-0"
            />
            <span
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-[0.5px] origin-left scale-x-0 bg-accent transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover/link:scale-x-100 group-hover/link:delay-300"
            />
          </Link>
        </div>
      </div>
    </article>
  );
}
