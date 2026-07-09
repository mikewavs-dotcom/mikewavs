import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { products, getProduct } from "@/lib/content";
import Reveal from "@/components/Reveal";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const p = getProduct((await params).slug);
  return p ? { title: p.name } : {};
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const p = getProduct((await params).slug);
  if (!p) notFound();

  return (
    <article className="gutter grid gap-12 pb-[var(--space-section-sm)] pt-[var(--space-section-sm)] lg:grid-cols-2">
      <Reveal>
        <div className="poster aspect-square max-w-xl bg-bg-raised">
          {p.images[0] && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
          )}
        </div>
        {p.images.length > 1 && (
          <div className="mt-4 flex gap-4">
            {p.images.slice(1).map((img) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={img}
                src={img}
                alt={`${p.name} — alternate view`}
                loading="lazy"
                className="h-28 w-28 object-cover"
              />
            ))}
          </div>
        )}
      </Reveal>
      <div>
        <p className="meta mb-3 text-accent">Official Merch</p>
        <h1 className="display" style={{ fontSize: "var(--text-h2)" }}>
          {p.name}
        </h1>
        <p className="display mt-4 text-3xl text-accent">{p.price}</p>
        {p.description && (
          <p className="mt-6 max-w-[55ch] text-lg leading-relaxed text-ink-dim">
            {p.description}
          </p>
        )}
        {/*
          Checkout is intentionally not wired: commerce platform (Framer
          doesn't ship native commerce; Webflow Ecommerce vs. Shopify Buy
          Buttons vs. keeping WooCommerce headless) is a client decision —
          see MIGRATION_NOTES.md.
        */}
        <button
          type="button"
          className="display mt-10 cursor-not-allowed bg-accent px-10 py-4 text-xl text-accent-ink opacity-90"
          aria-describedby="cart-note"
        >
          Add to cart
        </button>
        <p id="cart-note" className="meta mt-3 text-ink-faint">
          Checkout wiring pending platform decision — see migration notes.
        </p>
        <Link href="/shop/" className="meta mt-10 inline-block text-ink-dim hover:text-accent">
          ← Back to shop
        </Link>
      </div>
    </article>
  );
}
