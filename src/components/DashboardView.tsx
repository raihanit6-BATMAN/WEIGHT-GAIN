/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { UserProfile, LoggedMealItem, MealType, FoodItem } from '../types';
import {
  convertHeightToCm,
  calculateBMI,
  calculateBMR,
  calculateTDEE,
  calculateTargetCalories,
} from '../utils/healthMath';
import {
  Plus,
  Trash2,
  CheckCircle2,
  Target,
  ArrowRight,
} from 'lucide-react';
import { MacroRingsWidget } from './MacroRingsWidget';
import { WaterTracker } from './WaterTracker';
import { TodayQuickSearchBar } from './TodayQuickSearchBar';
import { ParsedMealSegment } from '../utils/banglishParser';

interface DashboardViewProps {
  profile: UserProfile;
  loggedMeals: LoggedMealItem[];
  waterMl: number;
  onUpdateWaterMl: (ml: number) => void;
  onUpdateWaterTargetMl?: (targetMl: number) => void;
  onDeleteMealItem: (id: string) => void;
  onOpenAddFoodModal: (mealType: MealType) => void;
  onOpenProfile: () => void;
  onNavigateToTab: (tab: 'foods' | 'plans' | 'recipes' | 'grocery' | 'tracker') => void;
  onLogFood: (food: FoodItem, servings: number, mealType: MealType) => void;
  onLogSegments?: (segments: ParsedMealSegment[], mealType: MealType) => void;
  onLogCustomItem?: (item: LoggedMealItem) => void;
  lang: 'en' | 'bn';
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  loggedMeals,
  waterMl,
  onUpdateWaterMl,
  onUpdateWaterTargetMl,
  onDeleteMealItem,
  onOpenAddFoodModal,
  onOpenProfile,
  onLogFood,
  lang,
}) => {
  const heightCm = convertHeightToCm(profile.heightFeet, profile.heightInches);
  const bmiInfo = calculateBMI(profile.weightKg, heightCm);
  const bmr = calculateBMR(profile.weightKg, heightCm, profile.age, profile.gender);
  const tdee = calculateTDEE(bmr, profile.activityLevel);
  const calorieTargets = calculateTargetCalories(tdee, profile.weightGainPace, profile.weightKg);

  // Aggregated nutrition for today
  const totalCalories = loggedMeals.reduce((sum, item) => sum + item.calories, 0);
  const totalProtein = Number(loggedMeals.reduce((sum, item) => sum + item.protein, 0).toFixed(1));
  const totalCarbs = Number(loggedMeals.reduce((sum, item) => sum + item.carbs, 0).toFixed(1));
  const totalFat = Number(loggedMeals.reduce((sum, item) => sum + item.fat, 0).toFixed(1));

  const remainingCalories = Math.max(0, calorieTargets.targetCalories - totalCalories);

  // Group meals by meal type (Today's 6-Meal Routine)
  const mealSections: { type: MealType; labelEn: string; labelBn: string; recommendedTime: string }[] = [
    { type: 'breakfast', labelEn: 'Breakfast', labelBn: 'সকালের নাস্তা', recommendedTime: '8:00 - 8:30 AM' },
    { type: 'morning_snack', labelEn: 'Mid-Morning Snack', labelBn: 'দুপুরের আগের নাস্তা', recommendedTime: '11:00 - 11:30 AM' },
    { type: 'lunch', labelEn: 'Lunch (Bhaat & Curry)', labelBn: 'দুপুরের খাবার (ভাত ও তরকারি)', recommendedTime: '1:30 - 2:30 PM' },
    { type: 'evening_shake', labelEn: 'Afternoon Deshi Shake', labelBn: 'বিকালে পাওয়ার শেক / নাস্তা', recommendedTime: '5:00 - 5:30 PM' },
    { type: 'dinner', labelEn: 'Dinner', labelBn: 'রাতের খাবার', recommendedTime: '9:00 - 9:30 PM' },
    { type: 'bedtime', labelEn: 'Bedtime Milk', labelBn: 'ঘুমানোর আগের দুধ', recommendedTime: '11:00 PM' },
  ];

  const waterTarget = profile.dailyWaterGoalMl || (profile.dailyWaterGoalGlasses * 250) || 3000;

  return (
    <div className="space-y-3 sm:space-y-3.5 pb-20 max-w-3xl mx-auto w-full animate-in fade-in">
      {/* 1. SLIM GOAL & HEALTH BADGE BAR */}
      <div className="flex items-center justify-between gap-2 p-2.5 sm:p-3 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Target className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-white truncate">
            {lang === 'bn' ? 'টার্গেট:' : 'Goal:'}{' '}
            <strong className="text-emerald-400 font-extrabold">{calorieTargets.targetCalories} kcal</strong>
            <span className="text-zinc-400 font-normal ml-1">
              ({remainingCalories > 0 ? (lang === 'bn' ? `আর ${remainingCalories} kcal বাকি` : `${remainingCalories} kcal left`) : '🎉 Hit!'})
            </span>
          </span>
        </div>

        <button
          onClick={onOpenProfile}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-700/80 border border-zinc-700/80 text-[11px] font-semibold text-zinc-300 transition-colors shrink-0 shadow-sm"
          title={lang === 'bn' ? 'সম্পূর্ণ স্বাস্থ্য মূল্যায়ন ও BMI দেখুন' : 'View Full Health & BMI Assessment'}
        >
          <span>{profile.weightKg}kg</span>
          <span className="text-zinc-600">·</span>
          <span className={`font-bold ${bmiInfo.colorClass}`}>BMI {bmiInfo.bmi}</span>
          <span className="text-[10px] text-emerald-400 flex items-center font-bold">
            {lang === 'bn' ? 'ডিটেইলস' : 'Stats'}
            <ArrowRight className="w-3 h-3 ml-0.5" />
          </span>
        </button>
      </div>

      {/* 2. TOP (ABOVE THE FOLD): Compact Side-by-Side Daily Macro Target Progress Rings */}
      <MacroRingsWidget
        totalCalories={totalCalories}
        targetCalories={calorieTargets.targetCalories}
        consumedProtein={totalProtein}
        targetProtein={calorieTargets.proteinGrams}
        consumedCarbs={totalCarbs}
        targetCarbs={calorieTargets.carbsGrams}
        consumedFat={totalFat}
        targetFat={calorieTargets.fatGrams}
        lang={lang}
      />

      {/* 3. MIDDLE (MOVED UP): Compact Daily Hydration Tracker (Visible Together with Macro Rings) */}
      <WaterTracker
        waterMl={waterMl}
        onUpdateWaterMl={onUpdateWaterMl}
        targetMl={waterTarget}
        onUpdateTargetMl={onUpdateWaterTargetMl}
        lang={lang}
      />

      {/* 4. PERMANENT DIRECT FOOD SEARCH BAR ON 1ST PAGE ('Today' Tab) */}
      <TodayQuickSearchBar
        onLogFood={onLogFood}
        lang={lang}
      />

      {/* 5. TODAY'S 6-MEAL ROUTINE CHECKLIST */}
      <section className="space-y-2.5 pt-1">
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-white truncate">
              {lang === 'bn' ? 'আজকের খাবারের রুটিন (৬ বেলা)' : 'Today\'s 6-Meal Routine'}
            </h3>
            <p className="text-[11px] text-zinc-400">
              {lang === 'bn'
                ? 'একবারে বেশি না খেয়ে প্রতি ৩ ঘণ্টা পর পর পুষ্টিকর খাবার খান।'
                : 'Eat small calorie-dense meals every 3 hours for best weight gain.'}
            </p>
          </div>
          <button
            onClick={() => onOpenAddFoodModal('lunch')}
            className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-zinc-950 flex items-center gap-1.5 transition-all shrink-0 shadow-md shadow-emerald-950/40 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{lang === 'bn' ? '+ দ্রুত খাবার যোগ' : '+ Add Food'}</span>
          </button>
        </div>

        {/* Meal Slots List */}
        <div className="space-y-2">
          {mealSections.map((slot) => {
            const itemsInSlot = loggedMeals.filter((m) => m.mealType === slot.type);
            const slotCalories = itemsInSlot.reduce((sum, item) => sum + item.calories, 0);
            const slotProtein = Number(itemsInSlot.reduce((sum, item) => sum + item.protein, 0).toFixed(1));

            return (
              <div
                key={slot.type}
                className="p-3 sm:p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700/80 transition-colors overflow-hidden"
              >
                {/* Slot Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-zinc-800/60">
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5 flex-wrap">
                      <span className="truncate">{lang === 'bn' ? slot.labelBn : slot.labelEn}</span>
                      <span className="text-[10px] font-normal text-zinc-400">
                        ({slot.recommendedTime})
                      </span>
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold text-emerald-400 font-mono">
                      {slotCalories} kcal
                    </span>
                    <span className="text-[11px] text-zinc-400 hidden xs:inline font-mono">
                      · {slotProtein}g prot
                    </span>
                    <button
                      onClick={() => onOpenAddFoodModal(slot.type)}
                      className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-xs transition-all flex items-center gap-1 shadow-sm active:scale-95"
                      title={lang === 'bn' ? 'এই বেলায় খাবার যোগ করুন' : 'Add food to this meal'}
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>{lang === 'bn' ? 'খাবার যোগ' : 'Add Food'}</span>
                    </button>
                  </div>
                </div>

                {/* Items List */}
                {itemsInSlot.length === 0 ? (
                  <div className="py-2.5 text-center">
                    <button
                      type="button"
                      onClick={() => onOpenAddFoodModal(slot.type)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 hover:border-emerald-500/50 border border-zinc-700/60 text-xs text-zinc-400 hover:text-emerald-300 font-medium transition-all"
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{lang === 'bn' ? 'এই বেলায় খাবার যোগ করতে ট্যাপ করুন' : 'Tap to log food for this meal'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="mt-2 space-y-1.5">
                    {itemsInSlot.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 text-xs transition-colors gap-2 min-h-fit"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <span className="font-medium text-white block truncate break-words">
                              {lang === 'bn' ? item.foodNameBn : item.foodNameEn}
                            </span>
                            <span className="text-[10px] text-zinc-400 block truncate font-mono">
                              {item.servings}x ({lang === 'bn' ? item.servingUnitBn : item.servingUnitEn}) · {item.protein}g prot
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-semibold text-zinc-200 whitespace-nowrap font-mono">
                            {item.calories} kcal
                          </span>
                          <button
                            onClick={() => onDeleteMealItem(item.id)}
                            className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-zinc-700/50 transition-colors"
                            title="Remove"
                            aria-label={`Remove ${item.foodNameEn}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
