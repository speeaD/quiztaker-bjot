import VideoTestimonials from "@/components/testimonials/VideoTestimonials";
import PhotoTestimonials from "@/components/testimonials/PhotoTestimonials";
import TestimonialsCTA from "@/components/testimonials/TestimonialsCta";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { getLandingContent, section } from "@/lib/landing-content";

export default async function TestimonialsPage() {
    const content = await getLandingContent();
    if (!content) return <main className="wrap py-20">Page content is temporarily unavailable. Please try again shortly.</main>;
    return (
        <>
            <Navbar />
            <VideoTestimonials testimonials={content.testimonials.filter((item) => item.type === "video")} />
            <PhotoTestimonials testimonials={content.testimonials.filter((item) => item.type === "written")} />
            {section(content, "home.cta") && <TestimonialsCTA content={section(content, "home.cta")!} />}
            {section(content, "global.footer") && <Footer content={section(content, "global.footer")!} contact={content.contact} />}
        </>
    );
}
