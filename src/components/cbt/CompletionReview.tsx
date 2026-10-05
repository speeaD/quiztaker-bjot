"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { legacyScoreMemes } from "@/lib/score-memes";

export type ReviewedAnswer = {
  questionId?: string;
  question: string;
  yourAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean | null;
  explanation?: string;
};

export function ScoreMeme({ percentage }: { percentage: number }) {
  const [meme, setMeme] = useState<{ percentage: number; src: string } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/score-meme?percentage=${encodeURIComponent(percentage)}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Could not load a score meme");
        return response.json() as Promise<{ src: string }>;
      })
      .then((result) => setMeme({ percentage, src: result.src }))
      .catch((error) => {
        if (controller.signal.aborted) return;
        console.error("Failed to load score meme", error);
        setMeme({ percentage, src: legacyScoreMemes(percentage)[0] });
      });

    return () => controller.abort();
  }, [percentage]);

  const src = meme?.percentage === percentage ? meme.src : null;

  return <section className="mt-6 rounded-xl border border-[#dce5df] bg-white p-5 text-center" aria-label="Score meme">
    <h2 className="mb-3 text-lg font-bold text-[#17231e]">Your score meme</h2>
    {src ? <Image src={src} alt={`Meme for a score of ${percentage}%`} width={640} height={480} className="mx-auto max-h-80 max-w-full rounded-lg object-contain" /> : <div className="h-64 animate-pulse rounded-lg bg-[#edf3ef]" role="status"><span className="sr-only">Loading score meme</span></div>}
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
