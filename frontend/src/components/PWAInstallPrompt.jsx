import React, { useState, useEffect } from "react";
import {
  Download,
  Share,
  PlusSquare,
  X,
  Smartphone,
  CheckCircle2,
  Laptop,
  Check,
  Sparkles,
  ExternalLink
} from "lucide-react";
import {
  isStandaloneMode,
  isIOSDevice,
  isAndroidDevice,
  getDeferredInstallPrompt,
  onPWAInstallChange,
  applyUpdateNow
} from "../utils/pwaManager.js";
import { APP_VERSION } from "../version.js";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showAutoBanner, setShowAutoBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    // Check initial standalone mode
    if (isStandaloneMode()) {
      setIsInstalled(true);
    }

    // Subscribe to install availability from pwaManager
    const unsubscribe = onPWAInstallChange((state) => {
      setDeferredPrompt(state.deferredPrompt);
      if (state.isInstalled) {
        setIsInstalled(true);
      }
      // If we got a deferred prompt and user hasn't dismissed today, show bottom banner
      const lastDismissed = localStorage.getItem("mypintou_install_dismissed");
      const isRecentDismissed = lastDismissed && Date.now() - Number(lastDismissed) < 24 * 60 * 60 * 1000;
      if (state.deferredPrompt && !isRecentDismissed && !state.isInstalled) {
        setShowAutoBanner(true);
      }
    });

    // Listen to custom event to open the PWA install guide on-demand from any button
    const handleOpenModal = (event) => {
      setShowModal(true);
      setShowAutoBanner(false);
    };

    window.addEventListener("mypintou:open-pwa-install", handleOpenModal);

    // Track app installation
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowAutoBanner(false);
      setInstallSuccess(true);
      setTimeout(() => setInstallSuccess(false), 5000);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      unsubscribe();
      window.removeEventListener("mypintou:open-pwa-install", handleOpenModal);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    const promptEvent = deferredPrompt || getDeferredInstallPrompt();
    if (promptEvent) {
      try {
        promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice.outcome === "accepted") {
          setIsInstalled(true);
          setShowAutoBanner(false);
          setShowModal(false);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.error("Install prompt error:", err);
      }
    } else {
      // If no native prompt event, keep modal open to show browser-specific instructions
      setShowModal(true);
    }
  };

  const handleDismissBanner = () => {
    setShowAutoBanner(false);
    setDismissed(true);
    localStorage.setItem("mypintou_install_dismissed", String(Date.now()));
  };

  const isIOS = isIOSDevice();
  const isAndroid = isAndroidDevice();

  return (
    <>
      {/* 1. Automatic Non-Intrusive Bottom Banner (For first-time mobile/desktop visitors) */}
      {showAutoBanner && !isInstalled && !dismissed && (
        <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-40 bg-slate-900/95 border border-cyan-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-md text-white animate-fade-in no-print">
          <div className="flex items-center gap-3">
            <img
              src="/pwa-192x192.png"
              alt="MyPintou App Icon"
              className="w-11 h-11 rounded-xl border border-cyan-500/30 object-cover shrink-0 shadow-md"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-khmer text-xs font-bold text-white flex items-center gap-1.5 truncate">
                <span>ដំឡើងលើទូរស័ព្ទ</span>
              </h4>
              <p className="font-khmer text-[11px] text-slate-300 mt-0.5 truncate">
                ដំឡើងលើអេក្រង់ដើម សម្រាប់បើកប្រើប្រាស់រហ័ស
              </p>
            </div>
            <button
              onClick={handleDismissBanner}
              className="text-slate-400 hover:text-white p-1"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={handleInstallClick}
              className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-khmer font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/30 active:scale-95 transition-all cursor-pointer min-h-[44px]"
            >
              <Download className="w-4 h-4" />
              <span>ដំឡើងលើទូរស័ព្ទ (Install)</span>
            </button>
            <button
              type="button"
              onClick={handleDismissBanner}
              className="py-2 px-3 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-400 font-khmer text-xs cursor-pointer min-h-[44px]"
            >
              <span>ទុកពេលក្រោយ</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Interactive PWA App Installation & Guide Modal (Triggered by Header / Settings / Landing buttons) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in no-print">
          <div className="w-full max-w-md bg-[#0c1427] border border-cyan-500/40 rounded-3xl p-6 text-white shadow-2xl relative space-y-5">
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* App Header Badge */}
            <div className="flex items-center gap-4 pr-8">
              <div className="relative">
                <img
                  src="/pwa-192x192.png"
                  alt="MyPintou App Icon"
                  className="w-16 h-16 rounded-2xl border border-cyan-500/40 shadow-lg shadow-cyan-500/20 object-cover"
                />
                <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded bg-cyan-500 text-[9px] font-mono font-black text-slate-950 uppercase shadow-xs">
                  PWA
                </span>
              </div>
              <div>
                <h3 className="font-khmer font-bold text-base text-white flex items-center gap-1.5">
                  <span>MyPintou (Myពិន្ទុ)</span>
                </h3>
                <p className="font-khmer text-xs text-slate-400 mt-0.5">
                  ប្រព័ន្ធតាមដានពិន្ទុ និងលទ្ធផលសិក្សាឌីជីថល
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold">
                    v{APP_VERSION}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-khmer flex items-center gap-1 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>គាំទ្រស្វ័យអាប់ដេត</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Status 1: App is ALREADY Installed as Standalone PWA */}
            {isStandaloneMode() ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3 font-khmer">
                <div className="flex items-center gap-2.5 text-emerald-400">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span className="text-sm font-bold">
                    កម្មវិធីត្រូវបានដំឡើងលើទូរស័ព្ទរួចរាល់ហើយ!
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  អ្នកកំពុងបើកដំណើរការក្នុងទម្រង់ Standalone Mode។ កម្មវិធីនឹងទទួលការអាប់ដេតកំណែថ្មីដោយស្វ័យប្រវត្តិនៅពេលមានកំណែ Update ចេញផ្សាយ។
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    applyUpdateNow();
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer min-h-[44px]"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>ពិនិត្យកំណែថ្មី & Refresh</span>
                </button>
              </div>
            ) : (
              /* Status 2: NOT YET INSTALLED -> Provide Native Prompt or OS-specific Guide */
              <div className="space-y-4">
                {/* A. If Native Deferred Prompt is Available (Chrome/Edge/Android) */}
                {deferredPrompt ? (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500/15 via-blue-500/10 to-transparent border border-cyan-500/30 space-y-3">
                    <div className="flex items-center gap-2 text-cyan-400 font-khmer text-xs font-bold">
                      <Sparkles className="w-4 h-4" />
                      <span>កម្មវិធីរុករករបស់អ្នកគាំទ្រការដំឡើង ១-Tap</span>
                    </div>
                    <p className="font-khmer text-xs text-slate-300">
                      ចុចប៊ូតុងខាងក្រោមដើម្បីដំឡើងកម្មវិធី MyPintou ទៅលើ Home Screen ឬ Desktop របស់អ្នកភ្លាមៗ៖
                    </p>
                    <button
                      type="button"
                      onClick={handleInstallClick}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-khmer font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30 active:scale-95 transition-all cursor-pointer min-h-[44px]"
                    >
                      <Download className="w-4 h-4" />
                      <span>ដំឡើងលើទូរស័ព្ទឥឡូវនេះ (Install App)</span>
                    </button>
                  </div>
                ) : isIOS ? (
                  /* B. iOS Safari Specific 3-Step Instructions */
                  <div className="space-y-3 font-khmer text-xs">
                    <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-cyan-300 font-semibold flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      <span>របៀបដំឡើងលើ iPhone / iPad (Safari)</span>
                    </div>

                    <div className="space-y-2.5 text-slate-300">
                      <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                        <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 font-bold font-mono text-xs flex items-center justify-center shrink-0">
                          1
                        </span>
                        <div>
                          <p className="font-semibold text-white">ចុចប៊ូតុង Share ក្នុង Safari</p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            ចុចរូបសញ្ញា <Share className="w-3 h-3 text-cyan-400 inline" /> នៅរបារឧបករណ៍ខាងក្រោម
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                        <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 font-bold font-mono text-xs flex items-center justify-center shrink-0">
                          2
                        </span>
                        <div>
                          <p className="font-semibold text-white">ជ្រើស "Add to Home Screen"</p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            អូសចុះក្រោម រួចជ្រើសរើស <PlusSquare className="w-3 h-3 text-cyan-400 inline" /> "បន្ថែមទៅអេក្រង់ដើម"
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                        <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 font-bold font-mono text-xs flex items-center justify-center shrink-0">
                          3
                        </span>
                        <div>
                          <p className="font-semibold text-white">ចុច "Add" នៅជ្រុងខាងស្តាំ</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            កម្មវិធីនឹងបង្ហាញនៅលើ Home Screen របស់អ្នកដូច Native App
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* C. Desktop Chrome / Edge / Other Browsers */
                  <div className="space-y-3 font-khmer text-xs">
                    <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-semibold flex items-center gap-2">
                      <Laptop className="w-4 h-4" />
                      <span>ដំឡើងលើកុំព្យូទ័រ (Desktop Chrome / Edge)</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-slate-300">
                      <p className="leading-relaxed">
                        ១. មើលទៅលើ <strong>របារអាសយដ្ឋាន (Address Bar)</strong> ខាងលើនៃកម្មវិធីរុករករបស់អ្នក។
                      </p>
                      <p className="leading-relaxed flex items-center gap-1.5">
                        ២. ចុចលើរូបសញ្ញា <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold">⊕ ដំឡើង (Install)</span> នៅខាងស្តាំដៃនៃ URL។
                      </p>
                      <p className="leading-relaxed">
                        ៣. ឬចុច Menu <span className="font-mono font-bold text-white">(⋮)</span> $\rightarrow$ <strong>«Save and share»</strong> $\rightarrow$ <strong>«Install MyPintou»</strong>។
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="py-2 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-khmer text-xs font-semibold cursor-pointer min-h-[44px]"
              >
                យល់ព្រម (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
