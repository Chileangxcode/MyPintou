import React from "react";
import { Trophy, Medal, Award, RefreshCw, Users, LayoutDashboard, X, Flame } from "lucide-react";

export default function RaceResultsModal({
  winner,
  rankings = [],
  themeName = "ប្រណាំងកំប្លែង",
  onRaceAgain,
  onChooseNewStudents,
  onBackToDashboard,
  onClose
}) {
  if (!winner) return null;

  const top3 = rankings.slice(0, 3);
  const remaining = rankings.slice(3);

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-3xl rounded-3xl bg-white dark:bg-slate-900 border-4 border-amber-500/60 p-6 md:p-8 shadow-2xl text-center space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer"
          title="បិទផ្ទាំង"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Floating Trophy Icon */}
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-400 via-yellow-400 to-amber-500 text-white flex items-center justify-center mx-auto text-5xl shadow-2xl shadow-amber-500/50 animate-bounce">
            🏆
          </div>
          <span className="absolute -top-2 -right-2 text-2xl animate-pulse">✨</span>
          <span className="absolute -bottom-1 -left-2 text-2xl animate-pulse">🎉</span>
        </div>

        {/* Winner Banner */}
        <div className="space-y-1.5">
          <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/20 text-amber-500 border border-amber-500/40 inline-flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>ជើងឯកការប្រណាំង! (CHAMPION OF THE RACE)</span>
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white pt-2">
            {winner.fullNameKh || winner.fullName || winner.fullNameEn}
          </h2>
          <p className="text-sm text-indigo-500 dark:text-indigo-400 font-bold font-mono">
            អត្តលេខ៖ {winner.studentId} • បន្ទប់ {winner.room || "N"}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
            បានឆ្លងកាត់ខ្សែបន្ទាត់ព្រ័ត្រមុនគេបង្អស់ លើវិញ្ញាសា "{themeName}"!
          </p>
        </div>

        {/* Olympic Podium Display (Top 3) */}
        <div className="grid grid-cols-3 gap-3 pt-3 items-end max-w-xl mx-auto">
          {/* 2nd Place (Silver) */}
          {top3[1] && (
            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 text-center space-y-1 shadow-sm">
              <span className="text-2xl inline-block">🥈</span>
              <div className="text-[10px] font-black uppercase text-slate-500">លេខ ២ (Silver)</div>
              <p className="text-xs font-black text-slate-800 dark:text-slate-200 truncate">
                {top3[1].fullNameKh || top3[1].fullName}
              </p>
              <p className="text-[10px] font-mono text-slate-400">({top3[1].studentId})</p>
            </div>
          )}

          {/* 1st Place (Gold Winner in Center) */}
          {top3[0] && (
            <div className="p-4 rounded-2xl bg-gradient-to-b from-amber-400/20 to-amber-500/10 border-4 border-amber-400 text-center space-y-1.5 shadow-xl scale-105 z-10">
              <span className="text-4xl inline-block animate-pulse">🥇</span>
              <div className="text-xs font-black uppercase text-amber-600 dark:text-amber-400">
                ★ ជើងឯកលេខ ១ ★
              </div>
              <p className="text-sm font-black text-amber-700 dark:text-amber-300 truncate">
                {top3[0].fullNameKh || top3[0].fullName}
              </p>
              <p className="text-[11px] font-mono text-amber-500 font-bold">({top3[0].studentId})</p>
            </div>
          )}

          {/* 3rd Place (Bronze) */}
          {top3[2] && (
            <div className="p-3.5 rounded-2xl bg-amber-900/10 dark:bg-amber-950/40 border-2 border-amber-700/30 text-center space-y-1 shadow-sm">
              <span className="text-2xl inline-block">🥉</span>
              <div className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-500">
                លេខ ៣ (Bronze)
              </div>
              <p className="text-xs font-black text-slate-800 dark:text-slate-200 truncate">
                {top3[2].fullNameKh || top3[2].fullName}
              </p>
              <p className="text-[10px] font-mono text-slate-400">({top3[2].studentId})</p>
            </div>
          )}
        </div>

        {/* Full Rankings Leaderboard for Remaining Racers */}
        {remaining.length > 0 && (
          <div className="text-left space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>📊 ចំណាត់ថ្នាក់អ្នកចូលរួមផ្សេងទៀត ({rankings.length} នាក់សរុប)៖</span>
            </h4>
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {remaining.map((item, idx) => (
                <div
                  key={item.studentId || idx}
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono font-bold text-[10px] flex items-center justify-center">
                      #{idx + 4}
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {item.fullNameKh || item.fullName}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      ({item.studentId})
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    បន្ទប់ {item.room || "N"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3 Main Action Buttons Specified in Requirements */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          {/* Button 1: Race Again */}
          <button
            type="button"
            onClick={onRaceAgain}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>ប្រណាំងម្ដងទៀត</span>
          </button>

          {/* Button 2: Choose New Students */}
          <button
            type="button"
            onClick={onChooseNewStudents}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            <Users className="w-4 h-4" />
            <span>ជ្រើសរើសនិស្សិតថ្មី</span>
          </button>

          {/* Button 3: Return to Dashboard */}
          <button
            type="button"
            onClick={onBackToDashboard}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-sm transition-all cursor-pointer"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>ត្រឡប់ទៅផ្ទាំងគ្រប់គ្រង</span>
          </button>
        </div>
      </div>
    </div>
  );
}
