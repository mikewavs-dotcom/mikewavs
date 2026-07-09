import type { Metadata } from "next";
import { pages } from "@/lib/content";
import NewsletterForm from "@/components/NewsletterForm";
import Marquee from "@/components/Marquee";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Community",
  description: "Join the Alienz Alive community.",
};

/*
 * Live /community/ is a stub: H1 + a client-rendered MetForm signup
 * (First Name, Last Name, Email, Phone Number, Your Birthday).
 * Reproduced 1:1 — flagged in the audit as a page the client may want
 * to expand.
 */
export default function CommunityPage() {
  const c = pages.community;
  return (
    <>
      <section className="gutter pt-[var(--space-section-sm)]">
        <Reveal>
          <p className="meta mb-3 text-accent">Belong</p>
          <h1 className="display" style={{ fontSize: "var(--text-h1)" }}>
            {c.heading}
          </h1>
        </Reveal>
      </section>
      <section className="gutter py-[var(--space-section-sm)]" aria-label={c.form.heading}>
        <h2 className="display mb-10" style={{ fontSize: "var(--text-h3)" }}>
          {c.form.heading}
        </h2>
        <div className="max-w-3xl">
          <NewsletterForm
            heading={c.form.heading}
            fields={c.form.fields}
            submitLabel="Subscribe"
          />
        </div>
      </section>
      <Marquee
        lines={[
          "WE ARE CHOSEN TO SERVE",
          "WE ARE CHALLENGED TO GROW",
          "WE ARE DESTINED FOR GREATNESS.",
        ]}
        inverted
      />
    </>
  );
}
