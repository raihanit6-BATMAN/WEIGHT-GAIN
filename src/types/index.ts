/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ActivityLevel, WeightGainPace } from '../utils/healthMath';

export interface UserProfile {
  name: string;
  age: number;
  gender: 'male' | 'female';
  heightFeet: number;
  heightInches: number;
  weightKg: number;
  targetWeightKg: number;
  activityLevel: ActivityLevel;
  weightGainPace: WeightGainPace;
  dailyWaterGoalGlasses: number;
  dailyWaterGoalMl?: number;
}

export type FoodCategory =
  | 'home_cooking'
  | 'street_snacks'
  | 'carbs'
  | 'protein'
  | 'fats_nuts'
  | 'dairy'
  | 'shakes'
  | 'fruits';

export interface FoodUnitOption {
  id: string; // 'piece' | 'gram' | 'plate' | 'bowl' | 'glass' | 'cup' | 'fistful' | 'spoon'
  labelEn: string;
  labelBn: string;
  multiplier: number; // relative to base FoodItem stats
  presetAmounts: number[];
  step?: number;
  min?: number;
}

export interface FoodItem {
  id: string;
  nameEn: string;
  nameBn: string;
  category: FoodCategory;
  servingSizeEn: string;
  servingSizeBn: string;
  servingMultiplier?: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  estimatedPriceBdt?: number;
  marketUnitBn?: string;
  marketUnitEn?: string;
  availability: 'high' | 'medium';
  isBudgetHero?: boolean;
  weightGainTipEn: string;
  weightGainTipBn: string;
  iconType: string;
  unitOptions?: FoodUnitOption[];
}

export type MealType =
  | 'breakfast'
  | 'morning_snack'
  | 'lunch'
  | 'evening_shake'
  | 'dinner'
  | 'bedtime';

export interface LoggedMealItem {
  id: string;
  foodId: string;
  foodNameEn: string;
  foodNameBn: string;
  mealType: MealType;
  servings: number;
  servingUnitEn: string;
  servingUnitBn: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timeAdded: string;
  portionUnitId?: string;
  portionAmount?: number;
  oilLevel?: 'low' | 'normal' | 'high';
}

export interface WeightHistoryEntry {
  id: string;
  date: string;
  weightKg: number;
  chestInches?: number;
  armInches?: number;
  waistInches?: number;
  thighInches?: number;
  notes?: string;
}

export interface Recipe {
  id: string;
  titleEn: string;
  titleBn: string;
  subtitleEn: string;
  subtitleBn: string;
  prepTimeMinutes: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  approxCostBdt: number;
  difficulty: 'Very Easy' | 'Easy' | 'Moderate';
  blenderRequired: boolean;
  ingredients: {
    itemEn: string;
    itemBn: string;
    amountEn: string;
    amountBn: string;
    approxCostBdt: number;
  }[];
  stepsEn: string[];
  stepsBn: string[];
  proTipEn: string;
  proTipBn: string;
}

export interface MealPlanDay {
  id: string;
  titleEn: string;
  titleBn: string;
  descriptionEn: string;
  descriptionBn: string;
  badgeEn: string;
  badgeBn: string;
  totalCalories: number;
  totalProtein: number;
  totalCostBdt: number;
  meals: {
    mealType: MealType;
    labelEn: string;
    labelBn: string;
    time: string;
    foodIds: { foodId: string; servings: number }[];
  }[];
}

export interface GroceryItem {
  id: string;
  nameEn: string;
  nameBn: string;
  categoryEn: string;
  categoryBn: string;
  amountEn: string;
  amountBn: string;
  estimatedPriceBdt: number;
  isEssential: boolean;
  checked: boolean;
}
