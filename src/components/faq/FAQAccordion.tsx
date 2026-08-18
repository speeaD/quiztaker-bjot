"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQ_CATEGORIES = [
  {
    category: "About BJOT",
    items: [
      {
        q: "What is BJOT?",
        a: "BJOT (Blast JAMB Online Tutorial) is a comprehensive educational programme designed to help students prepare smarter, study consistently, and perform confidently in major examinations. We provide a complete educational ecosystem that includes structured classes, expert tutors, comprehensive practice tests, bi-weekly mock examinations, detailed study resources, and performance tracking.",
      },
      {
        q: "What examinations does BJOT prepare students for?",
        a: "BJOT provides targeted preparation programmes for UTME, WAEC, NECO, and POST-UTME candidates.",
      },
    ],
  },
  {
    category: "How BJOT Works",
    items: [
      {
        q: "How are BJOT classes conducted?",
        a: "We utilize a dynamic, multi-platform learning ecosystem. Depending on the specific programme and lesson type, classes are facilitated through WhatsApp, Telegram, and YouTube. Our tutors do not simply forward materials for self-study; they actively break down complex concepts, work through live examples, answer questions in real-time, and expertly guide students through every phase of their preparation.",
      },
      {
        q: "Is BJOT just a video tutorial?",
        a: "Not at all. While high-quality video lessons are a vital component of the BJOT system, they are only one piece of the puzzle. Premium students receive a fully structured curriculum featuring real-time tutor accountability, extensive CBT practice, scheduled mock examinations, and exclusive access to the interactive BJOT learning dashboard.",
      },
      {
        q: "Does BJOT follow the official examination syllabus?",
        a: "Yes. Our curriculum is aligned with the official examination syllabuses. Our tutors systematically guide students through the required topics, ensuring key areas of concentration are covered before exam day.",
      },
      {
        q: "Do your class schedules fit both working-class people and regular school students?",
        a: "Yes, absolutely. All of our live classes and interactive activities are strategically scheduled for the evening from 7:30 PM to 11:30 PM. By this time, working-class students are finished with work, and regular school students are back home and settled, allowing everyone to participate comfortably without scheduling conflicts.",
      },
    ],
  },
  {
    category: "Free Class",
    items: [
      {
        q: "Does BJOT have a Free Class?",
        a: "Yes. We offer a Free Class to allow prospective students to experience the quality of BJOT's teaching methodologies before committing to a Premium subscription.",
      },
      {
        q: "What is the difference between the Free Class and Premium?",
        a: "The Free Class provides a valuable introductory experience, but it is inherently limited in scope and resources. BJOT Premium unlocks the complete preparation system — granting full access to the structured timetable, detailed proprietary learning resources, extensive CBT practice, comprehensive performance analytics, and all interactive dashboard tools.",
      },
      {
        q: "Can I prepare for my entire examination using only the Free Class?",
        a: "We do not recommend this. The Free Class is designed to demonstrate how BJOT works, not to serve as a comprehensive preparation strategy. To properly cover the extensive syllabus and gain the competitive edge needed for high scores, the full Premium programme is required.",
      },
    ],
  },
  {
    category: "Premium",
    items: [
      {
        q: "What exactly do I get when I join BJOT Premium?",
        a: "Premium students unlock the complete BJOT advantage, which includes: scheduled, interactive classes with dedicated subject tutors; in-depth video lessons covering key examination topics; extensive CBT practice to build speed and accuracy; bi-weekly mock examinations simulating the real test environment; full access to the Study Hub and premium learning resources, including specialised guides like key calculations in physics and A-Z organic chemistry made easy; quizzes and educational games to reinforce active recall; daily attendance and study streak tracking; detailed performance analytics; and a video library available 24/7 to revise and revisit complex topics outside of scheduled class hours.",
      },
      {
        q: "How much do students improve after joining BJOT?",
        a: "Progress on the BJOT platform is highly measurable. While individual results depend heavily on personal discipline, our past records reveal a clear pattern: students who consistently maintain our 80% standard in BJOT mock examinations go on to score above 80% in their actual exams. By identifying weak points early and utilizing our targeted video lessons and CBT modules, students see significant, measurable growth. Ultimately, the final result is simply a reflection of the effort the student puts into the system.",
      },
      {
        q: "Is the BJOT website the actual class?",
        a: "The website acts as your personal academic headquarters, but it does not replace the classes. Students receive active instruction through BJOT's designated teaching channels and use the website dashboard to practice, review analytics, take assessments, and monitor their overall progress.",
      },
      {
        q: "Is Premium access subscription-based?",
        a: "Yes. To maintain access to the live tutoring, continuous platform updates, and premium resources, an active subscription is required.",
      },
    ],
  },
  {
    category: "YouTube",
    items: [
      {
        q: "Does BJOT have YouTube lessons?",
        a: "Yes. As part of our wider learning ecosystem, we produce educational content and video lessons on YouTube. This is an excellent way for students to familiarize themselves with our teaching style before upgrading to Premium.",
      },
      {
        q: "Is everything on YouTube free?",
        a: "While we provide a selection of valuable free content on our channel, our most detailed, step-by-step curriculum videos and proprietary study breakdowns are strictly reserved for BJOT Premium students.",
      },
      {
        q: "Where can I find BJOT on YouTube?",
        a: "Simply search for BJOT OFFICIAL on YouTube to access our public content library.",
      },
    ],
  },
  {
    category: "Results & Progress",
    items: [
      {
        q: "Does BJOT guarantee a 300+ score?",
        a: "We do not sell magic scores; we provide a proven, high-performance system. We offer you the exact, refined framework that has produced hundreds of students who scored 300 and above. Our responsibility is to deliver clear teaching, solid structure, rigorous practice, and consistent support. Your primary duty is to execute the system — attend your classes, study your materials, practice relentlessly, and treat your mock exams like the real thing. If you bring the discipline and consistency, our system is built to help you achieve academic excellence.",
      },
      {
        q: "What if I currently have a poor academic background?",
        a: "A weak foundation is simply a starting point, not a final destination. BJOT is designed to break down the entire syllabus from scratch. We do not assume you already know the material. Through structured video lessons, clear resources, and patient tutor follow-ups, we meet you exactly where you are, rebuild your academic foundation, and progressively guide you to where you need to be.",
      },
      {
        q: "How will I know if my scores are actually improving?",
        a: "BJOT utilizes consistent CBT practice and bi-weekly mock examinations to objectively measure your capabilities. Furthermore, Premium students can view their Current Average, Target Score progress, and detailed subject-by-subject analytics directly on the BJOT dashboard, giving you total visibility over your growth.",
      },
      {
        q: "Do you follow up on individual student personal progress?",
        a: "Yes, we do. We don't just put you in a group and leave you on your own. Through our daily attendance tracking, study streak monitoring, dashboard performance analytics, and active tutor follow-ups, we keep a close eye on your engagement and scores to ensure you are staying on track and improving consistently.",
      },
    ],
  },
  {
    category: "Parents & Students",
    items: [
      {
        q: "Is BJOT suitable for a student who struggles with consistency?",
        a: "BJOT provides clear structure, consistent practice, and strong accountability tools. However, the student must still take responsibility for their preparation. We provide a highly effective system, but the student must ultimately choose to show up and do the work.",
      },
      {
        q: "Can a parent or guardian register a student?",
        a: "Yes. We highly encourage parents and guardians to facilitate registration for their wards to ensure they are enrolled in a structured preparatory environment.",
      },
      {
        q: "How do I join BJOT?",
        a: "You can register directly through the BJOT website, or reach out to our support team for personalized guidance regarding the best programme for your needs.",
      },
    ],
  },
];

export default function FAQAccordion() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section className="faq-section">
      <div className="wrap faq-wrap">
        {FAQ_CATEGORIES.map((group) => (
          <div className="faq-category" key={group.category}>
            <h2 className="faq-category-title">{group.category}</h2>
            <div className="faq-list">
              {group.items.map((item) => {
                const id = `${group.category}-${item.q}`;
                const isOpen = openId === id;
                return (
                  <div
                    className={`faq-item${isOpen ? " is-open" : ""}`}
                    key={id}
                  >
                    <button
                      className="faq-question"
                      onClick={() => setOpenId(isOpen ? null : id)}
                      aria-expanded={isOpen}
                    >
                      {item.q}
                      <ChevronDown size={18} className="faq-chevron" />
                    </button>
                    {isOpen && <p className="faq-answer">{item.a}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}