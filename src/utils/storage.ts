/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserProfile, LoggedMealItem, WeightHistoryEntry, GroceryItem } from '../types';
import { INITIAL_GROCERY_CHECKLIST } from '../data/bangladeshiFoods';

const STORAGE_KEYS = {
  USER_PROFILE: 'pushtigain_profile_v2',
  LOGGED_MEALS: 'pushtigain_meals_v2',
  WEIGHT_HISTORY: 'pushtigain_weight_history_v2',
  GROCERY_LIST: 'pushtigain_grocery_v2',
  WATER_GLASSES: 'pushtigain_water_v2',
  WATER_ML: 'pushtigain_water_ml_v3',
  LANGUAGE: 'pushtigain_lang_v2',
};

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Raihan',
  age: 26,
  gender: 'male',
  heightFeet: 5,
  heightInches: 9,
  weightKg: 50,
  targetWeightKg: 60,
  activityLevel: 'light',
  weightGainPace: 'steady', // +500 kcal surplus
  dailyWaterGoalGlasses: 12, // 3 Litres target (12 x 250ml)
  dailyWaterGoalMl: 3000,
};

export const DEFAULT_WEIGHT_HISTORY: WeightHistoryEntry[] = [
  { id: 'wh-1', date: '2026-10-01', weightKg: 49.2, chestInches: 33.5, armInches: 10.2, waistInches: 27.5, notes: 'Starting journey feeling fatigued' },
  { id: 'wh-2', date: '2026-10-10', weightKg: 49.8, chestInches: 34.0, armInches: 10.5, waistInches: 27.6, notes: 'Added milk, bananas and peanuts' },
  { id: 'wh-3', date: '2026-10-24', weightKg: 50.0, chestInches: 34.2, armInches: 10.7, waistInches: 27.8, notes: 'Today baseline at 26yo, 5\'9"' },
];

export const INITIAL_LOGGED_MEALS: LoggedMealItem[] = [
  {
    id: 'log-1',
    foodId: 'paratha-plain',
    foodNameEn: 'Warm Paratha (Parota)',
    foodNameBn: 'তেলের গরম পরোটা',
    mealType: 'breakfast',
    servings: 1,
    servingUnitEn: '2 medium parathas',
    servingUnitBn: '২ টি মাঝারি পরোটা',
    calories: 390,
    protein: 7.5,
    carbs: 52,
    fat: 17,
    timeAdded: '8:30 AM',
  },
  {
    id: 'log-2',
    foodId: 'dim-poach-mustard',
    foodNameEn: 'Fried Egg / Dim Poach in Oil',
    foodNameBn: 'তেলে ভাজা ডিম পোচ',
    mealType: 'breakfast',
    servings: 1,
    servingUnitEn: '2 whole eggs',
    servingUnitBn: '২ টি আস্ত ডিম',
    calories: 200,
    protein: 13,
    carbs: 1,
    fat: 16,
    timeAdded: '8:35 AM',
  },
  {
    id: 'log-3',
    foodId: 'kola-sagor-shobri',
    foodNameEn: 'Bananas (Sagor Kola)',
    foodNameBn: 'পাকা সাগর কলা',
    mealType: 'morning_snack',
    servings: 1,
    servingUnitEn: '2 medium bananas',
    servingUnitBn: '২ টি পাকা কলা',
    calories: 210,
    protein: 2.6,
    carbs: 54,
    fat: 0.6,
    timeAdded: '11:15 AM',
  },
  {
    id: 'log-4',
    foodId: 'chini-badam-roasted',
    foodNameEn: 'Roasted Peanuts (Chini Badam)',
    foodNameBn: 'ভাজা চিনাবাদাম',
    mealType: 'morning_snack',
    servings: 1,
    servingUnitEn: '50g (1 fistful)',
    servingUnitBn: '৫০ গ্রাম (এক মুঠো)',
    calories: 285,
    protein: 13,
    carbs: 8,
    fat: 24.5,
    timeAdded: '11:20 AM',
  },
];

export function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (raw) return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed to load profile', e);
  }
  return DEFAULT_PROFILE;
}

export function saveProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile', e);
  }
}

export function loadLoggedMeals(): LoggedMealItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGGED_MEALS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load meals', e);
  }
  return INITIAL_LOGGED_MEALS;
}

export function saveLoggedMeals(meals: LoggedMealItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LOGGED_MEALS, JSON.stringify(meals));
  } catch (e) {
    console.error('Failed to save meals', e);
  }
}

export function loadWeightHistory(): WeightHistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WEIGHT_HISTORY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load weight history', e);
  }
  return DEFAULT_WEIGHT_HISTORY;
}

export function saveWeightHistory(history: WeightHistoryEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.WEIGHT_HISTORY, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to save weight history', e);
  }
}

export function loadGroceryList(): GroceryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GROCERY_LIST);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load grocery list', e);
  }
  return INITIAL_GROCERY_CHECKLIST;
}

export function saveGroceryList(list: GroceryItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.GROCERY_LIST, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save grocery list', e);
  }
}

export function loadWaterMl(): number {
  try {
    const rawMl = localStorage.getItem(STORAGE_KEYS.WATER_ML);
    if (rawMl) return parseInt(rawMl, 10);
    const rawGlasses = localStorage.getItem(STORAGE_KEYS.WATER_GLASSES);
    if (rawGlasses) return parseInt(rawGlasses, 10) * 250;
  } catch (e) {
    console.error('Failed to load water ml', e);
  }
  return 1000; // default initial progress (1 Litre = 4 glasses)
}

export function saveWaterMl(ml: number): void {
  try {
    localStorage.setItem(STORAGE_KEYS.WATER_ML, ml.toString());
    localStorage.setItem(STORAGE_KEYS.WATER_GLASSES, Math.round(ml / 250).toString());
  } catch (e) {
    console.error('Failed to save water ml', e);
  }
}

export function loadWaterGlasses(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WATER_GLASSES);
    if (raw) return parseInt(raw, 10);
  } catch (e) {
    console.error('Failed to load water', e);
  }
  return 4; // default initial progress
}

export function saveWaterGlasses(count: number): void {
  try {
    localStorage.setItem(STORAGE_KEYS.WATER_GLASSES, count.toString());
    localStorage.setItem(STORAGE_KEYS.WATER_ML, (count * 250).toString());
  } catch (e) {
    console.error('Failed to save water', e);
  }
}

export function loadLanguage(): 'en' | 'bn' {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
    if (raw === 'en' || raw === 'bn') return raw;
  } catch (e) {
    // fallback
  }
  return 'en'; // default to English with rich Bengali transliteration for universal font rendering
}

export function saveLanguage(lang: 'en' | 'bn'): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  } catch (e) {
    // fallback
  }
}
