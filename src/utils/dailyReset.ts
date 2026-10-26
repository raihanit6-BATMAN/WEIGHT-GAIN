/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DailyHistoryEntry, LoggedMealItem } from '../types';
import {
  getLocalTodayDateString,
  loadLastActiveDate,
  saveLastActiveDate,
  loadDailyHistory,
  saveDailyHistory,
  saveLoggedMeals,
  saveWaterMl,
} from './storage';

export interface ResetCheckResult {
  didReset: boolean;
  archivedDate?: string;
  updatedHistory?: DailyHistoryEntry[];
}

/**
 * Checks if the local date has changed since the user last accessed the app.
 * If a new day has started:
 * 1. Archives yesterday's totals into dailyHistory.
 * 2. Resets today's logged meals and water back to 0.
 * 3. Updates lastActiveDate to today's date.
 */
export function checkAndPerformDailyReset(
  currentMeals: LoggedMealItem[],
  currentWaterMl: number,
  targetCalories: number,
  currentLocalDate: string = getLocalTodayDateString()
): ResetCheckResult {
  const lastActiveDate = loadLastActiveDate();

  if (!lastActiveDate) {
    // First run on a fresh install - establish today's baseline date
    saveLastActiveDate(currentLocalDate);
    return { didReset: false };
  }

  if (lastActiveDate !== currentLocalDate) {
    // A midnight rollover or date change has occurred!
    const totalCalories = currentMeals.reduce((sum, item) => sum + item.calories, 0);
    const protein = Number(currentMeals.reduce((sum, item) => sum + item.protein, 0).toFixed(1));
    const carbs = Number(currentMeals.reduce((sum, item) => sum + item.carbs, 0).toFixed(1));
    const fats = Number(currentMeals.reduce((sum, item) => sum + item.fat, 0).toFixed(1));

    const existingHistory = loadDailyHistory();

    // Check if we already archived this specific date to avoid duplicate entries
    const alreadyArchived = existingHistory.some((entry) => entry.date === lastActiveDate);
    let updatedHistory = existingHistory;

    // Archive only if there was some activity or yesterday wasn't recorded
    if (!alreadyArchived && (totalCalories > 0 || currentWaterMl > 0 || currentMeals.length > 0)) {
      const yesterdayEntry: DailyHistoryEntry = {
        id: `dh-${lastActiveDate}-${Date.now()}`,
        date: lastActiveDate,
        totalCalories,
        targetCalories,
        protein,
        carbs,
        fats,
        waterMl: currentWaterMl,
        loggedMeals: [...currentMeals],
        isGoalHit: totalCalories >= targetCalories,
      };

      updatedHistory = [yesterdayEntry, ...existingHistory].slice(0, 30); // retain last 30 days
      saveDailyHistory(updatedHistory);
    }

    // Reset today's consumption back to 0 for a fresh morning start
    saveLoggedMeals([]);
    saveWaterMl(0);
    saveLastActiveDate(currentLocalDate);

    return {
      didReset: true,
      archivedDate: lastActiveDate,
      updatedHistory,
    };
  }

  return { didReset: false };
}

/**
 * Calculates continuous daily consistency streak from history and today's status.
 */
export function calculateConsistencyStreak(
  history: DailyHistoryEntry[],
  todayGoalHit: boolean
): { currentStreak: number; totalGoalDays: number } {
  let currentStreak = todayGoalHit ? 1 : 0;
  const sorted = [...history].sort((a, b) => b.date.localeCompare(a.date));

  // Count consecutive days where goal was hit
  for (const day of sorted) {
    if (day.isGoalHit) {
      currentStreak += 1;
    } else {
      break;
    }
  }

  const totalGoalDays = sorted.filter((d) => d.isGoalHit).length + (todayGoalHit ? 1 : 0);

  return { currentStreak, totalGoalDays };
}

/**
 * Manually force a daily reset for testing or simulation.
 */
export function forceSimulateDailyReset(
  currentMeals: LoggedMealItem[],
  currentWaterMl: number,
  targetCalories: number
): ResetCheckResult {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const simulatedYesterday = yesterday.toLocaleDateString('en-CA');

  const totalCalories = currentMeals.reduce((sum, item) => sum + item.calories, 0);
  const protein = Number(currentMeals.reduce((sum, item) => sum + item.protein, 0).toFixed(1));
  const carbs = Number(currentMeals.reduce((sum, item) => sum + item.carbs, 0).toFixed(1));
  const fats = Number(currentMeals.reduce((sum, item) => sum + item.fat, 0).toFixed(1));

  const existingHistory = loadDailyHistory();
  const yesterdayEntry: DailyHistoryEntry = {
    id: `dh-${simulatedYesterday}-${Date.now()}`,
    date: simulatedYesterday,
    totalCalories: totalCalories > 0 ? totalCalories : 2750,
    targetCalories,
    protein: protein > 0 ? protein : 110,
    carbs: carbs > 0 ? carbs : 380,
    fats: fats > 0 ? fats : 78,
    waterMl: currentWaterMl > 0 ? currentWaterMl : 3000,
    loggedMeals: [...currentMeals],
    isGoalHit: totalCalories >= targetCalories || totalCalories === 0,
  };

  const updatedHistory = [yesterdayEntry, ...existingHistory.filter((e) => e.date !== simulatedYesterday)].slice(0, 30);
  saveDailyHistory(updatedHistory);
  saveLoggedMeals([]);
  saveWaterMl(0);
  saveLastActiveDate(getLocalTodayDateString());

  return {
    didReset: true,
    archivedDate: simulatedYesterday,
    updatedHistory,
  };
}
