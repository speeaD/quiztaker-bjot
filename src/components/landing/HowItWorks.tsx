import Image from "next/image";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/Reveal";

const STEPS = [
  {
    num: "01",
    title: "Join",
    desc: "Create your free BJOT account in seconds.",
    illustration: (
      <Image className="step-illustration" src="/join.svg" alt="Join illustration" width={100} height={100} />
    ),
  },
  {
    num: "02",
    title: "Learn",
    desc: "Access lessons and study at your own pace.",
    illustration: (
      <Image className="step-illustration" src="/learn.svg" alt="Learn illustration" width={100} height={100} />
    ),
  },
  {
    num: "03",
    title: "Practice",
    desc: "Take BJOT CBTs and mock exams that mimic the real thing.",
    illustration: (
      <Image className="step-illustration" src="/practice.svg" alt="Practice illustration" width={100} height={100} />
    ),
  },
  {
    num: "04",
    title: "Improve",
    desc: "Track your progress and keep getting better.",
    illustration: (
      <Image className="step-illustration" src="/improve.svg" alt="Improve illustration" width={100} height={100} />
    ),
  },
];

export default function HowItWorks() {
  return (
    <section>
      <div className="wrap">
        <Reveal className="section-head">
          <div className="eyebrow">Getting started</div>
          <h2>How BJOT Works</h2>
          <p>Four simple steps between you and your dream score.</p>
        </Reveal>
        <StaggerGroup className="steps-grid" stagger={0.15}>
          {STEPS.map((s, i) => (
            <StaggerItem
              className="step"
              key={s.num}
              direction={i % 2 === 0 ? "up" : "down"}
              distance={26}
            >
              <div className="photo photo-illustrated">
                <span className="num">{s.num}</span>
                {s.illustration}
              </div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}