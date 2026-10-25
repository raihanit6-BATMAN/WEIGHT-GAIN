/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert';
import { parseBanglishMealInput } from './banglishParser';

test('parses "2 ta singara ar 1 cup dudh cha" correctly', () => {
  const result = parseBanglishMealInput('2 ta singara ar 1 cup dudh cha');
  assert.strictEqual(result.segments.length, 2);

  const singara = result.segments[0];
  assert.strictEqual(singara.quantity, 2);
  assert.strictEqual(singara.calories, 320); // 160 * 2

  const tea = result.segments[1];
  assert.strictEqual(tea.quantity, 1);
  assert.strictEqual(tea.calories, 90);

  assert.strictEqual(result.totalCalories, 410);
});

test('parses "1 bati ghon dal ar 1 plate bhaat" correctly', () => {
  const result = parseBanglishMealInput('1 bati ghon dal ar 1 plate bhaat');
  assert.strictEqual(result.segments.length, 2);

  const dal = result.segments[0];
  assert.strictEqual(dal.foodId, 'ghon-bhuna-dal');
  assert.strictEqual(dal.calories, 175);

  const rice = result.segments[1];
  assert.strictEqual(rice.foodId, 'bhaat-white-rice');
  assert.strictEqual(rice.calories, 260);

  assert.strictEqual(result.totalCalories, 435);
  assert.strictEqual(result.suggestedMealType, 'lunch');
});

test('parses "3 ta somosa" correctly', () => {
  const result = parseBanglishMealInput('3 ta somosa');
  assert.strictEqual(result.segments.length, 1);
  assert.strictEqual(result.segments[0].foodId, 'somosa-hot');
  assert.strictEqual(result.segments[0].quantity, 3);
  assert.strictEqual(result.segments[0].calories, 450); // 150 * 3
});

test('parses quick guesser phrases like "halka nasta" and "heavy outside meal"', () => {
  const light = parseBanglishMealInput('halka nasta');
  assert.strictEqual(light.totalCalories, 150);

  const heavy = parseBanglishMealInput('heavy outside meal');
  assert.strictEqual(heavy.totalCalories, 650);
});
