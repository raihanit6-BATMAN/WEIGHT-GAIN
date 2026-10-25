/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface BmiResult {
  bmi: number;
  category: 'severe_underweight' | 'underweight' | 'normal' | 'overweight' | 'obese';
  categoryLabelEn: string;
  categoryLabelBn: string;
  colorClass: string;
  minHealthyWeightKg: number;
  maxHealthyWeightKg: number;
  weightDiffToNormalKg: number;
}

export interface CalorieTargets {
  bmr: number;
  tdee: number;
  targetCalories: number;
  surplusKcal: number;
  estimatedWeeklyGainKg: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
}

export interface WeightTimeline {
  weeksNeeded: number;
  targetDateString: string;
  targetDateBnString: string;
  currentWeight: number;
  targetWeight: number;
}

/**
 * Converts height in feet and inches to centimeters.
 */
export function convertHeightToCm(feet: number, inches: number): number {
  const totalInches = Math.max(0, feet) * 12 + Math.max(0, inches);
  return Number((totalInches * 2.54).toFixed(1));
}

/**
 * Calculates Body Mass Index (BMI) and health category.
 * Healthy BMI standard range: 18.5 - 24.9
 */
export function calculateBMI(weightKg: number, heightCm: number): BmiResult {
  if (weightKg <= 0 || heightCm <= 0) {
    return {
      bmi: 0,
      category: 'underweight',
      categoryLabelEn: 'Invalid',
      categoryLabelBn: 'অবৈধ',
      colorClass: 'text-zinc-400',
      minHealthyWeightKg: 0,
      maxHealthyWeightKg: 0,
      weightDiffToNormalKg: 0,
    };
  }

  const heightMeters = heightCm / 100;
  const bmi = Number((weightKg / (heightMeters * heightMeters)).toFixed(1));
  const minHealthyWeightKg = Number((18.5 * heightMeters * heightMeters).toFixed(1));
  const maxHealthyWeightKg = Number((24.9 * heightMeters * heightMeters).toFixed(1));

  let category: BmiResult['category'] = 'normal';
  let categoryLabelEn = 'Normal';
  let categoryLabelBn = 'স্বাভাবিক ওজন';
  let colorClass = 'text-emerald-500';

  if (bmi < 16.5) {
    category = 'severe_underweight';
    categoryLabelEn = 'Severely Underweight';
    categoryLabelBn = 'অতিরিক্ত কম ওজন (ঝুঁকিপূর্ণ)';
    colorClass = 'text-rose-500';
  } else if (bmi < 18.5) {
    category = 'underweight';
    categoryLabelEn = 'Underweight';
    categoryLabelBn = 'কম ওজন';
    colorClass = 'text-amber-500';
  } else if (bmi <= 24.9) {
    category = 'normal';
    categoryLabelEn = 'Normal & Healthy';
    categoryLabelBn = 'স্বাভাবিক ও সুস্থ';
    colorClass = 'text-emerald-500';
  } else if (bmi <= 29.9) {
    category = 'overweight';
    categoryLabelEn = 'Overweight';
    categoryLabelBn = 'অতিরিক্ত ওজন';
    colorClass = 'text-amber-500';
  } else {
    category = 'obese';
    categoryLabelEn = 'Obese';
    categoryLabelBn = 'স্থূলতা';
    colorClass = 'text-rose-500';
  }

  const weightDiffToNormalKg = weightKg < minHealthyWeightKg 
    ? Number((minHealthyWeightKg - weightKg).toFixed(1))
    : 0;

  return {
    bmi,
    category,
    categoryLabelEn,
    categoryLabelBn,
    colorClass,
    minHealthyWeightKg,
    maxHealthyWeightKg,
    weightDiffToNormalKg,
  };
}

/**
 * Calculates BMR using Mifflin-St Jeor formula:
 * Men: (10 * weight in kg) + (6.25 * height in cm) - (5 * age) + 5
 * Women: (10 * weight in kg) + (6.25 * height in cm) - (5 * age) - 161
 */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: 'male' | 'female' = 'male'
): number {
  if (weightKg <= 0 || heightCm <= 0 || age <= 0) return 0;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(gender === 'male' ? base + 5 : base - 161);
}

/**
 * Activity multipliers for TDEE.
 */
export const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2, // Desk job, little/no exercise
  light: 1.375, // Light exercise 1-3 days/week or student walking
  moderate: 1.55, // Moderate exercise 3-5 days/week or active bazaar walking
  active: 1.725, // Hard exercise / manual labor
} as const;

export type ActivityLevel = keyof typeof ACTIVITY_MULTIPLIERS;

/**
 * Calculates Total Daily Energy Expenditure (TDEE).
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel = 'light'): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || 1.375;
  return Math.round(bmr * multiplier);
}

export type WeightGainPace = 'steady' | 'accelerated' | 'lean';

/**
 * Calculates weight gain surplus target calories and daily macros.
 * - 'lean': +300 kcal (~0.25 kg/week)
 * - 'steady': +500 kcal (~0.5 kg/week, standard recommended safe surplus)
 * - 'accelerated': +750 kcal (~0.75 kg/week for fast gain)
 */
export function calculateTargetCalories(
  tdee: number,
  pace: WeightGainPace = 'steady',
  weightKg: number = 50
): CalorieTargets {
  let surplusKcal = 500;
  let estimatedWeeklyGainKg = 0.5;

  if (pace === 'lean') {
    surplusKcal = 300;
    estimatedWeeklyGainKg = 0.25;
  } else if (pace === 'accelerated') {
    surplusKcal = 750;
    estimatedWeeklyGainKg = 0.75;
  }

  const targetCalories = tdee + surplusKcal;

  // Macros recommendation for healthy weight gain:
  // Protein: ~1.8g to 2.0g per kg bodyweight
  // Fat: ~25-30% of total calories (9 kcal/g)
  // Carbs: Remaining calories (4 kcal/g)
  const proteinGrams = Math.round(Math.max(80, weightKg * 1.8));
  const proteinCalories = proteinGrams * 4;
  const fatCalories = targetCalories * 0.28;
  const fatGrams = Math.round(fatCalories / 9);
  const carbCalories = Math.max(0, targetCalories - proteinCalories - fatCalories);
  const carbsGrams = Math.round(carbCalories / 4);

  return {
    bmr: Math.round(tdee / 1.375),
    tdee,
    targetCalories,
    surplusKcal,
    estimatedWeeklyGainKg,
    proteinGrams,
    carbsGrams,
    fatGrams,
  };
}

/**
 * Calculates estimated timeline and projected milestone date to reach target weight.
 */
export function estimateTargetTimeline(
  currentWeight: number,
  targetWeight: number,
  weeklyGainKg: number = 0.5,
  fromDate: Date = new Date()
): WeightTimeline {
  const diff = Math.max(0, targetWeight - currentWeight);
  const weeksNeeded = weeklyGainKg > 0 ? Math.ceil(diff / weeklyGainKg) : 0;

  const targetDate = new Date(fromDate.getTime());
  targetDate.setDate(targetDate.getDate() + weeksNeeded * 7);

  const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthsBn = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];

  const targetDateString = `${monthsEn[targetDate.getMonth()]} ${targetDate.getDate()}, ${targetDate.getFullYear()}`;
  const targetDateBnString = `${targetDate.getDate()} ${monthsBn[targetDate.getMonth()]}, ${targetDate.getFullYear()}`;

  return {
    weeksNeeded,
    targetDateString,
    targetDateBnString,
    currentWeight,
    targetWeight,
  };
}
