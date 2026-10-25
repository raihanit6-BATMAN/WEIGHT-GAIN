import test from 'node:test';
import assert from 'node:assert/strict';
import {
  convertHeightToCm,
  calculateBMI,
  calculateBMR,
  calculateTDEE,
  calculateTargetCalories,
  estimateTargetTimeline,
} from './healthMath';

test('converts 5 feet 9 inches to ~175.3 cm', () => {
  const cm = convertHeightToCm(5, 9);
  assert.equal(cm, 175.3);
});

test('calculates correct BMI for 50 kg and 175.3 cm (user profile)', () => {
  const result = calculateBMI(50, 175.3);
  // BMI = 50 / (1.753 * 1.753) = 16.27 -> 16.3
  assert.equal(result.bmi, 16.3);
  assert.equal(result.category, 'severe_underweight');
  assert.ok(result.minHealthyWeightKg > 56);
  assert.ok(result.weightDiffToNormalKg > 6);
});

test('calculates BMR for 26yo male, 50kg, 175.3cm', () => {
  // BMR = 10*50 + 6.25*175.3 - 5*26 + 5 = 500 + 1095.625 - 130 + 5 = 1470.625 -> 1471
  const bmr = calculateBMR(50, 175.3, 26, 'male');
  assert.ok(bmr >= 1465 && bmr <= 1475);
});

test('calculates TDEE and +500 kcal surplus for weight gain', () => {
  const bmr = 1471;
  const tdee = calculateTDEE(bmr, 'light'); // 1471 * 1.375 ~ 2023
  assert.ok(tdee >= 2000 && tdee <= 2050);

  const targets = calculateTargetCalories(tdee, 'steady', 50);
  assert.equal(targets.surplusKcal, 500);
  assert.equal(targets.targetCalories, tdee + 500);
  assert.ok(targets.proteinGrams >= 90);
  assert.ok(targets.carbsGrams > 200);
});

test('estimates timeline to reach 60 kg from 50 kg at 0.5 kg/week', () => {
  const timeline = estimateTargetTimeline(50, 60, 0.5, new Date('2026-10-24'));
  // 10 kg / 0.5 = 20 weeks
  assert.equal(timeline.weeksNeeded, 20);
  assert.ok(timeline.targetDateString.includes('2027'));
});
