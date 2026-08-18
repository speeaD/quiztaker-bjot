"use client";

import { useEffect, useState } from "react";
import { BookOpen, FileText, Medal, TrendingUp } from "lucide-react";

const FEATURES = [
  {
    icon: <BookOpen size={26} color="white" />,
    step: "01",
    title: "Learn",
    desc: "Structured video lessons by the best tutors in the country.",
  },
  {
    icon: <FileText size={26} color="white" />,
    step: "02",
    title: "Practice",
    desc: "Thousands of CBT-style questions and past exam papers.",
  },
  {
    icon: <TrendingUp size={26} color="white" />,
    step: "03",
    title: "Track",
    desc: "Monitor your progress and performance across every subject.",
  },
  {
    icon: <Medal size={26} color="white" />,
    step: "04",
    title: "Perform",
    desc: "Walk into exams confident and get the results you deserve.",
  },
];

export default function Features() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateLayout = () => setIsMobile(window.innerWidth <= 640);
    updateLayout();
    window.addEventListener("resize", updateLayout);

    return () => window.removeEventListener("resize", updateLayout);
  }, []);

  return (
    <section>
      <div className="wrap">
        <div className="section-head">
          <div className="eyebrow">Why BJOT</div>
          <h2>More Than Just A Tutorial</h2>
          <p>Everything you need to excel in your exams, in one place.</p>
        </div>

        <div
          className="features-grid"
          style={isMobile ? { gridTemplateColumns: "1fr" } : undefined}
        >
          <div className="features-connector" aria-hidden="true" />
          {FEATURES.map((f) => (
            <div className="feature-card" key={f.title}>
              <div className="feature-icon-badge">{f.icon}</div>
              <div className="feature-step-num">Step {f.step}</div>
              <div className="feature-body">
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}