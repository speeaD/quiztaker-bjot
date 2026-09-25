import AboutHero from "@/components/about/AboutHero";
import AboutIntro from "@/components/about/AboutIntro";
import TeamGrid from "@/components/about/TeamGrid";
import Footer from "@/components/landing/Footer";
import Navbar from "@/components/landing/Navbar";
import { getLandingContent, section } from "@/lib/landing-content";

export default async function AboutPage() {
  const content = await getLandingContent();
  if (!content) return <main className="wrap py-20">Page content is temporarily unavailable. Please try again shortly.</main>;
  return (
    <>
      <Navbar />
      {section(content, "about.introduction") && <AboutHero content={section(content, "about.introduction")!} />}
      {(section(content, "about.what-we-do") || section(content, "about.standard")) && <AboutIntro content={section(content, "about.what-we-do")} standard={section(content, "about.standard")} />}
      {content.staff.length > 0 && <TeamGrid staff={content.staff} />}
      {section(content, "global.footer") && <Footer content={section(content, "global.footer")!} contact={content.contact} />}
    </>
  );
}
