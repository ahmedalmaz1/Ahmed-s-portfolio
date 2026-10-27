import { notFound } from "next/navigation";
import ProjectDetail from "@/components/project/ProjectDetail";
import { PROJECTS, getProject, getNextProject } from "@/data/projects";

export const dynamicParams = false;

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: `${project.title} | Ahmed Almaz`,
    description: project.description,
    openGraph: {
      title: `${project.title} | Ahmed Almaz`,
      description: project.description,
      images: [project.image],
    },
  };
}

export default async function ProjectPage({ params }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  return (
    <ProjectDetail
      key={project.slug}
      project={project}
      next={getNextProject(slug)}
    />
  );
}
