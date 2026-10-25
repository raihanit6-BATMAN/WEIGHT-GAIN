/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NutritionInsight } from '../utils/nutritionInsights';
import { FoodItem, MealType } from '../types';
import { Lightbulb, Plus, Check, ArrowRight, RotateCcw } from 'lucide-react';

interface NutritionInsightCardProps {
  insight: NutritionInsight;
  onQuickLog: (food: FoodItem, servings: number, mealType: MealType) => string | void;
  onUndoLog?: (id: string) => void;
  lang: 'en' | 'bn';
}

export const NutritionInsightCard: React.FC<NutritionInsightCardProps> = ({
  insight,
  onQuickLog,
  onUndoLog,
  lang,
}) => {
  const [lastLoggedId, setLastLoggedId] = React.useState<string | null>(null);

  const handleAdd = () => {
    const returnedId = onQuickLog(insight.suggestedFood, 1, 'evening_shake');
    if (typeof returnedId === 'string') {
      setLastLoggedId(returnedId);
    } else {
      setLastLoggedId('recent-insight-log');
    }
  };

  const handleUndo = () => {
    if (lastLoggedId && onUndoLog) {
      onUndoLog(lastLoggedId);
    }
    setLastLoggedId(null);
  };

  return (
    <section className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-900 border border-emerald-600/40 shadow-lg relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Insight Info */}
        <div className="flex items-start gap-3.5 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <Lightbulb className="w-5 h-5 text-emerald-400" />
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                {lang === 'bn' ? 'পুষ্টি পরামর্শ' : 'Nutrition Insight'}
              </span>
              <span className="text-xs text-zinc-400 truncate">
                {lang === 'bn' ? 'আজকের ঘাটতি অনুযায়ী' : 'Based on today\'s remaining macros'}
              </span>
            </div>

            <h3 className="text-base font-extrabold text-white flex items-center gap-1.5 break-words">
              <span>{lang === 'bn' ? insight.suggestedPortionBn : insight.suggestedPortionEn}</span>
            </h3>

            <p className="text-xs text-zinc-300 leading-relaxed max-w-xl break-words">
              {lang === 'bn' ? insight.reasonBn : insight.reasonEn}
            </p>

            <div className="pt-1 flex items-center gap-2 text-[11px] font-semibold text-emerald-300">
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang === 'bn' ? insight.macroBenefitBn : insight.macroBenefitEn}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="shrink-0 sm:self-center">
          {lastLoggedId ? (
            <div className="flex items-center gap-2">
              <span className="px-3 py-2 rounded-xl bg-zinc-800 text-emerald-400 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{lang === 'bn' ? 'যোগ হয়েছে' : 'Logged!'}</span>
              </span>
              <button
                type="button"
                onClick={handleUndo}
                className="px-3 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-700/60 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
                title={lang === 'bn' ? 'ভুল করে চাপলে বাতিল করুন' : 'Undo accidental log'}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'বাতিল (Undo)' : 'Undo'}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md bg-emerald-600 hover:bg-emerald-500 text-zinc-950 shadow-emerald-900/40"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'bn' ? 'তালিকায় যোগ করুন' : 'Eat this & Log'}</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
