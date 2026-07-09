import SectionHead from "./SectionHead";

/*
 * The live site has no scheduled events; every events module shows this
 * exact empty state. Rendered as a deliberate editorial moment.
 */
export default function EventsBlock({
  heading,
  empty,
}: {
  heading: string;
  empty: string;
}) {
  return (
    <section className="gutter" aria-labelledby="events-heading">
      <SectionHead kicker="Live" title={heading} id="events-heading" />
      <p className="display max-w-4xl text-2xl text-ink-dim md:text-4xl">{empty}</p>
    </section>
  );
}
