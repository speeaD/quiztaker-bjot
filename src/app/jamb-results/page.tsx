import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import TestimonialPlayer from "@/components/testimonials/TestimonialPlayer";
import StructuredData from "@/components/seo/StructuredData";
import { getLandingContent, section } from "@/lib/landing-content";
import { featuredJambResult, recordedUtmeScore } from "@/lib/jamb-results";
import { absoluteUrl, organizationSchema, publicMetadata } from "@/lib/seo";

const fallbackTitle = "BJOT JAMB Results: Highest Recorded UTME Score";
const fallbackDescription = "Explore BJOT's highest recorded JAMB UTME score and watch a verified student testimonial about preparing with BJOT.";

function resultDescription(record: number, studentName: string, studentScore: string) {
  return `BJOT's highest recorded JAMB UTME score is ${record}/400. Watch ${studentName}'s verified ${studentScore} student testimonial.`;
}

export async function generateMetadata(): Promise<Metadata> {
  const content = await getLandingContent();
  const record = content ? recordedUtmeScore(content) : null;
  const featured = content ? featuredJambResult(content) : null;
  if (record !== null && featured) {
    return publicMetadata(
      `BJOT Highest JAMB Score: ${record}/400 | Student Results`,
      resultDescription(record, featured.studentName, featured.score!),
      "/jamb-results",
    );
  }
  return {
    ...publicMetadata(fallbackTitle, fallbackDescription, "/jamb-results"),
    robots: { index: false, follow: true },
  };
}

export default async function JambResultsPage() {
  const content = await getLandingContent();
  const record = content ? recordedUtmeScore(content) : null;
  const featured = content ? featuredJambResult(content) : null;
  const footer = content && section(content, "global.footer");
  const url = absoluteUrl("/jamb-results");

  return <>
    <Navbar />
    <main className="wrap py-16 sm:py-20">
      {record === null || !featured ? (
        <p>Student result details are temporarily unavailable. Please try again shortly.</p>
      ) : (
        <>
          <StructuredData data={{
            "@context": "https://schema.org",
            "@graph": [
              organizationSchema(content),
              {
                "@type": "Article",
                "@id": `${url}#article`,
                headline: "BJOT JAMB results and highest recorded UTME score",
                description: resultDescription(record, featured.studentName, featured.score!),
                mainEntityOfPage: url,
                author: { "@id": absoluteUrl("/#organization") },
                publisher: { "@id": absoluteUrl("/#organization") },
                inLanguage: "en-NG",
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "BJOT", item: absoluteUrl("/") },
                  { "@type": "ListItem", position: 2, name: "JAMB results", item: url },
                ],
              },
            ],
          }} />
          <article className="mx-auto max-w-3xl">
            <nav aria-label="Breadcrumb" className="mb-6 text-sm">
              <Link href="/" className="underline">BJOT</Link> / JAMB results
            </nav>
            <p className="eyebrow">BLAST JAMB ONLINE TUTORIAL</p>
            <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-5xl">BJOT JAMB results: our highest recorded UTME score</h1>
            <p className="mt-6 text-lg leading-relaxed">BJOT&apos;s highest recorded student JAMB UTME score is <strong>{record}/400</strong>. The named student result featured below is a separate, publicly shared account of preparing with BJOT.</p>

            <section className="mt-10 rounded-2xl border border-black/10 bg-white p-6 sm:p-8" aria-labelledby="featured-result-heading">
              <p className="eyebrow">VERIFIED STUDENT STORY</p>
              <h2 id="featured-result-heading" className="mt-2 text-2xl font-semibold">{featured.studentName}: {featured.score} in JAMB UTME</h2>
              <p className="mt-4 leading-relaxed">{featured.studentName} shared this {featured.score} result and describes how BJOT classes and mock exams supported their preparation.</p>
              <div className="mt-6 overflow-hidden rounded-xl"><TestimonialPlayer testimonial={featured} /></div>
              <blockquote className="mt-6 border-l-4 border-[#0f3d2c] pl-4 leading-relaxed">“{featured.quote}”</blockquote>
              <p className="mt-4 text-sm">Watch more <Link href="/testimonials" className="underline">BJOT student testimonials</Link>.</p>
            </section>

            <section className="mt-10" aria-labelledby="understanding-results-heading">
              <h2 id="understanding-results-heading" className="text-2xl font-semibold">Understanding these results</h2>
              <p className="mt-4 leading-relaxed">The {record}/400 figure is BJOT&apos;s highest recorded UTME score. {featured.studentName}&apos;s {featured.score} is a named result with a published video testimonial. These figures describe different students&apos; outcomes; they are not a promised score for anyone joining BJOT.</p>
              <p className="mt-4 leading-relaxed">A useful preparation plan combines clear lessons, regular practice, timed CBT work and review of mistakes. See our <Link href="/utme-preparation-guide" className="underline">UTME preparation guide</Link> for a practical way to organise your study time, or <Link href="/pricing" className="underline">compare BJOT plans</Link> to see what each option includes.</p>
              <Link href="/register" className="btn btn-primary mt-7">Join BJOT</Link>
            </section>
          </article>
        </>
      )}
    </main>
    {footer && <Footer content={footer} contact={content?.contact ?? null} />}
  </>;
}
