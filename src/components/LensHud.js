'use client';
import { fovForFocalLength } from '@/lib/terrainMath';
import { cx } from '@/lib/cx';

const LENSES = [24, 35, 50, 85];

export default function LensHud({ activeMm, onChange }) {
  return (
    <div
      role="group"
      aria-label="Camera lens"
      className="absolute bottom-7 left-4 z-[3] flex items-center gap-3.5 rounded-full border border-line bg-bg/60 px-[18px] py-[5px] backdrop-blur-md sm:left-8 md:left-12"
    >
      <span className="text-sm text-muted">Lens (mm)</span>
      <div className="flex gap-0.5">
        {LENSES.map((mm) => (
          <button
            key={mm}
            type="button"
            aria-pressed={mm === activeMm}
            onClick={() => onChange(mm)}
            className={cx(
              'min-h-10 min-w-11 rounded-full px-1.5 text-[0.95rem] font-semibold transition-colors',
              mm === activeMm ? 'bg-accent text-bg' : 'text-muted hover:text-ink'
            )}
          >
            {mm}
          </button>
        ))}
      </div>
      <span className="hidden min-w-[19ch] font-mono text-xs text-muted sm:inline">
        {fovForFocalLength(activeMm).toFixed(1)}{'\u00b0'} field of view
      </span>
    </div>
  );
}
