import type { Metadata } from "next";
import Link from "next/link";
import { news, categories } from "@/lib/content";
import NewsIndex from "@/components/NewsIndex";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Alienz Alive News Archive",
  description: "Every Alienz Alive story: releases, press, signings, awards.",
};

export default function NewsArchivePage() {
  const sorted = [...news].sort((a, b) => b.date.localeCompare(a.date));
  const chips = categories.filter((c) => c.parent !== 0 && c.count > 0);

  return (
    <>
      <section className="gutter pb-12 pt-[var(--space-section-sm)]">
        <Reveal>
          <p className="meta mb-3 text-accent">Alienz Archive</p>
          <h1 className="display" style={{ fontSize: "var(--text-h1)" }}>
            News
          </h1>
        </Reveal>
        <nav aria-label="News categories" className="mt-8">
          <ul className="flex flex-wrap gap-2" role="list">
            {chips.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/category/${c.slug}/`}
                  className="meta border border-line px-4 py-2 text-ink-dim hover:border-accent hover:text-accent"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </section>
      <NewsIndex posts={sorted} />
      <div className="pb-[var(--space-section-sm)]" />
    </>
  );
}
