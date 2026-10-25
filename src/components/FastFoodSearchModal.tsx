/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FoodItem, MealType, FoodUnitOption } from '../types';
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
  Sparkles,
  Utensils,
  Soup,
  Coffee,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';

interface FastFoodSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMealType?: MealType;
  onLogFood: (food: FoodItem, servings: number, mealType: MealType) => void;
  lang: 'en' | 'bn';
}

type QuickCategory = 'all' | 'recent' | 'staples' | 'ghoroya' | 'snacks';

const RECENT_FOODS_KEY = 'weightgain_recent_foods_v2';

// Keyword synonym mapping for Banglish & phonetic search queries
const BANGLISH_SYNONYMS: Record<string, string[]> = {
  dim: ['egg', 'ডিম', 'dim-bhaji', 'boiled-egg'],
  egg: ['dim', 'ডিম', 'egg'],
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

export const FastFoodSearchModal: React.FC<FastFoodSearchModalProps> = ({
  isOpen,
  onClose,
  initialMealType = 'lunch',
  onLogFood,
  lang,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<QuickCategory>('all');
  const [selectedMealType, setSelectedMealType] = useState<MealType>(initialMealType);
  const [recentFoodIds, setRecentFoodIds] = useState<string[]>([]);
  
  // Portion Selection Sub-state
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  const [selectedAmount, setSelectedAmount] = useState<number>(1);
  const [selectedOilLevel, setSelectedOilLevel] = useState<'low' | 'normal' | 'high'>('normal');
  const [justLoggedMessage, setJustLoggedMessage] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync initial meal type when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedMealType(initialMealType);
      setSelectedFood(null);
      setSearchTerm('');
      setActiveCategory('all');
      
      // Load recent food IDs
      try {
        const stored = localStorage.getItem(RECENT_FOODS_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setRecentFoodIds(parsed);
          }
        }
      } catch (err) {
        console.error('Failed to load recent foods:', err);
      }

      // Auto-focus search input with small timeout for smooth animation
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialMealType]);

  // Persist recent food ID to localStorage
  const recordRecentFood = (foodId: string) => {
    try {
      const next = [foodId, ...recentFoodIds.filter((id) => id !== foodId)].slice(0, 15);
      setRecentFoodIds(next);
      localStorage.setItem(RECENT_FOODS_KEY, JSON.stringify(next));
    } catch (err) {
      console.error('Failed to save recent food:', err);
    }
  };

  // Pre-categorize items
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

  // Filtered & Ranked Food List
  const filteredFoods = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    // 1. Initial category partition
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
      return pool;
    }

    // 2. Expand query with Banglish synonyms
    const searchTerms = [query];
    const words = query.split(/\s+/);
    words.forEach((w) => {
      const synonyms = BANGLISH_SYNONYMS[w];
      if (synonyms) {
        searchTerms.push(...synonyms);
      }
    });

    return pool.filter((food) => {
      const targetStr = `${food.nameEn} ${food.nameBn} ${food.id} ${food.category} ${food.servingSizeEn} ${food.servingSizeBn} ${food.weightGainTipEn} ${food.weightGainTipBn}`.toLowerCase();
      return searchTerms.some((term) => targetStr.includes(term));
    });
  }, [searchTerm, activeCategory, recentFoodIds]);

  // When a user selects a food to configure portion
  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food);
    const units = getFoodPortionOptions(food);
    const initialUnit = units[0];
    setSelectedUnitId(initialUnit ? initialUnit.id : 'serving');
    setSelectedAmount(initialUnit && initialUnit.presetAmounts.length > 0 ? initialUnit.presetAmounts[0] : 1);
    setSelectedOilLevel('normal');
  };

  // Portion calculations for selected food
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
    selectedFood.id.includes('daal') ||
    selectedFood.nameEn.toLowerCase().includes('curry') ||
    selectedFood.nameBn.includes('তরকারি') ||
    selectedFood.nameBn.includes('ডাল') ||
    selectedFood.nameBn.includes('ভাজি')
  );

  const handleConfirmLog = () => {
    if (!selectedFood || !calculatedNutrition || !currentUnit) return;

    const formattedFood: FoodItem = {
      ...selectedFood,
      servingSizeEn: calculatedNutrition.displayQuantity,
      servingSizeBn: calculatedNutrition.displayQuantityBn,
    };

    onLogFood(formattedFood, calculatedNutrition.multiplier, selectedMealType);
    recordRecentFood(selectedFood.id);

    const loggedName = lang === 'bn' ? selectedFood.nameBn : selectedFood.nameEn;
    setJustLoggedMessage(`${loggedName} (+${calculatedNutrition.calories} kcal)`);
    
    // Reset selection and close after brief visual feedback
    setTimeout(() => {
      setSelectedFood(null);
      setJustLoggedMessage(null);
      onClose();
    }, 700);
  };

  // Quick 1-tap add with default portion
  const handleQuickAddDefault = (e: React.MouseEvent, food: FoodItem) => {
    e.stopPropagation();
    onLogFood(food, 1, selectedMealType);
    recordRecentFood(food.id);

    const loggedName = lang === 'bn' ? food.nameBn : food.nameEn;
    setJustLoggedMessage(`${loggedName} (+${food.calories} kcal)`);

    setTimeout(() => {
      setJustLoggedMessage(null);
      onClose();
    }, 600);
  };

  if (!isOpen) return null;

  const mealSlots: { type: MealType; labelEn: string; labelBn: string }[] = [
    { type: 'breakfast', labelEn: 'Breakfast', labelBn: 'সকালের নাস্তা' },
    { type: 'morning_snack', labelEn: 'Mid-Morning', labelBn: 'সকালের স্ন্যাক' },
    { type: 'lunch', labelEn: 'Lunch', labelBn: 'দুপুরের খাবার' },
    { type: 'evening_shake', labelEn: 'Afternoon / Shake', labelBn: 'বিকালে শেক/নাস্তা' },
    { type: 'dinner', labelEn: 'Dinner', labelBn: 'রাতের খাবার' },
    { type: 'bedtime', labelEn: 'Bedtime Milk', labelBn: 'ঘুমানোর আগে' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full sm:max-w-xl max-h-[92vh] sm:max-h-[85vh] bg-zinc-900 border border-zinc-800 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-zinc-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Header: Target Meal Slot & Close */}
        <div className="p-3.5 sm:p-4 border-b border-zinc-800 bg-zinc-950/70 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {lang === 'bn' ? 'খাবার যোগ করুন' : 'Log Food'}
            </span>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-xs text-zinc-400 font-medium">to:</span>
              <select
                value={selectedMealType}
                onChange={(e) => setSelectedMealType(e.target.value as MealType)}
                className="bg-zinc-800 border border-zinc-700 text-white font-bold text-xs rounded-xl px-2.5 py-1 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {mealSlots.map((slot) => (
                  <option key={slot.type} value={slot.type}>
                    {lang === 'bn' ? slot.labelBn : slot.labelEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Toast Overlay inside modal */}
        {justLoggedMessage && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-emerald-600 text-zinc-950 font-black text-xs shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{justLoggedMessage}</span>
          </div>
        )}

        {/* Auto-focused Search Bar */}
        <div className="p-3 sm:p-4 pb-2 shrink-0 space-y-3 bg-zinc-900">
          <div className="relative">
            <Search className="w-5 h-5 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                lang === 'bn'
                  ? 'খাবার খুঁজুন (যেমন: dim, bhaat, dal, sobji, singara, cha, chicken)...'
                  : 'Search food (e.g. dim, bhaat, dal, sobji, singara, cha, chicken)...'
              }
              className="w-full pl-11 pr-10 py-3 rounded-2xl bg-zinc-950 border border-zinc-700/80 hover:border-zinc-600 focus:border-emerald-500 text-white placeholder-zinc-500 text-sm font-medium focus:outline-none transition-all shadow-inner"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                activeCategory === 'all'
                  ? 'bg-emerald-600 text-zinc-950 shadow-md shadow-emerald-950/50'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700/60'
              }`}
            >
              {lang === 'bn' ? 'সকল (All)' : 'All Foods'}
            </button>

            <button
              type="button"
              onClick={() => setActiveCategory('recent')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeCategory === 'recent'
                  ? 'bg-emerald-600 text-zinc-950 shadow-md shadow-emerald-950/50'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700/60'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'সম্প্রতি খাওয়া' : 'Recent'}</span>
              {recentFoodIds.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-950/70 text-emerald-400 font-mono">
                  {recentFoodIds.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveCategory('staples')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeCategory === 'staples'
                  ? 'bg-emerald-600 text-zinc-950 shadow-md shadow-emerald-950/50'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700/60'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'প্রধান খাবার (Staples)' : 'Staples'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCategory('ghoroya')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeCategory === 'ghoroya'
                  ? 'bg-emerald-600 text-zinc-950 shadow-md shadow-emerald-950/50'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700/60'
              }`}
            >
              <Soup className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'ঘরোয়া ডাল-সবজি' : 'Ghoroya Sobji/Dal'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCategory('snacks')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeCategory === 'snacks'
                  ? 'bg-emerald-600 text-zinc-950 shadow-md shadow-emerald-950/50'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700/60'
              }`}
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'বাইরের নাস্তা (Snacks)' : 'Outside/Snacks'}</span>
            </button>
          </div>
        </div>

        {/* Content Area: Search Results or Portion Config Sheet */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-2 space-y-2">
          {/* Portion Configuration Mode (When food is tapped) */}
          {selectedFood && calculatedNutrition && currentUnit ? (
            <div className="p-4 rounded-3xl bg-zinc-950 border border-emerald-500/50 shadow-xl space-y-4 animate-in fade-in slide-in-from-bottom-2">
              {/* Selected Food Header with back button */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => setSelectedFood(null)}
                    className="text-[11px] font-bold text-zinc-400 hover:text-emerald-400 flex items-center gap-1 mb-1 transition-colors"
                  >
                    <span>← {lang === 'bn' ? 'তালিকায় ফিরে যান' : 'Back to results'}</span>
                  </button>
                  <h3 className="text-base sm:text-lg font-black text-white truncate">
                    {lang === 'bn' ? selectedFood.nameBn : selectedFood.nameEn}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {lang === 'bn' ? selectedFood.servingSizeBn : selectedFood.servingSizeEn}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-lg sm:text-xl font-black text-emerald-400 block">
                    ~{calculatedNutrition.calories} kcal
                  </span>
                  <span className="text-xs text-zinc-400 block">
                    {calculatedNutrition.protein}g protein
                  </span>
                </div>
              </div>

              {/* 1. Unit Selector Buttons */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300 block">
                  {lang === 'bn' ? 'একক নির্বাচন করুন (Select Portion Unit):' : 'Select Portion Unit:'}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {currentUnits.map((unit) => (
                    <button
                      key={unit.id}
                      type="button"
                      onClick={() => {
                        setSelectedUnitId(unit.id);
                        if (unit.presetAmounts.length > 0) {
                          setSelectedAmount(unit.presetAmounts[0]);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        selectedUnitId === unit.id
                          ? 'bg-emerald-600 text-zinc-950 shadow-md shadow-emerald-950/40'
                          : 'bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/80'
                      }`}
                    >
                      {lang === 'bn' ? unit.labelBn : unit.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Quantity Stepper & Quick Preset Chips */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300 block">
                  {lang === 'bn' ? 'পরিমাণ (Quantity):' : 'Quantity:'}
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-zinc-900 border border-zinc-700 rounded-2xl p-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        const step = currentUnit.step || 1;
                        const min = currentUnit.min || (currentUnit.id === 'gram' ? 25 : 0.5);
                        setSelectedAmount((prev) => Math.max(min, Number((prev - step).toFixed(1))));
                      }}
                      className="w-9 h-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center transition-colors active:scale-90"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <span className="w-16 text-center font-black text-white text-base">
                      {selectedAmount}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        const step = currentUnit.step || 1;
                        setSelectedAmount((prev) => Number((prev + step).toFixed(1)));
                      }}
                      className="w-9 h-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center transition-colors active:scale-90"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Preset Quick Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {currentUnit.presetAmounts.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setSelectedAmount(preset)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                          selectedAmount === preset
                            ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/60'
                            : 'bg-zinc-800/80 text-zinc-400 hover:text-white border border-zinc-700/60'
                        }`}
                      >
                        {preset}{currentUnit.id === 'gram' ? 'g' : ''}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Optional Oil Level Toggle for Home-Cooked Dishes */}
              {isHomeCookedOrCurry && (
                <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-300 flex items-center gap-1.5">
                      <Droplets className="w-3.5 h-3.5 text-amber-400" />
                      <span>{lang === 'bn' ? 'রান্নার তেলের পরিমাণ:' : 'Cooking Oil Level:'}</span>
                    </span>
                    {selectedOilLevel === 'high' && (
                      <span className="text-[10px] font-black text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/40">
                        +45 kcal • +5g fat
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setSelectedOilLevel('normal')}
                      className={`py-1.5 px-2.5 rounded-xl font-bold transition-all text-center ${
                        selectedOilLevel === 'normal'
                          ? 'bg-zinc-800 text-white border border-zinc-600'
                          : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {lang === 'bn' ? 'স্বাভাবিক তেল' : 'Normal Oil'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedOilLevel('high')}
                      className={`py-1.5 px-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1 ${
                        selectedOilLevel === 'high'
                          ? 'bg-amber-500 text-zinc-950 font-black shadow-md shadow-amber-950/50'
                          : 'bg-zinc-900/80 text-amber-400 hover:bg-amber-950/30'
                      }`}
                    >
                      <Flame className="w-3.5 h-3.5 fill-current" />
                      <span>{lang === 'bn' ? 'বেশি তেল (+৪৫ kcal)' : 'Extra Oil (+45 kcal)'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 4. Live Nutrition Breakdown & Add Button */}
              <div className="pt-2 border-t border-zinc-800 space-y-3">
                <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
                  <div className="p-1.5 rounded-xl bg-zinc-900 border border-zinc-800">
                    <span className="text-[8px] uppercase text-zinc-400 block font-semibold">Calories</span>
                    <strong className="text-white text-xs font-bold block">{calculatedNutrition.calories}</strong>
                  </div>
                  <div className="p-1.5 rounded-xl bg-emerald-950/40 border border-emerald-900/50">
                    <span className="text-[8px] uppercase text-emerald-400 block font-semibold">Protein</span>
                    <strong className="text-emerald-300 text-xs font-bold block">{calculatedNutrition.protein}g</strong>
                  </div>
                  <div className="p-1.5 rounded-xl bg-sky-950/40 border border-sky-900/50">
                    <span className="text-[8px] uppercase text-sky-400 block font-semibold">Carbs</span>
                    <strong className="text-sky-300 text-xs font-bold block">{calculatedNutrition.carbs}g</strong>
                  </div>
                  <div className="p-1.5 rounded-xl bg-amber-950/40 border border-amber-900/50">
                    <span className="text-[8px] uppercase text-amber-400 block font-semibold">Fat</span>
                    <strong className="text-amber-300 text-xs font-bold block">{calculatedNutrition.fat}g</strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmLog}
                  className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-black text-sm transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/60 active:scale-95"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>
                    {lang === 'bn'
                      ? `${mealSlots.find((s) => s.type === selectedMealType)?.labelBn}-এ যোগ করুন`
                      : `Add to ${mealSlots.find((s) => s.type === selectedMealType)?.labelEn}`}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            /* Food Results List */
            <div className="space-y-2">
              {filteredFoods.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <p className="text-zinc-400 text-sm font-medium">
                    {lang === 'bn'
                      ? 'কোনো খাবার পাওয়া যায়নি।'
                      : 'No foods found matching your search.'}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {lang === 'bn'
                      ? 'চেষ্টা করুন: dim, bhaat, dal, singara, cha, banana, kola...'
                      : 'Try searching: "dim", "bhaat", "dal", "singara", "cha", "kola"...'}
                  </p>
                </div>
              ) : (
                filteredFoods.map((food) => {
                  const isHome = isGhoroyaFood(food);
                  const isSnack = isSnackFood(food);

                  return (
                    <div
                      key={food.id}
                      onClick={() => handleSelectFood(food)}
                      className="p-3 sm:p-3.5 rounded-2xl bg-zinc-950/80 hover:bg-zinc-800/80 border border-zinc-800/90 hover:border-emerald-500/50 transition-all flex items-center justify-between gap-3 cursor-pointer group shadow-sm active:scale-[0.99]"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {isHome && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              {lang === 'bn' ? 'ঘরোয়া' : 'Home'}
                            </span>
                          )}
                          {isSnack && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              {lang === 'bn' ? 'নাস্তা' : 'Snack'}
                            </span>
                          )}
                          <span className="text-[10px] text-zinc-400 font-mono truncate max-w-[150px]">
                            {lang === 'bn' ? food.servingSizeBn : food.servingSizeEn}
                          </span>
                        </div>

                        <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-300 transition-colors mt-0.5 truncate">
                          {lang === 'bn' ? food.nameBn : food.nameEn}
                        </h4>

                        <span className="text-[10px] text-zinc-400">
                          {food.protein}g protein · {food.carbs}g carbs · {food.fat}g fat
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <div className="text-right">
                          <span className="text-xs sm:text-sm font-black text-emerald-400 block whitespace-nowrap">
                            ~{food.calories} kcal
                          </span>
                        </div>

                        {/* Quick 1-tap add button with default 1 portion */}
                        <button
                          type="button"
                          onClick={(e) => handleQuickAddDefault(e, food)}
                          className="w-8 h-8 rounded-xl bg-zinc-800 hover:bg-emerald-600 hover:text-zinc-950 text-emerald-400 border border-zinc-700/80 flex items-center justify-center transition-all shadow-sm active:scale-90"
                          title={lang === 'bn' ? '১ পরিবেশন সরাসরি যোগ করুন' : 'Quick add 1 serving'}
                        >
                          <Plus className="w-4 h-4 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
