import Link from "next/link";
import { formatDate, postPath, type NewsPost } from "@/lib/content";

/*
 * Editorial index rows: date — headline — categories.
 * External press posts open at the source with an "↗ source" marker,
 * exactly as they behave in the live news listings.
 */
export default function NewsIndex({ posts }: { posts: NewsPost[] }) {
  return (
    <ul className="border-t border-line" role="list">
      {posts.map((p) => {
        const inner = (
          <span className="grid grid-cols-1 items-baseline gap-x-8 gap-y-1 py-6 md:grid-cols-[7rem_1fr_auto]">
            <time className="meta text-ink-dim" dateTime={p.date}>
              {formatDate(p.date)}
            </time>
            <span
              className="row-title display block text-xl md:text-3xl"
              style={{ textTransform: "none" }}
            >
              {p.title}
              {p.isExternalLink && (
                <span className="meta ml-3 align-middle text-ink-dim">
                  ↗ source
                </span>
              )}
            </span>
            <span className="meta hidden items-center gap-3 text-ink-faint md:flex">
              {p.categories.filter((c) => c !== "alienz-alive-news").slice(0, 2).join(" · ")}
              <span className="row-arrow text-accent" aria-hidden="true">
                →
              </span>
            </span>
          </span>
        );
        return (
          <li key={p.id} className="index-row">
            {p.isExternalLink ? (
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="gutter block"
              >
                {inner}
              </a>
            ) : (
              <Link href={postPath(p)} className="gutter block">
                {inner}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}
