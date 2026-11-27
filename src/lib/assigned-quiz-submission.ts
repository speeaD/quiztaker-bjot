export const submissionRetryMessage = "We could not save your exam yet. Keep this page open and retry submission.";

export async function forwardAssignedQuizSubmission(
  base: string | undefined, token: string, quizId: string, body: unknown, fetcher: typeof fetch = fetch,
) {
  const input = body as { answers?: unknown; questionSetOrder?: unknown; isFinalSubmission?: unknown } | null;
  if (!input || !Array.isArray(input.answers) || !Number.isInteger(input.questionSetOrder) ||
    (input.questionSetOrder as number) < 1 || (input.isFinalSubmission !== undefined && typeof input.isFinalSubmission !== "boolean")) {
    return { status: 400, data: { error: "A valid answers array, question set order, and submission flag are required." } };
  }
  if (!base) return { status: 503, data: { error: submissionRetryMessage, code: "SUBMISSION_BUSY" } };
  try {
    const response = await fetcher(`${base.replace(/\/$/, "")}/quiztaker/quiz/${encodeURIComponent(quizId)}/submit`, {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body), cache: "no-store",
    });
    // Older backend deployments may include Prisma internals in their errors.
    if (response.status >= 500) return { status: 503, data: { error: submissionRetryMessage, code: "SUBMISSION_BUSY" } };
    const data = await response.json();
    if (!response.ok) return { status: response.status, data: { error: data.message || "Could not submit this exam.", code: data.code } };
    if (!data.success || !data.submission?.submissionId) throw new Error("Invalid submission response");
    return { status: 200, data: { success: true, submissionId: data.submission.submissionId, submission: data.submission } };
  } catch {
    return { status: 503, data: { error: submissionRetryMessage, code: "SUBMISSION_BUSY" } };
  }
}
