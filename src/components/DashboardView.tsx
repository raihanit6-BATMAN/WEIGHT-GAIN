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
  Lightbulb,
  CheckCircle2,
  Target,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { MacroRingsWidget } from './MacroRingsWidget';
import { NutritionInsightCard } from './NutritionInsightCard';
import { WaterTracker } from './WaterTracker';
import { SmartFoodInputBar } from './SmartFoodInputBar';
import { QuickCalorieGuesser } from './QuickCalorieGuesser';
import { getDailyNutritionInsight } from '../utils/nutritionInsights';
import { BANGLADESHI_FOODS } from '../data/bangladeshiFoods';
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
  onNavigateToTab,
  onLogFood,
  onLogSegments,
  onLogCustomItem,
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
  const remainingProtein = Math.max(0, Math.round(calorieTargets.proteinGrams - totalProtein));
  const remainingCarbs = Math.max(0, Math.round(calorieTargets.carbsGrams - totalCarbs));
  const remainingFat = Math.max(0, Math.round(calorieTargets.fatGrams - totalFat));

  const dailyInsight = getDailyNutritionInsight(
    BANGLADESHI_FOODS,
    remainingCalories,
    remainingProtein,
    remainingCarbs,
    remainingFat
  );

  // Group meals by meal type
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
    <div className="space-y-4 pb-20 max-w-3xl mx-auto w-full">
      {/* 1. Minimal Daily Execution Header (De-cluttered: Bulky assessment moved to modal) */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 sm:p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Target className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-white truncate">
                {lang === 'bn' ? 'আজকের লক্ষ্য:' : 'Daily Execution Goal:'}
              </span>
              <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {calorieTargets.targetCalories} kcal (+500 surplus)
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 truncate">
              {remainingCalories > 0
                ? (lang === 'bn' ? `আর ${remainingCalories} ক্যালরি সারপ্লাস বাকি` : `${remainingCalories} kcal left to surplus`)
                : (lang === 'bn' ? '🎉 সারপ্লাস লক্ষ্য অর্জিত হয়েছে!' : '🎉 Surplus goal achieved!')}
            </p>
          </div>
        </div>

        {/* Minimal Health Badge Chip (Click to open full Health Assessment modal) */}
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700/80 border border-zinc-700/80 text-xs font-medium text-zinc-200 transition-colors shrink-0 shadow-sm"
          title={lang === 'bn' ? 'সম্পূর্ণ স্বাস্থ্য মূল্যায়ন ও BMI দেখুন' : 'View Full Health & BMI Assessment'}
        >
          <span className="text-zinc-400">{profile.weightKg}kg</span>
          <span className="text-zinc-600">·</span>
          <span className={`font-bold ${bmiInfo.colorClass}`}>BMI {bmiInfo.bmi}</span>
          <span className="text-[10px] text-emerald-400 font-semibold flex items-center">
            {lang === 'bn' ? 'ডিটেইলস' : 'Stats'}
            <ArrowRight className="w-3 h-3 ml-0.5" />
          </span>
        </button>
      </div>

      {/* 2. Visual Concentric Macro Progress Ring Widget */}
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

      {/* 3. Personalized Daily Nutrition Insights Card */}
      <NutritionInsightCard
        insight={dailyInsight}
        onQuickLog={onLogFood}
        onUndoLog={onDeleteMealItem}
        lang={lang}
      />

      {/* 4. Production-Grade Water Tracker (Dynamic Target, No 2000ml Cap, Increments & Manual Input) */}
      <WaterTracker
        waterMl={waterMl}
        onUpdateWaterMl={onUpdateWaterMl}
        targetMl={waterTarget}
        onUpdateTargetMl={onUpdateWaterTargetMl}
        lang={lang}
      />

      {/* 4.1 Natural Language Smart Input Bar */}
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

      {/* 4.2 Quick Calorie Guesser for Outside/Unknown Food */}
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

      {/* 5. Today's 6-Meal Routine Checklist */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-base font-bold text-white truncate">
              {lang === 'bn' ? 'আজকের খাবারের রুটিন (৬ বেলা)' : 'Today\'s 6-Meal Routine'}
            </h3>
            <p className="text-xs text-zinc-400 break-words">
              {lang === 'bn'
                ? 'একবারে বেশি না খেয়ে প্রতি ৩ ঘণ্টা পর পর পুষ্টিকর খাবার খান।'
                : 'Eat small calorie-dense meals every 3 hours for best weight gain.'}
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('foods')}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-zinc-950 flex items-center gap-1 transition-colors shrink-0 shadow-md shadow-emerald-950/40"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'খাবার খুঁজুন' : 'Browse BD Foods'}</span>
          </button>
        </div>

        {/* Meal Slots */}
        <div className="space-y-2.5">
          {mealSections.map((slot) => {
            const itemsInSlot = loggedMeals.filter((m) => m.mealType === slot.type);
            const slotCalories = itemsInSlot.reduce((sum, item) => sum + item.calories, 0);
            const slotProtein = Number(itemsInSlot.reduce((sum, item) => sum + item.protein, 0).toFixed(1));

            return (
              <div
                key={slot.type}
                className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700/80 transition-colors overflow-hidden"
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
                    <span className="text-xs font-bold text-emerald-400">
                      {slotCalories} kcal
                    </span>
                    <span className="text-[11px] text-zinc-400 hidden xs:inline">
                      · {slotProtein}g prot
                    </span>
                    <button
                      onClick={() => onOpenAddFoodModal(slot.type)}
                      className="p-1 rounded-lg bg-zinc-800 hover:bg-emerald-900/40 hover:text-emerald-300 text-zinc-300 text-xs transition-colors flex items-center gap-1 px-2 border border-zinc-700"
                      title={lang === 'bn' ? 'এই বেলায় খাবার যোগ করুন' : 'Add food to this meal'}
                    >
                      <Plus className="w-3 h-3 text-emerald-400" />
                      <span className="text-[10px] font-medium">{lang === 'bn' ? 'যোগ করুন' : 'Add'}</span>
                    </button>
                  </div>
                </div>

                {/* Items List */}
                {itemsInSlot.length === 0 ? (
                  <div className="py-2.5 text-center">
                    <p className="text-xs text-zinc-500 italic">
                      {lang === 'bn'
                        ? 'এখনও কিছু যোগ করা হয়নি। উপরের "+ যোগ করুন" চাপুন।'
                        : 'No foods logged for this slot yet.'}
                    </p>
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
                            <span className="text-[10px] text-zinc-400 block truncate">
                              {item.servings}x ({lang === 'bn' ? item.servingUnitBn : item.servingUnitEn}) · {item.protein}g protein
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-semibold text-zinc-200 whitespace-nowrap">
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

      {/* 6. Bangladeshi Hardgainer Golden Rules */}
      <section className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2.5 overflow-hidden">
        <div className="flex items-center gap-2 text-amber-400">
          <Lightbulb className="w-4 h-4 shrink-0" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-white truncate">
            {lang === 'bn' ? 'বাংলাদেশি আবহাওয়ায় ওজন বৃদ্ধির ৫টি সোনালী নিয়ম' : '5 Golden Rules for Gaining Weight in Bangladesh'}
          </h4>
        </div>

        <ul className="space-y-2 text-xs text-zinc-300">
          <li className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 border border-emerald-800">1</span>
            <span className="break-words">
              <strong>{lang === 'bn' ? 'তরল ক্যালরি বেশি খান:' : 'Prioritize Liquid Calories:'}</strong> {lang === 'bn' ? 'চিবিয়ে বেশি খাবার খাওয়া কঠিন লাগলে প্রতিদিন বিকালে দুধ, ২টা কলা ও চিনাবাদাম ব্লেন্ড করে শেক খান। পেটে চাপ না ফেলে সহজে ৬৫০+ ক্যালরি যোগ হবে।' : 'Blending milk, 2 bananas, and peanuts takes 2 minutes and delivers 670 easy-to-digest calories without bloating.'}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 border border-emerald-800">2</span>
            <span className="break-words">
              <strong>{lang === 'bn' ? 'খাবারের ঠিক আগে পানি পান নয়:' : 'No Water Before Meals:'}</strong> {lang === 'bn' ? 'খাওয়ার আধা ঘণ্টা আগে বা খাওয়ার মাঝে বেশি পানি খেলে পেট ভরে যায় এবং ক্ষুধা কমে যায়। পানি খাবেন খাবার শেষ করার ৩০-৪৫ মিনিট পর।' : 'Drinking water right before lunch or dinner expands the stomach and kills your appetite.'}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 border border-emerald-800">3</span>
            <span className="break-words">
              <strong>{lang === 'bn' ? 'চিনাবাদাম সবসময় সাথে রাখুন:' : 'Carry Peanuts Everywhere:'}</strong> {lang === 'bn' ? 'চিনাবাদাম স্বাস্থ্যকর ও উচ্চ ক্যালরির সহজ উৎস। পড়ার টেবিলে বা ব্যাগে রাখবেন, কাজের ফাঁকে দুই মুঠো চিবিয়ে খেলেই প্রায় ৫৭০ স্বাস্থ্যকর ক্যালরি সহজে যোগ হয়।' : 'Roasted peanuts provide clean calories and protein. Keep a box handy and take a fistful twice a day.'}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 border border-emerald-800">4</span>
            <span className="break-words">
              <strong>{lang === 'bn' ? 'ভর্তা ও ডালে খাঁটি সরিষার তেল:' : 'Pure Mustard Oil in Bhortas:'}</strong> {lang === 'bn' ? 'বাঙালি খাবারে আলু ভর্তা, বেগুন ভর্তা ও ঘন মসুর ডালে পর্যাপ্ত খাঁটি সরিষার তেল দিলে পরিমাণের পরিবর্তন ছাড়াই অতিরিক্ত ২০০+ স্বাস্থ্যকর ক্যালরি পাওয়া যায়।' : 'Using pure mustard oil generously in alu bhorta and thick mushur daal adds 200+ clean calories naturally.'}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 border border-emerald-800">5</span>
            <span className="break-words">
              <strong>{lang === 'bn' ? 'রাত ১১টার মধ্যে ঘুম ও দুধ:' : 'Sleep & Bedtime Milk:'}</strong> {lang === 'bn' ? 'রাত জাগলে শরীরের হরমোন ভারসাম্য নষ্ট হয় ও মেটাবলিজম চর্বি পোড়ায়। রাত ১১টার দিকে ১ গ্লাস গরম দুধ খেয়ে ৭-৮ ঘণ্টা গভীর ঘুম দিন।' : 'Deep sleep releases growth hormones; drink a warm glass of milk before bed.'}
            </span>
          </li>
        </ul>
      </section>
    </div>
  );
};
