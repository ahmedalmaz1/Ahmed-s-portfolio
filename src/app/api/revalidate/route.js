import { revalidateTag } from "next/cache";
import { API_URL } from "@/lib/config";
import { CONTENT_TAG } from "@/lib/content";

// Called by the admin panel after every save. The caller must hold a valid admin
// token: it is verified against the API before anything is invalidated.
export async function POST(request) {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ") || !API_URL) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let check;
  try {
    check = await fetch(`${API_URL}/admin/profile`, { headers: { Authorization: auth }, cache: "no-store" });
  } catch {
    return Response.json({ error: "API unreachable" }, { status: 502 });
  }
  if (!check.ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // expire: 0 -> the next visit waits for fresh data instead of seeing the old page
  revalidateTag(CONTENT_TAG, { expire: 0 });
  return Response.json({ ok: true });
}
