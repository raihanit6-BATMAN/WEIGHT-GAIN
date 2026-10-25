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
    { protein: 56, carbs: 42, fat: 28 }
  );

  const center = 70;
  const strokeWidth = 7;

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-md space-y-4">
      {/* Widget Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              {lang === 'bn' ? 'ম্যাক্রো প্রগ্রেস রিংস ও লক্ষ্য' : 'Daily Macro Target Progress Rings'}
            </h3>
            <p className="text-[11px] text-zinc-400">
              {lang === 'bn'
                ? 'পেশি ও ওজন বাড়াতে প্রোটিন, কার্বস ও স্বাস্থ্যকর ফ্যাটের দৈনিক অনুপাত'
                : 'Concentric breakdown of protein, carbs, and healthy fats for muscle & weight gain'}
            </p>
          </div>
        </div>

        <span className="text-xs font-bold px-2 py-1 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700 whitespace-nowrap shrink-0">
          {breakdown.caloriePercentage}% {lang === 'bn' ? 'সম্পন্ন' : 'Goal'}
        </span>
      </div>

      {/* Calorie Goal Summary Bar */}
      <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-zinc-300">
            <strong className="text-white text-sm font-bold">{totalCalories}</strong> / {targetCalories} kcal
            <span className="text-zinc-400 text-[11px] ml-1.5">
              ({lang === 'bn' ? 'সারপ্লাস লক্ষ্য' : 'Bulking Surplus Target'})
            </span>
          </span>
          <span className="text-zinc-400 text-[11px]">
            {targetCalories > totalCalories
              ? (lang === 'bn' ? `আর ${targetCalories - totalCalories} kcal বাকি` : `${targetCalories - totalCalories} kcal to surplus`)
              : (lang === 'bn' ? 'সারপ্লাস লক্ষ্য পূর্ণ!' : 'Surplus Target Hit!')}
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
            style={{ width: `${breakdown.caloriePercentage}%` }}
          />
        </div>
      </div>

      {/* Main Rings and Legend Flex Container */}
      <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 pt-1">
        {/* Concentric SVG Rings Container */}
        <div className="relative shrink-0 flex items-center justify-center">
          <svg
            className="w-40 h-40 transform -rotate-90"
            viewBox="0 0 140 140"
            role="img"
            aria-label="Concentric macro progress rings for protein, carbohydrates, and fats"
          >
            {/* Background Track Circles */}
            {/* Outer: Protein */}
            <circle
              cx={center}
              cy={center}
              r={56}
              fill="transparent"
              stroke="#064e3b" // dark emerald-900
              strokeWidth={strokeWidth}
              className="opacity-40"
            />
            {/* Middle: Carbs */}
            <circle
              cx={center}
              cy={center}
              r={42}
              fill="transparent"
              stroke="#0c4a6e" // dark sky-900
              strokeWidth={strokeWidth}
              className="opacity-40"
            />
            {/* Inner: Fat */}
            <circle
              cx={center}
              cy={center}
              r={28}
              fill="transparent"
              stroke="#78350f" // dark amber-900
              strokeWidth={strokeWidth}
              className="opacity-40"
            />

            {/* Active Foreground Rings with smooth transitions */}
            {/* Outer Ring: Protein (Emerald) */}
            <circle
              cx={center}
              cy={center}
              r={56}
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
              r={42}
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
              r={28}
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

          {/* Center Summary Indicator */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
            <Flame className="w-4 h-4 text-emerald-400 mb-0.5 animate-pulse" />
            <span className="text-sm font-black text-white leading-none">
              {breakdown.totalCalories}
            </span>
            <span className="text-[9px] font-medium text-zinc-400 leading-none mt-0.5">
              / {breakdown.targetCalories} kcal
            </span>
          </div>
        </div>

        {/* 3 Interactive Macro Cards */}
        <div className="w-full flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* 1. Protein Card */}
          <div
            onMouseEnter={() => setActiveHighlight('protein')}
            onMouseLeave={() => setActiveHighlight('all')}
            onClick={() => setActiveHighlight(activeHighlight === 'protein' ? 'all' : 'protein')}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              activeHighlight === 'protein'
                ? 'bg-emerald-950/70 border-emerald-500 shadow-md shadow-emerald-950'
                : 'bg-zinc-800/60 border-zinc-700/80 hover:border-emerald-500/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                <Dumbbell className="w-3 h-3 text-emerald-400" />
                {lang === 'bn' ? 'প্রোটিন' : 'Protein'}
              </span>
              <span className="text-xs font-extrabold text-white">
                {breakdown.protein.percentage}%
              </span>
            </div>

            <div className="mt-2 flex items-baseline justify-between">
              <div>
                <span className="text-base font-black text-white">{breakdown.protein.consumed}g</span>
                <span className="text-xs text-zinc-400"> / {breakdown.protein.target}g</span>
              </div>
            </div>

            {/* Mini Progress Bar */}
            <div className="w-full h-1.5 rounded-full bg-zinc-700/70 mt-2 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, breakdown.protein.percentage)}%` }}
              />
            </div>

            <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-400">
              <span>{breakdown.protein.caloriesFromMacro} kcal</span>
              <span className="text-emerald-400/90 font-medium">
                {breakdown.protein.remaining > 0
                  ? (lang === 'bn' ? `${breakdown.protein.remaining}g বাকি` : `${breakdown.protein.remaining}g left`)
                  : (lang === 'bn' ? 'পূর্ণ!' : 'Target hit!')}
              </span>
            </div>
          </div>

          {/* 2. Carbs Card */}
          <div
            onMouseEnter={() => setActiveHighlight('carbs')}
            onMouseLeave={() => setActiveHighlight('all')}
            onClick={() => setActiveHighlight(activeHighlight === 'carbs' ? 'all' : 'carbs')}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              activeHighlight === 'carbs'
                ? 'bg-sky-950/70 border-sky-500 shadow-md shadow-sky-950'
                : 'bg-zinc-800/60 border-zinc-700/80 hover:border-sky-500/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-sky-400">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" />
                <Zap className="w-3 h-3 text-sky-400" />
                {lang === 'bn' ? 'কার্বোহাইড্রেট' : 'Carbs'}
              </span>
              <span className="text-xs font-extrabold text-white">
                {breakdown.carbs.percentage}%
              </span>
            </div>

            <div className="mt-2 flex items-baseline justify-between">
              <div>
                <span className="text-base font-black text-white">{breakdown.carbs.consumed}g</span>
                <span className="text-xs text-zinc-400"> / {breakdown.carbs.target}g</span>
              </div>
            </div>

            {/* Mini Progress Bar */}
            <div className="w-full h-1.5 rounded-full bg-zinc-700/70 mt-2 overflow-hidden">
              <div
                className="h-full bg-sky-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, breakdown.carbs.percentage)}%` }}
              />
            </div>

            <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-400">
              <span>{breakdown.carbs.caloriesFromMacro} kcal</span>
              <span className="text-sky-400/90 font-medium">
                {breakdown.carbs.remaining > 0
                  ? (lang === 'bn' ? `${breakdown.carbs.remaining}g বাকি` : `${breakdown.carbs.remaining}g left`)
                  : (lang === 'bn' ? 'পূর্ণ!' : 'Target hit!')}
              </span>
            </div>
          </div>

          {/* 3. Healthy Fats Card */}
          <div
            onMouseEnter={() => setActiveHighlight('fat')}
            onMouseLeave={() => setActiveHighlight('all')}
            onClick={() => setActiveHighlight(activeHighlight === 'fat' ? 'all' : 'fat')}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              activeHighlight === 'fat'
                ? 'bg-amber-950/70 border-amber-500 shadow-md shadow-amber-950'
                : 'bg-zinc-800/60 border-zinc-700/80 hover:border-amber-500/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                {lang === 'bn' ? 'ফ্যাট ও বাদাম' : 'Healthy Fats'}
              </span>
              <span className="text-xs font-extrabold text-white">
                {breakdown.fat.percentage}%
              </span>
            </div>

            <div className="mt-2 flex items-baseline justify-between">
              <div>
                <span className="text-base font-black text-white">{breakdown.fat.consumed}g</span>
                <span className="text-xs text-zinc-400"> / {breakdown.fat.target}g</span>
              </div>
            </div>

            {/* Mini Progress Bar */}
            <div className="w-full h-1.5 rounded-full bg-zinc-700/70 mt-2 overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, breakdown.fat.percentage)}%` }}
              />
            </div>

            <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-400">
              <span>{breakdown.fat.caloriesFromMacro} kcal</span>
              <span className="text-amber-400/90 font-medium">
                {breakdown.fat.remaining > 0
                  ? (lang === 'bn' ? `${breakdown.fat.remaining}g বাকি` : `${breakdown.fat.remaining}g left`)
                  : (lang === 'bn' ? 'পূর্ণ!' : 'Target hit!')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
