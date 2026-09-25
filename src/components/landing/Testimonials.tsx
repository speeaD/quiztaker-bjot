"use client";

import { motion } from "framer-motion";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/Reveal";
import type { Testimonial } from "@/lib/landing-content";



export default function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <section className="testimonials">
      <div className="wrap">
        <Reveal className="section-head">
          <div className="eyebrow">Testimonials</div>
          <h2>Real Students, Real Results</h2>
          <p>Hear from students who transformed their scores with BJOT.</p>
        </Reveal>
        <StaggerGroup className="test-grid" stagger={0.13}>
          {testimonials.slice(0, 3).map((t) => (
            <StaggerItem className="test-card" key={t.id} direction="up" distance={26}>
              <motion.div
                className="video-thumb"
                style={t.imageUrl ? { backgroundImage: `url(${t.imageUrl})` } : undefined}
                aria-label={`${t.studentName} testimonial preview`}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="video-overlay" />
                {t.score && <div className="score">{t.score}</div>}
                {t.videoUrl && <a href={t.videoUrl} target="_blank" rel="noopener noreferrer" className="play-badge" aria-label={`Watch ${t.studentName}'s testimonial`}>▶</a>}
                {t.videoDuration && <div className="video-length">{t.videoDuration}</div>}
                {t.isVerified && <div className="verified">✓ Verified</div>}
              </motion.div>
              <div className="test-body">
                <p>&quot;{t.quote}&quot;</p>
                <div className="who">
                  {t.studentName} <span>{[t.course, t.school].filter(Boolean).join(", ")}</span>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
        <a href="/testimonials" className="see-more">
          See More Results →
        </a>
      </div>
    </section>
  );
}
