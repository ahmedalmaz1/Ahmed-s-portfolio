"use client";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function PortraitTravel() {
  useGSAP(() => {
    const hero = document.getElementById("top");
    const about = document.getElementById("about");
    const heroSlot = document.getElementById("hero-portrait-slot");
    const aboutSlot = document.getElementById("about-portrait-slot");
    const mover = document.getElementById("portrait-mover");
    if (!hero || !about || !heroSlot || !aboutSlot || !mover) return;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const center = (el) => {
        const r = el.getBoundingClientRect();
        return {
          x: r.left + r.width / 2,
          y: r.top + r.height / 2 + window.scrollY,
        };
      };

      const copyItems = gsap.utils.toArray("#about-copy > *");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: hero,
          endTrigger: about,
          start: "top top",
          end: "top top", // portrait lands when About reaches the top
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      tl.to(
        mover,
        {
          y: () => center(aboutSlot).y - center(heroSlot).y,
          duration: 1,
          ease: "none",
        },
        0,
      )
        .to(
          mover,
          {
            x: () => center(aboutSlot).x - center(heroSlot).x,
            duration: 1,
            ease: "power2.inOut",
          },
          0,
        )
        // About text: hidden while the portrait travels, then slides in from the right
        .fromTo(
          copyItems,
          { autoAlpha: 0, x: 80 },
          {
            autoAlpha: 1,
            x: 0,
            duration: 0.3,
            ease: "power2.out",
            stagger: 0.08,
          },
          0.62,
        );
    });

    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  });

  return null;
}
