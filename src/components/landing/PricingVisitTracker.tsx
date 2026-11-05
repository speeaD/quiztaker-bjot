"use client";

import { useEffect } from "react";
import { trackLandingEvent } from "@/lib/landing-tracking";

export default function PricingVisitTracker() {
  useEffect(() => {
    trackLandingEvent("pricing_visit", { placement: "pricing_page" });
  }, []);
  return null;
}
