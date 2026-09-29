import dynamic from "next/dynamic";
const AboutEmbers = dynamic(() => import("../AboutEmbers"));
export default function About() {
  return (
    <section
      id="about"
      className="relative isolate  z-0 flex min-h-svh items-center overflow-x-clip"
    >
      <AboutEmbers />
      <div className="mx-auto grid w-full max-w-[1240px] grid-cols-1 items-center gap-8 px-5 py-[clamp(88px,12vw,150px)] sm:px-8 md:grid-cols-[0.85fr_1.15fr] md:gap-16 md:px-16">
        <div
          id="about-portrait-slot"
          aria-hidden="true"
          className="mx-auto w-[min(300px,60vw)] p-3.5 motion-reduce:hidden"
        >
          <div className="aspect-[3/4]" />
        </div>

        <div
          id="about-copy"
          className="relative z-10 text-center motion-safe:*:opacity-0 md:col-start-2 md:text-left"
        >
          <h2 className="font-display text-[clamp(2rem,4.4vw,3.5rem)] font-bold leading-[1.05] tracking-[-0.02em] text-ink">
            Light first, detail second.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-ink2 md:mx-0">
            I came to Unreal Engine from 3D modeling and stayed because
            lighting, layout and camera all come together in real time. I build
            a scene the way a cinematographer would: decide the mood, block the
            shot, then add detail only where the eye lands.
          </p>
        </div>
      </div>
    </section>
  );
}
