/**
 * @typedef {{
 *   slug: string,
 *   title: string,
 *   summary: string,
 *   description: string,
 *   stack: string,
 *   links: { label: string, href: string }[],
 *   palette: 'frozen' | 'ember' | 'tidal',
 *   scene: import('./sceneArt').SceneOptions
 * }} Project
 */

/** @type {Project[]} */
export const PROJECTS = [
  {
    slug: 'frozen-pass',
    title: 'Frozen Pass',
    summary: 'A snowbound mountain pass, built as a real-time environment and a 40-second cinematic.',
    description:
      'A modular rock kit, a layered snow material, Niagara flurries and blue-hour Lumen lighting, finished with a Sequencer fly-through.',
    stack: 'Unreal Engine 5, Nanite, Lumen, Niagara, Sequencer, Blender',
    links: [
      { label: 'Watch the cinematic', href: '#' },
      { label: 'ArtStation', href: '#' },
    ],
    palette: 'frozen',
    scene: { seed: 14, trees: 7, rocks: 2, tower: 0 },
  },
  {
    slug: 'ember-canyon',
    title: 'Ember Canyon',
    summary: 'A desert canyon at golden hour, lit and filmed as a short cinematic.',
    description: 'Sculpted canyon walls, dust and heat haze, and one slow dolly shot graded inside the engine.',
    stack: 'Unreal Engine 5, ZBrush, Substance 3D Painter, Lumen, Movie Render Queue',
    links: [
      { label: 'Watch the cinematic', href: '#' },
      { label: 'ArtStation', href: '#' },
    ],
    palette: 'ember',
    scene: { seed: 41, trees: 0, rocks: 5, tower: 0 },
  },
  {
    slug: 'tidal-ruins',
    title: 'Tidal Ruins',
    summary: 'A flooded ruin with water, mist and low sun, cut from three camera angles.',
    description:
      'Hand-placed ruins, a water plane with shoreline foam, and drifting mist. The cinematic edits three cameras together in Sequencer.',
    stack: 'Unreal Engine 5, Blender, Quixel Megascans, Niagara, Sequencer',
    links: [
      { label: 'Watch the cinematic', href: '#' },
      { label: 'ArtStation', href: '#' },
    ],
    palette: 'tidal',
    scene: { seed: 77, trees: 2, rocks: 3, tower: 1 },
  },
];
