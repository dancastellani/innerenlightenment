import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addAnother, dayKey, fillPlan } from './plan.ts';

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
  for (const day of Object.keys(first)) assert.equal(later[day], first[day]);
  assert.equal(Object.keys(later).length, 15 + 9);
});

test('UC-01.5: no repeats within the plan, and days older than 90 days are forgotten', () => {
  const plan = fillPlan({ '2026-07-01': 5, '2026-09-01': 7 }, ids, today);
  const values = Object.values(plan);
  assert.equal(new Set(values).size, values.length);
  assert.equal(plan['2026-07-01'], undefined);
  assert.equal(plan['2026-09-01'], 7);
});

test('dayKey uses local date', () => {
  assert.equal(dayKey(new Date(2026, 0, 5, 23, 59)), '2026-01-05');
});

test('UC-04.1, UC-04.2: another message is new and is remembered so it does not repeat', () => {
  const plan = fillPlan({}, ids, today);
  const [after, id] = addAnother(plan, ids, today);
  assert.ok(!Object.values(plan).includes(id));
  assert.equal(after['2026-10-16 +1'], id);
  const [, next] = addAnother(after, ids, today);
  assert.notEqual(next, id);
});

test('UC-04.3: once every message was shown in the last 90 days, messages start repeating', () => {
  let plan = fillPlan({}, ids, today);
  while (Object.keys(plan).length < ids.length) plan = addAnother(plan, ids, today)[0];
  const [, id] = addAnother(plan, ids, today);
  assert.ok(ids.includes(id));
  assert.ok(ids.includes(fillPlan(plan, ids, new Date(2026, 9, 31, 12, 0))['2026-11-14']));
});

test('UC-01.5 boundary: a day exactly 90 days ago is kept, 91 days ago is forgotten', () => {
  const plan = fillPlan({ '2026-07-18': 5, '2026-07-17': 7 }, ids, today);
  assert.equal(plan['2026-07-18'], 5);
  assert.equal(plan['2026-07-17'], undefined);
});

test('UC-04.2 boundary: with one unseen message left, that one is shown', () => {
  let plan = fillPlan({}, ids, today);
  while (Object.keys(plan).length < ids.length - 1) plan = addAnother(plan, ids, today)[0];
  const unseen = ids.find((id) => !Object.values(plan).includes(id));
  assert.equal(addAnother(plan, ids, today)[1], unseen);
});
