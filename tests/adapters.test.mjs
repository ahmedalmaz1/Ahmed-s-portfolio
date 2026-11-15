import { test } from "node:test";
import assert from "node:assert/strict";
import { nextProject, toParagraphs, toProject, toSite, FALLBACK_EMAIL } from "../src/lib/content/adapters.js";

const apiProject = {
  slug: "neon-alley",
  title: "Neon Alley",
  description: "Rainy street",
  toolkit: ["Unreal Engine 5", "Blender"],
  poster: { url: "https://api.test/media/projects/a.webp", thumbUrl: "https://api.test/media/projects/a_thumb.webp" },
  youtubeId: "M7lc1UVf-VE",
  images: [
    { url: "https://api.test/media/projects/b.webp", width: 2560, height: 1440, alt: "Wide shot" },
    { url: "https://api.test/media/projects/c.webp", width: null, height: null, alt: "" },
  ],
};

test("toProject maps the API shape to the UI shape", () => {
  const p = toProject(apiProject, "Ahmed Almaz");
  assert.equal(p.href, "/projects/neon-alley");
  assert.equal(p.image, apiProject.poster.url);
  assert.deepEqual(p.tools, ["Unreal Engine 5", "Blender"]);
  assert.equal(p.video.id, "M7lc1UVf-VE");
  assert.equal(p.video.channel.name, "Ahmed Almaz");
  assert.deepEqual(p.images[0], { src: apiProject.images[0].url, width: 2560, height: 1440, alt: "Wide shot" });
  // missing size / empty alt become undefined so the components use their defaults
  assert.equal(p.images[1].width, undefined);
  assert.equal(p.images[1].alt, undefined);
});

test("toProject copes with a project that has no poster, video, gallery or tools", () => {
  const p = toProject({ slug: "x-y-z", title: "T", description: null, toolkit: [], poster: null, youtubeId: null });
  assert.equal(p.image, null);
  assert.equal(p.video, null);
  assert.deepEqual(p.images, []);
  assert.equal(p.description, "");
});

test("toParagraphs splits on blank lines and trims", () => {
  assert.deepEqual(toParagraphs("One\nstill one\n\n  Two  \n\n\n"), ["One still one", "Two"]);
  assert.deepEqual(toParagraphs(""), []);
  assert.deepEqual(toParagraphs(null), []);
});

test("toSite picks the four known social links and ignores the rest", () => {
  const site = toSite(
    {
      profile: { name: "Ahmed", bio: "Hi", email: null, avatar: null, showreel: { url: "https://api.test/v.mp4" } },
      socialLinks: [
        { platform: "Instagram", url: "https://instagram.com/a" },
        { platform: "Behance", url: "https://behance.net/a" },
      ],
      projects: [apiProject],
    },
    "Ahmed Almaz",
  );
  assert.equal(site.links.instagram, "https://instagram.com/a");
  assert.equal(site.links.artstation, null);
  assert.equal("behance" in site.links, false);
  assert.equal(site.email, FALLBACK_EMAIL);
  assert.equal(site.showreel, "https://api.test/v.mp4");
  assert.equal(site.projects.length, 1);
});

test("nextProject wraps around and handles unknown slugs", () => {
  const list = [{ slug: "a" }, { slug: "b" }, { slug: "c" }];
  assert.equal(nextProject(list, "a").slug, "b");
  assert.equal(nextProject(list, "c").slug, "a");
  assert.equal(nextProject([{ slug: "a" }], "a").slug, "a");
  assert.equal(nextProject(list, "zzz"), null);
  assert.equal(nextProject([], "a"), null);
});
