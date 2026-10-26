/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Droplets, Edit2, Check, RotateCcw } from 'lucide-react';

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
  targetMl = 2500,
  onUpdateTargetMl,
  lang,
}) => {
  const [isEditingTarget, setIsEditingTarget] = useState<boolean>(false);
  const [customTargetInput, setCustomTargetInput] = useState<string>(targetMl.toString());

  const progressPercent = targetMl > 0 ? Math.round((waterMl / targetMl) * 100) : 0;
  const isGoalReached = waterMl >= targetMl;

  // Exact 10-glass row (250ml each = 2,500ml standard) fitting cleanly on one line
  const totalGlassesForTarget = 10;
  const fullGlassesCount = Math.floor(waterMl / 250);
  const hasPartialGlass = waterMl % 250 > 0;

  const handleGlassClick = (idx: number) => {
    const glassNumber = idx + 1;
    // If user taps the currently last filled glass, un-fill it (-250ml)
    if (fullGlassesCount === glassNumber && !hasPartialGlass) {
      onUpdateWaterMl(Math.max(0, (glassNumber - 1) * 250));
    } else if (hasPartialGlass && fullGlassesCount === idx) {
      // If tapped on the partially filled glass, complete it to full
      onUpdateWaterMl(glassNumber * 250);
    } else {
      // Fill up to this glass
      onUpdateWaterMl(glassNumber * 250);
    }
  };

  const handleSaveCustomTarget = () => {
    const newTarget = parseInt(customTargetInput, 10);
    if (!isNaN(newTarget) && newTarget >= 1000 && newTarget <= 6000) {
      onUpdateTargetMl?.(newTarget);
      setIsEditingTarget(false);
    }
  };

  const presetTargets = [2000, 2500, 3000, 3500];

  return (
    <section className="p-3.5 sm:p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-md space-y-2.5 overflow-hidden">
      {/* Header: Title, Percentage Badge, & Consumed Metrics */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30 shrink-0">
            <Droplets className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs sm:text-sm font-bold text-white truncate">
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

            <p className="text-[11px] sm:text-xs text-zinc-300 font-medium truncate mt-0.5">
              <strong className="text-blue-400 font-bold">{waterMl.toLocaleString()} ml</strong>
              <span className="text-zinc-400"> / {targetMl.toLocaleString()} ml </span>
              <span className="text-zinc-500 text-[10px] sm:text-[11px]">
                (~{(waterMl / 250).toFixed(1)} {lang === 'bn' ? 'গ্লাস' : 'glasses'})
              </span>
            </p>
          </div>
        </div>

        {/* Header Right: Target Modifier / Reset */}
        <div className="flex items-center gap-1 shrink-0">
          {waterMl > 0 && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(lang === 'bn' ? 'আজকের পানি পানের হিসাব ০ করতে চান?' : 'Reset today\'s logged water to 0?')) {
                  onUpdateWaterMl(0);
                }
              }}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
              title={lang === 'bn' ? 'রিসেট' : 'Reset water to 0'}
              aria-label="Reset water intake"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {!isEditingTarget ? (
            <button
              onClick={() => {
                setCustomTargetInput(targetMl.toString());
                setIsEditingTarget(true);
              }}
              className="text-[10px] sm:text-[11px] px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white flex items-center gap-1 transition-colors"
              title={lang === 'bn' ? 'টার্গেট পরিবর্তন করুন' : 'Change daily goal'}
            >
              <Edit2 className="w-3 h-3 text-blue-400" />
              <span>{(targetMl / 1000).toFixed(1)}L</span>
            </button>
          ) : (
            <div className="flex items-center gap-1 bg-zinc-800 p-0.5 rounded-lg border border-blue-500/50">
              <input
                type="number"
                step="250"
                min="1000"
                max="6000"
                value={customTargetInput}
                onChange={(e) => setCustomTargetInput(e.target.value)}
                className="w-14 px-1 py-0.5 text-xs bg-zinc-950 border border-zinc-700 rounded text-white font-bold text-center focus:outline-none focus:border-blue-400"
                placeholder="ml"
              />
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

      {/* Target Presets Bar when Editing */}
      {isEditingTarget && (
        <div className="flex items-center gap-1.5 flex-wrap p-2 rounded-xl bg-zinc-950/70 border border-zinc-800 text-xs animate-in fade-in">
          <span className="text-[11px] text-zinc-400">{lang === 'bn' ? 'দ্রুত বাছাই:' : 'Quick Goals:'}</span>
          {presetTargets.map((preset) => (
            <button
              key={preset}
              onClick={() => {
                onUpdateTargetMl?.(preset);
                setIsEditingTarget(false);
              }}
              className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-colors ${
                targetMl === preset
                  ? 'bg-blue-600 text-zinc-950 border-blue-500'
                  : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
              }`}
            >
              {preset / 1000}L
            </button>
          ))}
        </div>
      )}

      {/* Linear Progress Bar */}
      <div className="w-full bg-zinc-800/80 rounded-full h-2 overflow-hidden p-0.5">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isGoalReached
              ? 'bg-gradient-to-r from-blue-500 via-teal-400 to-emerald-400 shadow-sm shadow-emerald-500/50'
              : 'bg-gradient-to-r from-blue-600 to-cyan-400'
          }`}
          style={{ width: `${Math.min(100, progressPercent)}%` }}
        />
      </div>

      {/* Main Interactive Control: Visual Glass Grid (250ml each) */}
      <div className="space-y-1.5 pt-0.5">
        <div className="flex items-center justify-between text-[11px] text-zinc-400">
          <span className="font-medium text-zinc-300">
            {lang === 'bn' ? 'গ্লাসের ভিজ্যুয়াল হিসাব (প্রতিটি ২৫০ মিলি):' : 'Visual Glass Grid (250ml each):'}
          </span>
          <span className="font-semibold text-blue-400">
            {fullGlassesCount} / {totalGlassesForTarget} {lang === 'bn' ? 'গ্লাস সম্পন্ন' : 'glasses filled'}
          </span>
        </div>

        {/* 10-Column Single Row Glass Grid - No numbers inside, pure Droplets icon */}
        <div className="grid grid-cols-10 gap-1.5 w-full">
          {Array.from({ length: totalGlassesForTarget }).map((_, idx) => {
            const isFilled = idx < fullGlassesCount;
            const isPartial = idx === fullGlassesCount && hasPartialGlass;
            const isLastFilled = isFilled && idx === fullGlassesCount - 1 && !hasPartialGlass;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleGlassClick(idx)}
                className={`w-full aspect-square rounded-lg flex items-center justify-center transition-all select-none active:scale-95 ${
                  isFilled
                    ? 'bg-blue-500 border border-blue-400 text-white shadow-[0_0_12px_rgba(59,130,246,0.6)]'
                    : isPartial
                    ? 'bg-blue-600/40 border border-blue-400/60 text-blue-300 shadow-[0_0_8px_rgba(59,130,246,0.3)]'
                    : 'bg-zinc-900/80 border border-zinc-800 text-zinc-600 hover:border-zinc-700'
                }`}
                title={
                  isLastFilled
                    ? (lang === 'bn' ? `গ্লাস ${idx + 1} খালি করতে ট্যাপ করুন (-২৫০ মিলি)` : `Tap to unfill glass ${idx + 1} (-250ml)`)
                    : isFilled
                    ? (lang === 'bn' ? `গ্লাস ${idx + 1} (${(idx + 1) * 250} মিলি)` : `Glass ${idx + 1} (${(idx + 1) * 250}ml)`)
                    : (lang === 'bn' ? `গ্লাস ${idx + 1} পর্যন্ত ভরতে ট্যাপ করুন` : `Tap to fill up to glass ${idx + 1}`)
                }
                aria-label={`Water glass ${idx + 1}`}
              >
                <Droplets className={`w-3.5 h-3.5 ${isFilled ? 'fill-current stroke-[2.5]' : 'stroke-[1.75]'}`} />
              </button>
            );
          })}
        </div>

        {/* Helpful Tip Text */}
        <p className="text-[11px] text-zinc-400 leading-relaxed pt-1">
          {lang === 'bn'
            ? '💡 3.0 to 3.5 Litres is essential for hardgainers in Bangladesh to absorb high protein & build muscle. Avoid chugging right before meals; drink 30-45 mins after meals.'
            : '💡 3.0 to 3.5 Litres is essential for hardgainers in Bangladesh to absorb high protein & build muscle. Avoid chugging right before meals; drink 30-45 mins after meals.'}
        </p>
      </div>
    </section>
  );
};
