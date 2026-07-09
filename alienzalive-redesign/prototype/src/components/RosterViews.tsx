"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { internalPath, site } from "@/lib/content";

type Tile = { name: string; url: string; image: string | null; genre: string | null };

/*
 * Artist roster with List/Grid toggle (broke.nyc motif).
 * Grid = poster wall: tall tiles, desaturated at rest, tilt+color on hover.
 * List = full-bleed index rows with poster-scale names.
 * NOTE for Webflow: this is the one React-state interaction; Webflow needs
 * a tabs element or two stacked collection lists (see MIGRATION_NOTES.md).
 */
export default function RosterViews({ tiles }: { tiles: Tile[] }) {
  const [view, setView] = useState<"grid" | "list">("grid");
  const reduced = useReducedMotion();

  return (
    <div>
      <div
        className="gutter mb-10 flex items-center gap-2"
        role="group"
        aria-label="Roster view"
      >
        {(["grid", "list"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            aria-pressed={view === v}
            className={`meta border px-5 py-2 transition-colors duration-150 ${
              view === v
                ? "border-accent bg-accent text-accent-ink"
                : "border-line text-ink-dim hover:border-line-strong hover:text-ink"
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {view === "grid" ? (
          <motion.ul
            key="grid"
            role="list"
            className="gutter grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduced ? undefined : { opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.65, 0, 0.35, 1] }}
          >
            {tiles.map((t, i) => (
              <li key={t.url}>
                <Link
                  href={internalPath(site.url + internalPath(t.url))}
                  className="poster block"
                  style={{ ["--tilt" as string]: `${(i % 3) - 1}deg` }}
                >
                  <div className="aspect-[2/3] overflow-hidden bg-bg-raised">
                    {t.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={t.image}
                        alt={t.name}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <span className="poster-name display mt-3 block text-xl md:text-2xl">
                    {t.name}
                  </span>
                  {t.genre && (
                    <span className="meta text-ink-faint">{t.genre.replace(/-/g, " ")}</span>
                  )}
                </Link>
              </li>
            ))}
          </motion.ul>
        ) : (
          <motion.ul
            key="list"
            role="list"
            className="border-t border-line"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduced ? undefined : { opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.65, 0, 0.35, 1] }}
          >
            {tiles.map((t, i) => (
              <li key={t.url} className="index-row">
                <Link
                  href={internalPath(t.url)}
                  className="gutter flex items-baseline justify-between gap-6 py-5"
                >
                  <span className="flex items-baseline gap-6">
                    <span className="meta w-8 text-ink-faint">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className="row-title display text-3xl md:text-6xl"
                    >
                      {t.name}
                    </span>
                  </span>
                  <span className="row-arrow display text-2xl text-accent" aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
