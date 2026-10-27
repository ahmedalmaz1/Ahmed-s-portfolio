"use client";
import { useEffect, useRef, useState } from "react";

const SETS = {
  desktop: { base: "/frames/v2/d", total: 90 },
  mobile: { base: "/frames/v2/m", total: 65 },
};

const PAD = 3;
const CONCURRENCY = 6;
const CRITICAL = 20;

const store = {
  key: null,
  frames: [],
  total: 0,
  critical: 0,
  done: 0,
  subs: new Set(),
};

const notify = () => store.subs.forEach((fn) => fn());

const start = (key, base, indices) => {
  const frames = new Array(indices.length);
  const critical = Math.min(CRITICAL, indices.length);

  store.key = key;
  store.frames = frames;
  store.total = indices.length;
  store.critical = critical;
  store.done = 0;

  let next = 0;

  const worker = async () => {
    while (next < indices.length) {
      const i = next++;
      try {
        const url = `${base}/f_${String(indices[i]).padStart(PAD, "0")}.webp`;
        const res = await fetch(url);
        const blob = await res.blob();
        frames[i] = await createImageBitmap(blob);
      } catch {}
      if (i < critical && store.frames === frames) {
        store.done++;
        notify();
      }
    }
  };

  Promise.all(Array.from({ length: CONCURRENCY }, worker));
};

const progressOf = () =>
  store.critical ? Math.min(1, store.done / store.critical) : 0;

export function useFrames() {
  const frames = useRef(store.frames);
  const [total, setTotal] = useState(store.total);
  const [progress, setProgress] = useState(progressOf);

  useEffect(() => {
    const mobile = matchMedia("(max-width: 767px)").matches;
    const { base, total: TOTAL } = mobile ? SETS.mobile : SETS.desktop;
    const saveData = navigator.connection?.saveData;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const step = reduce || saveData ? 3 : 1;
    const key = `${base}:${step}`;

    if (store.key !== key) {
      const indices = [];
      for (let i = 1; i <= TOTAL; i += step) indices.push(i);
      start(key, base, indices);
    }

    frames.current = store.frames;

    const sync = () => {
      setTotal(store.total);
      setProgress(progressOf());
    };

    sync();
    store.subs.add(sync);
    return () => store.subs.delete(sync);
  }, []);

  return { frames, total, progress };
}
