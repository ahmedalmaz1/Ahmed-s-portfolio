"use client";
import { useSyncExternalStore } from "react";
import { subscribe, getEnabled, toggle } from "@/lib/ambient";

// Styles for .snd-* live in globals.css
const BARS = [
  { lo: 0.3, hi: 0.85, d: 1.1 },
  { lo: 0.55, hi: 1, d: 1.5 },
  { lo: 0.3, hi: 0.8, d: 0.9 },
  { lo: 0.25, hi: 0.6, d: 1.3 },
  { lo: 0.2, hi: 0.5, d: 1.0 },
  { lo: 0.3, hi: 0.7, d: 1.4 },
  { lo: 0.25, hi: 0.55, d: 1.2 },
];

export default function SoundToggle() {
  const on = useSyncExternalStore(subscribe, getEnabled, () => false);

  return (
    <button
      type="button"
      data-sound-toggle
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? "Turn sound off" : "Turn sound on"}
      className={`snd fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-4 z-[90] grid h-7 w-7 place-items-center rounded-full text-white sm:bottom-5 sm:left-5 sm:h-8 sm:w-8 lg:bottom-6 lg:left-6 lg:h-10 lg:w-10 ${on ? "snd-on" : ""}`}
    >
      <span className="snd-ring" aria-hidden="true" />

      <span aria-hidden="true" className="snd-bars">
        {BARS.map((b, i) => (
          <span
            key={i}
            className="snd-bar"
            style={{
              "--lo": b.lo,
              "--hi": b.hi,
              "--d": `${b.d}s`,
              animationDelay: `${-i * 0.23}s`,
            }}
          />
        ))}
      </span>
    </button>
  );
}
