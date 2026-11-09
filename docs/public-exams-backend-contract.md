# Public exams

The student pages `/free-mock` and `/topic-test?topicId=<topic UUID>` use the backend's unauthenticated `/api/public-exams` endpoints through the Next.js proxy at `/api/public-exams`. They use live PostgreSQL data and never expose correct answers in the question response.

## Free mock

Admins create a four-subject quiz with `isOpenQuiz: true`, `isActive: true`, and results enabled. All four subject snapshots must contain auto-gradable questions. Students choose a listed exam and enter their name and email. The backend starts that exam, including when several exams share the same subjects.

- `GET /question-sets` lists subjects, available four-subject combinations, and `mocks` with each exam's ID, title, subject IDs, question count, duration, `multipleAttempts`, and `looseFocus`. It also establishes a signed `bjot_public_mock_device` cookie (HttpOnly, SameSite=Lax, Secure in production, one-year lifetime).
- `POST /mock/sessions` takes `name`, `email`, `quizId`, and the exam's four distinct `questionSetIds`. It returns a session ID, duration, server-calculated `remainingSeconds`, saved `questionSetIds`, `multipleAttempts`, `looseFocus`, and shuffled questions grouped by subject. An unfinished session for the same normalized email and quiz is resumed with its original subjects, question order, and countdown. Older clients may omit `quizId` and receive the newest matching exam.
- `POST /mock/sessions/:id/submit` takes `{ "answers": [{ "questionId": "...", "answer": "..." }] }`. It returns the attempt score, the first graded score for that normalized email and quiz, and `countsForGrade`.

The public mock tables require the `20260924000000_add_public_mock_sessions` migration before these routes can serve live attempts. Submitting the same session again from its starting browser returns its original attempt. Further attempts require the admin's `multipleAttempts` setting; otherwise completion blocks both the normalized email and the browser device for that quiz. Changing email on the same device returns 403. This also applies to the older public submission endpoint. The first completed score for that normalized email and quiz remains the graded score when retakes are allowed. Starts and submissions share database advisory locks for the email and device, preventing concurrent requests from bypassing the setting while allowing independent students to proceed together. A shared quiz row lock protects the paper from concurrent admin edits. Public write transactions allow 10 seconds to acquire a connection and 20 seconds to execute; temporary transaction/pool failures return 503 with a retry message for the error dialog. Question formatting and review happen after commit. The transaction timeout fix requires only a backend deployment, with no additional migration.

All public mock starts and submissions require the signed device cookie; a missing or invalid cookie returns 428 with instructions to allow cookies and reload the exam page. Device IDs supplied in request bodies or headers are ignored. The Next.js proxy forwards only the device cookie to the backend and relays device `Set-Cookie` responses; authentication cookies stay on the portal. The backend signs device cookies with its existing `JWT_SECRET` and stores only a SHA-256 device hash in the session. Topic tests do not require device identity.

One browser can have only one unfinished attempt for a mock. It must resume with the original email; another browser cannot resume or submit that attempt. Device identity is specific to a browser profile/site, so a different browser, private session, cleared cookies, cookie expiration, or signing-secret rotation can establish a new identity. This is a browser-device restriction, not hardware identification, and it does not block everyone sharing an IP address. Existing sessions cannot be linked retroactively to hardware; an old session is bound to a device when it is next resumed or submitted.

The public exam screen submits immediately on tab/window focus loss when `looseFocus` is false. Answers stay locked if submission fails, with a retry action. Manual confirmation happens inside the page so it cannot cause a false focus loss. The completed screen offers a retake only when enabled. Question order is derived from the public session ID (or assignment and start time for assigned exams); refreshes retain that attempt's order, and a permitted retake gets another permutation. Grading continues to use question IDs.

For device enforcement, apply `20261108000000_public_mock_devices` with `npx prisma migrate deploy` and regenerate the backend Prisma client. Deploy the student portal cookie proxy before the backend so forwarding is already active when starts/submissions begin requiring the cookie. The proxy remains compatible with the preceding backend. The migration adds a nullable device hash and an index; it preserves existing sessions and scores.

The older `/api/public/quiz` endpoints now read PostgreSQL quiz snapshots and use the same public mock tables for submissions. MongoDB remains in use by unrelated backend routes.

## Topic tests

Admins create a topic under a question set and add questions through the existing topic endpoints. Topic responses include `studentPath`, for example `/topic-test?topicId=<topic UUID>`. Append this path to the student site's origin for a YouTube description or end-screen link. Active topics in active question sets are available; archived and essay questions are excluded.

- `GET /topic/questions?topicId=<id>` returns the topic, subject, and questions without correct answers.
- `POST /topic/submit` takes `topicId` and an `answers` array and returns the server-graded score.

The older `questionSetId` plus topic name link format is also accepted for existing links. Topic tests are anonymous and do not create a premium account or save a result history.
