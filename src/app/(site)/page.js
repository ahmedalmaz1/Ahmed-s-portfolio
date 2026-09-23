import dynamic from "next/dynamic";
const About = dynamic(() => import("@/components/About"));
const Contact = dynamic(() => import("@/components/Contact"));
const Hero = dynamic(() => import("@/components/Hero"));
const Nav = dynamic(() => import("@/components/Nav"));
const Projects = dynamic(() => import("@/components/Projects"));

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <About />
        <Projects />
        <Contact />
      </main>
    </>
  );
}
