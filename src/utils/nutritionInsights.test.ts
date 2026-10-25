import test from 'node:test';
import assert from 'node:assert/strict';
import { getDailyNutritionInsight } from './nutritionInsights';
import { BANGLADESHI_FOODS } from '../data/bangladeshiFoods';

test('suggests eggs when protein deficit is high (>25g)', () => {
  const insight = getDailyNutritionInsight(
    BANGLADESHI_FOODS,
    1200, // calories remaining
    45,   // protein remaining (high deficit)
    100,  // carbs remaining
    30    // fat remaining
  );

  assert.ok(insight.suggestedFood.id.includes('dim'));
  assert.ok(insight.suggestedPortionEn.includes('eggs'));
  assert.ok(insight.proteinAdded > 10);
});

test('suggests peanuts when calories and fats are the main deficit', () => {
  const insight = getDailyNutritionInsight(
    BANGLADESHI_FOODS,
    800,  // calories remaining (>500)
    10,   // protein remaining (low deficit)
    30,   // carbs remaining
    35    // fat remaining (>20)
  );

  assert.equal(insight.suggestedFood.id, 'chini-badam-roasted');
  assert.ok(insight.suggestedPortionEn.includes('peanuts'));
  assert.ok(insight.caloriesAdded >= 280);
});

test('suggests bananas when carbs deficit is prominent', () => {
  const insight = getDailyNutritionInsight(
    BANGLADESHI_FOODS,
    400, // calories remaining
    8,   // protein remaining
    120, // carbs remaining (>60)
    10   // fat remaining
  );

  assert.equal(insight.suggestedFood.id, 'kola-sagor-shobri');
  assert.ok(insight.suggestedPortionEn.includes('bananas'));
});
