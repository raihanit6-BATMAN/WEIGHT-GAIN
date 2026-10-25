/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import {
  convertHeightToCm,
  calculateBMI,
  calculateBMR,
  calculateTDEE,
  calculateTargetCalories,
  estimateTargetTimeline,
  ActivityLevel,
  WeightGainPace,
} from '../utils/healthMath';
import {
  X,
  Sparkles,
  Check,
  Info,
  AlertTriangle,
  Calendar,
  Target,
  Activity,
  Droplets,
  Bell,
  Clock,
  Download,
  Smartphone,
  Play,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import {
  ReminderStats,
  getReminderPreferences,
  saveReminderPreferences,
  requestNotificationPermission,
  getNotificationPermissionStatus,
  buildReminderMessage,
  DailyReminderPrefs,
} from '../utils/notificationScheduler';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSave: (updated: UserProfile) => void;
  lang: 'en' | 'bn';
  reminderStats?: ReminderStats;
  onTriggerTestReminder?: (slot: '10am' | '2pm' | '9pm') => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
  lang,
  reminderStats,
  onTriggerTestReminder,
}) => {
  const [activeTab, setActiveTab] = useState<'assessment' | 'edit' | 'reminders'>('assessment');
  const [reminderPrefs, setReminderPrefs] = useState<DailyReminderPrefs>(getReminderPreferences);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>(getNotificationPermissionStatus);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  // Controlled form inputs with fluid raw string state (prevents input snapping/locking on backspace)
  const [rawAge, setRawAge] = useState<string>(String(profile.age || 26));
  const [gender, setGender] = useState<'male' | 'female'>(profile.gender || 'male');
  const [rawHeightFeet, setRawHeightFeet] = useState<string>(String(profile.heightFeet || 5));
  const [rawHeightInches, setRawHeightInches] = useState<string>(String(profile.heightInches || 0));
  const [rawWeightKg, setRawWeightKg] = useState<string>(String(profile.weightKg || 50));
  const [rawTargetWeightKg, setRawTargetWeightKg] = useState<string>(String(profile.targetWeightKg || 60));
  const [rawWaterGoalMl, setRawWaterGoalMl] = useState<string>(
    String(profile.dailyWaterGoalMl || (profile.dailyWaterGoalGlasses * 250) || 3000)
  );
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile.activityLevel || 'light');
  const [weightGainPace, setWeightGainPace] = useState<WeightGainPace>(profile.weightGainPace || 'steady');

  // Synchronize state when modal is opened or profile changes
  useEffect(() => {
    if (isOpen) {
      setRawAge(String(profile.age || 26));
      setGender(profile.gender || 'male');
      setRawHeightFeet(String(profile.heightFeet || 5));
      setRawHeightInches(String(profile.heightInches || 0));
      setRawWeightKg(String(profile.weightKg || 50));
      setRawTargetWeightKg(String(profile.targetWeightKg || 60));
      setRawWaterGoalMl(String(profile.dailyWaterGoalMl || (profile.dailyWaterGoalGlasses * 250) || 3000));
      setActivityLevel(profile.activityLevel || 'light');
      setWeightGainPace(profile.weightGainPace || 'steady');
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  // Live parsed calculations for instant feedback without locking
  const parsedFeet = rawHeightFeet === '' ? 5 : (Number(rawHeightFeet) || 5);
  const parsedInches = rawHeightInches === '' ? 0 : (Number(rawHeightInches) || 0);
  const heightCm = convertHeightToCm(parsedFeet, parsedInches);
  const parsedWeightKg = rawWeightKg === '' ? profile.weightKg : (Number(rawWeightKg) || profile.weightKg);
  const parsedTargetWeightKg = rawTargetWeightKg === '' ? profile.targetWeightKg : (Number(rawTargetWeightKg) || profile.targetWeightKg);
  const parsedAge = rawAge === '' ? profile.age : (Number(rawAge) || profile.age);
  const parsedWaterMl = rawWaterGoalMl === '' ? 3000 : (Number(rawWaterGoalMl) || 3000);

  // Unified formData proxy for legacy assessment / reminder tabs
  const formData: UserProfile = {
    ...profile,
    age: parsedAge,
    gender,
    heightFeet: parsedFeet,
    heightInches: parsedInches,
    weightKg: parsedWeightKg,
    targetWeightKg: parsedTargetWeightKg,
    activityLevel,
    weightGainPace,
    dailyWaterGoalMl: parsedWaterMl,
    dailyWaterGoalGlasses: Math.round(parsedWaterMl / 250),
  };

  const bmiResult = calculateBMI(parsedWeightKg, heightCm);
  const bmr = calculateBMR(parsedWeightKg, heightCm, parsedAge, gender);
  const tdee = calculateTDEE(bmr, activityLevel);
  const calorieTargets = calculateTargetCalories(tdee, weightGainPace, parsedWeightKg);
  const timeline = estimateTargetTimeline(
    parsedWeightKg,
    parsedTargetWeightKg,
    calorieTargets.estimatedWeeklyGainKg
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalFeet = Math.max(3, Math.min(7, Number(rawHeightFeet) || profile.heightFeet || 5));
    const finalInches = Math.max(0, Math.min(11, rawHeightInches === '' ? 0 : (Number(rawHeightInches) || 0)));
    const finalWeight = Math.max(25, Math.min(250, Number(rawWeightKg) || profile.weightKg || 50));
    const finalTargetWeight = Math.max(30, Math.min(250, Number(rawTargetWeightKg) || profile.targetWeightKg || 60));
    const finalAge = Math.max(10, Math.min(100, Number(rawAge) || profile.age || 26));
    const finalWaterMl = Math.max(1000, Math.min(8000, Number(rawWaterGoalMl) || 3000));

    const updatedProfile: UserProfile = {
      ...profile,
      age: finalAge,
      gender,
      heightFeet: finalFeet,
      heightInches: finalInches,
      weightKg: finalWeight,
      targetWeightKg: finalTargetWeight,
      activityLevel,
      weightGainPace,
      dailyWaterGoalMl: finalWaterMl,
      dailyWaterGoalGlasses: Math.round(finalWaterMl / 250),
    };

    onSave(updatedProfile);
    onClose();
  };

  const handleResetToUserDefault = () => {
    setRawAge('26');
    setGender('male');
    setRawHeightFeet('5');
    setRawHeightInches('9');
    setRawWeightKg('50');
    setRawTargetWeightKg('60');
    setActivityLevel('light');
    setWeightGainPace('steady');
    setRawWaterGoalMl('3000');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
    >
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl text-zinc-100 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="min-w-0">
            <h2 id="profile-modal-title" className="text-base font-bold text-white flex items-center gap-2 truncate">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{lang === 'bn' ? 'ব্যক্তিগত স্বাস্থ্য রিপোর্ট ও লক্ষ্য' : 'Health Assessment & Goals'}</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5 truncate">
              {profile.age} {lang === 'bn' ? 'বছর' : 'yrs'} · {profile.heightFeet}&apos;{profile.heightInches}&quot; ({heightCm} cm) · {profile.weightKg} kg
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white transition-colors shrink-0"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Tab Switcher */}
        <div className="px-5 pt-3 pb-1 border-b border-zinc-800/80 flex items-center gap-1.5 sm:gap-2 bg-zinc-950/50">
          <button
            type="button"
            onClick={() => setActiveTab('assessment')}
            className={`flex-1 py-2 px-2 sm:px-3 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 sm:gap-1.5 truncate ${
              activeTab === 'assessment'
                ? 'bg-zinc-800 text-emerald-400 border border-zinc-700 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{lang === 'bn' ? 'রিপোর্ট ও BMI' : 'Health & BMI'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`flex-1 py-2 px-2 sm:px-3 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 sm:gap-1.5 truncate ${
              activeTab === 'edit'
                ? 'bg-zinc-800 text-emerald-400 border border-zinc-700 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Target className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{lang === 'bn' ? 'লক্ষ্য পরিবর্তন' : 'Edit Goals'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reminders')}
            className={`flex-1 py-2 px-2 sm:px-3 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 sm:gap-1.5 truncate ${
              activeTab === 'reminders'
                ? 'bg-zinc-800 text-amber-400 border border-zinc-700 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Bell className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{lang === 'bn' ? 'রিমাইন্ডার ও PWA' : 'Reminders & PWA'}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'assessment' ? (
            /* TAB 1: Complete Health Assessment & BMI Velocity */
            <div className="space-y-4">
              {/* Current Weight & BMI Overview Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-b from-zinc-800/80 to-zinc-900 border border-zinc-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider font-semibold text-emerald-400">
                    {lang === 'bn' ? 'বর্তমান স্বাস্থ্য অবস্থা' : 'Current Physical State'}
                  </span>
                  <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${bmiResult.colorClass} bg-zinc-950/70 border-zinc-700`}>
                    BMI {bmiResult.bmi} ({lang === 'bn' ? bmiResult.categoryLabelBn : bmiResult.categoryLabelEn})
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">{formData.weightKg}</span>
                  <span className="text-zinc-400 text-sm">kg (Current Weight)</span>
                </div>

                {/* Visual Gradient Bar for BMI */}
                <div className="space-y-1 pt-1">
                  <div className="relative w-full h-3 rounded-full bg-zinc-800 overflow-hidden flex">
                    <div className="w-[20%] bg-rose-500/80" title="Severely Underweight (<16.5)" />
                    <div className="w-[15%] bg-amber-500/80" title="Underweight (16.5-18.4)" />
                    <div className="w-[45%] bg-emerald-500" title="Healthy Normal (18.5-24.9)" />
                    <div className="w-[20%] bg-orange-500/80" title="Overweight (25+)" />
                  </div>
                  <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                    <span>15.0</span>
                    <span className="text-rose-400 font-bold">16.3 (You)</span>
                    <span>18.5 (Healthy)</span>
                    <span>24.9</span>
                    <span>30.0</span>
                  </div>
                </div>

                {/* Normal Weight Gap */}
                <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-2 text-xs">
                  <div className="flex items-start gap-2 text-zinc-300">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white">
                        {lang === 'bn' ? 'স্বাভাবিক ওজনের ব্যবধান:' : 'Gap to Healthy BMI Range:'}
                      </p>
                      <p className="text-zinc-400 text-[11px] leading-relaxed mt-0.5">
                        {lang === 'bn'
                          ? `৫'৯" উচ্চতায় স্বাভাবিক হতে ন্যূনতম ${bmiResult.minHealthyWeightKg} কেজি প্রয়োজন (+${bmiResult.weightDiffToNormalKg} কেজি বৃদ্ধি প্রয়োজন)।`
                          : `Needs minimum ${bmiResult.minHealthyWeightKg} kg for 5'9" (+${bmiResult.weightDiffToNormalKg} kg gain needed).`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-zinc-300 pt-2 border-t border-zinc-800/80">
                    <Calendar className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white">
                        {lang === 'bn' ? `টার্গেট: ${formData.targetWeightKg} কেজি` : `Target Goal: ${formData.targetWeightKg} kg`}
                      </p>
                      <p className="text-zinc-400 text-[11px] leading-relaxed mt-0.5">
                        {lang === 'bn'
                          ? `প্রতিদিন +৫০০ ক্যালরি সারপ্লাসে প্রায় ${timeline.weeksNeeded} সপ্তাহে পৌঁছানো সম্ভব (${timeline.targetDateBnString})`
                          : `At +500 kcal surplus, achievable in ~${timeline.weeksNeeded} weeks (${timeline.targetDateString})`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Energy Output: BMR, TDEE, & Surplus Target */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-3 rounded-2xl bg-zinc-800/70 border border-zinc-700/60">
                  <span className="text-[10px] text-zinc-400 uppercase font-semibold block">BMR</span>
                  <strong className="text-base text-white font-extrabold">{bmr}</strong>
                  <span className="text-[10px] text-zinc-400 block">kcal/day</span>
                </div>
                <div className="p-3 rounded-2xl bg-zinc-800/70 border border-zinc-700/60">
                  <span className="text-[10px] text-zinc-400 uppercase font-semibold block">TDEE</span>
                  <strong className="text-base text-white font-extrabold">{tdee}</strong>
                  <span className="text-[10px] text-zinc-400 block">kcal/day</span>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-800/60">
                  <span className="text-[10px] text-emerald-400 uppercase font-bold block">Surplus Goal</span>
                  <strong className="text-base text-emerald-300 font-extrabold">{calorieTargets.targetCalories}</strong>
                  <span className="text-[10px] text-emerald-400 block">kcal/day</span>
                </div>
              </div>

              {/* Daily Macro Blueprint */}
              <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  {lang === 'bn' ? 'দৈনিক পুষ্টির লক্ষ্যমাত্রা (ম্যাক্রোস)' : 'Daily Target Macro Breakdown'}
                </h4>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-900/50">
                    <span className="text-[10px] text-emerald-400 font-semibold block">Protein</span>
                    <strong className="text-sm text-emerald-300 font-bold">{calorieTargets.proteinGrams}g</strong>
                    <span className="text-[9px] text-zinc-500 block">~{calorieTargets.proteinGrams * 4} kcal</span>
                  </div>
                  <div className="p-2 rounded-xl bg-sky-950/40 border border-sky-900/50">
                    <span className="text-[10px] text-sky-400 font-semibold block">Carbs</span>
                    <strong className="text-sm text-sky-300 font-bold">{calorieTargets.carbsGrams}g</strong>
                    <span className="text-[9px] text-zinc-500 block">~{calorieTargets.carbsGrams * 4} kcal</span>
                  </div>
                  <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-900/50">
                    <span className="text-[10px] text-amber-400 font-semibold block">Fat</span>
                    <strong className="text-sm text-amber-300 font-bold">{calorieTargets.fatGrams}g</strong>
                    <span className="text-[9px] text-zinc-500 block">~{calorieTargets.fatGrams * 9} kcal</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('edit')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-zinc-950 text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'লক্ষ্য বা ওজন পরিবর্তন করুন' : 'Change Weight / Targets'}</span>
                </button>
              </div>
            </div>
          ) : activeTab === 'edit' ? (
            /* TAB 2: Edit Profile & Target Measurements */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Quick default preset button */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-xs">
                <span className="text-emerald-300">
                  {lang === 'bn' ? 'ব্যবহারকারী বেস: ২৬ বছর, ৫ ফুট ৯ ইঞ্চি, ৫০ কেজি' : 'Default demo: 26 yrs, 5\'9", 50 kg'}
                </span>
                <button
                  type="button"
                  onClick={handleResetToUserDefault}
                  className="text-[11px] font-semibold text-emerald-400 hover:underline px-2 py-0.5 rounded bg-emerald-900/60"
                >
                  {lang === 'bn' ? 'রিসেট' : 'Reset'}
                </button>
              </div>

              {/* Age & Gender */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="user-age" className="block text-xs font-medium text-zinc-300 mb-1">
                    {lang === 'bn' ? 'বয়স (বছর)' : 'Age (Years)'}
                  </label>
                  <input
                    id="user-age"
                    type="number"
                    min="10"
                    max="100"
                    value={rawAge}
                    onChange={(e) => setRawAge(e.target.value)}
                    placeholder="26"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-800/90 border border-zinc-700 text-white text-sm focus:outline-none focus:border-emerald-500 font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    {lang === 'bn' ? 'লিঙ্গ (Gender)' : 'Gender'}
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setGender('male')}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                        gender === 'male'
                          ? 'bg-emerald-600 text-zinc-950 font-black shadow-md shadow-emerald-950/50'
                          : 'bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700'
                      }`}
                    >
                      <span className="text-sm">♂</span>
                      <span>{lang === 'bn' ? 'পুরুষ' : 'Male'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender('female')}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                        gender === 'female'
                          ? 'bg-emerald-600 text-zinc-950 font-black shadow-md shadow-emerald-950/50'
                          : 'bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700'
                      }`}
                    >
                      <span className="text-sm">♀</span>
                      <span>{lang === 'bn' ? 'মহিলা' : 'Female'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Height (Feet & Inches) */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  {lang === 'bn' ? 'উচ্চতা (ফুট ও ইঞ্চি)' : 'Height (Feet & Inches)'}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <input
                      type="number"
                      min="3"
                      max="7"
                      value={rawHeightFeet}
                      onChange={(e) => setRawHeightFeet(e.target.value)}
                      placeholder="5"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-800/90 border border-zinc-700 text-white text-sm focus:outline-none focus:border-emerald-500 pr-12 font-semibold"
                      required
                      aria-label="Height feet"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-zinc-400">{lang === 'bn' ? 'ফুট' : 'ft'}</span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="11"
                      value={rawHeightInches}
                      onChange={(e) => setRawHeightInches(e.target.value)}
                      placeholder="9"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-800/90 border border-zinc-700 text-white text-sm focus:outline-none focus:border-emerald-500 pr-12 font-semibold"
                      required
                      aria-label="Height inches"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-zinc-400">{lang === 'bn' ? 'ইঞ্চি' : 'in'}</span>
                  </div>
                </div>
                <p className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                  <span>✓</span>
                  <span>{lang === 'bn' ? `মোট উচ্চতা: ${heightCm} সেন্টিমিটার` : `Live Total: ${heightCm} cm`}</span>
                </p>
              </div>

              {/* Current & Target Weight */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="user-weight" className="block text-xs font-medium text-zinc-300 mb-1">
                    {lang === 'bn' ? 'বর্তমান ওজন (কেজি)' : 'Current Weight (kg)'}
                  </label>
                  <div className="relative">
                    <input
                      id="user-weight"
                      type="number"
                      step="0.5"
                      min="25"
                      max="200"
                      value={rawWeightKg}
                      onChange={(e) => setRawWeightKg(e.target.value)}
                      placeholder="50"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-800/90 border border-zinc-700 text-white text-sm focus:outline-none focus:border-emerald-500 pr-10 font-semibold"
                      required
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-zinc-400">kg</span>
                  </div>
                </div>
                <div>
                  <label htmlFor="target-weight" className="block text-xs font-medium text-zinc-300 mb-1">
                    {lang === 'bn' ? 'টার্গেট ওজন (কেজি)' : 'Target Weight (kg)'}
                  </label>
                  <div className="relative">
                    <input
                      id="target-weight"
                      type="number"
                      step="0.5"
                      min="30"
                      max="200"
                      value={rawTargetWeightKg}
                      onChange={(e) => setRawTargetWeightKg(e.target.value)}
                      placeholder="60"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-800/90 border border-zinc-700 text-white text-sm focus:outline-none focus:border-emerald-500 pr-10 font-semibold"
                      required
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-zinc-400">kg</span>
                  </div>
                </div>
              </div>

              {/* Daily Water Target Goal (ml) */}
              <div>
                <label htmlFor="daily-water-target" className="block text-xs font-medium text-zinc-300 mb-1 flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-blue-400" />
                  <span>{lang === 'bn' ? 'দৈনিক পানি পানের লক্ষ্য (মিলি)' : 'Daily Hydration Target (ml)'}</span>
                </label>
                <div className="relative">
                  <input
                    id="daily-water-target"
                    type="number"
                    step="250"
                    min="1000"
                    max="8000"
                    value={rawWaterGoalMl}
                    onChange={(e) => setRawWaterGoalMl(e.target.value)}
                    placeholder="3000"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-800/90 border border-zinc-700 text-white text-sm focus:outline-none focus:border-emerald-500 pr-12 font-semibold"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-zinc-400">ml</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  {lang === 'bn' ? 'ডিফল্ট ৩,০০০ মিলি (৩ লিটার / ১২ গ্লাস)' : 'Default 3,000 ml (3.0 Litres / 12 glasses)'}
                </p>
              </div>

              {/* Activity Level */}
              <div>
                <label htmlFor="user-activity" className="block text-xs font-medium text-zinc-300 mb-1">
                  {lang === 'bn' ? 'দৈনিক শারীরিক পরিশ্রম / এক্টিভিটি' : 'Daily Activity Level'}
                </label>
                <select
                  id="user-activity"
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-800/90 border border-zinc-700 text-white text-sm focus:outline-none focus:border-emerald-500 font-semibold cursor-pointer"
                >
                  <option value="sedentary">
                    {lang === 'bn' ? 'কম পরিশ্রমী (বসে কাজ / ডেস্ক জব, BMR x 1.2)' : 'Sedentary (Desk job, minimal exercise, x1.2)'}
                  </option>
                  <option value="light">
                    {lang === 'bn' ? 'হালকা পরিশ্রমী (হাঁটাচলা / ছাত্র রুটিন, BMR x 1.375)' : 'Lightly Active (Walking/student routine, x1.375)'}
                  </option>
                  <option value="moderate">
                    {lang === 'bn' ? 'মাঝারি পরিশ্রমী (সপ্তাহে ৩-৪ দিন ব্যায়াম/দৌড়, BMR x 1.55)' : 'Moderately Active (Exercise 3-5 days/wk, x1.55)'}
                  </option>
                  <option value="active">
                    {lang === 'bn' ? 'উচ্চ পরিশ্রমী (ভারী কাজ / নিয়মিত জিম, BMR x 1.725)' : 'Very Active (Heavy training / manual labor, x1.725)'}
                  </option>
                </select>
              </div>

              {/* Weight Gain Pace */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  {lang === 'bn' ? 'ওজন বাড়ানোর গতি ও ক্যালরি সারপ্লাস' : 'Weight Gain Pace & Calorie Surplus'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      id: 'lean' as WeightGainPace,
                      labelEn: 'Lean (+300)',
                      labelBn: 'ধীর (+৩০০)',
                      rate: '~0.25 kg/wk',
                    },
                    {
                      id: 'steady' as WeightGainPace,
                      labelEn: 'Steady (+500)',
                      labelBn: 'আদর্শ (+৫০০)',
                      rate: '~0.50 kg/wk',
                      recommended: true,
                    },
                    {
                      id: 'accelerated' as WeightGainPace,
                      labelEn: 'Fast (+750)',
                      labelBn: 'দ্রুত (+৭৫০)',
                      rate: '~0.75 kg/wk',
                    },
                  ].map((pace) => (
                    <button
                      type="button"
                      key={pace.id}
                      onClick={() => setWeightGainPace(pace.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all relative ${
                        weightGainPace === pace.id
                          ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-sm'
                          : 'bg-zinc-800/60 border-zinc-700 text-zinc-300 hover:border-zinc-600'
                      }`}
                    >
                      {pace.recommended && (
                        <span className="absolute -top-2 right-2 text-[9px] font-bold px-1.5 py-0.2 bg-emerald-500 text-zinc-950 rounded">
                          BEST
                        </span>
                      )}
                      <p className="text-xs font-semibold">{lang === 'bn' ? pace.labelBn : pace.labelEn}</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">{pace.rate}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('assessment')}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300"
                >
                  {lang === 'bn' ? 'ফিরে যান' : 'Back'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-zinc-950 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-lg shadow-emerald-950/50 active:scale-95"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'সংরক্ষণ করুন' : 'Save & Recalculate'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* TAB 3: Daily Reminders & PWA Settings */
            <div className="space-y-4">
              {/* Notification Banner / Master Toggle */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 via-zinc-900 to-zinc-900 border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-xs sm:text-sm text-white truncate">
                        {lang === 'bn' ? 'দৈনিক খাবার ও পানির রিমাইন্ডার' : 'Daily Meal & Hydration Reminders'}
                      </h3>
                      <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                        {lang === 'bn'
                          ? 'সঠিক সময়ে ক্যালরি ও পানি লগ করতে দিনে ৩ বার অ্যালার্ট'
                          : 'Automated 10 AM, 2 PM, and 9 PM alerts with live target deficit'}
                      </p>
                    </div>
                  </div>

                  {/* Master Switch */}
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-2">
                    <input
                      type="checkbox"
                      checked={reminderPrefs.enabled}
                      onChange={(e) => {
                        const updated = { ...reminderPrefs, enabled: e.target.checked };
                        setReminderPrefs(updated);
                        saveReminderPreferences(updated);
                        setFeedbackMsg(e.target.checked ? 'Daily reminders activated' : 'Daily reminders paused');
                        setTimeout(() => setFeedbackMsg(null), 3000);
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                {/* Browser Permission status */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs">
                  <span className="text-zinc-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{lang === 'bn' ? 'ব্রাউজার নোটিফিকেশন পারমিশন:' : 'Browser Permission:'}</span>
                  </span>

                  {permissionStatus === 'granted' ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-[10px]">
                      {lang === 'bn' ? 'অনুমতি দেওয়া আছে (Granted)' : 'Granted'}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={async () => {
                        const res = await requestNotificationPermission();
                        setPermissionStatus(res);
                        if (res === 'granted') {
                          setFeedbackMsg(lang === 'bn' ? 'নোটিফিকেশন অনুমতি সফল হয়েছে!' : 'Notification permission granted!');
                        } else {
                          setFeedbackMsg(lang === 'bn' ? 'অনুমতি দেওয়া হয়নি' : 'Permission was dismissed');
                        }
                        setTimeout(() => setFeedbackMsg(null), 3500);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 font-bold text-[10px] transition-colors"
                    >
                      {lang === 'bn' ? 'অনুমতি দিন (Allow)' : 'Allow Notifications'}
                    </button>
                  )}
                </div>

                {feedbackMsg && (
                  <p className="text-[11px] font-semibold text-emerald-400 animate-in fade-in">
                    {feedbackMsg}
                  </p>
                )}
              </div>

              {/* 3 Scheduled Daily Reminders Cards */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs px-1">
                  <span className="font-bold text-zinc-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{lang === 'bn' ? 'নির্ধারিত দৈনিক সময়সূচী (৩টি সময়):' : 'Scheduled Daily Slots (3 Times):'}</span>
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">Live Deficit Sync</span>
                </div>

                {/* Slot 1: 10:00 AM */}
                {(() => {
                  const statsForPreview: ReminderStats = reminderStats || {
                    targetCalories: calorieTargets.targetCalories,
                    loggedCalories: 0,
                    targetProtein: calorieTargets.proteinGrams,
                    loggedProtein: 0,
                    targetWaterMl: formData.dailyWaterGoalMl || 3000,
                    loggedWaterMl: 0,
                  };
                  const live10 = buildReminderMessage('10am', statsForPreview);
                  const live14 = buildReminderMessage('2pm', statsForPreview);
                  const live21 = buildReminderMessage('9pm', statsForPreview);

                  return (
                    <>
                      {/* Slot 1: 10:00 AM */}
                      <div className="p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center">
                              1
                            </span>
                            <div>
                              <span className="font-bold text-xs text-white">Shokal 10:00 AM</span>
                              <span className="text-[10px] text-zinc-400 block">{lang === 'bn' ? 'সকালের নাস্তা ও পানি' : 'Breakfast & Morning Hydration'}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => onTriggerTestReminder && onTriggerTestReminder('10am')}
                            className="px-2.5 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700 text-[10px] font-bold flex items-center gap-1 transition-colors"
                            title="Test 10 AM notification"
                          >
                            <Play className="w-3 h-3 fill-amber-400" />
                            <span>{lang === 'bn' ? 'টেস্ট করুন' : 'Test Alert'}</span>
                          </button>
                        </div>

                        <p className="text-[11px] text-zinc-300 font-mono bg-zinc-900/90 p-2 rounded-xl border border-zinc-800 leading-relaxed break-words">
                          &quot;{live10.body}&quot;
                        </p>
                      </div>

                      {/* Slot 2: 2:00 PM */}
                      <div className="p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center">
                              2
                            </span>
                            <div>
                              <span className="font-bold text-xs text-white">Dupur 2:00 PM</span>
                              <span className="text-[10px] text-zinc-400 block">{lang === 'bn' ? 'দুপুরের খাবার ও প্রোটিন-পানি' : 'Lunch, Protein & Water Check'}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => onTriggerTestReminder && onTriggerTestReminder('2pm')}
                            className="px-2.5 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-emerald-400 border border-zinc-700 text-[10px] font-bold flex items-center gap-1 transition-colors"
                            title="Test 2 PM notification"
                          >
                            <Play className="w-3 h-3 fill-emerald-400" />
                            <span>{lang === 'bn' ? 'টেস্ট করুন' : 'Test Alert'}</span>
                          </button>
                        </div>

                        <p className="text-[11px] text-zinc-300 font-mono bg-zinc-900/90 p-2 rounded-xl border border-zinc-800 leading-relaxed break-words">
                          &quot;{live14.body}&quot;
                        </p>
                      </div>

                      {/* Slot 3: 9:00 PM */}
                      <div className="p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 font-bold text-xs flex items-center justify-center">
                              3
                            </span>
                            <div>
                              <span className="font-bold text-xs text-white">Rat 9:00 PM</span>
                              <span className="text-[10px] text-zinc-400 block">{lang === 'bn' ? 'রাতের সামারি ও বাকি ক্যালরি' : 'Night Summary & Calorie Closing'}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => onTriggerTestReminder && onTriggerTestReminder('9pm')}
                            className="px-2.5 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-purple-400 border border-zinc-700 text-[10px] font-bold flex items-center gap-1 transition-colors"
                            title="Test 9 PM notification"
                          >
                            <Play className="w-3 h-3 fill-purple-400" />
                            <span>{lang === 'bn' ? 'টেস্ট করুন' : 'Test Alert'}</span>
                          </button>
                        </div>

                        <p className="text-[11px] text-zinc-300 font-mono bg-zinc-900/90 p-2 rounded-xl border border-zinc-800 leading-relaxed break-words">
                          &quot;{live21.body}&quot;
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* PWA App Install & Offline Section */}
              <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-xs text-white">
                      {lang === 'bn' ? 'প্রগ্রেসিভ ওয়েব অ্যাপ (PWA)' : 'Progressive Web App (PWA)'}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold">
                    {isInstalled ? 'Installed' : 'App Ready'}
                  </span>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  {lang === 'bn'
                    ? 'Weight Gain BD একটি সম্পূর্ণ অফলাইন সাপোর্টেড PWA অ্যাপ। ফোনের হোমস্ক্রিনে ডাউনলোড করে কোনো ইন্টারনেট ছাড়াই মসৃণভাবে ব্যবহার করুন।'
                    : 'Weight Gain BD works 100% offline with Service Worker caching. Install it to your home screen for instant native-like speed.'}
                </p>

                {!isInstalled && (
                  <button
                    type="button"
                    onClick={() => install()}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-950/60"
                  >
                    <Download className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'হোম স্ক্রিনে অ্যাপ ইনস্টল করুন' : 'Install App to Home Screen'}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Close Bar if on Assessment or Reminders Tab */}
        {activeTab !== 'edit' && (
          <div className="p-3 sm:p-4 border-t border-zinc-800 flex items-center justify-between bg-zinc-950/50 text-xs">
            <span className="text-zinc-400 truncate">
              {lang === 'bn' ? 'টার্গেট ক্যালরি:' : 'Target:'} <strong className="text-white">{calorieTargets.targetCalories} kcal</strong>
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 transition-colors"
            >
              {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
