import { Reveal } from "@/components/motion/Reveal";

export default function TestimonialsCTA() {
  return (
    <section className="testimonials-cta-section">
      <div className="wrap">
        <Reveal className="cta-block cta-standalone" distance={22}>
          <h2>Your Result Could Be Next</h2>
          <p>
            Join thousands of students already preparing smarter with BJOT.
            Your success story starts today — completely free to join.
          </p>
          <div className="ctas">
            <a href="#" className="btn btn-gold">
              Join BJOT Free
            </a>
            <a href="#" className="btn btn-ghost">
              Explore Premium
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}