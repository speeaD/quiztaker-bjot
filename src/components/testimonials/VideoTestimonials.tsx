"use client";

import { Video } from "lucide-react";
import { motion } from "framer-motion";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/Reveal";

// The first three are the live testimonials already used on the homepage.
// The rest are placeholders — swap `img` and `videoLength` for the real
// clip once it's filmed, and drop the `img: null` line.
const VIDEO_TESTIMONIALS = [
  {
    img: "https://images.unsplash.com/photo-1543579281-eeacc097d696?q=80&w=2070&auto=format&fit=crop",
    score: "341/400",
    quote:
      "BJOT changed my JAMB prep completely — the shortcut CBT and mock exams made all the difference.",
    name: "Adebayo T.",
    role: "Studying Pharmacy, OAU Ife",
    videoLength: "02:14",
  },
  {
    img: "https://images.unsplash.com/photo-1620829813573-7c9e1877706f?q=80&w=500&auto=format&fit=crop",
    score: "338/400",
    quote:
      "The best platform I used for my UTME prep — it covers every subject with clarity and depth.",
    name: "David O.",
    role: "Engineering, UNILAG",
    videoLength: "02:14",
  },
  {
    img: "https://images.unsplash.com/photo-1686213011624-8578b598ef0f?q=80&w=2543&auto=format&fit=crop",
    score: "321/400",
    quote:
      "BJOT helped me build confidence and master all my subjects before the big exam day.",
    name: "Ruth I.",
    role: "Law, University of Cyprus",
    videoLength: "02:14",
  },
  {
    img: null,
    score: "[Score]",
    quote: "[Add this student's video testimonial quote here.]",
    name: "[Student Name]",
    role: "[Course, School]",
    videoLength: "--:--",
  },
  {
    img: null,
    score: "[Score]",
    quote: "[Add this student's video testimonial quote here.]",
    name: "[Student Name]",
    role: "[Course, School]",
    videoLength: "--:--",
  },
  {
    img: null,
    score: "[Score]",
    quote: "[Add this student's video testimonial quote here.]",
    name: "[Student Name]",
    role: "[Course, School]",
    videoLength: "--:--",
  },
];

export default function VideoTestimonials() {
  return (
    <section className="testimonials">
      <div className="wrap">
        <Reveal className="section-head">
          <div className="eyebrow">Watch</div>
          <h2>Video Testimonials</h2>
          <p>Students sharing their BJOT experience in their own words.</p>
        </Reveal>
        <StaggerGroup className="test-grid" stagger={0.1}>
          {VIDEO_TESTIMONIALS.map((t, i) => (
            <StaggerItem className="test-card" key={i} direction="up" distance={24}>
              {t.img ? (
                <motion.div
                  className="video-thumb"
                  style={{ backgroundImage: `url(${t.img})` }}
                  aria-label={`${t.name} testimonial video preview`}
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="video-overlay" />
                  <div className="score">{t.score}</div>
                  <div className="play-badge">▶</div>
                  <div className="video-length">{t.videoLength}</div>
                  <div className="verified">✓ Verified</div>
                </motion.div>
              ) : (
                <div className="video-thumb video-thumb-placeholder">
                  <Video size={26} />
                  <span>Add video</span>
                </div>
              )}
              <div className="test-body">
                <p>&quot;{t.quote}&quot;</p>
                <div className="who">
                  {t.name} <span>{t.role}</span>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}