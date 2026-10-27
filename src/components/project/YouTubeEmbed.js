"use client";
import { useCallback, useEffect, useMemo, useState } from "react";

// Accepts a bare ID or any youtube URL (watch?v=, youtu.be/, embed/, shorts/)
function parseId(input = "") {
  const s = String(input).trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  const m = s.match(
    /(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/|\/live\/)([\w-]{11})/,
  );
  return m ? m[1] : "";
}

const THUMBS = ["maxresdefault", "sddefault", "hqdefault"];

export default function YouTubeEmbed({
  id: rawId,
  title = "Video",
  channel,
  poster,
  className = "",
}) {
  const id = useMemo(() => parseId(rawId), [rawId]);
  const [playing, setPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [thumb, setThumb] = useState(0);

  const watchUrl = `https://www.youtube.com/watch?v=${id}`;
  const src = poster || `https://i.ytimg.com/vi/${id}/${THUMBS[thumb]}.jpg`;

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  const nextThumb = useCallback(() => {
    setThumb((n) => Math.min(n + 1, THUMBS.length - 1));
  }, []);

  // YouTube serves a 120x90 grey placeholder (HTTP 200) when maxres is missing,
  // so onError never fires — detect it by size.
  const onThumbLoad = useCallback(
    (e) => {
      if (!poster && e.currentTarget.naturalWidth <= 120) nextThumb();
    },
    [poster, nextThumb],
  );

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(`https://youtu.be/${id}`);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }, [id]);

  if (!id) return null;

  const embedUrl =
    `https://www.youtube.com/embed/${id}` +
    `?autoplay=1&rel=0&modestbranding=1&playsinline=1` +
    `&origin=${encodeURIComponent(
      typeof window !== "undefined" ? window.location.origin : "",
    )}`;

  return (
    <div
      className={`relative aspect-video w-full overflow-hidden rounded-[1.25rem] bg-black sm:rounded-[1.75rem] lg:rounded-[2.5rem] ${className}`}
    >
      {playing ? (
        <>
          <iframe
            className="absolute inset-0 h-full w-full"
            src={embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
          {/* fallback if the embed is blocked (CSP, extension, network) */}
          <a
            href={watchUrl}
            target="_blank"
            rel="noreferrer"
            className="absolute bottom-3 right-3 z-10 rounded-full bg-black/60 px-3 py-1.5 text-xs text-white backdrop-blur-md hover:bg-black/80"
          >
            Open on YouTube
          </a>
        </>
      ) : (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            loading="lazy"
            decoding="async"
            onLoad={onThumbLoad}
            onError={nextThumb}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/75 via-black/10 to-black/30" />

          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Play video: ${title}`}
            className="group absolute inset-0 z-10 flex cursor-pointer items-center justify-center"
          >
            <span className="flex h-12 w-[4.5rem] items-center justify-center rounded-2xl bg-[#ff0033] text-white shadow-[0_10px_40px_-8px_rgba(255,0,51,0.6)] transition-transform duration-500 ease-out group-hover:scale-110 sm:h-16 sm:w-24">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
                className="ml-0.5 h-6 w-6 sm:h-8 sm:w-8"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </button>

          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center gap-3 p-3 sm:gap-4 sm:p-5">
            {channel?.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={channel.avatar}
                alt=""
                className="h-9 w-9 shrink-0 rounded-full object-cover sm:h-11 sm:w-11"
              />
            ) : (
              <span
                aria-hidden="true"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-[#050a0f] sm:h-11 sm:w-11"
              >
                {(channel?.name || title).charAt(0)}
              </span>
            )}

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white sm:text-base">
                {title}
              </p>
              {channel?.name && (
                <p className="truncate text-xs text-white/70 sm:text-sm">
                  {channel.name}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={copyLink}
              aria-label={copied ? "Link copied" : "Copy video link"}
              className="pointer-events-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition-colors duration-300 hover:bg-white/30 sm:h-10 sm:w-10"
            >
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
                {copied ? (
                  <path d="m5 12 5 5L20 7" />
                ) : (
                  <>
                    <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" />
                    <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" />
                  </>
                )}
              </svg>
            </button>

            <a
              href={watchUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Watch on YouTube"
              className="pointer-events-auto flex h-9 shrink-0 items-center gap-2 rounded-full bg-white/15 px-3 text-xs font-medium text-white backdrop-blur-md transition-colors duration-300 hover:bg-white/30 sm:h-10 sm:px-4 sm:text-sm"
            >
              <span className="hidden sm:inline">Watch on YouTube</span>
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
                <path d="M7 17 17 7" />
                <path d="M8 7h9v9" />
              </svg>
            </a>
          </div>
        </>
      )}
    </div>
  );
}
