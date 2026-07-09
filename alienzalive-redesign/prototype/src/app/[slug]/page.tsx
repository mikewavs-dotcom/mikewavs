import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { internalNews, getPost, formatDate, getCategory } from "@/lib/content";
import Reveal from "@/components/Reveal";

/*
 * News posts live at the site root (e.g. /jon-keith-shares-d-o-y-o-single/),
 * exactly as on the live WordPress permalinks.
 */
export function generateStaticParams() {
  return internalNews.map((n) => ({ slug: n.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const p = getPost((await params).slug);
  if (!p) return {};
  return { title: p.title, description: p.excerpt.slice(0, 155) };
}

/*
 * Many live post bodies begin with a heading that repeats the post title
 * (pasted in by the editor). We render our own <h1>, so an identical
 * leading heading is dropped at display time — the export keeps the body
 * byte-exact; this is presentation only.
 */
function stripLeadingDuplicateTitle(html: string, title: string): string {
  const m = html.match(/^\s*<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/);
  if (!m) return html;
  const text = m[2].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  const norm = (s: string) => s.replace(/[“”"'’‘!.]/g, "").replace(/\s+/g, " ").trim().toLowerCase();
  if (norm(text) === norm(title)) return html.slice(m.index! + m[0].length);
  return html;
}

export default async function NewsPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const p = getPost((await params).slug);
  if (!p) notFound();

  const catNames = p.categories
    .map((slug) => getCategory(slug)?.name ?? slug)
    .filter((v, i, arr) => arr.indexOf(v) === i);

  return (
    <article className="pb-[var(--space-section-sm)]">
      <header className="gutter pt-[var(--space-section-sm)]">
        <Reveal>
          <p className="meta mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-ink-dim">
            <time dateTime={p.date}>{formatDate(p.date)}</time>
            {catNames.map((c) => (
              <span key={c} className="text-accent">
                {c}
              </span>
            ))}
          </p>
          <h1
            className="display max-w-6xl"
            style={{ fontSize: "clamp(2.2rem, 5.5vw, 5rem)", textTransform: "none" }}
          >
            {p.title}
          </h1>
        </Reveal>
      </header>

      {p.featuredImage && (
        <div className="gutter mt-12">
          <div className="max-w-4xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.featuredImage}
              alt={p.title}
              className="w-full object-cover"
            />
          </div>
        </div>
      )}

      <div className="gutter mt-12">
        <div
          className="prose-news"
          // Real WordPress body HTML from the content export — verbatim.
          dangerouslySetInnerHTML={{
            __html: stripLeadingDuplicateTitle(p.bodyHtml, p.title),
          }}
        />
      </div>

      {p.streamLinks.length > 0 && (
        <div className="gutter mt-12 flex flex-wrap gap-4">
          {p.streamLinks.map((s) => (
            <a
              key={s}
              href={s}
              target="_blank"
              rel="noopener noreferrer"
              className="display inline-block bg-accent px-8 py-3 text-lg text-accent-ink transition-transform duration-150 hover:scale-[1.02]"
            >
              Stream Now <span aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
      )}

      <div className="gutter mt-16">
        <Link href="/alienz-alive-news-archive/" className="meta text-ink-dim hover:text-accent">
          ← Back to news
        </Link>
      </div>
    </article>
  );
}
