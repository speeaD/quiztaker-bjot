import FAQHero from "@/components/faq/FAQHero";
import FAQAccordion from "@/components/faq/FAQAccordion";
import FAQContact from "@/components/faq/FAQContact";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
 
export default function FAQPage() {
  return (
    <>
        <Navbar />
      <FAQHero />
      <FAQAccordion />
      <FAQContact />
      <Footer />
    </>
  );
}
 