import AboutHero from "@/components/about/AboutHero";
import AboutIntro from "@/components/about/AboutIntro";
import AboutFounders from "@/components/about/AboutFounders";
import TeamGrid from "@/components/about/TeamGrid";
import Footer from "@/components/landing/Footer";
import Navbar from "@/components/landing/Navbar";
import { getLandingContent, section } from "@/lib/landing-content";
import StructuredData from "@/components/seo/StructuredData";
import { absoluteUrl, organizationSchema, publicMetadata, tutorSchema } from "@/lib/seo";

export async function generateMetadata() {
  const content = await getLandingContent();
  const metadata = publicMetadata("BJOT Founders & Tutors | About Blast JAMB Online Tutorial", "Meet BJOT co-founders Engr. Victor Anazodo and Dr. Festus Nwaoboshi, discover our story, and learn about our team and approach to examination preparation.", "/about-us");
  return content ? metadata : { ...metadata, robots: { index: false, follow: true } };
}

export default async function AboutPage() {
  const content = await getLandingContent();
  if (!content) return <main className="wrap py-20">Page content is temporarily unavailable. Please try again shortly.</main>;
  return (
    <>
      <Navbar />
      <StructuredData data={{ "@context": "https://schema.org", "@graph": [organizationSchema(content), ...content.staff.map(tutorSchema), { "@type": "AboutPage", "@id": absoluteUrl("/about-us"), url: absoluteUrl("/about-us"), name: "About BJOT and our tutors", about: { "@id": absoluteUrl("/#organization") }, mentions: content.staff.map((member) => ({ "@id": tutorSchema(member)["@id"] })) }] }} />
      {section(content, "about.introduction") && <AboutHero content={section(content, "about.introduction")!} />}
      {(section(content, "about.what-we-do") || section(content, "about.standard")) && <AboutIntro content={section(content, "about.what-we-do")} standard={section(content, "about.standard")} />}
      <AboutFounders />
      {content.staff.length > 0 && <TeamGrid staff={content.staff} />}
      {section(content, "global.footer") && <Footer content={section(content, "global.footer")!} contact={content.contact} />}
    </>
  );
}
