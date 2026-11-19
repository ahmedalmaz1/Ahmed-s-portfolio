"use client";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/admin/api";
import { checkImageFile, SIZES, uploadImage } from "@/lib/admin/image";
import { Alert, Button, ConfirmDialog, Input, ProgressBar } from "./ui";
import SortableList from "./SortableList";

const MAX_IMAGES = 40; // same limit as the API

/** Gallery of an existing project. Every action is saved immediately. */
export default function Gallery({ projectId, initial, onBusy }) {
  const [images, setImages] = useState(initial);
  const [queue, setQueue] = useState([]); // uploads in progress / failed
  const [notice, setNotice] = useState("");
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const input = useRef(null);
  const abort = useRef(null);

  const uploading = queue.some((q) => !q.error);
  useEffect(() => onBusy?.(uploading), [uploading, onBusy]);
  useEffect(() => () => abort.current?.abort(), []);

  const patchQueue = (id, patch) =>
    setQueue((q) =>
      q.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );

  async function addFiles(fileList) {
    setNotice("");
    const files = [...fileList];
    const room =
      MAX_IMAGES - images.length - queue.filter((q) => !q.error).length;
    const accepted = [];
    const problems = [];
    for (const file of files) {
      const bad = checkImageFile(file);
      if (bad) problems.push(bad);
      else if (accepted.length >= room)
        problems.push(
          `"${file.name}" skipped: a project can have up to ${MAX_IMAGES} images.`,
        );
      else accepted.push(file);
    }
    if (problems.length) setNotice(problems.join(" "));
    if (!accepted.length) return;

    const items = accepted.map((file) => ({
      id: crypto.randomUUID(),
      file,
      name: file.name,
      stage: "Waiting…",
      progress: 0,
      error: "",
    }));
    setQueue((q) => [...q, ...items]);
    abort.current = new AbortController();

    // one at a time: gentle on phones and keeps the order of the selection
    for (const item of items) {
      if (abort.current.signal.aborted) return;
      try {
        const up = await uploadImage(item.file, {
          folder: "projects",
          thumb: SIZES.thumb,
          signal: abort.current.signal,
          onStage: (stage) => patchQueue(item.id, { stage }),
          onProgress: (progress) => patchQueue(item.id, { progress }),
        });
        patchQueue(item.id, { stage: "Saving…", progress: 1 });
        const image = await api(`/admin/projects/${projectId}/images`, {
          method: "POST",
          json: {
            imageKey: up.key,
            thumbKey: up.thumbKey,
            width: up.width,
            height: up.height,
          },
        });
        setImages((list) => [...list, image]);
        setQueue((q) => q.filter((x) => x.id !== item.id));
      } catch (err) {
        if (err.name === "AbortError") return;
        patchQueue(item.id, { error: err.message, stage: "" });
      }
    }
  }

  async function reorder(next) {
    const previous = images;
    setImages(next);
    setNotice("");
    try {
      setImages(
        await api(`/admin/projects/${projectId}/images/reorder`, {
          method: "PUT",
          json: { ids: next.map((i) => i.id) },
        }),
      );
    } catch (err) {
      setImages(previous);
      setNotice(err.message);
    }
  }

  async function remove() {
    setDeleting(true);
    try {
      await api(`/admin/projects/images/${toDelete.id}`, { method: "DELETE" });
      setImages((list) => list.filter((i) => i.id !== toDelete.id));
    } catch (err) {
      setNotice(err.message);
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  }

  return (
    <div className="space-y-4">
      <input
        ref={input}
        type="file"
        multiple
        hidden
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="ghost"
          onClick={() => input.current.click()}
          disabled={images.length >= MAX_IMAGES}
        >
          + Add images
        </Button>
        <span className="text-xs text-mute">
          {images.length} / {MAX_IMAGES} · JPG, PNG, WebP or AVIF. Large photos
          are optimised automatically.
        </span>
      </div>

      <Alert>{notice}</Alert>

      {queue.length > 0 && (
        <ul className="space-y-2">
          {queue.map((q) => (
            <li key={q.id} className="rounded-xl border border-line bg-bg p-3">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0 truncate">{q.name}</span>
                {q.error ? (
                  <button
                    type="button"
                    className="text-xs text-mute hover:text-ink"
                    onClick={() =>
                      setQueue((x) => x.filter((i) => i.id !== q.id))
                    }
                  >
                    Dismiss
                  </button>
                ) : (
                  <span className="shrink-0 text-xs text-mute">{q.stage}</span>
                )}
              </div>
              {q.error ? (
                <p className="mt-1 text-xs text-danger">{q.error}</p>
              ) : (
                <div className="mt-2">
                  <ProgressBar
                    value={
                      q.stage === "Uploading…" || q.stage === "Saving…"
                        ? q.progress
                        : 0
                    }
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {images.length === 0 && queue.length === 0 && (
        <p className="text-sm text-mute">No images yet.</p>
      )}

      <SortableList
        items={images}
        onReorder={reorder}
        renderItem={(image, handle) => (
          <ImageRow
            image={image}
            handle={handle}
            onDelete={() => setToDelete(image)}
            onError={setNotice}
            onSaved={(saved) =>
              setImages((l) => l.map((i) => (i.id === saved.id ? saved : i)))
            }
          />
        )}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete this image?"
        message="It will be removed from the project and from storage."
        loading={deleting}
        onConfirm={remove}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}

function ImageRow({ image, handle, onDelete, onSaved, onError }) {
  const [alt, setAlt] = useState(image.alt);
  const [saved, setSaved] = useState(image.alt);

  async function saveAlt() {
    const value = alt.trim();
    if (value === saved) return;
    try {
      onSaved(
        await api(`/admin/projects/images/${image.id}`, {
          method: "PATCH",
          json: { alt: value },
        }),
      );
      setSaved(value);
      setAlt(value);
    } catch (err) {
      onError(err.fields?.alt || err.message);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-3 p-2">
      {handle}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.thumbUrl}
        alt=""
        loading="lazy"
        width={64}
        height={64}
        className="size-16 shrink-0 rounded-lg bg-bg object-cover"
      />
      <div className="min-w-0 flex-1 basis-40">
        <Input
          aria-label="Alt text"
          placeholder="Describe the image (alt text)"
          maxLength={200}
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          onBlur={saveAlt}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
        />
        <p className="mt-1 text-[11px] text-mute">
          {image.width && image.height ? `${image.width}×${image.height}` : ""}
        </p>
      </div>
      <div className="w-full pl-12 sm:w-auto sm:pl-0">
        <Button variant="danger" onClick={onDelete} aria-label="Delete image">
          Delete
        </Button>
      </div>
    </div>
  );
}
