"use client";

import { User } from "lucide-react";
import { motion } from "framer-motion";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/Reveal";

// PLACEHOLDER DATA — replace name, role, score, quote, and img for every
// entry before this section goes live. Cards with img: null render a
// neutral placeholder rather than a stand-in photo.
const PHOTO_TESTIMONIALS = [
  {
    img: null,
    score: "[Score]",
    quote: "[Add this student's written testimonial here.]",
    name: "[Student Name]",
    role: "[Course, School]",
  },
  {
    img: null,
    score: "[Score]",
    quote: "[Add this student's written testimonial here.]",
    name: "[Student Name]",
    role: "[Course, School]",
  },
  {
    img: null,
    score: "[Score]",
    quote: "[Add this student's written testimonial here.]",
    name: "[Student Name]",
    role: "[Course, School]",
  },
  {
    img: null,
    score: "[Score]",
    quote: "[Add this student's written testimonial here.]",
    name: "[Student Name]",
    role: "[Course, School]",
  },
  {
    img: null,
    score: "[Score]",
    quote: "[Add this student's written testimonial here.]",
    name: "[Student Name]",
    role: "[Course, School]",
  },
  {
    img: null,
    score: "[Score]",
    quote: "[Add this student's written testimonial here.]",
    name: "[Student Name]",
    role: "[Course, School]",
  },
];

export default function PhotoTestimonials() {
  return (
    <section className="photo-test-section">
      <div className="wrap">
        <Reveal className="section-head">
          <div className="eyebrow">Read</div>
          <h2>Written Testimonials</h2>
          <p>More students, more scores, more proof BJOT works.</p>
        </Reveal>

        <StaggerGroup className="photo-test-grid" stagger={0.09}>
          {PHOTO_TESTIMONIALS.map((t, i) => (
            <StaggerItem className="photo-test-card" key={i} direction="up" distance={22}>
              <div className="photo-test-photo">
                {t.img ? (
                  <motion.img
                    src={t.img}
                    alt={t.name}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  />
                ) : (
                  <div className="photo-test-photo-placeholder">
                    <User size={28} />
                    <span>Add photo</span>
                  </div>
                )}
                <div className="photo-test-score">{t.score}</div>
              </div>
              <div className="photo-test-body">
                <p>&quot;{t.quote}&quot;</p>
                <div className="photo-test-who">
                  <strong>{t.name}</strong>
                  <span>{t.role}</span>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}