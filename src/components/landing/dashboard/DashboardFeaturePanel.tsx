import Image from "next/image";
import { Check } from "lucide-react";
import type { features } from "./featureData";
import {
  DashboardFeaturePreview,
  MockDetails,
  TrackerDetails,
} from "./DashboardFeaturePreviews";
import styles from "../DashboardWalkthrough.module.css";

type Feature = (typeof features)[number];

type DashboardFeaturePanelProps = {
  feature: Feature;
  index: number;
  active: boolean;
};

const customPreviewIds = new Set([
  "manuals",
  "past-questions",
  "cbt",
  "games",
]);

export default function DashboardFeaturePanel({
  feature,
  index,
  active,
}: DashboardFeaturePanelProps) {
  return (
    <article
      className={styles.featurePanel}
      role="tabpanel"
      id={`product-panel-${index}`}
      aria-labelledby={`product-tab-${index}`}
      tabIndex={0}
      hidden={!active}
    >
      {active && (
        <>
          <div className={styles.featureCopy}>
            <p className={styles.featureKicker}>BJOT STUDENT DASHBOARD</p>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
            <div className={styles.benefit}>
              <span>
                <Check size={15} aria-hidden="true" />
              </span>
              <p>
                <strong>How it supports exam preparation</strong>
                {feature.benefit}
              </p>
            </div>
          </div>
          <div className={styles.featureVisual}>
            {customPreviewIds.has(feature.id) ? (
              <DashboardFeaturePreview featureId={feature.id} />
            ) : feature.image ? (
              <div className={styles.imageFrame}>
                <Image
                  src={feature.image}
                  alt={feature.alt}
                  width={feature.id === "study" ? 864 : 996}
                  height={
                    feature.id === "study"
                      ? 1080
                      : feature.id === "tracker"
                        ? 1822
                        : 1756
                  }
                  sizes="(max-width: 800px) 90vw, 48vw"
                  loading="lazy"
                />
              </div>
            ) : null}
            {feature.id === "mocks" && (
              <div className={styles.schedule}>
                <span className={styles.calendarIcon} aria-hidden="true">
                  ◷
                </span>
                <div>
                  <strong>Class Schedule</strong>
                  <span>Independent revision · Upcoming tutor-led classes</span>
                </div>
                <small>PREVIEW</small>
              </div>
            )}
            {feature.id === "tracker" && <TrackerDetails />}
            {feature.id === "mocks" && <MockDetails />}
            {feature.id === "tracker" && (
              <p className={styles.demoNote}>
                Dashboard sample data shown for illustration. Readiness reflects
                practice performance.
              </p>
            )}
          </div>
        </>
      )}
    </article>
  );
}
