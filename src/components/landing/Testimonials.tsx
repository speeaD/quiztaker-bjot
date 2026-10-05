"use client";

import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/Reveal";
import type { Testimonial } from "@/lib/landing-content";
import TestimonialPlayer from "@/components/testimonials/TestimonialPlayer";



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
        <a href="/testimonials" className="see-more">
          See More Results →
        </a>
      </div>
    </section>
  );
}
