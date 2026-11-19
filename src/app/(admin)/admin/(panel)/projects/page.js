"use client";
import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/admin/api";
import { useApi } from "@/lib/admin/useApi";
import {
  Alert,
  Button,
  ConfirmDialog,
  PageHeader,
  Spinner,
} from "@/components/admin/ui";
import SortableList from "@/components/admin/SortableList";

export default function ProjectsPage() {
  const { data, setData, error, loading, reload } = useApi("/admin/projects");
  const [notice, setNotice] = useState("");
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [pending, setPending] = useState(new Set()); // ids with a request in flight

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

  async function reorder(next) {
    const previous = data;
    setData(next); // optimistic: the row stays where it was dropped
    setNotice("");
    try {
      setData(
        await api("/admin/projects/reorder", {
          method: "PUT",
          json: { ids: next.map((p) => p.id) },
        }),
      );
    } catch (err) {
      setData(previous);
      setNotice(`Could not save the new order: ${err.message}`);
    }
  }

  async function toggle(project) {
    setPending((s) => new Set(s).add(project.id));
    setNotice("");
    try {
      const res = await api(`/admin/projects/${project.id}`, {
        method: "PATCH",
        json: { published: !project.published },
      });
      setData((list) =>
        list.map((p) =>
          p.id === res.id ? { ...p, published: res.published } : p,
        ),
      );
    } catch (err) {
      setNotice(err.message);
    } finally {
      setPending((s) => {
        const next = new Set(s);
        next.delete(project.id);
        return next;
      });
    }
  }

  async function remove() {
    setDeleting(true);
    try {
      await api(`/admin/projects/${toDelete.id}`, { method: "DELETE" });
      setData((list) => list.filter((p) => p.id !== toDelete.id));
    } catch (err) {
      setNotice(err.message);
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Drag a project by its handle to change the order it appears in on the site."
        actions={
          <Link
            href="/admin/projects/new"
            className="inline-flex min-h-10 items-center rounded-lg bg-brand px-4 text-sm font-medium text-bg hover:bg-white"
          >
            + New project
          </Link>
        }
      />
      <Alert>{notice}</Alert>

      {data.length === 0 && (
        <p className="text-sm text-mute">
          No projects yet. Create the first one.
        </p>
      )}

      <SortableList
        items={data}
        onReorder={reorder}
        renderItem={(project, handle) => (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-3 p-2">
            {handle}
            {project.poster ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={project.poster.thumbUrl}
                alt=""
                loading="lazy"
                width={64}
                height={48}
                className="h-12 w-16 shrink-0 rounded-lg bg-bg object-cover"
              />
            ) : (
              <div className="grid h-12 w-16 shrink-0 place-items-center rounded-lg bg-bg text-[10px] text-mute">
                No image
              </div>
            )}
            <div className="min-w-0 flex-1 basis-40">
              <Link
                href={`/admin/projects/${project.id}`}
                className="block truncate text-sm font-medium hover:underline"
              >
                {project.title}
              </Link>
              <p className="truncate text-xs text-mute">/{project.slug}</p>
            </div>
            <div className="flex w-full flex-wrap items-center gap-2 pl-12 sm:w-auto sm:flex-nowrap sm:pl-0">
              <button
                type="button"
                role="switch"
                aria-checked={project.published}
                aria-label={project.published ? "Hide project" : "Show project"}
                disabled={pending.has(project.id)}
                onClick={() => toggle(project)}
                className={`min-h-10 rounded-lg border px-3 text-xs font-medium transition disabled:opacity-50 ${
                  project.published
                    ? "border-ok/40 bg-ok/10 text-ok"
                    : "border-line text-mute"
                }`}
              >
                {project.published ? "Visible" : "Hidden"}
              </button>
              <Link
                href={`/admin/projects/${project.id}`}
                className="inline-flex min-h-10 items-center rounded-lg border border-line px-4 text-sm hover:bg-panel2"
              >
                Edit
              </Link>
              <Button variant="danger" onClick={() => setToDelete(project)}>
                Delete
              </Button>
            </div>
          </div>
        )}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete this project?"
        message={
          toDelete
            ? `"${toDelete.title}" and all its images will be deleted permanently. This cannot be undone.`
            : ""
        }
        loading={deleting}
        onConfirm={remove}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
