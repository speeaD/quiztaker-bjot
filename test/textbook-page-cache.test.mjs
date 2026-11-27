import test from 'node:test';
import assert from 'node:assert/strict';
import { TextbookPageCache, TextbookPageError } from '../src/lib/textbook-page-cache.ts';

const tick = () => new Promise((resolve) => setImmediate(resolve));
async function until(check) {
  for (let count = 0; count < 200; count++) { if (check()) return; await new Promise((resolve) => setTimeout(resolve, 5)); }
  assert.fail('Reader operation did not finish');
}
function setup(options = {}) {
  const requests = [], revoked = [], denied = [];
  let nextUrl = 0;
  const cache = new TextbookPageCache({
    pageCount: 12, fetchPage: async (page) => { requests.push(page); return new Blob([`Page ${page}`]); },
    onAccessDenied: (error) => denied.push(error), createUrl: () => `blob:page-${++nextUrl}`,
    revokeUrl: (url) => revoked.push(url), retryDelayMs: 0, ...options,
  });
  return { cache, requests, revoked, denied };
}

test('prepares the whole book in the background and revisiting pages makes no additional requests', async () => {
  const reader = setup();
  reader.cache.start();
  await until(() => reader.cache.getSnapshot(12).status === 'ready');
  assert.deepEqual(reader.requests, Array.from({ length: 12 }, (_, index) => index + 1));
  const first = reader.cache.getSnapshot(1);
  reader.cache.prepareAround(8); reader.cache.prepareAround(1);
  const release = reader.cache.pin(1);
  await tick();
  assert.equal(reader.requests.length, 12);
  assert.strictEqual(reader.cache.getSnapshot(1), first);
  release(); reader.cache.dispose();
  assert.equal(reader.revoked.length, 12);
});

test('jumping to a distant page takes priority without duplicate concurrent page requests', async () => {
  const pending = [], requests = [];
  const reader = setup({ pageCount: 40, fetchPage: (page) => {
    requests.push(page); return new Promise((resolve) => pending.push(() => resolve(new Blob(['image']))));
  } });
  reader.cache.start();
  assert.deepEqual(requests, [1]);
  reader.cache.prepareAround(30); reader.cache.pin(30); reader.cache.prepareAround(30);
  pending.shift()();
  await until(() => requests.length === 2);
  assert.deepEqual(requests, [1, 30]);
  pending.shift()();
  await until(() => requests.length === 3);
  assert.equal(requests[2], 31);
  reader.cache.dispose();
  pending.shift()(); await tick();
  assert.equal(requests.filter((page) => page === 30).length, 1);
});

test('a temporary busy renderer retries, then prepares a page instead of leaving a permanent spinner', async () => {
  let attempts = 0;
  const reader = setup({ pageCount: 1, fetchPage: async () => {
    if (++attempts < 3) throw new TextbookPageError('Busy', 503);
    return new Blob(['image']);
  } });
  reader.cache.start();
  await until(() => reader.cache.getSnapshot(1).status === 'ready');
  assert.equal(reader.cache.getSnapshot(1).status, 'ready');
  assert.equal(attempts, 3); reader.cache.dispose();
});

test('a failed page can be retried while other pages remain available', async () => {
  let broken = true;
  const reader = setup({ pageCount: 2, fetchPage: async (page) => {
    if (page === 1 && broken) throw new TextbookPageError('Bad image', 422);
    return new Blob(['image']);
  } });
  reader.cache.start();
  await until(() => reader.cache.getSnapshot(2).status === 'ready');
  const second = reader.cache.getSnapshot(2);
  assert.equal(reader.cache.getSnapshot(1).status, 'error');
  broken = false; reader.cache.retry(1);
  await until(() => reader.cache.getSnapshot(1).status === 'ready');
  assert.strictEqual(reader.cache.getSnapshot(2), second); reader.cache.dispose();
});

test('loss of eligibility clears prepared pages and stops background requests immediately', async () => {
  const requests = [];
  const reader = setup({ fetchPage: async (page) => {
    requests.push(page);
    if (page === 3) throw new TextbookPageError('Upgrade required', 403, 'PRO_REQUIRED');
    return new Blob(['image']);
  } });
  reader.cache.start();
  await until(() => reader.denied.length === 1);
  assert.deepEqual(requests, [1, 2, 3]);
  assert.equal(reader.cache.getSnapshot(1).status, 'idle');
  assert.equal(reader.revoked.length, 2);
  reader.cache.prepareAround(4); await tick();
  assert.equal(requests.length, 3); reader.cache.dispose();
});

test('closing a reader aborts an active request and releases every retained URL', async () => {
  let signal, resolvePage;
  const reader = setup({ pageCount: 1, fetchPage: (_page, activeSignal) => {
    signal = activeSignal; return new Promise((resolve) => { resolvePage = resolve; });
  } });
  reader.cache.start(); reader.cache.dispose();
  assert.equal(signal.aborted, true);
  resolvePage(new Blob(['image'])); await tick();
  assert.equal(reader.cache.getSnapshot(1).status, 'idle');
  assert.equal(reader.revoked.length, 0);
});

test('large books have a bounded image cache and visible pages remain pinned', async () => {
  const reader = setup({ pageCount: 30, maximumBytes: 16, fetchPage: async (page) => {
    reader.requests.push(page); return new Blob(['1234']);
  } });
  const release = reader.cache.pin(1);
  reader.cache.start();
  await until(() => reader.cache.getSnapshot(6).status === 'ready');
  await tick();
  const ready = Array.from({ length: 30 }, (_, index) => reader.cache.getSnapshot(index + 1)).filter((state) => state.status === 'ready');
  assert.ok(ready.length <= 4);
  assert.equal(reader.cache.getSnapshot(1).status, 'ready');
  assert.ok(reader.requests.length <= 7, 'memory pressure must not repeatedly re-fetch the whole book');
  release(); reader.cache.dispose();
});
