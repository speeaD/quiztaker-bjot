import test from 'node:test';
import assert from 'node:assert/strict';
import { watchExamFocus } from '../src/lib/exam-focus.ts';

function setup(hidden = false) {
  const page = Object.assign(new EventTarget(), { hidden });
  const browser = new EventTarget();
  let submissions = 0;
  const stop = watchExamFocus(() => { submissions++; }, page, browser);
  return { page, browser, stop, submissions: () => submissions };
}

test('even a brief tab switch submits immediately and returning cannot cancel it', () => {
  const exam = setup();
  exam.page.hidden = true;
  exam.page.dispatchEvent(new Event('visibilitychange'));
  assert.equal(exam.submissions(), 1);
  exam.page.hidden = false;
  exam.page.dispatchEvent(new Event('visibilitychange'));
  assert.equal(exam.submissions(), 1);
  exam.stop();
});

test('switching windows submits while the exam tab remains visible', () => {
  const exam = setup();
  exam.browser.dispatchEvent(new Event('blur'));
  assert.equal(exam.page.hidden, false);
  assert.equal(exam.submissions(), 1);
  exam.stop();
});

test('overlapping blur and visibility events submit only once', () => {
  const exam = setup();
  exam.browser.dispatchEvent(new Event('blur'));
  exam.page.hidden = true;
  exam.page.dispatchEvent(new Event('visibilitychange'));
  exam.browser.dispatchEvent(new Event('blur'));
  assert.equal(exam.submissions(), 1);
  exam.stop();
});

test('visible-page events and controls inside the exam do not submit', () => {
  const exam = setup();
  exam.page.dispatchEvent(new Event('visibilitychange'));
  exam.page.dispatchEvent(new Event('click'));
  exam.browser.dispatchEvent(new Event('focus'));
  assert.equal(exam.submissions(), 0);
  exam.stop();
});

test('cleanup disables both listeners after the exam ends', () => {
  const exam = setup();
  exam.stop();
  exam.page.hidden = true;
  exam.page.dispatchEvent(new Event('visibilitychange'));
  exam.browser.dispatchEvent(new Event('blur'));
  assert.equal(exam.submissions(), 0);
});

test('an exam that finishes loading in a hidden tab submits immediately', () => {
  const exam = setup(true);
  assert.equal(exam.submissions(), 1);
  exam.stop();
});
