import {
  BarChart3,
  BookOpen,
  Clock3,
  FileText,
  Gamepad2,
  Target,
} from "lucide-react";

export const features = [
  {
    id: "study",
    label: "Study Hub",
    icon: BookOpen,
    title: "Understand the topic before you test yourself",
    description:
      "Read clear topic summaries, watch lessons, and check your understanding before moving on. Study ahead of live classes and revisit difficult concepts at your own pace.",
    benefit: "Stronger understanding helps you answer unfamiliar questions.",
    image: "/dashboard-previews/study-hub.jpg",
    alt: "BJOT Biology Study Hub notes with labelled diagrams, concise explanations, and a topic test",
  },
  {
    id: "manuals",
    label: "Textbooks",
    icon: BookOpen,
    title: "Your BJOT proprietary manuals",
    description:
      "Focused, exam-aware reference manuals help you revise essential concepts and practise with explanations.",
    benefit:
      "Use department-relevant material to strengthen recall and apply concepts in UTME questions.",
    image: "/dashboard-previews/textbooks.jpg",
    alt: "BJOT manual artwork for Government, Literature in English, Physics, and Organic Chemistry",
  },
  {
    id: "past-questions",
    label: "JAMB Past Questions",
    icon: FileText,
    title: "Learn the patterns. Understand the answers.",
    description:
      "Practise past questions across your UTME subjects and understand the reasoning behind each answer.",
    benefit:
      "Reviewing explanations helps you recognise how familiar concepts appear in new questions.",
    image: "",
    alt: "",
  },
  {
    id: "cbt",
    label: "CBT Simulator & Subject Tests",
    icon: Clock3,
    title: "Turn knowledge into exam confidence",
    description:
      "Set up a focused subject test or build a full timed four-subject mock. Navigate questions, select answers, submit, and review your attempt.",
    benefit:
      "Practise pacing, navigation, and decision-making under exam conditions.",
    image: "/dashboard-previews/gameplay-poster.png",
    alt: "A timed CBT question using a Physics circuit diagram, answer choices, and exam controls",
  },
  {
    id: "games",
    label: "Game Hub",
    icon: Gamepad2,
    title: "Make consistent practice more engaging",
    description:
      "Play Time Attack, Sudden Death, and Scholar’s Wager to bring quick recall into your regular study routine.",
    benefit:
      "Short challenges encourage retrieval practice and regular engagement.",
    image: "/dashboard-previews/game-hub.jpg",
    alt: "BJOT Game Hub showing Time Attack, Sudden Death, and Scholar’s Wager",
  },
  {
    id: "tracker",
    label: "Performance Tracker & Streaks",
    icon: BarChart3,
    title: "Know what to study next",
    description:
      "Review your results, spot weak topics, and make your next study session count.",
    benefit:
      "Readiness is a practice-performance indicator that helps you choose a useful next step.",
    image: "/dashboard-previews/dashboard-overview.png",
    alt: "BJOT student dashboard with Projected Readiness and daily learning streak",
  },
  {
    id: "mocks",
    label: "Standard Mock Exams",
    icon: Target,
    title: "Practise. Review. Improve.",
    description:
      "Take your assigned biweekly mocks and use instant result breakdowns to guide targeted revision.",
    benefit: "Mock reviews help turn mistakes into a focused revision plan.",
    image: "/dashboard-previews/dashboard-premium.png",
    alt: "BJOT premium student dashboard with mock activity and performance overview",
  },
] as const;
