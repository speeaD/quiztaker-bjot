import Link from "next/link";

export default function PreparationOverview() {
  return <section aria-labelledby="preparation-heading">
    <div className="wrap">
      <div className="section-head">
        <p className="eyebrow">BLAST JAMB ONLINE TUTORIAL</p>
        <h2 id="preparation-heading">Online JAMB tutorial in Nigeria: prepare for UTME with BJOT</h2>
        <p>BJOT (Blast JAMB Online Tutorial) combines tutor-led lessons, CBT practice, mock exams and progress reviews for Nigerian students preparing for UTME. Compare what you need before choosing an online tutorial.</p>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        <div className="rounded-2xl border border-black/10 bg-white p-6">
          <h3 className="text-xl font-semibold">Build your UTME study plan</h3>
          <p className="mt-3 leading-relaxed">Start with your subject requirements, identify topics you find difficult, and make time for both learning and timed CBT practice. Review mistakes after each mock exam so your next study session has a clear purpose.</p>
          <Link className="mt-4 inline-block font-semibold underline underline-offset-4" href="/utme-preparation-guide">Read the BJOT UTME preparation guide</Link>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-6">
          <h3 className="text-xl font-semibold">Choosing the best online tutorial for you</h3>
          <p className="mt-3 leading-relaxed">The best online JAMB tutorial for you should have clear teaching, classes you can attend, opportunities to ask questions and practice with feedback. Check what each plan includes and read students&apos; experiences before choosing a programme.</p>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 font-semibold">
            <Link className="underline underline-offset-4" href="/pricing">Compare BJOT plans</Link>
            <Link className="underline underline-offset-4" href="/support">Explore classes and support</Link>
          </div>
        </div>
      </div>
      <p className="mt-6 leading-relaxed">Interested in student outcomes? Read about <Link className="font-semibold underline underline-offset-4" href="/jamb-results">BJOT&apos;s recorded JAMB score and a verified student result</Link>.</p>
    </div>
  </section>;
}
