"use client";

import { useState } from "react";

/*
 * Click-to-load YouTube embed: shows the video's poster frame with an
 * accessible play button; the iframe is only injected on demand
 * (performance + no third-party cookies until consented by interaction).
 */
export default function VideoEmbed({
  youtubeId,
  title,
  poster,
}: {
  youtubeId: string;
  title: string;
  poster?: string | null;
}) {
  const [playing, setPlaying] = useState(false);
  const thumb = poster || `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;

  if (playing) {
    return (
      <div className="aspect-video w-full bg-bg-raised">
        <iframe
          className="h-full w-full"
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      className="poster group relative block aspect-video w-full bg-bg-raised text-left"
      aria-label={`Play: ${title}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={thumb}
        alt=""
        loading="lazy"
        className="h-full w-full object-cover"
      />
      <span
        className="absolute inset-0 flex items-center justify-center"
        aria-hidden="true"
      >
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-2xl text-accent-ink transition-transform duration-150 group-hover:scale-110">
          ▶
        </span>
      </span>
    </button>
  );
}
