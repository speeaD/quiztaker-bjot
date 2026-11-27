import test from 'node:test';
import assert from 'node:assert/strict';
import { forwardAssignedQuizSubmission, submissionRetryMessage } from '../src/lib/assigned-quiz-submission.ts';

const body = { questionSetOrder: 1, isFinalSubmission: true, answers: [{ questionId: 'question-1', answer: 'Right' }] };
const call = (fetcher, input = body) => forwardAssignedQuizSubmission('https://backend.example/api/', 'student-token', 'quiz-id', input, fetcher);

test('forwards answers unchanged and preserves a previously committed result on retry', async () => {
  const result = await call(async (url, request) => {
    assert.equal(url, 'https://backend.example/api/quiztaker/quiz/quiz-id/submit');
    assert.equal(request.headers.Authorization, 'Bearer student-token');
    assert.deepEqual(JSON.parse(request.body), body);
    assert.equal(request.cache, 'no-store');
    return Response.json({ success: true, submission: { submissionId: 'saved-result', alreadySubmitted: true } });
  });
  assert.equal(result.status, 200);
  assert.equal(result.data.submissionId, 'saved-result');
  assert.equal(result.data.submission.alreadySubmitted, true);
});

test('database, transport, and malformed backend failures show a retry message instead of leaking internals', async () => {
  for (const fetcher of [
    async () => Response.json({ message: 'Invalid prisma.submissionAnswer.create() invocation: Transaction not found' }, { status: 500 }),
    async () => new Response('Database failure', { status: 502 }),
    async () => { throw new Error('Connection terminated'); },
    async () => new Response('<html>Unexpected backend response</html>'),
  ]) {
    const result = await call(fetcher);
    assert.equal(result.status, 503);
    assert.equal(result.data.error, submissionRetryMessage);
    assert.doesNotMatch(JSON.stringify(result.data), /prisma|Transaction not found|Connection terminated/);
  }
  assert.deepEqual(body.answers, [{ questionId: 'question-1', answer: 'Right' }]);
});

test('malformed submission payloads do not reach the backend', async () => {
  for (const input of [null, {}, { ...body, questionSetOrder: '1' }, { ...body, isFinalSubmission: 'false' }]) {
    assert.equal((await call(() => assert.fail('Invalid request was forwarded'), input)).status, 400);
  }
});

test('authorization and validation failures keep their status and user-facing explanation', async () => {
  const result = await call(async () => Response.json({ message: 'This quiz is not assigned to you' }, { status: 403 }));
  assert.equal(result.status, 403);
  assert.equal(result.data.error, 'This quiz is not assigned to you');
});
