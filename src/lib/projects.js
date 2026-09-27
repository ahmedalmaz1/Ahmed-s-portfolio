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
    video: "https://www.youtube.com/watch?v=GdWR1QQLW-k",
    cover: "/image.jpg",
    images: ["/image6.jpg", "/image7.jpg", "/image5.jpg"],
  },
  {
    slug: "ember-canyon",
    title: "Ember Canyon",
    video: "https://www.youtube.com/watch?v=GdWR1QQLW-k",

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
    images: ["/image6.jpg", "/image7.jpg", "/image5.jpg"],
  },
  {
    slug: "tidal-ruins",
    title: "Tidal Ruins",
    video: "https://www.youtube.com/watch?v=GdWR1QQLW-k",

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
    images: ["/image6.jpg", "/image7.jpg", "/image5.jpg"],
  },
  {
    slug: "frozen-pass",
    title: "Frozen Pass2",
    summary:
      "A snowbound mountain pass, built as a real-time environment and a 40-second cinematic.",
    description:
      "A modular rock kit, a layered snow material, Niagara flurries and blue-hour Lumen lighting, finished with a Sequencer fly-through.",
    stack: "Unreal Engine 5, Nanite, Lumen, Niagara, Sequencer, Blender",
    links: [
      { label: "Watch the cinematic", href: "#" },
      { label: "ArtStation", href: "#" },
    ],
    video: "https://www.youtube.com/watch?v=GdWR1QQLW-k",
    cover: "/image.jpg",
    images: ["/image6.jpg", "/image7.jpg", "/image5.jpg"],
  },
  {
    slug: "ember-canyon",
    title: "Ember Canyon2",
    video: "https://www.youtube.com/watch?v=GdWR1QQLW-k",

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
    images: ["/image6.jpg", "/image7.jpg", "/image5.jpg"],
  },
  {
    slug: "tidal-ruins",
    title: "Tidal Ruins2",
    video: "https://www.youtube.com/watch?v=GdWR1QQLW-k",

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
    images: ["/image6.jpg", "/image7.jpg", "/image5.jpg"],
  },
];
