import { Reveal } from "@/components/motion/Reveal";
import type { SectionContent } from "@/lib/landing-content";

export default function TeamCta({ content }: { content: SectionContent }) {
  return (
    <section>
      <div className="wrap">
        <div className="team-cta">
          <Reveal className="team-block" direction="left" distance={30}>
            <div className="eyebrow">Our team</div>
            <h2>The People Behind BJOT</h2>
            <p>
              A passionate team committed to student success, building the
              tools that help Nigerian students prepare different and score
              higher.
            </p>
            <a href="/about-us" className="btn btn-primary">
              Meet The Team
            </a>
          </Reveal>
          <Reveal className="cta-block" direction="right" distance={30} delay={0.1}>
            <h2>{content.heading}</h2>
            <p>{content.description}</p>
            <div className="ctas">
              {content.primaryCta && <a href={content.primaryCta.href} className="btn btn-gold">{content.primaryCta.label}</a>}
              {content.secondaryCta && <a href={content.secondaryCta.href} className="btn btn-ghost">{content.secondaryCta.label}</a>}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
