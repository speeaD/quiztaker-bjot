import { youtubeChannelUrl } from "@/lib/youtube-feed";
import styles from "./AboutFounders.module.css";

export default function AboutFounders() {
  return (
    <section className={styles.section} id="founders" aria-labelledby="founders-heading">
      <div className={`wrap ${styles.container}`}>
        <header className={styles.introduction}>
          <div className={styles.heading}>
            <div className={styles.accent} aria-hidden="true" />
            <h2 id="founders-heading">About the founders</h2>
          </div>
          <div className={styles.copy}>
            <p>
              <strong>Engr. Victor Anazodo</strong> (popularly known as Ceo BJOT REPUBLIC)
              and <strong>Dr. Festus Nwaoboshi</strong> (popularly known as Damfes) are
              the Co-Founders and executive leaders of Blast JAMB Online Tutorial Ltd.
            </p>
            <p>
              Engr. Victor Anazodo is an engineering graduate of the University of
              Nigeria, Nsukka (UNN), while Dr. Festus Nwaoboshi holds a degree in
              Medicine from Near East University, Northern Cyprus.
            </p>
          </div>
        </header>

        <div className={styles.chapter}>
          <h3>Our Story</h3>
          <div className={styles.copy}>
            <p>
              The journey began in 2021, when the founders identified a problem they
              repeatedly saw among examination candidates: many students entered
              their preparation period with significant gaps in their academic foundation.
            </p>
            <p>
              Overcrowded classrooms, limited individual attention and inconsistent
              access to experienced teachers often left students struggling to fully
              understand the subjects they were expected to master.
            </p>
            <p>BJOT was created to provide a more structured solution.</p>
            <p>
              After a year of development and preparation, Blast JAMB Online Tutorial
              was officially launched in 2022, with a mission to help students prepare
              more effectively through quality teaching, structured learning,
              consistent practice and accountability.
            </p>
          </div>
        </div>

        <div className={styles.chapter}>
          <h3>Our Leadership</h3>
          <div className={styles.copy}>
            <p>
              Today, the founders focus on the strategic and executive direction of
              BJOT rather than serving as regular classroom tutors.
            </p>
            <p>
              They oversee the academic system, manage the team of dedicated tutors
              and staff, drive the continuous development of BJOT&apos;s learning
              platforms and programmes, and remain deeply involved in the overall
              welfare and experience of every candidate.
            </p>
            <p>
              The goal is simple: build an educational system that gives students the
              structure, support and preparation they need to perform at their highest level.
            </p>
          </div>
        </div>

        <div className={styles.chapter}>
          <h3>Our Track Record</h3>
          <div className={styles.copy}>
            <p>
              Since launching in 2022, BJOT has grown into a community serving students
              across major examination programmes.
            </p>
            <p>
              The results of that work continue to speak for themselves, with BJOT
              students consistently achieving outstanding examination scores,
              including multiple 300+ UTME performances.
            </p>
            <p>
              For the founders, however, the numbers represent more than scores.
              Every result represents a student who trusted the system, put in the
              work and pushed beyond their starting point.
            </p>
          </div>
        </div>

        <div className={styles.chapter}>
          <h3>Our Mission</h3>
          <div className={styles.copy}>
            <p>
              Engr. Victor and Dr. Festus remain committed to making structured,
              high-quality examination preparation accessible to more students.
            </p>
            <p>
              What began as an idea in 2021 has grown into a continually evolving
              learning ecosystem — and the mission remains the same:
            </p>
            <p className={styles.mission}>
              Give students the right system.<br />
              Give them the right support.<br />
              Then help them do the work required to succeed.
            </p>
          </div>
        </div>

        <div className={styles.connect}>
          <h3>Connect With BJOT</h3>
          <dl className={styles.contacts}>
            <div>
              <dt>YouTube</dt>
              <dd><a href={youtubeChannelUrl}>BJOT OFFICIAL</a></dd>
            </div>
            <div>
              <dt>General Inquiries</dt>
              <dd><a href="mailto:blastjambonlinetutorial@gmail.com">blastjambonlinetutorial@gmail.com</a></dd>
            </div>
            <div>
              <dt>Student Support</dt>
              <dd><a href="tel:+2349164896938">0916 489 6938</a></dd>
            </div>
          </dl>
        </div>
        <p className={styles.motto}>DISCIPLINE || CONSISTENCY || EXCELLENCE</p>
      </div>
    </section>
  );
}
