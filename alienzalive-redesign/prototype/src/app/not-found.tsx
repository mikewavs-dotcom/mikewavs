import Link from "next/link";

export default function NotFound() {
  return (
    <section className="gutter flex min-h-[60vh] flex-col items-start justify-center py-[var(--space-section-sm)]">
      <p className="display" style={{ fontSize: "var(--text-poster)" }}>
        404
      </p>
      <p className="mt-4 max-w-[45ch] text-lg text-ink-dim">
        This page doesn&apos;t exist. The truth will set you free — this URL won&apos;t.
      </p>
      <Link
        href="/"
        className="display mt-10 inline-block bg-accent px-10 py-4 text-xl text-accent-ink"
      >
        Home →
      </Link>
    </section>
  );
}
