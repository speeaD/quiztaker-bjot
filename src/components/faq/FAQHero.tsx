import type { SectionContent } from "@/lib/landing-content";

export default function FAQHero({ content }: { content: SectionContent }) {
  return (
    <section className="about-hero">
      <div className="wrap about-hero-inner">
        <div className="eyebrow-line" />
        <div className="eyebrow">{content.eyebrow}</div>
        <h1>{content.heading}</h1>
        <p>{content.description}</p>
      </div>
    </section>
  );
}
