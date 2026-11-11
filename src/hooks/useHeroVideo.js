"use client";
import { useEffect, useState } from "react";

const SRC = {
  desktop: "/video/hero-d.mp4",
  mobile: "/video/hero-m.mp4",
};

// Downloads the whole hero video into memory (with real progress for the
// loader) and returns a blob URL. Seeking a local blob is instant, which is
// what makes scroll-scrubbing smooth: no network range requests while scrolling.
export function useHeroVideo() {
  const [state, setState] = useState({ src: null, progress: 0 });

  useEffect(() => {
    const ctrl = new AbortController();
    let objectUrl = null;

    const finish = (src = null) => setState({ src, progress: 1 });

    async function load() {
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const saveData = navigator.connection?.saveData;

      // poster only for these users
      if (reduce || saveData) return finish();

      const mobile = matchMedia("(max-width: 767px)").matches;

      try {
        const res = await fetch(mobile ? SRC.mobile : SRC.desktop, {
          signal: ctrl.signal,
        });
        if (!res.ok || !res.body) throw new Error("video failed");

        const total = Number(res.headers.get("content-length")) || 0;
        const reader = res.body.getReader();
        const chunks = [];
        let loaded = 0;
        let percent = 0;

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          loaded += value.length;

          // re-render only when the visible percentage changes
          if (total) {
            const next = Math.min(99, Math.floor((loaded / total) * 100));
            if (next !== percent) {
              percent = next;
              setState((s) => ({ ...s, progress: next / 100 }));
            }
          }
        }

        objectUrl = URL.createObjectURL(
          new Blob(chunks, { type: "video/mp4" }),
        );
        finish(objectUrl);
      } catch (e) {
        if (e.name === "AbortError") return;
        // never block the loader: fall back to the poster image
        finish();
      }
    }

    load();

    return () => {
      ctrl.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);

  return state;
}
