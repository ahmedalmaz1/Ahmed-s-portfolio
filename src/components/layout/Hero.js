"use client";
import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { SCROLL_PRESETS, useScrollPreset } from "@/components/SmoothScroll";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const SCROLL = 4000;

export default function Hero({ frames, total }) {
  const root = useRef(null);
  const media = useRef(null);
  const cv = useRef(null);
  const tint = useRef(null);

  useScrollPreset(root, {
    inside: SCROLL_PRESETS.hero,
    outside: SCROLL_PRESETS.site,
    end: "bottom bottom",
  });

  useGSAP(
    () => {
      if (!total) return;
      const canvas = cv.current;
      const ctx = canvas.getContext("2d");
      const state = { frame: 0 };
      let last = -1;

      const probe = document.createElement("canvas");
      probe.width = probe.height = 8;
      const pctx = probe.getContext("2d", { willReadFrequently: true });
      const blackCache = new Map();

      const isBlack = (i) => {
        if (blackCache.has(i)) return blackCache.get(i);
        pctx.drawImage(frames.current[i], 0, 0, 8, 8);
        const d = pctx.getImageData(0, 0, 8, 8).data;
        let sum = 0;
        for (let k = 0; k < d.length; k += 4) {
          sum += d[k] * 0.2126 + d[k + 1] * 0.7152 + d[k + 2] * 0.0722;
        }
        const black = sum / 64 < 3;
        blackCache.set(i, black);
        return black;
      };

      const draw = () => {
        let i = Math.round(state.frame);
        while (i > 0 && (!frames.current[i] || isBlack(i))) i--;
        const img = frames.current[i];
        if (!img || i === last) return;
        last = i;
        const r = Math.max(
          canvas.width / img.width,
          canvas.height / img.height,
        );
        ctx.drawImage(
          img,
          (canvas.width - img.width * r) / 2,
          (canvas.height - img.height * r) / 2,
          img.width * r,
          img.height * r,
        );
      };

      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio, 2);
        canvas.width = canvas.clientWidth * dpr;
        canvas.height = canvas.clientHeight * dpr;
        last = -1;
        draw();
      };

      resize();
      window.addEventListener("resize", resize);
      gsap.ticker.add(draw);

      const cardRange = {
        trigger: root.current,
        start: () => `top+=${SCROLL} top`,
        end: () => `top+=${SCROLL + window.innerHeight} top`,
        scrub: true,
        invalidateOnRefresh: true,
      };

      gsap.to(state, {
        frame: total - 1,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: `+=${SCROLL}`,
          scrub: true,
        },
      });

      gsap.fromTo(
        media.current,
        { filter: "blur(0px) brightness(1)", scale: 1 },
        {
          filter: "blur(10px) brightness(0.45)",
          scale: 1.06,
          ease: "none",
          scrollTrigger: cardRange,
        },
      );

      gsap.fromTo(
        tint.current,
        { opacity: 0 },
        { opacity: 1, ease: "none", scrollTrigger: cardRange },
      );

      return () => {
        window.removeEventListener("resize", resize);
        gsap.ticker.remove(draw);
      };
    },
    { scope: root, dependencies: [total], revertOnUpdate: true },
  );

  return (
    <div ref={root} style={{ height: `calc(200vh + ${SCROLL}px)` }}>
      <section
        aria-label="Hero"
        className="grain sticky top-0 h-screen overflow-hidden bg-bg"
      >
        <div
          ref={media}
          className="absolute inset-0 will-change-[filter,transform]"
        >
          <Image
            src="/hero-poster.webp"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <canvas ref={cv} className="absolute inset-0 h-full w-full" />
        </div>

        <div
          ref={tint}
          className="grain pointer-events-none absolute inset-0 bg-bg opacity-0"
        />
      </section>
    </div>
  );
}
