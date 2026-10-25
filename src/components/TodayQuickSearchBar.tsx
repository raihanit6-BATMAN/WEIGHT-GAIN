/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { FoodItem, MealType } from '../types';
import { BANGLADESHI_FOODS } from '../data/bangladeshiFoods';
import { getFoodPortionOptions, calculatePortionNutrition } from '../utils/portionUnits';
import {
  Search,
  X,
  Plus,
  Minus,
  Check,
  Flame,
  Droplets,
  Clock,
  Utensils,
  Soup,
  Coffee,
  Sparkles,
} from 'lucide-react';

interface TodayQuickSearchBarProps {
  onLogFood: (food: FoodItem, servings: number, mealType: MealType) => void;
  lang: 'en' | 'bn';
  initialMealSlot?: MealType;
}

type QuickCategory = 'all' | 'recent' | 'staples' | 'ghoroya' | 'snacks';

const RECENT_FOODS_KEY = 'weightgain_recent_foods_v2';

const BANGLISH_SYNONYMS: Record<string, string[]> = {
  dim: ['egg', 'ডিম', 'dim-bhaji', 'boiled-egg'],
  egg: ['dim', 'ডিম'],
  ande: ['dim', 'egg', 'ডিম'],
  bhaat: ['rice', 'ভাত', 'khichuri', 'bhaat-white'],
  bhat: ['rice', 'ভাত', 'bhaat-white'],
  rice: ['bhaat', 'ভাত', 'khichuri'],
  chal: ['bhaat', 'rice', 'ভাত'],
  chawl: ['bhaat', 'rice', 'ভাত'],
  dal: ['daal', 'ডাল', 'lentil', 'masoor', 'booter'],
  daal: ['dal', 'ডাল', 'lentil'],
  sobji: ['vegetable', 'সবজি', 'panchmishali', 'torkari'],
  shobji: ['vegetable', 'সবজি', 'panchmishali', 'torkari'],
  torkari: ['curry', 'তরকারি', 'sobji', 'potol'],
  shak: ['spinach', 'শাক', 'palong', 'lal', 'pui'],
  shaak: ['spinach', 'শাক'],
  singara: ['shingara', 'সিঙ্গাড়া', 'snack'],
  shingara: ['singara', 'সিঙ্গাড়া'],
  somosa: ['shomosa', 'সমুচা', 'samosa'],
  shomosa: ['somosa', 'সমুচা'],
  puri: ['poori', 'পুরী'],
  cha: ['tea', 'চা', 'dudh-cha', 'lal-cha'],
  tea: ['cha', 'চা'],
  chicken: ['murgi', 'মুরগি', 'morog', 'chicken-curry'],
  murgi: ['chicken', 'মুরগি'],
  fish: ['mach', 'মাছ', 'rui', 'pangash', 'telapia'],
  mach: ['fish', 'মাছ'],
  maach: ['fish', 'মাছ'],
  kola: ['banana', 'কলা'],
  banana: ['kola', 'কলা'],
  ruti: ['roti', 'রুটি', 'bread', 'aata'],
  roti: ['ruti', 'রুটি'],
  porota: ['paratha', 'পরোটা'],
  paratha: ['porota', 'পরোটা'],
  dudh: ['milk', 'দুধ', 'shake'],
  milk: ['dudh', 'দুধ'],
  badam: ['peanut', 'বাদাম', 'almond'],
  peanut: ['badam', 'বাদাম'],
  doi: ['yogurt', 'দই'],
  chira: ['চিড়া', 'flattened-rice'],
  roll: ['shawarma', 'রোল'],
  biscuit: ['toast', 'বিস্কুট'],
  toast: ['biscuit', 'টোস্ট'],
  muglai: ['mughlai', 'মোগলাই'],
  chola: ['boot', 'ছোলা'],
  light: ['150', 'snack', 'halka'],
  halka: ['light', '150'],
  medium: ['300', 'snack'],
  heavy: ['650', 'meal', 'lunch'],
  bhari: ['heavy', '650'],
};

// Automatic meal slot guesser based on local hour
function getDefaultMealType(): MealType {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 10) return 'breakfast';
  if (hour >= 10 && hour < 12) return 'morning_snack';
  if (hour >= 12 && hour < 16) return 'lunch';
  if (hour >= 16 && hour < 19) return 'evening_shake';
  if (hour >= 19 && hour < 22) return 'dinner';
  return 'bedtime';
}

