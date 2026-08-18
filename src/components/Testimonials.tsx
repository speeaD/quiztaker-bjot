const TESTIMONIALS = [
  {
    // Solo portrait, Nigeria — free to use under the Unsplash License (Micheal Awala)
    img: "https://images.unsplash.com/photo-1543579281-eeacc097d696?q=80&w=2070&auto=format&fit=crop",
    score: "341/400",
    quote:
      "BJOT changed my JAMB prep completely — the shortcut CBT and mock exams made all the difference.",
    name: "Adebayo T.",
    role: "Studying Pharmacy, OAU Ife",
  },
  {
    // Solo portrait, laptop/engineering context — free to use under the Unsplash License (Kojo Kwarteng)
    img: "https://images.unsplash.com/photo-1620829813573-7c9e1877706f?q=80&w=500&auto=format&fit=crop",
    score: "338/400",
    quote:
      "The best platform I used for my UTME prep — it covers every subject with clarity and depth.",
    name: "David O.",
    role: "Engineering, UNILAG",
  },
  {
    // Solo portrait — free to use under the Unsplash License (Annie Spratt)
    img: "https://images.unsplash.com/photo-1686213011624-8578b598ef0f?q=80&w=2543&auto=format&fit=crop",
    score: "350/400",
    quote:
      "BJOT helped me build confidence and master all my subjects before the big exam day.",
    name: "Ruth I.",
    role: "Law, University of Cyprus",
  },
];

export default function Testimonials() {
  return (
    <section className="testimonials">
      <div className="wrap">
        <div className="section-head">
          <div className="eyebrow">Testimonials</div>
          <h2>Real Students, Real Results</h2>
          <p>Hear from students who transformed their scores with BJOT.</p>
        </div>
        <div className="test-grid">
          {TESTIMONIALS.map((t) => (
            <div className="test-card" key={t.name}>
              <div
                className="video-thumb"
                style={{ backgroundImage: `url(${t.img})` }}
                aria-label={`${t.name} testimonial video preview`}
              >
                <div className="video-overlay" />
                <div className="score">{t.score}</div>
                <div className="play-badge">▶</div>
                <div className="video-length">02:14</div>
                <div className="verified">✓ Verified</div>
              </div>
              <div className="test-body">
                <p>&quot;{t.quote}&quot;</p>
                <div className="who">
                  {t.name} <span>{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <a href="#" className="see-more">
          See More Results →
        </a>
      </div>
    </section>
  );
}