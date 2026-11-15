import { getSite } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

export default async function sitemap() {
  const pages = [
    { url: SITE_URL, priority: 1 },
    { url: `${SITE_URL}/projects`, priority: 0.8 },
  ];
  try {
    const { projects } = await getSite();
    return [...pages, ...projects.map((p) => ({ url: `${SITE_URL}${p.href}`, priority: 0.6 }))];
  } catch {
    return pages; // API unreachable: still serve the static pages
  }
}
