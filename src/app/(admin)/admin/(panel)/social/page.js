"use client";
import { useState } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/admin/api";
import { useApi } from "@/lib/admin/useApi";
import { Alert, Button, Card, Field, Input, PageHeader, Spinner } from "@/components/admin/ui";
import { useUnsavedChanges } from "@/components/admin/dirty";

// The site shows exactly these icons, in this order (email comes from the Profile page).
// Names must match SOCIAL_PLATFORMS in the API.
const PLATFORMS = ["ArtStation", "LinkedIn", "Instagram", "Facebook"];

export default function SocialPage() {
  const { data, error, loading, reload } = useApi("/admin/social-links");
  if (loading) return <Spinner />;
  if (error) {
    return (
      <div className="space-y-3">
        <Alert>{error}</Alert>
        <Button variant="ghost" onClick={reload}>Try again</Button>
      </div>
    );
  }
  return <SocialForm links={data} />;
}

function SocialForm({ links }) {
  // platform -> saved link record ({ id, url, ... })
  const [records, setRecords] = useState(() => Object.fromEntries(links.map((l) => [l.platform, l])));
  const [values, setValues] = useState(() => Object.fromEntries(PLATFORMS.map((p) => [p, links.find((l) => l.platform === p)?.url ?? ""])));
  const [fields, setFields] = useState({});
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);

  const savedValue = (p) => records[p]?.url ?? "";
  const dirty = PLATFORMS.some((p) => values[p].trim() !== savedValue(p));
  useUnsavedChanges(dirty);

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setFields({});
    setOk(false);

    const next = { ...records };
    const failed = {};

    // one request per changed link; a failure on one doesn't block the others
    for (const [index, platform] of PLATFORMS.entries()) {
      const url = values[platform].trim();
      const record = records[platform];
      if (url === (record?.url ?? "")) continue;
      try {
        if (!url) {
          await api(`/admin/social-links/${record.id}`, { method: "DELETE" });
          delete next[platform];
        } else if (record) {
          next[platform] = await api(`/admin/social-links/${record.id}`, { method: "PATCH", json: { url } });
        } else {
          next[platform] = await api("/admin/social-links", { method: "POST", json: { platform, url, sortOrder: index } });
        }
      } catch (err) {
        failed[platform] = err instanceof ApiError ? err.fields.url || err.message : "Something went wrong.";
      }
    }

    setRecords(next);
    setFields(failed);
    if (Object.keys(failed).length) setError("Some links could not be saved. Please fix the highlighted fields.");
    else {
      setValues((v) => Object.fromEntries(PLATFORMS.map((p) => [p, next[p]?.url ?? v[p]])));
      setOk(true);
      // TODO(PR3): ask the public site to revalidate here
    }
    setBusy(false);
  }

  return (
    <form onSubmit={save} className="space-y-6" noValidate>
      <PageHeader title="Social links" description="The links behind the icons in the contact section. Leave a field empty to hide that icon." />

      <Card>
        <div className="space-y-5">
          <p className="text-sm text-mute">
            The email icon uses the address from the{" "}
            <Link href="/admin/profile" className="text-ink underline">Profile</Link> page.
          </p>
          {PLATFORMS.map((platform) => (
            <Field key={platform} label={platform} error={fields[platform]}>
              {(p) => (
                <Input
                  {...p}
                  type="url"
                  inputMode="url"
                  autoComplete="off"
                  placeholder="https://"
                  value={values[platform]}
                  onChange={(e) => {
                    setValues({ ...values, [platform]: e.target.value });
                    setOk(false);
                  }}
                />
              )}
            </Field>
          ))}
        </div>
      </Card>

      <div className="sticky bottom-0 z-20 -mx-4 space-y-3 border-t border-line bg-bg/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
        <Alert>{error}</Alert>
        <Alert kind="success">{ok && "Saved. The site will update within a minute."}</Alert>
        <div className="flex items-center gap-3">
          <Button type="submit" loading={busy} disabled={!dirty}>Save changes</Button>
          {dirty && <span className="text-xs text-mute">Unsaved changes</span>}
        </div>
      </div>
    </form>
  );
}
