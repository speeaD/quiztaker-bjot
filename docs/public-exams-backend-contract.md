# Public exams

The student pages `/free-mock` and `/topic-test?topicId=<topic UUID>` use the backend's unauthenticated `/api/public-exams` endpoints through the Next.js proxy at `/api/public-exams`. They use live PostgreSQL data and never expose correct answers in the question response.

## Free mock

Admins create a four-subject quiz with `isOpenQuiz: true`, `isActive: true`, and results enabled. All four subject snapshots must contain auto-gradable questions. Students choose a listed exam and enter their name and email. The backend starts that exam, including when several exams share the same subjects.

- `GET /question-sets` lists subjects, available four-subject combinations, and `mocks` with each exam's ID, title, subject IDs, question count, and duration.
- `POST /mock/sessions` takes `name`, `email`, `quizId`, and the exam's four distinct `questionSetIds`. It returns a session ID, duration, and questions grouped by subject. Older clients may omit `quizId` and receive the newest matching exam.
- `POST /mock/sessions/:id/submit` takes `{ "answers": [{ "questionId": "...", "answer": "..." }] }`. It returns the attempt score, the first graded score for that normalized email and quiz, and `countsForGrade`.

The new public mock tables require the `20260924000000_add_public_mock_sessions` migration before these routes can serve live attempts. Submitting the same session again returns its original attempt. A different session can be used for practice, but the first completed score for that quiz and email remains the graded score.

The older `/api/public/quiz` endpoints now read PostgreSQL quiz snapshots and use the same public mock tables for submissions. MongoDB remains in use by unrelated backend routes.

## Topic tests

Admins create a topic under a question set and add questions through the existing topic endpoints. Topic responses include `studentPath`, for example `/topic-test?topicId=<topic UUID>`. Append this path to the student site's origin for a YouTube description or end-screen link. Active topics in active question sets are available; archived and essay questions are excluded.

- `GET /topic/questions?topicId=<id>` returns the topic, subject, and questions without correct answers.
- `POST /topic/submit` takes `topicId` and an `answers` array and returns the server-graded score.

The older `questionSetId` plus topic name link format is also accepted for existing links. Topic tests are anonymous and do not create a premium account or save a result history.
