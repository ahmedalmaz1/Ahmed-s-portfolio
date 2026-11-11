"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

const SCROLL = 3500; // px of scrolling that plays the whole video (lower = faster)
const FOLLOW = 0.2; // 0..1, higher = video follows the scroll tighter
const EPS = 1 / 60; // ignore time differences smaller than one frame

const CUE_FADE = 260; // px of scrolling after which the scroll cue is gone

// fallback: true only when the video is unavailable (reduced motion, save-data, error)
// intro: becomes true when the loader is gone; the scroll cue appears then
export default function Hero({ src, fallback = false, intro = false }) {
  const root = useRef(null);
  const media = useRef(null);
  const video = useRef(null);
  const tint = useRef(null);
  const cue = useRef(null);
  const [ready, setReady] = useState(false); // first video frame decoded

  useGSAP(
    () => {
      const v = video.current;

      const cardRange = {
        trigger: root.current,
        start: () => `top+=${SCROLL} top`,
        end: () => `top+=${SCROLL + window.innerHeight} top`,
        scrub: true,
        invalidateOnRefresh: true,
      };

      // transform + opacity only: no blur, so scrolling stays on the GPU
      gsap.fromTo(
        media.current,
        { scale: 1 },
        { scale: 1.06, ease: "none", scrollTrigger: cardRange },
      );
      gsap.fromTo(
        tint.current,
        { opacity: 0 },
        { opacity: 1, ease: "none", scrollTrigger: cardRange },
      );

      // the cue leaves as soon as the user starts scrolling
      gsap.fromTo(
        cue.current,
        { opacity: 1, y: 0 },
        {
          opacity: 0,
          y: -12,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: `+=${CUE_FADE}`,
            scrub: true,
          },
        },
      );

      if (!src || !v) return;

      const s = { progress: 0, current: 0, seeking: false, at: 0 };
      const onSeeked = () => (s.seeking = false);
      v.addEventListener("seeked", onSeeked);

      const trigger = ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: `+=${SCROLL}`,
        onUpdate: (self) => (s.progress = self.progress),
      });

      const tick = () => {
        const d = v.duration;
        if (!d || !isFinite(d)) return;

        const target = s.progress * (d - 0.05);
        s.current += (target - s.current) * FOLLOW;
        if (Math.abs(target - s.current) < 0.001) s.current = target;

        const now = performance.now();
        const free = !s.seeking || now - s.at > 250; // safety if "seeked" is missed
        if (free && Math.abs(v.currentTime - s.current) > EPS) {
          s.seeking = true;
          s.at = now;
          v.currentTime = s.current;
        }
      };
      gsap.ticker.add(tick);

      return () => {
        gsap.ticker.remove(tick);
        v.removeEventListener("seeked", onSeeked);
        trigger.kill();
      };
    },
    { scope: root, dependencies: [src], revertOnUpdate: true },
  );

  return (
    <div ref={root} style={{ height: `calc(200vh + ${SCROLL}px)` }}>
      <section
        aria-label="Hero"
        className="grain sticky top-0 h-screen overflow-hidden bg-bg"
      >
        <div ref={media} className="absolute inset-0 will-change-transform">
          {fallback && (
            <Image
              src="/hero-poster.webp"
              alt=""
              fill
              priority
              quality={90}
              sizes="100vw"
              className="object-cover"
            />
          )}
          {src && (
            <video
              ref={video}
              src={src}
              muted
              playsInline
              preload="auto"
              disablePictureInPicture
              disableRemotePlayback
              aria-hidden="true"
              onLoadedData={() => setReady(true)}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out ${ready ? "opacity-100" : "opacity-0"}`}
            />
          )}
        </div>

        <div
          ref={tint}
          className="grain pointer-events-none absolute inset-0 bg-bg opacity-0"
        />

        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-0 bottom-[max(1.5rem,env(safe-area-inset-bottom))] z-10 flex justify-center transition-opacity duration-1000 ease-out sm:bottom-8 ${intro ? "opacity-100 delay-700" : "opacity-0"}`}
        >
          <div ref={cue} className="flex flex-col items-center gap-3">
            <span className="text-[0.6875rem] font-medium tracking-[0.4em] text-white/70 uppercase [text-indent:0.4em]">
              Scroll
            </span>
            <span className="relative block h-12 w-px overflow-hidden bg-white/20 sm:h-14">
              <span className="scroll-cue-dot absolute inset-x-0 top-0 h-1/2 bg-linear-to-b from-transparent via-white to-transparent" />
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
