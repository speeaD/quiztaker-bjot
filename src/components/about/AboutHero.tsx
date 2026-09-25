"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { SectionContent } from "@/lib/landing-content";

const EASE = [0.22, 1, 0.36, 1] as const;

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

const line: Variants = {
  hidden: { opacity: 0, scaleX: 0 },
  visible: { opacity: 1, scaleX: 1, transition: { duration: 0.5, ease: EASE } },
};

export default function AboutHero({ content }: { content: SectionContent }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="about-hero">
      <motion.div
        className="wrap about-hero-inner"
        initial={prefersReducedMotion ? undefined : "hidden"}
        animate={prefersReducedMotion ? undefined : "visible"}
        variants={container}
      >
        <motion.div className="eyebrow-line" style={{ originX: 0 }} variants={line} />
        <motion.div className="eyebrow" variants={item}>
          {content.eyebrow}
        </motion.div>
        <motion.h1 variants={item}>
          {content.heading}
        </motion.h1>
        <motion.p variants={item}>
          {content.description}
        </motion.p>
      </motion.div>
    </section>
  );
}
