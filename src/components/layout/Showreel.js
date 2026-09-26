"use client";
import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function Showreel() {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [muted, setMuted] = useState(true);

  // load the <source> only once the section is nearly in view
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          io.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // play only while on screen; pause otherwise
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldLoad) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.5 },
    );
    io.observe(video);
    return () => io.disconnect();
  }, [shouldLoad]);

  // smooth entrance: a slow, subtle zoom-out as the section fills the screen
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          videoRef.current,
          { scale: 1.15 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top bottom",
              end: "top top",
              scrub: 0.6,
            },
          },
        );
        gsap.fromTo(
          ".showreel-ui",
          { autoAlpha: 0, y: 20 },
          {
            autoAlpha: 1,
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 60%",
              end: "top 20%",
              scrub: 0.6,
            },
          },
        );
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="showreel"
      className="relative flex h-svh w-full items-end overflow-hidden bg-bg"
    >
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover will-change-transform"
        poster="/showreel-poster.jpg"
        muted={muted}
        loop
        playsInline
        preload="none"
      >
        {shouldLoad && (
          <>
            <source src="/video.mp4" type="video/webm" />
            <source src="/video.mp4" type="video/mp4" />
          </>
        )}
      </video>

      {/* vignette so text stays readable on any frame of the video */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(0deg,rgba(5,19,23,.85) 0%,rgba(5,19,23,0) 30%)," +
            "linear-gradient(180deg,rgba(5,19,23,.5) 0%,rgba(5,19,23,0) 22%)",
        }}
      />

      <div className="showreel-ui relative z-10 flex w-full items-end  px-5 pb-10 sm:px-8 md:px-16 md:pb-16">
       

        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? "Unmute video" : "Mute video"}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-bg/50 text-ink2 backdrop-blur-sm transition-colors hover:border-accent hover:text-ink"
        >
          {muted ? (
            <VolumeX size={18} strokeWidth={1.5} />
          ) : (
            <Volume2 size={18} strokeWidth={1.5} />
          )}
        </button>
      </div>
    </section>
  );
}
