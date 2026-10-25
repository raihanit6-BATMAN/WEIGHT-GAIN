/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FoodItem } from '../types';

export interface NutritionInsight {
  suggestedFood: FoodItem;
  suggestedPortionEn: string;
  suggestedPortionBn: string;
  reasonEn: string;
  reasonBn: string;
  macroBenefitEn: string;
  macroBenefitBn: string;
  caloriesAdded: number;
  proteinAdded: number;
}

/**
 * Recommends one specific food item from the database based on the user's
 * largest remaining macro deficit for the day.
 */
export function getDailyNutritionInsight(
  foods: FoodItem[],
  remainingCalories: number,
  remainingProtein: number,
  remainingCarbs: number,
  remainingFat: number
): NutritionInsight {
  // If user has already reached their goals
  if (remainingCalories <= 100 && remainingProtein <= 5) {
    const bedtimeMilk = foods.find((f) => f.id === 'aarong-full-cream-milk') || foods[0];
    return {
      suggestedFood: bedtimeMilk,
      suggestedPortionEn: '1 warm glass before bed',
      suggestedPortionBn: 'ঘুমানোর আগে ১ গ্লাস হালকা গরম দুধ',
      reasonEn: 'You have almost hit your daily bulking target! Drink a warm glass of milk for overnight muscle repair.',
      reasonBn: 'আপনার আজকের ক্যালরি লক্ষ্য প্রায় পূরণ হয়েছে! রাতে পেশির বৃদ্ধি ও ভালো ঘুমের জন্য ১ গ্লাস দুধ পান করুন।',
      macroBenefitEn: '+8.5g slow-release casein protein',
      macroBenefitBn: '+৮.৫ গ্রাম ক্যাসিন প্রোটিন',
      caloriesAdded: bedtimeMilk.calories,
      proteinAdded: bedtimeMilk.protein,
    };
  }

  // Priority 1: Large protein deficit
  if (remainingProtein > 25) {
    const eggs = foods.find((f) => f.id === 'dim-poach-mustard') || foods.find((f) => f.id === 'dim-seddho-boiled') || foods[0];
    return {
      suggestedFood: eggs,
      suggestedPortionEn: 'Eat 2 whole fried or boiled eggs',
      suggestedPortionBn: '২টি আস্ত ডিম (পোচ বা সিদ্ধ)',
      reasonEn: `You need ${remainingProtein}g more protein today. Eggs are the most bioavailable muscle-building protein in Bangladesh.`,
      reasonBn: `আজকের প্রোটিন লক্ষ্যে আরও ${remainingProtein} গ্রাম বাকি। পেশি গঠনে ডিম সবচেয়ে কার্যকর।`,
      macroBenefitEn: `Provides +${eggs.protein}g complete protein and +${eggs.calories} kcal`,
      macroBenefitBn: `দেবে +${eggs.protein} গ্রাম প্রোটিন এবং +${eggs.calories} ক্যালরি`,
      caloriesAdded: eggs.calories,
      proteinAdded: eggs.protein,
    };
  }

  // Priority 2: Large calorie deficit + fat deficit (Peanuts are the king)
  if (remainingCalories > 500 && remainingFat > 20) {
    const peanuts = foods.find((f) => f.id === 'chini-badam-roasted') || foods[0];
    return {
      suggestedFood: peanuts,
      suggestedPortionEn: 'Eat 50g roasted peanuts (1 fistful)',
      suggestedPortionBn: '৫০ গ্রাম ভাজা চিনাবাদাম (এক মুঠো)',
      reasonEn: 'You still need substantial calories. A fistful of roasted peanuts delivers healthy fats and energy without filling your stomach.',
      reasonBn: 'ক্যালরি ঘাটতি দ্রুত পূরণ করতে এক মুঠো চিনাবাদাম খান। এটি পেট ভারী না করে স্বাস্থ্যকর ফ্যাট যোগ করে।',
      macroBenefitEn: `Delivers +${peanuts.calories} kcal and +${peanuts.protein}g protein`,
      macroBenefitBn: `যোগ করবে +${peanuts.calories} ক্যালরি এবং +${peanuts.protein} গ্রাম প্রোটিন`,
      caloriesAdded: peanuts.calories,
      proteinAdded: peanuts.protein,
    };
  }

  // Priority 3: Carbs deficit (Bananas / Chira)
  if (remainingCarbs > 60) {
    const bananas = foods.find((f) => f.id === 'kola-sagor-shobri') || foods[0];
    return {
      suggestedFood: bananas,
      suggestedPortionEn: 'Eat 2 ripe Sagor or Shobri bananas',
      suggestedPortionBn: '২টি পাকা সাগর বা শবরি কলা',
      reasonEn: `Your carbohydrate intake is ${remainingCarbs}g short. Bananas provide quick glycogen replenishment and potassium.`,
      reasonBn: `কার্বোহাইড্রেট লক্ষ্যে আরও ${remainingCarbs} গ্রাম বাকি। ২টি পাকা কলা তাৎক্ষণিক শক্তি জোগাবে।`,
      macroBenefitEn: `Provides +${bananas.carbs}g clean carbs and +${bananas.calories} kcal`,
      macroBenefitBn: `দেবে +${bananas.carbs} গ্রাম পরিষ্কার কার্বস ও +${bananas.calories} ক্যালরি`,
      caloriesAdded: bananas.calories,
      proteinAdded: bananas.protein,
    };
  }

  // Default fallback: Mega Shake or Milk
  const shake = foods.find((f) => f.id === 'deshi-weight-gain-shake') || foods[0];
  return {
    suggestedFood: shake,
    suggestedPortionEn: 'Drink 1 tumbler Deshi Weight Gain Shake',
    suggestedPortionBn: '১ গ্লাস দেশি পাওয়ার শেক (দুধ + কলা + বাদাম)',
    reasonEn: 'Balanced calorie and macro boost to hit your daily weight gain surplus.',
    reasonBn: 'সহজে ক্যালরি ও প্রোটিন লক্ষ্য অর্জন করতে বিকালে বা রাতে এই পুষ্টিকর শেক পান করুন।',
    macroBenefitEn: `Packed with +${shake.calories} kcal and +${shake.protein}g protein`,
    macroBenefitBn: `এক গ্লাসেই +${shake.calories} ক্যালরি ও +${shake.protein} গ্রাম প্রোটিন`,
    caloriesAdded: shake.calories,
    proteinAdded: shake.protein,
  };
}
