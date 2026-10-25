/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, X, Share, PlusSquare, Smartphone, Check } from 'lucide-react';

interface PWAInstallBannerProps {
  lang: 'en' | 'bn';
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ lang }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [installing, setInstalling] = useState(false);

  // If already installed as standalone or user dismissed this session
  if (isInstalled || dismissed) {
    return null;
  }

  // If not installable and not iOS, don't show
  if (!isInstallable && !isIOS) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    setInstalling(true);
    await install();
    setInstalling(false);
  };

  return (
    <>
      <div className="mx-3 sm:mx-4 mt-2.5 p-3 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-zinc-900 to-zinc-900 border border-emerald-500/40 shadow-xl shadow-emerald-950/30 flex items-center justify-between gap-3 text-xs animate-in fade-in slide-in-from-top-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400">
            <Smartphone className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-xs sm:text-sm">
                {lang === 'bn' ? 'Weight Gain BD অ্যাপ ইনস্টল করুন' : 'Install Weight Gain BD'}
              </span>
              <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase tracking-wider">
                PWA
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 truncate mt-0.5">
              {lang === 'bn'
                ? 'হোম স্ক্রিনে রাখুন—অফলাইনেও চলবে ও সঠিক সময়ে খাবারের রিমাইন্ডার পাবেন'
                : 'Add to home screen for 100% offline access and automated meal reminders'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleInstallClick}
            disabled={installing}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950/60 active:scale-95 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'ইনস্টল' : 'Install'}</span>
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            title={lang === 'bn' ? 'বন্ধ করুন' : 'Dismiss'}
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* iOS Safari Installation Guide Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl w-full max-w-sm p-5 text-zinc-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>{lang === 'bn' ? 'iPhone / iPad এ ইনস্টল করার নিয়ম' : 'Install on iPhone / iPad'}</span>
              </h3>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-zinc-300">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-800/80 border border-zinc-700/60">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                  1
                </span>
                <div>
                  <p className="font-semibold text-white flex items-center gap-1.5">
                    {lang === 'bn' ? 'Safari ব্রাউজারে Share বাটনে চাপুন' : 'Tap the Safari Share button'}
                    <Share className="w-3.5 h-3.5 text-blue-400 inline" />
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    {lang === 'bn' ? 'পর্দার নিচের অংশে শেয়ার বাটনটি পাবেন' : 'Located at the bottom of your Safari toolbar'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-800/80 border border-zinc-700/60">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                  2
                </span>
                <div>
                  <p className="font-semibold text-white flex items-center gap-1.5">
                    {lang === 'bn' ? '"Add to Home Screen" চাপুন' : 'Select "Add to Home Screen"'}
                    <PlusSquare className="w-3.5 h-3.5 text-emerald-400 inline" />
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    {lang === 'bn' ? 'স্ক্রল করে "Add to Home Screen" অপশনটি সিলেক্ট করুন' : 'Scroll down the share sheet and tap Add'}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{lang === 'bn' ? 'বুঝেছি' : 'Got it'}</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
