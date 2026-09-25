import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/Reveal";
import type { SectionContent } from "@/lib/landing-content";

export default function AboutIntro({ content, standard }: { content: SectionContent | null; standard: SectionContent | null }) {
  return (
    <>
      {content && <section className="about-intro">
        <div className="wrap about-intro-grid">
          <Reveal className="about-intro-copy" direction="left" distance={30}>
            <div className="eyebrow">{content.eyebrow}</div>
            <h2>{content.heading}</h2>
            <p>{content.description}</p>
          </Reveal>

          <StaggerGroup
            className="about-ecosystem-list"
            as="ul"
            stagger={0.08}
          >
            {(content.highlights ?? []).map((item) => (
              <StaggerItem className="about-ecosystem-item" key={item} direction="right" distance={20}>
                {item}
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>}

      {standard && <section className="standard-banner">
        <Reveal className="wrap standard-inner" amount={0.4}>
          <p>{standard.text}</p>
        </Reveal>
      </section>}
    </>
  );
}
