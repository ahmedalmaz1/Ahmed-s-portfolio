export const PROJECTS = [
  {
    slug: "neon-alley",
    href: "/projects/neon-alley",
    title: "Neon Alley",
    category: "Environment · Cinematic",
    year: "2025",
    role: "Environment Artist",
    engine: "Unreal Engine 5.4",
    duration: "6 weeks",
    description:
      "A rain-soaked back street where wet asphalt and flickering signs carry the whole mood of the shot.",
    image: "/newImage.jpeg",
    images: [
      { src: "/im1.jpg", width: 1920, height: 1080 },
      { src: "/im2.jpg", width: 1920, height: 1080 },
      { src: "/newImage.jpeg", width: 1920, height: 1080 },
      { src: "/hero-poster.webp", width: 1920, height: 1080 },
    ],
    tools: [
      "Unreal Engine 5",
      "Lumen",
      "Sequencer",
      "Blender",
      "Substance Painter",
    ],
    video: {
      id: "M7lc1UVf-VE",
      title: "Neon Alley | Cinematic Breakdown",
      channel: { name: "Ahmed Almaz", avatar: "" },
    },
  },
  {
    slug: "fog-harbor",
    href: "/projects/fog-harbor",
    title: "Fog Harbor",
    category: "Environment · Real-time",
    year: "2025",
    role: "Environment Artist",
    engine: "Unreal Engine 5.3",
    duration: "8 weeks",
    description:
      "A quiet industrial port swallowed by fog, built around depth, scale and soft volumetric light.",
    image: "/realImage.jpg",
    images: [
      { src: "/im3.jpg", width: 1920, height: 1080 },
      // { src: "/im4.webp", width: 1920, height: 1080 },
      { src: "/im5.webp", width: 1920, height: 1080 },
    ],
    tools: ["Unreal Engine 5", "Blender", "ZBrush", "Quixel Megascans"],
    video: {
      id: "M7lc1UVf-VE",
      title: "Fog Harbor | Real-time Walkthrough",
      channel: { name: "Ahmed Almaz", avatar: "" },
    },
  },
];

export const getProject = (slug) => PROJECTS.find((p) => p.slug === slug);

export const getNextProject = (slug) => {
  const i = PROJECTS.findIndex((p) => p.slug === slug);
  return PROJECTS[(i + 1) % PROJECTS.length];
};
