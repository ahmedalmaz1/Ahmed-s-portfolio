'use client';

import { useId, useState } from 'react';
import SceneArt from './SceneArt';

export default function CompareSlider({ options, palette }) {
  const [pos, setPos] = useState(50);
  const reactId = useId();

  return (
    <div className="relative aspect-video overflow-hidden rounded-2xl border border-line bg-[#16262a]">
      <SceneArt id={`${reactId}-back`} options={options} stage={0} palette={palette} bare />

      <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
        <SceneArt id={`${reactId}-front`} options={options} stage={4} palette={palette} bare />
      </div>

      <div
        className="pointer-events-none absolute inset-y-0 z-[4] w-0.5 -translate-x-1/2 bg-accent"
        style={{ left: `${pos}%` }}
      >
        <div className="absolute left-1/2 top-1/2 grid h-[38px] w-[38px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-accent bg-bg/85 text-accent">
          &#8596;
        </div>
      </div>

      <span className="pointer-events-none absolute bottom-2.5 left-2.5 z-[4] rounded-full bg-bg/70 px-2.5 py-0.5 text-xs font-medium">
        Blockout
      </span>
      <span className="pointer-events-none absolute bottom-2.5 right-2.5 z-[4] rounded-full bg-bg/70 px-2.5 py-0.5 text-xs font-medium">
        Final render
      </span>

      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label="Reveal the final render"
        className={[
          'absolute inset-0 z-[5] h-full w-full cursor-ew-resize appearance-none bg-transparent opacity-0',
          '[&::-webkit-slider-thumb]:h-11 [&::-webkit-slider-thumb]:w-11 [&::-webkit-slider-thumb]:appearance-none',
          '[&::-moz-range-thumb]:h-11 [&::-moz-range-thumb]:w-11 [&::-moz-range-thumb]:border-0',
        ].join(' ')}
      />
    </div>
  );
}
