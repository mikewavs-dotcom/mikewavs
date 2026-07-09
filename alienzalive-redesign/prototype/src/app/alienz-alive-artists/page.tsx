import type { Metadata } from "next";
import { pages } from "@/lib/content";
import RosterViews from "@/components/RosterViews";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Alienz Alive Artists",
  description: "The Alienz Alive roster.",
};

export default function ArtistsPage() {
  const r = pages.artistsRoster;
  return (
    <>
      <section className="gutter pb-12 pt-[var(--space-section-sm)]">
        <Reveal>
          <p className="meta mb-3 text-accent">The Roster</p>
          <h1 className="display" style={{ fontSize: "var(--text-h1)" }}>
            {r.heading}
          </h1>
        </Reveal>
      </section>
      {/*
        Roster grid reproduces the live /alienz-alive-artists/ page (9 tiles).
        Alex Jean and IMRSQD have live artist pages but are absent from the
        live roster grid — reproduced faithfully; flagged for client decision.
      */}
      <RosterViews tiles={r.tiles} />
      <div className="pb-[var(--space-section-sm)]" />
    </>
  );
}
