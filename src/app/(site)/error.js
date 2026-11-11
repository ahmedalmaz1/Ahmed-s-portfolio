"use client";
import { useEffect } from "react";

// Catches runtime errors inside any page. The layout (scroll, cursor, sound)
// stays alive, and the visitor can retry or leave.
export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main
      role="alert"
      className="flex min-h-svh flex-col items-center justify-center px-(--gutter) text-center"
    >
      <p className="text-xs tracking-[0.3em] text-white/50 uppercase">
        Something went wrong
      </p>
      <h1 className="mt-5 text-5xl font-bold tracking-tight uppercase sm:text-7xl">
        Signal lost
      </h1>
      <p className="mt-5 max-w-md text-white/60">
        An unexpected error occurred. You can try again or head back home.
      </p>
      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-[#050a0f] transition-colors duration-300 hover:bg-accent/85"
        >
          Try again
        </button>
        {/* plain <a> on purpose: a full reload recovers from a broken client state */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a
          href="/"
          className="inline-flex items-center rounded-full border border-white/25 px-6 py-2.5 text-sm font-medium text-white transition-colors duration-300 hover:border-white/60"
        >
          Back to home
        </a>
      </div>
    </main>
  );
}
