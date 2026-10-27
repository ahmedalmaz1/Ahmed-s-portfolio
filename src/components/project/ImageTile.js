"use client";
import { useCallback, useState } from "react";
import Image from "next/image";

/* Natural image sizes, keyed by src. They are used ONLY to place the expand
   button on the image's own corner - the tile and the image are never resized. */
const sizeCache = new Map();

export default function ImageTile({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false,
  onExpand,
}) {
  // tile size: exactly as before (props, else 16:9) - never changed
  const given = width && height ? { width, height } : null;
  const ratio = given ? given.width / given.height : 16 / 9;

  // real size of the image file, read once it has loaded
  const [natural, setNatural] = useState(() => sizeCache.get(src) ?? null);
  const handleLoad = useCallback(
    (e) => {
      const { naturalWidth, naturalHeight } = e.currentTarget;
      if (!naturalWidth || !naturalHeight) return;
      const next = { width: naturalWidth, height: naturalHeight };
      sizeCache.set(src, next);
      setNatural(next);
    },
    [src],
  );

  // Area the picture really covers inside the tile (object-contain), as % of
  // the tile. Until the size is known it is the full tile (previous behaviour).
  const imageRatio = natural ? natural.width / natural.height : ratio;
  const imageBox = {
    width: `${Math.min(1, imageRatio / ratio) * 100}%`,
    height: `${Math.min(1, ratio / imageRatio) * 100}%`,
  };

  return (
    <figure
      data-shot
      className={`relative h-(--h) w-[calc(var(--h)*var(--r))] shrink-0 overflow-hidden bg-transparent max-lg:snap-center ${className}`}
      style={{ "--r": ratio }}
    >
      <div data-frame className="absolute inset-0 overflow-hidden">
        <div data-media className="absolute inset-0 will-change-transform">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(min-width: 1024px) 160vh, 130vh"
            quality={90}
            priority={priority}
            onLoad={handleLoad}
            className="object-contain"
          />
        </div>
      </div>

      <span
        data-dim
        className="pointer-events-none absolute inset-0 bg-bg opacity-0"
      />

      <button
        type="button"
        onClick={() => onExpand({ src, alt, ...(natural ?? given ?? {}) })}
        aria-label={`View ${alt} full size`}
        className="group absolute inset-0 cursor-zoom-in"
      >
        {/* box that matches the picture; the icon is anchored to its corner */}
        <span
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={imageBox}
        >
          <span className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-bg/60 text-white backdrop-blur-sm transition-transform duration-500 ease-out group-hover:scale-110 sm:bottom-5 sm:right-5 sm:h-11 sm:w-11">
            <span
              data-icon-fill
              className="absolute inset-0 rounded-full bg-accent opacity-0"
            />
            <span data-icon-glyph className="relative flex">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M15 3h6v6" />
                <path d="M9 21H3v-6" />
                <path d="m21 3-7 7" />
                <path d="m3 21 7-7" />
              </svg>
            </span>
          </span>
        </span>
      </button>
    </figure>
  );
}
