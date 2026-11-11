"use client";
import { memo, useCallback, useState } from "react";
import { useHeroVideo } from "@/hooks/useHeroVideo";
import Loader from "@/components/Loader";
import Hero from "@/components/layout/Hero";
import Nav from "@/components/layout/Nav";
import About from "@/components/layout/About";
import Projects from "@/components/project/ProjectsSection";
import Showreel from "@/components/layout/Showreel";
import Contact from "@/components/layout/Contact";
import Footer from "@/components/layout/Footer";

// Static sections: memoised so the per-percent loader progress updates in
// Home never re-render them.
const Sections = memo(function Sections() {
  return (
    <>
      <About />
      <Projects />
      <Showreel />
      <Contact />
    </>
  );
});

export default function Home() {
  const [loaded, setLoaded] = useState(false);
  const { src, progress } = useHeroVideo();
  const handleComplete = useCallback(() => setLoaded(true), []);

  return (
    <>
      {!loaded && (
        <Loader
          name="Ahmed Almaz"
          progress={progress}
          onComplete={handleComplete}
        />
      )}

      <main>
        <Hero src={src} fallback={progress >= 1 && !src} />
        <Nav visible={loaded} />
        <Sections />
      </main>
      <Footer />
    </>
  );
}
