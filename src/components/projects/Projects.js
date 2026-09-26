import ProjectsGallery from "./ProjectsGallery";
import { PROJECTS } from "@/lib/projects"; // your DB call

export default async function Projects() {
  return <ProjectsGallery projects={PROJECTS} />;
}
