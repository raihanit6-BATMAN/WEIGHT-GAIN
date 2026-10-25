/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MacroRingProgress {
  consumed: number;
  target: number;
  percentage: number;
  remaining: number;
  caloriesFromMacro: number;
  strokeDashoffset: number;
  circumference: number;
}

export interface MacroBreakdownData {
  protein: MacroRingProgress;
  carbs: MacroRingProgress;
  fat: MacroRingProgress;
  totalCalories: number;
  targetCalories: number;
  caloriePercentage: number;
}

/**
 * Calculates stroke dashoffset and metrics for circular progress rings.
 */
export function calculateRingProgress(
  consumed: number,
  target: number,
  radius: number,
  kcalPerGram: number = 4
): MacroRingProgress {
  const safeTarget = Math.max(1, target);
  const safeConsumed = Math.max(0, consumed);
  const percentage = Math.round((safeConsumed / safeTarget) * 100);
  const remaining = Number(Math.max(0, safeTarget - safeConsumed).toFixed(1));
  const caloriesFromMacro = Math.round(safeConsumed * kcalPerGram);

  const circumference = Number((2 * Math.PI * radius).toFixed(2));
  const progressRatio = Math.min(1, safeConsumed / safeTarget);
  const strokeDashoffset = Number((circumference * (1 - progressRatio)).toFixed(2));

  return {
    consumed: Number(safeConsumed.toFixed(1)),
    target: Math.round(safeTarget),
    percentage,
    remaining,
    caloriesFromMacro,
    strokeDashoffset,
    circumference,
  };
}

/**
 * Computes complete macro breakdown for the visual progress ring widget.
 */
export function calculateMacroBreakdown(
  consumedProtein: number,
  targetProtein: number,
  consumedCarbs: number,
  targetCarbs: number,
  consumedFat: number,
  targetFat: number,
  totalCalories: number,
  targetCalories: number,
  radii = { protein: 58, carbs: 44, fat: 30 }
): MacroBreakdownData {
  return {
    protein: calculateRingProgress(consumedProtein, targetProtein, radii.protein, 4),
    carbs: calculateRingProgress(consumedCarbs, targetCarbs, radii.carbs, 4),
    fat: calculateRingProgress(consumedFat, targetFat, radii.fat, 9),
    totalCalories: Math.round(totalCalories),
    targetCalories: Math.round(targetCalories),
    caloriePercentage: Math.min(100, Math.round((totalCalories / Math.max(1, targetCalories)) * 100)),
  };
}
