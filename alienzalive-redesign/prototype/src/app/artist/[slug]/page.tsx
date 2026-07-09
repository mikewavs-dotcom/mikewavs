import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { artists, getArtist, youtubeId, formatDate, internalPath, site } from "@/lib/content";
import SectionHead from "@/components/SectionHead";
import ReleaseRail from "@/components/ReleaseRail";
import VideoEmbed from "@/components/VideoEmbed";
import SocialIcons from "@/components/SocialIcons";
import Reveal from "@/components/Reveal";

export function generateStaticParams() {
  return artists.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const a = getArtist((await params).slug);
  if (!a) return {};
  return { title: a.name, description: a.bio[0]?.slice(0, 155) };
}

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const a = getArtist((await params).slug);
  if (!a) notFound();

  const portrait = a.ogImage ?? a.images[0] ?? null;
  const latestId = youtubeId(a.latestVideoEmbed);

  return (
    <>
      {/* Hero: poster-scale name overlapping portrait */}
      <section className="gutter relative pt-[var(--space-section-sm)]">
        <Reveal>
          <p className="meta mb-3 text-accent">Alienz Alive Artist</p>
          <h1 className="display relative z-10" style={{ fontSize: "var(--text-h1)" }}>
            {a.name}
          </h1>
        </Reveal>
        {portrait && (
          <div className="poster -mt-6 max-w-2xl md:-mt-12 md:ml-[20%]">
            <div className="aspect-[3/4] overflow-hidden bg-bg-raised">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={portrait} alt={a.name} className="h-full w-full object-cover" />
            </div>
          </div>
        )}
      </section>

      {/* Biography — verbatim */}
      {a.bio.length > 0 && (
        <section className="gutter py-[var(--space-section-sm)]" aria-labelledby="bio">
          <SectionHead kicker="Who" title="Biography" id="bio" />
          <div className="flex max-w-[65ch] flex-col gap-6 text-lg leading-relaxed">
            {a.bio.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </div>
        </section>
      )}

      {/* Latest music video */}
      {latestId && (
        <section className="gutter pb-[var(--space-section-sm)]" aria-labelledby="latest-video">
          <SectionHead kicker="Watch" title="Latest Music Video" id="latest-video" />
          <div className="max-w-4xl">
            <VideoEmbed youtubeId={latestId} title={`${a.name} — latest music video`} />
          </div>
        </section>
      )}

      {/* New release */}
      {a.newRelease && (
        <section className="gutter pb-[var(--space-section-sm)]" aria-labelledby="new-release">
          <SectionHead kicker="Out Now" title="New Release" id="new-release" />
          <div className="flex max-w-3xl flex-col gap-6 md:flex-row md:items-end">
            {a.newRelease.image && (
              <div className="poster w-64 shrink-0">
                <div className="aspect-square bg-bg-raised">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={a.newRelease.image}
                    alt={a.newRelease.title ? `${a.newRelease.title} — cover art` : "New release cover art"}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            )}
            <div>
              {a.newRelease.title && (
                <p className="display text-2xl" style={{ textTransform: "none" }}>
                  {a.newRelease.title}
                </p>
              )}
              {a.newRelease.streamUrl && (
                <a
                  href={a.newRelease.streamUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="display mt-4 inline-block bg-accent px-8 py-3 text-lg text-accent-ink transition-transform duration-150 hover:scale-[1.02]"
                >
                  Stream Now <span aria-hidden="true">↗</span>
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Tour dates — real empty state from live page */}
      {a.tourNote && (
        <section className="gutter pb-[var(--space-section-sm)]" aria-labelledby="tour">
          <SectionHead kicker="Live" title={`${a.name} Tour Dates`} id="tour" />
          <p className="display text-2xl text-ink-dim md:text-3xl">{a.tourNote}</p>
        </section>
      )}

      {/* Press */}
      {a.press.length > 0 && (
        <section className="gutter pb-[var(--space-section-sm)]" aria-labelledby="press">
          <SectionHead kicker="Coverage" title={`${a.name} Press`} id="press" />
          <ul className="border-t border-line" role="list">
            {a.press.map((p) => {
              const external = !p.url.startsWith(site.url);
              const row = (
                <span className="flex items-baseline justify-between gap-6 py-5">
                  <span className="row-title text-lg md:text-2xl">{p.title}</span>
                  <span className="row-arrow display text-xl text-accent" aria-hidden="true">
                    →
                  </span>
                </span>
              );
              return (
                <li key={p.url} className="index-row">
                  {external ? (
                    <a href={p.url} target="_blank" rel="noopener noreferrer" className="block">
                      {row}
                    </a>
                  ) : (
                    <Link href={internalPath(p.url)} className="block">
                      {row}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Music videos */}
      {a.musicVideos.length > 0 && (
        <section className="gutter pb-[var(--space-section-sm)]" aria-labelledby="videos">
          <SectionHead kicker="Watch" title="Music Videos" id="videos" />
          <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" role="list">
            {a.musicVideos.map((v) => {
              const id = youtubeId(v.youtubeUrl);
              return (
                <li key={`${v.title}`}>
                  {id && <VideoEmbed youtubeId={id} title={v.title ?? "Music video"} />}
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
        </section>
      )}

      {/* Discography */}
      {a.discography.length > 0 && (
        <section className="gutter pb-[var(--space-section-sm)]" aria-labelledby="discography">
          <SectionHead kicker="Listen" title="Discography" id="discography" />
          <ReleaseRail releases={a.discography} />
        </section>
      )}

      {/* Connect */}
      {a.socials.length > 0 && (
        <section className="gutter pb-[var(--space-section)]" aria-labelledby="connect">
          <SectionHead kicker="Follow" title={`Connect With ${a.name}`} id="connect" />
          <SocialIcons socials={a.socials} label={`${a.name} on`} />
        </section>
      )}
    </>
  );
}
