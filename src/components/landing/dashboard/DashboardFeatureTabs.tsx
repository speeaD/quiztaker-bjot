"use client";

import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { features } from "./featureData";
import styles from "../DashboardWalkthrough.module.css";

type DashboardFeatureTabsProps = {
  activeIndex: number;
  onSelect: (index: number) => void;
};

export default function DashboardFeatureTabs({
  activeIndex,
  onSelect,
}: DashboardFeatureTabsProps) {
  const [horizontal, setHorizontal] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 900px)");
    const update = () => setHorizontal(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const onKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    const next =
      event.key === "ArrowRight" ||
      (!horizontal && event.key === "ArrowDown")
        ? (index + 1) % features.length
        : event.key === "ArrowLeft" ||
            (!horizontal && event.key === "ArrowUp")
          ? (index - 1 + features.length) % features.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? features.length - 1
              : -1;

    if (next >= 0) {
      event.preventDefault();
      onSelect(next);
      document.getElementById(`product-tab-${next}`)?.focus();
    }
  };

  return (
    <div
      className={styles.tabList}
      role="tablist"
      aria-label="Dashboard features"
      aria-orientation={horizontal ? "horizontal" : "vertical"}
    >
      {features.map((feature, index) => {
        const Icon = feature.icon;
        const selected = index === activeIndex;

        return (
          <button
            key={feature.id}
            type="button"
            role="tab"
            id={`product-tab-${index}`}
            aria-controls={`product-panel-${index}`}
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onSelect(index)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={selected ? styles.activeTab : styles.tab}
          >
            <Icon size={18} aria-hidden="true" />
            <span>{feature.label}</span>
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
