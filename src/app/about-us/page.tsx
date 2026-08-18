// app/about/page.tsx
// Assumes your shared <Header /> and <Footer /> components are rendered
// in the root layout (as they likely are for the homepage) — import and
// wrap with them here if not.

import AboutHero from "@/components/about/AboutHero";
import AboutIntro from "@/components/about/AboutIntro";
import TeamGrid from "@/components/about/TeamGrid";
import Footer from "@/components/landing/Footer";
import Navbar from "@/components/landing/Navbar";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <AboutHero />
      <AboutIntro />
      <TeamGrid />
      <Footer />
    </>
  );
}