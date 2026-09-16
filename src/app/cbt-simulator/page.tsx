"use client";

import CalculatorWidget from "@/components/cbt/CalculatorWidget";
import ExamWorkspace from "@/components/cbt/ExamWorkspace";
import SimulatorHeader from "@/components/cbt/SimulatorHeader";
import SubjectSelection from "@/components/cbt/SubjectSelection";
import { CbtQuestion, CbtQuestionSet } from "@/components/cbt/types";
import { Award, Clock3, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";

const API_BASE_URL = "https://bjot-backend-nine.vercel.app/api";

type Phase = "selection" | "exam" | "result";
interface SubmissionResult {
  score: number;
  totalPoints: number;
  percentage: number;
  timeTaken: number;
}

const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export default function CBTSimulator() {
  const [phase, setPhase] = useState<Phase>("selection");
  const [showCalculator, setShowCalculator] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [availableQuestionSets, setAvailableQuestionSets] = useState<
    CbtQuestionSet[]
  >([]);
  const [selectedQuestionSetIds, setSelectedQuestionSetIds] = useState<
    string[]
  >([]);
  const [sessionId, setSessionId] = useState("");
  const [quizTakerId, setQuizTakerId] = useState("");
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [questionsBySetId, setQuestionsBySetId] = useState<
    Record<string, CbtQuestion[]>
  >({});
  const [currentQuestionSetIndex, setCurrentQuestionSetIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(7200);
  const [submissionResult, setSubmissionResult] =
    useState<SubmissionResult | null>(null);
  const maxSubjects = 4;

  useEffect(() => {
    if (phase === "selection") void fetchQuestionSets();
  }, [phase]);

  useEffect(() => {
    if (phase !== "exam" || timeRemaining <= 0) return;
    const timer = window.setInterval(() => {
      setTimeRemaining((time) => {
        if (time <= 1) {
          void handleSubmit(true);
          return 0;
        }
        return time - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
    // handleSubmit uses current exam state and is intentionally captured for the timer lifecycle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, timeRemaining]);

  const fetchQuestionSets = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`${API_BASE_URL}/cbt/question-sets`);
      const data = await response.json();
      if (!data.success)
        throw new Error(data.message || "Unable to load subjects");
      setAvailableQuestionSets(data.questionSets || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to connect to the server",
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleQuestionSet = (id: string) => {
    setSelectedQuestionSetIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      return current.length < maxSubjects ? [...current, id] : current;
    });
  };

  const getCurrentQuestions = () =>
    questionsBySetId[selectedQuestionSetIds[currentQuestionSetIndex]] || [];
  const getAllQuestions = () =>
    selectedQuestionSetIds.flatMap((id) => questionsBySetId[id] || []);
  const currentQuestion = getCurrentQuestions()[currentQuestionIndex] || null;
  const currentGlobalIndex =
    selectedQuestionSetIds
      .slice(0, currentQuestionSetIndex)
      .reduce((sum, id) => sum + (questionsBySetId[id]?.length || 0), 0) +
    currentQuestionIndex;

  const handleStartExam = async () => {
    if (selectedQuestionSetIds.length !== maxSubjects) return;
    try {
      setLoading(true);
      setError("");
      const email =
        localStorage.getItem("quizTakerEmail") || "student@example.com";
      const sessionResponse = await fetch(`${API_BASE_URL}/cbt/start-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionSetIds: selectedQuestionSetIds, email }),
      });
      const sessionData = await sessionResponse.json();
      if (!sessionData.success)
        throw new Error(sessionData.message || "Unable to start this exam");

      const questionsData: Record<string, CbtQuestion[]> = {};
      for (const id of selectedQuestionSetIds) {
        const response = await fetch(
          `${API_BASE_URL}/cbt/question-set/${id}/questions`,
        );
        const data = await response.json();
        if (!data.success) throw new Error("Unable to prepare exam questions");
        const subject = availableQuestionSets.find((item) => item._id === id);
        const questionLimit = subject?.title.toLowerCase().includes("english")
          ? 60
          : 40;
        questionsData[id] = [...(data.questionSet.questions || [])]
          .sort(() => Math.random() - 0.5)
          .slice(0, questionLimit);
      }

      setSessionId(sessionData.session.sessionId);
      setQuizTakerId(sessionData.session.quizTakerId);
      setStartedAt(new Date(sessionData.session.startedAt));
      setQuestionsBySetId(questionsData);
      setCurrentQuestionSetIndex(0);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setTimeRemaining(7200);
      setPhase("exam");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start the exam");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (isAuto = false) => {
    const questions = getAllQuestions();
    if (
      !isAuto &&
      !window.confirm(
        `Submit ${Object.keys(answers).length}/${questions.length} answered questions?`,
      )
    )
      return;
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/cbt/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          quizTakerId,
          questionSetIds: selectedQuestionSetIds,
          answers: Object.entries(answers).map(([questionId, answer]) => ({
            questionId,
            answer,
          })),
          startedAt: startedAt?.toISOString(),
        }),
      });
      const data = await response.json();
      if (!data.success)
        throw new Error(data.message || "Unable to submit this exam");
      setSubmissionResult(data.submission);
      setPhase("result");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to submit the exam",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    const questions = getCurrentQuestions();
    if (currentQuestionIndex < questions.length - 1)
      setCurrentQuestionIndex((index) => index + 1);
    else if (currentQuestionSetIndex < selectedQuestionSetIds.length - 1) {
      setCurrentQuestionSetIndex((index) => index + 1);
      setCurrentQuestionIndex(0);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex((index) => index - 1);
    else if (currentQuestionSetIndex > 0) {
      const previousSetId = selectedQuestionSetIds[currentQuestionSetIndex - 1];
      setCurrentQuestionSetIndex((index) => index - 1);
      setCurrentQuestionIndex(
        Math.max(0, (questionsBySetId[previousSetId] || []).length - 1),
      );
    }
  };

  if (phase === "selection") {
    return (
      <div className="portal-page">
        <SimulatorHeader mode="setup" />
        {error && (
          <p className="mx-auto mt-4 max-w-6xl rounded-lg border border-[#f3c7b5] bg-[#fff0ec] px-4 py-3 text-xs font-bold text-[#a8451f]">
            {error}
          </p>
        )}
        <SubjectSelection
          questionSets={availableQuestionSets}
          selectedIds={selectedQuestionSetIds}
          maxSubjects={maxSubjects}
          loading={loading}
          onToggle={toggleQuestionSet}
          onStart={() => void handleStartExam()}
        />
      </div>
    );
  }

  if (phase === "result" && submissionResult) {
    const scaledScore = submissionResult.totalPoints
      ? Math.round(
          (submissionResult.score / submissionResult.totalPoints) * 400,
        )
      : 0;
    return (
      <div className="portal-page">
        <SimulatorHeader mode="result" />
        <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
          <section className="rounded-xl border border-[#dce5df] bg-white p-6 text-center shadow-[0_6px_20px_rgba(13,59,46,0.07)] sm:p-10">
            <span className="mx-auto grid size-20 place-items-center rounded-full bg-[#eaf3ed] text-[#15513e]">
              <Award size={34} />
            </span>
            <p className="mt-4 text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#a5660c]">
              CBT simulation complete
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#17231e]">
              {submissionResult.percentage}% score
            </h1>
            <p className="mt-2 text-sm text-[#64726a]">
              You have completed your exam. Review your score and keep
              practising.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {[
                [scaledScore, "Score out of 400"],
                [submissionResult.totalPoints, "Total points"],
                [
                  `${Math.floor(submissionResult.timeTaken / 60)}m`,
                  "Time taken",
                ],
              ].map(([value, label]) => (
                <div
                  key={label as string}
                  className="rounded-lg bg-[#edf3ef] p-4"
                >
                  <strong className="block text-2xl text-[#0d3b2e]">
                    {value}
                  </strong>
                  <small className="text-[11px] text-[#64726a]">{label}</small>
                </div>
              ))}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-7 inline-flex items-center gap-2 rounded-md bg-[#0d3b2e] px-5 py-3 text-sm font-bold text-white hover:bg-[#14513c]"
            >
              <RotateCcw size={16} />
              Take another exam
            </button>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="portal-page">
      <SimulatorHeader
        mode="exam"
        timer={formatTime(timeRemaining)}
        showCalculator={showCalculator}
        onCalculatorToggle={() => setShowCalculator((show) => !show)}
        onSubmit={() => void handleSubmit()}
      />
      <div className="border-b border-[#dce5df] bg-[#edf3ef] px-4 py-2 text-center text-xs font-bold text-[#15513e] sm:hidden">
        <Clock3 className="mr-1 inline size-4" />
        {formatTime(timeRemaining)} remaining
      </div>
      {error && (
        <p className="mx-auto mt-4 max-w-7xl rounded-lg border border-[#f3c7b5] bg-[#fff0ec] px-4 py-3 text-xs font-bold text-[#a8451f]">
          {error}
        </p>
      )}
      <ExamWorkspace
        questionSets={availableQuestionSets}
        selectedIds={selectedQuestionSetIds}
        questionsBySet={questionsBySetId}
        currentSetIndex={currentQuestionSetIndex}
        currentQuestionIndex={currentQuestionIndex}
        answers={answers}
        currentQuestion={currentQuestion}
        currentGlobalIndex={currentGlobalIndex}
        totalQuestions={getAllQuestions().length}
        onSubjectChange={(index) => {
          setCurrentQuestionSetIndex(index);
          setCurrentQuestionIndex(0);
        }}
        onQuestionChange={setCurrentQuestionIndex}
        onAnswer={(answer) =>
          currentQuestion &&
          setAnswers((current) => ({
            ...current,
            [currentQuestion._id]: answer,
          }))
        }
        onPrevious={handlePrevious}
        onNext={handleNext}
      />
      {loading && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-[#0d3b2e]/25 backdrop-blur-[1px]">
          <span className="rounded-lg bg-white px-5 py-4 text-sm font-bold text-[#0d3b2e] shadow-xl">
            Saving your exam…
          </span>
        </div>
      )}
      {showCalculator && (
        <CalculatorWidget onClose={() => setShowCalculator(false)} />
      )}
    </div>
  );
}
