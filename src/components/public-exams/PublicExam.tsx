"use client";

import ExamWorkspace from "@/components/cbt/ExamWorkspace";
import { Corrections, ScoreMeme, type ReviewedAnswer } from "@/components/cbt/CompletionReview";
import PublicHeader from "@/components/PublicHeader";
import type { CbtQuestion, CbtQuestionSet } from "@/components/cbt/types";
import { useCallback, useEffect, useRef, useState } from "react";
import MockSubjectSelection from '@/components/MockSubjectSelection';
import { validRegistrationCombination } from '@/lib/registration-subjects';
import { watchExamFocus } from '@/lib/exam-focus';

type Result = { score: number; totalPoints: number; percentage: number };
type Mode = "mock" | "topic";
type Mock = { id: string; title: string; questionSetIds: string[]; questionCount: number; durationSeconds: number; multipleAttempts: boolean; looseFocus: boolean; studentSelectsSubjects?: boolean; compulsoryQuestionSetId?: string };
type MockResponse = {
  session: {
    id: string;
    title: string;
    durationSeconds: number;
    remainingSeconds: number;
    questionSetIds: string[];
    multipleAttempts: boolean;
    looseFocus: boolean;
    questionsBySet: Record<string, CbtQuestion[]>;
  };
};
type TopicResponse = {
  topic: { id: string; name: string };
  questionSet: CbtQuestionSet;
  questions: CbtQuestion[];
};

