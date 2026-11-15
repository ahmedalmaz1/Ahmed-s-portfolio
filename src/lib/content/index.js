import "server-only";
import { cache } from "react";
import { API_URL } from "@/lib/config";
import { SITE_NAME } from "@/lib/site";
import { toProject, toSite } from "./adapters";

export const CONTENT_TAG = "content";
// Safety net: pages refresh at least this often even if an on-demand
// revalidation request (sent by the admin panel after each save) is missed.
export const REVALIDATE_SECONDS = 60;

async function get(path) {
  if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL is not set");
  const res = await fetch(`${API_URL}${path}`, {
    next: { tags: [CONTENT_TAG], revalidate: REVALIDATE_SECONDS },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`API ${path} responded ${res.status}`);
  return res.json();
}

/** Profile, social links and published projects. Deduplicated per request. */
export const getSite = cache(async () => toSite(await get("/site"), SITE_NAME));

/** One published project with its gallery, or null. */
export const getProject = cache(async (slug) => {
  const data = await get(`/projects/${encodeURIComponent(slug)}`);
  return data && toProject(data, SITE_NAME);
});
