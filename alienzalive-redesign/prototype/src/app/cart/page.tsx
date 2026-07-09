import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = { title: "Cart" };

/*
 * Live /cart/ is the stock WooCommerce cart. Cart/checkout implementation
 * depends on the commerce platform decision (see MIGRATION_NOTES.md), so
 * the prototype keeps the route and states that plainly.
 */
export default function CartPage() {
  return (
    <section className="gutter py-[var(--space-section)]">
      <Reveal>
        <p className="meta mb-3 text-accent">Merch</p>
        <h1 className="display" style={{ fontSize: "var(--text-h1)" }}>
          Cart
        </h1>
        <p className="mt-6 max-w-[55ch] text-lg text-ink-dim">
          Your cart is empty. Cart and checkout wiring follows the commerce
          platform decision (Webflow Ecommerce, Shopify, or headless
          WooCommerce) — see the migration notes.
        </p>
        <Link
          href="/shop/"
          className="display mt-10 inline-block bg-accent px-10 py-4 text-xl text-accent-ink"
        >
          Browse the shop →
        </Link>
      </Reveal>
    </section>
  );
}
