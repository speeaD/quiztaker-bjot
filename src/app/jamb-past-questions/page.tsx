"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Award, Clock3, RotateCcw } from "lucide-react";
import ExamWorkspace from "@/components/cbt/ExamWorkspace";
import SimulatorHeader from "@/components/cbt/SimulatorHeader";
import CalculatorWidget from "@/components/cbt/CalculatorWidget";
import {
  Corrections,
  ScoreMeme,
  type ReviewedAnswer,
} from "@/components/cbt/CompletionReview";
import type { CbtQuestion, CbtQuestionSet } from "@/components/cbt/types";
import { isEnglishSubject } from "@/lib/registration-subjects";
import MaintenanceDialog from "@/components/MaintenanceDialog";

type Paper = {
  id: string;
  year: number;
  subjectId: string;
  subjectTitle: string;
  questionCount: number;
  durationSeconds: number;
  version?: number;
};
type Subject = { _id: string; title: string };
type Availability = {
  accountType: string;
  years: number[];
  subjects: Subject[];
  papers: Paper[];
};
type Attempt = {
  id: string;
  year: number;
  papers: Paper[];
  startedAt: string;
  expiresAt: string;
  durationSeconds: number;
  totalQuestions: number;
  answers: Record<string, string>;
  questionsBySet: Record<string, CbtQuestion[]>;
};
type Result = {
  id: string;
  year: number;
  papers: Paper[];
  score: number;
  totalPoints: number;
  percentage: number;
  timeTaken: number;
  review: ReviewedAnswer[];
};
type Active = { id: string; year: number; expiresAt: string };

