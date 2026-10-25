/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { FoodItem, FoodCategory, MealType, LoggedMealItem } from '../types';
import { BANGLADESHI_FOODS } from '../data/bangladeshiFoods';
import { Search, Plus, Sparkles, Filter, Check, Flame, RotateCcw, Utensils, Wand2, Soup, Info, Droplets } from 'lucide-react';
import { getFoodPortionOptions, calculatePortionNutrition } from '../utils/portionUnits';
import { SmartFoodInputBar } from './SmartFoodInputBar';
import { QuickCalorieGuesser } from './QuickCalorieGuesser';
import { ParsedMealSegment } from '../utils/banglishParser';

interface FoodDirectoryViewProps {
  onLogFood: (food: FoodItem, servings: number, mealType: MealType) => void;
  onLogSegments?: (segments: ParsedMealSegment[], mealType: MealType) => void;
  onLogCustomItem?: (item: LoggedMealItem) => void;
  onOpenSearchModal?: () => void;
  lang: 'en' | 'bn';
  initialMealType?: MealType;
}

export const FoodDirectoryView: React.FC<FoodDirectoryViewProps> = ({
  onLogFood,
  onLogSegments,
  onLogCustomItem,
  onOpenSearchModal,
  lang,
  initialMealType = 'breakfast',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyBudgetHeroes, setOnlyBudgetHeroes] = useState(false);

  // Selected food for logging modal
  const [loggingFood, setLoggingFood] = useState<FoodItem | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  const [selectedAmount, setSelectedAmount] = useState<number>(1);
  const [selectedOilLevel, setSelectedOilLevel] = useState<'low' | 'normal' | 'high'>('normal');
  const [selectedMealType, setSelectedMealType] = useState<MealType>(initialMealType);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quick tools switcher inside food directory
  const [activeSubTab, setActiveSubTab] = useState<'directory' | 'home_cooking' | 'smart_input' | 'guesser'>('directory');

  // Dedicated Home Cooking / Deshi dishes list
  const homeCookingFoods = useMemo(() => {
    return BANGLADESHI_FOODS.filter((food) => food.category === 'home_cooking');
  }, []);

  // Section-level Cooking Oil Level toggle for Ghoroya Ranna ('normal' or 'high')
  // When toggled to 'high', adds 45 kcal and 5g fat across all home-cooked meals
  const [cookingOilLevel, setCookingOilLevel] = useState<'normal' | 'high'>('normal');

  // Custom food form modal state
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCalories, setCustomCalories] = useState<number>(250);
  const [customProtein, setCustomProtein] = useState<number>(10);
  const [customServing, setCustomServing] = useState('1 plate');
  const [customCategory, setCustomCategory] = useState<FoodCategory>('carbs');

  const categories = [
    { id: 'all', labelEn: 'All Foods', labelBn: 'সকল খাবার' },
    { id: 'home_cooking', labelEn: 'Ghoroya Ranna / Deshi Dishes', labelBn: 'ঘরোয়া রান্না ও ডাল-সবজি' },
    { id: 'street_snacks', labelEn: 'Street & Bakery Snacks', labelBn: 'বাইরের খাবার ও নাস্তা' },
    { id: 'protein', labelEn: 'Protein (Egg/Meat/Fish)', labelBn: 'প্রোটিন (ডিম/মাছ/মাংস)' },
    { id: 'carbs', labelEn: 'Carbs (Rice/Paratha)', labelBn: 'কার্বস (ভাত/পরোটা)' },
    { id: 'fats_nuts', labelEn: 'Nuts & Healthy Fats', labelBn: 'বাদাম ও তেল/ঘি' },
    { id: 'dairy', labelEn: 'Milk & Yogurt', labelBn: 'দুধ ও দই' },
    { id: 'shakes', labelEn: 'Weight Gain Shakes', labelBn: 'পাওয়ার শেক' },
    { id: 'fruits', labelEn: 'Bananas & Fruits', labelBn: 'কলা ও খেজুর' },
  ];

  const filteredFoods = useMemo(() => {
    return BANGLADESHI_FOODS.filter((food) => {
      const matchesSearch =
        food.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        food.nameBn.includes(searchTerm) ||
        food.weightGainTipEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        food.weightGainTipBn.includes(searchTerm);

      const matchesCategory =
        selectedCategory === 'all' || food.category === selectedCategory;

      const matchesBudget = !onlyBudgetHeroes || !!food.isBudgetHero;

      return matchesSearch && matchesCategory && matchesBudget;
    });
  }, [searchTerm, selectedCategory, onlyBudgetHeroes]);

  const handleOpenLogModal = (food: FoodItem, preferredOil?: 'low' | 'normal' | 'high') => {
    const units = getFoodPortionOptions(food);
    setLoggingFood(food);
    const initialUnit = units[0];
    setSelectedUnitId(initialUnit ? initialUnit.id : 'serving');
    setSelectedAmount(initialUnit && initialUnit.presetAmounts.length > 0 ? initialUnit.presetAmounts[0] : 1);
    setSelectedOilLevel(preferredOil || (food.category === 'home_cooking' ? cookingOilLevel : 'normal'));
    setSelectedMealType(initialMealType || 'lunch');
  };

  const handleSelectUnit = (unitId: string) => {
    setSelectedUnitId(unitId);
    if (!loggingFood) return;
    const units = getFoodPortionOptions(loggingFood);
    const targetUnit = units.find((u) => u.id === unitId);
    if (targetUnit && targetUnit.presetAmounts.length > 0) {
      setSelectedAmount(targetUnit.presetAmounts[0]);
    }
  };

  const currentUnits = loggingFood ? getFoodPortionOptions(loggingFood) : [];
  const currentUnit = currentUnits.find((u) => u.id === selectedUnitId) || currentUnits[0];
  const calculatedNutrition = loggingFood && currentUnit
    ? calculatePortionNutrition(loggingFood, currentUnit, selectedAmount, selectedOilLevel)
    : null;

  const handleConfirmLog = () => {
    if (!loggingFood || !calculatedNutrition || !currentUnit) return;

    const formattedFood: FoodItem = {
      ...loggingFood,
      servingSizeEn: calculatedNutrition.displayQuantity,
      servingSizeBn: calculatedNutrition.displayQuantityBn,
    };

    onLogFood(formattedFood, calculatedNutrition.multiplier, selectedMealType);
    const addedName = lang === 'bn' ? loggingFood.nameBn : loggingFood.nameEn;
    setToastMessage(
      lang === 'bn'
        ? `${addedName} (${calculatedNutrition.displayQuantityBn}) যুক্ত করা হয়েছে!`
        : `Logged ${addedName} (${calculatedNutrition.displayQuantity})!`
    );
    setLoggingFood(null);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddCustomFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newCustomItem: FoodItem = {
      id: `custom-${Date.now()}`,
      nameEn: customName,
      nameBn: customName,
      category: customCategory,
      servingSizeEn: customServing,
      servingSizeBn: customServing,
      calories: Number(customCalories) || 200,
      protein: Number(customProtein) || 5,
      carbs: Math.round(Number(customCalories) * 0.12),
      fat: Math.round(Number(customCalories) * 0.04),
      estimatedPriceBdt: 30,
      marketUnitEn: 'Local bazaar',
      marketUnitBn: 'স্থানীয় বাজার',
      availability: 'high',
      weightGainTipEn: 'Custom logged item for Bangladeshi nutrition tracking.',
      weightGainTipBn: 'কাস্টম খাবার তালিকাভুক্ত করা হয়েছে।',
      iconType: 'bowl',
    };

    onLogFood(newCustomItem, 1, selectedMealType);
    setShowCustomModal(false);
    setCustomName('');
    setToastMessage(lang === 'bn' ? 'কাস্টম খাবার যুক্ত হয়েছে!' : 'Custom food added!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-4 pb-20 max-w-3xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-emerald-600 text-zinc-950 font-bold text-xs shadow-2xl flex items-center gap-1.5 animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Search */}
      <section className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-md space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              {lang === 'bn' ? 'বাংলাদেশি খাদ্য ডিরেক্টরি' : 'Bangladeshi Food Directory'}
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              {lang === 'bn'
                ? 'বাংলাদেশের বাজারে সহজে প্রাপ্য উচ্চ ক্যালরি ও পুষ্টিকর খাবার (গ্রাম, পিস ও বাটি অনুযায়ী বাছাই করুন)'
                : 'High-calorie & muscle-building foods in Bangladesh with flexible portions (grams, pieces, plates)'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onOpenSearchModal && (
              <button
                type="button"
                onClick={onOpenSearchModal}
                className="text-xs px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-950/40 active:scale-95"
              >
                <Search className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{lang === 'bn' ? 'দ্রুত সার্চ ও লগ' : 'Instant Search & Log'}</span>
              </button>
            )}

            <button
              onClick={() => setShowCustomModal(true)}
              className="text-xs px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 transition-colors font-medium flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              {lang === 'bn' ? 'কাস্টম খাবার যোগ' : 'Add Custom Food'}
            </button>
          </div>
        </div>

        {/* Quick Mode Switcher */}
        <div className="flex items-center gap-1 p-1 bg-zinc-950/80 rounded-xl border border-zinc-800 text-xs overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveSubTab('directory')}
            className={`py-1.5 px-2.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'directory'
                ? 'bg-emerald-600 text-zinc-950 shadow-md shadow-emerald-950/40'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'সকল খাবার' : 'All Foods'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('home_cooking')}
            className={`py-1.5 px-2.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'home_cooking'
                ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-950/40'
                : 'text-emerald-400 hover:text-white bg-emerald-950/40 border border-emerald-800/40'
            }`}
          >
            <Soup className="w-3.5 h-3.5" />
            <span>&apos;Ghoroya Ranna&apos; (Deshi Dishes)</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold uppercase hidden sm:inline">
              বাটি/প্লেট
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('smart_input')}
            className={`py-1.5 px-2.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'smart_input'
                ? 'bg-emerald-600 text-zinc-950 shadow-md shadow-emerald-950/40'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'স্মার্ট ইনপুট' : 'Smart Input'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('guesser')}
            className={`py-1.5 px-2.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'guesser'
                ? 'bg-amber-600 text-zinc-950 shadow-md shadow-amber-950/40'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'কুইক গেসার' : 'Quick Guesser'}</span>
          </button>
        </div>

        {activeSubTab === 'smart_input' && (
          <div className="pt-2">
            <SmartFoodInputBar
              onLogSegments={(segments, mealType) => {
                if (onLogSegments) {
                  onLogSegments(segments, mealType);
                } else {
                  segments.forEach((s) => {
                    onLogFood(
                      s.originalFoodItem || {
                        id: s.foodId,
                        nameEn: s.foodNameEn,
                        nameBn: s.foodNameBn,
                        category: 'street_snacks',
                        servingSizeEn: s.unitEn,
                        servingSizeBn: s.unitBn,
                        calories: s.calories,
                        protein: s.protein,
                        carbs: s.carbs,
                        fat: s.fat,
                        availability: 'high',
                        weightGainTipEn: 'Logged via smart input',
                        weightGainTipBn: 'স্মার্ট ইনপুট দিয়ে যোগ করা হয়েছে',
                        iconType: 'snack',
                      },
                      s.quantity,
                      mealType
                    );
                  });
                }
              }}
              lang={lang}
            />
          </div>
        )}

        {activeSubTab === 'guesser' && (
          <div className="pt-2">
            <QuickCalorieGuesser
              onLogCustomItem={(item) => {
                if (onLogCustomItem) {
                  onLogCustomItem(item);
                } else {
                  onLogFood(
                    {
                      id: item.foodId,
                      nameEn: item.foodNameEn,
                      nameBn: item.foodNameBn,
                      category: 'street_snacks',
                      servingSizeEn: item.servingUnitEn,
                      servingSizeBn: item.servingUnitBn,
                      calories: item.calories,
                      protein: item.protein,
                      carbs: item.carbs,
                      fat: item.fat,
                      availability: 'high',
                      weightGainTipEn: 'Quick estimated outside item',
                      weightGainTipBn: 'অনুমানকৃত বাইরের খাবার',
                      iconType: 'snack',
                    },
                    1,
                    item.mealType
                  );
                }
              }}
              lang={lang}
            />
          </div>
        )}

        {/* Directory Search & Filter Controls (shown in All Foods mode) */}
        {activeSubTab === 'directory' && (
          <div className="space-y-3 pt-1">
            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={
                  lang === 'bn'
                    ? 'খাবারের নাম খুঁজুন (যেমন: চিনাবাদাম, ডিম, কলা, দুধ, পরোটা, ভাত...)'
                    : 'Search foods (e.g. Peanuts, Dim, Banana, Milk, Paratha, Rice, Daal...)'
                }
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700 text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2.5 text-xs text-zinc-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-zinc-950 font-bold shadow-md shadow-emerald-900/40'
                        : 'bg-zinc-800 hover:bg-zinc-700/80 text-zinc-300 border border-zinc-700/60'
                    }`}
                  >
                    {lang === 'bn' ? cat.labelBn : cat.labelEn}
                  </button>
                );
              })}
            </div>

            {/* Budget Hero Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-xs">
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-zinc-300">
                  {lang === 'bn' ? 'ফলাফল দেখাচ্ছে:' : 'Showing:'} <strong>{filteredFoods.length}</strong> {lang === 'bn' ? 'টি দেশি খাবার' : 'local foods'}
                </span>
              </div>

              <button
                onClick={() => setOnlyBudgetHeroes(!onlyBudgetHeroes)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1.5 ${
                  onlyBudgetHeroes
                    ? 'bg-amber-950/70 border-amber-500 text-amber-300 font-bold'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Flame className="w-3 h-3 text-amber-400" />
                <span>{lang === 'bn' ? 'উচ্চ ক্যালরি ঘনত্ব' : 'High Calorie Dense'}</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* SECTION: Ghoroya Ranna / Deshi Dishes (Authentic Home Cooking) */}
      {activeSubTab === 'home_cooking' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Header & Household Portion Units Explainer Card */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-emerald-950/80 via-zinc-900 to-zinc-900 border border-emerald-500/40 shadow-xl space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-emerald-950/50">
                  <Soup className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-black text-white">
                      {lang === 'bn' ? 'ঘরোয়া রান্না ও ডাল-সবজি (Ghoroya Ranna)' : 'Ghoroya Ranna / Deshi Dishes'}
                    </h2>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Authentic Deshi
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed">
                    {lang === 'bn'
                      ? 'বাঙালি পরিবারের প্রতিদিনের সবজি ও ডালের খাঁটি পুষ্টিমান। স্ট্যান্ডার্ড ঘরোয়া একক (১ বাটি, ১ প্লেট, চামচ) দিয়ে সহজেই সঠিক ক্যালরি হিসাব করুন।'
                      : 'Authentic everyday Bangladeshi home-cooked dishes with verified nutrition and standard household portion units (1 বাটি, 1 প্লেট, চামচ).'}
                  </p>
                </div>
              </div>
            </div>

            {/* Standard Household Units Cheatsheet (1 বাটি, 1 প্লেট, চামচ) */}
            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-zinc-300 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{lang === 'bn' ? 'স্ট্যান্ডার্ড ঘরোয়া পরিমাপ গাইড:' : 'Standard Household Portion Guide:'}</span>
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">Household Standards</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800/90 space-y-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-emerald-400 font-extrabold text-xs">১ বাটি (Small Bowl)</strong>
                    <span className="text-[10px] text-emerald-300/80 font-mono font-bold">~150g</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-snug">
                    {lang === 'bn'
                      ? 'বাঙালি পরিবারের স্বাভাবিক ১ বাটি তরকারি বা ডাল (বেস সার্ভিং)।'
                      : 'Standard family vegetable or dal bowl (baseline single serving).'}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800/90 space-y-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-sky-400 font-extrabold text-xs">১ প্লেট (Full Plate)</strong>
                    <span className="text-[10px] text-sky-300/80 font-mono font-bold">~300g</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-snug">
                    {lang === 'bn'
                      ? 'ভাতের সাথে সম্পূর্ণ প্লেট ডাল বা সবজি মেখে খাওয়ার দ্বিগুণ পরিবেশন।'
                      : 'Full plate serving with rice (double portion for high-calorie days).'}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800/90 space-y-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-amber-400 font-extrabold text-xs">১ চামচ (Serving Spoon)</strong>
                    <span className="text-[10px] text-amber-300/80 font-mono font-bold">~40g</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-snug">
                    {lang === 'bn'
                      ? 'বড় হাতা/চামচ দিয়ে অতিরিক্ত পরিবেশন নেওয়া।'
                      : 'Large serving ladle/spoon for fractional additions or small toppings.'}
                  </p>
                </div>
              </div>

              {/* Cooking Oil Level Interactive Toggle Switch */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-950/60 via-zinc-950/80 to-amber-950/40 border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 shadow-inner">
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Droplets className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-xs sm:text-sm font-bold text-white">
                      {lang === 'bn' ? 'রান্নার তেলের পরিমাণ (Cooking Oil Level):' : 'Cooking Oil Level Adjustment:'}
                    </span>
                    {cookingOilLevel === 'high' && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/25 text-amber-300 border border-amber-500/50 animate-pulse">
                        +45 kcal • +5g fat
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-snug">
                    {lang === 'bn'
                      ? 'বেশি তেল বা ভুনায় রান্না হলে টগল করুন—প্রতিটি খাবারে স্বয়ংক্রিয়ভাবে +৪৫ ক্যালরি ও +৫ গ্রাম ফ্যাট যোগ হবে।'
                      : 'Toggle Extra Oil to add +45 kcal and +5g fat per serving across all home-cooked dishes (ideal for active bulking!).'}
                  </p>
                </div>

                <div className="flex items-center bg-zinc-900/90 p-1 rounded-xl border border-zinc-700/80 shrink-0 gap-1 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setCookingOilLevel('normal')}
                    className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      cookingOilLevel === 'normal'
                        ? 'bg-zinc-800 text-white shadow-sm border border-zinc-600'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span>{lang === 'bn' ? 'স্বাভাবিক তেল' : 'Normal Oil'}</span>
                    <span className="text-[10px] text-zinc-400 font-mono">(0)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCookingOilLevel('high')}
                    className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      cookingOilLevel === 'high'
                        ? 'bg-amber-500 text-zinc-950 font-black shadow-md shadow-amber-950/50'
                        : 'text-amber-400 hover:text-amber-300 hover:bg-amber-950/30'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5 fill-current" />
                    <span>{lang === 'bn' ? 'বেশি তেল / ভুনা' : 'Extra Oil (+45 kcal)'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Home Cooking Dishes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {homeCookingFoods.map((food) => {
              const isExtraOil = cookingOilLevel === 'high';
              const displayedCalories = food.calories + (isExtraOil ? 45 : 0);
              const displayedFat = Number((food.fat + (isExtraOil ? 5.0 : 0)).toFixed(1));

              return (
                <div
                  key={food.id}
                  className={`p-4 sm:p-4.5 rounded-3xl bg-zinc-900 border transition-all flex flex-col justify-between space-y-3.5 shadow-md ${
                    isExtraOil
                      ? 'border-amber-500/50 hover:border-amber-400/70 shadow-amber-950/30'
                      : 'border-emerald-900/40 hover:border-emerald-500/50'
                  }`}
                >
                  <div>
                    {/* Top Bar: Food Name & Calories */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            {lang === 'bn' ? 'ঘরোয়া খাবার' : 'Home Cooked'}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-mono">
                            {lang === 'bn' ? '১ বাটি (~১৫০g)' : '1 bowl (~150g)'}
                          </span>
                          {isExtraOil && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                              <Flame className="w-2.5 h-2.5" />
                              <span>+45 kcal oil</span>
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-white mt-1 break-words">
                          {lang === 'bn' ? food.nameBn : food.nameEn}
                        </h3>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`text-sm sm:text-base font-black block whitespace-nowrap ${
                            isExtraOil ? 'text-amber-400' : 'text-emerald-400'
                          }`}
                        >
                          ~{displayedCalories} kcal
                        </span>
                        <span className="text-[10px] text-zinc-400 block whitespace-nowrap">
                          {food.protein}g protein
                        </span>
                        {isExtraOil && (
                          <span className="text-[10px] font-semibold text-amber-300/90 block whitespace-nowrap">
                            {displayedFat}g fat (+5g)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Standard Household Units Supported */}
                    <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                      <span className="text-[10px] px-2 py-0.5 rounded-lg bg-zinc-950/80 border border-zinc-800 text-emerald-300 font-medium">
                        {lang === 'bn' ? '১ বাটি (~১৫০g)' : '1 বাটি (~150g)'}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-lg bg-zinc-950/80 border border-zinc-800 text-sky-300 font-medium">
                        {lang === 'bn' ? '১ প্লেট (~৩০০g)' : '1 প্লেট (~300g)'}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-lg bg-zinc-950/80 border border-zinc-800 text-amber-300 font-medium">
                        {lang === 'bn' ? '১ চামচ (~৪০g)' : '১ চামচ (~40g)'}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-lg bg-zinc-950/80 border border-zinc-800 text-zinc-400 font-mono">
                        {lang === 'bn' ? 'গ্রাম (Grams)' : 'Grams'}
                      </span>
                    </div>

                    {/* Macros Breakdown */}
                    <div className="grid grid-cols-4 gap-1.5 mt-3 text-center text-xs">
                      <div
                        className={`p-1 rounded-xl transition-colors ${
                          isExtraOil ? 'bg-amber-950/50 border border-amber-500/50' : 'bg-zinc-950/60 border border-zinc-800'
                        }`}
                      >
                        <span className="text-[8px] uppercase text-zinc-400 block font-semibold">Calories</span>
                        <strong
                          className={`text-xs font-bold block ${
                            isExtraOil ? 'text-amber-300 font-black' : 'text-white'
                          }`}
                        >
                          {displayedCalories}
                        </strong>
                      </div>
                      <div className="p-1 rounded-xl bg-emerald-950/40 border border-emerald-900/50">
                        <span className="text-[8px] uppercase text-emerald-400 block font-semibold">Protein</span>
                        <strong className="text-emerald-300 text-xs font-bold block">{food.protein}g</strong>
                      </div>
                      <div className="p-1 rounded-xl bg-sky-950/40 border border-sky-900/50">
                        <span className="text-[8px] uppercase text-sky-400 block font-semibold">Carbs</span>
                        <strong className="text-sky-300 text-xs font-bold block">{food.carbs}g</strong>
                      </div>
                      <div
                        className={`p-1 rounded-xl transition-colors ${
                          isExtraOil ? 'bg-amber-950/50 border border-amber-500/50' : 'bg-amber-950/40 border border-amber-900/50'
                        }`}
                      >
                        <span className="text-[8px] uppercase text-amber-400 block font-semibold">Fat</span>
                        <strong
                          className={`text-xs font-bold block ${
                            isExtraOil ? 'text-amber-300 font-black' : 'text-amber-300'
                          }`}
                        >
                          {displayedFat}g
                        </strong>
                      </div>
                    </div>

                    {/* Dietitian Tip */}
                    <p className="mt-2.5 p-2.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 text-[11px] text-zinc-300 leading-relaxed">
                      <strong className="text-emerald-400 block text-[10px] uppercase font-semibold">
                        {lang === 'bn' ? 'ওজন বৃদ্ধির পরামর্শ:' : 'Bulking Tip:'}
                      </strong>
                      {lang === 'bn' ? food.weightGainTipBn : food.weightGainTipEn}
                    </p>
                  </div>

                  {/* Log button */}
                  <button
                    type="button"
                    onClick={() => handleOpenLogModal(food, cookingOilLevel)}
                    className="w-full py-2.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/60 active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'বাটি / প্লেট অনুযায়ী পরিমাপ করে যোগ করুন' : 'Log with Bati / Plate / Spoon'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION: Standard Directory Foods Grid */}
      {activeSubTab === 'directory' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredFoods.map((food) => (
              <div
                key={food.id}
                className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  {/* Top row: Name & Calorie/Protein Highlight */}
                  <div className="flex items-start justify-between gap-2 min-w-0">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-white tracking-tight break-words">
                        {lang === 'bn' ? food.nameBn : food.nameEn}
                      </h3>
                      <p className="text-[11px] text-zinc-400 truncate">
                        {food.servingSizeEn}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-emerald-400 block whitespace-nowrap">
                        {food.calories} kcal
                      </span>
                      <span className="text-[10px] text-zinc-400 block whitespace-nowrap">
                        {food.protein}g protein
                      </span>
                    </div>
                  </div>

                  {/* Serving size & Budget hero badge */}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-mono break-words">
                      {lang === 'bn' ? food.servingSizeBn : food.servingSizeEn}
                    </span>
                    {food.isBudgetHero && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 whitespace-nowrap">
                        {lang === 'bn' ? 'সাশ্রয়ী ক্যালরি' : 'Budget Bulker'}
                      </span>
                    )}
                  </div>

                  {/* Nutrition breakdown pill metrics */}
                  <div className="grid grid-cols-4 gap-1 sm:gap-1.5 mt-3 text-center text-xs">
                    <div className="p-1 sm:p-1.5 rounded-lg bg-zinc-800/80 border border-zinc-800 min-w-0">
                      <span className="text-[8px] sm:text-[9px] uppercase text-zinc-400 block font-semibold truncate">Calories</span>
                      <strong className="text-white text-[11px] sm:text-xs font-bold block truncate">{food.calories}</strong>
                    </div>
                    <div className="p-1 sm:p-1.5 rounded-lg bg-emerald-950/40 border border-emerald-900/50 min-w-0">
                      <span className="text-[8px] sm:text-[9px] uppercase text-emerald-400 block font-semibold truncate">Protein</span>
                      <strong className="text-emerald-300 text-[11px] sm:text-xs font-bold block truncate">{food.protein}g</strong>
                    </div>
                    <div className="p-1 sm:p-1.5 rounded-lg bg-sky-950/40 border border-sky-900/50 min-w-0">
                      <span className="text-[8px] sm:text-[9px] uppercase text-sky-400 block font-semibold truncate">Carbs</span>
                      <strong className="text-sky-300 text-[11px] sm:text-xs font-bold block truncate">{food.carbs}g</strong>
                    </div>
                    <div className="p-1 sm:p-1.5 rounded-lg bg-amber-950/40 border border-amber-900/50 min-w-0">
                      <span className="text-[8px] sm:text-[9px] uppercase text-amber-400 block font-semibold truncate">Fat</span>
                      <strong className="text-amber-300 text-[11px] sm:text-xs font-bold block truncate">{food.fat}g</strong>
                    </div>
                  </div>

                  {/* Bangladeshi Dietitian Tip */}
                  <div className="mt-2.5 p-2 rounded-xl bg-zinc-950/60 border border-zinc-800/70 text-[11px] text-zinc-300 leading-relaxed break-words">
                    <strong className="text-emerald-400 block font-semibold text-[10px] uppercase">
                      {lang === 'bn' ? 'ওজন বৃদ্ধির টিপস:' : 'Bulking Tip:'}
                    </strong>
                    {lang === 'bn' ? food.weightGainTipBn : food.weightGainTipEn}
                  </div>
                </div>

                {/* Action: Log to Today button */}
                <button
                  onClick={() => handleOpenLogModal(food)}
                  className="w-full py-2 px-3 rounded-xl bg-zinc-800 hover:bg-emerald-600 hover:text-zinc-950 text-zinc-200 text-xs font-semibold transition-all border border-zinc-700/80 flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'আজকের তালিকায় যোগ করুন' : '+ Log to Today'}</span>
                </button>
              </div>
            ))}
          </div>

          {filteredFoods.length === 0 && (
            <div className="py-12 text-center rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-2">
              <p className="text-sm font-semibold text-zinc-300">
                {lang === 'bn' ? 'কোনো খাবার পাওয়া যায়নি।' : 'No foods found matching your search.'}
              </p>
              <p className="text-xs text-zinc-400">
                {lang === 'bn' ? 'অন্য নাম দিয়ে খুঁজুন অথবা নিচের বাটনে কাস্টম খাবার যোগ করুন।' : 'Try a different search term or add a custom item.'}
              </p>
              <button
                onClick={() => setShowCustomModal(true)}
                className="mt-2 px-4 py-2 rounded-xl bg-emerald-600 text-zinc-950 text-xs font-bold"
              >
                {lang === 'bn' ? 'কাস্টম খাবার যোগ করুন' : 'Add Custom Food'}
              </button>
            </div>
          )}
        </>
      )}

      {/* Logging Portion & Meal Slot Modal */}
      {loggingFood && currentUnit && calculatedNutrition && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl text-zinc-100 p-5 space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30">
                  {lang === 'bn' ? 'খাবার নির্বাচন ও পরিমাণ' : 'Food Portion & Unit'}
                </span>
                <span className="text-xs text-zinc-400">
                  {lang === 'bn' ? 'বেস সার্ভিং:' : 'Base serving:'} {lang === 'bn' ? loggingFood.servingSizeBn : loggingFood.servingSizeEn}
                </span>
              </div>
              <h3 className="text-lg font-black text-white mt-1">
                {lang === 'bn' ? loggingFood.nameBn : loggingFood.nameEn}
              </h3>
            </div>

            {/* 1. Food-specific Unit Selector Tabs */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-300">
                {lang === 'bn' ? 'পরিমাপের একক পছন্দ করুন:' : 'Select Portion Unit:'}
              </label>
              <div className="flex items-center gap-1.5 p-1 bg-zinc-950/90 rounded-xl border border-zinc-800 overflow-x-auto">
                {currentUnits.map((u) => {
                  const isActive = selectedUnitId === u.id;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleSelectUnit(u.id)}
                      className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                        isActive
                          ? 'bg-emerald-600 text-zinc-950 font-bold shadow-md shadow-emerald-950/40'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                      }`}
                    >
                      {lang === 'bn' ? u.labelBn : u.labelEn}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Quick Amount Presets */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-300">
                {lang === 'bn' ? 'দ্রুত পরিমাণ বাছাই:' : 'Quick Amount Presets:'}
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {currentUnit.presetAmounts.map((amt) => {
                  const isSelected = selectedAmount === amt;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setSelectedAmount(amt)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        isSelected
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-sm'
                          : 'bg-zinc-800/80 text-zinc-300 border-zinc-700/80 hover:bg-zinc-700'
                      }`}
                    >
                      {amt} {currentUnit.id === 'gram' ? 'g' : currentUnit.id === 'ml' ? 'ml' : ''}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Numeric Stepper / Custom Input */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800">
              <span className="text-xs font-medium text-zinc-300">
                {lang === 'bn' ? 'নির্দিষ্ট সংখ্যা লিখুন:' : 'Exact Quantity:'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const step = currentUnit.step || (currentUnit.id === 'plate' || currentUnit.id === 'bowl' ? 0.5 : 1);
                    const min = currentUnit.min || (currentUnit.id === 'plate' || currentUnit.id === 'bowl' ? 0.5 : 1);
                    setSelectedAmount(Number(Math.max(min, selectedAmount - step).toFixed(2)));
                  }}
                  className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-bold text-sm flex items-center justify-center transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  step="any"
                  min="0.1"
                  value={selectedAmount}
                  onChange={(e) => setSelectedAmount(Math.max(0.1, Number(parseFloat(e.target.value) || 1)))}
                  className="w-16 text-center py-1 bg-zinc-800 border border-zinc-700 rounded-lg text-white font-bold text-sm focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    const step = currentUnit.step || (currentUnit.id === 'plate' || currentUnit.id === 'bowl' ? 0.5 : 1);
                    setSelectedAmount(Number((selectedAmount + step).toFixed(2)));
                  }}
                  className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-bold text-sm flex items-center justify-center transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* 3.1 Cooking Oil Level Toggle (Kom Tel / Normal / Beshi Tel) */}
            <div className="space-y-1.5 p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>{lang === 'bn' ? 'রান্নার তেলের পরিমাণ (Oil Level):' : 'Cooking Oil Level:'}</span>
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">
                  {selectedOilLevel === 'high' ? '+45 kcal (+5g fat)' : selectedOilLevel === 'low' ? '-30 kcal' : 'Normal'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                {[
                  { id: 'low' as const, labelEn: 'Kom Tel', labelBn: 'কম তেল', badge: '-30 kcal' },
                  { id: 'normal' as const, labelEn: 'Normal', labelBn: 'স্বাভাবিক', badge: 'Standard' },
                  { id: 'high' as const, labelEn: 'Beshi Tel', labelBn: 'বেশি তেল', badge: '+45 kcal / +5g fat' },
                ].map((oil) => (
                  <button
                    key={oil.id}
                    type="button"
                    onClick={() => setSelectedOilLevel(oil.id)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all border text-center ${
                      selectedOilLevel === oil.id
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-sm'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700/60 hover:text-zinc-200'
                    }`}
                  >
                    <div>{lang === 'bn' ? oil.labelBn : oil.labelEn}</div>
                    <div className="text-[9px] opacity-75 font-normal">{oil.badge}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Target Meal Slot */}
            <div>
              <label htmlFor="log-meal-slot" className="block text-xs font-semibold text-zinc-300 mb-1">
                {lang === 'bn' ? 'কোন বেলার রুটিনে যোগ করবেন?' : 'Add to which meal slot?'}
              </label>
              <select
                id="log-meal-slot"
                value={selectedMealType}
                onChange={(e) => setSelectedMealType(e.target.value as MealType)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="breakfast">{lang === 'bn' ? 'সকালের নাস্তা (Breakfast)' : 'Breakfast'}</option>
                <option value="morning_snack">{lang === 'bn' ? 'দুপুরের আগের নাস্তা (Mid-Morning Snack)' : 'Mid-Morning Snack'}</option>
                <option value="lunch">{lang === 'bn' ? 'দুপুরের খাবার (Lunch)' : 'Lunch'}</option>
                <option value="evening_shake">{lang === 'bn' ? 'বিকালে শেক/নাস্তা (Afternoon Shake)' : 'Afternoon Shake'}</option>
                <option value="dinner">{lang === 'bn' ? 'রাতের খাবার (Dinner)' : 'Dinner'}</option>
                <option value="bedtime">{lang === 'bn' ? 'ঘুমানোর আগের দুধ (Bedtime)' : 'Bedtime'}</option>
              </select>
            </div>

            {/* 5. Live Dynamic Nutrient Feedback */}
            <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                  {lang === 'bn' ? 'হিসাবকৃত পুষ্টি:' : 'Calculated Nutrition:'}
                </span>
                <span className="text-xl font-black text-white">
                  {calculatedNutrition.calories} <span className="text-xs font-normal text-zinc-400">kcal</span>
                </span>
                <span className="text-[11px] text-zinc-400 block mt-0.5">
                  ({lang === 'bn' ? calculatedNutrition.displayQuantityBn : calculatedNutrition.displayQuantity})
                </span>
              </div>
              <div className="flex flex-col gap-1 text-right text-xs">
                <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 font-semibold">
                  {calculatedNutrition.protein}g protein
                </span>
                <span className="px-2 py-0.5 rounded bg-sky-950/60 text-sky-300 border border-sky-800/60 font-semibold">
                  {calculatedNutrition.carbs}g carbs
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/60 font-semibold">
                  {calculatedNutrition.fat}g fat
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setLoggingFood(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300"
              >
                {lang === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmLog}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-zinc-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-900/40"
              >
                <Check className="w-4 h-4" />
                <span>
                  {lang === 'bn'
                    ? `যোগ করুন (+${calculatedNutrition.calories} kcal)`
                    : `Log Food (+${calculatedNutrition.calories} kcal)`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Food Creation Modal */}
      {showCustomModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl text-zinc-100 p-5 space-y-4">
            <div>
              <h3 className="text-base font-bold text-white">
                {lang === 'bn' ? 'কাস্টম দেশি খাবার যোগ করুন' : 'Add Custom Local Food'}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                {lang === 'bn' ? 'তালিকায় না থাকলে যেকোনো খাবারের নাম ও ক্যালরি লিখুন' : 'Enter food details to log it right into your daily diary'}
              </p>
            </div>

            <form onSubmit={handleAddCustomFood} className="space-y-3 text-xs">
              <div>
                <label htmlFor="custom-food-name" className="block font-medium text-zinc-300 mb-1">
                  {lang === 'bn' ? 'খাবারের নাম' : 'Food Name'}
                </label>
                <input
                  id="custom-food-name"
                  type="text"
                  placeholder={lang === 'bn' ? 'যেমন: খাসির মাংসের তেহারি, মাষকলাইয়ের ডাল...' : 'e.g. Mutton Tehari, Kalai Daal, Oats...'}
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="custom-food-cals" className="block font-medium text-zinc-300 mb-1">
                    {lang === 'bn' ? 'ক্যালরি (kcal)' : 'Calories (kcal)'}
                  </label>
                  <input
                    id="custom-food-cals"
                    type="number"
                    value={customCalories}
                    onChange={(e) => setCustomCalories(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="custom-food-protein" className="block font-medium text-zinc-300 mb-1">
                    {lang === 'bn' ? 'প্রোটিন (গ্রাম)' : 'Protein (g)'}
                  </label>
                  <input
                    id="custom-food-protein"
                    type="number"
                    value={customProtein}
                    onChange={(e) => setCustomProtein(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="custom-food-portion" className="block font-medium text-zinc-300 mb-1">
                  {lang === 'bn' ? 'পরিমাণ (যেমন: ১ বাটি, ২ টুকরা)' : 'Portion / Serving Size'}
                </label>
                <input
                  id="custom-food-portion"
                  type="text"
                  value={customServing}
                  onChange={(e) => setCustomServing(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-zinc-950 text-xs font-bold"
                >
                  {lang === 'bn' ? 'সংরক্ষণ ও যোগ' : 'Save & Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
