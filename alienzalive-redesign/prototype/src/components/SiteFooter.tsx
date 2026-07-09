import { site } from "@/lib/content";
import SocialIcons from "./SocialIcons";

export default function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="gutter py-16">
        <p className="display text-h2-fluid text-3xl md:text-5xl">
          WE ARE <span className="text-accent">ALIENZ ALIVE</span>
        </p>
        <div className="mt-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SocialIcons socials={site.footer.socials} label="Alienz Alive on" />
          <div className="meta flex flex-col gap-2 text-ink-dim md:items-end">
            {/* Copyright text reproduced from live site; the live version links
                to sonaar.io (theme vendor) — dropped here, flagged in audit. */}
            <p>{site.footer.copyright}</p>
            {/* Credit preserved pending client decision — see audit flags. */}
            <a
              href={site.footer.credit.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent"
            >
              {site.footer.credit.text}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
