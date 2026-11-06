"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, BookOpen, ChartNoAxesCombined, Clock3 } from "lucide-react";
import type { Testimonial } from "@/lib/landing-content";
import { trackLandingEvent } from "@/lib/landing-tracking";

export default function Hero({ proof }: { proof: Testimonial | null }) {
  return (
    <>
      <section className="home-hero" aria-labelledby="home-hero-heading">
        <div className="home-hero-inner">
          <div className="home-hero-copy">
            <p className="home-eyebrow">YOUR DIGITAL CLASSROOM FOR UTME SUCCESS</p>
            <h1 id="home-hero-heading">Your 300+ goal deserves a complete preparation system.</h1>
            <p className="home-hero-lede">Learn with expert tutors, master difficult topics, practise timed CBT exams, and track what to improve—all inside your BJOT Student Dashboard.</p>
            <div className="home-hero-actions">
              <Link href="/pricing" className="home-button home-button-primary" onClick={() => trackLandingEvent("premium_cta_click", { placement: "hero" })}>Join Premium Class</Link>
              <Link href="/free-mock" className="home-button home-button-secondary">Take Free Mock <ArrowDown size={16} aria-hidden="true" /></Link>
            </div>
            <p className="home-goal-note">A focused preparation goal—not a promised score.</p>
            {proof && <a className="home-hero-proof" href="/jamb-results"><span className="proof-score">{proof.score}</span><span><strong>{proof.studentName}</strong><small>Published student result · See the evidence</small></span></a>}
          </div>
          <div className="home-hero-visual">
            <div className="hero-product-frame">
              <Image src="/dashboard-previews/dashboard-premium.png" alt="BJOT premium dashboard preview with sample account readiness, learning streak, and study tools" width={996} height={1756} priority sizes="(max-width: 850px) 94vw, 52vw" />
              <span className="hero-product-pill"><span aria-hidden="true" className="live-dot" />Premium dashboard preview · Sample account</span>
            </div>
            <div className="hero-feature-labels" aria-label="Dashboard features">
              <span><BookOpen size={15} aria-hidden="true" />Study Hub</span>
              <span><Clock3 size={15} aria-hidden="true" />Timed CBT</span>
              <span><ChartNoAxesCombined size={15} aria-hidden="true" />Performance Tracker</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
