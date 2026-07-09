import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { videos, getVideo, formatDate } from "@/lib/content";
import VideoEmbed from "@/components/VideoEmbed";
import Reveal from "@/components/Reveal";

export function generateStaticParams() {
  return videos.map((v) => ({ slug: v.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const v = getVideo((await params).slug);
  return v ? { title: v.title ?? "Video" } : {};
}

export default async function VideoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const v = getVideo((await params).slug);
  if (!v) notFound();

  return (
    <article className="gutter pb-[var(--space-section-sm)] pt-[var(--space-section-sm)]">
      <Reveal>
        <p className="meta mb-3 text-accent">
          {[v.artist, formatDate(v.date)].filter(Boolean).join(" · ")}
        </p>
        <h1
          className="display max-w-6xl"
          style={{ fontSize: "clamp(2rem, 4.5vw, 4rem)", textTransform: "none" }}
        >
          {v.title}
        </h1>
      </Reveal>
      <div className="mt-10 max-w-5xl">
        {v.youtubeId ? (
          <VideoEmbed youtubeId={v.youtubeId} title={v.title ?? "Music video"} poster={v.ogImage} />
        ) : (
          <p className="meta border border-line p-8 text-ink-dim">
            This video has no embed on the live site (flagged in the content audit).
          </p>
        )}
      </div>
      {v.recoveredFrom && (
        <p className="meta mt-4 max-w-2xl text-ink-faint">
          Note: embed missing on the live page for this video; the YouTube link was
          recovered from the site&apos;s own video listings.
        </p>
      )}
      <Link href="/videos/" className="meta mt-12 inline-block text-ink-dim hover:text-accent">
        ← All videos
      </Link>
    </article>
  );
}
