import VideoTestimonials from "@/components/testimonials/VideoTestimonials";
import PhotoTestimonials from "@/components/testimonials/PhotoTestimonials";
import TestimonialsCTA from "@/components/testimonials/TestimonialsCta";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { getLandingContent, section } from "@/lib/landing-content";
import { publicMetadata } from "@/lib/seo";

export async function generateMetadata() {
    const content = await getLandingContent();
    const metadata = publicMetadata("BJOT Student Testimonials & Experiences", "Read student experiences and watch testimonials about preparing for JAMB UTME with Blast JAMB Online Tutorial (BJOT).", "/testimonials");
    return content ? metadata : { ...metadata, robots: { index: false, follow: true } };
}

export default async function TestimonialsPage() {
    const content = await getLandingContent();
    if (!content) return <main className="wrap py-20">Page content is temporarily unavailable. Please try again shortly.</main>;
    return (
        <>
            <Navbar />
            <header className="wrap pt-16 text-center">
                <h1 className="text-3xl font-bold sm:text-4xl">BJOT Student Testimonials</h1>
                <p className="mt-4">Student experiences with Blast JAMB Online Tutorial.</p>
            </header>
            <VideoTestimonials testimonials={content.testimonials.filter((item) => item.type === "video")} />
            <PhotoTestimonials testimonials={content.testimonials.filter((item) => item.type === "written")} />
            {section(content, "home.cta") && <TestimonialsCTA content={section(content, "home.cta")!} />}
            {section(content, "global.footer") && <Footer content={section(content, "global.footer")!} contact={content.contact} />}
        </>
    );
}
