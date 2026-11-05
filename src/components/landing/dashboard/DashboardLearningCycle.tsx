import styles from "../DashboardWalkthrough.module.css";

const steps = [
  {
    number: "01",
    title: "Learn",
    copy: "Learn a topic through notes, diagrams, videos, and manuals.",
  },
  {
    number: "02",
    title: "Practise",
    copy: "Practise with topic tests and past questions.",
  },
  {
    number: "03",
    title: "Review",
    copy: "Test exam readiness with timed CBT and standard mocks.",
  },
  {
    number: "04",
    title: "Improve",
    copy: "Review mistakes, revisit weak topics, and repeat consistently.",
  },
];

export default function DashboardLearningCycle() {
  return (
    <section className={styles.cycleSection} aria-labelledby="cycle-heading">
      <div className={styles.wrap}>
        <header className={styles.sectionHead}>
          <p className={styles.eyebrow}>A PRACTICAL LEARNING CYCLE</p>
          <h2 id="cycle-heading">A clear plan for working toward 300+.</h2>
          <p>
            Use the tools together, keep learning consistently, and build your
            preparation over time.
          </p>
        </header>
        <div className={styles.cycleGrid}>
          {steps.map((step, index) => (
            <article className={styles.cycleCard} key={step.title}>
              <span className={styles.cycleNumber}>{step.number}</span>
              <span className={styles.cycleArrow} aria-hidden="true">
                {index < steps.length - 1 ? "→" : "✓"}
              </span>
              <h3>{step.title}</h3>
              <p>{step.copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
