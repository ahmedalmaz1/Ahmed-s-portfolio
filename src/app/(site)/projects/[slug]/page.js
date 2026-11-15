import { notFound } from "next/navigation";
import ProjectDetail from "@/components/project/ProjectDetail";
import { getProject, getSite } from "@/lib/content";
import { nextProject } from "@/lib/content/adapters";
import { SITE_NAME } from "@/lib/site";

// Projects added later are rendered on first visit, then cached like the rest.
export async function generateStaticParams() {
  try {
    const { projects } = await getSite();
    return projects.map((p) => ({ slug: p.slug }));
  } catch {
    return []; // API unreachable at build time: render on demand instead
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return {};

  const title = `${project.title} | ${SITE_NAME}`;
  const images = project.image ? [project.image] : undefined;
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
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: project.description,
      images,
    },
  };
}

export default async function ProjectPage({ params }) {
  const { slug } = await params;
  const [project, site] = await Promise.all([getProject(slug), getSite()]);
  if (!project) notFound();
  return (
    <ProjectDetail
      key={project.slug}
      project={project}
      next={nextProject(site.projects, slug)}
    />
  );
}
