/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ReminderAlert } from '../utils/notificationScheduler';
import { Bell, X, ArrowRight, Droplets, Flame, ShieldAlert } from 'lucide-react';

interface InAppReminderAlertProps {
  alert: ReminderAlert | null;
  onClose: () => void;
  onActionClick: () => void;
  lang: 'en' | 'bn';
}

export const InAppReminderAlert: React.FC<InAppReminderAlertProps> = ({
  alert,
  onClose,
  onActionClick,
  lang,
}) => {
  if (!alert) return null;

  return (
    <div className="mx-3 sm:mx-4 mt-2.5 p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/90 via-zinc-900 to-zinc-900 border border-amber-500/50 shadow-2xl shadow-amber-950/40 text-xs text-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-3">
      <div className="flex items-start gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
          <Bell className="w-4 h-4 animate-bounce" />
        </div>
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-amber-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <span>{alert.title}</span>
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">
              {alert.timestamp}
            </span>
          </div>

          <p className="text-zinc-200 text-xs font-medium leading-relaxed break-words">
            {alert.message}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700 text-[10px] text-zinc-300">
              <Flame className="w-3 h-3 text-amber-400" />
              <span>{lang === 'bn' ? 'বাকি ক্যালোরি:' : 'Remaining Kcal:'} <strong className="text-white">{alert.stats.remainingKcal}</strong></span>
            </span>

            {alert.slot === '2pm' && (
              <>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700 text-[10px] text-zinc-300">
                  <ShieldAlert className="w-3 h-3 text-emerald-400" />
                  <span>{lang === 'bn' ? 'বাকি প্রোটিন:' : 'Remaining Protein:'} <strong className="text-white">{alert.stats.remainingProtein}g</strong></span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700 text-[10px] text-zinc-300">
                  <Droplets className="w-3 h-3 text-cyan-400" />
                  <span>{lang === 'bn' ? 'বাকি পানি:' : 'Remaining Water:'} <strong className="text-white">{alert.stats.remainingWater}ml</strong></span>
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        <button
          onClick={() => {
            onActionClick();
            onClose();
          }}
          className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-amber-950/40"
        >
          <span>{lang === 'bn' ? 'খাবার লগ করুন' : 'Log Food'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          title={lang === 'bn' ? 'বন্ধ করুন' : 'Dismiss'}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
