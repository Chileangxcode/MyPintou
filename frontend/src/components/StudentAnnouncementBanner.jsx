import React, { useState } from "react";
import { useAnnouncements } from "../context/AnnouncementContext.jsx";
import { Megaphone, AlertTriangle, Bell, Calendar, ChevronRight, X, Sparkles } from "lucide-react";

export default function StudentAnnouncementBanner() {
  const { activeAnnouncements } = useAnnouncements();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  if (dismissed || !activeAnnouncements || activeAnnouncements.length === 0) {
    return null;
  }

  const current = activeAnnouncements[currentIndex % activeAnnouncements.length];

  const getTypeStyle = (type) => {
    switch (type) {
      case "urgent":
        return {
          bg: "from-rose-500/20 via-rose-500/10 to-amber-500/10",
          border: "border-rose-500/40",
          badge: "bg-rose-500 text-white shadow-rose-500/30",
          icon: AlertTriangle,
          label: "បន្ទាន់ខ្លាំង"
        };
      case "warning":
        return {
          bg: "from-amber-500/20 via-amber-500/10 to-orange-500/10",
          border: "border-amber-500/40",
          badge: "bg-amber-500 text-slate-900 shadow-amber-500/30",
          icon: Bell,
          label: "ការរំលឹក"
        };
      case "event":
        return {
          bg: "from-purple-500/20 via-indigo-500/10 to-cyan-500/10",
          border: "border-purple-500/40",
          badge: "bg-purple-500 text-white shadow-purple-500/30",
          icon: Calendar,
          label: "ព្រឹត្តិការណ៍"
        };
      default:
        return {
          bg: "from-cyan-500/20 via-blue-500/10 to-teal-500/10",
          border: "border-cyan-500/40",
          badge: "bg-cyan-500 text-slate-900 shadow-cyan-500/30",
          icon: Megaphone,
          label: "ដំណឹងទូទៅ"
        };
    }
  };

  const style = getTypeStyle(current.type);
  const IconComponent = style.icon;

  return (
    <>
      <div className={`relative overflow-hidden rounded-2xl border ${style.border} bg-gradient-to-r ${style.bg} backdrop-blur-xl p-3.5 sm:p-4 transition-all duration-300 shadow-lg font-khmer`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${style.badge} shadow-md`}>
              <IconComponent className="w-4 h-4" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${style.badge}`}>
                  {style.label}
                </span>
                <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                  {current.createdAt}
                </span>
                {activeAnnouncements.length > 1 && (
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.2 rounded-md">
                    {currentIndex + 1}/{activeAnnouncements.length}
                  </span>
                )}
              </div>
              <h4
                onClick={() => setSelectedAnnouncement(current)}
                className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate cursor-pointer hover:text-cyan-400 transition-colors mt-0.5"
              >
                {current.title}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setSelectedAnnouncement(current)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 dark:bg-white/10 dark:hover:bg-white/20 text-xs font-semibold text-slate-900 dark:text-white transition-all cursor-pointer"
            >
              <span>លម្អិត</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {activeAnnouncements.length > 1 && (
              <button
                onClick={() => setCurrentIndex((prev) => (prev + 1) % activeAnnouncements.length)}
                title="សេចក្តីប្រកាសបន្ទាប់"
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                ↻
              </button>
            )}

            <button
              onClick={() => setDismissed(true)}
              title="បិទផ្ទាំងនេះ"
              className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-khmer animate-fade-in">
          <div className="w-full max-w-lg bg-[#0c1427] border border-cyan-500/30 rounded-3xl p-6 text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${getTypeStyle(selectedAnnouncement.type).badge}`}>
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-cyan-400 uppercase font-mono tracking-wider block">
                    {selectedAnnouncement.category || "សេចក្តីជូនដំណឹង"}
                  </span>
                  <span className="text-xs text-slate-400">
                    ផ្សាយដោយ៖ {selectedAnnouncement.author || "ការិយាល័យសិក្សា"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-base sm:text-lg font-bold text-white">
                {selectedAnnouncement.title}
              </h3>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {selectedAnnouncement.content}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>កាលបរិច្ឆេទ៖ {selectedAnnouncement.createdAt}</span>
              {selectedAnnouncement.expiresAt && (
                <span>ផុតកំណត់៖ {selectedAnnouncement.expiresAt}</span>
              )}
            </div>

            <button
              onClick={() => setSelectedAnnouncement(null)}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold text-xs transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              បានយល់ព្រម
            </button>
          </div>
        </div>
      )}
    </>
  );
}
