import type { Metadata } from "next";
import Link from "next/link";
import { products } from "@/lib/content";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Shop",
  description: "Official Alienz Alive merch.",
};

export default function ShopPage() {
  return (
    <>
      <section className="gutter pb-12 pt-[var(--space-section-sm)]">
        <Reveal>
          <p className="meta mb-3 text-accent">Merch</p>
          <h1 className="display" style={{ fontSize: "var(--text-h1)" }}>
            Shop
          </h1>
        </Reveal>
      </section>
      <section className="gutter pb-[var(--space-section-sm)]">
        <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3" role="list">
          {products.map((p, i) => (
            <li key={p.slug}>
              <Link
                href={`/product/${p.slug}/`}
                className="poster block"
                style={{ ["--tilt" as string]: `${(i % 2 ? 1 : -1)}deg` }}
              >
                <div className="aspect-square overflow-hidden bg-bg-raised">
                  {p.images[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <span className="poster-name display mt-4 block text-xl">{p.name}</span>
                <span className="meta text-ink-dim">{p.price}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
