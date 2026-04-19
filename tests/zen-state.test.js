// @ts-check
const test = require('node:test');
const assert = require('node:assert/strict');
const { tweetIdFromUrl, shouldClearZenState } = require('../zen-state');

test('tweetIdFromUrl: /status/<id>', () => {
  assert.equal(
    tweetIdFromUrl('https://x.com/foo/status/123456789'),
    '123456789'
  );
});

test('tweetIdFromUrl: /article/<id>', () => {
  assert.equal(
    tweetIdFromUrl('https://x.com/foo/article/2044692412061425748'),
    '2044692412061425748'
  );
});

test('tweetIdFromUrl: /article/<id>/media/<mediaId> — keeps tweet id, ignores media id', () => {
  assert.equal(
    tweetIdFromUrl('https://x.com/foo/article/2044692412061425748/media/2043948731511246848'),
    '2044692412061425748'
  );
});

test('tweetIdFromUrl: /status/<id>/photo/1', () => {
  assert.equal(
    tweetIdFromUrl('https://x.com/foo/status/123/photo/1'),
    '123'
  );
});

test('tweetIdFromUrl: x.com home / profile — null', () => {
  assert.equal(tweetIdFromUrl('https://x.com/'), null);
  assert.equal(tweetIdFromUrl('https://x.com/foo'), null);
  assert.equal(tweetIdFromUrl('https://x.com/explore'), null);
});

test('tweetIdFromUrl: non-x.com — null', () => {
  assert.equal(tweetIdFromUrl('https://twitter.com/foo/status/123'), null);
  assert.equal(tweetIdFromUrl('https://example.com/status/123'), null);
});

test('tweetIdFromUrl: invalid URL — null', () => {
  assert.equal(tweetIdFromUrl('not a url'), null);
  assert.equal(tweetIdFromUrl(''), null);
  assert.equal(tweetIdFromUrl(undefined), null);
});

test('shouldClearZenState: no url change → keep', () => {
  assert.equal(shouldClearZenState('123', undefined), false);
  assert.equal(shouldClearZenState('123', null), false);
  assert.equal(shouldClearZenState('123', ''), false);
});

test('shouldClearZenState: same tweet, /status/ → keep', () => {
  assert.equal(
    shouldClearZenState('123', 'https://x.com/foo/status/123'),
    false
  );
});

test('shouldClearZenState: same tweet, lightbox URL → keep (regression: SPA nav must not clear state)', () => {
  assert.equal(
    shouldClearZenState('123', 'https://x.com/foo/article/123/media/456'),
    false
  );
});

test('shouldClearZenState: same tweet, photo URL → keep', () => {
  assert.equal(
    shouldClearZenState('123', 'https://x.com/foo/status/123/photo/1'),
    false
  );
});

test('shouldClearZenState: different tweet → clear', () => {
  assert.equal(
    shouldClearZenState('123', 'https://x.com/foo/status/456'),
    true
  );
});

test('shouldClearZenState: navigated away from x.com tweets → clear', () => {
  assert.equal(
    shouldClearZenState('123', 'https://x.com/home'),
    true
  );
  assert.equal(
    shouldClearZenState('123', 'https://google.com'),
    true
  );
});
