import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <section className="gutter py-[var(--space-section)]">
      <Reveal>
        <p className="meta mb-3 text-accent">Merch</p>
        <h1 className="display" style={{ fontSize: "var(--text-h1)" }}>
          Checkout
        </h1>
        <p className="mt-6 max-w-[55ch] text-lg text-ink-dim">
          Checkout is handled by the commerce platform selected at migration
          (Webflow Ecommerce, Shopify, or headless WooCommerce) — see the
          migration notes.
        </p>
        <Link
          href="/shop/"
          className="display mt-10 inline-block bg-accent px-10 py-4 text-xl text-accent-ink"
        >
          Back to shop →
        </Link>
      </Reveal>
    </section>
  );
}
