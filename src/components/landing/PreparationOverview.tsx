import Link from "next/link";
import type { StaffMember } from "@/lib/landing-content";
import { tutorAnchor } from "@/lib/seo";

export default function PreparationOverview({ staff }: { staff: StaffMember[] }) {
  return <section aria-labelledby="preparation-heading">
    <div className="wrap">
      <div className="section-head">
        <p className="eyebrow">BLAST JAMB ONLINE TUTORIAL</p>
        <h2 id="preparation-heading">Online JAMB tutorials and UTME preparation with BJOT</h2>
        <p>BJOT (Blast JAMB Online Tutorial) helps Nigerian students prepare for UTME, WAEC, NECO and Post-UTME through lessons, practice and progress reviews.</p>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        <div className="rounded-2xl border border-black/10 bg-white p-6">
          <h3 className="text-xl font-semibold">Build your UTME study plan</h3>
          <p className="mt-3 leading-relaxed">Start with your subject requirements, identify topics you find difficult, and make time for both learning and timed CBT practice. Review mistakes after each mock exam so your next study session has a clear purpose.</p>
          <Link className="mt-4 inline-block font-semibold underline underline-offset-4" href="/utme-preparation-guide">Read the BJOT UTME preparation guide</Link>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-6">
          <h3 className="text-xl font-semibold">Choosing the best online tutorial for you</h3>
          <p className="mt-3 leading-relaxed">Look for tutors who explain concepts clearly, a timetable you can follow, opportunities to ask questions, and practice with feedback. Compare the teaching approach and available support with your needs before choosing a programme.</p>
          <Link className="mt-4 inline-block font-semibold underline underline-offset-4" href="/support">Explore BJOT classes and support</Link>
        </div>
      </div>
      {/* {staff.length > 0 && <div className="mt-10">
        <h3 className="text-2xl font-semibold">Meet the BJOT tutors and team</h3>
        <p className="mt-3">Learn about the people behind BJOT and their backgrounds.</p>
        <ul className="mt-5 flex flex-wrap gap-3">
          {staff.map((member) => <li key={member.id}>
            <Link className="inline-block rounded-full border border-black/15 bg-white px-5 py-3 underline underline-offset-4" href={`/about-us#${tutorAnchor(member.id)}`}>{member.name}{member.role ? ` — ${member.role}` : ""}</Link>
          </li>)}
        </ul>
      </div>} */}
    </div>
  </section>;
}
