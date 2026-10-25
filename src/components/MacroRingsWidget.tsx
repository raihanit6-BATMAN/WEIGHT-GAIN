/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { calculateMacroBreakdown } from '../utils/macroMath';
import { Flame, Dumbbell, Zap, ShieldCheck } from 'lucide-react';

interface MacroRingsWidgetProps {
  totalCalories: number;
  targetCalories: number;
  consumedProtein: number;
  targetProtein: number;
  consumedCarbs: number;
  targetCarbs: number;
  consumedFat: number;
  targetFat: number;
  lang: 'en' | 'bn';
}

export const MacroRingsWidget: React.FC<MacroRingsWidgetProps> = ({
  totalCalories,
  targetCalories,
  consumedProtein,
  targetProtein,
  consumedCarbs,
  targetCarbs,
  consumedFat,
  targetFat,
  lang,
}) => {
  const [activeHighlight, setActiveHighlight] = useState<'all' | 'protein' | 'carbs' | 'fat'>('all');

  const breakdown = calculateMacroBreakdown(
    consumedProtein,
    targetProtein,
    consumedCarbs,
    targetCarbs,
    consumedFat,
    targetFat,
    totalCalories,
    targetCalories,
    { protein: 42, carbs: 32, fat: 22 }
  );

  const center = 52;
  const strokeWidth = 5.5;

  return (
    <div className="p-3 sm:p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm overflow-hidden">
      {/* Compact Single-Row Horizontal Layout (Left: Rings, Right: Stacked Bars) */}
      <div className="flex items-center gap-3.5 sm:gap-5">
        {/* Left: Concentric Progress Ring */}
        <div className="relative shrink-0 flex items-center justify-center">
          <svg
            className="w-24 h-24 sm:w-28 sm:h-28 transform -rotate-90"
            viewBox="0 0 104 104"
            role="img"
            aria-label="Concentric macro progress rings for protein, carbohydrates, and fats"
          >
            {/* Background Track Circles */}
            {/* Outer: Protein */}
            <circle
              cx={center}
              cy={center}
              r={42}
              fill="transparent"
              stroke="#064e3b"
              strokeWidth={strokeWidth}
              className="opacity-35"
            />
            {/* Middle: Carbs */}
            <circle
              cx={center}
              cy={center}
              r={32}
              fill="transparent"
              stroke="#0c4a6e"
              strokeWidth={strokeWidth}
              className="opacity-35"
            />
            {/* Inner: Fat */}
            <circle
              cx={center}
              cy={center}
              r={22}
              fill="transparent"
              stroke="#78350f"
              strokeWidth={strokeWidth}
              className="opacity-35"
            />

            {/* Active Foreground Rings */}
            {/* Outer Ring: Protein (Emerald) */}
            <circle
              cx={center}
              cy={center}
              r={42}
              fill="transparent"
              stroke="#10b981"
              strokeWidth={strokeWidth}
              strokeDasharray={breakdown.protein.circumference}
              strokeDashoffset={breakdown.protein.strokeDashoffset}
              strokeLinecap="round"
              className={`transition-all duration-700 ${
                activeHighlight === 'all' || activeHighlight === 'protein'
                  ? 'opacity-100'
                  : 'opacity-25'
              }`}
            />

            {/* Middle Ring: Carbs (Sky Blue) */}
            <circle
              cx={center}
              cy={center}
              r={32}
              fill="transparent"
              stroke="#0ea5e9"
              strokeWidth={strokeWidth}
              strokeDasharray={breakdown.carbs.circumference}
              strokeDashoffset={breakdown.carbs.strokeDashoffset}
              strokeLinecap="round"
              className={`transition-all duration-700 ${
                activeHighlight === 'all' || activeHighlight === 'carbs'
                  ? 'opacity-100'
                  : 'opacity-25'
              }`}
            />

            {/* Inner Ring: Fats (Amber Gold) */}
            <circle
              cx={center}
              cy={center}
              r={22}
              fill="transparent"
              stroke="#f59e0b"
              strokeWidth={strokeWidth}
              strokeDasharray={breakdown.fat.circumference}
              strokeDashoffset={breakdown.fat.strokeDashoffset}
              strokeLinecap="round"
              className={`transition-all duration-700 ${
                activeHighlight === 'all' || activeHighlight === 'fat'
                  ? 'opacity-100'
                  : 'opacity-25'
              }`}
            />
          </svg>

          {/* Center Indicator */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
            <Flame className="w-3.5 h-3.5 text-emerald-400 leading-none" />
            <span className="text-xs sm:text-sm font-black text-white leading-none mt-0.5">
              {breakdown.totalCalories}
            </span>
            <span className="text-[9px] font-semibold text-zinc-400 leading-none mt-0.5">
              /{breakdown.targetCalories}
            </span>
          </div>
        </div>

        {/* Right Side: Stacked Compact Macro Bars */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Top Status Line */}
          <div className="flex items-center justify-between gap-1 text-[11px] pb-1 border-b border-zinc-800/80">
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-bold text-white truncate">
                {lang === 'bn' ? 'দৈনিক ম্যাক্রো লক্ষ্য' : 'Macro Progress'}
              </span>
              <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                {breakdown.caloriePercentage}%
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono shrink-0">
              {targetCalories > totalCalories
                ? (lang === 'bn' ? `বাকি ${targetCalories - totalCalories} kcal` : `${targetCalories - totalCalories} left`)
                : (lang === 'bn' ? 'সারপ্লাস অর্জিত!' : 'Surplus Hit!')}
            </span>
          </div>

          {/* 1. Protein Row */}
          <div
            onMouseEnter={() => setActiveHighlight('protein')}
            onMouseLeave={() => setActiveHighlight('all')}
            className={`space-y-1 transition-all ${activeHighlight === 'carbs' || activeHighlight === 'fat' ? 'opacity-40' : 'opacity-100'}`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 font-bold text-emerald-400 text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <Dumbbell className="w-3 h-3" />
                <span>{lang === 'bn' ? 'প্রোটিন' : 'Protein'}</span>
              </span>
              <span className="text-[11px] text-zinc-300 font-mono">
                <strong className="text-white font-bold">{breakdown.protein.consumed}g</strong> / {breakdown.protein.target}g{' '}
                <span className="text-emerald-400 text-[10px]">({breakdown.protein.percentage}%)</span>
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, breakdown.protein.percentage)}%` }}
              />
            </div>
          </div>

          {/* 2. Carbs Row */}
          <div
            onMouseEnter={() => setActiveHighlight('carbs')}
            onMouseLeave={() => setActiveHighlight('all')}
            className={`space-y-1 transition-all ${activeHighlight === 'protein' || activeHighlight === 'fat' ? 'opacity-40' : 'opacity-100'}`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 font-bold text-sky-400 text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                <Zap className="w-3 h-3" />
                <span>{lang === 'bn' ? 'কার্বস' : 'Carbs'}</span>
              </span>
              <span className="text-[11px] text-zinc-300 font-mono">
                <strong className="text-white font-bold">{breakdown.carbs.consumed}g</strong> / {breakdown.carbs.target}g{' '}
                <span className="text-sky-400 text-[10px]">({breakdown.carbs.percentage}%)</span>
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-sky-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, breakdown.carbs.percentage)}%` }}
              />
            </div>
          </div>

          {/* 3. Healthy Fats Row */}
          <div
            onMouseEnter={() => setActiveHighlight('fat')}
            onMouseLeave={() => setActiveHighlight('all')}
            className={`space-y-1 transition-all ${activeHighlight === 'protein' || activeHighlight === 'carbs' ? 'opacity-40' : 'opacity-100'}`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 font-bold text-amber-400 text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <ShieldCheck className="w-3 h-3" />
                <span>{lang === 'bn' ? 'ফ্যাট' : 'Healthy Fat'}</span>
              </span>
              <span className="text-[11px] text-zinc-300 font-mono">
                <strong className="text-white font-bold">{breakdown.fat.consumed}g</strong> / {breakdown.fat.target}g{' '}
                <span className="text-amber-400 text-[10px]">({breakdown.fat.percentage}%)</span>
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, breakdown.fat.percentage)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
