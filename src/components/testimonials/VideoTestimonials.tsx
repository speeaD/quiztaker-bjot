"use client";

import { Video } from "lucide-react";
import { motion } from "framer-motion";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/Reveal";
import type { Testimonial } from "@/lib/landing-content";

export default function VideoTestimonials({ testimonials }: { testimonials: Testimonial[] }) {
  if (!testimonials.length) return null;
  return (
    <section className="testimonials">
      <div className="wrap">
        <Reveal className="section-head">
          <div className="eyebrow">Watch</div>
          <h2>Video Testimonials</h2>
          <p>Students sharing their BJOT experience in their own words.</p>
        </Reveal>
        <StaggerGroup className="test-grid" stagger={0.1}>
          {testimonials.map((t) => (
            <StaggerItem className="test-card" key={t.id} direction="up" distance={24}>
              {t.imageUrl ? (
                <motion.div
                  className="video-thumb"
                  style={{ backgroundImage: `url(${t.imageUrl})` }}
                  aria-label={`${t.studentName} testimonial video preview`}
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="video-overlay" />
                  {t.score && <div className="score">{t.score}</div>}
                  {t.videoUrl && <a href={t.videoUrl} target="_blank" rel="noopener noreferrer" className="play-badge" aria-label={`Watch ${t.studentName}'s testimonial`}>▶</a>}
                  {t.videoDuration && <div className="video-length">{t.videoDuration}</div>}
                  {t.isVerified && <div className="verified">✓ Verified</div>}
                </motion.div>
              ) : (
                <div className="video-thumb video-thumb-placeholder">
                  <Video size={26} />
                  {t.videoUrl && <a href={t.videoUrl} target="_blank" rel="noopener noreferrer" aria-label={`Watch ${t.studentName}'s testimonial`}>▶</a>}
                </div>
              )}
              <div className="test-body">
                <p>&quot;{t.quote}&quot;</p>
                <div className="who">
                  {t.studentName} <span>{[t.course, t.school].filter(Boolean).join(", ")}</span>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
