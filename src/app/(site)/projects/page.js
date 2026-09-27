import { PROJECTS } from "@/lib/projects";
import ProjectsIndexGrid from "@/components/projects/ProjectsIndexGrid";

export const metadata = {
  title: "Projects — Ahmed Almaz",
  description: "Environments and cinematics, from blockout to final render.",
};

export default function ProjectsIndexPage() {
  const projects = PROJECTS.map((p, index) => ({ ...p, index }));

  return (
    <main className="px-5 pb-[clamp(88px,12vw,150px)] pt-[120px] sm:px-8 md:px-16">
      <div className="mx-auto max-w-[1400px]">
        <h1 className="font-display text-[clamp(2.25rem,5.5vw,4rem)] font-bold leading-[1.05] tracking-[-0.02em] text-ink">
          All projects
        </h1>
        <p className="mt-4 max-w-xl text-ink2">
          Environments and cinematics, from blockout to final render.
        </p>

        <div className="mt-14 md:mt-16">
          <ProjectsIndexGrid projects={projects} />
        </div>
      </div>
    </main>
  );
}
