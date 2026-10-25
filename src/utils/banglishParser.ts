/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FoodItem, MealType } from '../types';
import { BANGLADESHI_FOODS } from '../data/bangladeshiFoods';

export interface ParsedMealSegment {
  foodId: string;
  foodNameEn: string;
  foodNameBn: string;
  quantity: number;
  unitEn: string;
  unitBn: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  matchedKeyword: string;
  originalFoodItem?: FoodItem;
}

export interface BanglishParseResult {
  rawInput: string;
  segments: ParsedMealSegment[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  suggestedMealType: MealType;
}

interface KeywordDictionaryEntry {
  patterns: RegExp[];
  foodId: string;
  defaultUnitEn: string;
  defaultUnitBn: string;
  baseCalories: number;
  baseProtein: number;
  baseCarbs: number;
  baseFat: number;
  baseServingSize: number; // e.g. 1 pc, 1 cup, 1 bati, 1 plate
}

const DICTIONARY: KeywordDictionaryEntry[] = [
  // Street & Bakery Snacks
  {
    patterns: [/\bs+h?i[nng]+g[a|e]?r[a|e]?\b/i, /সিঙ্গাড়া/i],
    foodId: 'singara-hot',
    defaultUnitEn: 'piece',
    defaultUnitBn: 'টি',
    baseCalories: 160,
    baseProtein: 2.0,
    baseCarbs: 18.0,
    baseFat: 10.0,
    baseServingSize: 1,
  },
  {
    patterns: [/\bs[ao]m[ou]s[ah]?\b/i, /\bsamu[ct]ha\b/i, /সমুচা/i],
    foodId: 'somosa-hot',
    defaultUnitEn: 'piece',
    defaultUnitBn: 'টি',
    baseCalories: 150,
    baseProtein: 2.0,
    baseCarbs: 16.0,
    baseFat: 9.0,
    baseServingSize: 1,
  },
  {
    patterns: [/\b(dal|alu)?\s*p[ou]r[ie]\b/i, /পুরী/i],
    foodId: 'dal-alu-puri',
    defaultUnitEn: 'piece',
    defaultUnitBn: 'টি',
    baseCalories: 150,
    baseProtein: 2.0,
    baseCarbs: 16.0,
    baseFat: 9.0,
    baseServingSize: 1,
  },
  {
    patterns: [/\bm[ou]gh?lai\b/i, /\bmoglai\b/i, /মোগলাই/i],
    foodId: 'mughlai-paratha',
    defaultUnitEn: 'slice',
    defaultUnitBn: 'স্লাইস',
    baseCalories: 230,
    baseProtein: 6.0,
    baseCarbs: 20.0,
    baseFat: 14.0,
    baseServingSize: 1,
  },
  {
    patterns: [/\bdudh?\s*ch?a\b/i, /\bmilk\s*tea\b/i, /\btonger\s*ch?a\b/i, /দুধ\s*চা/i],
    foodId: 'dudh-cha-sweet',
    defaultUnitEn: 'cup',
    defaultUnitBn: 'কাপ',
    baseCalories: 90,
    baseProtein: 2.0,
    baseCarbs: 14.0,
    baseFat: 3.0,
    baseServingSize: 1,
  },
  {
    patterns: [/\blal\s*ch?a\b/i, /\brong?\s*ch?a\b/i, /\bblack\s*tea\b/i, /লাল\s*চা/i, /রং\s*চা/i],
    foodId: 'lal-cha-sweet',
    defaultUnitEn: 'cup',
    defaultUnitBn: 'কাপ',
    baseCalories: 35,
    baseProtein: 0.0,
    baseCarbs: 8.0,
    baseFat: 0.0,
    baseServingSize: 1,
  },
  {
    patterns: [/\bch?a\b/i, /\btea\b/i, /চা\b/i],
    foodId: 'dudh-cha-sweet',
    defaultUnitEn: 'cup',
    defaultUnitBn: 'কাপ',
    baseCalories: 90,
    baseProtein: 2.0,
    baseCarbs: 14.0,
    baseFat: 3.0,
    baseServingSize: 1,
  },
  {
    patterns: [/\bch?ola\s*(boot)?\b/i, /\bboot\b/i, /ছোলা/i, /বুট/i],
    foodId: 'chola-boot-outside',
    defaultUnitEn: 'bowl (100g)',
    defaultUnitBn: 'বাটি (১০০ গ্রাম)',
    baseCalories: 200,
    baseProtein: 8.0,
    baseCarbs: 25.0,
    baseFat: 7.0,
    baseServingSize: 1,
  },
  {
    patterns: [/\b(chicken\s*)?roll\b/i, /\bsha?warma\b/i, /\bsharma\b/i, /রোল/i, /শার্মা/i],
    foodId: 'chicken-roll-shawarma',
    defaultUnitEn: 'piece',
    defaultUnitBn: 'টি',
    baseCalories: 320,
    baseProtein: 14.0,
    baseCarbs: 30.0,
    baseFat: 14.0,
    baseServingSize: 1,
  },
  {
    patterns: [/\bbis[ck]u[it]\b/i, /\btoast\b/i, /বিস্কুট/i, /টোস্ট/i],
    foodId: 'bakery-biscuit-toast',
    defaultUnitEn: 'pcs',
    defaultUnitBn: 'টি',
    baseCalories: 65, // per 1 pc
    baseProtein: 1.0,
    baseCarbs: 11.0,
    baseFat: 2.5,
    baseServingSize: 1,
  },

  // Home Cooking (Ghoroya Ranna)
  {
    patterns: [/\bpanch\s*mishali\b/i, /\bmixed\s*veg(gie)?\b/i, /\bshobji\b/i, /\bsobji\b/i, /সবজি/i],
    foodId: 'panchmishali-sobji',
    defaultUnitEn: 'bowl (~150g)',
    defaultUnitBn: 'বাটি (~১৫০ গ্রাম)',
    baseCalories: 120,
    baseProtein: 2.0,
    baseCarbs: 15.0,
    baseFat: 6.0,
    baseServingSize: 1,
  },
  {
    patterns: [/\bsh?ak\s*(bhaji)?\b/i, /\blal\s*sh?ak\b/i, /\bpalong\b/i, /\bpui\s*sh?ak\b/i, /শাক/i],
    foodId: 'shak-bhaji-oil',
    defaultUnitEn: 'bowl (~150g)',
    defaultUnitBn: 'বাটি (~১৫০ গ্রাম)',
    baseCalories: 95,
    baseProtein: 3.0,
    baseCarbs: 6.0,
    baseFat: 7.0,
    baseServingSize: 1,
  },
  {
    patterns: [/\bpotol\b/i, /\blau\b/i, /\bpepe\b/i, /\btorkari\b/i, /তরকারি/i, /পটল/i, /লাউ/i],
    foodId: 'potol-alu-lau-torkari',
    defaultUnitEn: 'bowl (~150g)',
    defaultUnitBn: 'বাটি (~১৫০ গ্রাম)',
    baseCalories: 110,
    baseProtein: 2.0,
    baseCarbs: 18.0,
    baseFat: 4.0,
    baseServingSize: 1,
  },
  {
    patterns: [/\bpatla\s*dal\b/i, /\bpatla\s*masoor\b/i, /পাতলা\s*ডাল/i],
    foodId: 'patla-masoor-dal',
    defaultUnitEn: 'bowl (~150g)',
    defaultUnitBn: 'বাটি (~১৫০ গ্রাম)',
    baseCalories: 85,
    baseProtein: 5.0,
    baseCarbs: 12.0,
    baseFat: 1.5,
    baseServingSize: 1,
  },
  {
    patterns: [/\bgh?on\s*dal\b/i, /\bbhuna\s*dal\b/i, /\bgha?ro\s*dal\b/i, /ঘন\s*ডাল/i, /ভুনা\s*ডাল/i],
    foodId: 'ghon-bhuna-dal',
    defaultUnitEn: 'bowl (~150g)',
    defaultUnitBn: 'বাটি (~১৫০ গ্রাম)',
    baseCalories: 175,
    baseProtein: 10.0,
    baseCarbs: 22.0,
    baseFat: 5.0,
    baseServingSize: 1,
  },
  {
    patterns: [/\bbooter\s*dal\b/i, /\bcholar\s*dal\b/i, /ছোলার\s*ডাল/i, /বুটের\s*ডাল/i],
    foodId: 'cholar-booter-dal',
    defaultUnitEn: 'bowl (~150g)',
    defaultUnitBn: 'বাটি (~১৫০ গ্রাম)',
    baseCalories: 210,
    baseProtein: 11.0,
    baseCarbs: 28.0,
    baseFat: 6.0,
    baseServingSize: 1,
  },
  {
    patterns: [/\bda?l\b/i, /ডাল/i],
    foodId: 'patla-masoor-dal',
    defaultUnitEn: 'bowl (~150g)',
    defaultUnitBn: 'বাটি (~১৫০ গ্রাম)',
    baseCalories: 85,
    baseProtein: 5.0,
    baseCarbs: 12.0,
    baseFat: 1.5,
    baseServingSize: 1,
  },

  // Staples (Bhaat, Ruti, Dim, Banana, Shakes)
  {
    patterns: [/\bbh?aat\b/i, /\brice\b/i, /\bvaat\b/i, /ভাত/i],
    foodId: 'bhaat-white-rice',
    defaultUnitEn: 'plate',
    defaultUnitBn: 'প্লেট',
    baseCalories: 260,
    baseProtein: 5.0,
    baseCarbs: 57.0,
    baseFat: 0.8,
    baseServingSize: 1,
  },
  {
    patterns: [/\bkhichuri\b/i, /\bkhichdi\b/i, /খিচুড়ি/i],
    foodId: 'mug-daal-bhuna-khichuri',
    defaultUnitEn: 'plate',
    defaultUnitBn: 'প্লেট',
    baseCalories: 520,
    baseProtein: 15.0,
    baseCarbs: 78.0,
    baseFat: 17.0,
    baseServingSize: 1,
  },
  {
    patterns: [/\bpo?ro[t|th]a\b/i, /পরোটা/i],
    foodId: 'paratha-plain',
    defaultUnitEn: 'piece',
    defaultUnitBn: 'টি',
    baseCalories: 195,
    baseProtein: 3.8,
    baseCarbs: 26.0,
    baseFat: 8.5,
    baseServingSize: 1,
  },
  {
    patterns: [/\bruti\b/i, /\broti\b/i, /রুটি/i],
    foodId: 'ruti-lal-atta',
    defaultUnitEn: 'piece',
    defaultUnitBn: 'টি',
    baseCalories: 110,
    baseProtein: 3.8,
    baseCarbs: 23.0,
    baseFat: 0.5,
    baseServingSize: 1,
  },
  {
    patterns: [/\bdi?m\b/i, /\begg\b/i, /\banda\b/i, /ডিম/i],
    foodId: 'dim-poach-mustard',
    defaultUnitEn: 'piece',
    defaultUnitBn: 'টি',
    baseCalories: 100,
    baseProtein: 6.5,
    baseCarbs: 0.5,
    baseFat: 8.0,
    baseServingSize: 1,
  },
  {
    patterns: [/\bkola\b/i, /\bbanana\b/i, /কলা/i],
    foodId: 'kola-sagor-shobri',
    defaultUnitEn: 'piece',
    defaultUnitBn: 'টি',
    baseCalories: 105,
    baseProtein: 1.3,
    baseCarbs: 27.0,
    baseFat: 0.3,
    baseServingSize: 1,
  },
  {
    patterns: [/\bbadam\b/i, /\bpeanut\b/i, /বাদাম/i],
    foodId: 'chini-badam-roasted',
    defaultUnitEn: 'fistful (~30g)',
    defaultUnitBn: 'এক মুঠো (~৩০ গ্রাম)',
    baseCalories: 170,
    baseProtein: 7.8,
    baseCarbs: 4.8,
    baseFat: 14.5,
    baseServingSize: 1,
  },
  {
    patterns: [/\bdudh\b/i, /\bmilk\b/i, /দুধ/i],
    foodId: 'aarong-full-cream-milk',
    defaultUnitEn: 'glass (250ml)',
    defaultUnitBn: '১ গ্লাস (২৫০ মিলি)',
    baseCalories: 165,
    baseProtein: 8.5,
    baseCarbs: 12.0,
    baseFat: 9.5,
    baseServingSize: 1,
  },

  // Generic Quick Guesses
  {
    patterns: [/\bhalka\s*nas[ht]a\b/i, /\blight\s*snack\b/i, /হালকা\s*নাস্তা/i],
    foodId: 'quick-light-snack',
    defaultUnitEn: 'portion',
    defaultUnitBn: 'অংশ',
    baseCalories: 150,
    baseProtein: 3.0,
    baseCarbs: 20.0,
    baseFat: 6.0,
    baseServingSize: 1,
  },
  {
    patterns: [/\b(medium|fried)\s*snack\b/i, /\btel\s*(moslar?\s*)?nas[ht]a\b/i, /তেল-মসলার\s*নাস্তা/i],
    foodId: 'quick-medium-snack',
    defaultUnitEn: 'portion',
    defaultUnitBn: 'অংশ',
    baseCalories: 300,
    baseProtein: 5.0,
    baseCarbs: 35.0,
    baseFat: 15.0,
    baseServingSize: 1,
  },
  {
    patterns: [/\bheavy\s*(outside\s*)?meal\b/i, /\bbhorpet\b/i, /ভরপেট\s*খাবার/i],
    foodId: 'quick-heavy-meal',
    defaultUnitEn: 'full meal',
    defaultUnitBn: 'ভরপেট খাবার',
    baseCalories: 650,
    baseProtein: 18.0,
    baseCarbs: 75.0,
    baseFat: 30.0,
    baseServingSize: 1,
  },
];

/**
 * Extracts a numeric quantity from a text fragment (e.g. "2 ta", "1 cup", "half", "duita", "এক").
 */
function extractQuantity(text: string): { quantity: number; cleanText: string } {
  const lower = text.trim().toLowerCase();

  // Word-based numbers in Bengali & Banglish
  const wordNumbers: { [key: string]: number } = {
    half: 0.5,
    'adha': 0.5,
    'half plate': 0.5,
    'ek': 1,
    'akta': 1,
    'ekta': 1,
    '১': 1,
    'এক': 1,
    'dui': 2,
    'duita': 2,
    'duta': 2,
    '২': 2,
    'দুই': 2,
    'tin': 3,
    'tinta': 3,
    '৩': 3,
    'তিন': 3,
    'char': 4,
    'charta': 4,
    '৪': 4,
    'চার': 4,
    'paach': 5,
    'pachta': 5,
    '৫': 5,
    'পাঁচ': 5,
  };

  // Check explicit leading digit pattern like "2 ta", "2.5", "1/2", "3pcs"
  const digitMatch = lower.match(/^(\d+(?:\.\d+)?)\s*(?:ta|ti|pc|pcs|cup|bati|plate|slice|glass|gm|g|gram)?\s*(.*)/i);
  if (digitMatch) {
    const val = parseFloat(digitMatch[1]);
    if (!isNaN(val) && val > 0) {
      return { quantity: val, cleanText: digitMatch[2].trim() };
    }
  }

  // Check word number prefixes
  for (const [w, num] of Object.entries(wordNumbers)) {
    const regex = new RegExp(`^${w}\\s*(?:ta|ti|pc|pcs|cup|bati|plate|slice|glass)?\\s+(.*)`, 'i');
    const match = lower.match(regex);
    if (match) {
      return { quantity: num, cleanText: match[1].trim() };
    }
  }

  // Look for trailing number like "singara 2 ta"
  const trailingDigit = lower.match(/(.*?)\s+(\d+(?:\.\d+)?)\s*(?:ta|ti|pc|pcs|cup|bati|plate|slice|glass)?$/i);
  if (trailingDigit) {
    const val = parseFloat(trailingDigit[2]);
    if (!isNaN(val) && val > 0) {
      return { quantity: val, cleanText: trailingDigit[1].trim() };
    }
  }

  // Default quantity = 1
  return { quantity: 1, cleanText: lower };
}

/**
 * Parses freeform natural language Banglish / Bengali text into structured food segments.
 * Example input: "2 ta singara ar 1 cup dudh cha" -> [2x Singara, 1x Dudh Cha]
 */
export function parseBanglishMealInput(input: string): BanglishParseResult {
  const rawInput = input.trim();
  if (!rawInput) {
    return {
      rawInput,
      segments: [],
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      suggestedMealType: 'evening_shake',
    };
  }

  // Split clauses by common connectors: "ar", "o", "ebong", "and", "+", ",", "sathe"
  const clauses = rawInput
    .split(/\s+(?:ar|ebong|and|sathe|o|\+|,)\s+|\s*,\s*/i)
    .map((c) => c.trim())
    .filter(Boolean);

  const segments: ParsedMealSegment[] = [];

  for (const clause of clauses) {
    const { quantity, cleanText } = extractQuantity(clause);

    // Find best match in DICTIONARY
    let matchedEntry: KeywordDictionaryEntry | null = null;
    let matchedKw = '';

    for (const entry of DICTIONARY) {
      for (const pattern of entry.patterns) {
        if (pattern.test(cleanText) || pattern.test(clause)) {
          matchedEntry = entry;
          matchedKw = clause;
          break;
        }
      }
      if (matchedEntry) break;
    }

    if (matchedEntry) {
      // Find matching item in BANGLADESHI_FOODS
      const foundFood = BANGLADESHI_FOODS.find((f) => f.id === matchedEntry!.foodId);
      const nameEn = foundFood ? foundFood.nameEn : cleanText;
      const nameBn = foundFood ? foundFood.nameBn : cleanText;

      const calories = Math.round(matchedEntry.baseCalories * quantity);
      const protein = Number((matchedEntry.baseProtein * quantity).toFixed(1));
      const carbs = Number((matchedEntry.baseCarbs * quantity).toFixed(1));
      const fat = Number((matchedEntry.baseFat * quantity).toFixed(1));

      segments.push({
        foodId: matchedEntry.foodId,
        foodNameEn: nameEn,
        foodNameBn: nameBn,
        quantity,
        unitEn: matchedEntry.defaultUnitEn,
        unitBn: matchedEntry.defaultUnitBn,
        calories,
        protein,
        carbs,
        fat,
        matchedKeyword: matchedKw || cleanText,
        originalFoodItem: foundFood,
      });
    } else {
      // Fallback: Guess as a generic medium snack if unrecognized
      segments.push({
        foodId: `custom-quick-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        foodNameEn: clause,
        foodNameBn: clause,
        quantity,
        unitEn: 'serving',
        unitBn: 'সার্ভিং',
        calories: Math.round(200 * quantity),
        protein: Number((4 * quantity).toFixed(1)),
        carbs: Number((25 * quantity).toFixed(1)),
        fat: Number((9 * quantity).toFixed(1)),
        matchedKeyword: clause,
      });
    }
  }

  const totalCalories = segments.reduce((sum, s) => sum + s.calories, 0);
  const totalProtein = Number(segments.reduce((sum, s) => sum + s.protein, 0).toFixed(1));
  const totalCarbs = Number(segments.reduce((sum, s) => sum + s.carbs, 0).toFixed(1));
  const totalFat = Number(segments.reduce((sum, s) => sum + s.fat, 0).toFixed(1));

  // Determine intelligent suggested meal slot based on foods or time
  let suggestedMealType: MealType = 'evening_shake';
  const combined = rawInput.toLowerCase();
  if (combined.includes('bhaat') || combined.includes('rice') || combined.includes('curry') || combined.includes('dal')) {
    suggestedMealType = 'lunch';
  } else if (combined.includes('porota') || combined.includes('ruti') || combined.includes('dim') || combined.includes('breakfast')) {
    suggestedMealType = 'breakfast';
  } else if (combined.includes('cha') || combined.includes('singara') || combined.includes('somosa') || combined.includes('biscuit')) {
    suggestedMealType = 'evening_shake';
  } else if (combined.includes('dudh') || combined.includes('milk') || combined.includes('bedtime')) {
    suggestedMealType = 'bedtime';
  }

  return {
    rawInput,
    segments,
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
    suggestedMealType,
  };
}
