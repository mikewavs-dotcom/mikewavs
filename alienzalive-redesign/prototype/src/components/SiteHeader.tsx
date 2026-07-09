"use client";

import Link from "next/link";
import { useState } from "react";
import { site, internalPath, type NavItem } from "@/lib/content";

/*
 * Nav structure comes from the content export (real WP menu).
 * One deliberate change vs. live: the "Alienz Archive" parent item points
 * to the News archive because its live target (/news-3-columns) is a 404.
 * Flagged in MIGRATION_NOTES.md.
 */
function navHref(item: NavItem): string {
  if (item.url === "/news-3-columns") return "/alienz-alive-news-archive/";
  return internalPath(site.url + item.url);
}

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/95 backdrop-blur-sm">
      <div className="gutter flex h-16 items-center justify-between">
        <Link
          href="/"
          className="display text-lg tracking-tight"
          onClick={() => setOpen(false)}
        >
          ALIENZ<span className="text-accent">ALIVE</span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-8">
            {site.nav.map((item) => (
              <li key={item.label} className="group relative">
                <Link href={navHref(item)} className="meta hover:text-accent">
                  {item.label}
                </Link>
                {item.children && (
                  <ul className="invisible absolute left-1/2 top-full z-50 min-w-48 -translate-x-1/2 border border-line bg-bg opacity-0 transition-opacity duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                    {item.children.map((ch) => (
                      <li key={ch.label}>
                        <Link
                          href={navHref(ch)}
                          className="meta block px-5 py-3 hover:bg-bg-raised hover:text-accent"
                        >
                          {ch.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          className="meta md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen(!open)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {/* Mobile full-screen menu: poster-type links */}
      {open && (
        <nav
          id="mobile-menu"
          aria-label="Main"
          className="fixed inset-0 top-16 z-40 overflow-y-auto bg-bg md:hidden"
        >
          <ul className="gutter flex flex-col gap-2 py-10">
            {site.nav.map((item) => (
              <li key={item.label}>
                <Link
                  href={navHref(item)}
                  className="display block py-2 text-4xl hover:text-accent"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
                {item.children && (
                  <ul className="mt-1 flex flex-col gap-1 pl-1">
                    {item.children.map((ch) => (
                      <li key={ch.label}>
                        <Link
                          href={navHref(ch)}
                          className="meta block py-2 text-ink-dim hover:text-accent"
                          onClick={() => setOpen(false)}
                        >
                          {ch.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
