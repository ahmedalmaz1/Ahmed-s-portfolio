import { notFound } from "next/navigation";
import ProjectDetail from "@/components/project/ProjectDetail";
import { PROJECTS, getProject, getNextProject } from "@/data/projects";
import { SITE_NAME } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};

  const title = `${project.title} | ${SITE_NAME}`;
  return {
    title,
    description: project.description,
    alternates: { canonical: project.href },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title,
      description: project.description,
      url: project.href,
      images: [project.image],
    },
    twitter: {
      card: "summary_large_image",
      title,
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