async function api<T>(path: string, body?: object): Promise<T> {
  const response = await fetch(`/api/public-exams/${path}`, {
    method: body ? "POST" : "GET",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const data: { success?: boolean; message?: string } = await response.json();
  if (!response.ok || data.success === false)
    throw new Error(data.message || "Unable to complete this request");
  return data as T;
}

export default function PublicExam({
  mode,
  topicId,
  questionSetId,
  topic,
}: {
  mode: Mode;
  topicId?: string;
  questionSetId?: string;
  topic?: string;
}) {
  const [phase, setPhase] = useState<"setup" | "exam" | "submitting" | "submission-error" | "result">("setup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sets, setSets] = useState<CbtQuestionSet[]>([]);
  const [mocks, setMocks] = useState<Mock[]>([]);
  const [selectedMockId, setSelectedMockId] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [topicData, setTopicData] = useState<TopicResponse | null>(null);
  const [questionsBySet, setQuestionsBySet] = useState<
    Record<string, CbtQuestion[]>
  >({});
  const [sessionId, setSessionId] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [setIndex, setSetIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [gradedResult, setGradedResult] = useState<Result | null>(null);
  const [review, setReview] = useState<ReviewedAnswer[]>([]);
  const [countsForGrade, setCountsForGrade] = useState(true);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [settings, setSettings] = useState({ multipleAttempts: false, looseFocus: false });
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
  const [submissionReason, setSubmissionReason] = useState<"focus" | "time" | null>(null);
  const autoSubmitted = useRef(false);
  const submissionInProgress = useRef(false);
  const selectedMock = mocks.find((mock) => mock.id === selectedMockId);
  const selectableSubjects = sets.filter((set) => selectedMock?.questionSetIds.includes(set._id));
  const validSubjects = selectedMock?.studentSelectsSubjects ? validRegistrationCombination(selected, selectableSubjects) : selected.length === 4;

  useEffect(() => {
    let active = true;
    if (mode === "mock") {
      api<{
        questionSets: CbtQuestionSet[];
        mocks: Mock[];
      }>("question-sets")
        .then((data) => {
          if (active) {
            setSets(data.questionSets || []);
            setMocks(data.mocks || []);
          }
        })
        .catch((err) => {
          if (active)
            setError(
              err instanceof Error ? err.message : "Unable to load free mocks",
            );
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    } else {
      const query = topicId
        ? new URLSearchParams({ topicId })
        : questionSetId && topic
          ? new URLSearchParams({ questionSetId, topic })
          : null;
      if (!query) {
        setError("This topic test link is incomplete.");
        setLoading(false);
        return;
      }
      api<TopicResponse>(`topic/questions?${query}`)
        .then((data) => {
          if (active) setTopicData(data);
        })
        .catch((err) => {
          if (active)
            setError(
              err instanceof Error ? err.message : "Unable to load topic test",
            );
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }
    return () => {
      active = false;
    };
  }, [mode, topicId, questionSetId, topic]);

  useEffect(() => {
    if (phase !== "exam") return;
    const timer = window.setInterval(
      () => setSeconds((remaining) => Math.max(remaining - 1, 0)),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [phase]);

  const submit = useCallback(
    async (reason?: "focus" | "time") => {
      if (submissionInProgress.current || (phase !== "exam" && phase !== "submission-error")) return;
      submissionInProgress.current = true;
      if (reason) setSubmissionReason(reason);
      setShowSubmitConfirmation(false);
      setPhase("submitting");
      setBusy(true);
      setError("");
      try {
        const payload = {
          answers: Object.entries(answers).map(([questionId, answer]) => ({
            questionId,
            answer,
          })),
        };
        if (mode === "mock") {
          const data = await api<{
            attempt: Result;
            gradedResult: Result;
            countsForGrade: boolean;
            review: ReviewedAnswer[];
          }>(`mock/sessions/${encodeURIComponent(sessionId)}/submit`, payload);
          setResult(data.attempt);
          setGradedResult(data.gradedResult);
          setCountsForGrade(data.countsForGrade);
          setReview(data.review || []);
        } else {
          const data = await api<{ result: Result; review: ReviewedAnswer[] }>("topic/submit", {
            ...payload,
            topicId: topicData?.topic.id,
          });
          setResult(data.result);
          setReview(data.review || []);
        }
        setPhase("result");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to submit");
        setPhase("submission-error");
      } finally {
        submissionInProgress.current = false;
        setBusy(false);
      }
    },
    [answers, mode, phase, sessionId, topicData],
  );

  const submitRef = useRef(submit);
  useEffect(() => { submitRef.current = submit; }, [submit]);

  useEffect(() => {
    if (mode !== "mock" || phase !== "exam" || settings.looseFocus) return;
    return watchExamFocus(() => { void submitRef.current("focus"); });
  }, [mode, phase, settings.looseFocus]);

  useEffect(() => {
    if (phase === "exam" && seconds === 0 && !autoSubmitted.current) {
      autoSubmitted.current = true;
      void submit("time");
    }
  }, [phase, seconds, submit]);

  const start = async () => {
    if (busy || loading) return;
    setError("");
    if (mode === "mock") {
      if (
        !name.trim() ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
        !selectedMockId
      ) {
        setError("Enter your name, a valid email, and choose a free mock.");
        return;
      }
      if (!selectedMock || !validSubjects) {
        setError("Choose compulsory English and three other subjects for this mock.");
        return;
      }
    } else if (!topicData?.questions.length) {
      setError("No questions are available for this topic.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "mock") {
        const data = await api<MockResponse>("mock/sessions", {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          quizId: selectedMockId,
          questionSetIds: selected,
        });
        if (
          !data.session?.id ||
          !Number.isInteger(data.session.durationSeconds) || data.session.durationSeconds <= 0 ||
          !Number.isInteger(data.session.remainingSeconds) || data.session.remainingSeconds < 0 ||
          !Array.isArray(data.session.questionSetIds) || data.session.questionSetIds.length !== 4 ||
          data.session.questionSetIds.some((id) => !data.session.questionsBySet?.[id]?.length)
        )
          throw new Error(
            "The exam has no questions for one or more selected subjects.",
          );
        setSessionId(data.session.id);
        setSelected(data.session.questionSetIds);
        setSettings({ multipleAttempts: data.session.multipleAttempts === true, looseFocus: data.session.looseFocus === true });
        setQuestionsBySet(data.session.questionsBySet);
        setSeconds(data.session.remainingSeconds);
      } else if (topicData) {
        setSets([topicData.questionSet]);
        setSelected([topicData.questionSet._id]);
        setQuestionsBySet({ [topicData.questionSet._id]: topicData.questions });
        setSeconds(Math.max(600, topicData.questions.length * 90));
      }
      autoSubmitted.current = false;
      submissionInProgress.current = false;
      setSubmissionReason(null);
      setAnswers({});
      setSetIndex(0);
      setQuestionIndex(0);
      setResult(null);
      setReview([]);
      setPhase("exam");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start the test");
    } finally {
      setBusy(false);
    }
  };

  const activeId = selected[setIndex];
  const activeQuestions = questionsBySet[activeId] || [];
  const current = activeQuestions[questionIndex] || null;
  const totalQuestions = selected.reduce(
    (sum, id) => sum + (questionsBySet[id]?.length || 0),
    0,
  );
  const globalIndex =
    selected
      .slice(0, setIndex)
      .reduce((sum, id) => sum + (questionsBySet[id]?.length || 0), 0) +
    questionIndex;
  return (
    <div className="min-h-screen bg-[#f4f7f5]">
      <PublicHeader exam={phase === "exam" ? {
        timer: `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`,
        onSubmit: () => setShowSubmitConfirmation(true),
        submitting: busy,
      } : undefined} />
      {error && (
        <p
          role="alert"
          className="mx-auto mt-4 max-w-5xl rounded-lg bg-[#fff0ec] p-4 text-sm text-[#a8451f]"
        >
          {error}
        </p>
      )}
      {phase === "setup" && (
        <main className="mx-auto max-w-5xl px-4 py-8">
          <section className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
            <h1 className="text-2xl font-black text-[#17231e]">
              {mode === "mock"
                ? "Free mock exam"
                : `${topicData?.topic.name || "Topic"}`}
            </h1>
            <p className="mt-2 text-sm text-[#64726a]">
              {mode === "mock"
                ? "Enter your details and choose an exam. Your first completed score for this mock is the graded score."
                : "Answer questions from the lesson, then see your score."}
            </p>
            {loading && (
              <p className="mt-6 text-sm text-[#64726a]">
                Loading available questions…
              </p>
            )}
            {mode === "mock" && !loading && mocks.length === 0 && (
              <p className="mt-6 text-sm text-[#64726a]">
                No free mock is available right now.
              </p>
            )}
            {mode === "mock" && mocks.length > 0 && (
              <>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-bold">
                    Full name
                    <input
                      className="mt-2 w-full rounded-md border border-[#c9d8cf] p-3 font-normal"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      autoComplete="name"
                    />
                  </label>
                  <label className="text-sm font-bold">
                    Email
                    <input
                      className="mt-2 w-full rounded-md border border-[#c9d8cf] p-3 font-normal"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      autoComplete="email"
                    />
                  </label>
                </div>
                <p className="mt-6 text-sm font-bold">Choose a free mock</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {mocks.map((mock) => (
                    <button
                      type="button"
                      key={mock.id}
                      aria-pressed={selectedMockId === mock.id}
                      onClick={() => {
                        setSelectedMockId(mock.id);
                        setSelected(mock.studentSelectsSubjects ? (mock.compulsoryQuestionSetId ? [mock.compulsoryQuestionSetId] : []) : mock.questionSetIds);
                      }}
                      className={`rounded-lg border p-4 text-left text-sm ${selectedMockId === mock.id ? "border-[#0d3b2e] bg-[#edf7f0]" : "border-[#dce5df]"}`}
                    >
                      <span className="block font-bold">{mock.title}</span>
                      <span className="mt-1 block text-[#64726a]">
                        {mock.questionSetIds.map((id) => sets.find((set) => set._id === id)?.title || id).join(" · ")}
                      </span>
                      <span className="mt-1 block text-[#64726a]">
                        {mock.studentSelectsSubjects ? `${mock.questionSetIds.length} subjects available` : `${mock.questionCount} questions`} · {Math.ceil(mock.durationSeconds / 60)} minutes
                      </span>
                    </button>
                  ))}
                </div>
                {selectedMock?.studentSelectsSubjects && <MockSubjectSelection subjects={selectableSubjects.map((set) => ({ id: set._id, title: set.title }))} selectedIds={selected} englishId={selectedMock.compulsoryQuestionSetId} disabled={busy}
                  onToggle={(id) => setSelected((current) => id === selectedMock.compulsoryQuestionSetId ? current : current.includes(id) ? current.filter((value) => value !== id) : current.length < 4 ? [...current, id] : current)} />}
                {selectedMock && <p className="mt-4 rounded-lg bg-[#edf3ef] p-4 text-sm text-[#293830]">
                  {selectedMock.multipleAttempts ? "Retakes are allowed." : "Only one attempt is allowed for this mock."}{" "}
                  {selectedMock.looseFocus ? "You may switch tabs or windows." : "Switching tabs or windows will submit your exam immediately."}
                </p>}
              </>
            )}
            {mode === "topic" && topicData && (
              <p className="mt-6 text-sm text-[#64726a]">
                {topicData.questionSet.title} · {topicData.questions.length}{" "}
                questions
              </p>
            )}
            <button
              type="button"
              disabled={
                busy ||
                loading ||
                (mode === "mock"
                  ? !selectedMockId || !validSubjects
                  : !topicData)
              }
              onClick={() => void start()}
              className="mt-6 rounded-md bg-[#0d3b2e] px-6 py-3 text-sm font-bold text-white disabled:opacity-50"
            >
              {busy ? "Preparing…" : "Start test"}
            </button>
          </section>
        </main>
      )}
      {phase === "exam" && (
        <>
          {mode === "mock" && !settings.looseFocus && <p role="status" className="mx-auto mt-4 max-w-7xl px-4 text-sm font-bold text-[#a8451f]">Stay on this page. Switching tabs or windows submits your exam.</p>}
          <ExamWorkspace
            questionSets={sets}
            selectedIds={selected}
            questionsBySet={questionsBySet}
            currentSetIndex={setIndex}
            currentQuestionIndex={questionIndex}
            answers={answers}
            currentQuestion={current}
            currentGlobalIndex={globalIndex}
            totalQuestions={totalQuestions}
            onSubjectChange={(index) => {
              setSetIndex(index);
              setQuestionIndex(0);
            }}
            onQuestionChange={setQuestionIndex}
            onAnswer={(answer) =>
              current &&
              setAnswers((prior) => ({ ...prior, [current._id]: answer }))
            }
            onPrevious={() => {
              if (questionIndex) setQuestionIndex(questionIndex - 1);
              else if (setIndex) {
                setSetIndex(setIndex - 1);
                setQuestionIndex(
                  (questionsBySet[selected[setIndex - 1]] || []).length - 1,
                );
              }
            }}
            onNext={() => {
              if (questionIndex < activeQuestions.length - 1)
                setQuestionIndex(questionIndex + 1);
              else if (setIndex < selected.length - 1) {
                setSetIndex(setIndex + 1);
                setQuestionIndex(0);
              }
            }}
          />
        </>
      )}
      {(phase === "submitting" || phase === "submission-error") && <main className="mx-auto max-w-2xl px-4 py-12">
        <section className="rounded-xl bg-white p-8 text-center shadow-sm" aria-live="polite">
          <h1 className="text-2xl font-black">{phase === "submitting" ? "Submitting your test…" : "Your test is locked for submission"}</h1>
          {submissionReason && <p className="mt-4 text-sm">{submissionReason === "focus" ? "You left the exam tab or window. Your answers have been locked for automatic submission." : "Time is up. Your answers have been locked for submission."}</p>}
          {phase === "submission-error" && <><p className="mt-4 text-sm">Your answers are saved on this page. Retry submitting to complete your test.</p><button type="button" onClick={() => void submit()} className="mt-6 rounded-md bg-[#0d3b2e] px-6 py-3 text-sm font-bold text-white">Retry submission</button></>}
        </section>
      </main>}
      {phase === "exam" && showSubmitConfirmation && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <section role="dialog" aria-modal="true" aria-labelledby="public-submit-title" className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
          <h2 id="public-submit-title" className="text-lg font-bold">Submit exam?</h2>
          <p className="mt-3 text-sm text-[#64726a]">You have answered {Object.keys(answers).length} of {totalQuestions} questions.</p>
          <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setShowSubmitConfirmation(false)} className="rounded-md border border-[#c9d8cf] px-4 py-2 text-sm font-bold">Keep working</button><button type="button" onClick={() => void submit()} className="rounded-md bg-[#0d3b2e] px-4 py-2 text-sm font-bold text-white">Submit now</button></div>
        </section>
      </div>}
      {phase === "result" && result && (
        <main className="mx-auto max-w-2xl px-4 py-12">
          <section className="rounded-xl bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-black">Test complete</h1>
            <p className="mt-5 text-4xl font-black text-[#0d3b2e]">
              {result.percentage}%
            </p>
            <p className="mt-2 text-sm">
              This attempt: {result.score}/{result.totalPoints} points
            </p>
            {mode === "mock" && gradedResult && (
              <p className="mt-4 rounded-lg bg-[#edf7f0] p-4 text-sm font-bold">
                {countsForGrade
                  ? "This is your graded first score."
                  : `Your first score remains graded: ${gradedResult.score}/${gradedResult.totalPoints} (${gradedResult.percentage}%).`}
              </p>
            )}
          </section>
          <ScoreMeme percentage={result.percentage} />
          <Corrections answers={review} />
          {submissionReason && <p className="mt-5 text-sm">{submissionReason === "focus" ? "Your exam was submitted because you switched tabs or windows." : "Your exam was submitted because time ran out."}</p>}
          {mode === "mock" && !settings.multipleAttempts && <p className="mt-5 text-sm">Retakes are disabled for this mock by the administrator.</p>}
          <button
              type="button"
              onClick={() => {
                setResult(null);
                if (mode === "mock" && !settings.multipleAttempts) {
                  setSelectedMockId("");
                  setSelected([]);
                }
                setPhase("setup");
              }}
              className="mt-7 rounded-md bg-[#0d3b2e] px-5 py-3 text-sm font-bold text-white"
            >
              {mode === "mock" ? settings.multipleAttempts ? "Retake exam" : "Choose another mock" : "Retry topic test"}
            </button>
        </main>
      )}
    </div>
  );
}
