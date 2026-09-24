"use client";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
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
      className="relative isolate z-10 flex min-h-[100svh] items-center"
      style={{
        background:
          "radial-gradient(70% 60% at 72% 62%, rgba(240,179,65,.16), rgba(240,179,65,0) 70%)",
      }}
    >
      <div className="absolute inset-0 overflow-hidden">
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
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-[1240px] grid-cols-1 items-center gap-8 px-5 pb-12 pt-36 sm:px-8 md:grid-cols-[1.15fr_0.85fr] md:gap-16 md:px-16 md:pb-20 md:pt-40">
        {" "}
        <div className="text-center md:text-left">
          <h1
            aria-label="Ahmed Almaz"
            className="text-balance font-display text-[clamp(2.5rem,11vw,3.5rem)] font-extrabold leading-[0.92] tracking-[-0.03em] md:text-[clamp(2rem,5vw,5rem)]"
          >
            <span className="motion-safe:animate-wipe block">Ahmed</span>
            <span className="motion-safe:animate-wipe block [animation-delay:0.14s]">
              Almaz
            </span>
          </h1>
          <p className="motion-safe:animate-settle mt-5 font-display text-[clamp(1.05rem,1.8vw,1.35rem)] font-semibold text-accent [animation-delay:0.5s] md:mt-6">
            Environment and cinematic artist
          </p>
          <p className="motion-safe:animate-settle mx-auto mt-4 max-w-md text-pretty text-sm text-ink2 [animation-delay:0.62s] md:mx-0 md:mt-5">
            I&rsquo;m a 3D artist building environments and cinematics in Unreal
            Engine 5. I take a scene from blockout to lighting, camera and final
            render, and I care most about the mood of every frame.
          </p>
        </div>
        <div id="hero-portrait-slot">
          <div id="portrait-mover" className="will-change-transform">
            <div className="motion-safe:animate-arch">
              <Portrait />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
