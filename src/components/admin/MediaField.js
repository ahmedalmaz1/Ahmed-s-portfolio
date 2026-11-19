"use client";
import { useEffect, useRef, useState } from "react";
import {
  checkCvFile,
  checkImageFile,
  checkShowreelFile,
  uploadCv,
  uploadImage,
  uploadShowreel,
} from "@/lib/admin/image";
import { Button, ProgressBar } from "./ui";

/**
 * Single-file upload field (image, mp4 or pdf). Uploads immediately, reports the
 * result through onChange({ key, url, ...extra }) and onChange(null) on remove.
 */
export default function MediaField({
  kind = "image",
  folder,
  value,
  onChange,
  max,
  thumb = false,
  label,
  error,
  shape = "wide",
}) {
  const input = useRef(null);
  const abort = useRef(null);
  const [stage, setStage] = useState("");
  const [progress, setProgress] = useState(0);
  const [problem, setProblem] = useState("");
  const busy = Boolean(stage);

  useEffect(() => () => abort.current?.abort(), []);

  async function pick(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const check = {
      video: checkShowreelFile,
      pdf: checkCvFile,
      image: checkImageFile,
    }[kind];
    const bad = check(file);
    if (bad) return setProblem(bad);

    setProblem("");
    setProgress(0);
    abort.current = new AbortController();
    try {
      const opts = { onProgress: setProgress, signal: abort.current.signal };
      let result;
      if (kind === "video" || kind === "pdf") {
        setStage("Uploading…");
        result = await (kind === "video" ? uploadShowreel : uploadCv)(
          file,
          opts,
        );
      } else {
        result = await uploadImage(file, {
          folder,
          thumb,
          max,
          onStage: setStage,
          ...opts,
        });
      }
      onChange(result);
    } catch (err) {
      if (err.name !== "AbortError") setProblem(err.message);
    } finally {
      setStage("");
    }
  }

  const box =
    shape === "round"
      ? "size-24 rounded-full"
      : "aspect-video w-full max-w-xs rounded-xl";

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium">{label}</p>
      <div className="flex flex-wrap items-center gap-4">
        <div
          className={`${box} grid shrink-0 place-items-center overflow-hidden border border-line bg-bg text-xs text-mute`}
        >
          {value?.url && kind === "image" && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value.url} alt="" className="size-full object-cover" />
          )}
          {value?.url && kind === "video" && (
            <video
              src={value.url}
              className="size-full object-cover"
              controls
              preload="metadata"
            />
          )}
          {value?.url && kind === "pdf" && (
            <a
              href={value.url}
              className="flex size-full flex-col items-center justify-center gap-1.5 text-ink hover:bg-panel2"
              title="Open the current file"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="size-7"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5zM14 3v5h5" />
              </svg>
              <span className="text-[11px] font-medium uppercase tracking-wider">
                PDF
              </span>
            </a>
          )}
          {!value?.url && "No file"}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <input
            ref={input}
            type="file"
            hidden
            accept={
              { video: "video/mp4", pdf: "application/pdf" }[kind] ??
              "image/jpeg,image/png,image/webp,image/avif"
            }
            onChange={pick}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              onClick={() => input.current.click()}
              disabled={busy}
            >
              {value?.url ? "Replace" : "Upload"}
            </Button>
            {value?.url && !busy && (
              <Button variant="ghost" onClick={() => onChange(null)}>
                Remove
              </Button>
            )}
            {busy && (
              <Button variant="ghost" onClick={() => abort.current?.abort()}>
                Cancel
              </Button>
            )}
          </div>
          {busy && (
            <div className="space-y-1.5">
              <ProgressBar value={stage === "Optimising…" ? 0 : progress} />
              <p className="text-xs text-mute">
                {stage}{" "}
                {stage === "Uploading…" && `${Math.round(progress * 100)}%`}
              </p>
            </div>
          )}
          {(problem || error) && (
            <p role="alert" className="text-xs text-danger">
              {problem || error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