async function request<T>(
  path: string,
  method = "GET",
  body?: object,
): Promise<T> {
  const response = await fetch(`/api/past-questions/${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const data: { success?: boolean; message?: string } & T =
    await response.json();
  if (!response.ok || !data.success)
    throw new Error(data.message || "Practice service is unavailable");
  return data;
}
const formatTime = (seconds: number) =>
  `${Math.floor(seconds / 3600)}:${String(Math.floor((seconds % 3600) / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

export function JambPastQuestionsPractice() {
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [active, setActive] = useState<Active[]>([]);
  const [year, setYear] = useState<number | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [setIndex, setSetIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [calculator, setCalculator] = useState(false);
  const attemptRef = useRef<Attempt | null>(null);
  const answersRef = useRef<Record<string, string>>({});
  const saveQueue = useRef<Promise<unknown>>(Promise.resolve());
  const submitting = useRef(false);

  useEffect(() => {
    let current = true;
    Promise.all([
      request<Availability>("availability"),
      request<{ attempts: Active[] }>("attempts/active"),
    ])
      .then(([available, ongoing]) => {
        if (current) {
          setAvailability(available);
          setActive(ongoing.attempts);
          setYear(available.years[0] ?? null);
        }
      })
      .catch((cause: unknown) => {
        if (current)
          setError(
            cause instanceof Error
              ? cause.message
              : "Could not load past papers",
          );
      });
    return () => {
      current = false;
    };
  }, []);

  const activateAttempt = (next: Attempt) => {
    attemptRef.current = next;
    answersRef.current = next.answers || {};
    setAttempt(next);
    setRemaining(
      Math.max(
        0,
        Math.ceil((new Date(next.expiresAt).getTime() - Date.now()) / 1000),
      ),
    );
    setAnswers(next.answers || {});
    setYear(next.year);
    setSelected(next.papers.map((paper) => paper.subjectId));
    setSetIndex(0);
    setQuestionIndex(0);
    setResult(null);
    setError("");
  };
  const resume = async (id: string) => {
    try {
      setBusy(true);
      setError("");
      const data = await request<{ attempt?: Attempt; result?: Result }>(
        `attempts/${id}`,
      );
      if (data.result) {
        setResult(data.result);
        setAttempt(null);
        setActive((items) => items.filter((item) => item.id !== id));
      } else if (data.attempt) activateAttempt(data.attempt);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not resume practice",
      );
    } finally {
      setBusy(false);
    }
  };
  const start = async () => {
    if (!year || selected.length !== 4 || busy) return;
    try {
      setBusy(true);
      setError("");
      const data = await request<{ attempt: Attempt }>("attempts", "POST", {
        year,
        subjectIds: selected,
      });
      activateAttempt(data.attempt);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not start practice",
      );
    } finally {
      setBusy(false);
    }
  };
  const submit = useCallback(async (automatic = false) => {
    const current = attemptRef.current;
    if (!current || submitting.current) return;
    if (
      !automatic &&
      !window.confirm(
        `Submit ${Object.values(answersRef.current).filter(Boolean).length}/${current.totalQuestions} answered questions?`,
      )
    )
      return;
    submitting.current = true;
    setBusy(true);
    setError("");
    try {
      await saveQueue.current.catch(() => undefined);
      const data = await request<{ result: Result }>(
        `attempts/${current.id}/submit`,
        "POST",
        { answers: answersRef.current },
      );
      setResult(data.result);
      setAttempt(null);
      attemptRef.current = null;
      setActive((items) => items.filter((item) => item.id !== current.id));
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not submit practice",
      );
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    if (!attempt) return;
    const tick = () =>
      setRemaining(
        Math.max(
          0,
          Math.ceil(
            (new Date(attempt.expiresAt).getTime() - Date.now()) / 1000,
          ),
        ),
      );
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [attempt]);
  useEffect(() => {
    if (attempt && remaining === 0) void submit(true);
  }, [attempt, remaining, submit]);

  const onAnswer = (questionId: string, answer: string) => {
    const current = attemptRef.current;
    if (!current || remaining <= 0) return;
    const updated = { ...answersRef.current, [questionId]: answer };
    answersRef.current = updated;
    setAnswers(updated);
    saveQueue.current = saveQueue.current
      .catch(() => undefined)
      .then(async () => {
        await request(`attempts/${current.id}/answers`, "PATCH", {
          answers: { [questionId]: answer },
        });
      });
    void saveQueue.current.catch((cause: unknown) =>
      setError(
        cause instanceof Error
          ? `Answer not saved: ${cause.message}`
          : "Answer not saved",
      ),
    );
  };
  const papers =
    year === null
      ? []
      : availability?.papers.filter((paper) => paper.year === year) || [];
  const selectedPapers = attempt?.papers || [];
  const setIds = selectedPapers.map((paper) => paper.subjectId);
  const questionSets: CbtQuestionSet[] = selectedPapers.map((paper) => ({
    _id: paper.subjectId,
    title: paper.subjectTitle,
    questionCount: paper.questionCount,
    totalPoints: paper.questionCount,
  }));
  const bySet = attempt?.questionsBySet || {};
  const currentQuestions = bySet[setIds[setIndex]] || [];
  const currentQuestion = currentQuestions[questionIndex] || null;
  const globalIndex =
    setIds
      .slice(0, setIndex)
      .reduce((sum, id) => sum + (bySet[id]?.length || 0), 0) + questionIndex;

  if (result)
    return (
      <div className="portal-page">
        <SimulatorHeader mode="result" />
        <main className="mx-auto max-w-3xl px-4 py-8">
          <section className="rounded-xl border border-[#dce5df] bg-white p-8 text-center">
            <Award className="mx-auto text-[#15513e]" size={38} />
            <p className="mt-3 text-sm font-bold text-[#15513e]">
              JAMB {result.year} past questions
            </p>
            <h1 className="mt-2 text-3xl font-black">
              {result.percentage}% score
            </h1>
            <p className="mt-2 text-sm">
              {result.score} of {result.totalPoints} correct ·{" "}
              {Math.floor(result.timeTaken / 60)} minutes
            </p>
            <button
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#0d3b2e] px-5 py-3 font-bold text-white"
              onClick={() => {
                setResult(null);
                setAttempt(null);
              }}
            >
              <RotateCcw size={17} /> Practise another year
            </button>
          </section>
          <ScoreMeme percentage={result.percentage} />
          <Corrections answers={result.review} />
        </main>
      </div>
    );

  if (attempt)
    return (
      <div className="portal-page">
        <SimulatorHeader
          mode="exam"
          timer={formatTime(remaining)}
          showCalculator={calculator}
          onCalculatorToggle={() => setCalculator((value) => !value)}
          onSubmit={() => void submit()}
        />
        <div className="border-b border-[#dce5df] bg-[#edf3ef] px-4 py-2 text-center text-xs font-bold text-[#15513e] sm:hidden">
          <Clock3 className="mr-1 inline size-4" />
          {formatTime(remaining)} remaining
        </div>
        {error && (
          <p
            role="alert"
            className="mx-auto mt-4 max-w-7xl rounded-lg bg-[#fff0ec] p-3 text-sm text-[#a8451f]"
          >
            {error}
          </p>
        )}
        <ExamWorkspace
          questionSets={questionSets}
          selectedIds={setIds}
          questionsBySet={bySet}
          currentSetIndex={setIndex}
          currentQuestionIndex={questionIndex}
          answers={answers}
          currentQuestion={currentQuestion}
          currentGlobalIndex={globalIndex}
          totalQuestions={attempt.totalQuestions}
          onSubjectChange={(index) => {
            setSetIndex(index);
            setQuestionIndex(0);
          }}
          onQuestionChange={setQuestionIndex}
          onAnswer={(answer) =>
            currentQuestion && onAnswer(currentQuestion._id, answer)
          }
          onPrevious={() => {
            if (questionIndex > 0) setQuestionIndex(questionIndex - 1);
            else if (setIndex > 0) {
              setSetIndex(setIndex - 1);
              setQuestionIndex((bySet[setIds[setIndex - 1]] || []).length - 1);
            }
          }}
          onNext={() => {
            if (questionIndex < currentQuestions.length - 1)
              setQuestionIndex(questionIndex + 1);
            else if (setIndex < setIds.length - 1) {
              setSetIndex(setIndex + 1);
              setQuestionIndex(0);
            }
          }}
        />
        {busy && (
          <div
            role="status"
            className="fixed inset-0 z-40 grid place-items-center bg-[#0d3b2e]/25"
          >
            <span className="rounded-lg bg-white px-5 py-4 font-bold">
              Submitting practice…
            </span>
          </div>
        )}
        {calculator && (
          <CalculatorWidget onClose={() => setCalculator(false)} />
        )}
      </div>
    );

  return (
    <div className="portal-page">
      <main className="mx-auto max-w-5xl px-4 py-8">
        <header className="rounded-xl bg-[#0d3b2e] p-6 text-white">
          <p className="text-xs font-bold uppercase tracking-widest text-[#efb948]">
            Year-specific practice
          </p>
          <h1 className="mt-2 text-3xl font-black">JAMB Past Questions</h1>
          <p className="mt-2 text-sm text-white/80">
            Choose one year, Use of English, and three other subjects. Every
            question will come from that year.
          </p>
        </header>
        {error && (
          <p
            role="alert"
            className="mt-5 rounded-lg bg-[#fff0ec] p-4 text-sm text-[#a8451f]"
          >
            {error}
          </p>
        )}
        {!!active.length && (
          <section className="mt-6 rounded-xl border border-[#dce5df] bg-white p-5">
            <h2 className="font-bold">Resume practice</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {active.map((item) => (
                <button
                  key={item.id}
                  disabled={busy}
                  onClick={() => void resume(item.id)}
                  className="rounded-lg border border-[#b6cfc0] px-4 py-2 text-sm font-bold text-[#15513e] disabled:opacity-50"
                >
                  {item.year} attempt · resume or view result
                </button>
              ))}
            </div>
          </section>
        )}
        <section className="mt-6 rounded-xl border border-[#dce5df] bg-white p-6">
          <label className="block text-sm font-bold" htmlFor="practice-year">
            Exam year
          </label>
          <select
            id="practice-year"
            className="mt-2 w-full rounded-lg border border-[#b6cfc0] p-3 sm:w-64"
            value={year ?? ""}
            onChange={(event) => {
              setYear(Number(event.target.value));
              setSelected([]);
            }}
          >
            <option value="" disabled>
              Select a year
            </option>
            {availability?.years.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          {!availability?.years.length && (
            <p className="mt-3 text-sm text-[#64726a]">
              No JAMB past papers have been published yet.
            </p>
          )}
          {year !== null && (
            <>
              <h2 className="mt-6 font-bold">Subjects ({selected.length}/4)</h2>
              <p className="mt-1 text-sm text-[#64726a]">
                Use of English is compulsory. Unavailable subjects need a
                published, usable paper for {year}.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {availability?.subjects.map((subject) => {
                  const paper = papers.find(
                    (item) => item.subjectId === subject._id,
                  );
                  const checked = selected.includes(subject._id);
                  return (
                    <label
                      key={subject._id}
                      className={`flex items-start gap-3 rounded-lg border p-4 ${paper ? "cursor-pointer border-[#dce5df]" : "border-slate-200 bg-slate-50 text-slate-500"}`}
                    >
                      <input
                        type="checkbox"
                        className="mt-1"
                        disabled={!paper || (!checked && selected.length >= 4)}
                        checked={checked}
                        onChange={() =>
                          setSelected((items) =>
                            checked
                              ? items.filter((id) => id !== subject._id)
                              : [...items, subject._id],
                          )
                        }
                      />
                      <span>
                        <strong className="block text-sm">
                          {subject.title}
                          {isEnglishSubject(subject.title)
                            ? " · compulsory"
                            : ""}
                        </strong>
                        <small>
                          {paper
                            ? `${paper.questionCount} questions available`
                            : `No published ${year} paper`}
                        </small>
                      </span>
                    </label>
                  );
                })}
              </div>
              {papers.length < 4 ||
              !papers.some((paper) => isEnglishSubject(paper.subjectTitle)) ? (
                <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
                  A four-subject attempt is unavailable for {year} until Use of
                  English and at least three other subjects are published.
                </p>
              ) : null}
              <button
                disabled={
                  busy ||
                  selected.length !== 4 ||
                  selected.filter((id) =>
                    isEnglishSubject(
                      availability?.subjects.find(
                        (subject) => subject._id === id,
                      )?.title || "",
                    ),
                  ).length !== 1
                }
                onClick={() => void start()}
                className="mt-6 rounded-lg bg-[#0d3b2e] px-6 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy ? "Starting…" : "Start timed practice"}
              </button>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default function JambPastQuestions() {
  const router = useRouter();
  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f8f6] px-4 py-12 text-center">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#9a5a00]">
          Scheduled maintenance
        </p>
        <h1 className="mt-3 text-3xl font-black text-[#17231e]">
          JAMB Practice is temporarily unavailable
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#64726a]">
          We’re working on this feature. Please check back later; your other learning tools are still available.
        </p>
      </div>
      <MaintenanceDialog open onClose={() => router.replace("/dashboard")} />
    </main>
  );
}
