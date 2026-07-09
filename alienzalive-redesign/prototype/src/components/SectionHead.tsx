import Reveal from "./Reveal";

export default function SectionHead({
  kicker,
  title,
  id,
}: {
  kicker?: string;
  title: string;
  id?: string;
}) {
  return (
    <Reveal className="mb-10 border-b border-line-strong pb-4">
      {kicker && <p className="meta mb-2 text-accent">{kicker}</p>}
      <h2 id={id} className="display" style={{ fontSize: "var(--text-h2)" }}>
        {title}
      </h2>
    </Reveal>
  );
}
