"use client";

import { useState } from "react";
import { trackLandingEvent } from "@/lib/landing-tracking";
import DashboardClassroomVideo from "./dashboard/DashboardClassroomVideo";
import DashboardFeaturePanel from "./dashboard/DashboardFeaturePanel";
import DashboardFeatureTabs from "./dashboard/DashboardFeatureTabs";
import DashboardLearningCycle from "./dashboard/DashboardLearningCycle";
import { features } from "./dashboard/featureData";
import styles from "./DashboardWalkthrough.module.css";

export default function DashboardWalkthrough() {
  const [activeIndex, setActiveIndex] = useState(0);

  const selectFeature = (index: number) => {
    setActiveIndex(index);
    trackLandingEvent("feature_engagement", {
      feature: features[index].label,
    });
  };

  return (
    <>
      <section
        id="digital-classroom"
        className={styles.section}
        aria-labelledby="walkthrough-title"
      >
        <div className={styles.wrap}>
          <header className={styles.sectionHead}>
            <p className={styles.eyebrow}>A CLOSER LOOK</p>
            <h2 id="walkthrough-title">Inside your digital classroom</h2>
            <p>
              Explore the tools in the BJOT Student Dashboard and see how each
              one fits into your preparation.
            </p>
          </header>
          <div className={styles.walkthrough}>
            <DashboardFeatureTabs
              activeIndex={activeIndex}
              onSelect={selectFeature}
            />
            {features.map((feature, index) => (
              <DashboardFeaturePanel
                key={feature.id}
                feature={feature}
                index={index}
                active={index === activeIndex}
              />
            ))}
          </div>
          <DashboardClassroomVideo />
        </div>
      </section>
      <DashboardLearningCycle />
    </>
  );
}

export { default as FinalCta } from "./DashboardFinalCta";
