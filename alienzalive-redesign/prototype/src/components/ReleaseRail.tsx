import type { Release } from "@/lib/content";

/*
 * Horizontal rail of square cover art with outbound "STREAM NOW ↗" links.
 * Cards whose caption is empty on the live site render cover-only —
 * we never invent titles (see audit flags).
 */
export default function ReleaseRail({ releases }: { releases: Release[] }) {
  if (!releases.length) return null;
  return (
    <ul className="rail" role="list">
      {releases.map((r, i) => (
        <li key={`${r.streamUrl ?? "release"}-${i}`} className="w-56 md:w-64">
          <div className="poster aspect-square bg-bg-raised" style={{ ["--tilt" as string]: `${(i % 2 ? 1 : -1) * 1}deg` }}>
            {r.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={r.image}
                alt={r.title ? `${r.title} — cover art` : "Release cover art"}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            )}
          </div>
          {r.title && <p className="meta mt-3 text-ink">{r.title}</p>}
          {r.streamUrl && (
            <a
              href={r.streamUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="meta mt-1 inline-block text-accent underline-offset-4 hover:underline"
            >
              Stream Now <span aria-hidden="true">↗</span>
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}
