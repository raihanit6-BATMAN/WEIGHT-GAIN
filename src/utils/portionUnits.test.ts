/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { getFoodPortionOptions, calculatePortionNutrition } from './portionUnits';
import { FoodItem } from '../types';

const eggMock: FoodItem = {
  id: 'dim-poach-mustard',
  nameEn: 'Fried Egg / Dim Poach in Oil',
  nameBn: 'তেলে ভাজা ডিম পোচ',
  category: 'protein',
  servingSizeEn: '2 whole eggs',
  servingSizeBn: '২ টি আস্ত ডিম',
  calories: 200,
  protein: 13.0,
  carbs: 1.0,
  fat: 16.0,
  availability: 'high',
  weightGainTipEn: 'Great source of protein.',
  weightGainTipBn: 'চমৎকার প্রোটিন।',
  iconType: 'egg',
};

const peanutsMock: FoodItem = {
  id: 'chini-badam-roasted',
  nameEn: 'Roasted Peanuts (Chini Badam)',
  nameBn: 'ভাজা চিনাবাদাম',
  category: 'fats_nuts',
  servingSizeEn: '50g (1 fistful)',
  servingSizeBn: '৫০ গ্রাম (এক মুঠো)',
  calories: 285,
  protein: 13.0,
  carbs: 8.0,
  fat: 24.5,
  availability: 'high',
  weightGainTipEn: 'Cheapest high calorie food.',
  weightGainTipBn: 'সাশ্রয়ী ক্যালরি।',
  iconType: 'nut',
};

test('provides pieces and grams for eggs', () => {
  const options = getFoodPortionOptions(eggMock);
  const pieceOption = options.find((o) => o.id === 'piece');
  const gramOption = options.find((o) => o.id === 'gram');

  assert.ok(pieceOption, 'piece option exists');
  assert.ok(gramOption, 'gram option exists');

  // If base is 2 eggs = 200 kcal, 1 egg should be 100 kcal
  const oneEggCalc = calculatePortionNutrition(eggMock, pieceOption, 1);
  assert.equal(oneEggCalc.calories, 100);
  assert.equal(oneEggCalc.protein, 6.5);

  const twoEggCalc = calculatePortionNutrition(eggMock, pieceOption, 2);
  assert.equal(twoEggCalc.calories, 200);
  assert.equal(twoEggCalc.protein, 13.0);
});

test('provides grams and fistful for peanuts with accurate scaling', () => {
  const options = getFoodPortionOptions(peanutsMock);
  const gramOption = options.find((o) => o.id === 'gram');
  const fistfulOption = options.find((o) => o.id === 'fistful');

  assert.ok(gramOption, 'gram option exists');
  assert.ok(fistfulOption, 'fistful option exists');

  // Base is 50g = 285 kcal. 100g should be 570 kcal
  const hundredGrams = calculatePortionNutrition(peanutsMock, gramOption, 100);
  assert.equal(hundredGrams.calories, 570);
  assert.equal(hundredGrams.protein, 26);

  // 1 fistful (~30g) -> (30/50)*285 = 171 kcal
  const oneFistful = calculatePortionNutrition(peanutsMock, fistfulOption, 1);
  assert.equal(oneFistful.calories, 171);
});
