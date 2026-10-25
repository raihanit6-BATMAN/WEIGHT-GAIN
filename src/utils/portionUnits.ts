/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FoodItem, FoodUnitOption } from '../types';

export interface PortionCalculation {
  multiplier: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  displayQuantity: string;
  displayQuantityBn: string;
  oilLevel?: 'low' | 'normal' | 'high';
}

/**
 * Provides food-specific portion unit options (grams, pieces, plates, bowls, etc.)
 * based on the Bangladeshi food category and type.
 */
export function getFoodPortionOptions(food: FoodItem): FoodUnitOption[] {
  if (food.unitOptions && food.unitOptions.length > 0) {
    return food.unitOptions;
  }

  const id = food.id.toLowerCase();
  const name = (food.nameEn + ' ' + food.nameBn).toLowerCase();

  // 0. Authentic Home Cooking (Sobji, Shak, Dal, Torkari)
  if (
    food.category === 'home_cooking' ||
    id.includes('sobji') ||
    id.includes('shak') ||
    id.includes('torkari') ||
    name.includes('সবজি') ||
    name.includes('শাক') ||
    name.includes('তরকারি')
  ) {
    return [
      {
        id: 'bowl',
        labelEn: 'Small Bowl (~150g)',
        labelBn: '১ বাটি (~১৫০ গ্রাম)',
        multiplier: 1,
        presetAmounts: [0.5, 1, 1.5, 2],
        step: 0.5,
        min: 0.5,
      },
      {
        id: 'plate',
        labelEn: 'Full Plate (~270g)',
        labelBn: '১ প্লেট',
        multiplier: 1.8,
        presetAmounts: [0.5, 1, 1.5],
        step: 0.5,
        min: 0.5,
      },
      {
        id: 'spoon',
        labelEn: 'Serving Spoon (~40g)',
        labelBn: 'চামচ (সার্ভিং)',
        multiplier: 0.25,
        presetAmounts: [1, 2, 3, 4],
        step: 1,
        min: 1,
      },
      {
        id: 'gram',
        labelEn: 'Grams (g)',
        labelBn: 'গ্রাম (g)',
        multiplier: 1 / 150,
        presetAmounts: [50, 100, 150, 200, 300],
        step: 25,
        min: 25,
      },
    ];
  }

  // 0.1 Street & Bakery Snacks (Pieces / Cups)
  if (
    id.includes('singara') ||
    id.includes('somosa') ||
    id.includes('puri') ||
    id.includes('roll') ||
    id.includes('shawarma') ||
    id.includes('biscuit') ||
    id.includes('toast') ||
    id.includes('mughlai') ||
    name.includes('সিঙ্গাড়া') ||
    name.includes('সমুচা') ||
    name.includes('পুরী') ||
    name.includes('রোল') ||
    name.includes('মোগলাই') ||
    name.includes('বিস্কুট') ||
    name.includes('টোস্ট')
  ) {
    return [
      {
        id: 'piece',
        labelEn: 'Piece (pcs)',
        labelBn: 'টি / পিস',
        multiplier: 1,
        presetAmounts: [1, 2, 3, 4],
        step: 1,
        min: 1,
      },
      {
        id: 'hali',
        labelEn: 'Hali (4 pcs)',
        labelBn: 'হালি (৪টি)',
        multiplier: 4,
        presetAmounts: [1, 2],
        step: 1,
        min: 1,
      },
    ];
  }

  // 0.2 Tea & Coffee (Cups)
  if (id.includes('cha') || id.includes('tea') || name.includes('চা')) {
    return [
      {
        id: 'cup',
        labelEn: 'Cup (1 cup)',
        labelBn: '১ কাপ (~১৫০ মিলি)',
        multiplier: 1,
        presetAmounts: [1, 2, 3, 4],
        step: 1,
        min: 1,
      },
    ];
  }

  // 1. Eggs (Dim)
  if (id.includes('dim') || name.includes('egg') || name.includes('ডিম')) {
    const isSingleEggBase = food.servingSizeEn.includes('1 whole egg') || food.servingSizeEn.includes('1 egg');
    const baseEggs = isSingleEggBase ? 1 : 2;
    return [
      {
        id: 'piece',
        labelEn: 'Piece (pcs)',
        labelBn: 'টি / পিস',
        multiplier: 1 / baseEggs,
        presetAmounts: [1, 2, 3, 4],
        step: 1,
        min: 1,
      },
      {
        id: 'gram',
        labelEn: 'Grams (g)',
        labelBn: 'গ্রাম (g)',
        multiplier: 1 / (baseEggs * 50),
        presetAmounts: [50, 100, 150, 200],
        step: 25,
        min: 25,
      },
    ];
  }

  // 2. Bananas (Kola)
  if (id.includes('kola') || name.includes('banana') || name.includes('কলা')) {
    const isSingle = food.servingSizeEn.includes('1 medium') || food.servingSizeEn.includes('1 banana');
    const baseKola = isSingle ? 1 : 2;
    return [
      {
        id: 'piece',
        labelEn: 'Piece (pcs)',
        labelBn: 'টি / পিস',
        multiplier: 1 / baseKola,
        presetAmounts: [1, 2, 3, 4],
        step: 1,
        min: 1,
      },
      {
        id: 'hali',
        labelEn: 'Hali (4 pcs)',
        labelBn: 'হালি (৪টি)',
        multiplier: 4 / baseKola,
        presetAmounts: [1, 2],
        step: 1,
        min: 1,
      },
      {
        id: 'gram',
        labelEn: 'Grams (g)',
        labelBn: 'গ্রাম (g)',
        multiplier: 1 / (baseKola * 100),
        presetAmounts: [100, 150, 200, 300],
        step: 50,
        min: 50,
      },
    ];
  }

  // 3. Peanuts & Nuts (Badam)
  if (id.includes('badam') || name.includes('peanut') || name.includes('almond') || name.includes('বাদাম')) {
    const baseGrams = id.includes('kath-badam') ? 20 : 50;
    return [
      {
        id: 'gram',
        labelEn: 'Grams (g)',
        labelBn: 'গ্রাম (g)',
        multiplier: 1 / baseGrams,
        presetAmounts: [30, 50, 75, 100, 150],
        step: 10,
        min: 10,
      },
      {
        id: 'fistful',
        labelEn: 'Fistful (~30g)',
        labelBn: 'এক মুঠো (~৩০ গ্রাম)',
        multiplier: 30 / baseGrams,
        presetAmounts: [1, 2, 3],
        step: 1,
        min: 1,
      },
      {
        id: 'piece',
        labelEn: 'Pieces (nuts)',
        labelBn: 'দানা / টি',
        multiplier: 1 / (baseGrams * 1.5),
        presetAmounts: [10, 15, 20, 30],
        step: 5,
        min: 5,
      },
    ];
  }

  // 4. Milk / Shakes / Liquids (Dudh)
  if (
    id.includes('milk') ||
    id.includes('dudh') ||
    id.includes('shake') ||
    name.includes('milk') ||
    name.includes('দুধ') ||
    name.includes('শেক')
  ) {
    return [
      {
        id: 'glass',
        labelEn: 'Glass (250ml)',
        labelBn: 'গ্লাস (২৫০ মিলি)',
        multiplier: 1,
        presetAmounts: [0.5, 1, 1.5, 2],
        step: 0.5,
        min: 0.5,
      },
      {
        id: 'ml',
        labelEn: 'Millilitres (ml)',
        labelBn: 'মিলি (ml)',
        multiplier: 1 / 250,
        presetAmounts: [100, 200, 250, 500],
        step: 50,
        min: 50,
      },
      {
        id: 'cup',
        labelEn: 'Tea Cup (150ml)',
        labelBn: 'চা কাপ (১৫০ মিলি)',
        multiplier: 150 / 250,
        presetAmounts: [1, 2],
        step: 1,
        min: 1,
      },
    ];
  }

  // 5. Rice / Khichuri (Bhaat)
  if (id.includes('bhaat') || id.includes('rice') || id.includes('khichuri') || name.includes('ভাত') || name.includes('খিচুড়ি')) {
    return [
      {
        id: 'plate',
        labelEn: 'Plate (Medium)',
        labelBn: 'থালা / প্লেট',
        multiplier: 1,
        presetAmounts: [0.5, 1, 1.5, 2],
        step: 0.5,
        min: 0.5,
      },
      {
        id: 'bowl',
        labelEn: 'Bowl (~150g)',
        labelBn: 'বাটি (~১৫০ গ্রাম)',
        multiplier: 0.75,
        presetAmounts: [1, 2, 3],
        step: 1,
        min: 1,
      },
      {
        id: 'gram',
        labelEn: 'Grams (g)',
        labelBn: 'গ্রাম (g)',
        multiplier: 1 / 200,
        presetAmounts: [100, 150, 200, 300],
        step: 50,
        min: 50,
      },
    ];
  }

  // 6. Chicken / Beef / Fish / Meat (Mangsho / Mach)
  if (
    id.includes('murgi') ||
    id.includes('chicken') ||
    id.includes('goru') ||
    id.includes('beef') ||
    id.includes('mach') ||
    id.includes('fish') ||
    name.includes('মাংস') ||
    name.includes('মাছ') ||
    name.includes('চিকেন')
  ) {
    return [
      {
        id: 'piece',
        labelEn: 'Piece (1 pc)',
        labelBn: 'টুকরা / পিস',
        multiplier: 0.5,
        presetAmounts: [1, 2, 3, 4],
        step: 1,
        min: 1,
      },
      {
        id: 'bowl',
        labelEn: 'Bowl (1 bowl)',
        labelBn: '১ বাটি ঝোলসহ',
        multiplier: 1,
        presetAmounts: [0.5, 1, 1.5, 2],
        step: 0.5,
        min: 0.5,
      },
      {
        id: 'gram',
        labelEn: 'Grams (g)',
        labelBn: 'গ্রাম (g)',
        multiplier: 1 / 150,
        presetAmounts: [50, 100, 150, 200],
        step: 25,
        min: 25,
      },
    ];
  }

  // 7. Roti / Paratha
  if (id.includes('ruti') || id.includes('paratha') || name.includes('রুটি') || name.includes('পরোটা')) {
    const isSingle = food.servingSizeEn.includes('1 piece') || food.servingSizeEn.includes('1 ruti') || food.servingSizeEn.includes('1 paratha');
    const baseCount = isSingle ? 1 : 2;
    return [
      {
        id: 'piece',
        labelEn: 'Piece (টি)',
        labelBn: 'টি / পিস',
        multiplier: 1 / baseCount,
        presetAmounts: [1, 2, 3, 4],
        step: 1,
        min: 1,
      },
      {
        id: 'gram',
        labelEn: 'Grams (গ্রাম)',
        labelBn: 'গ্রাম (gm)',
        multiplier: 1 / (baseCount * 60),
        presetAmounts: [60, 120, 180],
        step: 30,
        min: 30,
      },
    ];
  }

  // 8. Daal / Soups / Bhorta
  if (id.includes('daal') || id.includes('bhorta') || name.includes('ডাল') || name.includes('ভর্তা')) {
    return [
      {
        id: 'bowl',
        labelEn: 'Bowl (১ মাঝারি বাটি)',
        labelBn: 'মাঝারি বাটি',
        multiplier: 1,
        presetAmounts: [0.5, 1, 1.5, 2],
        step: 0.5,
        min: 0.5,
      },
      {
        id: 'spoon',
        labelEn: 'Tablespoon (বড় চামচ)',
        labelBn: 'টেবিল চামচ',
        multiplier: 0.2,
        presetAmounts: [2, 3, 4, 5],
        step: 1,
        min: 1,
      },
      {
        id: 'gram',
        labelEn: 'Grams (গ্রাম)',
        labelBn: 'গ্রাম (gm)',
        multiplier: 1 / 150,
        presetAmounts: [50, 100, 150, 200],
        step: 25,
        min: 25,
      },
    ];
  }

  // 9. Mustard Oil / Ghee / Honey
  if (id.includes('tel') || id.includes('oil') || id.includes('ghee') || id.includes('modhu') || name.includes('তেল') || name.includes('মধু') || name.includes('ঘি')) {
    return [
      {
        id: 'spoon',
        labelEn: 'Tablespoon (১ টেবিল চামচ)',
        labelBn: 'টেবিল চামচ (~১৫ মিলি)',
        multiplier: 1,
        presetAmounts: [0.5, 1, 1.5, 2],
        step: 0.5,
        min: 0.5,
      },
      {
        id: 'teaspoon',
        labelEn: 'Teaspoon (চা চামচ)',
        labelBn: 'চা চামচ (~৫ মিলি)',
        multiplier: 0.33,
        presetAmounts: [1, 2, 3, 4],
        step: 1,
        min: 1,
      },
    ];
  }

  // Universal Fallback: Servings & Grams
  return [
    {
      id: 'serving',
      labelEn: 'Serving (সার্ভিং)',
      labelBn: 'সার্ভিং / অংশ',
      multiplier: 1,
      presetAmounts: [0.5, 1, 1.5, 2],
      step: 0.5,
      min: 0.5,
    },
    {
      id: 'gram',
      labelEn: 'Grams (গ্রাম)',
      labelBn: 'গ্রাম (gm)',
      multiplier: 0.01,
      presetAmounts: [50, 100, 150, 200],
      step: 25,
      min: 25,
    },
  ];
}

