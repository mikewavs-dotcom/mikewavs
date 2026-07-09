import type { Metadata } from "next";
import Link from "next/link";
import { videos, formatDate } from "@/lib/content";
import VideoEmbed from "@/components/VideoEmbed";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Videos",
  description: "Every Alienz Alive music video.",
};

export default function VideosPage() {
  return (
    <>
      <section className="gutter pb-12 pt-[var(--space-section-sm)]">
        <Reveal>
          <p className="meta mb-3 text-accent">Watch</p>
          <h1 className="display" style={{ fontSize: "var(--text-h1)" }}>
            Videos
          </h1>
        </Reveal>
      </section>
      <section className="gutter pb-[var(--space-section-sm)]">
        <ul className="grid gap-x-6 gap-y-12 md:grid-cols-2 lg:grid-cols-3" role="list">
          {videos.map((v) => (
            <li key={v.slug}>
              {v.youtubeId ? (
                <VideoEmbed
                  youtubeId={v.youtubeId}
                  title={v.title ?? "Music video"}
                  poster={v.ogImage}
                />
              ) : (
                <div className="flex aspect-video items-center justify-center border border-line bg-bg-raised">
                  <p className="meta text-ink-faint">Video unavailable on live site</p>
                </div>
              )}
              <Link href={`/videos/${v.slug}/`} className="group block">
                <p
                  className="display mt-3 text-base group-hover:text-accent"
                  style={{ textTransform: "none" }}
                >
                  {v.title}
                </p>
              </Link>
              <p className="meta text-ink-dim">
                {[v.artist, formatDate(v.date)].filter(Boolean).join(" · ")}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
