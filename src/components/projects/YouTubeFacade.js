"use client";
import { useState } from "react";
import { getYouTubeId } from "@/lib/youtube";

export default function YouTubeFacade({ url, title, channel, aspectRatio = 16 / 9 }) {
  const [playing, setPlaying] = useState(false);
  const id = getYouTubeId(url);
  if (!id) return null;

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl border border-line bg-surface"
      style={{ aspectRatio }}
    >
      {playing ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <>
          <img
            src={`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/70 to-transparent"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent"
          />

          <div className="absolute left-4 top-4 flex items-center gap-3 sm:left-5 sm:top-5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white sm:text-base">
                {title}
              </p>
              {channel && (
                <p className="truncate text-xs text-white/70 sm:text-sm">
                  {channel}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Play video: ${title}`}
            className="group absolute inset-0 h-full w-full"
          >
            <span className="absolute left-1/2 top-1/2 flex h-14 w-[72px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl bg-[#FF0000] shadow-lg transition-transform group-hover:scale-105">
              <svg viewBox="0 0 24 24" className="h-6 w-6 translate-x-0.5 fill-white">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard?.writeText(url);
            }}
            aria-label="Copy video link"
            className="absolute bottom-4 left-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white/90 backdrop-blur-sm transition-colors hover:bg-black/60 sm:bottom-5 sm:left-5"
          >
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-none stroke-current" strokeWidth={1.6}>
              <path d="M10.5 13.5a3.5 3.5 0 0 0 5 0l3-3a3.54 3.54 0 0 0-5-5l-1.5 1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M13.5 10.5a3.5 3.5 0 0 0-5 0l-3 3a3.54 3.54 0 0 0 5 5l1.5-1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-black/70 sm:bottom-5 sm:right-5 sm:text-sm"
          >
            Watch on
            <span className="flex items-center gap-1 rounded bg-[#FF0000] px-1.5 py-0.5 font-bold">
              <svg viewBox="0 0 24 24" className="h-3 w-3 fill-white">
                <path d="M8 5v14l11-7z" />
              </svg>
              YouTube
            </span>
          </a>
        </>
      )}
    </div>
  );
}