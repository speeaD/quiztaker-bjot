import LegalPage from "@/components/legal/LegalPage";
import { publicMetadata } from "@/lib/seo";

export const metadata = publicMetadata(
  "Privacy Policy | BJOT",
  "Learn what information BJOT collects, how it is used and protected, and how to contact us about your data.",
  "/privacy-policy",
);

export default function PrivacyPolicyPage() {
  return <LegalPage title="Privacy Policy" sections={[
    {
      title: "Information We Collect",
      content: <>
        <p>When you register for the BJOT platform, whether for our Free Class or Premium programme, we may collect the following information:</p>
        <ul>
          <li><strong>Personal Identification:</strong> Full name, email address, and phone/WhatsApp number.</li>
          <li><strong>Academic Information:</strong> Target examination (e.g., UTME, WAEC), target score, and subjects of interest.</li>
          <li><strong>Performance Data:</strong> Scores from CBT practice, mock examinations, daily streaks, and general activity on the BJOT dashboard.</li>
        </ul>
      </>,
    },
    {
      title: "How We Use Your Information",
      content: <>
        <p>We use the collected data strictly to improve your educational experience:</p>
        <ul>
          <li>To create and manage your personal student dashboard.</li>
          <li>To track your academic progress and provide targeted tutor follow-ups.</li>
          <li>To communicate important class schedules, updates, and materials via WhatsApp, Telegram, or Email.</li>
          <li>To process Premium subscription payments securely.</li>
        </ul>
      </>,
    },
    {
      title: "Data Protection and Sharing",
      content: <p>Your privacy is our priority. We do not sell, rent, or trade your personal information to third parties. Your data is stored securely and is only accessible to the BJOT Academic Board and administrative team for the purpose of guiding your academic progress. We may share outstanding mock examination results on our platform&apos;s leaderboards to encourage healthy academic competition (only first names or usernames are typically used).</p>,
    },
    {
      title: "Contact Us",
      content: <p>If you have any questions about how your data is handled, please contact us at <a href="mailto:blastjambonlinetutorial@gmail.com">blastjambonlinetutorial@gmail.com</a> or via WhatsApp at <a href="https://wa.me/2349164896938">+234 916 489 6938</a>.</p>,
    },
  ]} />;
}
