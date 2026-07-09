import type { Metadata } from "next";
import { postsInCategory, pages } from "@/lib/content";
import NewsIndex from "@/components/NewsIndex";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Music News",
  description: "Alienz Alive music: releases, singles, EPs and LPs.",
};

/*
 * Live /music-news/ lists posts in the category whose slug is
 * "alienz-alive-awards" but whose display name is "Alienz Alive Music"
 * (naming mismatch flagged in the audit).
 */
export default function MusicNewsPage() {
  const posts = postsInCategory("alienz-alive-awards").sort((a, b) =>
    b.date.localeCompare(a.date),
  );
  return (
    <>
      <section className="gutter pb-12 pt-[var(--space-section-sm)]">
        <Reveal>
          <p className="meta mb-3 text-accent">Alienz Archive</p>
          <h1 className="display" style={{ fontSize: "var(--text-h1)" }}>
            {pages.musicNews.heading}
          </h1>
        </Reveal>
      </section>
      <NewsIndex posts={posts} />
      <div className="pb-[var(--space-section-sm)]" />
    </>
  );
}
