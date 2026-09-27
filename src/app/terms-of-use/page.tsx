import LegalPage from "@/components/legal/LegalPage";
import { publicMetadata } from "@/lib/seo";

export const metadata = publicMetadata(
  "Terms of Use | BJOT",
  "Read the terms for BJOT Free and Premium classes, including content rights, subscriptions, payments, and student conduct.",
  "/terms-of-use",
);

export default function TermsOfUsePage() {
  return <LegalPage title="Terms of Use" sections={[
    {
      title: "Acceptance of Terms",
      content: <p>By accessing the BJOT website (<a href="https://www.bjotofficial.com">www.bjotofficial.com</a>) and participating in our Free or Premium classes, you agree to abide by these Terms of Use.</p>,
    },
    {
      title: "Intellectual Property Rights",
      content: <>
        <p>All content provided by BJOT, including but not limited to video lessons, CBT software, mock examinations, &quot;Areas of Concentration&quot; PDFs, and proprietary study guides (e.g., A-Z Organic Chemistry), are the exclusive property of BJOT.</p>
        <ul>
          <li>You may not download, screen-record, copy, distribute, or resell any BJOT Premium materials.</li>
          <li>Unauthorized sharing of Premium content is strictly prohibited and will result in immediate account termination without a refund.</li>
        </ul>
      </>,
    },
    {
      title: "Premium Subscriptions and Payments",
      content: <>
        <p>Access to the full BJOT ecosystem requires an active Premium subscription.</p>
        <ul>
          <li>Payments made for Premium access are final. Because digital educational content is delivered immediately upon access, we do not offer refunds once a student has been onboarded into the Premium classes and dashboard.</li>
        </ul>
      </>,
    },
    {
      title: "Code of Conduct",
      content: <p>BJOT maintains a highly disciplined learning environment. Students are expected to conduct themselves respectfully in all our digital classrooms (WhatsApp, Telegram, YouTube). Spamming, disrespecting tutors, or disrupting the learning of others will lead to immediate removal from the platform.</p>,
    },
    {
      title: "Disclaimer of Guarantees",
      content: <p>While the BJOT system has a proven track record of producing high achievers (300+ in UTME), we do not guarantee specific examination scores. Academic success requires the student’s personal discipline, consistent practice, and active participation. We provide the expert system; the student must do the work.</p>,
    },
    {
      title: "Modifications",
      content: <p>BJOT reserves the right to update these terms, class schedules, and subscription features at any time to improve the quality of our educational services.</p>,
    },
  ]} />;
}
