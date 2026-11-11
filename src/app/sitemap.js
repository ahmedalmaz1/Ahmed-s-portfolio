import { PROJECTS } from "@/data/projects";
import { SITE_URL } from "@/lib/site";

export default function sitemap() {
  return [
    { url: SITE_URL, priority: 1 },
    { url: `${SITE_URL}/projects`, priority: 0.8 },
    ...PROJECTS.map((p) => ({ url: `${SITE_URL}${p.href}`, priority: 0.6 })),
  ];
}
