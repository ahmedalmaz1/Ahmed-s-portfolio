/**
 * @typedef {{
 *   slug: string,
 *   title: string,
 *   summary: string,
 *   description: string,
 *   stack: string,
 *   links: { label: string, href: string }[],
 *   cover: string,
 *   images: string[],
 * }} Project
 */

/** @type {Project[]} */
export const PROJECTS = [
  {
    slug: "frozen-pass",
    title: "Frozen Pass",
    summary:
      "A snowbound mountain pass, built as a real-time environment and a 40-second cinematic.",
    description:
      "A modular rock kit, a layered snow material, Niagara flurries and blue-hour Lumen lighting, finished with a Sequencer fly-through.",
    stack: "Unreal Engine 5, Nanite, Lumen, Niagara, Sequencer, Blender",
    links: [
      { label: "Watch the cinematic", href: "#" },
      { label: "ArtStation", href: "#" },
    ],
    cover: "/image.jpg",
    images: [
      "/projects/frozen-pass/01.jpg",
      "/projects/frozen-pass/02.jpg",
      "/projects/frozen-pass/03.jpg",
    ],
  },
  {
    slug: "ember-canyon",
    title: "Ember Canyon",
    summary:
      "A desert canyon at golden hour, lit and filmed as a short cinematic.",
    description:
      "Sculpted canyon walls, dust and heat haze, and one slow dolly shot graded inside the engine.",
    stack:
      "Unreal Engine 5, ZBrush, Substance 3D Painter, Lumen, Movie Render Queue",
    links: [
      { label: "Watch the cinematic", href: "#" },
      { label: "ArtStation", href: "#" },
    ],
    cover: "/image2.jpg",
    images: [
      "/projects/ember-canyon/01.jpg",
      "/projects/ember-canyon/02.jpg",
      "/projects/ember-canyon/03.jpg",
    ],
  },
  {
    slug: "tidal-ruins",
    title: "Tidal Ruins",
    summary:
      "A flooded ruin with water, mist and low sun, cut from three camera angles.",
    description:
      "Hand-placed ruins, a water plane with shoreline foam, and drifting mist. The cinematic edits three cameras together in Sequencer.",
    stack: "Unreal Engine 5, Blender, Quixel Megascans, Niagara, Sequencer",
    links: [
      { label: "Watch the cinematic", href: "#" },
      { label: "ArtStation", href: "#" },
    ],
    cover: "/image2.jpg",
    images: [
      "/tidal-ruins/01.jpg",
      "/tidal-ruins/02.jpg",
      "/tidal-ruins/03.jpg",
    ],
  },
];
