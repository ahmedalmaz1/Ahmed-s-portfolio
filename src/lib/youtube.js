export function getYouTubeId(url) {
  const match = url.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/);
  return match ? match[1] : null;
}

export async function getYouTubeMeta(url) {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
      { next: { revalidate: 60 * 60 * 24 } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    return {
      title: data.title,
      channel: data.author_name,
      // the real source aspect ratio, straight from YouTube
      aspectRatio:
        data.thumbnail_width && data.thumbnail_height
          ? data.thumbnail_width / data.thumbnail_height
          : 16 / 9,
    };
  } catch {
    return null;
  }
}
