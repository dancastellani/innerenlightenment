import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dayKey, fillPlan } from './plan.ts';

const ids = Array.from({ length: 724 }, (_, i) => i + 1);
const today = new Date(2026, 9, 16, 12, 0);

test('UC-01.1: fills today and the next 14 days', () => {
  const plan = fillPlan({}, ids, today);
  assert.equal(Object.keys(plan).length, 15);
  assert.ok(plan['2026-10-16'] && plan['2026-10-30']);
});

test('UC-01.4: topping up keeps existing days and adds one message per new day', () => {
  const first = fillPlan({}, ids, today);
  const later = fillPlan(first, ids, new Date(2026, 9, 25, 12, 0));
  for (const day of Object.keys(first).filter((day) => day >= '2026-10-25')) assert.equal(later[day], first[day]);
  assert.equal(Object.keys(later).length, 15);
});

test('UC-01.5: days before today are forgotten, today is kept', () => {
  const plan = fillPlan({ '2026-10-15': 5, '2026-10-16': 7 }, ids, today);
  assert.equal(plan['2026-10-15'], undefined);
  assert.equal(plan['2026-10-16'], 7);
});

test('UC-01.5 boundary: picks stay within the messages at both ends of the random range', () => {
  assert.equal(fillPlan({}, ids, today, 14, () => 0)['2026-10-16'], 1);
  assert.equal(fillPlan({}, ids, today, 14, () => 0.9999)['2026-10-16'], 724);
});

test('UC-01.13: a day whose message is no longer in the content gets another one', () => {
  const plan = fillPlan({ '2026-10-16': 999, '2026-10-17': 7 }, ids, today, 14, () => 0);
  assert.equal(plan['2026-10-16'], 1);
  assert.equal(plan['2026-10-17'], 7);
});

test('UC-01.13 boundary: the first and last ids are still in the content and kept', () => {
  const plan = fillPlan({ '2026-10-16': 1, '2026-10-17': 724, '2026-10-18': 725 }, ids, today, 14, () => 0.5);
  assert.deepEqual([plan['2026-10-16'], plan['2026-10-17'], plan['2026-10-18']], [1, 724, 363]);
});

test('dayKey uses local date', () => {
  assert.equal(dayKey(new Date(2026, 0, 5, 23, 59)), '2026-01-05');
});
