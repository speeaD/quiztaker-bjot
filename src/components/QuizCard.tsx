import { AssignedQuiz, Duration, QuizStatus } from "@/types/global";

const statusConfig: Record<QuizStatus, { label: string; className: string }> = {
  pending: {
    label: "Not Started",
    className: "bg-[hsl(var(--status-pending-bg))] text-[hsl(var(--status-pending))]",
  },
  "in-progress": {
    label: "In Progress",
    className: "bg-[hsl(var(--status-progress-bg))] text-[hsl(var(--status-progress))]",
  },
  completed: {
    label: "Completed",
    className: "bg-[hsl(var(--status-completed-bg))] text-[hsl(var(--status-completed))]",
  },
};

const QuizCard: React.FC<AssignedQuiz & { startQuiz: () => void } & { viewResults: () => void }> = ({
  status,
  quizId,
  assignedAt,
  submissionId,
  startQuiz,
  viewResults
}) => {
  console.log(quizId);
  const statusStyle = statusConfig[status];
  const isCompleted = status === "completed";

  const formatDuration = (duration: Duration): string => {
    const parts: string[] = [];
    if (duration.hours > 0) parts.push(`${duration.hours}h`);
    if (duration.minutes > 0) parts.push(`${duration.minutes}m`);
    if (duration.seconds > 0) parts.push(`${duration.seconds}s`);
    return parts.join(' ');
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-[hsl(var(--card))] rounded-xl p-6 shadow-[var(--shadow-card-hover)] transition-all duration-200 border border-transparent hover:border-[hsl(var(--primary))] hover:border-opacity-20">
      <div className="flex items-center justify-between gap-6">
        {/* Quiz Info - Left aligned */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[hsl(var(--foreground))] text-base mb-1">
            {quizId.settings.title}
          </h3>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {quizId.settings.isQuizChallenge ? "Challenge" : "Mock Exam"}
          </p>
        </div>

        {/* Duration */}
        <div className="text-sm min-w-[80px]">
          <p className="text-[hsl(var(--muted-foreground))] mb-1">Duration</p>
          <p className="font-medium text-[hsl(var(--foreground))]">
            {formatDuration(quizId.settings.duration)}
          </p>
        </div>

        {/* Assigned Date */}
        <div className="text-sm min-w-[100px]">
          <p className="text-[hsl(var(--muted-foreground))] mb-1">Assigned</p>
          <p className="font-medium text-[hsl(var(--foreground))]">
            {formatDate(assignedAt)}
          </p>
        </div>

        {/* Status Badge */}
        <div className="min-w-[110px] flex justify-center">
          <span
            className={`inline-block px-4 py-1.5 rounded-full text-xs font-medium ${statusStyle.className}`}
          >
            {statusStyle.label}
          </span>
        </div>

        {/* Score */}
        <div className="min-w-[80px] text-center">
          {isCompleted && submissionId ? (
            <div>
              <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                {submissionId.score}/{submissionId.totalPoints}
              </p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                ({submissionId.percentage}%)
              </p>
            </div>
          ) : (
            <span className="text-sm text-[hsl(var(--muted-foreground))]">—</span>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={isCompleted ? viewResults : startQuiz}
          className="min-w-[120px] px-4 py-2.5 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg font-medium hover:opacity-90 transition-opacity duration-200"
        >
          {isCompleted ? "View Results" : "Start Quiz"}
        </button>
      </div>
    </div>
  );
};

export default QuizCard;