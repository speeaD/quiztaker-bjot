"use client";

import { User } from "lucide-react";
import { motion } from "framer-motion";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/Reveal";
import type { Testimonial } from "@/lib/landing-content";

export default function PhotoTestimonials({ testimonials }: { testimonials: Testimonial[] }) {
  if (!testimonials.length) return null;
  return (
    <section className="photo-test-section">
      <div className="wrap">
        <Reveal className="section-head">
          <div className="eyebrow">Read</div>
          <h2>Written Testimonials</h2>
          <p>More students, more scores, more proof BJOT works.</p>
        </Reveal>

        <StaggerGroup className="photo-test-grid" stagger={0.09}>
          {testimonials.map((t) => (
            <StaggerItem className="photo-test-card" key={t.id} direction="up" distance={22}>
              <div className="photo-test-photo">
                {t.imageUrl ? (
                  <motion.img
                    src={t.imageUrl}
                    alt={t.studentName}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  />
                ) : (
                  <div className="photo-test-photo-placeholder">
                    <User size={28} />
                  </div>
                )}
                {t.score && <div className="photo-test-score">{t.score}</div>}
              </div>
              <div className="photo-test-body">
                <p>&quot;{t.quote}&quot;</p>
                <div className="photo-test-who">
                  <strong>{t.studentName}</strong>
                  <span>{[t.course, t.school].filter(Boolean).join(", ")}</span>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
