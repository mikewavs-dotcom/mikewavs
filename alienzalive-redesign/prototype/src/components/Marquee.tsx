/*
 * Manifesto ticker. Content = real About-page manifesto lines, verbatim.
 * Pauses on hover; static single line under prefers-reduced-motion (CSS).
 */
export default function Marquee({
  lines,
  inverted = false,
}: {
  lines: string[];
  inverted?: boolean;
}) {
  const sequence = lines.join("  ✦  ");
  return (
    <div
      className={`marquee overflow-hidden border-y py-4 ${
        inverted
          ? "border-transparent bg-accent text-accent-ink"
          : "border-line text-ink"
      }`}
      aria-label={sequence}
    >
      <div className="marquee-track flex w-max whitespace-nowrap" aria-hidden="true">
        {[0, 1].map((i) => (
          <span key={i} className="display px-4 text-xl md:text-2xl">
            {sequence}
            {"  ✦  "}
          </span>
        ))}
      </div>
    </div>
  );
}
