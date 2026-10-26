/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert';
import { calculateConsistencyStreak } from './dailyReset';
import { DailyHistoryEntry } from '../types';

test('calculateConsistencyStreak calculates accurate consecutive streak', () => {
  const history: DailyHistoryEntry[] = [
    {
      id: 'd-1',
      date: '2026-10-25',
      totalCalories: 2800,
      targetCalories: 2700,
      protein: 115,
      carbs: 390,
      fats: 80,
      waterMl: 3000,
      isGoalHit: true,
    },
    {
      id: 'd-2',
      date: '2026-10-24',
      totalCalories: 2750,
      targetCalories: 2700,
      protein: 110,
      carbs: 380,
      fats: 75,
      waterMl: 3000,
      isGoalHit: true,
    },
    {
      id: 'd-3',
      date: '2026-10-23',
      totalCalories: 2600,
      targetCalories: 2700,
      protein: 100,
      carbs: 360,
      fats: 70,
      waterMl: 2500,
      isGoalHit: false, // streak breaks here
    },
    {
      id: 'd-4',
      date: '2026-10-22',
      totalCalories: 2900,
      targetCalories: 2700,
      protein: 120,
      carbs: 400,
      fats: 82,
      waterMl: 3200,
      isGoalHit: true,
    },
  ];

  // Case 1: Today has hit the goal
  const streakWithToday = calculateConsistencyStreak(history, true);
  // Today (+1) + Oct 25 (+1) + Oct 24 (+1) = 3 days streak
  assert.strictEqual(streakWithToday.currentStreak, 3);
  assert.strictEqual(streakWithToday.totalGoalDays, 4);

  // Case 2: Today is in progress (not hit yet)
  const streakTodayPending = calculateConsistencyStreak(history, false);
  // Oct 25 (+1) + Oct 24 (+1) = 2 days streak
  assert.strictEqual(streakTodayPending.currentStreak, 2);
  assert.strictEqual(streakTodayPending.totalGoalDays, 3);
});
