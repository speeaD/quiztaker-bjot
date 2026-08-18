const ECOSYSTEM = [
  "Structured classes",
  "Expert tutors",
  "Extensive CBT practice",
  "Mock examinations",
  "Detailed study resources",
  "Performance tracking",
];

export default function AboutIntro() {
  return (
    <>
      <section className="about-intro">
        <div className="wrap about-intro-grid">
          <div className="about-intro-copy">
            <div className="eyebrow">What We Do</div>
            <h2>A Complete Preparatory Ecosystem</h2>
            <p>
              We provide a complete preparatory ecosystem that includes
              structured classes, expert tutors, extensive CBT practice, mock
              examinations, detailed study resources, and performance
              tracking for UTME, WAEC, NECO, and POST-UTME candidates.
            </p>
            <p>
              Our approach goes beyond simply teaching topics. We combine
              rigorous instruction with discipline, consistent practice, and
              continuous assessment — the structure and accountability
              students need to build a solid academic foundation and make
              measurable progress throughout their preparation.
            </p>
          </div>

          <ul className="about-ecosystem-list">
            {ECOSYSTEM.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="standard-banner">
        <div className="wrap standard-inner">
          <div className="eyebrow">Our Standard</div>
          <div className="standard-words">
            <span>Discipline</span>
            <span className="divider">||</span>
            <span>Consistency</span>
            <span className="divider">||</span>
            <span>Excellence</span>
          </div>
          <p>BJOT — helping students prepare better, one day at a time.</p>
        </div>
      </section>
    </>
  );
}