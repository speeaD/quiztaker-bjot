import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { getLandingContent, section } from "@/lib/landing-content";
import { publicMetadata } from "@/lib/seo";
import { formatNaira, pricing, proExtra, scienceMaxFeatures, tierDetails, type Track } from "@/lib/pricing";

export const metadata = publicMetadata(
  "BJOT Pricing Plans | Science and Art & Commercial",
  "Compare BJOT JAMB tutorial plans for Science and Art & Commercial students, from Foundation Lite to Ultimate Pro Max.",
  "/pricing",
);

function Feature({ children }: { children: React.ReactNode }) {
  return <li className="flex items-start gap-2 text-sm leading-6 text-[#42554a]"><Check size={17} className="mt-1 shrink-0 text-[#17805a]" aria-hidden="true" /><span>{children}</span></li>;
}

function enrollmentWhatsAppUrl(track: Track, plan: string, price: number) {
  const message = `Hello BJOT, I would like to enroll in and pay for the ${track} ${plan} premium class (${formatNaira(price)}). Please send me the payment details and enrollment steps.`;
  return `https://wa.me/2349164896938?text=${encodeURIComponent(message)}`;
}

function TrackPlans({ track }: { track: Track }) {
  const prices = pricing[track];
  const isScience = track === "Science";
  const id = isScience ? "science" : "art-commercial";
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className={isScience ? "bg-[#f6f4ee]" : "bg-white"}>
      <div className="wrap">
        <div className="mb-8 max-w-2xl">
          <p className="eyebrow">{isScience ? "SCIENCE" : "ART & COMMERCIAL"}</p>
          <h2 id={`${id}-heading`} className="mt-2 text-3xl font-bold text-[#0f3d2c]">{track} plans</h2>
          <p className="mt-3 text-sm leading-7 text-[#42554a]">Choose Lite for classes and study support, or Pro for those features plus BJOT JAMB CBT practice.</p>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {tierDetails.map((tier) => (
            <article key={tier.key} className="flex h-full flex-col rounded-3xl border border-[#dbe4dc] bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a66b00]">{tier.duration} programme</p>
              <h3 className="mt-2 text-2xl font-bold text-[#0f3d2c]">{tier.name}</h3>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[#eef5ef] p-3"><p className="text-xs font-semibold text-[#42554a]">Lite</p><p className="mt-1 text-xl font-bold text-[#0f3d2c]">{formatNaira(prices[tier.key].lite)}</p><a href={enrollmentWhatsAppUrl(track, `${tier.name} Lite`, prices[tier.key].lite)} target="_blank" rel="noopener noreferrer" aria-label={`Enroll now in ${track} ${tier.name} Lite on WhatsApp`} className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#0f3d2c] underline underline-offset-4 hover:text-[#1a5c41]">Enroll now <ArrowRight size={14} aria-hidden="true" /></a></div>
                <div className="rounded-2xl bg-[#0f3d2c] p-3"><p className="text-xs font-semibold text-white/75">Pro</p><p className="mt-1 text-xl font-bold text-white">{formatNaira(prices[tier.key].pro)}</p><a href={enrollmentWhatsAppUrl(track, `${tier.name} Pro`, prices[tier.key].pro)} target="_blank" rel="noopener noreferrer" aria-label={`Enroll now in ${track} ${tier.name} Pro on WhatsApp`} className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#f4be56] underline underline-offset-4 hover:text-white">Enroll now <ArrowRight size={14} aria-hidden="true" /></a></div>
              </div>
              <p className="mt-6 text-xs font-bold uppercase tracking-[0.14em] text-[#607167]">Lite includes</p>
              <ul className="mt-3 space-y-2">{tier.features.map((feature) => <Feature key={feature}>{feature}</Feature>)}</ul>
              <div className="mt-5 border-t border-[#e3e9e3] pt-5"><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#607167]">Pro adds</p><ul className="mt-3"><Feature>{proExtra}</Feature></ul></div>
            </article>
          ))}
        </div>
        <article className="mt-6 grid gap-8 rounded-3xl bg-[#0f3d2c] p-6 text-white md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:p-9">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4be56]">THE COMPLETE PLAN</p>
            <h3 className="mt-2 text-3xl font-bold">Ultimate Pro Max</h3>
            <p className="mt-3 text-4xl font-bold text-[#f4be56]">{formatNaira(prices.max)}</p>
            <p className="mt-4 text-sm leading-7 text-white/80">{isScience ? "Full support through the JAMB tutorial period, with focused final preparation." : "Everything in Ultimate Pro, plus a final revision class."}</p>
            <a href={enrollmentWhatsAppUrl(track, "Ultimate Pro Max", prices.max)} target="_blank" rel="noopener noreferrer" aria-label={`Enroll now in ${track} Ultimate Pro Max on WhatsApp`} className="mt-6 inline-flex w-fit items-center gap-2 text-sm font-bold text-[#f4be56] underline underline-offset-4 transition hover:text-white">Enroll now <ArrowRight size={16} aria-hidden="true" /></a>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/70">What&apos;s included</p>
            <ul className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {(isScience ? scienceMaxFeatures : ["Everything in Ultimate Pro", "Final revision class"]).map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm leading-6"><Check size={17} className="mt-1 shrink-0 text-[#f4be56]" aria-hidden="true" />{feature}</li>
              ))}
            </ul>
            {!isScience && <p className="mt-5 rounded-xl border border-white/20 p-3 text-sm leading-6 text-white/85">No physical textbook is included in this {formatNaira(prices.max)} plan.</p>}
          </div>
        </article>
      </div>
    </section>
  );
}

export default async function PricingPage() {
  const content = await getLandingContent();
  return <>
    <Navbar />
    <main>
      <section className="bg-[#0b2b1f] py-20 text-white">
        <div className="wrap max-w-5xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#f4be56]">BJOT PRICING</p>
          <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">Find your JAMB preparation plan</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/80">Choose the length of support you need. Compare plans for Science and Art &amp; Commercial students below.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3"><a href="#science" className="rounded-full bg-[#f2a91e] px-5 py-3 text-sm font-bold text-[#0b2b1f]">Science plans</a><a href="#art-commercial" className="rounded-full border border-white/40 px-5 py-3 text-sm font-bold text-white">Art &amp; Commercial plans</a></div>
        </div>
      </section>
      <TrackPlans track="Science" />
      <TrackPlans track="Art & Commercial" />
      <section className="bg-[#f6f4ee] py-14"><div className="wrap max-w-4xl rounded-3xl border border-[#dbe4dc] bg-white p-7 text-center sm:p-10"><h2 className="text-2xl font-bold text-[#0f3d2c]">Ready to prepare with BJOT?</h2><p className="mt-3 text-sm leading-7 text-[#42554a]">The recommended textbook list is reading guidance; physical textbooks are not included unless a plan explicitly says so.</p><Link href="/register" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#0f3d2c] px-6 py-3 text-sm font-bold text-white hover:bg-[#1a5c41]">Join BJOT <ArrowRight size={17} aria-hidden="true" /></Link></div></section>
    </main>
    {content && section(content, "global.footer") && <Footer content={section(content, "global.footer")!} contact={content.contact} />}
  </>;
}
