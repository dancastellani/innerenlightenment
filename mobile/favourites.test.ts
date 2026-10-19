import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toggleFavourite } from './favourites.ts';

test('UC-13.1: a message is added to the end of the favourites', () => {
  assert.deepEqual(toggleFavourite([], 7), [7]);
  assert.deepEqual(toggleFavourite([3, 5], 7), [3, 5, 7]);
});

test('UC-13.3: toggling a favourite removes it, and only it', () => {
  assert.deepEqual(toggleFavourite([3, 7, 5], 7), [3, 5]);
  assert.deepEqual(toggleFavourite([7], 7), []);
});
