/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Droplets, Plus, Minus, CheckCircle, RotateCcw, Edit2, Check } from 'lucide-react';

interface WaterTrackerProps {
  waterMl: number;
  onUpdateWaterMl: (ml: number) => void;
  targetMl: number;
  onUpdateTargetMl?: (target: number) => void;
  lang: 'en' | 'bn';
}

export const WaterTracker: React.FC<WaterTrackerProps> = ({
  waterMl,
  onUpdateWaterMl,
  targetMl = 3000,
  onUpdateTargetMl,
  lang,
}) => {
  const [manualAmount, setManualAmount] = useState<string>('');
  const [isEditingTarget, setIsEditingTarget] = useState<boolean>(false);
  const [customTargetInput, setCustomTargetInput] = useState<string>(targetMl.toString());

  const progressPercent = targetMl > 0 ? Math.round((waterMl / targetMl) * 100) : 0;
  const isGoalReached = waterMl >= targetMl;

  const handleAddMl = (amount: number) => {
    onUpdateWaterMl(Math.max(0, waterMl + amount));
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(manualAmount, 10);
    if (!isNaN(val) && val > 0) {
      onUpdateWaterMl(Math.max(0, waterMl + val));
      setManualAmount('');
    }
  };

  const handleManualSet = () => {
    const val = parseInt(manualAmount, 10);
    if (!isNaN(val) && val >= 0) {
      onUpdateWaterMl(val);
      setManualAmount('');
    }
  };

  const handleSaveCustomTarget = () => {
    const newTarget = parseInt(customTargetInput, 10);
    if (!isNaN(newTarget) && newTarget >= 1000 && newTarget <= 8000) {
      onUpdateTargetMl?.(newTarget);
      setIsEditingTarget(false);
    }
  };

  // Glass grid: 1 glass = 250ml
  const totalGlassesForTarget = Math.max(8, Math.ceil(targetMl / 250));
  const fullGlassesCount = Math.floor(waterMl / 250);

  const presetTargets = [2500, 3000, 3500, 4000];

  return (
    <section className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-md space-y-3.5 overflow-hidden">
      {/* Top Header: Title, Metric, & Goal Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30 shrink-0">
            <Droplets className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-white truncate">
                {lang === 'bn' ? 'দৈনিক পানি পানের ট্র্যাকার' : 'Daily Hydration Tracker'}
              </h3>
              <span
                className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full border ${
                  isGoalReached
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                    : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                }`}
              >
                {progressPercent}% {isGoalReached && (lang === 'bn' ? '— লক্ষ্য পূরণ! 🎉' : '— Goal Hit! 🎉')}
              </span>
            </div>

            <p className="text-xs text-zinc-300 mt-0.5 font-medium truncate">
              <strong className="text-blue-400 font-bold text-sm">{waterMl.toLocaleString()} ml</strong>
              <span className="text-zinc-400"> / {targetMl.toLocaleString()} ml </span>
              <span className="text-zinc-500 text-[11px]">
                (~{(waterMl / 250).toFixed(1)} {lang === 'bn' ? 'গ্লাস' : 'glasses'})
              </span>
            </p>
          </div>
        </div>

        {/* Target Goal Selector / Modifier */}
        <div className="flex items-center gap-1.5 self-start sm:self-center shrink-0">
          {!isEditingTarget ? (
            <button
              onClick={() => {
                setCustomTargetInput(targetMl.toString());
                setIsEditingTarget(true);
              }}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700/80 border border-zinc-700 text-zinc-300 hover:text-white flex items-center gap-1 transition-colors"
              title={lang === 'bn' ? 'দৈনিক পানির লক্ষ্য পরিবর্তন করুন' : 'Change daily water target'}
            >
              <Edit2 className="w-3 h-3 text-blue-400" />
              <span>{lang === 'bn' ? `টার্গেট: ${(targetMl / 1000).toFixed(1)}L` : `Target: ${(targetMl / 1000).toFixed(1)}L`}</span>
            </button>
          ) : (
            <div className="flex items-center gap-1 bg-zinc-800/90 p-1 rounded-lg border border-blue-500/50">
              <input
                type="number"
                step="250"
                min="1500"
                max="6000"
                value={customTargetInput}
                onChange={(e) => setCustomTargetInput(e.target.value)}
                className="w-16 px-1.5 py-0.5 text-xs bg-zinc-950 border border-zinc-700 rounded text-white font-bold text-center focus:outline-none focus:border-blue-400"
                placeholder="ml"
              />
              <span className="text-[10px] text-zinc-400">ml</span>
              <button
                onClick={handleSaveCustomTarget}
                className="p-1 rounded bg-blue-600 text-zinc-950 hover:bg-blue-500 font-bold"
                title="Save target"
              >
                <Check className="w-3 h-3" />
              </button>
              <button
                onClick={() => setIsEditingTarget(false)}
                className="p-1 rounded text-zinc-400 hover:text-white text-xs"
                title="Cancel"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Target Presets if in edit mode */}
      {isEditingTarget && (
        <div className="flex items-center gap-1.5 flex-wrap p-2 rounded-xl bg-zinc-950/70 border border-zinc-800 text-xs">
          <span className="text-[11px] text-zinc-400">{lang === 'bn' ? 'দ্রুত বাছাই:' : 'Quick Targets:'}</span>
          {presetTargets.map((preset) => (
            <button
              key={preset}
              onClick={() => {
                onUpdateTargetMl?.(preset);
                setIsEditingTarget(false);
              }}
              className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                targetMl === preset
                  ? 'bg-blue-600 text-zinc-950 border-blue-500'
                  : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
              }`}
            >
              {preset / 1000}L ({preset} ml)
            </button>
          ))}
        </div>
      )}

      {/* Linear Progress Bar (Handles >100% smoothly) */}
      <div className="space-y-1">
        <div className="w-full bg-zinc-800/80 rounded-full h-2.5 overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isGoalReached
                ? 'bg-gradient-to-r from-blue-500 via-teal-400 to-emerald-400'
                : 'bg-gradient-to-r from-blue-600 to-cyan-400'
            }`}
            style={{ width: `${Math.min(100, progressPercent)}%` }}
          />
        </div>
      </div>

      {/* Quick Increment Controls (Mobile-First Touch Friendly) */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
        <button
          onClick={() => handleAddMl(100)}
          className="py-2 px-2 rounded-xl bg-zinc-800 hover:bg-blue-900/40 hover:border-blue-500/60 text-zinc-200 border border-zinc-700/80 font-bold text-xs flex items-center justify-center gap-1 transition-all"
        >
          <Plus className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span>+100ml</span>
        </button>

        <button
          onClick={() => handleAddMl(250)}
          className="py-2 px-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-zinc-950 font-extrabold text-xs flex items-center justify-center gap-1 transition-all shadow-md shadow-blue-950/40"
        >
          <Plus className="w-3.5 h-3.5 shrink-0" />
          <span>+250ml ({lang === 'bn' ? 'গ্লাস' : 'Glass'})</span>
        </button>

        <button
          onClick={() => handleAddMl(500)}
          className="py-2 px-2 rounded-xl bg-zinc-800 hover:bg-blue-900/40 hover:border-blue-500/60 text-blue-300 border border-zinc-700/80 font-bold text-xs flex items-center justify-center gap-1 transition-all"
        >
          <Plus className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span>+500ml ({lang === 'bn' ? 'বোতল' : 'Bottle'})</span>
        </button>

        {waterMl >= 100 && (
          <button
            onClick={() => handleAddMl(-100)}
            className="py-2 px-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 border border-zinc-700/60 text-xs flex items-center justify-center gap-1 transition-all"
            title="-100ml"
          >
            <Minus className="w-3 h-3" />
            <span>-100ml</span>
          </button>
        )}

        {waterMl >= 250 && (
          <button
            onClick={() => handleAddMl(-250)}
            className="py-2 px-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 border border-zinc-700/60 text-xs flex items-center justify-center gap-1 transition-all"
            title="-250ml"
          >
            <Minus className="w-3 h-3" />
            <span>-250ml</span>
          </button>
        )}
      </div>

      {/* Direct Manual Number Input Form */}
      <form onSubmit={handleManualAdd} className="flex items-center gap-2 pt-1 border-t border-zinc-800/70">
        <div className="flex-1 relative">
          <input
            type="number"
            min="1"
            max="4000"
            step="10"
            placeholder={lang === 'bn' ? 'নির্দিষ্ট পরিমাণ লিখুন (যেমন: ১৫০, ৩৫০)' : 'Enter exact ml (e.g. 150, 350)'}
            value={manualAmount}
            onChange={(e) => setManualAmount(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-xl bg-zinc-800/90 border border-zinc-700 text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-400"
          />
          <span className="absolute right-3 top-1.5 text-xs text-zinc-400 font-mono">ml</span>
        </div>

        <button
          type="submit"
          disabled={!manualAmount || parseInt(manualAmount, 10) <= 0}
          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-zinc-950 font-bold text-xs flex items-center gap-1 transition-all shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{lang === 'bn' ? 'যোগ করুন' : 'Add'}</span>
        </button>

        <button
          type="button"
          disabled={!manualAmount || parseInt(manualAmount, 10) < 0}
          onClick={handleManualSet}
          className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-300 font-medium text-xs transition-all shrink-0"
          title={lang === 'bn' ? 'মোট পানি সরাসরি এই পরিমাণে সেট করুন' : 'Set total intake to this amount'}
        >
          <span>{lang === 'bn' ? 'মোট সেট' : 'Set Total'}</span>
        </button>

        {waterMl > 0 && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm(lang === 'bn' ? 'আজকের পানি পানের হিসাব রিসেট করতে চান?' : 'Reset today\'s logged water to 0?')) {
                onUpdateWaterMl(0);
              }
            }}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors shrink-0"
            title={lang === 'bn' ? 'রিসেট' : 'Reset'}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </form>

      {/* Visual Interactive Glass Matrix (1 glass = 250ml) */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-[11px] text-zinc-400">
          <span>{lang === 'bn' ? 'গ্লাসের ভিজ্যুয়াল হিসাব (প্রতিটি ২৫০ মিলি):' : 'Visual Glass Grid (250ml each):'}</span>
          <span>{fullGlassesCount} / {totalGlassesForTarget} {lang === 'bn' ? 'গ্লাস সম্পন্ন' : 'glasses filled'}</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {Array.from({ length: totalGlassesForTarget }).map((_, idx) => {
            const isFilled = idx < fullGlassesCount;
            const isCurrentGlass = idx === fullGlassesCount && (waterMl % 250) > 0;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onUpdateWaterMl(isFilled && idx === fullGlassesCount - 1 ? idx * 250 : (idx + 1) * 250)}
                className={`flex-1 min-w-[26px] h-8 rounded-lg flex items-center justify-center transition-all ${
                  isFilled
                    ? 'bg-blue-500 text-zinc-950 font-bold shadow-md shadow-blue-500/25'
                    : isCurrentGlass
                    ? 'bg-blue-900/60 border border-blue-400 text-blue-200'
                    : 'bg-zinc-800/70 text-zinc-500 hover:bg-zinc-700 border border-zinc-700/50'
                }`}
                title={`${idx + 1} glass (${(idx + 1) * 250} ml)`}
                aria-label={`Water glass ${idx + 1}`}
              >
                <Droplets className="w-3.5 h-3.5" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Hardgainer Water Tip */}
      <p className="text-[11px] text-zinc-400 leading-relaxed pt-0.5">
        {lang === 'bn'
          ? '💡 ৩ থেকে ৩.৫ লিটার পানি পেশী গঠন, প্রোটিন হজম ও কোষ্ঠকাঠিন্য প্রতিরোধে অত্যন্ত জরুরি। খাবারের আধা ঘণ্টা আগে বা খাবার চলাকালীন বেশি পানি পান করবেন না, খাবারের ৩০-৪৫ মিনিট পর পর্যাপ্ত পানি খান।'
          : '💡 3.0 to 3.5 Litres is essential for hardgainers in Bangladesh to absorb high protein & build muscle. Avoid chugging right before meals; drink 30-45 mins after meals.'}
      </p>
    </section>
  );
};
