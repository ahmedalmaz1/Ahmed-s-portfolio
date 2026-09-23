'use client';

import { useState } from 'react';
import SceneArt from './SceneArt';
import { cx } from '@/lib/cx';

const STAGES = [
  {
    node: 'Blockout',
    mode: 'Wireframe',
    note: 'I start with plain shapes to settle scale, composition and the path the eye takes, before any detail exists.',
  },
  {
    node: 'Assets',
    mode: 'Unlit',
    note: 'Sculpted meshes, scans and hand-painted materials replace the blockout shapes. Everything reads correctly, even though nothing is lit yet.',
  },
  {
    node: 'Lighting',
    mode: 'Lit',
    note: 'Lumen lighting and fog set the mood. This is the moment the scene starts to feel like a real place.',
  },
  {
    node: 'Camera',
    mode: 'Cine Camera, 35 mm',
    note: 'A cine camera with a real lens, framing and depth of field turns the environment into a shot.',
  },
  {
    node: 'Render',
    mode: 'Movie Render Queue',
    note: 'A colour grade, film grain and Movie Render Queue output produce the final frames.',
  },
];

const SCENE_OPTIONS = { seed: 21, tower: 1, trees: 6, rocks: 2 };

export default function PipelineScene() {
  const [stage, setStage] = useState(0);
  const current = STAGES[stage] ?? STAGES[0];

  return (
    <div className="mt-12 rounded-[20px] border border-line bg-[#0b2830]/50 p-6 sm:p-7">
      <h3 className="mb-4 font-display text-base font-bold sm:mb-5">Follow one scene through my pipeline</h3>

      <div className="relative mb-7">
        <SceneArt id="about" options={SCENE_OPTIONS} stage={stage} />
        <span className="absolute left-3 top-2.5 z-[4] rounded-md bg-bg/65 px-2 py-0.5 font-mono text-xs text-ink">
          {current.mode}
        </span>
      </div>

      <div className="relative grid grid-cols-5">
        <div className="absolute left-[10%] right-[10%] top-[13px] h-0.5 rounded-sm bg-line" />
        <div
          className="absolute left-[10%] top-[13px] h-0.5 rounded-sm bg-accent transition-[width] duration-500 ease-[cubic-bezier(.3,.8,.3,1)]"
          style={{ width: `calc(80% * ${stage / (STAGES.length - 1)})` }}
        />
        {STAGES.map((s, i) => (
          <button
            key={s.node}
            type="button"
            aria-pressed={i === stage}
            onClick={() => setStage(i)}
            className={cx(
              'relative z-10 flex flex-col items-center gap-2.5 pb-1 text-[clamp(0.68rem,2.9vw,0.95rem)] font-medium transition-colors',
              i === stage ? 'text-ink' : 'text-muted hover:text-ink'
            )}
          >
            <i
              className={cx(
                'block h-7 w-7 rounded-full border-2 bg-bg transition-all duration-300',
                i === stage ? 'scale-[1.15] border-accent bg-accent' : i < stage ? 'border-accent' : 'border-line'
              )}
            />
            {s.node}
          </button>
        ))}
      </div>

      <p aria-live="polite" className="mt-6 min-h-[5.2em] max-w-md text-ink2">
        {current.note}
      </p>
    </div>
  );
}
