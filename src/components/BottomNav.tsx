/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LayoutDashboard, Utensils, CalendarDays, Coffee, TrendingUp } from 'lucide-react';

export type TabType = 'today' | 'foods' | 'plans' | 'recipes' | 'grocery' | 'tracker';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  lang: 'en' | 'bn';
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  lang,
}) => {
  const tabs = [
    {
      id: 'today' as TabType,
      labelEn: 'Today',
      labelBn: 'আজকের রুটিন',
      icon: LayoutDashboard,
    },
    {
      id: 'foods' as TabType,
      labelEn: 'BD Foods',
      labelBn: 'দেশি খাবার',
      icon: Utensils,
    },
    {
      id: 'plans' as TabType,
      labelEn: 'Diet Plans',
      labelBn: 'ডায়েট চার্ট',
      icon: CalendarDays,
    },
    {
      id: 'recipes' as TabType,
      labelEn: 'Shakes',
      labelBn: 'পাওয়ার শেক',
      icon: Coffee,
    },
    {
      id: 'tracker' as TabType,
      labelEn: 'Tracker',
      labelBn: 'ওজন লগ',
      icon: TrendingUp,
    },
  ];

  return (
    <nav className="sticky bottom-0 w-full z-40 bg-zinc-900/95 backdrop-blur-md border-t border-zinc-800 text-zinc-400">
      <div className="max-w-md mx-auto px-1 sm:px-2 py-1.5 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-all ${
                isActive
                  ? 'text-emerald-400 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              aria-label={lang === 'bn' ? tab.labelBn : tab.labelEn}
              aria-current={isActive ? 'page' : undefined}
            >
              <div
                className={`p-1 rounded-md transition-colors ${
                  isActive ? 'bg-emerald-500/15 text-emerald-400' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[60px]">
                {lang === 'bn' ? tab.labelBn : tab.labelEn}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
