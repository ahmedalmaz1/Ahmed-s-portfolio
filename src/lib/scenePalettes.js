/**
 * Each palette is a set of CSS custom properties consumed by <SceneArt> (sky
 * gradient stops, ridge fills, sun glow). Passed as inline `style` from
 * React — see toSceneStyle() — instead of toggled CSS classes, since with
 * Tailwind the natural place for "which colors" is data, not a class name.
 */
export const SCENE_PALETTES = {
  default: {
    top: '#061a20', mid: '#14434c', low: '#d98a3d', sun: '#ffd27a', fog: '#7fb6b0',
    m1: '#2d6f6f', m2: '#1d5157', m3: '#10353c', fg: '#06181c', prop: '#4d6864',
  },
  frozen: {
    top: '#071827', mid: '#1d4b6e', low: '#e0a46f', sun: '#ffe1b0', fog: '#a9c8e0',
    m1: '#6f9fbf', m2: '#3d6f92', m3: '#1e4360', fg: '#081a2a', prop: '#6f8fa8',
  },
  ember: {
    top: '#180b0d', mid: '#6a2a26', low: '#f08a3c', sun: '#ffc46b', fog: '#d98a5a',
    m1: '#b5562f', m2: '#7f3a28', m3: '#47201d', fg: '#1a0c0d', prop: '#8a5a3a',
  },
  tidal: {
    top: '#051a1c', mid: '#17545a', low: '#e8b45a', sun: '#ffd98a', fog: '#7fc0b6',
    m1: '#2f7d78', m2: '#1e5b5a', m3: '#103b3e', fg: '#061a1c', prop: '#56766f',
  },
};

/** Turns a palette into the inline CSS custom properties <SceneArt> reads. */
export function toSceneStyle(paletteName = 'default') {
  const p = SCENE_PALETTES[paletteName] ?? SCENE_PALETTES.default;
  return {
    '--sc-top': p.top, '--sc-mid': p.mid, '--sc-low': p.low, '--sc-sun': p.sun, '--sc-fog': p.fog,
    '--sc-m1': p.m1, '--sc-m2': p.m2, '--sc-m3': p.m3, '--sc-fg': p.fg, '--sc-prop': p.prop,
  };
}
