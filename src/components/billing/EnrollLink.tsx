"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { trackLandingEvent } from "@/lib/landing-tracking";

export default function EnrollLink({ planId, label, placement, className }: {
  planId: string; label: string; placement: string; className: string;
}) {
  return <Link href={`/billing?plan=${encodeURIComponent(planId)}`} aria-label={label} className={className}
    onClick={() => trackLandingEvent("premium_cta_click", { placement })}>
    Enroll now <ArrowRight size={14} aria-hidden="true" />
  </Link>;
}
