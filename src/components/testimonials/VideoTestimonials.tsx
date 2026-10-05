"use client";

import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/Reveal";
import type { Testimonial } from "@/lib/landing-content";
import TestimonialPlayer from "./TestimonialPlayer";

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
              <TestimonialPlayer testimonial={t} />
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
