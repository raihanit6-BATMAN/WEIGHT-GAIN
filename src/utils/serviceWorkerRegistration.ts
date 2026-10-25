/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

let swRegistration: ServiceWorkerRegistration | null = null;

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    swRegistration = reg;

    // Check for updates periodically
    reg.addEventListener('updatefound', () => {
      const installingWorker = reg.installing;
      if (installingWorker) {
        installingWorker.addEventListener('statechange', () => {
          if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('[SW] New version available.');
          }
        });
      }
    });

    return reg;
  } catch (error) {
    console.warn('[SW] Registration failed:', error);
    return null;
  }
}

export function getServiceWorkerRegistration(): ServiceWorkerRegistration | null {
  return swRegistration;
}

export async function showSystemNotification(title: string, options: {
  body: string;
  tag?: string;
  icon?: string;
  badge?: string;
  url?: string;
}): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission !== 'granted') {
    return false;
  }

  try {
    // Strategy 1: Through Service Worker registration (most reliable on mobile & PWA)
    if (swRegistration && 'showNotification' in swRegistration) {
      await swRegistration.showNotification(title, {
        body: options.body,
        icon: options.icon || '/icon-192.png',
        badge: options.badge || '/icon-192.png',
        tag: options.tag || 'daily-reminder',
        vibrate: [200, 100, 200] as unknown as number[],
        data: { url: options.url || '/' },
      } as NotificationOptions);
      return true;
    }

    // Strategy 2: If SW registration is ready via navigator
    if ('serviceWorker' in navigator) {
      const readyReg = await navigator.serviceWorker.ready;
      if (readyReg && readyReg.showNotification) {
        await readyReg.showNotification(title, {
          body: options.body,
          icon: options.icon || '/icon-192.png',
          badge: options.badge || '/icon-192.png',
          tag: options.tag || 'daily-reminder',
          data: { url: options.url || '/' },
        } as NotificationOptions);
        return true;
      }
    }

    // Strategy 3: Standard Desktop Notification constructor fallback
    new Notification(title, {
      body: options.body,
      icon: options.icon || '/icon-192.png',
      badge: options.badge || '/icon-192.png',
      tag: options.tag || 'daily-reminder',
    });
    return true;
  } catch (err) {
    console.warn('[Notification] Failed to show system notification:', err);
    return false;
  }
}
