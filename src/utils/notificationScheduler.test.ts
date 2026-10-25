/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { test } from 'node:test';
import assert from 'node:assert';
import {
  buildReminderMessage,
  checkReminderDue,
  ReminderStats,
  DailyReminderPrefs,
} from './notificationScheduler';

test('buildReminderMessage generates exact text for 10:00 AM slot', () => {
  const stats: ReminderStats = {
    targetCalories: 2600,
    loggedCalories: 600,
    targetProtein: 95,
    loggedProtein: 25,
    targetWaterMl: 3000,
    loggedWaterMl: 750,
  };

  const message = buildReminderMessage('10am', stats);
  assert.strictEqual(message.title, 'Shokal 10:00 AM Reminder');
  assert.strictEqual(
    message.body,
    'Shokal 10:00 AM! Shokaler nashta o pani log korun. Ajker calorie target puron hote baki ache 2000 kcal!'
  );
});

test('buildReminderMessage generates exact text for 2:00 PM slot with dynamic protein and water', () => {
  const stats: ReminderStats = {
    targetCalories: 2600,
    loggedCalories: 1400,
    targetProtein: 95,
    loggedProtein: 45,
    targetWaterMl: 3000,
    loggedWaterMl: 1500,
  };

  const message = buildReminderMessage('2pm', stats);
  assert.strictEqual(message.title, 'Dupur 2:00 PM Reminder');
  assert.strictEqual(
    message.body,
    'Dupur 2:00 PM! Lunch & hydration check. Baki ache 50g protein o 1500ml pani!'
  );
});

test('buildReminderMessage generates exact text for 9:00 PM slot with remaining calories', () => {
  const stats: ReminderStats = {
    targetCalories: 2600,
    loggedCalories: 2250,
    targetProtein: 95,
    loggedProtein: 88,
    targetWaterMl: 3000,
    loggedWaterMl: 2800,
  };

  const message = buildReminderMessage('9pm', stats);
  assert.strictEqual(message.title, 'Rat 9:00 PM Reminder');
  assert.strictEqual(
    message.body,
    'Rat 9:00 PM! Daily summary: Ajker target puron hote ar matro 350 kcal baki. Din sesh korar age log korun!'
  );
});

test('checkReminderDue detects 10am slot accurately and avoids duplicate triggers', () => {
  const prefs: DailyReminderPrefs = {
    enabled: true,
    dismissedBanner: false,
    lastTriggered: {},
  };

  // Mock Date at 10:15 AM
  const morningDate = new Date('2026-10-25T10:15:00');
  const slot = checkReminderDue(morningDate, prefs);
  assert.strictEqual(slot, '10am');

  // Once marked triggered today, it should return null
  prefs.lastTriggered['10am'] = '2026-10-25';
  const slotAfter = checkReminderDue(morningDate, prefs);
  assert.strictEqual(slotAfter, null);
});

test('checkReminderDue respects enabled flag', () => {
  const prefs: DailyReminderPrefs = {
    enabled: false,
    dismissedBanner: false,
    lastTriggered: {},
  };

  const afternoonDate = new Date('2026-10-25T14:10:00');
  assert.strictEqual(checkReminderDue(afternoonDate, prefs), null);
});
