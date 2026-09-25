# Public exams backend contract

The Next.js routes under `/api/public-exams` forward to `${BACKEND_URL}/public-exams`. The backend must provide these unauthenticated endpoints before the new pages can serve real exams.

Until then, `/free-mock` and `/topic-test?questionSetId=demo-mathematics&topic=Algebra` offer sample previews. Preview results are calculated in the browser and are never stored or graded. Sample topic questions illustrate the page layout; they are not filtered from the real question bank.

| Endpoint | Request | Response |
| --- | --- | --- |
| `GET /question-sets` | None | `{ "questionSets": [{ "_id", "title", "questionCount", "totalPoints" }] }` |
| `POST /mock/sessions` | `{ "name", "email", "questionSetIds": [four distinct IDs] }` | `{ "session": { "id", "questionsBySet": { "setId": [questions] } } }` |
| `POST /mock/sessions/:id/submit` | `{ "answers": [{ "questionId", "answer" }] }` | `{ "attempt": result, "gradedResult": result, "countsForGrade": boolean }` |
| `GET /topic/questions?questionSetId=...&topic=...` | Query parameters | `{ "questionSet": questionSet, "questions": [questions] }` |
| `POST /topic/submit` | `{ "questionSetId", "topic", "answers": [{ "questionId", "answer" }] }` | `{ "result": result }` |

`result` has numeric `score`, `totalPoints`, and `percentage`. A question has `_id`, `question`, `options`, `points`, `order`, and `type`. Public question responses must omit correct answers. The backend validates the selected sets and email, owns the question selection and grading, and records the first completed mock score atomically per normalized email and mock identifier. Later submissions produce a new `attempt` but retain the original `gradedResult`. Submission must be idempotent for a session, and the server must reject answers for questions outside that session or topic.

The public endpoints must never create an authenticated premium session or return premium content. They should apply rate limiting and input limits. The frontend cannot enforce the first-score rule or protect premium access on its own.
