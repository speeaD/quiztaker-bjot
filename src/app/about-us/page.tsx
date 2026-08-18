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