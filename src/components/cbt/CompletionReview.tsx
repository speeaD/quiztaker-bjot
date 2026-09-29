import Image from "next/image";

export type ReviewedAnswer = {
  questionId?: string;
  question: string;
  yourAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean | null;
  explanation?: string;
};

const memes = [
  { below: 50, src: "/memes/0-40.jpg" },
  { below: 65, src: "/memes/50-65.jpg" },
  { below: 75, src: "/memes/65-75.jpg" },
  { below: 90, src: "/memes/75-80.jpg" },
  { below: 95, src: "/memes/90-100.jpg" },
  { below: Infinity, src: "/memes/95-100.jpg" },
];

export function ScoreMeme({ percentage }: { percentage: number }) {
  const meme = memes.find((item) => percentage < item.below) || memes[memes.length - 1];
  return <section className="mt-6 rounded-xl border border-[#dce5df] bg-white p-5 text-center" aria-label="Score meme">
    <h2 className="mb-3 text-lg font-bold text-[#17231e]">Your score meme</h2>
    <Image src={meme.src} alt={`Meme for a score of ${percentage}%`} width={640} height={480} className="mx-auto max-h-80 max-w-full rounded-lg object-contain" />
  </section>;
}

export function Corrections({ answers }: { answers: ReviewedAnswer[] }) {
  return <section className="mt-6 rounded-xl border border-[#dce5df] bg-white p-5" aria-label="Corrections and explanations">
    <h2 className="text-xl font-bold text-[#17231e]">Corrections and explanations</h2>
    {answers.length ? <ol className="mt-4 space-y-4">{answers.map((answer, index) => <li key={answer.questionId || index} className="rounded-lg border border-[#e3e9e4] p-4">
      <p className="font-semibold">{index + 1}. {answer.question}</p>
      <p className={`mt-2 text-sm ${answer.isCorrect ? "text-green-700" : "text-red-700"}`}>Your answer: {answer.yourAnswer || "Not answered"} {answer.isCorrect ? "✓" : "✗"}</p>
      <p className="mt-1 text-sm">Correct answer: <strong>{answer.correctAnswer}</strong></p>
      {answer.explanation && <p className="mt-2 whitespace-pre-wrap text-sm text-[#52635a]">Explanation: {answer.explanation}</p>}
    </li>)}</ol> : <p className="mt-3 text-sm text-[#64726a]">No answer review is available for this attempt.</p>}
  </section>;
}
