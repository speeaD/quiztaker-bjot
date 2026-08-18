"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";

const AVATARS = [
  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=100&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=100&auto=format&fit=crop",
];

const EASE = [0.22, 1, 0.36, 1] as const;

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

export default function Hero() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="hero" style={{ padding: 0 }}>
      <div className="hero-inner">
        <motion.div
          className="hero-content"
          initial={prefersReducedMotion ? undefined : "hidden"}
          animate={prefersReducedMotion ? undefined : "visible"}
          variants={container}
        >
          <motion.p className="eyebrow" variants={item}>
            DISCIPLINE || CONSISTENCY || EXCELLENCE
          </motion.p>
          <motion.h1 variants={item}>
            PREPARE DIFFERENT.
            <br />
            <span>SCORE HIGHER.</span>
          </motion.h1>
          <motion.p variants={item}>
            Nigeria&apos;s most trusted online platform for JAMB, WAEC, NECO
            &amp; POST-UTME preparation.
          </motion.p>
          <motion.div className="hero-ctas" variants={item}>
            <a href="#" className="btn btn-primary">
              Join BJOT Free
            </a>
            <a href="#" className="btn btn-gold">
              Explore Premium
            </a>
          </motion.div>
          <motion.div className="hero-trust" variants={item}>
            <div className="avatar-stack">
              {AVATARS.map((src, i) => (
                <motion.img
                  key={src}
                  src={src}
                  alt=""
                  initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.6 }}
                  animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.7 + i * 0.08, ease: EASE }}
                />
              ))}
            </div>
            <div className="trust-text">
              Trusted by <b>30,000+</b> students
            </div>
          </motion.div>
        </motion.div>
      </div>
      <motion.div
        className="hero-badge"
        initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.7, rotate: -8 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.7, delay: 0.5, ease: EASE }}
      >
        <div className="num">368</div>
        <div className="lbl">
          Highest JAMB
          <br />
          Score Recorded
        </div>
      </motion.div>
    </section>
  );
}