"use client";
import { useFrames } from "@/hooks/useFrames";
import { useState } from "react";
import dynamic from "next/dynamic";
const Projects = dynamic(() => import("@/components/project/projects"));
const Hero = dynamic(() => import("@/components/layout/Hero"));
const About = dynamic(() => import("@/components/layout/About"));
const Nav = dynamic(() => import("@/components/layout/Nav"));
const Contact = dynamic(() => import("@/components/layout/Contact"));
const Showreel = dynamic(() => import("@/components/layout/Showreel"));
const Loader = dynamic(() => import("@/components/Loader"));
const Footer = dynamic(() => import("@/components/layout/Footer"));

export default function Home() {
  const [loaded, setLoaded] = useState(false);
  const { frames, total, progress } = useFrames();

  return (
    <>
      {!loaded && (
        <Loader
          name="Ahmed Almaz"
          progress={progress}
          onReveal={() => console.log("hero intro here")}
          onComplete={() => setLoaded(true)}
        />
      )}

      <main>
        <Hero frames={frames} total={total} />
        <Nav visible={loaded} />

        <About />
        <Projects />
        <Showreel />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
