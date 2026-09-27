import { notFound } from "next/navigation";
import { PROJECTS } from "@/lib/projects";
import Nav from "@/components/layout/Nav";
import ProjectDetail from "@/components/projects/ProjectDetail";

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ pageId: p.slug }));
}

export async function generateMetadata({ params }) {
  const { Id } = await params;
  const project = PROJECTS.find((p) => p.slug === Id);
  if (!project) return {};
  return {
    title: `${project.title} — Ahmed Almaz`,
    description: project.summary,
  };
}

export default async function ProjectPage({ params }) {
  const { Id } = await params;
  const project = PROJECTS.find((p) => p.slug === Id);
  if (!project) notFound();

  return (
    <>
      <Nav />
      <ProjectDetail project={project} />
    </>
  );
}
