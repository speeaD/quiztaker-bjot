import { User } from "lucide-react";

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
        <div className="section-head">
          <div className="eyebrow">Read</div>
          <h2>Written Testimonials</h2>
          <p>More students, more scores, more proof BJOT works.</p>
        </div>

        <div className="photo-test-grid">
          {PHOTO_TESTIMONIALS.map((t, i) => (
            <div className="photo-test-card" key={i}>
              <div className="photo-test-photo">
                {t.img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.img} alt={t.name} />
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}