"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/admin/api";
import { extractYouTubeId, slugify } from "@/lib/admin/text";
import { Alert, Button, Card, Field, Input, PageHeader, Textarea } from "./ui";
import MediaField from "./MediaField";
import TagInput from "./TagInput";
import Gallery from "./Gallery";
import { useUnsavedChanges } from "./dirty";

const toForm = (p) => ({
  title: p?.title ?? "",
  slug: p?.slug ?? "",
  description: p?.description ?? "",
  toolkit: p?.toolkit ?? [],
  youtube: p?.youtubeId ?? "",
  poster: p?.poster ? { key: p.poster.key, url: p.poster.url, thumbKey: p.poster.thumbKey } : null,
  published: p?.published ?? true,
});

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/** Create (project = null) or edit a project. */
export default function ProjectForm({ project = null }) {
  const router = useRouter();
  const isNew = !project;
  const [saved, setSaved] = useState(() => toForm(project));
  const [form, setForm] = useState(() => toForm(project));
  // new projects follow the title until the user edits the slug by hand
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [fields, setFields] = useState({});
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const dirty = !same(form, saved);
  useUnsavedChanges(dirty || uploading);

  const set = (patch) => {
    setForm((f) => ({ ...f, ...patch }));
    setOk(false);
  };

  const ytId = extractYouTubeId(form.youtube);
  const ytInvalid = form.youtube.trim() !== "" && !ytId;

  async function save(e) {
    e.preventDefault();
    if (ytInvalid) return setFields({ youtube: "Must be a valid YouTube link or video id" });
    setBusy(true);
    setError("");
    setFields({});
    setOk(false);

    const body = {};
    if (isNew || form.title !== saved.title) body.title = form.title;
    if (isNew || form.slug !== saved.slug) body.slug = form.slug;
    if (form.description !== saved.description) body.description = form.description;
    if (!same(form.toolkit, saved.toolkit)) body.toolkit = form.toolkit;
    if (form.youtube !== saved.youtube) body.youtube = form.youtube;
    if (form.poster?.key !== saved.poster?.key) {
      body.posterKey = form.poster?.key ?? null;
      body.posterThumbKey = form.poster?.thumbKey ?? null;
    }
    if (form.published !== saved.published) body.published = form.published;

    try {
      if (isNew) {
        const created = await api("/admin/projects", { method: "POST", json: body });
        setSaved(form); // nothing left to warn about
        router.replace(`/admin/projects/${created.id}`);
        return;
      }
      const res = await api(`/admin/projects/${project.id}`, { method: "PATCH", json: body });
      const next = toForm(res);
      setSaved(next);
      setForm(next);
      setOk(true);
      // TODO(PR3): ask the public site to revalidate here
    } catch (err) {
      if (err instanceof ApiError) {
        const f = { ...err.fields };
        if (err.status === 409) f.slug = "This slug is already used by another project.";
        setFields(f);
        setError(Object.keys(f).length ? "Please fix the highlighted fields." : err.message);
      } else setError("Something went wrong.");
      setBusy(false);
      return;
    }
    setBusy(false);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isNew ? "New project" : form.title || "Edit project"}
        description={isNew ? "Fill in the details, then add the gallery images after saving." : "Changes are saved when you press Save."}
      />

      <form onSubmit={save} className="space-y-6" noValidate>
        <Card title="Details">
          <div className="space-y-5">
            <Field label="Title" error={fields.title}>
              {(p) => (
                <Input
                  {...p}
                  value={form.title}
                  maxLength={120}
                  onChange={(e) => set({ title: e.target.value, ...(slugTouched ? {} : { slug: slugify(e.target.value) }) })}
                />
              )}
            </Field>
            <Field
              label="Slug (web address)"
              error={fields.slug}
              hint={`/projects/${form.slug || "your-project"}${!isNew ? " — changing it breaks old links to this project." : ""}`}
            >
              {(p) => (
                <Input
                  {...p}
                  value={form.slug}
                  maxLength={60}
                  autoCapitalize="none"
                  spellCheck={false}
                  onChange={(e) => {
                    setSlugTouched(true);
                    set({ slug: e.target.value.toLowerCase() });
                  }}
                />
              )}
            </Field>
            <Field label="Description" error={fields.description} hint={`${form.description.length} / 3000`}>
              {(p) => <Textarea {...p} rows={6} maxLength={3000} value={form.description} onChange={(e) => set({ description: e.target.value })} />}
            </Field>
            <Field label="Toolkit" error={fields.toolkit} hint="Software used on this project, e.g. Unreal Engine 5, Blender.">
              {(p) => <TagInput {...p} value={form.toolkit} onChange={(toolkit) => set({ toolkit })} />}
            </Field>
            <label className="flex cursor-pointer items-center gap-3 text-sm">
              <input type="checkbox" className="size-5 accent-white" checked={form.published} onChange={(e) => set({ published: e.target.checked })} />
              Visible on the site
            </label>
          </div>
        </Card>

        <Card title="Cover and video">
          <div className="space-y-6">
            <MediaField
              label="Poster image"
              kind="image"
              folder="projects"
              thumb={800}
              value={form.poster}
              error={fields.posterKey || fields.posterThumbKey}
              onChange={(v) => set({ poster: v && { key: v.key, url: v.url, thumbKey: v.thumbKey } })}
            />
            <Field label="YouTube link" error={ytInvalid ? "Must be a valid YouTube link or video id" : fields.youtube} hint="Paste the video link. Optional.">
              {(p) => <Input {...p} inputMode="url" placeholder="https://www.youtube.com/watch?v=…" value={form.youtube} onChange={(e) => set({ youtube: e.target.value })} />}
            </Field>
            {ytId && (
              <div className="aspect-video w-full max-w-md overflow-hidden rounded-xl border border-line bg-black">
                <iframe
                  title="YouTube preview"
                  src={`https://www.youtube-nocookie.com/embed/${ytId}`}
                  loading="lazy"
                  allow="encrypted-media; picture-in-picture"
                  allowFullScreen
                  className="size-full"
                />
              </div>
            )}
          </div>
        </Card>

        <div className="sticky bottom-0 z-20 -mx-4 space-y-3 border-t border-line bg-bg/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
          <Alert>{error}</Alert>
          <Alert kind="success">{ok && "Saved. The site will update within a minute."}</Alert>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" loading={busy} disabled={!dirty}>
              {isNew ? "Create project" : "Save changes"}
            </Button>
            <Button variant="ghost" onClick={() => router.push("/admin/projects")}>
              Back to projects
            </Button>
            {dirty && <span className="text-xs text-mute">Unsaved changes</span>}
          </div>
        </div>
      </form>

      {!isNew && (
        <Card title="Gallery" description="Drag to reorder. Alt text is saved when you leave the field.">
          <Gallery projectId={project.id} initial={project.images} onBusy={setUploading} />
        </Card>
      )}
    </div>
  );
}
