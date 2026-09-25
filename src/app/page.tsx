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

export default async function Home() {
  const content = await getLandingContent();
  if (!content) return <main className="wrap py-20">Landing page content is temporarily unavailable. Please try again shortly.</main>;
  return (
    <main>
      <Navbar />
      {section(content, "home.hero") && <Hero content={section(content, "home.hero")!} highlight={section(content, "home.statistics")?.items?.[1]} />}
      {section(content, "home.statistics") && <StatsBar content={section(content, "home.statistics")!} />}
      {section(content, "home.why-bjot") && <Features content={section(content, "home.why-bjot")!} />}
      {content.testimonials.length > 0 && <Testimonials testimonials={content.testimonials} />}
      {section(content, "home.how-it-works") && <HowItWorks content={section(content, "home.how-it-works")!} />}
      {section(content, "home.youtube") && <YouTubeChannel content={section(content, "home.youtube")!} />}
      {section(content, "home.cta") && <TeamCta content={section(content, "home.cta")!} />}
      {section(content, "global.footer") && <Footer content={section(content, "global.footer")!} contact={content.contact} />}
    </main>
  );
}
