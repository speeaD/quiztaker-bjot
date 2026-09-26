import FAQHero from "@/components/faq/FAQHero";
import FAQAccordion from "@/components/faq/FAQAccordion";
import FAQContact from "@/components/faq/FAQContact";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { getLandingContent, section } from "@/lib/landing-content";
import { publicMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const content = await getLandingContent();
  const metadata = publicMetadata("BJOT FAQs, Online Classes & Support", "Find answers about BJOT online tutorials, UTME preparation, classes, CBT practice and student support. Contact Blast JAMB Online Tutorial.", "/support");
  return content ? metadata : { ...metadata, robots: { index: false, follow: true } };
}

export default async function FAQPage() {
  const content = await getLandingContent();
  if (!content) return <main className="wrap py-20">Page content is temporarily unavailable. Please try again shortly.</main>;
  return (
    <>
        <Navbar />
      {section(content, "support.introduction") && <FAQHero content={section(content, "support.introduction")!} />}
      {section(content, "support.faq") && <FAQAccordion categories={section(content, "support.faq")!.categories ?? []} />}
      <FAQContact contact={content.contact} />
      {section(content, "global.footer") && <Footer content={section(content, "global.footer")!} contact={content.contact} />}
    </>
  );
}
