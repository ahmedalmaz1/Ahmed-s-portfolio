import { buildScene, closedPolygon, pointsToPolygon, SCENE_VIEWBOX } from '@/lib/sceneArt';
import { toSceneStyle } from '@/lib/scenePalettes';
import { cx } from '@/lib/cx';

/**
 * Renders the little mountain environment as two stacked SVGs, moving
 * through five "production stages" (0 = wireframe blockout, 4 = fully
 * graded final render). Each stage is a handful of booleans computed once
 * here, rather than a cascade of CSS classes down the tree.
 *
 * @param {{
 *   options: import('@/lib/sceneArt').SceneOptions,
 *   stage: number,
 *   palette?: 'default' | 'frozen' | 'ember' | 'tidal',
 *   id: string,
 *   className?: string,
 *   bare?: boolean
 * }} props
 */
export default function SceneArt({ options, stage, palette = 'default', id, className = '', bare = false }) {
  const data = buildScene(options);

  const s1 = stage >= 1; // assets: colored, still unlit
  const s2 = stage >= 2; // lighting: sky, sun and fog appear
  const s3 = stage >= 3; // camera: depth of field, vignette, letterbox
  const s4 = stage >= 4; // render: final grade and film grain

  const shapeFill = (varName) => (s1 ? `var(${varName})` : '#16262a');
  const shapeStroke = s1 ? 'transparent' : '#6f9a9f';
  const shapeClass = 'transition-colors duration-500 [vector-effect:non-scaling-stroke]';

  return (
    <div
      className={cx(
        bare
          ? 'absolute inset-0 h-full overflow-hidden [isolation:isolate]'
          : 'relative aspect-video overflow-hidden rounded-xl border border-line bg-[#16262a] [isolation:isolate]',
        className
      )}
      style={toSceneStyle(palette)}
    >
      <div className={cx('absolute inset-0 transition-[filter] duration-700', s4 && 'contrast-[1.1] saturate-[1.2]')}>
        <svg
          viewBox={SCENE_VIEWBOX}
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
          className={cx('absolute inset-0 h-full w-full transition-[filter] duration-700', s1 && !s2 && 'brightness-[.55] saturate-[.75]')}
        >
          <defs>
            <linearGradient id={`sk-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" style={{ stopColor: 'var(--sc-top)' }} />
              <stop offset="0.6" style={{ stopColor: 'var(--sc-mid)' }} />
              <stop offset="1" style={{ stopColor: 'var(--sc-low)' }} />
            </linearGradient>
            <radialGradient id={`gl-${id}`}>
              <stop offset="0" style={{ stopColor: 'var(--sc-sun)', stopOpacity: 0.9 }} />
              <stop offset="1" style={{ stopColor: 'var(--sc-sun)', stopOpacity: 0 }} />
            </radialGradient>
            <linearGradient id={`fo-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" style={{ stopColor: 'var(--sc-fog)', stopOpacity: 0 }} />
              <stop offset="1" style={{ stopColor: 'var(--sc-fog)', stopOpacity: 0.8 }} />
            </linearGradient>
          </defs>

          <rect width="600" height="340" fill={s1 ? 'var(--sc-mid)' : '#16262a'} className="transition-colors duration-500" />
          <rect
            width="600" height="340"
            fill={`url(#sk-${id})`}
            className={cx('transition-opacity duration-700', s2 ? 'opacity-100' : 'opacity-0')}
          />
          <circle
            cx={data.sun.x} cy={data.sun.y} r={130}
            fill={`url(#gl-${id})`}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            className={cx(
              'origin-center transition-all duration-700',
              s4 ? 'scale-[1.3] opacity-100' : s2 ? 'scale-100 opacity-70' : 'scale-100 opacity-0'
            )}
          />
          <circle
            cx={data.sun.x} cy={data.sun.y} r={20}
            fill="var(--sc-sun)"
            className={cx('transition-opacity duration-700', s2 ? 'opacity-100' : 'opacity-0')}
          />

          <polygon points={closedPolygon(data.far)} fill={shapeFill('--sc-m1')} stroke={shapeStroke} strokeWidth={1} className={shapeClass} />
          <rect
            y="170" width="600" height="150"
            fill={`url(#fo-${id})`}
            className={cx('transition-opacity duration-700', s2 ? 'opacity-70' : 'opacity-0')}
          />
          <polygon points={closedPolygon(data.mid)} fill={shapeFill('--sc-m2')} stroke={shapeStroke} strokeWidth={1} className={shapeClass} />

          {data.tower && (
            <>
              <rect
                x={data.tower.trunk.x} y={data.tower.trunk.y} width={data.tower.trunk.w} height={data.tower.trunk.h}
                fill={shapeFill('--sc-prop')} stroke={shapeStroke} strokeWidth={1} className={shapeClass}
              />
              <polygon points={pointsToPolygon(data.tower.points)} fill={shapeFill('--sc-prop')} stroke={shapeStroke} strokeWidth={1} className={shapeClass} />
            </>
          )}

          <polygon points={closedPolygon(data.near)} fill={shapeFill('--sc-m3')} stroke={shapeStroke} strokeWidth={1} className={shapeClass} />
        </svg>

        <svg
          viewBox={SCENE_VIEWBOX}
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
          className={cx('absolute inset-0 h-full w-full transition-[filter] duration-700', s3 && 'blur-[2.6px]')}
        >
          <polygon points={closedPolygon(data.fg)} fill={shapeFill('--sc-fg')} stroke={shapeStroke} strokeWidth={1} className={shapeClass} />
          {data.foreground.map((shape, i) => (
            <polygon key={i} points={pointsToPolygon(shape.points)} fill={shapeFill('--sc-fg')} stroke={shapeStroke} strokeWidth={1} className={shapeClass} />
          ))}
        </svg>
      </div>

      {/* Vignette */}
      <div
        className={cx(
          'pointer-events-none absolute inset-0 z-[1] transition-opacity duration-700',
          s3 ? 'opacity-100' : 'opacity-0'
        )}
        style={{ background: 'radial-gradient(120% 100% at 50% 45%, rgba(2,10,12,0) 55%, rgba(2,10,12,.75) 100%)' }}
      />
      {/* Letterbox bars */}
      <div className={cx('absolute inset-x-0 top-0 z-[2] h-[12.8%] bg-[#020a0c] transition-transform duration-700 ease-[cubic-bezier(.3,.8,.3,1)]', s3 ? 'translate-y-0' : '-translate-y-full')} />
      <div className={cx('absolute inset-x-0 bottom-0 z-[2] h-[12.8%] bg-[#020a0c] transition-transform duration-700 ease-[cubic-bezier(.3,.8,.3,1)]', s3 ? 'translate-y-0' : 'translate-y-full')} />
      {/* Film grain */}
      <div
        className={cx('pointer-events-none absolute inset-0 z-[3] mix-blend-overlay transition-opacity duration-700', s4 ? 'opacity-[.35]' : 'opacity-0')}
        style={{ backgroundImage: 'var(--grain)' }}
      />
    </div>
  );
}
