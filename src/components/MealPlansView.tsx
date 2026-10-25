/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MealPlanDay, LoggedMealItem } from '../types';
import { PRESET_MEAL_PLANS, BANGLADESHI_FOODS } from '../data/bangladeshiFoods';
import { CalendarDays, CheckCircle2, Flame, Clock, Sparkles } from 'lucide-react';

interface MealPlansViewProps {
  onApplyPlan: (newLoggedMeals: LoggedMealItem[]) => void;
  lang: 'en' | 'bn';
}

export const MealPlansView: React.FC<MealPlansViewProps> = ({
  onApplyPlan,
  lang,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>(PRESET_MEAL_PLANS[0].id);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const currentPlan = PRESET_MEAL_PLANS.find((p) => p.id === selectedPlanId) || PRESET_MEAL_PLANS[0];

  const handleApplyToDay = () => {
    const newItems: LoggedMealItem[] = [];

    currentPlan.meals.forEach((meal) => {
      meal.foodIds.forEach((foodRef) => {
        const food = BANGLADESHI_FOODS.find((f) => f.id === foodRef.foodId);
        if (food) {
          newItems.push({
            id: `plan-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            foodId: food.id,
            foodNameEn: food.nameEn,
            foodNameBn: food.nameBn,
            mealType: meal.mealType,
            servings: foodRef.servings,
            servingUnitEn: food.servingSizeEn,
            servingUnitBn: food.servingSizeBn,
            calories: Math.round(food.calories * foodRef.servings),
            protein: Number((food.protein * foodRef.servings).toFixed(1)),
            carbs: Number((food.carbs * foodRef.servings).toFixed(1)),
            fat: Number((food.fat * foodRef.servings).toFixed(1)),
            timeAdded: meal.time,
          });
        }
      });
    });

    onApplyPlan(newItems);
    setToastMessage(
      lang === 'bn'
        ? `"${currentPlan.titleBn}" আজকের রুটিনে যুক্ত করা হয়েছে!`
        : `Applied "${currentPlan.titleEn}" to today's diary!`
    );
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-4 pb-20 max-w-3xl mx-auto">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-emerald-600 text-zinc-950 font-bold text-xs shadow-2xl flex items-center gap-1.5 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <section className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-md space-y-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-emerald-400" />
            {lang === 'bn' ? 'বাংলাদেশি কমপ্লিট ডায়েট চার্ট' : 'Curated Bangladeshi Bulking Plans'}
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            {lang === 'bn'
              ? 'বাজেট, লাইফস্টাইল ও শারীরিক চাহিদার ভিত্তিতে সাজানো পুষ্টিকর খাবারের তালিকা'
              : 'Complete 6-meal daily plans designed for student budgets, lean muscle, or fast metabolisms'}
          </p>
        </div>

        {/* Plan Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          {PRESET_MEAL_PLANS.map((plan) => {
            const isSelected = selectedPlanId === plan.id;
            return (
              <button
                key={plan.id}
                onClick={() => setSelectedPlanId(plan.id)}
                className={`p-3 rounded-xl border text-left transition-all relative ${
                  isSelected
                    ? 'bg-emerald-950/60 border-emerald-500 shadow-lg shadow-emerald-950/50'
                    : 'bg-zinc-800/60 border-zinc-700/80 hover:bg-zinc-800 text-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-emerald-400 border border-zinc-700">
                    {lang === 'bn' ? plan.badgeBn : plan.badgeEn}
                  </span>
                  <span className="text-xs font-bold text-white">
                    {plan.totalCalories} kcal
                  </span>
                </div>
                <h3 className="text-xs font-bold text-white mt-1.5 line-clamp-1">
                  {lang === 'bn' ? plan.titleBn : plan.titleEn}
                </h3>
                <p className="text-[10px] text-zinc-400 mt-0.5">
                  {plan.totalProtein}g protein · 6 meals/day
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Current Selected Plan Detail Card */}
      <section className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-md space-y-4">
        {/* Banner with Overview & Apply Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-900 border border-emerald-800/40">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">
                {lang === 'bn' ? currentPlan.titleBn : currentPlan.titleEn}
              </h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {lang === 'bn' ? currentPlan.badgeBn : currentPlan.badgeEn}
              </span>
            </div>
            <p className="text-xs text-zinc-300 mt-1 max-w-lg">
              {lang === 'bn' ? currentPlan.descriptionBn : currentPlan.descriptionEn}
            </p>
          </div>

          <button
            onClick={handleApplyToDay}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-zinc-950 text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-900/40 transition-all shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>{lang === 'bn' ? 'আজকের দিনে সেট করুন' : 'Apply to Today\'s Log'}</span>
          </button>
        </div>

        {/* Nutritional Highlights */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700/80">
            <div className="flex items-center justify-center gap-1 text-amber-400 text-[10px] font-bold uppercase">
              <Flame className="w-3 h-3" />
              <span>{lang === 'bn' ? 'দৈনিক ক্যালরি' : 'Total Calories'}</span>
            </div>
            <p className="text-base font-extrabold text-white mt-0.5">
              {currentPlan.totalCalories} <span className="text-xs font-normal text-zinc-400">kcal</span>
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-900/50">
            <span className="text-[10px] font-bold uppercase text-emerald-400 block">
              {lang === 'bn' ? 'দৈনিক প্রোটিন' : 'Total Protein'}
            </span>
            <p className="text-base font-extrabold text-emerald-300 mt-0.5">
              {currentPlan.totalProtein} <span className="text-xs font-normal text-emerald-400">grams</span>
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700/80">
            <div className="flex items-center justify-center gap-1 text-emerald-400 text-[10px] font-bold uppercase">
              <Clock className="w-3 h-3" />
              <span>{lang === 'bn' ? 'মিল সংখ্যা' : 'Meal Schedule'}</span>
            </div>
            <p className="text-base font-extrabold text-white mt-0.5">
              6 <span className="text-xs font-normal text-zinc-400">{lang === 'bn' ? 'বেলা / দিন' : 'meals / day'}</span>
            </p>
          </div>
        </div>

        {/* 6 Meals Timeline */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            {lang === 'bn' ? 'সারাদিনের ৬ বেলার খাদ্য তালিকা:' : 'Full 6-Meal Daily Timeline:'}
          </h3>

          <div className="space-y-2.5">
            {currentPlan.meals.map((meal, idx) => {
              // Calculate meal calories
              const mealCalories = meal.foodIds.reduce((sum, item) => {
                const f = BANGLADESHI_FOODS.find((food) => food.id === item.foodId);
                return sum + (f ? Math.round(f.calories * item.servings) : 0);
              }, 0);

              const mealProtein = meal.foodIds.reduce((sum, item) => {
                const f = BANGLADESHI_FOODS.find((food) => food.id === item.foodId);
                return sum + (f ? f.protein * item.servings : 0);
              }, 0);

              return (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-zinc-800/50 border border-zinc-800 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold border border-emerald-500/30">
                        {idx + 1}
                      </span>
                      <strong className="text-white">
                        {lang === 'bn' ? meal.labelBn : meal.labelEn}
                      </strong>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span className="flex items-center gap-1 text-zinc-400">
                        <Clock className="w-3 h-3" />
                        {meal.time}
                      </span>
                      <span className="font-bold text-emerald-400">
                        {mealCalories} kcal
                      </span>
                    </div>
                  </div>

                  {/* Food items in this meal */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-7">
                    {meal.foodIds.map((itemRef, fIdx) => {
                      const food = BANGLADESHI_FOODS.find((f) => f.id === itemRef.foodId);
                      if (!food) return null;

                      return (
                        <div
                          key={fIdx}
                          className="flex items-center justify-between p-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800 text-[11px]"
                        >
                          <span className="text-zinc-200">
                            • {lang === 'bn' ? food.nameBn : food.nameEn}{' '}
                            <span className="text-zinc-400 font-mono">
                              ({itemRef.servings}x {lang === 'bn' ? food.servingSizeBn : food.servingSizeEn})
                            </span>
                          </span>
                          <span className="text-zinc-400 text-[10px]">
                            {Math.round(food.calories * itemRef.servings)} kcal
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
