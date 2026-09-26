"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { SectionContent, Testimonial } from "@/lib/landing-content";

const EASE = [0.22, 1, 0.36, 1] as const;

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

export default function Hero({ content, highlight, testimonials }: { content: SectionContent; highlight?: { value: string; label: string }; testimonials: Testimonial[] }) {
  const prefersReducedMotion = useReducedMotion();
  const portraits = testimonials.flatMap((testimonial) => {
    const src = typeof testimonial.imageUrl === 'string' ? testimonial.imageUrl.trim() : '';
    return src ? [{ id: testimonial.id, name: testimonial.studentName, src }] : [];
  }).slice(0, 4);

  return (
    <section className="hero" style={{ padding: 0 }}>
      <div className="hero-inner">
        <motion.div
          className="hero-content"
          initial={false}
          animate={prefersReducedMotion ? undefined : "visible"}
          variants={container}
        >
          <motion.p className="eyebrow" variants={item}>
            {content.eyebrow}
          </motion.p>
          <motion.h1 variants={item}>
            {content.heading}
          </motion.h1>
          <motion.p variants={item}>
            {content.description}
          </motion.p>
          <motion.div className="hero-ctas" variants={item}>
            {content.primaryCta && <a href={content.primaryCta.href} className="btn btn-primary">{content.primaryCta.label}</a>}
            {content.secondaryCta && <a href={content.secondaryCta.href} className="btn btn-gold">{content.secondaryCta.label}</a>}
          </motion.div>
          <motion.div className="hero-trust" variants={item}>
            {portraits.length > 0 && <div className="avatar-stack">
              {portraits.map(({ id, name, src }, i) => (
                <motion.img
                  key={id}
                  src={src}
                  alt={name}
                  initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.6 }}
                  animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.7 + i * 0.08, ease: EASE }}
                />
              ))}
            </div>}
            <div className="trust-text">{content.trustText}</div>
          </motion.div>
        </motion.div>
      </div>
      {highlight && <motion.div
        className="hero-badge"
        initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.7, rotate: -8 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.7, delay: 0.5, ease: EASE }}
      >
        <div className="num">{highlight.value}</div>
        <div className="lbl">{highlight.label}</div>
      </motion.div>}
    </section>
  );
}