export const TodayQuickSearchBar: React.FC<TodayQuickSearchBarProps> = ({
  onLogFood,
  lang,
  initialMealSlot,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [activeCategory, setActiveCategory] = useState<QuickCategory>('all');
  const [targetMealType, setTargetMealType] = useState<MealType>(initialMealSlot || getDefaultMealType());
  const [recentFoodIds, setRecentFoodIds] = useState<string[]>([]);
  
  // Portion configuration sub-state
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  const [selectedAmount, setSelectedAmount] = useState<number>(1);
  const [selectedOilLevel, setSelectedOilLevel] = useState<'low' | 'normal' | 'high'>('normal');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_FOODS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentFoodIds(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load recent foods:', e);
    }
  }, []);

  const recordRecentFood = (foodId: string) => {
    try {
      const next = [foodId, ...recentFoodIds.filter((id) => id !== foodId)].slice(0, 15);
      setRecentFoodIds(next);
      localStorage.setItem(RECENT_FOODS_KEY, JSON.stringify(next));
    } catch (e) {
      console.error('Failed to save recent food:', e);
    }
  };

  const isStapleFood = (f: FoodItem) => {
    const id = f.id.toLowerCase();
    const cat = f.category;
    return (
      id.includes('dim') ||
      id.includes('bhaat') ||
      id.includes('ruti') ||
      id.includes('paratha') ||
      id.includes('kola') ||
      id.includes('milk') ||
      id.includes('dudh') ||
      id.includes('chicken') ||
      id.includes('murgi') ||
      id.includes('mach') ||
      id.includes('fish') ||
      id.includes('badam') ||
      cat === 'dairy' ||
      (cat === 'carbs' && !id.includes('snack')) ||
      (cat === 'protein' && !id.includes('snack'))
    );
  };

  const isGhoroyaFood = (f: FoodItem) => {
    const id = f.id.toLowerCase();
    const name = (f.nameEn + ' ' + f.nameBn).toLowerCase();
    return (
      f.category === 'home_cooking' ||
      id.includes('sobji') ||
      id.includes('shak') ||
      id.includes('torkari') ||
      id.includes('dal') ||
      id.includes('daal') ||
      name.includes('সবজি') ||
      name.includes('শাক') ||
      name.includes('তরকারি') ||
      name.includes('ডাল')
    );
  };

  const isSnackFood = (f: FoodItem) => {
    const id = f.id.toLowerCase();
    return (
      f.category === 'street_snacks' ||
      id.includes('singara') ||
      id.includes('somosa') ||
      id.includes('puri') ||
      id.includes('cha') ||
      id.includes('roll') ||
      id.includes('biscuit') ||
      id.includes('toast') ||
      id.includes('quick-') ||
      id.includes('mughlai') ||
      id.includes('chola')
    );
  };

  const filteredFoods = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    let pool = BANGLADESHI_FOODS;
    if (activeCategory === 'recent') {
      const recentMap = new Map(BANGLADESHI_FOODS.map((f) => [f.id, f]));
      pool = recentFoodIds
        .map((id) => recentMap.get(id))
        .filter((item): item is FoodItem => item !== undefined);
    } else if (activeCategory === 'staples') {
      pool = BANGLADESHI_FOODS.filter(isStapleFood);
    } else if (activeCategory === 'ghoroya') {
      pool = BANGLADESHI_FOODS.filter(isGhoroyaFood);
    } else if (activeCategory === 'snacks') {
      pool = BANGLADESHI_FOODS.filter(isSnackFood);
    }

    if (!query) {
      return pool.slice(0, 8); // Top results when viewing category without text
    }

    const searchTerms = [query];
    const words = query.split(/\s+/);
    words.forEach((w) => {
      const synonyms = BANGLISH_SYNONYMS[w];
      if (synonyms) searchTerms.push(...synonyms);
    });

    return pool.filter((food) => {
      const targetStr = `${food.nameEn} ${food.nameBn} ${food.id} ${food.category} ${food.servingSizeEn} ${food.servingSizeBn}`.toLowerCase();
      return searchTerms.some((term) => targetStr.includes(term));
    }).slice(0, 10);
  }, [searchTerm, activeCategory, recentFoodIds]);

  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food);
    const units = getFoodPortionOptions(food);
    const initialUnit = units[0];
    setSelectedUnitId(initialUnit ? initialUnit.id : 'serving');
    setSelectedAmount(initialUnit && initialUnit.presetAmounts.length > 0 ? initialUnit.presetAmounts[0] : 1);
    setSelectedOilLevel('normal');
  };

  const currentUnits = selectedFood ? getFoodPortionOptions(selectedFood) : [];
  const currentUnit = currentUnits.find((u) => u.id === selectedUnitId) || currentUnits[0];
  const calculatedNutrition = selectedFood && currentUnit
    ? calculatePortionNutrition(selectedFood, currentUnit, selectedAmount, selectedOilLevel)
    : null;

  const isHomeCookedOrCurry = selectedFood && (
    selectedFood.category === 'home_cooking' ||
    selectedFood.id.includes('sobji') ||
    selectedFood.id.includes('shak') ||
    selectedFood.id.includes('torkari') ||
    selectedFood.id.includes('dal') ||
    selectedFood.nameEn.toLowerCase().includes('curry') ||
    selectedFood.nameBn.includes('তরকারি') ||
    selectedFood.nameBn.includes('ডাল')
  );

  const handleConfirmLog = () => {
    if (!selectedFood || !calculatedNutrition) return;

    const formattedFood: FoodItem = {
      ...selectedFood,
      servingSizeEn: calculatedNutrition.displayQuantity,
      servingSizeBn: calculatedNutrition.displayQuantityBn,
    };

    onLogFood(formattedFood, calculatedNutrition.multiplier, targetMealType);
    recordRecentFood(selectedFood.id);

    const loggedName = lang === 'bn' ? selectedFood.nameBn : selectedFood.nameEn;
    setSuccessToast(`${loggedName} (+${calculatedNutrition.calories} kcal)`);
    
    setTimeout(() => {
      setSelectedFood(null);
      setSearchTerm('');
      setIsFocused(false);
      setSuccessToast(null);
    }, 800);
  };

  const handleQuickAdd1x = (e: React.MouseEvent, food: FoodItem) => {
    e.stopPropagation();
    onLogFood(food, 1, targetMealType);
    recordRecentFood(food.id);

    const loggedName = lang === 'bn' ? food.nameBn : food.nameEn;
    setSuccessToast(`${loggedName} (+${food.calories} kcal)`);

    setTimeout(() => {
      setSuccessToast(null);
      setSearchTerm('');
      setIsFocused(false);
    }, 600);
  };

  const mealSlots: { type: MealType; labelEn: string; labelBn: string }[] = [
    { type: 'breakfast', labelEn: 'Breakfast', labelBn: 'সকালের নাস্তা' },
    { type: 'morning_snack', labelEn: 'Mid-Morning', labelBn: 'সকালের স্ন্যাক' },
    { type: 'lunch', labelEn: 'Lunch', labelBn: 'দুপুরের খাবার' },
    { type: 'evening_shake', labelEn: 'Afternoon / Shake', labelBn: 'বিকালে শেক/নাস্তা' },
    { type: 'dinner', labelEn: 'Dinner', labelBn: 'রাতের খাবার' },
    { type: 'bedtime', labelEn: 'Bedtime Milk', labelBn: 'ঘুমানোর আগে' },
  ];

  const quickStapleChips = [
    { label: lang === 'bn' ? 'ডিম (Egg)' : 'Egg (Dim)', query: 'dim' },
    { label: lang === 'bn' ? 'ভাত (Rice)' : 'Rice (Bhaat)', query: 'bhaat' },
    { label: lang === 'bn' ? 'ডাল (Dal)' : 'Dal', query: 'dal' },
    { label: lang === 'bn' ? 'সিঙ্গাড়া' : 'Singara', query: 'singara' },
    { label: lang === 'bn' ? 'দুধ চা' : 'Dudh Cha', query: 'dudh cha' },
    { label: lang === 'bn' ? 'কলা (Kola)' : 'Kola', query: 'kola' },
  ];

  const isOpenDropdown = isFocused || Boolean(searchTerm) || Boolean(selectedFood);

  return (
    <div
      ref={containerRef}
      className={`rounded-2xl transition-all duration-200 border ${
        isOpenDropdown
          ? 'bg-zinc-900 border-emerald-500/60 shadow-xl shadow-emerald-950/40 p-3 sm:p-4'
          : 'bg-zinc-900/90 hover:bg-zinc-900 border-zinc-800 p-2.5 sm:p-3 shadow-sm'
      }`}
    >
      {/* Toast Notification */}
      {successToast && (
        <div className="mb-2.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-zinc-950 font-black text-xs shadow-lg flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-1.5 truncate">
            <Check className="w-4 h-4 stroke-[3]" />
            <span className="truncate">{successToast}</span>
          </div>
          <span className="text-[10px] uppercase font-bold text-emerald-950">Logged!</span>
        </div>
      )}

      {/* Main Search Input Bar */}
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onFocus={() => setIsFocused(true)}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              lang === 'bn'
                ? '🔍 খাবার খুঁজুন (যেমন: dim, bhaat, dal, sobji, singara, cha)...'
                : '🔍 Search food to log (e.g. dim, bhaat, dal, sobji, singara, cha)...'
            }
            className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700/80 hover:border-zinc-600 focus:border-emerald-500 text-white placeholder-zinc-500 text-xs sm:text-sm font-medium focus:outline-none transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedFood(null);
                inputRef.current?.focus();
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-zinc-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Meal Slot Picker (Compact inline badge) */}
        <select
          value={targetMealType}
          onChange={(e) => setTargetMealType(e.target.value as MealType)}
          className="bg-zinc-800 border border-zinc-700 text-emerald-400 font-bold text-xs rounded-xl px-2.5 py-2.5 focus:outline-none focus:border-emerald-500 cursor-pointer shrink-0"
        >
          {mealSlots.map((slot) => (
            <option key={slot.type} value={slot.type} className="bg-zinc-900 text-white">
              {lang === 'bn' ? slot.labelBn : slot.labelEn}
            </option>
          ))}
        </select>
      </div>

      {/* When Closed: Quick Suggestions Chips */}
      {!isOpenDropdown && (
        <div className="flex items-center gap-1.5 mt-2 overflow-x-auto scrollbar-none text-xs">
          <span className="text-[10px] text-zinc-400 uppercase font-bold shrink-0">
            {lang === 'bn' ? 'কুইক লগ:' : 'Quick:'}
          </span>
          {quickStapleChips.map((chip) => (
            <button
              key={chip.query}
              type="button"
              onClick={() => {
                setSearchTerm(chip.query);
                setIsFocused(true);
              }}
              className="px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 hover:border-emerald-500/50 border border-zinc-700/60 text-zinc-300 text-[11px] font-medium whitespace-nowrap transition-all active:scale-95"
            >
              +{chip.label}
            </button>
          ))}
        </div>
      )}

      {/* When Active/Open: Category Pills + Results or Portion Config */}
      {isOpenDropdown && (
        <div className="mt-3 space-y-3 pt-2 border-t border-zinc-800 animate-in fade-in">
          {/* Quick Category Filter Pills */}
          <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 scrollbar-none text-xs">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setActiveCategory('all');
                  setSelectedFood(null);
                }}
                className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-all ${
                  activeCategory === 'all'
                    ? 'bg-emerald-600 text-zinc-950 shadow-sm'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                {lang === 'bn' ? 'সকল' : 'All'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveCategory('recent');
                  setSelectedFood(null);
                }}
                className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                  activeCategory === 'recent'
                    ? 'bg-emerald-600 text-zinc-950 shadow-sm'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                <Clock className="w-3 h-3" />
                <span>{lang === 'bn' ? 'রিসেন্ট' : 'Recent'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveCategory('staples');
                  setSelectedFood(null);
                }}
                className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                  activeCategory === 'staples'
                    ? 'bg-emerald-600 text-zinc-950 shadow-sm'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                <Utensils className="w-3 h-3" />
                <span>{lang === 'bn' ? 'প্রধান খাবার' : 'Staples'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveCategory('ghoroya');
                  setSelectedFood(null);
                }}
                className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                  activeCategory === 'ghoroya'
                    ? 'bg-emerald-600 text-zinc-950 shadow-sm'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                <Soup className="w-3 h-3" />
                <span>{lang === 'bn' ? 'ঘরোয়া ডাল-সবজি' : 'Sobji/Dal'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveCategory('snacks');
                  setSelectedFood(null);
                }}
                className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                  activeCategory === 'snacks'
                    ? 'bg-emerald-600 text-zinc-950 shadow-sm'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                <Coffee className="w-3 h-3" />
                <span>{lang === 'bn' ? 'নাস্তা' : 'Snacks'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsFocused(false);
                setSearchTerm('');
                setSelectedFood(null);
              }}
              className="text-[11px] text-zinc-400 hover:text-white px-2 py-0.5 rounded hover:bg-zinc-800 shrink-0 font-medium"
            >
              ✕ {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
            </button>
          </div>

          {/* Portion Configuration Mode (When food is selected) */}
          {selectedFood && calculatedNutrition && currentUnit ? (
            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-emerald-500/50 space-y-3 animate-in fade-in">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => setSelectedFood(null)}
                    className="text-[10px] font-bold text-zinc-400 hover:text-emerald-400 flex items-center gap-1 mb-0.5"
                  >
                    <span>← {lang === 'bn' ? 'তালিকায় ফিরুন' : 'Back to list'}</span>
                  </button>
                  <h4 className="text-sm font-black text-white truncate">
                    {lang === 'bn' ? selectedFood.nameBn : selectedFood.nameEn}
                  </h4>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-sm sm:text-base font-black text-emerald-400 block leading-none">
                    ~{calculatedNutrition.calories} kcal
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    {calculatedNutrition.protein}g protein
                  </span>
                </div>
              </div>

              {/* Unit Options */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                  {lang === 'bn' ? 'একক নির্বাচন করুন:' : 'Portion Unit:'}
                </span>
                <div className="flex flex-wrap gap-1">
                  {currentUnits.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        setSelectedUnitId(u.id);
                        if (u.presetAmounts.length > 0) setSelectedAmount(u.presetAmounts[0]);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        selectedUnitId === u.id
                          ? 'bg-emerald-600 text-zinc-950'
                          : 'bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/80'
                      }`}
                    >
                      {lang === 'bn' ? u.labelBn : u.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stepper */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-zinc-900 border border-zinc-700 rounded-xl p-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const step = currentUnit.step || 1;
                      const min = currentUnit.min || (currentUnit.id === 'gram' ? 25 : 0.5);
                      setSelectedAmount((prev) => Math.max(min, Number((prev - step).toFixed(1))));
                    }}
                    className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center active:scale-90"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-12 text-center font-black text-white text-sm">
                    {selectedAmount}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const step = currentUnit.step || 1;
                      setSelectedAmount((prev) => Number((prev + step).toFixed(1)));
                    }}
                    className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center active:scale-90"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Preset Chips */}
                <div className="flex items-center gap-1 flex-wrap">
                  {currentUnit.presetAmounts.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setSelectedAmount(p)}
                      className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all ${
                        selectedAmount === p
                          ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                          : 'bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700/60'
                      }`}
                    >
                      {p}{currentUnit.id === 'gram' ? 'g' : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Oil level if home-cooked */}
              {isHomeCookedOrCurry && (
                <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-center justify-between gap-2 text-xs">
                  <span className="text-[11px] text-amber-300 font-bold flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-amber-400" />
                    <span>{lang === 'bn' ? 'তেল:' : 'Oil:'}</span>
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setSelectedOilLevel('normal')}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                        selectedOilLevel === 'normal'
                          ? 'bg-zinc-800 text-white border border-zinc-600'
                          : 'text-zinc-400'
                      }`}
                    >
                      {lang === 'bn' ? 'স্বাভাবিক' : 'Normal'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedOilLevel('high')}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 ${
                        selectedOilLevel === 'high'
                          ? 'bg-amber-500 text-zinc-950'
                          : 'text-amber-400 bg-amber-950/40'
                      }`}
                    >
                      <Flame className="w-2.5 h-2.5 fill-current" />
                      <span>{lang === 'bn' ? 'বেশি তেল (+৪৫)' : 'Extra (+45 kcal)'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Confirm Button */}
              <button
                type="button"
                onClick={handleConfirmLog}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/50 active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>
                  {lang === 'bn'
                    ? `${mealSlots.find((s) => s.type === targetMealType)?.labelBn}-এ যোগ করুন`
                    : `Add to ${mealSlots.find((s) => s.type === targetMealType)?.labelEn}`}
                </span>
              </button>
            </div>
          ) : (
            /* Results List */
            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {filteredFoods.length === 0 ? (
                <div className="py-6 text-center text-xs text-zinc-400">
                  {lang === 'bn' ? 'কোনো খাবার পাওয়া যায়নি' : 'No foods found matching query.'}
                </div>
              ) : (
                filteredFoods.map((food) => (
                  <div
                    key={food.id}
                    onClick={() => handleSelectFood(food)}
                    className="p-2 sm:p-2.5 rounded-xl bg-zinc-950/70 hover:bg-zinc-800/80 border border-zinc-800 hover:border-emerald-500/50 flex items-center justify-between gap-2 cursor-pointer transition-all active:scale-[0.99]"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <h5 className="text-xs font-bold text-white truncate">
                          {lang === 'bn' ? food.nameBn : food.nameEn}
                        </h5>
                        <span className="text-[10px] text-zinc-400 font-mono shrink-0">
                          ~{food.calories} kcal
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-400 truncate block">
                        {food.protein}g prot · {food.servingSizeBn}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleQuickAdd1x(e, food)}
                      className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-emerald-600 hover:text-zinc-950 text-emerald-400 text-xs font-bold border border-zinc-700/80 flex items-center gap-0.5 shrink-0 transition-colors shadow-sm"
                      title={lang === 'bn' ? '১টি যোগ করুন' : 'Add 1 serving'}
                    >
                      <Plus className="w-3 h-3 stroke-[2.5]" />
                      <span className="text-[10px]">{lang === 'bn' ? 'যোগ' : 'Add'}</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
