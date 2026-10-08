import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { proExtra, tierDetails } from "@/lib/pricing";

export default function PricingPreview() {
  return (
    <section className="bg-[#f6f4ee]" aria-labelledby="pricing-preview-heading">
      <div className="wrap">
        <div className="section-head">
          <p className="eyebrow">CHOOSE YOUR PREPARATION</p>
          <h2 id="pricing-preview-heading">BJOT plans at a glance</h2>
          <p>Explore the features in each level for Science and Art &amp; Commercial, then compare prices on the full pricing page.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {tierDetails.map((tier) => (
            <article key={tier.key} className="rounded-3xl border border-[#dbe4dc] bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a66b00]">{tier.duration} of classes</p>
              <h3 className="mt-2 text-2xl font-bold text-[#0f3d2c]">{tier.name}</h3>
              <div className="mt-5 border-t border-[#e3e9e3] pt-5 text-sm text-[#42554a]">
                <p className="font-semibold text-[#0f3d2c]">Lite includes</p>
                <ul className="mt-3 space-y-2">
                  {tier.features.slice(1).map((feature) => <li key={feature} className="flex items-start gap-2"><Check size={16} className="mt-0.5 shrink-0 text-[#17805a]" aria-hidden="true" />{feature}</li>)}
                </ul>
                <p className="mt-5 border-t border-[#e3e9e3] pt-4"><strong className="text-[#0f3d2c]">Pro adds:</strong> {proExtra}</p>
              </div>
            </article>
          ))}
          <article className="rounded-3xl bg-[#0f3d2c] p-6 text-white md:col-span-3">
            <div className="grid gap-6 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4be56]">Final preparation</p>
                <h3 className="mt-2 text-2xl font-bold">Ultimate Pro Max</h3>
                <p className="mt-2 text-sm text-white/80">Builds on Ultimate Pro with focused preparation before JAMB.</p>
              </div>
              <div className="grid gap-4 text-sm sm:grid-cols-2">
                <div><p className="font-bold text-[#f4be56]">Science</p><p className="mt-2 leading-6 text-white/85">Full tutorial period, Organic Chemistry classes, Physics bootcamp and final revision class.</p></div>
                <div><p className="font-bold text-[#f4be56]">Art &amp; Commercial</p><p className="mt-2 leading-6 text-white/85">Everything in Ultimate Pro, plus the final revision class.</p></div>
              </div>
            </div>
          </article>
        </div>
        <div className="mt-7 text-center">
          <Link href="/pricing" className="inline-flex items-center gap-2 rounded-full bg-[#0f3d2c] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1a5c41]">See plans and prices <ArrowRight size={17} aria-hidden="true" /></Link>
        </div>
      </div>
    </section>
  );
}
