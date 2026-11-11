"use client";
import { useCallback, useState } from "react";
import Image from "next/image";
import { ScrollTrigger } from "@/lib/gsap";

/* Natural image sizes, keyed by src. */
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
  // desktop tile ratio: from props, else 16:9. Never changes after load.
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

      // the mobile tile just changed height: re-measure scroll positions
      if (Math.abs(naturalWidth / naturalHeight - ratio) > 0.01) {
        requestAnimationFrame(() => ScrollTrigger.refresh());
      }
    },
    [src, ratio],
  );

  const imageRatio = natural ? natural.width / natural.height : ratio;

  // desktop only: area the picture covers inside the (fixed-ratio) tile,
  // used to anchor the expand button to the picture's own corner
  const boxW = `${Math.min(1, imageRatio / ratio) * 100}%`;
  const boxH = `${Math.min(1, ratio / imageRatio) * 100}%`;

  return (
    <figure
      data-shot
      // < lg: full width, height follows the REAL image ratio (no gaps)
      // lg+:  fixed height (--h), width follows the ratio from the data
      className={`relative aspect-(--rm) w-full shrink-0 overflow-hidden bg-transparent lg:aspect-auto lg:h-(--h) lg:w-[calc(var(--h)*var(--r))] ${className}`}
      style={{ "--r": ratio, "--rm": imageRatio }}
    >
      <div data-frame className="absolute inset-0 overflow-hidden">
        <div data-media className="absolute inset-0 will-change-transform">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(min-width: 1024px) 160vh, 100vw"
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
          className="pointer-events-none absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 lg:h-(--bh) lg:w-(--bw)"
          style={{ "--bw": boxW, "--bh": boxH }}
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