/**
 * Calculates nutritional totals based on chosen unit and quantity.
 */
export function calculatePortionNutrition(
  food: FoodItem,
  unitOption: FoodUnitOption,
  amount: number,
  oilLevel: 'low' | 'normal' | 'high' = 'normal'
): PortionCalculation {
  const totalMultiplier = unitOption.multiplier * amount;
  let calories = Math.round(food.calories * totalMultiplier);
  const protein = Number((food.protein * totalMultiplier).toFixed(1));
  const carbs = Number((food.carbs * totalMultiplier).toFixed(1));
  let fat = Number((food.fat * totalMultiplier).toFixed(1));

  // Dynamic Cooking Oil Level adjustment (+45 kcal / +5g fat per serving of oil)
  let oilModifierText = '';
  let oilModifierTextBn = '';
  if (oilLevel === 'high') {
    const extraOilCals = Math.round(45 * amount);
    const extraOilFat = Number((5 * amount).toFixed(1));
    calories += extraOilCals;
    fat = Number((fat + extraOilFat).toFixed(1));
    oilModifierText = ' (Beshi Tel / +45 kcal)';
    oilModifierTextBn = ' (বেশি তেল / +৪৫ ক্যালরি)';
  } else if (oilLevel === 'low') {
    const reducedCals = Math.round(30 * amount);
    const reducedFat = Number((3 * amount).toFixed(1));
    calories = Math.max(10, calories - reducedCals);
    fat = Math.max(0, Number((fat - reducedFat).toFixed(1)));
    oilModifierText = ' (Kom Tel)';
    oilModifierTextBn = ' (কম তেল)';
  }

  let displayQuantity = `${amount} ${unitOption.labelEn.split(' ')[0]}`;
  let displayQuantityBn = `${amount} ${unitOption.labelBn.split(' ')[0]}`;

  if (unitOption.id === 'gram') {
    displayQuantity = `${amount}g`;
    displayQuantityBn = `${amount} গ্রাম`;
  } else if (unitOption.id === 'ml') {
    displayQuantity = `${amount}ml`;
    displayQuantityBn = `${amount} মিলি`;
  } else if (unitOption.id === 'piece') {
    displayQuantity = `${amount} pc${amount > 1 ? 's' : ''}`;
    displayQuantityBn = `${amount} টি`;
  } else if (unitOption.id === 'plate') {
    displayQuantity = `${amount} plate${amount > 1 ? 's' : ''}`;
    displayQuantityBn = `${amount} প্লেট`;
  } else if (unitOption.id === 'bowl') {
    displayQuantity = `${amount} bowl${amount > 1 ? 's' : ''}`;
    displayQuantityBn = `${amount} বাটি`;
  } else if (unitOption.id === 'spoon') {
    displayQuantity = `${amount} spoon${amount > 1 ? 's' : ''}`;
    displayQuantityBn = `${amount} চামচ`;
  } else if (unitOption.id === 'cup') {
    displayQuantity = `${amount} cup${amount > 1 ? 's' : ''}`;
    displayQuantityBn = `${amount} কাপ`;
  } else if (unitOption.id === 'glass') {
    displayQuantity = `${amount} glass${amount > 1 ? 'es' : ''}`;
    displayQuantityBn = `${amount} গ্লাস`;
  }

  if (oilModifierText) {
    displayQuantity += oilModifierText;
    displayQuantityBn += oilModifierTextBn;
  }

  return {
    multiplier: totalMultiplier,
    calories,
    protein,
    carbs,
    fat,
    displayQuantity,
    displayQuantityBn,
    oilLevel,
  };
}
