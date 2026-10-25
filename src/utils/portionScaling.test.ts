/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert';
import { DEFAULT_PROFILE } from '../utils/storage';
import { getFoodPortionOptions, calculatePortionNutrition } from '../utils/portionUnits';
import { BANGLADESHI_FOODS } from '../data/bangladeshiFoods';

test('DEFAULT_PROFILE has 3000ml daily hydration target', () => {
  assert.strictEqual(DEFAULT_PROFILE.dailyWaterGoalMl, 3000);
  assert.strictEqual(DEFAULT_PROFILE.dailyWaterGoalGlasses, 12);
});

test('Portion calculations accurately scale discrete items (Dim/Eggs) in pieces', () => {
  const egg = BANGLADESHI_FOODS.find((f) => f.id.includes('dim-poach'))!;
  assert.ok(egg, 'Dim poach should exist');

  const options = getFoodPortionOptions(egg);
  const pieceOption = options.find((o) => o.id === 'piece');
  assert.ok(pieceOption, 'Piece option should be available for eggs');

  // Calculate for 3 eggs
  const calc3Eggs = calculatePortionNutrition(egg, pieceOption, 3);
  // Base is 2 eggs = 200 kcal, so 1 egg is 100 kcal, 3 eggs = 300 kcal
  assert.strictEqual(calc3Eggs.calories, 300);
  assert.strictEqual(calc3Eggs.displayQuantity, '3 pcs');
});

test('Portion calculations accurately scale staples (Bhaat/Rice) in plates and bowls', () => {
  const rice = BANGLADESHI_FOODS.find((f) => f.id.includes('bhaat') || f.id.includes('rice'))!;
  assert.ok(rice, 'Rice should exist');

  const options = getFoodPortionOptions(rice);
  const bowlOption = options.find((o) => o.id === 'bowl');
  assert.ok(bowlOption, 'Bowl option should be available for rice');

  // Calculate 1.5 bowls
  const calcBowl = calculatePortionNutrition(rice, bowlOption, 2);
  assert.ok(calcBowl.calories > 0);
  assert.strictEqual(calcBowl.displayQuantity, '2 bowls');
});
