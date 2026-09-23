import PipelineScene from './PipelineScene';

export default function About() {
  return (
    <section id="about" className="px-5 py-[clamp(88px,12vw,150px)] sm:px-8 md:px-16">
      <div className="mx-auto grid max-w-[1240px] grid-cols-1 gap-8 md:grid-cols-[5fr_7fr] md:gap-16">
        <h2 className="font-display text-[clamp(2rem,4.4vw,3.5rem)] font-bold leading-[1.05] tracking-[-0.02em]">
          Light first, detail second.
        </h2>
        <div>
          <p className="max-w-xl text-ink2">
            I came to Unreal Engine from 3D modeling and stayed because lighting, layout and camera all come
            together in real time. I build a scene the way a cinematographer would: decide the mood, block the
            shot, then add detail only where the eye lands.
          </p>
          <PipelineScene />
        </div>
      </div>
    </section>
  );
}
