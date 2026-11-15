import ProjectsIndex from "@/components/project/ProjectsIndex";
import { getSite } from "@/lib/content";

export const metadata = {
  title: "Projects | Ahmed Almaz",
  description:
    "Selected real-time environments and cinematics by Ahmed Almaz, built in Unreal Engine 5.",
};

export default async function ProjectsPage() {
  const { projects } = await getSite();
  return <ProjectsIndex projects={projects} />;
}
