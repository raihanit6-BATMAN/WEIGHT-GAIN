/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserProfile, LoggedMealItem, WeightHistoryEntry, GroceryItem, MealType, FoodItem } from './types';
import {
  loadProfile,
  saveProfile,
  loadLoggedMeals,
  saveLoggedMeals,
  loadWeightHistory,
  saveWeightHistory,
  loadGroceryList,
  saveGroceryList,
  loadWaterGlasses,
  saveWaterGlasses,
  loadWaterMl,
  saveWaterMl,
  loadLanguage,
  saveLanguage,
} from './utils/storage';
import { convertHeightToCm, calculateBMR, calculateTDEE, calculateTargetCalories } from './utils/healthMath';
import { ParsedMealSegment } from './utils/banglishParser';
import { registerServiceWorker } from './utils/serviceWorkerRegistration';
import {
  ReminderStats,
  ReminderAlert,
  getReminderPreferences,
  checkReminderDue,
  triggerScheduledReminder,
  triggerTestReminder,
} from './utils/notificationScheduler';

import { Navbar } from './components/Navbar';
import { BottomNav, TabType } from './components/BottomNav';
import { ProfileModal } from './components/ProfileModal';
import { DashboardView } from './components/DashboardView';
import { FoodDirectoryView } from './components/FoodDirectoryView';
import { MealPlansView } from './components/MealPlansView';
import { RecipesView } from './components/RecipesView';
import { GroceryBazaarView } from './components/GroceryBazaarView';
import { WeightTrackerView } from './components/WeightTrackerView';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { InAppReminderAlert } from './components/InAppReminderAlert';
import { RotateCcw } from 'lucide-react';

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(loadProfile);
  const [loggedMeals, setLoggedMeals] = useState<LoggedMealItem[]>(loadLoggedMeals);
  const [weightHistory, setWeightHistory] = useState<WeightHistoryEntry[]>(loadWeightHistory);
  const [groceryList, setGroceryList] = useState<GroceryItem[]>(loadGroceryList);
  const [waterMl, setWaterMl] = useState<number>(loadWaterMl);
  const [lang, setLang] = useState<'en' | 'bn'>(loadLanguage);

  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [isMobileFrame, setIsMobileFrame] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedSlotForFood, setSelectedSlotForFood] = useState<MealType>('breakfast');
  const [activeInAppReminder, setActiveInAppReminder] = useState<ReminderAlert | null>(null);
  const [recentLoggedMeal, setRecentLoggedMeal] = useState<{
    id: string;
    foodName: string;
    calories: number;
  } | null>(null);

  // Sync state changes to storage
  useEffect(() => {
    saveProfile(profile);
  }, [profile]);

  useEffect(() => {
    saveLoggedMeals(loggedMeals);
  }, [loggedMeals]);

  useEffect(() => {
    saveWeightHistory(weightHistory);
  }, [weightHistory]);

  useEffect(() => {
    saveGroceryList(groceryList);
  }, [groceryList]);

  useEffect(() => {
    saveWaterMl(waterMl);
  }, [waterMl]);

  useEffect(() => {
    saveLanguage(lang);
  }, [lang]);

  // Derived calorie calculations
  const heightCm = convertHeightToCm(profile.heightFeet, profile.heightInches);
  const bmr = calculateBMR(profile.weightKg, heightCm, profile.age, profile.gender);
  const tdee = calculateTDEE(bmr, profile.activityLevel);
  const targets = calculateTargetCalories(tdee, profile.weightGainPace, profile.weightKg);
  const todayCalories = loggedMeals.reduce((sum, item) => sum + item.calories, 0);
  const todayProtein = Number(loggedMeals.reduce((sum, item) => sum + item.protein, 0).toFixed(1));

  const reminderStats: ReminderStats = {
    targetCalories: targets.targetCalories,
    loggedCalories: todayCalories,
    targetProtein: targets.proteinGrams,
    loggedProtein: todayProtein,
    targetWaterMl: profile.dailyWaterGoalMl || 3000,
    loggedWaterMl: waterMl,
  };

  // Register Service Worker on initial mount
  useEffect(() => {
    registerServiceWorker();
  }, []);

  // Automated Daily Notification Scheduler (10 AM, 2 PM, 9 PM)
  useEffect(() => {
    const checkSchedule = () => {
      const prefs = getReminderPreferences();
      const dueSlot = checkReminderDue(new Date(), prefs);
      if (dueSlot) {
        triggerScheduledReminder(dueSlot, reminderStats, (alert) => {
          setActiveInAppReminder(alert);
        });
      }
    };

    checkSchedule();
    const interval = setInterval(checkSchedule, 30000);
    return () => clearInterval(interval);
  }, [reminderStats]);

  const handleTestReminder = (slot: '10am' | '2pm' | '9pm') => {
    triggerTestReminder(slot, reminderStats, (alert) => {
      setActiveInAppReminder(alert);
    });
  };

  // Handlers
  const handleToggleLang = () => {
    setLang((prev) => (prev === 'bn' ? 'en' : 'bn'));
  };

  const handleToggleFrame = () => {
    setIsMobileFrame((prev) => !prev);
  };

  const handleUpdateWaterMl = (ml: number) => {
    setWaterMl(Math.max(0, ml));
  };

  const handleUpdateWaterTargetMl = (targetMl: number) => {
    setProfile((prev) => ({
      ...prev,
      dailyWaterGoalMl: targetMl,
      dailyWaterGoalGlasses: Math.round(targetMl / 250),
    }));
  };

  const handleDeleteMealItem = (id: string) => {
    setLoggedMeals((prev) => prev.filter((item) => item.id !== id));
    if (recentLoggedMeal?.id === id) {
      setRecentLoggedMeal(null);
    }
  };

  const handleLogFood = (food: FoodItem, servings: number, mealType: MealType): string => {
    const newItem: LoggedMealItem = {
      id: `meal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      foodId: food.id,
      foodNameEn: food.nameEn,
      foodNameBn: food.nameBn,
      mealType,
      servings,
      servingUnitEn: food.servingSizeEn,
      servingUnitBn: food.servingSizeBn,
      calories: Math.round(food.calories * servings),
      protein: Number((food.protein * servings).toFixed(1)),
      carbs: Number((food.carbs * servings).toFixed(1)),
      fat: Number((food.fat * servings).toFixed(1)),
      timeAdded: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setLoggedMeals((prev) => [...prev, newItem]);
    setRecentLoggedMeal({
      id: newItem.id,
      foodName: lang === 'bn' ? food.nameBn : food.nameEn,
      calories: newItem.calories,
    });
    return newItem.id;
  };

  const handleLogSegments = (segments: ParsedMealSegment[], mealType: MealType) => {
    const newItems: LoggedMealItem[] = segments.map((seg) => ({
      id: `meal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      foodId: seg.foodId,
      foodNameEn: seg.foodNameEn,
      foodNameBn: seg.foodNameBn,
      mealType,
      servings: seg.quantity,
      servingUnitEn: seg.unitEn,
      servingUnitBn: seg.unitBn,
      calories: seg.calories,
      protein: seg.protein,
      carbs: seg.carbs,
      fat: seg.fat,
      timeAdded: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }));

    setLoggedMeals((prev) => [...prev, ...newItems]);
    if (newItems.length > 0) {
      const first = newItems[0];
      setRecentLoggedMeal({
        id: first.id,
        foodName: newItems.length === 1 ? (lang === 'bn' ? first.foodNameBn : first.foodNameEn) : `${newItems.length} items`,
        calories: newItems.reduce((sum, item) => sum + item.calories, 0),
      });
    }
  };

  const handleLogCustomItem = (item: LoggedMealItem) => {
    setLoggedMeals((prev) => [...prev, item]);
    setRecentLoggedMeal({
      id: item.id,
      foodName: lang === 'bn' ? item.foodNameBn : item.foodNameEn,
      calories: item.calories,
    });
  };

  const handleUndoRecentLog = () => {
    if (!recentLoggedMeal) return;
    handleDeleteMealItem(recentLoggedMeal.id);
    setRecentLoggedMeal(null);
  };

  useEffect(() => {
    if (!recentLoggedMeal) return;
    const timer = setTimeout(() => {
      setRecentLoggedMeal(null);
    }, 7000);
    return () => clearTimeout(timer);
  }, [recentLoggedMeal]);

  const handleApplyPresetPlan = (newItems: LoggedMealItem[]) => {
    setLoggedMeals(newItems);
    setActiveTab('today');
  };

  const handleOpenAddFoodModal = (mealType: MealType) => {
    setSelectedSlotForFood(mealType);
    setActiveTab('foods');
  };

  const handleAddWeightEntry = (entry: WeightHistoryEntry) => {
    setWeightHistory((prev) => [...prev, entry]);
  };

  const handleDeleteWeightEntry = (id: string) => {
    setWeightHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateProfileWeight = (newWeight: number) => {
    setProfile((prev) => ({ ...prev, weightKg: newWeight }));
  };

  // Content body switcher
  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'today':
        return (
          <DashboardView
            profile={profile}
            loggedMeals={loggedMeals}
            waterMl={waterMl}
            onUpdateWaterMl={handleUpdateWaterMl}
            onUpdateWaterTargetMl={handleUpdateWaterTargetMl}
            onDeleteMealItem={handleDeleteMealItem}
            onOpenAddFoodModal={handleOpenAddFoodModal}
            onOpenProfile={() => setShowProfileModal(true)}
            onNavigateToTab={(tab) => setActiveTab(tab)}
            onLogFood={handleLogFood}
            onLogSegments={handleLogSegments}
            onLogCustomItem={handleLogCustomItem}
            lang={lang}
          />
        );
      case 'foods':
        return (
          <FoodDirectoryView
            onLogFood={handleLogFood}
            onLogSegments={handleLogSegments}
            onLogCustomItem={handleLogCustomItem}
            lang={lang}
            initialMealType={selectedSlotForFood}
          />
        );
      case 'plans':
        return (
          <MealPlansView
            onApplyPlan={handleApplyPresetPlan}
            lang={lang}
          />
        );
      case 'recipes':
        return (
          <RecipesView
            onLogFood={handleLogFood}
            lang={lang}
          />
        );
      case 'grocery':
        return (
          <GroceryBazaarView
            groceryList={groceryList}
            onUpdateGroceryList={setGroceryList}
            lang={lang}
          />
        );
      case 'tracker':
        return (
          <WeightTrackerView
            profile={profile}
            weightHistory={weightHistory}
            onAddWeightEntry={handleAddWeightEntry}
            onDeleteWeightEntry={handleDeleteWeightEntry}
            onUpdateProfileWeight={handleUpdateProfileWeight}
            lang={lang}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans antialiased ${isMobileFrame ? 'p-0 sm:py-8 sm:px-4 flex items-center justify-center bg-zinc-900/90' : ''}`}>
      {/* Container wrapper (handles phone bezel frame option if active) */}
      <div
        className={`w-full flex-1 flex flex-col transition-all ${
          isMobileFrame
            ? 'max-w-[420px] max-h-[880px] bg-zinc-950 rounded-[40px] border-[10px] border-zinc-800 shadow-2xl overflow-hidden relative flex flex-col'
            : 'max-w-4xl mx-auto'
        }`}
      >
        {/* Smartphone top camera notch simulation in frame mode */}
        {isMobileFrame && (
          <div className="w-full bg-zinc-950 pt-2 pb-1 flex justify-center items-center z-50">
            <div className="w-24 h-4 bg-zinc-800 rounded-full" />
          </div>
        )}

        {/* Global Navigation Header */}
        <Navbar
          profile={profile}
          lang={lang}
          onToggleLang={handleToggleLang}
          isMobileFrame={isMobileFrame}
          onToggleFrame={handleToggleFrame}
          onOpenProfile={() => setShowProfileModal(true)}
          todayCalories={todayCalories}
          targetCalories={targets.targetCalories}
        />

        {/* PWA App Install Banner (Dismissible, only shows if installable or iOS) */}
        <PWAInstallBanner lang={lang} />

        {/* Active In-App Reminder Alert (when 10 AM, 2 PM, or 9 PM triggers, or tested) */}
        <InAppReminderAlert
          alert={activeInAppReminder}
          onClose={() => setActiveInAppReminder(null)}
          onActionClick={() => setActiveTab('today')}
          lang={lang}
        />

        {/* Scrollable Main Viewport */}
        <main className="flex-1 overflow-y-auto px-3 sm:px-4 pt-3 sm:pt-4 pb-8">
          {renderActiveTabContent()}
        </main>

        {/* Floating Quick Undo Notification */}
        {recentLoggedMeal && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md p-3 rounded-2xl bg-zinc-900 border border-emerald-500/50 shadow-2xl shadow-emerald-950/80 flex items-center justify-between gap-3 text-xs animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
              <span className="text-zinc-200 truncate">
                {lang === 'bn' ? 'যোগ হয়েছে:' : 'Logged:'}{' '}
                <strong className="text-white font-bold">{recentLoggedMeal.foodName}</strong>{' '}
                <span className="text-emerald-400 font-semibold">(+{recentLoggedMeal.calories} kcal)</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleUndoRecentLog}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-rose-950/50"
                title={lang === 'bn' ? 'ভুল করে চাপলে ফিরিয়ে নিন' : 'Undo accidental click'}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'বাতিল (Undo)' : 'Undo'}</span>
              </button>
              <button
                onClick={() => setRecentLoggedMeal(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Bottom Tab Navigation */}
        <BottomNav
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          lang={lang}
        />
      </div>

      {/* Profile & Health Calculator Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        profile={profile}
        onSave={setProfile}
        lang={lang}
        reminderStats={reminderStats}
        onTriggerTestReminder={handleTestReminder}
      />
    </div>
  );
}
