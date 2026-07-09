"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

/*
 * Scroll-gated entry moment (home only), broke.nyc-style:
 * a full-viewport poster wordmark pinned over the page; the first ~120vh of
 * scroll scrubs it away (scale down, rise, fade) and the site reveals beneath.
 *
 * Escape hatches (accessibility + impatience):
 *  - click / Enter / Escape completes the gate instantly
 *  - prefers-reduced-motion renders a static poster section, no pinning
 *
 * Webflow mapping: "while page is scrolling" interaction on a sticky section.
 * Framer mapping: scroll-transform on a sticky frame. Noted in MIGRATION_NOTES.
 */
export default function EntryGate({ headline }: { headline: string[] }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [skipped, setSkipped] = useState(false);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.55]);
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.85, 1], [1, 0.4, 0]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" || e.key === "Enter") setSkipped(true);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const words = (
    <h1 className="display text-center" style={{ fontSize: "var(--text-poster)" }}>
      {headline.map((line, i) => (
        <span key={line} className="block">
          {i === headline.length - 1 ? (
            <span className="text-accent">{line}</span>
          ) : (
            line
          )}
        </span>
      ))}
    </h1>
  );

  if (reduced || skipped) {
    return (
      <section className="gutter flex min-h-[70vh] items-center justify-center py-24">
        {words}
      </section>
    );
  }

  return (
    <div ref={ref} className="relative h-[220vh]" data-entry-gate>
      <div
        className="sticky top-0 flex h-screen cursor-pointer items-center justify-center"
        onClick={() => setSkipped(true)}
        role="button"
        tabIndex={0}
        aria-label={`${headline.join(" ")} — scroll, click, or press Enter to enter the site`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setSkipped(true);
        }}
      >
        <motion.div style={{ scale, y, opacity }}>{words}</motion.div>
        <motion.p
          className="meta absolute bottom-10 text-ink-dim"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          aria-hidden="true"
        >
          Scroll
        </motion.p>
      </div>
    </div>
  );
}
