import type { Metadata } from "next";
import Link from "next/link";
import { pages } from "@/lib/content";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Meet The Founder — Rodney “Darkchild” Jerkins",
  description:
    "Rodney “Darkchild” Jerkins is one of the most prolific music creatives of our time.",
};

export default function FounderPage() {
  const f = pages.meetTheFounder;
  // NOTE: the live page contains a literal "Place Holder" heading — that is
  // broken content, not real copy, so it is excluded here (see audit flags).

  return (
    <>
      <section className="gutter pt-[var(--space-section-sm)]">
        <Reveal>
          <p className="meta mb-3 text-accent">{f.kicker}</p>
          <h1 className="display" style={{ fontSize: "var(--text-h1)" }}>
            {f.heading}
          </h1>
        </Reveal>
      </section>

      <section className="gutter grid gap-12 py-[var(--space-section-sm)] lg:grid-cols-[1fr_1.2fr]">
        {f.images.length > 0 && (
          <Reveal>
            <div className="poster aspect-[3/4] max-w-xl bg-bg-raised">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={f.images[0]}
                alt="Rodney “Darkchild” Jerkins"
                className="h-full w-full object-cover"
              />
            </div>
          </Reveal>
        )}
        <div>
          <h2 className="meta mb-6 text-accent">{f.bioHeading}</h2>
          <div className="flex max-w-[65ch] flex-col gap-6 text-lg leading-relaxed">
            {f.bio.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Pull quote — real copy from the live page */}
      {f.pullQuotes.map((q) => (
        <Reveal key={q.slice(0, 30)} className="border-y border-line">
          <blockquote className="gutter py-[var(--space-section-sm)]">
            <p className="display max-w-6xl text-2xl md:text-4xl" style={{ textTransform: "none" }}>
              “{q}”
            </p>
          </blockquote>
        </Reveal>
      ))}

      {/* Scripture block — John 8:32 / Stay Hungry and Strong */}
      <section className="gutter py-[var(--space-section-sm)]" aria-labelledby="scripture">
        <Reveal>
          <p className="meta mb-2 text-accent">{f.scripture.reference}</p>
          <h2 id="scripture" className="display" style={{ fontSize: "var(--text-h2)" }}>
            {f.scripture.heading}
          </h2>
          {f.scripture.quote && (
            <p className="mt-6 max-w-2xl text-xl text-ink-dim">{f.scripture.quote}</p>
          )}
        </Reveal>
      </section>

      <section className="gutter pb-[var(--space-section-sm)]">
        <Link
          href={f.cta.url}
          className="display inline-block bg-accent px-10 py-4 text-xl text-accent-ink transition-transform duration-150 hover:scale-[1.02]"
        >
          {f.cta.label} →
        </Link>
      </section>
    </>
  );
}
