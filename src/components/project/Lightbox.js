"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";

export default function Lightbox({ image, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    if (!image) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [image, onClose]);

  if (!image) return null;

  const width = image.width || 1920;
  const height = image.height || 1080;
  const ratio = width / height;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={image.alt}
      onClick={onClose}
      className="grain fixed inset-0 z-[100] flex items-center justify-center bg-[#050a0f]/95 backdrop-blur-md"
    >
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-colors duration-300 hover:bg-accent hover:text-[#050a0f] sm:right-6 sm:top-6"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>

      <Image
        src={image.src}
        alt={image.alt}
        width={width}
        height={height}
        priority
        quality={95}
        sizes="96vw"
        onClick={(e) => e.stopPropagation()}
        className="h-auto bg-black object-contain"
        style={{ width: `min(96vw, calc(92svh * ${ratio}))` }}
      />
    </div>
  );
}
