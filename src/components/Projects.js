import ProjectItem from './ProjectItem';
import { PROJECTS } from '@/lib/projects';

export default function Projects() {
  return (
    <section id="projects" className="px-5 py-[clamp(88px,12vw,150px)] sm:px-8 md:px-16">
      <div className="mx-auto max-w-[1240px]">
        <h2 className="font-display text-[clamp(2rem,4.4vw,3.5rem)] font-bold leading-[1.05] tracking-[-0.02em]">
          Selected work
        </h2>
        <p className="mt-4 max-w-xl text-ink2">
          Three environments, each shown as a blockout and as the final render. Drag the slider to compare them.
        </p>

        <ul className="mt-12 border-t border-line">
          {PROJECTS.map((project, i) => (
            <ProjectItem key={project.slug} project={project} defaultOpen={i === 0} />
          ))}
        </ul>
      </div>
    </section>
  );
}
