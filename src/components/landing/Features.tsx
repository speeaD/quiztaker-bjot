"use client";

import { useEffect, useState } from "react";
import { BookOpen, FileText, Medal, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/Reveal";
import type { SectionContent } from "@/lib/landing-content";

const ICONS = [<BookOpen size={26} color="white" key="b" />, <FileText size={26} color="white" key="f" />, <TrendingUp size={26} color="white" key="t" />, <Medal size={26} color="white" key="m" />];

export default function Features({ content }: { content: SectionContent }) {
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
        <Reveal className="section-head">
          <div className="eyebrow">{content.eyebrow}</div>
          <h2>{content.heading}</h2>
          <p>{content.description}</p>
        </Reveal>

        <StaggerGroup
          className="features-grid"
          stagger={0.14}
          style={isMobile ? { gridTemplateColumns: "1fr" } : undefined}
        >
          <motion.div
            className="features-connector"
            aria-hidden="true"
            style={{ originX: 0 }}
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          />
          {(content.steps ?? []).map((f, index) => (
            <StaggerItem className="feature-card" key={`${f.title}-${index}`} direction="up" distance={24}>
              <motion.div
                className="feature-icon-badge"
                whileHover={{ scale: 1.08, rotate: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                {ICONS[index % ICONS.length]}
              </motion.div>
              <div className="feature-step-num">Step {String(index + 1).padStart(2, "0")}</div>
              <div className="feature-body">
                <h3>{f.title}</h3>
                <p>{f.description}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
