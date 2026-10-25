/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MealType, LoggedMealItem } from '../types';
import { Sparkles, Cookie, Flame, UtensilsCrossed, Check } from 'lucide-react';

interface QuickCalorieGuesserProps {
  onLogCustomItem: (item: LoggedMealItem) => void;
  lang: 'en' | 'bn';
  defaultMealSlot?: MealType;
  compact?: boolean;
}

export const QuickCalorieGuesser: React.FC<QuickCalorieGuesserProps> = ({
  onLogCustomItem,
  lang,
  defaultMealSlot = 'evening_shake',
  compact = false,
}) => {
  const [selectedSlot, setSelectedSlot] = useState<MealType>(defaultMealSlot);
  const [justLogged, setJustLogged] = useState<string | null>(null);

  const presets = [
    {
      id: 'light-snack',
      titleEn: 'Light Snack',
      titleBn: 'হালকা নাস্তা',
      descEn: 'Tea, 2 biscuits, small fruit, or 1 puri',
      descBn: 'চা, ২টা বিস্কুট বা ১টা পুরী/হালকা নাস্তা',
      calories: 150,
      protein: 3.0,
      carbs: 20.0,
      fat: 6.0,
      colorClass: 'border-emerald-500/40 hover:border-emerald-400 bg-emerald-950/30 text-emerald-300',
      icon: Cookie,
    },
    {
      id: 'medium-snack',
      titleEn: 'Medium / Fried Snack',
      titleBn: 'তেল-মসলার নাস্তা',
      descEn: '2 singaras, somosa, roll, or chola boot',
      descBn: '২টা সিঙ্গাড়া, সমুচা, রোল বা ছোলা বুট',
      calories: 300,
      protein: 5.0,
      carbs: 35.0,
      fat: 15.0,
      colorClass: 'border-amber-500/40 hover:border-amber-400 bg-amber-950/30 text-amber-300',
      icon: Flame,
    },
    {
      id: 'heavy-meal',
      titleEn: 'Heavy Outside Meal',
      titleBn: 'ভরপেট বাইরের খাবার',
      descEn: 'Full biryani, tehari, burger, or muglai',
      descBn: 'বিরিয়ানি, তেহারি, মোগলাই বা ভারি খাবার',
      calories: 650,
      protein: 18.0,
      carbs: 75.0,
      fat: 30.0,
      colorClass: 'border-rose-500/40 hover:border-rose-400 bg-rose-950/30 text-rose-300',
      icon: UtensilsCrossed,
    },
  ];

  const handleQuickLog = (preset: typeof presets[0]) => {
    const newItem: LoggedMealItem = {
      id: `quick-guess-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      foodId: preset.id,
      foodNameEn: `Outside: ${preset.titleEn}`,
      foodNameBn: `বাইরের খাবার: ${preset.titleBn}`,
      mealType: selectedSlot,
      servings: 1,
      servingUnitEn: '1 estimated portion',
      servingUnitBn: '১ অনুমানকৃত অংশ',
      calories: preset.calories,
      protein: preset.protein,
      carbs: preset.carbs,
      fat: preset.fat,
      timeAdded: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    onLogCustomItem(newItem);
    setJustLogged(preset.titleEn);
    setTimeout(() => setJustLogged(null), 3000);
  };

  return (
    <section className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-md space-y-3">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>{lang === 'bn' ? 'কুইক ক্যালরি গেসার' : 'Quick Calorie Guesser'}</span>
              <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {lang === 'bn' ? 'অজানা খাবারের ৩ বাটন' : 'Unknown Outside Food'}
              </span>
            </h3>
            <p className="text-[11px] text-zinc-400">
              {lang === 'bn'
                ? 'বাইরে অচেনা কিছু খেলে ১ ক্লিকে সরাসরি ক্যালরি এস্টিমেট করে যোগ করুন'
                : 'Eating outside with unknown nutrition? Log an instant 1-click rough estimate'}
            </p>
          </div>
        </div>

        {/* Meal Slot Picker */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-zinc-400 text-[11px] hidden xs:inline">{lang === 'bn' ? 'বেলা:' : 'Slot:'}</span>
          <select
            value={selectedSlot}
            onChange={(e) => setSelectedSlot(e.target.value as MealType)}
            className="px-2.5 py-1 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs font-semibold focus:outline-none focus:border-amber-400"
          >
            <option value="breakfast">{lang === 'bn' ? 'সকালের নাস্তা' : 'Breakfast'}</option>
            <option value="morning_snack">{lang === 'bn' ? 'দুপুরের আগের নাস্তা' : 'Mid-Morning'}</option>
            <option value="lunch">{lang === 'bn' ? 'দুপুরের খাবার' : 'Lunch'}</option>
            <option value="evening_shake">{lang === 'bn' ? 'বিকালের নাস্তা' : 'Evening Snack'}</option>
            <option value="dinner">{lang === 'bn' ? 'রাতের খাবার' : 'Dinner'}</option>
            <option value="bedtime">{lang === 'bn' ? 'ঘুমানোর আগে' : 'Bedtime'}</option>
          </select>
        </div>
      </div>

      {justLogged && (
        <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            {lang === 'bn'
              ? `${justLogged} সফলভাবে আজকের ডায়েটে যোগ হয়েছে!`
              : `Logged "${justLogged}" directly to today's diary!`}
          </span>
        </div>
      )}

      {/* 3 Quick Guess Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {presets.map((p) => {
          const Icon = p.icon;
          return (
            <button
              key={p.id}
              onClick={() => handleQuickLog(p)}
              className={`p-3 rounded-2xl border text-left transition-all hover:scale-[1.01] active:scale-[0.99] flex flex-col justify-between space-y-2 group shadow-sm ${p.colorClass}`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold text-xs">
                    <Icon className="w-3.5 h-3.5" />
                    <span>{lang === 'bn' ? p.titleBn : p.titleEn}</span>
                  </span>
                  <span className="text-xs font-extrabold px-1.5 py-0.5 rounded bg-zinc-950/60 text-white border border-zinc-700">
                    +{p.calories} kcal
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1 line-clamp-1 leading-relaxed">
                  {lang === 'bn' ? p.descBn : p.descEn}
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px] text-zinc-300 pt-1 border-t border-zinc-800/80">
                <span className="font-semibold text-emerald-400">{p.protein}g P</span>
                <span className="text-sky-300">{p.carbs}g C</span>
                <span className="text-amber-300">{p.fat}g F</span>
                <span className="text-white font-bold group-hover:underline">
                  {lang === 'bn' ? '+ যোগ করুন' : '+ Log'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
