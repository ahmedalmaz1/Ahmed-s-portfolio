"use client";
import { useState } from "react";
import { api, ApiError } from "@/lib/admin/api";
import { useApi } from "@/lib/admin/useApi";
import {
  Alert,
  Button,
  Card,
  Field,
  Input,
  PageHeader,
  Spinner,
  Textarea,
} from "@/components/admin/ui";
import MediaField from "@/components/admin/MediaField";
import { useUnsavedChanges } from "@/components/admin/dirty";

const toForm = (p) => ({
  name: p.name ?? "",
  bio: p.bio ?? "",
  email: p.email ?? "",
  avatar: p.avatar,
  showreel: p.showreel ? { key: p.showreel.key, url: p.showreel.url } : null,
  poster: p.showreel?.poster ?? null,
  cv: p.cv ? { key: p.cv.key, url: p.cv.url } : null,
});

const keyOf = (v) => v?.key ?? null;

export default function ProfilePage() {
  const { data, error, loading, reload } = useApi("/admin/profile");
  if (loading) return <Spinner />;
  if (error) {
    return (
      <div className="space-y-3">
        <Alert>{error}</Alert>
        <Button variant="ghost" onClick={reload}>
          Try again
        </Button>
      </div>
    );
  }
  return <ProfileForm initial={toForm(data)} />;
}

function ProfileForm({ initial }) {
  const [saved, setSaved] = useState(initial);
  const [form, setForm] = useState(initial);
  const [fields, setFields] = useState({});
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);

  const dirty = JSON.stringify(form) !== JSON.stringify(saved);
  useUnsavedChanges(dirty);

  const set = (patch) => {
    setForm((f) => ({ ...f, ...patch }));
    setOk(false);
  };

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setFields({});
    setOk(false);

    // send only what changed
    const body = {};
    if (form.name !== saved.name) body.name = form.name;
    if (form.bio !== saved.bio) body.bio = form.bio;
    if (form.email !== saved.email) body.email = form.email;
    if (keyOf(form.avatar) !== keyOf(saved.avatar))
      body.avatarKey = keyOf(form.avatar);
    if (keyOf(form.showreel) !== keyOf(saved.showreel))
      body.showreelKey = keyOf(form.showreel);
    if (keyOf(form.poster) !== keyOf(saved.poster))
      body.showreelPosterKey = keyOf(form.poster);
    if (keyOf(form.cv) !== keyOf(saved.cv)) body.cvKey = keyOf(form.cv);

    try {
      const res = await api("/admin/profile", { method: "PATCH", json: body });
      const next = toForm(res);
      setSaved(next);
      setForm(next);
      setOk(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setFields(err.fields);
        setError(
          Object.keys(err.fields).length
            ? "Please fix the highlighted fields."
            : err.message,
        );
      } else setError("Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-6" noValidate>
      <PageHeader
        title="Profile"
        description="Your name, bio and showreel as shown on the site."
      />

      <Card title="About you">
        <div className="space-y-5">
          <Field label="Name" error={fields.name}>
            {(p) => (
              <Input
                {...p}
                value={form.name}
                maxLength={100}
                onChange={(e) => set({ name: e.target.value })}
              />
            )}
          </Field>
          <Field
            label="Bio"
            error={fields.bio}
            hint={`${form.bio.length} / 3000`}
          >
            {(p) => (
              <Textarea
                {...p}
                rows={7}
                value={form.bio}
                maxLength={3000}
                onChange={(e) => set({ bio: e.target.value })}
              />
            )}
          </Field>
          <Field
            label="Email"
            error={fields.email}
            hint="Shown in the contact section."
          >
            {(p) => (
              <Input
                {...p}
                type="email"
                autoComplete="off"
                value={form.email}
                onChange={(e) => set({ email: e.target.value })}
              />
            )}
          </Field>
          <MediaField
            label="Profile photo"
            kind="image"
            folder="avatars"
            shape="round"
            max={1024}
            value={form.avatar}
            error={fields.avatarKey}
            onChange={(v) => set({ avatar: v && { key: v.key, url: v.url } })}
          />
        </div>
      </Card>

      <Card
        title="CV"
        description="PDF, up to 10 MB. Visitors can view it (View CV) or download it from the About section. Uploading a new file replaces the old one."
      >
        <MediaField
          label="CV (PDF)"
          kind="pdf"
          value={form.cv}
          error={fields.cvKey}
          onChange={(v) => set({ cv: v && { key: v.key, url: v.url } })}
        />
      </Card>

      <Card
        title="Showreel"
        description="MP4 video, up to 90 MB. Compress it first if it is larger. The poster shows before the video plays."
      >
        <div className="space-y-6">
          <MediaField
            label="Video (MP4)"
            kind="video"
            value={form.showreel}
            error={fields.showreelKey}
            onChange={(v) => set({ showreel: v && { key: v.key, url: v.url } })}
          />
          <MediaField
            label="Poster image"
            kind="image"
            folder="showreel"
            value={form.poster}
            error={fields.showreelPosterKey}
            onChange={(v) => set({ poster: v && { key: v.key, url: v.url } })}
          />
        </div>
      </Card>

      <div className="sticky bottom-0 z-20 -mx-4 space-y-3 border-t border-line bg-bg/95 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur sm:-mx-6 sm:px-6 xl:-mx-8 xl:px-8">
        <Alert>{error}</Alert>
        <Alert kind="success">
          {ok && "Saved. The site will update within a minute."}
        </Alert>
        <div className="flex items-center gap-3">
          <Button type="submit" loading={busy} disabled={!dirty}>
            Save changes
          </Button>
          {dirty && <span className="text-xs text-mute">Unsaved changes</span>}
        </div>
      </div>
    </form>
  );
}
