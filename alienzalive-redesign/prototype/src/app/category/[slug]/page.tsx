import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { categories, getCategory, postsInCategory } from "@/lib/content";
import NewsIndex from "@/components/NewsIndex";
import Reveal from "@/components/Reveal";

export function generateStaticParams() {
  return categories.filter((c) => c.count > 0).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const c = getCategory((await params).slug);
  return c ? { title: `${c.name} — News` } : {};
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const c = getCategory((await params).slug);
  if (!c || c.count === 0) notFound();
  const posts = postsInCategory(c.slug).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <section className="gutter pb-12 pt-[var(--space-section-sm)]">
        <Reveal>
          <p className="meta mb-3 text-accent">Category</p>
          <h1 className="display" style={{ fontSize: "var(--text-h1)" }}>
            {c.name}
          </h1>
          <p className="meta mt-4 text-ink-dim">
            {posts.length} {posts.length === 1 ? "story" : "stories"}
          </p>
        </Reveal>
      </section>
      <NewsIndex posts={posts} />
      <div className="pb-[var(--space-section-sm)]" />
    </>
  );
}
