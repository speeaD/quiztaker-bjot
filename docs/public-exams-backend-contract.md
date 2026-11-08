# Public exams

The student pages `/free-mock` and `/topic-test?topicId=<topic UUID>` use the backend's unauthenticated `/api/public-exams` endpoints through the Next.js proxy at `/api/public-exams`. They use live PostgreSQL data and never expose correct answers in the question response.

## Free mock

Admins create a four-subject quiz with `isOpenQuiz: true`, `isActive: true`, and results enabled. All four subject snapshots must contain auto-gradable questions. Students choose a listed exam and enter their name and email. The backend starts that exam, including when several exams share the same subjects.

- `GET /question-sets` lists subjects, available four-subject combinations, and `mocks` with each exam's ID, title, subject IDs, question count, duration, `multipleAttempts`, and `looseFocus`.
- `POST /mock/sessions` takes `name`, `email`, `quizId`, and the exam's four distinct `questionSetIds`. It returns a session ID, duration, server-calculated `remainingSeconds`, saved `questionSetIds`, `multipleAttempts`, `looseFocus`, and shuffled questions grouped by subject. An unfinished session for the same normalized email and quiz is resumed with its original subjects, question order, and countdown. Older clients may omit `quizId` and receive the newest matching exam.
- `POST /mock/sessions/:id/submit` takes `{ "answers": [{ "questionId": "...", "answer": "..." }] }`. It returns the attempt score, the first graded score for that normalized email and quiz, and `countsForGrade`.

The public mock tables require the `20260924000000_add_public_mock_sessions` migration before these routes can serve live attempts. Submitting the same session again returns its original attempt. Further attempts require the admin's `multipleAttempts` setting; otherwise starts and submissions from another session return 403 after completion. This also applies to the older public submission endpoint. The first completed score for that normalized email and quiz remains the graded score when retakes are allowed. Starts and submissions share a database lock to prevent concurrent requests from bypassing the setting.

The public exam screen submits immediately on tab/window focus loss when `looseFocus` is false. Answers stay locked if submission fails, with a retry action. Manual confirmation happens inside the page so it cannot cause a false focus loss. The completed screen offers a retake only when enabled. Question order is derived from the public session ID (or assignment and start time for assigned exams); refreshes retain that attempt's order, and a permitted retake gets another permutation. Grading continues to use question IDs. These settings/order changes need no additional migration; deploy the backend before the student portal.

The older `/api/public/quiz` endpoints now read PostgreSQL quiz snapshots and use the same public mock tables for submissions. MongoDB remains in use by unrelated backend routes.

## Topic tests

Admins create a topic under a question set and add questions through the existing topic endpoints. Topic responses include `studentPath`, for example `/topic-test?topicId=<topic UUID>`. Append this path to the student site's origin for a YouTube description or end-screen link. Active topics in active question sets are available; archived and essay questions are excluded.

- `GET /topic/questions?topicId=<id>` returns the topic, subject, and questions without correct answers.
- `POST /topic/submit` takes `topicId` and an `answers` array and returns the server-graded score.

The older `questionSetId` plus topic name link format is also accepted for existing links. Topic tests are anonymous and do not create a premium account or save a result history.
