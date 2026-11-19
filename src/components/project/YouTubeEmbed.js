"use client";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { duck } from "@/lib/ambient";

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

  useEffect(() => {
    if (!playing) return;
    duck(true);
    return () => duck(false);
  }, [playing]);

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

  // only needed once the user presses play (client side, so window exists)
  const embedUrl = playing
    ? `https://www.youtube-nocookie.com/embed/${id}` +
      `?autoplay=1&rel=0&modestbranding=1&playsinline=1` +
      `&origin=${encodeURIComponent(window.location.origin)}`
    : "";

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
          {/* scrim only behind the header, so the artwork itself is not dimmed */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-linear-to-b from-black/70 to-transparent sm:h-32" />

          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Play video: ${title}`}
            className="group absolute inset-0 z-10 flex cursor-pointer items-center justify-center focus-visible:outline-none"
          >
            {/* same shape and proportions (68x48) as YouTube's own play button: 52px on phones, 68px from sm up */}
            <span className="rounded-xl transition-transform duration-300 ease-out group-hover:scale-105 group-focus-visible:scale-105 group-focus-visible:ring-2 group-focus-visible:ring-white/80">
              <svg
                viewBox="0 0 68 48"
                aria-hidden="true"
                className="block w-[3.25rem] drop-shadow-[0_2px_6px_rgba(0,0,0,0.3)] sm:w-[4.25rem]"
              >
                <path
                  d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z"
                  fill="#f00"
                />
                <path d="M 45,24 27,14 27,34" fill="#fff" />
              </svg>
            </span>
          </button>

          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center gap-3 p-3 sm:p-4 lg:p-6">
            {channel?.avatar ? (
              <Image
                src={channel.avatar}
                alt=""
                width={80}
                height={80}
                sizes="40px"
                quality={90}
                className="size-9 shrink-0 rounded-full bg-black/40 object-cover ring-1 ring-white/25 sm:size-10"
              />
            ) : (
              <span
                aria-hidden="true"
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-[#050a0f] sm:size-10"
              >
                {(channel?.name || title).charAt(0)}
              </span>
            )}

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium leading-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] sm:text-base">
                {title}
              </p>
              {channel?.name && (
                <p className="truncate text-xs text-white/75 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] sm:text-sm">
                  {channel.name}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={copyLink}
              aria-label={copied ? "Link copied" : "Copy video link"}
              className="pointer-events-auto flex size-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition-colors duration-300 hover:bg-white/30 sm:size-10"
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
