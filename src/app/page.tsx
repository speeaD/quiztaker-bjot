import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import StatsBar from "@/components/landing/StatsBar";
import Features from "@/components/landing/Features";
import Testimonials from "@/components/landing/Testimonials";
import HowItWorks from "@/components/landing/HowItWorks";
import TeamCta from "@/components/landing/TeamCta";
import Footer from "@/components/landing/Footer";
import YouTubeChannel from "@/components/landing/Youtubechannel";
import { getLandingContent, section } from "@/lib/landing-content";
import PreparationOverview from "@/components/landing/PreparationOverview";
import StructuredData from "@/components/seo/StructuredData";
import {
  organizationSchema,
  publicMetadata,
  siteDescription,
  websiteSchema,
} from "@/lib/seo";

export const metadata = publicMetadata(
  "BJOT | Online JAMB Tutorials & UTME Preparation",
  siteDescription,
  "/",
);

export default async function Home() {
  const content = (await getLandingContent()) ?? {
    sections: [],
    staff: [],
    testimonials: [],
    contact: null,
  };
  const hero = section(content, "home.hero") ?? {
    heading: "BJOT: Online JAMB tutorials and UTME preparation",
    description: siteDescription,
    primaryCta: { label: "Join BJOT", href: "/register" },
    secondaryCta: {
      label: "UTME preparation guide",
      href: "/utme-preparation-guide",
    },
  };
  return (
    <main>
      <Navbar />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@graph": [organizationSchema(content), websiteSchema()],
        }}
      />
      <Hero
        content={hero}
        highlight={section(content, "home.statistics")?.items?.[1]}
        testimonials={content.testimonials}
      />
      {section(content, "home.statistics") && (
        <StatsBar content={section(content, "home.statistics")!} />
      )}
      {section(content, "home.why-bjot") && (
        <Features content={section(content, "home.why-bjot")!} />
      )}
      <PreparationOverview staff={content.staff} />
      {content.testimonials.length > 0 && (
        <Testimonials testimonials={content.testimonials} />
      )}
      {section(content, "home.how-it-works") && (
        <HowItWorks content={section(content, "home.how-it-works")!} />
      )}
      {section(content, "home.youtube") && (
        <YouTubeChannel content={section(content, "home.youtube")!} />
      )}
      {section(content, "home.cta") && (
        <TeamCta content={section(content, "home.cta")!} />
      )}
      {section(content, "global.footer") && (
        <Footer
          content={section(content, "global.footer")!}
          contact={content.contact}
        />
      )}
    </main>
  );
}
