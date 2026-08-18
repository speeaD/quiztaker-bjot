const AVATARS = [
  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=100&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=100&auto=format&fit=crop",
];

export default function Hero() {
  return (
    <section className="hero" style={{ padding: 0 }}>
      <div className="hero-inner">
        <div className="hero-content">
          <div className="eyebrow-line" />
          <h1>
            PREPARE DIFFERENT.
            <br />
            <span>SCORE HIGHER.</span>
          </h1>
          <p>
            Nigeria&apos;s most trusted online platform for JAMB, WAEC, NECO
            &amp; POST-UTME preparation.
          </p>
          <div className="hero-ctas">
            <a href="#" className="btn btn-primary">
              Join BJOT Free
            </a>
            <a href="#" className="btn btn-gold">
              Explore Premium
            </a>
          </div>
          <div className="hero-trust">
            <div className="avatar-stack">
              {AVATARS.map((src) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={src} src={src} alt="" />
              ))}
            </div>
            <div className="trust-text">
              Trusted by <b>30,000+</b> students
            </div>
          </div>
        </div>
      </div>
      <div className="hero-badge">
        <div className="num">368</div>
        <div className="lbl">
          Highest JAMB
          <br />
          Score Recorded
        </div>
      </div>
    </section>
  );
}
