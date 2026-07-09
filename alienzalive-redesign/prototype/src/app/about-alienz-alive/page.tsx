import type { Metadata } from "next";
import Link from "next/link";
import { pages } from "@/lib/content";
import Reveal from "@/components/Reveal";
import Marquee from "@/components/Marquee";

export const metadata: Metadata = {
  title: "About Alienz Alive",
  description:
    "Our movement is our mission: to build community, develop artists, foster dialogue, and encourage storytelling.",
};

export default function AboutPage() {
  const a = pages.about;
  // Real manifesto, verbatim, split as it reads on the live page:
  // lines 0–4 = mission statement, lines 5–7 = the WE ARE declarations.
  const mission = a.manifesto.slice(0, 5);
  const declarations = a.manifesto.slice(5);

  return (
    <>
      <section className="gutter pt-[var(--space-section-sm)]">
        <Reveal>
          <p className="meta mb-3 text-accent">{a.kicker}</p>
          <h1 className="display" style={{ fontSize: "var(--text-h1)" }}>
            {a.heading}
          </h1>
        </Reveal>
      </section>

      <section className="gutter py-[var(--space-section-sm)]" aria-label="Mission">
        <Reveal>
          <p className="display max-w-6xl text-2xl leading-tight md:text-5xl">
            {mission.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
        </Reveal>
      </section>

      <section aria-label="Declarations">
        {declarations.map((line, i) => (
          <Reveal key={line} className={i < declarations.length - 1 ? "border-t border-line" : "border-y border-line"}>
            <p
              className={`gutter display py-10 ${i === declarations.length - 1 ? "text-accent" : ""}`}
              style={{ fontSize: "var(--text-h2)" }}
            >
              {line}
            </p>
          </Reveal>
        ))}
      </section>

      {/* Roster teaser strip — as on the live page */}
      <section className="gutter py-[var(--space-section-sm)]" aria-labelledby="roster-teaser">
        <h2 id="roster-teaser" className="display mb-8" style={{ fontSize: "var(--text-h2)" }}>
          {a.rosterTeaser.heading}
        </h2>
        {a.images.length > 0 && (
          <ul className="rail" role="list">
            {a.images.map((img) => (
              <li key={img} className="w-48 md:w-56">
                <div className="poster aspect-[2/3] bg-bg-raised">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" loading="lazy" className="h-full w-full object-cover" />
                </div>
              </li>
            ))}
          </ul>
        )}
        <Link
          href={a.rosterTeaser.cta.url}
          className="display mt-10 inline-block bg-accent px-10 py-4 text-xl text-accent-ink transition-transform duration-150 hover:scale-[1.02]"
        >
          {a.rosterTeaser.cta.label} →
        </Link>
      </section>

      <Marquee lines={declarations} inverted />
    </>
  );
}
