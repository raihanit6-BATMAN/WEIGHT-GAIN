/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile, WeightHistoryEntry, DailyHistoryEntry } from '../types';
import { convertHeightToCm, calculateBMI } from '../utils/healthMath';
import { calculateConsistencyStreak } from '../utils/dailyReset';
import {
  TrendingUp,
  Plus,
  Trash2,
  Award,
  Calendar,
  Check,
  Ruler,
  Activity,
  Flame,
  CheckCircle2,
  Clock,
  Droplets,
  RotateCcw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';

interface WeightTrackerViewProps {
  profile: UserProfile;
  weightHistory: WeightHistoryEntry[];
  dailyHistory: DailyHistoryEntry[];
  targetCalories: number;
  todayCalories: number;
  todayProtein: number;
  todayWaterMl: number;
  onAddWeightEntry: (entry: WeightHistoryEntry) => void;
  onDeleteWeightEntry: (id: string) => void;
  onUpdateProfileWeight: (newWeight: number) => void;
  onSimulateNewDay?: () => void;
  lang: 'en' | 'bn';
}

export const WeightTrackerView: React.FC<WeightTrackerViewProps> = ({
  profile,
  weightHistory,
  dailyHistory = [],
  targetCalories,
  todayCalories,
  todayProtein,
  todayWaterMl,
  onAddWeightEntry,
  onDeleteWeightEntry,
  onUpdateProfileWeight,
  onSimulateNewDay,
  lang,
}) => {
  const [newWeight, setNewWeight] = useState<number>(profile.weightKg);
  const [newChest, setNewChest] = useState<string>('');
  const [newArm, setNewArm] = useState<string>('');
  const [newWaist, setNewWaist] = useState<string>('');
  const [newThigh, setNewThigh] = useState<string>('');
  const [newDate, setNewDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newNote, setNewNote] = useState<string>('');
  const [showLogModal, setShowLogModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const heightCm = convertHeightToCm(profile.heightFeet, profile.heightInches);
  const bmiInfo = calculateBMI(profile.weightKg, heightCm);

  const firstEntry = weightHistory[0];
  const latestEntry = weightHistory[weightHistory.length - 1];

  const totalGainedSoFar = Number(
    (profile.weightKg - (firstEntry?.weightKg || profile.weightKg)).toFixed(1)
  );

  // Weekly Gain Velocity calculation
  let weeklyGainRate: number | null = null;
  if (weightHistory.length >= 2) {
    const prev = weightHistory[weightHistory.length - 2];
    const days = Math.max(
      1,
      (new Date(latestEntry.date).getTime() - new Date(prev.date).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    weeklyGainRate = Number((((latestEntry.weightKg - prev.weightKg) / days) * 7).toFixed(2));
  }

  // Milestone progression calculation
  const startKg = firstEntry?.weightKg || 50;
  const totalTargetKgSpan = Math.max(1, profile.targetWeightKg - startKg);
  const progressRatio = Math.max(
    0,
    Math.min(100, Math.round(((profile.weightKg - startKg) / totalTargetKgSpan) * 100))
  );

  const milestones = [
    { targetKg: startKg, labelEn: 'Starting Baseline', labelBn: `শুরুর ওজন (${startKg} কেজি)`, done: true },
    { targetKg: Number((startKg + 3).toFixed(1)), labelEn: 'First +3 kg Milestone', labelBn: `প্রথম +৩ কেজি (${Number((startKg + 3).toFixed(1))} কেজি)`, done: profile.weightKg >= startKg + 3 },
    { targetKg: bmiInfo.minHealthyWeightKg, labelEn: `Normal BMI (${bmiInfo.minHealthyWeightKg} kg)`, labelBn: `স্বাভাবিক ওজন (${bmiInfo.minHealthyWeightKg} কেজি)`, done: profile.weightKg >= bmiInfo.minHealthyWeightKg },
    { targetKg: profile.targetWeightKg, labelEn: `Ultimate Goal (${profile.targetWeightKg} kg)`, labelBn: `মূল লক্ষ্য (${profile.targetWeightKg} কেজি)`, done: profile.weightKg >= profile.targetWeightKg },
  ];

  // Daily Consistency Streak calculations
  const todayIsGoalHit = todayCalories >= targetCalories;
  const { currentStreak, totalGoalDays } = calculateConsistencyStreak(dailyHistory, todayIsGoalHit);

  // Prepare past 7 days list (today + past 6 days from history)
  const past6Days = dailyHistory.slice(0, 6);

  // Hydration target
  const waterTarget = profile.dailyWaterGoalMl || (profile.dailyWaterGoalGlasses ? profile.dailyWaterGoalGlasses * 250 : 2500);

  // Generate complete 7-day hydration data for Recharts line chart (past 6 days + today)
  const hydrationChartData = React.useMemo(() => {
    const days: {
      date: string;
      label: string;
      fullDateLabel: string;
      waterMl: number;
      litres: number;
      glasses: number;
      targetMl: number;
      isGoalHit: boolean;
    }[] = [];

    const historyByDate = new Map<string, DailyHistoryEntry>();
    for (const entry of dailyHistory) {
      historyByDate.set(entry.date, entry);
    }

    const todayDate = new Date();
    // Build 7 days backwards: day 6 ago to day 0 (today)
    for (let i = 6; i >= 0; i--) {
      const d = new Date(todayDate);
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-CA');
      const isToday = i === 0;

      let waterVal = 0;
      if (isToday) {
        waterVal = todayWaterMl;
      } else if (historyByDate.has(dateStr)) {
        waterVal = historyByDate.get(dateStr)!.waterMl || 0;
      } else {
        const fallbackEntry = past6Days[i - 1];
        if (fallbackEntry) {
          waterVal = fallbackEntry.waterMl || 0;
        }
      }

      const dayLabel = isToday
        ? (lang === 'bn' ? 'আজ' : 'Today')
        : d.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { weekday: 'short' });

      const fullDateLabel = d.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', {
        month: 'short',
        day: 'numeric',
      });

      days.push({
        date: dateStr,
        label: dayLabel,
        fullDateLabel,
        waterMl: waterVal,
        litres: Number((waterVal / 1000).toFixed(1)),
        glasses: Number((waterVal / 250).toFixed(1)),
        targetMl: waterTarget,
        isGoalHit: waterVal >= waterTarget,
      });
    }

    return days;
  }, [dailyHistory, todayWaterMl, waterTarget, past6Days, lang]);

  const avgWaterIntake = Math.round(
    hydrationChartData.reduce((acc, curr) => acc + curr.waterMl, 0) / Math.max(1, hydrationChartData.length)
  );
  const maxWaterIntake = Math.max(...hydrationChartData.map((d) => d.waterMl), waterTarget);
  const waterHitCount = hydrationChartData.filter((d) => d.isGoalHit).length;

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWeight <= 0) return;

    const entry: WeightHistoryEntry = {
      id: `wh-${Date.now()}`,
      date: newDate,
      weightKg: Number(newWeight),
      chestInches: newChest ? Number(newChest) : undefined,
      armInches: newArm ? Number(newArm) : undefined,
      waistInches: newWaist ? Number(newWaist) : undefined,
      thighInches: newThigh ? Number(newThigh) : undefined,
      notes: newNote.trim() || undefined,
    };

    onAddWeightEntry(entry);
    onUpdateProfileWeight(Number(newWeight));
    setShowLogModal(false);
    setNewNote('');
    setNewChest('');
    setNewArm('');
    setNewWaist('');
    setNewThigh('');
    setToastMessage(lang === 'bn' ? 'ওজন সফলভাবে সংরক্ষিত হয়েছে!' : 'New weight recorded successfully!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const formatDateLabel = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        return d.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });
      }
    } catch {
      // fallback
    }
    return dateStr;
  };

  return (
    <div className="space-y-4 pb-20 max-w-3xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-emerald-600 text-zinc-950 font-bold text-xs shadow-2xl flex items-center gap-1.5 animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Daily Consistency Streak Banner */}
      <section className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-amber-950/30 border border-amber-500/30 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 text-zinc-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/30 shrink-0">
              <Flame className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  {currentStreak > 0
                    ? lang === 'bn'
                      ? `🔥 ${currentStreak} দিনের লক্ষ্যপূরণের ধারাবাহিকতা!`
                      : `🔥 ${currentStreak}-Day Bulking Streak!`
                    : lang === 'bn'
                    ? 'আজকের লক্ষ্য পূরণ করে ধারাবাহিকতা শুরু করুন!'
                    : 'Hit Today\'s Goal to Ignite Your Streak!'}
                </h2>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {lang === 'bn'
                  ? 'প্রতিদিনের ক্যালরি উদ্বৃত্ত বজায় রেখে সুস্থভাবে ওজন বাড়ানোর ধারাবাহিক রেকর্ড'
                  : 'Daily caloric surplus consistency log for lean muscle gain'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <div className="px-3 py-1.5 rounded-xl bg-zinc-800/80 border border-zinc-700/80 text-xs text-center">
              <span className="text-[10px] text-zinc-400 block uppercase font-bold">
                {lang === 'bn' ? 'মোট লক্ষ্যপূরণ' : 'Goals Hit'}
              </span>
              <strong className="text-emerald-400 font-bold text-sm">
                {totalGoalDays} {lang === 'bn' ? 'দিন' : 'Days'}
              </strong>
            </div>

            {onSimulateNewDay && (
              <button
                onClick={onSimulateNewDay}
                className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 text-[11px] font-medium flex items-center gap-1 transition-colors"
                title={lang === 'bn' ? 'নতুন দিনের রিসেট টেস্ট করুন' : 'Test Midnight Rollover & Archive'}
              >
                <RotateCcw className="w-3 h-3 text-emerald-400" />
                <span>{lang === 'bn' ? 'দিন রিসেট টেস্ট' : 'Test Reset'}</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 2. Past 7 Days History & Consistency Log */}
      <section className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-md space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
              {lang === 'bn' ? 'গত ৭ দিনের খাদ্য গ্রহণ ও লক্ষ্যপূরণ:' : 'Past 7 Days Nutrition Log:'}
            </h3>
          </div>
          <span className="text-[11px] text-zinc-400">
            {lang === 'bn' ? 'টার্গেট:' : 'Target:'} <strong className="text-white">{targetCalories} kcal</strong>
          </span>
        </div>

        {/* 7-Day Visual Mini Bar Chart */}
        <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-2">
          <div className="flex items-end justify-between gap-1.5 h-24 pt-2 px-1">
            {/* Past days sorted oldest to newest */}
            {[...past6Days].reverse().map((day) => {
              const heightPct = Math.min(100, Math.round((day.totalCalories / (targetCalories * 1.15)) * 100));
              return (
                <div key={day.id} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <span className="text-[9px] font-mono text-zinc-400 hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity">
                    {day.totalCalories}
                  </span>
                  <div className="w-full max-w-[28px] bg-zinc-800 rounded-t-md overflow-hidden flex items-end h-full">
                    <div
                      className={`w-full rounded-t-md transition-all duration-500 ${
                        day.isGoalHit
                          ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-sm shadow-emerald-500/40'
                          : 'bg-zinc-600'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-bold text-zinc-400 truncate max-w-[36px]">
                    {day.date.slice(8)}
                  </span>
                </div>
              );
            })}

            {/* Today Bar */}
            <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
              <span className="text-[9px] font-mono text-emerald-400 hidden sm:block">
                {todayCalories}
              </span>
              <div className="w-full max-w-[28px] bg-zinc-800 rounded-t-md overflow-hidden flex items-end h-full border border-emerald-500/40">
                <div
                  className={`w-full rounded-t-md transition-all duration-500 ${
                    todayIsGoalHit
                      ? 'bg-gradient-to-t from-emerald-500 to-teal-300 shadow-sm shadow-emerald-500/50'
                      : 'bg-blue-500'
                  }`}
                  style={{ height: `${Math.min(100, Math.round((todayCalories / (targetCalories * 1.15)) * 100))}%` }}
                />
              </div>
              <span className="text-[9px] font-extrabold text-white">
                {lang === 'bn' ? 'আজ' : 'Today'}
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center text-[10px] text-zinc-500 pt-1 border-t border-zinc-800/80">
            <span>{lang === 'bn' ? 'সবুজ = লক্ষ্য পূরণ (Goal Hit)' : 'Green Bar = Goal Hit (Surplus Achieved)'}</span>
            <span>Target: {targetCalories} kcal</span>
          </div>
        </div>

        {/* Clean Day-by-Day List */}
        <div className="space-y-2">
          {/* Today Card */}
          <div className="p-3 rounded-xl bg-zinc-800/80 border border-emerald-500/40 flex items-center justify-between gap-3 text-xs">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-sm">
                  {lang === 'bn' ? 'আজ (চলমান)' : 'Today (Live)'}
                </span>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                    todayIsGoalHit
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                      : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                  }`}
                >
                  {todayIsGoalHit
                    ? (lang === 'bn' ? 'লক্ষ্য পূরণ 🎉' : 'Goal Hit 🎉')
                    : (lang === 'bn' ? 'চলমান...' : 'In Progress')}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                {todayProtein}g {lang === 'bn' ? 'প্রোটিন' : 'Protein'} · {todayWaterMl}ml {lang === 'bn' ? 'পানি' : 'Water'}
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className="text-sm font-extrabold text-emerald-400 block font-mono">
                {todayCalories} <span className="text-zinc-400 text-xs font-normal">/ {targetCalories} kcal</span>
              </span>
              <span className="text-[10px] text-zinc-400">
                {Math.round((todayCalories / targetCalories) * 100)}% {lang === 'bn' ? 'সম্পন্ন' : 'reached'}
              </span>
            </div>
          </div>

          {/* Past Archived Days */}
          {past6Days.map((day) => {
            const pct = Math.round((day.totalCalories / day.targetCalories) * 100);
            return (
              <div
                key={day.id}
                className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-200">
                      {formatDateLabel(day.date)}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        day.isGoalHit
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/50'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}
                    >
                      {day.isGoalHit
                        ? (lang === 'bn' ? 'Goal Hit ✓' : 'Goal Hit ✓')
                        : (lang === 'bn' ? 'টার্গেটের নিচে' : 'Under Target')}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    {day.protein}g {lang === 'bn' ? 'প্রোটিন' : 'Protein'} · {day.carbs}g Carbs · {day.waterMl}ml {lang === 'bn' ? 'পানি' : 'Water'}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-extrabold text-white block font-mono">
                    {day.totalCalories} <span className="text-zinc-400 text-[11px] font-normal">/ {day.targetCalories} kcal</span>
                  </span>
                  <span className={`text-[10px] ${day.isGoalHit ? 'text-emerald-400 font-bold' : 'text-zinc-400'}`}>
                    {pct}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. 7-Day Daily Water Intake Line Chart (Recharts) */}
      <section className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-md space-y-3.5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30 shrink-0">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                {lang === 'bn' ? 'গত ৭ দিনের পানি পানের ট্রেন্ড' : '7-Day Daily Hydration Trend'}
              </h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                {lang === 'bn'
                  ? 'দৈনিক পানি গ্রহণের গ্রাফ ও লক্ষ্যপূরণের হিসাব'
                  : 'Daily water intake vs target pattern visualization'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-full border ${
                waterHitCount >= 5
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                  : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
              }`}
            >
              {waterHitCount}/7 {lang === 'bn' ? 'দিন লক্ষ্য পূরণ' : 'Days Goal Hit'}
            </span>
          </div>
        </div>

        {/* Quick Hydration Metric Pills */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 rounded-xl bg-zinc-950/70 border border-zinc-800">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block">
              {lang === 'bn' ? '৭ দিনের গড়' : '7-Day Average'}
            </span>
            <p className="text-sm sm:text-base font-extrabold text-blue-400 mt-0.5 font-mono">
              {avgWaterIntake.toLocaleString()} <span className="text-[10px] font-normal text-zinc-400">ml</span>
            </p>
            <span className="text-[10px] text-zinc-500">
              (~{(avgWaterIntake / 250).toFixed(1)} {lang === 'bn' ? 'গ্লাস' : 'glasses'})
            </span>
          </div>

          <div className="p-2 rounded-xl bg-blue-950/40 border border-blue-500/40">
            <span className="text-[10px] uppercase font-bold text-blue-300 block">
              {lang === 'bn' ? 'আজকের পানি' : 'Today\'s Intake'}
            </span>
            <p className="text-sm sm:text-base font-black text-cyan-300 mt-0.5 font-mono">
              {todayWaterMl.toLocaleString()} <span className="text-[10px] font-normal text-cyan-400">ml</span>
            </p>
            <span className="text-[10px] text-blue-300 font-semibold">
              {Math.round((todayWaterMl / waterTarget) * 100)}% {lang === 'bn' ? 'পূরণ' : 'hit'}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-zinc-950/70 border border-zinc-800">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block">
              {lang === 'bn' ? 'দৈনিক লক্ষ্য' : 'Daily Goal'}
            </span>
            <p className="text-sm sm:text-base font-extrabold text-emerald-400 mt-0.5 font-mono">
              {waterTarget.toLocaleString()} <span className="text-[10px] font-normal text-zinc-400">ml</span>
            </p>
            <span className="text-[10px] text-zinc-500">
              ({(waterTarget / 1000).toFixed(1)}L)
            </span>
          </div>
        </div>

        {/* Recharts Line Chart */}
        <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-2">
          <div className="w-full h-52 sm:h-56 pt-2 select-none">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={hydrationChartData}
                margin={{ top: 10, right: 12, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="hydrationGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="#71717a"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#3f3f46' }}
                />
                <YAxis
                  stroke="#71717a"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: '#3f3f46' }}
                  domain={[0, Math.ceil((maxWaterIntake + 400) / 500) * 500]}
                  tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(1)}L` : `${val}`)}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-zinc-950/95 border border-zinc-700 p-2.5 rounded-xl shadow-2xl text-xs space-y-1 backdrop-blur-md">
                          <div className="flex items-center justify-between gap-3 border-b border-zinc-800 pb-1">
                            <span className="font-extrabold text-white">
                              {data.label} <span className="text-zinc-400 font-normal">({data.fullDateLabel})</span>
                            </span>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold border ${
                                data.isGoalHit
                                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/50'
                                  : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                              }`}
                            >
                              {data.isGoalHit ? '✓ Goal Hit' : 'Under Goal'}
                            </span>
                          </div>
                          <div className="flex items-baseline gap-2 pt-0.5">
                            <span className="text-blue-400 font-black text-sm font-mono">
                              {data.waterMl.toLocaleString()} ml
                            </span>
                            <span className="text-zinc-400 text-[11px]">
                              ({data.litres}L · ~{data.glasses} {lang === 'bn' ? 'গ্লাস' : 'glasses'})
                            </span>
                          </div>
                          <div className="text-[10px] text-zinc-500 flex justify-between gap-2 pt-0.5">
                            <span>Target: {data.targetMl.toLocaleString()} ml</span>
                            <span className={data.isGoalHit ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
                              {data.waterMl >= data.targetMl
                                ? `+${(data.waterMl - data.targetMl).toLocaleString()} ml surplus`
                                : `${(data.targetMl - data.waterMl).toLocaleString()} ml short`}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine
                  y={waterTarget}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: `Goal (${(waterTarget / 1000).toFixed(1)}L)`,
                    fill: '#34d399',
                    fontSize: 10,
                    position: 'insideTopRight',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="waterMl"
                  fill="url(#hydrationGradient)"
                  stroke="none"
                />
                <Line
                  type="monotone"
                  dataKey="waterMl"
                  stroke="#38bdf8"
                  strokeWidth={2.5}
                  dot={{ fill: '#0284c7', stroke: '#38bdf8', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#67e8f9', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 text-[10px] text-zinc-400 pt-1.5 border-t border-zinc-800/80">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-emerald-400 inline-block border-dashed border-t border-emerald-400" />
              <span>
                {lang === 'bn'
                  ? `সবুজ ড্যাশ লাইন = দৈনিক লক্ষ্য (${waterTarget.toLocaleString()} মিলি)`
                  : `Green dashed line = Daily Target (${waterTarget.toLocaleString()} ml)`}
              </span>
            </span>
            <span className="text-zinc-500">
              {lang === 'bn'
                ? 'পেশী ও ওজনের বিকাশে হাইড্রেটেড থাকা জরুরি'
                : 'Consistent hydration speeds up muscle mass & recovery'}
            </span>
          </div>
        </div>
      </section>

      {/* 4. Body Weight Growth Log & Progression Journey */}
      <section className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-md space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              {lang === 'bn' ? 'শরীরের ওজন বৃদ্ধির লগ' : 'Body Weight Growth Log'}
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              {lang === 'bn'
                ? 'প্রথম দিন থেকে বর্তমান ও টার্গেট ওজনের অগ্রগতি'
                : 'Starting Weight -> Current Weight -> Target Weight progress'}
            </p>
          </div>

          <button
            onClick={() => setShowLogModal(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-zinc-950 text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-900/40"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{lang === 'bn' ? '+ আজকের ওজন লিখুন' : '+ Log Today\'s Weight'}</span>
          </button>
        </div>

        {/* Weight Journey Visual Progression: Starting -> Current -> Target */}
        <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            {/* Starting */}
            <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800/80">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                {lang === 'bn' ? 'শুরুর ওজন' : 'Starting'}
              </span>
              <p className="text-base sm:text-lg font-black text-white mt-0.5">
                {startKg} <span className="text-xs font-normal text-zinc-400">kg</span>
              </p>
            </div>

            {/* Current */}
            <div className="p-2 rounded-lg bg-emerald-950/50 border border-emerald-500/40">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                {lang === 'bn' ? 'বর্তমান ওজন' : 'Current'}
              </span>
              <p className="text-base sm:text-lg font-black text-emerald-300 mt-0.5">
                {profile.weightKg} <span className="text-xs font-normal text-emerald-400">kg</span>
              </p>
            </div>

            {/* Target */}
            <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800/80">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                {lang === 'bn' ? 'টার্গেট ওজন' : 'Target'}
              </span>
              <p className="text-base sm:text-lg font-black text-white mt-0.5">
                {profile.targetWeightKg} <span className="text-xs font-normal text-zinc-400">kg</span>
              </p>
            </div>
          </div>

          {/* Progress Bar with Total Gained */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-300 font-medium">
                {lang === 'bn' ? 'মোট ওজন বৃদ্ধি:' : 'Total Weight Gained:'}{' '}
                <strong className="text-emerald-400 font-extrabold">
                  {totalGainedSoFar >= 0 ? `+${totalGainedSoFar}` : totalGainedSoFar} kg
                </strong>
              </span>
              <span className="text-zinc-400 font-medium">
                {Math.max(0, Number((profile.targetWeightKg - profile.weightKg).toFixed(1)))} kg {lang === 'bn' ? 'বাকি' : 'to goal'}
              </span>
            </div>

            <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden p-0.5">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500 shadow-sm shadow-emerald-500/50"
                style={{ width: `${progressRatio}%` }}
              />
            </div>
          </div>
        </div>

        {/* Milestone Steps */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
          {milestones.map((m, idx) => (
            <div
              key={idx}
              className={`p-2 rounded-xl border text-center transition-colors ${
                m.done
                  ? 'bg-emerald-950/40 border-emerald-500/60 text-white'
                  : 'bg-zinc-950/60 border-zinc-800 text-zinc-400'
              }`}
            >
              <span className="text-[10px] block font-bold text-zinc-400">
                {m.done ? '✓ Achieved' : `Milestone ${idx + 1}`}
              </span>
              <span className="font-extrabold text-sm block mt-0.5 text-white">
                {m.targetKg} kg
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Logged Weight History List */}
      <section className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            {lang === 'bn' ? 'রেকর্ডকৃত ওজনের ইতিহাস:' : 'Recorded Weight History:'}
          </h3>
          <span className="text-[11px] text-zinc-400">
            {weightHistory.length} {lang === 'bn' ? 'টি এন্ট্রি' : 'entries'}
          </span>
        </div>

        <div className="space-y-2">
          {weightHistory.map((item, idx) => {
            const prevItem = weightHistory[idx - 1];
            const diff = prevItem ? Number((item.weightKg - prevItem.weightKg).toFixed(1)) : 0;

            return (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-zinc-800/60 border border-zinc-800 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-white text-base font-mono">
                      {item.weightKg} kg
                    </span>
                    {idx > 0 && (
                      <span
                        className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                          diff > 0
                            ? 'bg-emerald-950 text-emerald-400'
                            : diff < 0
                            ? 'bg-rose-950 text-rose-400'
                            : 'text-zinc-400'
                        }`}
                      >
                        {diff > 0 ? `+${diff}` : diff} kg
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-zinc-400 font-mono">{item.date}</span>
                    {weightHistory.length > 1 && (
                      <button
                        onClick={() => onDeleteWeightEntry(item.id)}
                        className="p-1 rounded text-zinc-500 hover:text-rose-400 transition-colors"
                        title="Delete entry"
                        aria-label="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Measurements pills if present */}
                {(item.chestInches || item.armInches || item.waistInches || item.thighInches) && (
                  <div className="flex items-center gap-2 flex-wrap text-[11px] text-zinc-300 pt-0.5">
                    {item.armInches && (
                      <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700/60">
                        💪 {lang === 'bn' ? 'বাইসেপ' : 'Arm'}: <strong>{item.armInches}&quot;</strong>
                      </span>
                    )}
                    {item.chestInches && (
                      <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700/60">
                        🎽 {lang === 'bn' ? 'বুক' : 'Chest'}: <strong>{item.chestInches}&quot;</strong>
                      </span>
                    )}
                    {item.waistInches && (
                      <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700/60">
                        📏 {lang === 'bn' ? 'কোমর' : 'Waist'}: <strong>{item.waistInches}&quot;</strong>
                      </span>
                    )}
                  </div>
                )}

                {item.notes && (
                  <p className="text-[11px] text-zinc-400 italic pt-0.5">
                    &ldquo;{item.notes}&rdquo;
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Log Weight Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-5 w-full max-w-sm space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                {lang === 'bn' ? 'ওজন রেকর্ড করুন' : 'Log Body Weight'}
              </h3>
              <button
                onClick={() => setShowLogModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEntry} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-300 font-bold mb-1">
                  {lang === 'bn' ? 'তারিখ' : 'Date'}
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white font-medium focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-bold mb-1">
                  {lang === 'bn' ? 'বর্তমান ওজন (কেজি)' : 'Current Weight (kg)'}
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="30"
                  max="150"
                  value={newWeight}
                  onChange={(e) => setNewWeight(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-base font-extrabold focus:outline-none focus:border-emerald-500 font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-400 mb-1">
                    {lang === 'bn' ? 'বাইসেপ (ইঞ্চি)' : 'Arm / Bicep (in)'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 11.5"
                    value={newArm}
                    onChange={(e) => setNewArm(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">
                    {lang === 'bn' ? 'কোমর (ইঞ্চি)' : 'Waist (in)'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 28.0"
                    value={newWaist}
                    onChange={(e) => setNewWaist(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">
                  {lang === 'bn' ? 'নোট (ঐচ্ছিক)' : 'Note (optional)'}
                </label>
                <input
                  type="text"
                  placeholder={lang === 'bn' ? 'যেমন: খাওয়ার পর সকালে মাপা' : 'e.g. Measured empty stomach'}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 font-bold hover:bg-zinc-750"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-black"
                >
                  {lang === 'bn' ? 'সংরক্ষণ করুন' : 'Save Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
