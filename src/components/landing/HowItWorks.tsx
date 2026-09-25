import Image from "next/image";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/Reveal";
import type { SectionContent } from "@/lib/landing-content";

const ILLUSTRATIONS = ["/join.svg", "/learn.svg", "/practice.svg", "/improve.svg"];

export default function HowItWorks({ content }: { content: SectionContent }) {
  return (
    <section>
      <div className="wrap">
        <Reveal className="section-head">
          <div className="eyebrow">{content.eyebrow}</div>
          <h2>{content.heading}</h2>
          <p>{content.description}</p>
        </Reveal>
        <StaggerGroup className="steps-grid" stagger={0.15}>
          {(content.steps ?? []).map((s, i) => (
            <StaggerItem
              className="step"
              key={`${s.title}-${i}`}
              direction={i % 2 === 0 ? "up" : "down"}
              distance={26}
            >
              <div className="photo photo-illustrated">
                <span className="num">{String(i + 1).padStart(2, "0")}</span>
                {i < ILLUSTRATIONS.length && <Image className="step-illustration" src={ILLUSTRATIONS[i]} alt="" width={100} height={100} />}
              </div>
              <h3>{s.title}</h3>
              <p>{s.description}</p>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
