import { trackLandingEvent } from "@/lib/landing-tracking";
import styles from "./DashboardWalkthrough.module.css";

export default function DashboardFinalCta() {
  return (
    <section className={styles.finalCta}>
      <div className={styles.wrap}>
        <p className={styles.eyebrow}>YOUR NEXT STUDY SESSION STARTS HERE</p>
        <h2>Everything you need. One focused preparation system.</h2>
        <p>
          Build understanding, practise with purpose, and track your progress
          toward your UTME goal.
        </p>
        <a
          href="/pricing"
          onClick={() =>
            trackLandingEvent("premium_cta_click", { placement: "final" })
          }
        >
          Join Premium Class
        </a>
      </div>
    </section>
  );
}
