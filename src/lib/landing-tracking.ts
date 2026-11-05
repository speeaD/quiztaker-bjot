"use client";

type LandingEvent = "premium_cta_click" | "feature_engagement" | "video_play" | "pricing_visit";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
  }
}

/** Send homepage events to any installed gtag/dataLayer integration and expose a local event hook. */
export function trackLandingEvent(event: LandingEvent, detail: Record<string, string> = {}) {
  if (typeof window === "undefined") return;
  const payload = { event, ...detail };
  if (window.gtag) window.gtag("event", event, detail);
  else window.dataLayer?.push(payload);
  window.dispatchEvent(new CustomEvent("bjot:landing-event", { detail: payload }));
}
