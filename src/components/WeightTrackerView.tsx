/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile, WeightHistoryEntry } from '../types';
import { convertHeightToCm, calculateBMI, estimateTargetTimeline } from '../utils/healthMath';
import { TrendingUp, Plus, Trash2, Award, Calendar, Check, Ruler, Activity, Flame } from 'lucide-react';

interface WeightTrackerViewProps {
  profile: UserProfile;
  weightHistory: WeightHistoryEntry[];
  onAddWeightEntry: (entry: WeightHistoryEntry) => void;
  onDeleteWeightEntry: (id: string) => void;
  onUpdateProfileWeight: (newWeight: number) => void;
  lang: 'en' | 'bn';
}

export const WeightTrackerView: React.FC<WeightTrackerViewProps> = ({
  profile,
  weightHistory,
  onAddWeightEntry,
  onDeleteWeightEntry,
  onUpdateProfileWeight,
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
  const timeline = estimateTargetTimeline(profile.weightKg, profile.targetWeightKg, 0.5);

  const firstEntry = weightHistory[0];
  const latestEntry = weightHistory[weightHistory.length - 1];

  const totalGainedSoFar = Number(
    (profile.weightKg - (firstEntry?.weightKg || profile.weightKg)).toFixed(1)
  );

  // Calculate Weekly Weight Gain Velocity
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

  // Body measurement diffs
  const currentChest = latestEntry?.chestInches;
  const initialChest = firstEntry?.chestInches;
  const chestDiff =
    currentChest !== undefined && initialChest !== undefined
      ? Number((currentChest - initialChest).toFixed(1))
      : null;

  const currentArm = latestEntry?.armInches;
  const initialArm = firstEntry?.armInches;
  const armDiff =
    currentArm !== undefined && initialArm !== undefined
      ? Number((currentArm - initialArm).toFixed(1))
      : null;

  const currentWaist = latestEntry?.waistInches;
  const initialWaist = firstEntry?.waistInches;
  const waistDiff =
    currentWaist !== undefined && initialWaist !== undefined
      ? Number((currentWaist - initialWaist).toFixed(1))
      : null;

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
    setToastMessage(lang === 'bn' ? 'ওজন ও পরিমাপ সংরক্ষিত হয়েছে!' : 'New weight & measurements recorded!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-4 pb-20 max-w-3xl mx-auto">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-emerald-600 text-zinc-950 font-bold text-xs shadow-2xl flex items-center gap-1.5 animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header & Primary Stats */}
      <section className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-md space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              {lang === 'bn' ? 'ওজন ও শারীরিক বৃদ্ধি ট্র্যাকার' : 'Body & Weight Gain Tracker'}
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              {lang === 'bn'
                ? 'সাপ্তাহিক ওজন এবং বুক, বাইসেপ ও কোমরের পরিমাপ সংরক্ষণ করুন'
                : 'Track weekly weight gain velocity and body measurements (biceps, chest, waist)'}
            </p>
          </div>

          <button
            onClick={() => setShowLogModal(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-zinc-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-900/40"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'bn' ? '+ নতুন পরিমাপ যোগ' : '+ Log Weight & Size'}</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-center text-xs">
          <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block">
              {lang === 'bn' ? 'বর্তমান ওজন' : 'Current Weight'}
            </span>
            <p className="text-xl font-black text-white mt-0.5">
              {profile.weightKg} <span className="text-xs font-normal text-zinc-400">kg</span>
            </p>
          </div>

          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-900/50">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block">
              {lang === 'bn' ? 'মোট বৃদ্ধি' : 'Total Gained'}
            </span>
            <p className="text-xl font-black text-emerald-300 mt-0.5">
              {totalGainedSoFar >= 0 ? `+${totalGainedSoFar}` : totalGainedSoFar}{' '}
              <span className="text-xs font-normal text-emerald-400">kg</span>
            </p>
          </div>

          <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block">
              {lang === 'bn' ? 'টার্গেট ওজন' : 'Target Weight'}
            </span>
            <p className="text-xl font-black text-white mt-0.5">
              {profile.targetWeightKg} <span className="text-xs font-normal text-zinc-400">kg</span>
            </p>
          </div>

          <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block">
              {lang === 'bn' ? 'বাকি ঘাটতি' : 'Remaining'}
            </span>
            <p className="text-xl font-black text-amber-400 mt-0.5">
              {Math.max(0, Number((profile.targetWeightKg - profile.weightKg).toFixed(1)))}{' '}
              <span className="text-xs font-normal text-amber-400">kg</span>
            </p>
          </div>
        </div>

        {/* Gain Velocity Indicator Badge */}
        {weeklyGainRate !== null && (
          <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span className="text-zinc-300">
                {lang === 'bn' ? 'সাপ্তাহিক বৃদ্ধির গতি:' : 'Weekly Gain Velocity:'}
              </span>
              <strong className="text-white font-bold">
                {weeklyGainRate >= 0 ? `+${weeklyGainRate}` : weeklyGainRate} kg/week
              </strong>
            </div>

            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                weeklyGainRate >= 0.25 && weeklyGainRate <= 0.6
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-700/60'
                  : weeklyGainRate > 0.6
                  ? 'bg-amber-950 text-amber-300 border-amber-700/60'
                  : 'bg-sky-950 text-sky-300 border-sky-700/60'
              }`}
            >
              {weeklyGainRate >= 0.25 && weeklyGainRate <= 0.6
                ? (lang === 'bn' ? '✓ আদর্শ লিন বাল্কিং গতি (০.৩ - ০.৫ কেজি)' : '✓ Optimal Lean Zone')
                : weeklyGainRate > 0.6
                ? (lang === 'bn' ? '⚡ দ্রুত গতি (কোমরের দিকে নজর দিন)' : '⚡ Fast Pace')
                : (lang === 'bn' ? 'ক্যালরি আরেকটু বাড়ান' : 'Under Surplus')}
            </span>
          </div>
        )}

        {/* Milestone Progress Bar */}
        <div className="pt-2 space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-400">
              {lang === 'bn' ? 'টার্গেটের অগ্রগতি:' : 'Progress to Goal:'}
            </span>
            <span className="font-bold text-emerald-400">{progressRatio}%</span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressRatio}%` }}
            />
          </div>
        </div>
      </section>

      {/* 2. Body Circumference (Chest, Arms, Waist) Measurement Card */}
      <section className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
            <Ruler className="w-4 h-4 text-emerald-400" />
            {lang === 'bn' ? 'শারীরিক পরিমাপ ট্র্যাকিং (ইঞ্চিতে)' : 'Body Circumference Tracking (Inches)'}
          </h2>
          <span className="text-[11px] text-zinc-400">
            {lang === 'bn' ? 'পেশী বনাম চর্বির তফাত' : 'Muscle vs Waist Ratio'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          {/* Biceps / Arms */}
          <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block">
              {lang === 'bn' ? 'বাইসেপ / হাত' : 'Arms / Bicep'}
            </span>
            <p className="text-lg font-black text-white mt-0.5">
              {currentArm ? `${currentArm}"` : '—'}
            </p>
            {armDiff !== null && (
              <span className="text-[11px] font-semibold text-emerald-400 block mt-0.5">
                {armDiff >= 0 ? `+${armDiff}"` : `${armDiff}"`} {lang === 'bn' ? 'বৃদ্ধি' : 'growth'}
              </span>
            )}
          </div>

          {/* Chest */}
          <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block">
              {lang === 'bn' ? 'বুকের মাপ' : 'Chest Size'}
            </span>
            <p className="text-lg font-black text-white mt-0.5">
              {currentChest ? `${currentChest}"` : '—'}
            </p>
            {chestDiff !== null && (
              <span className="text-[11px] font-semibold text-emerald-400 block mt-0.5">
                {chestDiff >= 0 ? `+${chestDiff}"` : `${chestDiff}"`} {lang === 'bn' ? 'বৃদ্ধি' : 'growth'}
              </span>
            )}
          </div>

          {/* Waist */}
          <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block">
              {lang === 'bn' ? 'কোমর (চর্বি মনিটর)' : 'Waist (Fat Check)'}
            </span>
            <p className="text-lg font-black text-white mt-0.5">
              {currentWaist ? `${currentWaist}"` : '—'}
            </p>
            {waistDiff !== null && (
              <span className="text-[11px] font-semibold text-amber-400 block mt-0.5">
                {waistDiff >= 0 ? `+${waistDiff}"` : `${waistDiff}"`}
              </span>
            )}
          </div>

          {/* Thighs */}
          <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block">
              {lang === 'bn' ? 'উরুর মাপ' : 'Thigh Size'}
            </span>
            <p className="text-lg font-black text-white mt-0.5">
              {latestEntry?.thighInches ? `${latestEntry.thighInches}"` : '—'}
            </p>
            <span className="text-[11px] text-zinc-500 block mt-0.5">
              {lang === 'bn' ? 'লোয়ার বডি' : 'Lower body'}
            </span>
          </div>
        </div>

        <p className="text-[11px] text-zinc-400">
          {lang === 'bn'
            ? '💡 সুস্থভাবে ওজন বাড়ার লক্ষণ: বাইসেপ ও বুকের পরিমাপ বাড়বে, কিন্তু কোমর বেশি বড় হবে না।'
            : '💡 Healthy bulking sign: Biceps and chest circumference expand while waist stays relatively lean.'}
        </p>
      </section>

      {/* 3. Milestones Roadmap */}
      <section className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-md space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-emerald-400" />
          {lang === 'bn' ? 'ওজন বৃদ্ধির লক্ষ্য ও মাইলফলক:' : 'Weight Gain Milestones:'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {milestones.map((m, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                m.done
                  ? 'bg-emerald-950/40 border-emerald-500/60 text-white'
                  : 'bg-zinc-800/40 border-zinc-800 text-zinc-400'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                    m.done
                      ? 'bg-emerald-500 text-zinc-950'
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  }`}
                >
                  {m.done ? '✓' : idx + 1}
                </div>
                <div>
                  <span className={`font-bold block ${m.done ? 'text-white' : 'text-zinc-300'}`}>
                    {lang === 'bn' ? m.labelBn : m.labelEn}
                  </span>
                  <span className="text-[10px] text-zinc-400">Target: {m.targetKg} kg</span>
                </div>
              </div>

              {m.done && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                  {lang === 'bn' ? 'অর্জিত' : 'Achieved'}
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 4. History Log Table */}
      <section className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            {lang === 'bn' ? 'লগ ইতিহাস ও পরিমাপ রেকর্ড:' : 'Recorded Progress Logs:'}
          </h3>
          <span className="text-[11px] text-zinc-400">
            {weightHistory.length} {lang === 'bn' ? 'টি রেকর্ড' : 'entries'}
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
                    <span className="font-black text-white text-base">
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
                        title="Delete"
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
                    {item.thighInches && (
                      <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700/60">
                        🦵 {lang === 'bn' ? 'উরু' : 'Thigh'}: <strong>{item.thighInches}&quot;</strong>
                      </span>
                    )}
                  </div>
                )}

                {item.notes && (
                  <p className="text-[11px] text-zinc-400 italic">
                    &ldquo;{item.notes}&rdquo;
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Log Weight & Measurements Modal */}
      {showLogModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl text-zinc-100 max-h-[90vh] overflow-y-auto">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                <Ruler className="w-4 h-4 text-emerald-400" />
                <span>{lang === 'bn' ? 'নতুন ওজন ও শারীরিক মাপ রেকর্ড করুন' : 'Log Weight & Body Measurements'}</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                {lang === 'bn'
                  ? 'সেরা ফলাফলের জন্য সকালে খালি পেটে ওজন ও ফিতা দিয়ে মাপ নিন'
                  : 'Weigh in the morning after using the bathroom for greatest consistency'}
              </p>
            </div>

            <form onSubmit={handleSaveEntry} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="log-weight-input" className="block font-medium text-zinc-300 mb-1">
                    {lang === 'bn' ? 'ওজন (কেজি) *' : 'Weight (kg) *'}
                  </label>
                  <input
                    id="log-weight-input"
                    type="number"
                    step="0.1"
                    min="30"
                    max="150"
                    value={newWeight}
                    onChange={(e) => setNewWeight(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white font-bold focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="log-date-input" className="block font-medium text-zinc-300 mb-1">
                    {lang === 'bn' ? 'তারিখ *' : 'Date *'}
                  </label>
                  <input
                    id="log-date-input"
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Body Circumferences */}
              <div className="pt-2 border-t border-zinc-800">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-2">
                  {lang === 'bn' ? 'শারীরিক মাপ (ইঞ্চিতে — ঐচ্ছিক)' : 'Body Circumference (Inches — Optional)'}
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="log-arm-input" className="block text-zinc-300 mb-1">
                      {lang === 'bn' ? 'বাইসেপ / হাত (ইঞ্চি)' : 'Bicep / Arm (in)'}
                    </label>
                    <input
                      id="log-arm-input"
                      type="number"
                      step="0.1"
                      min="7"
                      max="25"
                      placeholder="e.g. 10.5"
                      value={newArm}
                      onChange={(e) => setNewArm(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="log-chest-input" className="block text-zinc-300 mb-1">
                      {lang === 'bn' ? 'বুকের মাপ (ইঞ্চি)' : 'Chest (in)'}
                    </label>
                    <input
                      id="log-chest-input"
                      type="number"
                      step="0.1"
                      min="25"
                      max="60"
                      placeholder="e.g. 34.0"
                      value={newChest}
                      onChange={(e) => setNewChest(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="log-waist-input" className="block text-zinc-300 mb-1">
                      {lang === 'bn' ? 'কোমরের মাপ (ইঞ্চি)' : 'Waist (in)'}
                    </label>
                    <input
                      id="log-waist-input"
                      type="number"
                      step="0.1"
                      min="20"
                      max="50"
                      placeholder="e.g. 28.0"
                      value={newWaist}
                      onChange={(e) => setNewWaist(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="log-thigh-input" className="block text-zinc-300 mb-1">
                      {lang === 'bn' ? 'উরুর মাপ (ইঞ্চি)' : 'Thigh (in)'}
                    </label>
                    <input
                      id="log-thigh-input"
                      type="number"
                      step="0.1"
                      min="14"
                      max="35"
                      placeholder="e.g. 18.5"
                      value={newThigh}
                      onChange={(e) => setNewThigh(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="log-note-input" className="block font-medium text-zinc-300 mb-1">
                  {lang === 'bn' ? 'নোট (যেমন: সকালে নাস্তার আগে)' : 'Notes (optional)'}
                </label>
                <input
                  id="log-note-input"
                  type="text"
                  placeholder={lang === 'bn' ? 'যেমন: সকালে মেপেছি, শরীরে শক্তি ও পেশীতে বৃদ্ধি লাগছে' : 'e.g. Measured morning empty stomach, feeling strong'}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-zinc-950 text-xs font-bold shadow-md shadow-emerald-950/40"
                >
                  {lang === 'bn' ? 'সংরক্ষণ করুন' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
