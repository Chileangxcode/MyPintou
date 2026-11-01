import React, { useState, useEffect } from "react";
import { Sparkles, RefreshCw, Clock, AlertTriangle, X } from "lucide-react";
import { onUpdateAvailable, applyUpdateNow, isFormDirty } from "../utils/pwaManager.js";
import { APP_VERSION, checkForAppUpdates } from "../version.js";

export default function PWAUpdateModal() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [latestVersion, setLatestVersion] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showDirtyWarning, setShowDirtyWarning] = useState(false);

  useEffect(() => {
    // 1. Listen to Service Worker updates
    const unsubscribe = onUpdateAvailable((info) => {
      if (info.hasUpdate) {
        setUpdateAvailable(true);
        // Query version.json to get updated version number
        checkForAppUpdates().then((ver) => {
          if (ver.latestVersion) setLatestVersion(ver.latestVersion);
        });
      }
    });

    // 2. Also poll version.json periodically as secondary detection
    const interval = setInterval(async () => {
      const res = await checkForAppUpdates();
      if (res.hasUpdate) {
        setLatestVersion(res.latestVersion);
        setUpdateAvailable(true);
      }
    }, 10 * 60 * 1000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  if (!updateAvailable || dismissed) {
    return null;
  }

  const handleUpdateClick = () => {
    // Prevent disrupting active unsaved form entries
    if (isFormDirty()) {
      setShowDirtyWarning(true);
      return;
    }
    proceedWithUpdate();
  };

  const proceedWithUpdate = () => {
    setIsUpdating(true);
    setTimeout(() => {
      applyUpdateNow();
    }, 400);
  };

  const handleUpdateLater = () => {
    setDismissed(true);
    // Remind again after 30 minutes
    setTimeout(() => setDismissed(false), 30 * 60 * 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in no-print">
      <div className="w-full max-w-md bg-white dark:bg-[#0c1427] border border-cyan-500/30 rounded-3xl p-6 shadow-2xl shadow-cyan-500/20 text-slate-800 dark:text-white relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-cyan-500/30">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-khmer text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>មានកំណែអាប់ដេតថ្មី!</span>
                {latestVersion && (
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-500 border border-cyan-500/30">
                    v{latestVersion}
                  </span>
                )}
              </h3>
              <button
                onClick={handleUpdateLater}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="font-khmer text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
              ប្រព័ន្ធត្រូវបានកែលម្អមុខងារ និងទាញយកកំណែចុងក្រោយបង្អស់រួចរាល់ហើយ។ តើអ្នកចង់អាប់ដេតឥឡូវនេះទេ?
            </p>

            {showDirtyWarning && (
              <div className="mt-3 p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-khmer flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">អ្នកកំពុងមានទិន្នន័យមិនទាន់រក្សាទុក!</p>
                  <p className="text-[11px] opacity-90 mt-0.5">
                    សូមចុច "រក្សាទុក (Save)" លើទម្រង់ពិន្ទុ ឬទិន្នន័យសិន មុននឹងបន្តអាប់ដេត ដើម្បីការពារកុំឱ្យបាត់បង់ទិន្នន័យ។
                  </p>
                  <button
                    onClick={proceedWithUpdate}
                    className="mt-2 text-[11px] text-amber-600 dark:text-amber-400 underline font-semibold block cursor-pointer"
                  >
                    បន្តអាប់ដេតទោះជាយ៉ាងណា (Force Update)
                  </button>
                </div>
              </div>
            )}

            <div className="mt-5 flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleUpdateClick}
                disabled={isUpdating}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-khmer font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50 min-h-[44px]"
              >
                <RefreshCw className={`w-4 h-4 ${isUpdating ? "animate-spin" : ""}`} />
                <span>{isUpdating ? "កំពុងអាប់ដេត..." : "អាប់ដេតឥឡូវនេះ (Update Now)"}</span>
              </button>

              <button
                type="button"
                onClick={handleUpdateLater}
                className="py-2.5 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-khmer font-medium text-xs transition-colors cursor-pointer min-h-[44px]"
              >
                <span>ពេលក្រោយ (Later)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

