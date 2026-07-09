import Link from "next/link";
import { pages, videos, youtubeId, formatDate, internalPath } from "@/lib/content";
import EntryGate from "@/components/EntryGate";
import Marquee from "@/components/Marquee";
import SectionHead from "@/components/SectionHead";
import EventsBlock from "@/components/EventsBlock";
import ReleaseRail from "@/components/ReleaseRail";
import VideoEmbed from "@/components/VideoEmbed";
import NewsletterForm from "@/components/NewsletterForm";
import Reveal from "@/components/Reveal";

export default function Home() {
  const h = pages.home;
  const manifesto = pages.about.manifesto;

  return (
    <>
      {/* 1 — Scroll-gated entry: WE ARE / ALIENZ ALIVE */}
      <EntryGate headline={h.heroHeadline} />

      {/* 2 — Artist rail (real hero roster from live home) */}
      <section className="gutter pb-[var(--space-section)]" aria-label="The roster">
        <Reveal>
          <p className="meta mb-6 text-accent">The Roster</p>
        </Reveal>
        <ul className="rail" role="list">
          {h.heroArtists.map((a, i) => (
            <li key={a.name} className="w-60 md:w-72">
              <ArtistRailCard name={a.name} image={a.image} index={i} />
            </li>
          ))}
        </ul>
        <Link
          href="/alienz-alive-artists/"
          className="display mt-8 inline-block text-2xl text-accent underline-offset-8 hover:underline"
        >
          All Artists →
        </Link>
      </section>

      {/* 3 — Mission marquee: real manifesto lines */}
      <Marquee lines={manifesto.slice(5)} inverted />

      {/* 4 — Mission blurb (live home: “We Are / Chosen To Serve / Challenged To Grow”) */}
      <section className="gutter py-[var(--space-section)]" aria-label="Mission">
        <Reveal>
          <p className="display max-w-5xl" style={{ fontSize: "var(--text-h2)" }}>
            {h.missionBlurb.slice(0, 3).map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
          <Link
            href="/about-alienz-alive/"
            className="meta mt-8 inline-block border border-line px-6 py-3 text-ink-dim hover:border-accent hover:text-accent"
          >
            Read the mission
          </Link>
        </Reveal>
      </section>

      {/* 5 — Upcoming events (real empty state) */}
      <EventsBlock heading={h.eventsSection.heading} empty={h.eventsSection.empty} />

      {/* 6 — Featured news (3, as live) */}
      <section className="gutter pt-[var(--space-section)]" aria-labelledby="featured-news">
        <SectionHead kicker="Alienz Archive" title="Featured News" id="featured-news" />
        <ul className="border-t border-line" role="list">
          {h.featuredNews.map((n) => (
            <li key={n.url} className="index-row">
              <Link
                href={internalPath(n.url)}
                className="flex items-baseline justify-between gap-6 py-6"
              >
                <span className="row-title display text-2xl md:text-4xl" style={{ textTransform: "none" }}>
                  {n.title}
                </span>
                <span className="row-arrow display text-2xl text-accent" aria-hidden="true">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="/alienz-alive-news-archive/"
          className="meta mt-6 inline-block text-ink-dim hover:text-accent"
        >
          All news →
        </Link>
      </section>

      {/* 7 — 2025 Recap */}
      <section className="gutter py-[var(--space-section)]" aria-labelledby="recap">
        <SectionHead kicker="Rewind" title={h.recap2025.heading} id="recap" />

        <h3 className="meta mb-6 text-accent">New Releases</h3>
        <ReleaseRail releases={h.recap2025.newReleases} />

        <h3 className="meta mb-6 mt-16 text-accent">Featured Music Videos</h3>
        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" role="list">
          {h.recap2025.featuredMusicVideos.slice(0, 6).map((v) => {
            const id = youtubeId(v.youtubeUrl);
            const meta = videos.find((x) => x.title === v.title);
            return (
              <li key={`${v.title}`}>
                {id && (
                  <VideoEmbed youtubeId={id} title={v.title ?? "Music video"} poster={meta?.ogImage} />
                )}
                <p className="display mt-3 text-base" style={{ textTransform: "none" }}>
                  {v.title}
                </p>
                <p className="meta text-ink-dim">
                  {v.artist} · {formatDate(v.date)}
                </p>
              </li>
            );
          })}
        </ul>
        <Link href="/videos/" className="meta mt-8 inline-block text-ink-dim hover:text-accent">
          All videos →
        </Link>

        <h3 className="meta mb-6 mt-16 text-accent">Featured Releases</h3>
        <ReleaseRail releases={h.recap2025.featuredReleases} />
      </section>

      {/* 8 — Newsletter */}
      <section
        className="gutter border-t border-line py-[var(--space-section)]"
        aria-labelledby="newsletter"
      >
        <SectionHead kicker="Community" title={h.newsletter.heading} id="newsletter" />
        <div className="max-w-3xl">
          <NewsletterForm
            heading={h.newsletter.formHeading}
            fields={h.newsletter.fields}
            submitLabel={h.newsletter.submitLabel}
          />
        </div>
      </section>

      {/* 9 — Official playlist */}
      <section className="border-t border-line" aria-labelledby="playlist">
        <div className="gutter py-[var(--space-section)]">
          <Reveal>
            <p className="meta mb-2 text-accent">{h.playlist.kicker}</p>
            <h2 id="playlist" className="display" style={{ fontSize: "var(--text-h1)" }}>
              {h.playlist.heading}
            </h2>
            <a
              href={h.playlist.url}
              target="_blank"
              rel="noopener noreferrer"
              className="display mt-8 inline-block bg-accent px-10 py-4 text-xl text-accent-ink transition-transform duration-150 hover:scale-[1.02]"
            >
              {h.playlist.cta} <span aria-hidden="true">↗</span>
            </a>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function ArtistRailCard({
  name,
  image,
  index,
}: {
  name: string;
  image: string;
  index: number;
}) {
  const rosterMatch = pages.artistsRoster.tiles.find(
    (t) => t.name.toLowerCase() === name.toLowerCase(),
  );
  const href = rosterMatch ? internalPath(rosterMatch.url) : null;
  const body = (
    <>
      <div className="aspect-[3/4] overflow-hidden bg-bg-raised">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={name} loading="lazy" className="h-full w-full object-cover" />
      </div>
      <span className="poster-name display mt-3 block text-lg md:text-xl">{name}</span>
    </>
  );
  return href ? (
    <Link href={href} className="poster block" style={{ ["--tilt" as string]: `${(index % 3) - 1}deg` }}>
      {body}
    </Link>
  ) : (
    // Rodney “Darkchild” Jerkins is in the live hero rail but has no artist
    // page — link to Meet The Founder instead (see audit flags).
    <Link href="/meet-the-founder/" className="poster block" style={{ ["--tilt" as string]: `${(index % 3) - 1}deg` }}>
      {body}
    </Link>
  );
}
