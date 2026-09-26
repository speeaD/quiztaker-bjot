import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import StructuredData from "@/components/seo/StructuredData";
import { getLandingContent, section } from "@/lib/landing-content";
import { absoluteUrl, organizationSchema, publicMetadata } from "@/lib/seo";

const title = "UTME Preparation Guide: Study Plans, CBT Practice & Revision | BJOT";
const description = "Plan your JAMB UTME preparation with BJOT: organise syllabus topics, build a weekly timetable, practise CBT questions and use mock exams to guide revision.";
export const metadata = publicMetadata(title, description, "/utme-preparation-guide");

const steps = [
  {
    title: "Confirm your requirements and map your topics",
    paragraphs: [
      "Before building a timetable, check the current admission requirements for your intended course and institution using official JAMB resources. Confirm your subject combination and use the current syllabus to make a checklist of topics for each subject. Requirements can change, so verify them before registration.",
      "Mark each topic as confident, needs revision, or new to me. Try a short practice set without looking at your notes to check that confidence against your performance. This gives you a starting point for deciding where to spend your study time.",
    ],
  },
  {
    title: "Build a weekly timetable you can maintain",
    paragraphs: [
      "Give every subject a regular place in your week and reserve extra time for the topics you find hardest. Choose study periods that fit around school, work and rest. A realistic plan that you follow is more useful than a crowded timetable that you abandon.",
      "Give each session a specific goal, such as explaining a concept in your own words, solving a set of questions, or correcting an earlier mistake. Include a catch-up session so that one missed day does not disrupt the rest of your week.",
    ],
  },
  {
    title: "Learn concepts before relying on speed",
    paragraphs: [
      "Read your lesson notes or watch an explanation, then close the material and recall the main ideas. Work through an example yourself before checking the solution. If you cannot explain why an answer is correct, return to the underlying concept.",
      "Keep a list of questions for your tutor. Bring the exact question, your attempted solution and the step where you got stuck. This makes it easier to get feedback you can apply to the next problem.",
    ],
  },
  {
    title: "Practise CBT questions and review every mistake",
    paragraphs: [
      "Start with topic-based questions, then mix topics to test whether you can choose the right method without a hint. Introduce timed practice as you gain understanding and become familiar with navigating a computer-based test.",
      "Keep an error log with the topic, what went wrong and the corrected reasoning. Separate gaps in knowledge from misread questions, calculation errors and time pressure. Reattempt missed questions later without consulting the answer first.",
    ],
  },
  {
    title: "Use mock exams to adjust your revision",
    paragraphs: [
      "Take mock exams in a quiet setting with the test timer running. Avoid pausing to check notes. Treat the result as feedback on both subject knowledge and how you use your time.",
      "Review performance by subject and topic instead of looking only at the total score. Pick a small number of recurring weaknesses for the following week, revise them, and check your understanding with fresh questions. Keep practising stronger topics too.",
    ],
  },
  {
    title: "Choose an online tutorial that fits your needs",
    paragraphs: [
      "The best online UTME tutorial for you should offer clear teaching, a schedule you can attend, opportunities to ask questions, and useful feedback on practice. Read the tutor biographies, explore available lessons and ask what is included before joining.",
      "With BJOT, you can explore the tutors and team, read student experiences and check the support page for details about classes and learning resources. Combine guided lessons with your own consistent revision; no tutorial can guarantee a particular examination score.",
    ],
  },
];

export default async function PreparationGuide() {
  const content = await getLandingContent();
  const footer = content && section(content, "global.footer");
  const url = absoluteUrl("/utme-preparation-guide");
  return <>
    <Navbar />
    <main className="wrap py-16 sm:py-20">
      <StructuredData data={{ "@context": "https://schema.org", "@graph": [organizationSchema(content), { "@type": "Article", "@id": `${url}#article`, headline: "UTME preparation guide: build a study plan that works for you", description, mainEntityOfPage: url, author: { "@id": absoluteUrl("/#organization") }, publisher: { "@id": absoluteUrl("/#organization") }, inLanguage: "en-NG" }, { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "BJOT", item: absoluteUrl("/") }, { "@type": "ListItem", position: 2, name: "UTME preparation guide", item: url }] }] }} />
      <article className="mx-auto max-w-3xl">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm"><Link href="/" className="underline">BJOT</Link> / UTME preparation guide</nav>
        <p className="eyebrow">BLAST JAMB ONLINE TUTORIAL</p>
        <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-5xl">UTME preparation guide: build a study plan that works for you</h1>
        <p className="mt-6 text-lg leading-relaxed">Preparing for JAMB UTME takes a balance of understanding, practice and revision. Use this BJOT guide to organise your study sessions, work with your tutors and turn mock exam feedback into a practical plan.</p>
        <p className="mt-4 text-sm">By <Link href="/about-us" className="underline">Blast JAMB Online Tutorial (BJOT)</Link></p>
        <nav aria-label="Guide contents" className="my-10 rounded-2xl border border-black/10 bg-white p-6">
          <h2 className="text-xl font-semibold">In this guide</h2>
          <ol className="mt-4 list-decimal space-y-3 pl-5">
            {steps.map((step, index) => <li key={step.title}><a href={`#step-${index + 1}`} className="underline underline-offset-4">{step.title}</a></li>)}
          </ol>
        </nav>
        {steps.map((step, index) => <section key={step.title} id={`step-${index + 1}`} className="scroll-mt-28" style={{ padding: "1.5rem 0" }}>
          <h2 className="text-2xl font-semibold">{index + 1}. {step.title}</h2>
          {step.paragraphs.map((paragraph) => <p key={paragraph} className="mt-4 leading-relaxed">{paragraph}</p>)}
        </section>)}
        <aside className="mt-8 rounded-2xl border border-black/10 bg-white p-6">
          <h2 className="text-2xl font-semibold">Start your next study session</h2>
          <p className="mt-4 leading-relaxed">Choose one topic to revise, practise questions on it, and write down what you still need to understand. Use that list to plan your next lesson or ask a tutor for help.</p>
          <ul className="mt-5 space-y-3">
            <li><Link href="/about-us#tutors" className="underline">Meet the BJOT tutors and team</Link></li>
            <li><Link href="/free-mock" className="underline">Explore the BJOT free mock</Link></li>
            <li><Link href="/testimonials" className="underline">Read BJOT student experiences</Link></li>
            <li><Link href="/support" className="underline">Find out how BJOT classes work</Link></li>
            <li><a href="https://www.jamb.gov.ng/" className="underline">Check official JAMB information</a></li>
          </ul>
          <Link href="/register" className="btn btn-primary mt-6">Join BJOT</Link>
        </aside>
      </article>
    </main>
    {footer && <Footer content={footer} contact={content.contact} />}
  </>;
}
