/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { MealType, LoggedMealItem } from '../types';
import { parseBanglishMealInput, ParsedMealSegment } from '../utils/banglishParser';
import { Wand2, Plus, Check, CornerDownLeft, Sparkles } from 'lucide-react';

interface SmartFoodInputBarProps {
  onLogSegments: (segments: ParsedMealSegment[], mealType: MealType) => void;
  lang: 'en' | 'bn';
  defaultMealSlot?: MealType;
}

export const SmartFoodInputBar: React.FC<SmartFoodInputBarProps> = ({
  onLogSegments,
  lang,
  defaultMealSlot = 'evening_shake',
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedMealType, setSelectedMealType] = useState<MealType>(defaultMealSlot);
  const [justLoggedMessage, setJustLoggedMessage] = useState<string | null>(null);

  const parsedResult = useMemo(() => {
    return parseBanglishMealInput(inputText);
  }, [inputText]);

  const examplePrompts = [
    '2 ta singara ar 1 cup dudh cha',
    '1 bati ghon dal ar 1 plate bhaat',
    '3 ta somosa',
    '1 bowl panchmishali sobji ar 2 ta ruti',
    '2 ta dim ar 2 ta porota',
    '1 ta chicken roll',
  ];

  const handleApplyExample = (ex: string) => {
    setInputText(ex);
  };

  const handleConfirmLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parsedResult.segments || parsedResult.segments.length === 0) return;

    onLogSegments(parsedResult.segments, selectedMealType);
    const summaryCount = parsedResult.segments.length;
    setJustLoggedMessage(
      lang === 'bn'
        ? `${summaryCount}টি খাবার (${parsedResult.totalCalories} ক্যালরি) আজকের রুটিনে যোগ হয়েছে!`
        : `Logged ${summaryCount} items (+${parsedResult.totalCalories} kcal) to today's diary!`
    );
    setInputText('');
    setTimeout(() => setJustLoggedMessage(null), 3500);
  };

  return (
    <section className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-emerald-950/20 border border-emerald-500/30 shadow-lg space-y-3">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
            <Wand2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>{lang === 'bn' ? 'স্মার্ট বাংলিশ ইনপুট' : 'Banglish Smart Meal Logger'}</span>
              <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {lang === 'bn' ? 'প্রাকৃতিক টেক্সট' : 'Type & Log'}
              </span>
            </h3>
            <p className="text-[11px] text-zinc-400">
              {lang === 'bn'
                ? 'মুখে যেভাবে বলেন সেভাবে লিখুন (যেমন: "2 ta singara ar 1 cup dudh cha")'
                : 'Type naturally in Banglish or Bengali to instantly calculate and log foods'}
            </p>
          </div>
        </div>

        {/* Meal Slot Picker */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-zinc-400 text-[11px] hidden xs:inline">{lang === 'bn' ? 'বেলা:' : 'Slot:'}</span>
          <select
            value={selectedMealType}
            onChange={(e) => setSelectedMealType(e.target.value as MealType)}
            className="px-2.5 py-1 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs font-semibold focus:outline-none focus:border-emerald-400"
          >
            <option value="breakfast">{lang === 'bn' ? 'সকালের নাস্তা' : 'Breakfast'}</option>
            <option value="morning_snack">{lang === 'bn' ? 'দুপুরের আগের নাস্তা' : 'Mid-Morning'}</option>
            <option value="lunch">{lang === 'bn' ? 'দুপুরের খাবার' : 'Lunch'}</option>
            <option value="evening_shake">{lang === 'bn' ? 'বিকালের নাস্তা / শেক' : 'Evening Snack'}</option>
            <option value="dinner">{lang === 'bn' ? 'রাতের খাবার' : 'Dinner'}</option>
            <option value="bedtime">{lang === 'bn' ? 'ঘুমানোর আগে' : 'Bedtime'}</option>
          </select>
        </div>
      </div>

      {/* Input Form Bar */}
      <form onSubmit={handleConfirmLog} className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                lang === 'bn'
                  ? 'যেমন: 2 ta singara ar 1 cup dudh cha...'
                  : 'e.g. 2 ta singara ar 1 cup dudh cha, 1 bati ghon dal...'
              }
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-zinc-800/90 border border-zinc-700 text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-400 font-medium"
            />
            {inputText && (
              <button
                type="button"
                onClick={() => setInputText('')}
                className="absolute right-3 top-2.5 text-zinc-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={!inputText.trim() || parsedResult.segments.length === 0}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-zinc-950 font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950/40 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'bn' ? 'লগ করুন' : 'Log to Today'}</span>
          </button>
        </div>
      </form>

      {/* Quick Example Clickable Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
        <span className="text-zinc-500 shrink-0">{lang === 'bn' ? 'উদাহরণ:' : 'Try:'}</span>
        {examplePrompts.map((ex, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleApplyExample(ex)}
            className="px-2 py-0.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700/60 text-zinc-300 whitespace-nowrap transition-colors"
          >
            {ex}
          </button>
        ))}
      </div>

      {/* Live Parsed Preview Chips (Instant dynamic feedback) */}
      {inputText.trim() && parsedResult.segments.length > 0 && (
        <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'স্বয়ংক্রিয় সনাক্তকরণ:' : 'Auto Detected Items:'}</span>
            </span>
            <span className="text-xs font-black text-white">
              +{parsedResult.totalCalories} kcal
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {parsedResult.segments.map((seg, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-white font-medium flex items-center gap-1.5 shadow-sm"
              >
                <strong className="text-emerald-400 font-extrabold">{seg.quantity}x</strong>
                <span>{lang === 'bn' ? seg.foodNameBn : seg.foodNameEn}</span>
                <span className="text-[10px] text-zinc-400">({seg.calories} kcal)</span>
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-zinc-800/70 text-[11px] text-zinc-400">
            <span>
              {lang === 'bn' ? 'মোট পুষ্টি:' : 'Total Macros:'}{' '}
              <strong className="text-emerald-300">{parsedResult.totalProtein}g Prot</strong> ·{' '}
              <strong className="text-sky-300">{parsedResult.totalCarbs}g Carbs</strong> ·{' '}
              <strong className="text-amber-300">{parsedResult.totalFat}g Fat</strong>
            </span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CornerDownLeft className="w-3 h-3" />
              <span>{lang === 'bn' ? 'এন্টার চাপুন বা লগ বাটন চাপুন' : 'Hit enter or click Log'}</span>
            </span>
          </div>
        </div>
      )}

      {/* Confirmation Message */}
      {justLoggedMessage && (
        <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{justLoggedMessage}</span>
        </div>
      )}
    </section>
  );
};
