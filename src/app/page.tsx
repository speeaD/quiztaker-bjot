import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import StatsBar from "@/components/landing/StatsBar";
import Testimonials from "@/components/landing/Testimonials";
import Footer from "@/components/landing/Footer";
import YouTubeChannel from "@/components/landing/Youtubechannel";
import { getLandingContent, section } from "@/lib/landing-content";
import PreparationOverview from "@/components/landing/PreparationOverview";
import PricingPreview from "@/components/landing/PricingPreview";
import DashboardWalkthrough, { FinalCta } from "@/components/landing/DashboardWalkthrough";
import StructuredData from "@/components/seo/StructuredData";
import { featuredJambResult, recordedUtmeScore } from "@/lib/jamb-results";
import {
  organizationSchema,
  publicMetadata,
  websiteSchema,
} from "@/lib/seo";

export const metadata = publicMetadata(
  "BJOT Student Dashboard | UTME Preparation, CBT Practice & Tutor-Led Classes",
  "Prepare toward your UTME goal with BJOT: tutor-led lessons, topic notes, timed CBT practice, biweekly mocks, and performance reviews in one student dashboard.",
  "/",
);

export default async function Home() {
  const content = (await getLandingContent()) ?? {
    sections: [],
    staff: [],
    testimonials: [],
    contact: null,
  };
  const featured = featuredJambResult(content);
  return (
    <main>
      <Navbar />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@graph": [organizationSchema(content), websiteSchema()],
        }}
      />
      <Hero proof={recordedUtmeScore(content) !== null ? featured : null} />
      {content.testimonials.length > 0 && (
        <Testimonials testimonials={content.testimonials} />
      )}
      {section(content, "home.statistics") && (
        <StatsBar content={section(content, "home.statistics")!} />
      )}
      <DashboardWalkthrough />
      
      
      <PreparationOverview />
      {section(content, "home.youtube") && (
        <YouTubeChannel content={section(content, "home.youtube")!} />
      )}
      <PricingPreview />
      <FinalCta />
      {section(content, "global.footer") && (
        <Footer
          content={section(content, "global.footer")!}
          contact={content.contact}
        />
      )}
    </main>
  );
}
