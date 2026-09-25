import FAQHero from "@/components/faq/FAQHero";
import FAQAccordion from "@/components/faq/FAQAccordion";
import FAQContact from "@/components/faq/FAQContact";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { getLandingContent, section } from "@/lib/landing-content";

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
