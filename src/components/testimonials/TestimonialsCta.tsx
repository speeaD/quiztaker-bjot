import { Reveal } from "@/components/motion/Reveal";
import type { SectionContent } from "@/lib/landing-content";

export default function TestimonialsCTA({ content }: { content: SectionContent }) {
  return (
    <section className="testimonials-cta-section">
      <div className="wrap">
        <Reveal className="cta-block cta-standalone" distance={22}>
          <h2>{content.heading}</h2>
          <p>{content.description}</p>
          <div className="ctas">
            {content.primaryCta && <a href={content.primaryCta.href} className="btn btn-gold">{content.primaryCta.label}</a>}
            {content.secondaryCta && <a href={content.secondaryCta.href} className="btn btn-ghost">{content.secondaryCta.label}</a>}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
