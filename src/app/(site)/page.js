import dynamic from "next/dynamic";
const About = dynamic(() => import("@/components/layout/About"));
const Contact = dynamic(() => import("@/components/layout/Contact"));
const Hero = dynamic(() => import("@/components/layout/Hero"));
const Nav = dynamic(() => import("@/components/layout/Nav"));
const Projects = dynamic(() => import("@/components/projects/Projects"));
const PortraitTravel = dynamic(() => import("@/components/PortraitTravel"));
const Showreel = dynamic(() => import("@/components/layout/Showreel"));

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <About />
        <Showreel />
        <Projects />
      </main>
      <Contact />
      <PortraitTravel />
    </>
  );
}
