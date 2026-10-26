/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { UserProfile } from '../types';
import { calculateBMI } from '../utils/healthMath';
import { Smartphone, Monitor, User, Globe, Flame, Download } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface NavbarProps {
  profile: UserProfile;
  lang: 'en' | 'bn';
  onToggleLang: () => void;
  isMobileFrame: boolean;
  onToggleFrame: () => void;
  onOpenProfile: () => void;
  todayCalories: number;
  targetCalories: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  lang,
  onToggleLang,
  isMobileFrame,
  onToggleFrame,
  onOpenProfile,
  todayCalories,
  targetCalories,
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const heightCm = profile.heightFeet * 30.48 + profile.heightInches * 2.54;
  const bmiInfo = calculateBMI(profile.weightKg, heightCm);

  return (
    <header className="sticky top-0 z-40 bg-zinc-900/95 backdrop-blur-md border-b border-zinc-800 text-white">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-3">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-black border border-zinc-800 flex items-center justify-center shadow-lg shadow-black/80 overflow-hidden shrink-0">
            <img
              src="/assets/aistudio/Gym__1_-Photoroom_ac8711eb.png"
              alt="Weight Gain Bicep Logo"
              className="w-full h-full object-contain p-0.5"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm sm:text-base tracking-wide text-white uppercase font-sans truncate">
                WEIGHT GAIN
              </span>
              {lang === 'bn' && <span className="text-zinc-500 font-semibold text-[10px] hidden xs:inline">(ওয়েট গেইন)</span>}
            </div>
            <p className="text-[9px] sm:text-[10px] text-zinc-400 font-medium tracking-wider uppercase truncate">
              {lang === 'bn' ? 'বাংলাদেশি হেলথ ও নিউট্রিশন গাইড' : 'BANGLADESHI HEALTH & NUTRITION GUIDE'}
            </p>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2">
          {/* Calorie Quick Counter */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800/80 border border-zinc-700/60 text-xs">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-zinc-300">
              <strong className="text-white font-medium">{todayCalories}</strong> / {targetCalories} kcal
            </span>
          </div>

          {/* Install App Button (When installable & not already installed) */}
          {isInstallable && !isInstalled && (
            <button
              onClick={() => install()}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-sm shadow-emerald-950"
              title={lang === 'bn' ? 'হোম স্ক্রিনে অ্যাপ ইনস্টল করুন' : 'Install PWA to Home Screen'}
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{lang === 'bn' ? 'ইনস্টল' : 'Install'}</span>
            </button>
          )}

          {/* Quick Profile Pill */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700/80 border border-zinc-700/70 text-xs font-medium text-zinc-200 transition-colors"
            title={lang === 'bn' ? 'প্রোফাইল ও পরিমাপ পরিবর্তন করুন' : 'Edit profile & measurements'}
            aria-label={lang === 'bn' ? 'প্রোফাইল ও পরিমাপ' : 'Profile and metrics'}
          >
            <User className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold text-white">{profile.weightKg} kg</span>
            <span className="text-zinc-400 hidden xs:inline">· {profile.heightFeet}&apos;{profile.heightInches}&quot;</span>
            <span className={`text-[11px] font-bold ${bmiInfo.colorClass} ml-0.5`}>
              BMI {bmiInfo.bmi}
            </span>
          </button>

          {/* Mobile Frame Toggle (Allows testing mobile shell vs full desktop) */}
          <button
            onClick={onToggleFrame}
            className="hidden sm:flex items-center gap-1 p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-xs transition-colors"
            title={isMobileFrame ? (lang === 'bn' ? 'পূর্ণ পর্দা ভিউ' : 'Full width view') : (lang === 'bn' ? 'মোবাইল ফ্রেম ভিউ' : 'Mobile frame view')}
            aria-label={isMobileFrame ? 'Full width view' : 'Mobile phone preview'}
          >
            {isMobileFrame ? <Monitor className="w-4 h-4 text-zinc-300" /> : <Smartphone className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Language Toggle */}
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-800/60 text-emerald-300 text-xs font-semibold transition-colors"
            title={lang === 'bn' ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'}
            aria-label="Toggle language"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'EN' : 'বাং'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
