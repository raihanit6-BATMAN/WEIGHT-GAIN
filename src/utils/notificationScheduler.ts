/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { showSystemNotification } from './serviceWorkerRegistration';

export interface DailyReminderPrefs {
  enabled: boolean;
  dismissedBanner: boolean;
  lastTriggered: {
    [slot: string]: string; // e.g. "10am": "2026-10-25"
  };
}

export interface ReminderStats {
  targetCalories: number;
  loggedCalories: number;
  targetProtein: number;
  loggedProtein: number;
  targetWaterMl: number;
  loggedWaterMl: number;
}

export interface ReminderAlert {
  id: string;
  slot: '10am' | '2pm' | '9pm';
  title: string;
  message: string;
  timestamp: string;
  stats: {
    remainingKcal: number;
    remainingProtein: number;
    remainingWater: number;
  };
}

const STORAGE_KEY = 'wg_reminders_prefs';

export function getReminderPreferences(): DailyReminderPrefs {
  if (typeof window === 'undefined') {
    return { enabled: true, dismissedBanner: false, lastTriggered: {} };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { enabled: true, dismissedBanner: false, lastTriggered: {} };
    return JSON.parse(raw);
  } catch {
    return { enabled: true, dismissedBanner: false, lastTriggered: {} };
  }
}

export function saveReminderPreferences(prefs: DailyReminderPrefs): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch (err) {
    console.warn('Failed to save reminder preferences:', err);
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  try {
    return await Notification.requestPermission();
  } catch (err) {
    console.warn('Error requesting notification permission:', err);
    return 'denied';
  }
}

export function getNotificationPermissionStatus(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

/**
 * Generates the exact notification message required for each slot
 */
export function buildReminderMessage(
  slot: '10am' | '2pm' | '9pm',
  stats: ReminderStats
): { title: string; body: string } {
  const remainingKcal = Math.max(0, stats.targetCalories - stats.loggedCalories);
  const remainingProtein = Math.max(0, Math.round(stats.targetProtein - stats.loggedProtein));
  const remainingWater = Math.max(0, stats.targetWaterMl - stats.loggedWaterMl);

  switch (slot) {
    case '10am':
      return {
        title: 'Shokal 10:00 AM Reminder',
        body: `Shokal 10:00 AM! Shokaler nashta o pani log korun. Ajker calorie target puron hote baki ache ${remainingKcal} kcal!`,
      };
    case '2pm':
      return {
        title: 'Dupur 2:00 PM Reminder',
        body: `Dupur 2:00 PM! Lunch & hydration check. Baki ache ${remainingProtein}g protein o ${remainingWater}ml pani!`,
      };
    case '9pm':
      return {
        title: 'Rat 9:00 PM Reminder',
        body: `Rat 9:00 PM! Daily summary: Ajker target puron hote ar matro ${remainingKcal} kcal baki. Din sesh korar age log korun!`,
      };
  }
}

/**
 * Checks current time against 10:00 AM, 2:00 PM, and 9:00 PM schedules.
 * Returns the alert if triggered, or null if no reminder is due.
 */
export function checkReminderDue(
  currentDate: Date,
  prefs: DailyReminderPrefs
): '10am' | '2pm' | '9pm' | null {
  if (!prefs.enabled) return null;

  const todayStr = currentDate.toISOString().split('T')[0];
  const hour = currentDate.getHours();
  const minute = currentDate.getMinutes();

  // 10:00 AM slot (10:00 - 10:29)
  if (hour === 10 && minute <= 29) {
    if (prefs.lastTriggered['10am'] !== todayStr) {
      return '10am';
    }
  }

  // 2:00 PM slot (14:00 - 14:29)
  if (hour === 14 && minute <= 29) {
    if (prefs.lastTriggered['2pm'] !== todayStr) {
      return '2pm';
    }
  }

  // 9:00 PM slot (21:00 - 21:29)
  if (hour === 21 && minute <= 29) {
    if (prefs.lastTriggered['9pm'] !== todayStr) {
      return '9pm';
    }
  }

  return null;
}

/**
 * Executes a reminder trigger: marks it triggered in localStorage,
 * attempts to display system notification, and passes reminder to in-app callback.
 */
export async function triggerScheduledReminder(
  slot: '10am' | '2pm' | '9pm',
  stats: ReminderStats,
  onInAppAlert?: (alert: ReminderAlert) => void
): Promise<ReminderAlert> {
  const { title, body } = buildReminderMessage(slot, stats);
  const remainingKcal = Math.max(0, stats.targetCalories - stats.loggedCalories);
  const remainingProtein = Math.max(0, Math.round(stats.targetProtein - stats.loggedProtein));
  const remainingWater = Math.max(0, stats.targetWaterMl - stats.loggedWaterMl);

  const alert: ReminderAlert = {
    id: `reminder-${Date.now()}-${slot}`,
    slot,
    title,
    message: body,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    stats: {
      remainingKcal,
      remainingProtein,
      remainingWater,
    },
  };

  // 1. Mark as triggered for today
  const prefs = getReminderPreferences();
  const todayStr = new Date().toISOString().split('T')[0];
  prefs.lastTriggered[slot] = todayStr;
  saveReminderPreferences(prefs);

  // 2. Trigger native system notification via Service Worker / Notification API
  await showSystemNotification(title, {
    body,
    tag: `reminder-${slot}`,
    url: '/',
  });

  // 3. Notify in-app subscriber
  if (onInAppAlert) {
    onInAppAlert(alert);
  }

  return alert;
}

/**
 * Allows manual or test firing of any slot immediately with live stats
 */
export async function triggerTestReminder(
  slot: '10am' | '2pm' | '9pm',
  stats: ReminderStats,
  onInAppAlert?: (alert: ReminderAlert) => void
): Promise<ReminderAlert> {
  const { title, body } = buildReminderMessage(slot, stats);
  const remainingKcal = Math.max(0, stats.targetCalories - stats.loggedCalories);
  const remainingProtein = Math.max(0, Math.round(stats.targetProtein - stats.loggedProtein));
  const remainingWater = Math.max(0, stats.targetWaterMl - stats.loggedWaterMl);

  const alert: ReminderAlert = {
    id: `test-reminder-${Date.now()}-${slot}`,
    slot,
    title,
    message: body,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    stats: {
      remainingKcal,
      remainingProtein,
      remainingWater,
    },
  };

  // Attempt system notification
  await showSystemNotification(title, {
    body,
    tag: `test-${slot}`,
    url: '/',
  });

  if (onInAppAlert) {
    onInAppAlert(alert);
  }

  return alert;
}
