// Browser-side image optimisation: resize + re-encode before upload.
import { upload } from "./api";

export const ACCEPTED_IMAGES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];
export const MAX_INPUT_BYTES = 40 * 1024 * 1024; // refuse huge originals before decoding them
export const MAX_OUTPUT_BYTES = 15 * 1024 * 1024; // API limit for the main image
export const MAX_THUMB_BYTES = 2 * 1024 * 1024; // API limit for the thumbnail

// Quality-first settings for an artist portfolio. Images are compressed exactly once, here, at a high
// quality; the site then serves them through next/image at quality 90-95 (see the components).
// Resizing keeps the aspect ratio: no cropping and no upscaling, ever.
export const SIZES = { full: 3840, thumb: 1200, avatar: 1024 };
export const QUALITY = { full: 0.95, thumb: 0.85 };
// If a very noisy / grainy render is still too big at the first quality, step down gently
// instead of failing the upload.
const FALLBACK_QUALITIES = [0.9, 0.85, 0.8];

const mb = (bytes) => `${Math.round(bytes / 1048576)}MB`;

/** Returns an error message when the file must not be sent, otherwise null. */
export function checkImageFile(file) {
  if (!ACCEPTED_IMAGES.includes(file.type))
    return `"${file.name}" is not a supported image (use JPG, PNG, WebP or AVIF).`;
  if (file.size > MAX_INPUT_BYTES)
    return `"${file.name}" is too large (${mb(file.size)}). Max ${mb(MAX_INPUT_BYTES)}.`;
  return null;
}

function encode(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error("Could not process the image."));
        // some browsers cannot write WebP and silently return PNG; JPEG is smaller and accepted by the API
        if (blob.type === "image/webp") return resolve(blob);
        canvas.toBlob(
          (jpg) =>
            jpg
              ? resolve(jpg)
              : reject(new Error("Could not process the image.")),
          "image/jpeg",
          quality,
        );
      },
      "image/webp",
      quality,
    );
  });
}

function draw(bitmap, longSide) {
  const scale = Math.min(1, longSide / Math.max(bitmap.width, bitmap.height)); // never upscale
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, width, height);
  return { canvas, width, height };
}

/**
 * compressImage(file) -> { file, thumb, width, height }
 * Options: { max: 3840, thumb: 1200 | false, quality: 0.95 }
 * width/height are those of the full-size output.
 */
export async function compressImage(
  file,
  { max = SIZES.full, thumb = SIZES.thumb, quality = QUALITY.full } = {},
) {
  const problem = checkImageFile(file);
  if (problem) throw new Error(problem);

  let bitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error(`"${file.name}" could not be read. Is the file damaged?`);
  }

  try {
    const full = draw(bitmap, max);
    let main = await encode(full.canvas, quality);
    for (const lower of FALLBACK_QUALITIES) {
      if (main.size <= MAX_OUTPUT_BYTES || lower >= quality) continue;
      main = await encode(full.canvas, lower);
    }
    if (main.size > MAX_OUTPUT_BYTES)
      throw new Error(
        `"${file.name}" is still too large after optimising (${mb(main.size)}).`,
      );

    let small = null;
    if (thumb) {
      small = await encode(draw(bitmap, thumb).canvas, QUALITY.thumb);
      if (small.size > MAX_THUMB_BYTES)
        throw new Error("The thumbnail is too large.");
    }
    return { file: main, thumb: small, width: full.width, height: full.height };
  } finally {
    bitmap.close?.();
  }
}

const ext = (blob) => (blob.type === "image/jpeg" ? "jpg" : "webp");

/** Optimise and upload an image. Resolves with { key, url, thumbKey, thumbUrl, width, height }. */
export async function uploadImage(
  file,
  { folder, thumb, max, onStage, onProgress, signal },
) {
  onStage?.("Optimising…");
  const out = await compressImage(file, { max, thumb });

  onStage?.("Uploading…");
  const form = new FormData();
  form.append("folder", folder);
  form.append("file", out.file, `image.${ext(out.file)}`);
  if (out.thumb) form.append("thumb", out.thumb, `thumb.${ext(out.thumb)}`);

  const res = await upload("/admin/media/image", form, { onProgress, signal });
  return { ...res, width: out.width, height: out.height };
}

export const SHOWREEL_MAX_BYTES = 90 * 1024 * 1024;

export function checkShowreelFile(file) {
  if (file.type !== "video/mp4") return "The showreel must be an MP4 video.";
  if (file.size > SHOWREEL_MAX_BYTES)
    return `The video is too large (${mb(file.size)}). Max ${mb(SHOWREEL_MAX_BYTES)} — compress it first.`;
  return null;
}

export const CV_MAX_BYTES = 10 * 1024 * 1024; // API limit

export function checkCvFile(file) {
  if (file.type !== "application/pdf") return "The CV must be a PDF file.";
  if (file.size === 0) return "The file is empty.";
  if (file.size > CV_MAX_BYTES)
    return `The PDF is too large (${mb(file.size)}). Max ${mb(CV_MAX_BYTES)}.`;
  return null;
}

export async function uploadCv(file, { onProgress, signal } = {}) {
  const problem = checkCvFile(file);
  if (problem) throw new Error(problem);
  return upload("/admin/media/cv", file, {
    method: "PUT",
    headers: { "Content-Type": "application/pdf" },
    onProgress,
    signal,
  });
}

export async function uploadShowreel(file, { onProgress, signal } = {}) {
  const problem = checkShowreelFile(file);
  if (problem) throw new Error(problem);
  return upload("/admin/media/showreel", file, {
    method: "PUT",
    headers: { "Content-Type": "video/mp4" },
    onProgress,
    signal,
  });
}
