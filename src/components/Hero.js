"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import LensHud from "./LensHud";
import Portrait from "./Portrait";

const HeroCanvas = dynamic(() => import("./three/HeroCanvas"), { ssr: false });

export default function Hero() {
  const heroRef = useRef(null);
  const [lensMm, setLensMm] = useState(35);
  const [fovDegrees, setFovDegrees] = useState(
    2 * Math.atan(12 / 35) * (180 / Math.PI),
  );

  const handleLensChange = (mm) => {
    setLensMm(mm);
    setFovDegrees(2 * Math.atan(12 / mm) * (180 / Math.PI));
  };

  return (
    <section
      id="top"
      ref={heroRef}
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden"
      style={{
        background:
          "radial-gradient(70% 60% at 72% 62%, rgba(240,179,65,.16), rgba(240,179,65,0) 70%)",
      }}
    >
      <HeroCanvas heroRef={heroRef} fovDegrees={fovDegrees} />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 opacity-10 mix-blend-overlay"
        style={{ backgroundImage: "var(--grain)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg,rgba(5,19,23,.6) 0%,rgba(5,19,23,0) 18%)," +
            "linear-gradient(0deg,#051317 0%,rgba(5,19,23,0) 20%)," +
            "linear-gradient(90deg,rgba(5,19,23,.84) 0%,rgba(5,19,23,.5) 45%,rgba(5,19,23,0) 78%)",
        }}
      />

      <div className="mx-auto grid w-full max-w-[1240px] grid-cols-1 items-center gap-8 px-5 pb-[116px] pt-[120px] sm:px-8 md:grid-cols-[1.15fr_0.85fr] md:gap-16 md:px-16">
        <div>
          <h1
            aria-label="Ahmed Almaz"
            className="font-display text-[clamp(2rem,5vw,5rem)] font-extrabold leading-[0.92] tracking-[-0.03em]"
          >
            <span className="motion-safe:animate-wipe block">Ahmed</span>
            <span className="motion-safe:animate-wipe block [animation-delay:0.14s]">
              Almaz
            </span>
          </h1>
          <p className="motion-safe:animate-settle mt-6 font-display text-[clamp(1.05rem,1.8vw,1.35rem)] font-semibold text-accent [animation-delay:0.5s]">
            Environment and cinematic artist
          </p>
          <p className="motion-safe:animate-settle mt-5 max-w-md text-lg text-ink2 [animation-delay:0.62s]">
            I&rsquo;m a 3D artist building environments and cinematics in Unreal
            Engine 5. I take a scene from blockout to lighting, camera and final
            render, and I care most about the mood of every frame.
          </p>
          <div className="motion-safe:animate-settle mt-8 flex flex-wrap gap-3 [animation-delay:0.74s]">
            <a
              href="#projects"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-accent bg-accent px-6 font-semibold text-bg transition-colors hover:border-accent-light hover:bg-accent-light"
            >
              See my work
            </a>
            <a
              href="#contact"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-line px-6 font-semibold transition-colors hover:border-muted"
            >
              Contact me
            </a>
          </div>
        </div>

        <div className="motion-safe:animate-arch">
          <Portrait />
        </div>
      </div>

      {/* <div className="motion-safe:animate-settle [animation-delay:0.9s]">
        <LensHud activeMm={lensMm} onChange={handleLensChange} />
      </div> */}
    </section>
  );
}
