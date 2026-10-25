import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateRingProgress, calculateMacroBreakdown } from './macroMath';

test('calculates correct circular arc offset and percentage for 50% consumed', () => {
  const radius = 50;
  const progress = calculateRingProgress(50, 100, radius, 4);

  assert.equal(progress.percentage, 50);
  assert.equal(progress.consumed, 50);
  assert.equal(progress.remaining, 50);
  assert.equal(progress.caloriesFromMacro, 200); // 50g * 4 kcal
  assert.ok(Math.abs(progress.circumference - 314.16) < 0.1);
  assert.ok(Math.abs(progress.strokeDashoffset - 157.08) < 0.1);
});

test('handles over-target consumption gracefully without negative dashoffsets', () => {
  const radius = 40;
  const progress = calculateRingProgress(120, 100, radius, 4);

  assert.equal(progress.percentage, 120);
  assert.equal(progress.remaining, 0);
  assert.equal(progress.strokeDashoffset, 0); // Complete full circle
});

test('calculates accurate multi-macro breakdown for dashboard', () => {
  const breakdown = calculateMacroBreakdown(
    36.1, // protein consumed
    90,   // protein target
    115,  // carbs consumed
    364,  // carbs target
    58.1, // fat consumed
    78,   // fat target
    1085, // total calories consumed
    2523  // target calories
  );

  assert.equal(breakdown.protein.percentage, 40);
  assert.equal(breakdown.carbs.percentage, 32);
  assert.equal(breakdown.fat.percentage, 74);
  assert.equal(breakdown.caloriePercentage, 43);
  assert.ok(breakdown.protein.strokeDashoffset > 0);
  assert.ok(breakdown.carbs.strokeDashoffset > 0);
  assert.ok(breakdown.fat.strokeDashoffset > 0);
});
