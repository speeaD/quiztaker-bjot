import TestimonialsHero from "@/components/testimonials/TestimonialsHero";
import VideoTestimonials from "@/components/testimonials/VideoTestimonials";
import PhotoTestimonials from "@/components/testimonials/PhotoTestimonials";
import TestimonialsCTA from "@/components/testimonials/TestimonialsCta";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export default function TestimonialsPage() {
    return (
        <>
            <Navbar />
            {/* <TestimonialsHero /> */}
            <VideoTestimonials />
            <PhotoTestimonials />
            <TestimonialsCTA />
            <Footer />
        </>
    );
}