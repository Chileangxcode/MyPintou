import React, { useState } from "react";
import {
  Trophy,
  Award,
  Zap,
  CheckCircle2,
  Lock,
  Sparkles,
  Flame,
  ShieldCheck,
  Target,
  Crown,
  ChevronRight,
  Info
} from "lucide-react";

export default function AcademicBadgesSection({ studentSession }) {
  const [selectedBadge, setSelectedBadge] = useState(null);

  if (!studentSession) return null;

  const { academicSummary, scores } = studentSession;
  const totalScore = academicSummary?.totalScore != null ? Number(academicSummary.totalScore) : 0;
  const overallGrade = (academicSummary?.overallGrade || "C").trim().toUpperCase();

  // Find individual assessment scores
  const attendanceItem = (scores || []).find((s) => (s.assessment || "").toLowerCase().includes("attendance") || (s.assessment || "").toLowerCase().includes("វត្តមាន"));
  const quizItem = (scores || []).find((s) => (s.assessment || "").toLowerCase().includes("quiz") || (s.assessment || "").toLowerCase().includes("សំណួរ") || (s.assessment || "").toLowerCase().includes("កិច្ចការ"));
  const midtermItem = (scores || []).find((s) => (s.assessment || "").toLowerCase().includes("midterm") || (s.assessment || "").toLowerCase().includes("ពាក់កណ្"));
  const finalItem = (scores || []).find((s) => (s.assessment || "").toLowerCase().includes("final") || (s.assessment || "").toLowerCase().includes("បញ្ចប់"));

  const attendanceScore = attendanceItem?.score != null ? Number(attendanceItem.score) : (academicSummary?.attendance != null ? Number(academicSummary.attendance) : 10);
  const quizScore = quizItem?.score != null ? Number(quizItem.score) : (academicSummary?.totalQHA != null ? Number(academicSummary.totalQHA) : 0);
  const midtermScore = midtermItem?.score != null ? Number(midtermItem.score) : (academicSummary?.midterm != null ? Number(academicSummary.midterm) : 0);
  const finalScore = finalItem?.score != null ? Number(finalItem.score) : (academicSummary?.finalScore != null ? Number(academicSummary.finalScore) : 0);

  const formatScore = (val) => {
    if (val === null || val === undefined || isNaN(val)) return 0;
    const num = Number(val);
    return Number.isInteger(num) ? num : Number(num.toFixed(2));
  };

  const badges = [
    {
      id: "valedictorian",
      titleKh: "និស្សិតឆ្នើមប្រចាំឆមាស",
      titleEn: "Valedictorian Tier",
      icon: Crown,
      color: "from-amber-400 to-yellow-500",
      glowColor: "rgba(245,158,11,0.5)",
      bgGlow: "bg-amber-500/10 border-amber-500/30 text-amber-400",
      target: "ពិន្ទុឆមាសសរុបចាប់ពី ៨៥% (និទ្ទេស A)",
      currentValue: totalScore,
      targetValue: 85,
      maxScore: 100,
      unit: "pts",
      unlocked: totalScore >= 85 || overallGrade === "A",
      description: "កម្រិតកិត្តិយសខ្ពស់បំផុតសម្រាប់និស្សិតដែលមានពិន្ទុសរុបចាប់ពី ៨៥ ពិន្ទុឡើងទៅ។"
    },
    {
      id: "perfect_attendance",
      titleKh: "ម្ចាស់វត្តមានគំរូ",
      titleEn: "Perfect Attendance",
      icon: Award,
      color: "from-emerald-400 to-teal-500",
      glowColor: "rgba(16,185,129,0.5)",
      bgGlow: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
      target: "វត្តមានពេញលេញ ១០/១០ ពិន្ទុ",
      currentValue: attendanceScore,
      targetValue: 9.5,
      maxScore: 10,
      unit: "pts",
      unlocked: attendanceScore >= 9.5,
      description: "ផ្តល់ជូននិស្សិតដែលមានវិន័យខ្ពស់ ចូលរៀនទៀងទាត់ និងមិនដែលអវត្តមាន។"
    },
    {
      id: "quiz_master",
      titleKh: "កំពូលអ្នកប្រឡង Quiz",
      titleEn: "Quiz & Tasks Master",
      icon: Zap,
      color: "from-cyan-400 to-blue-500",
      glowColor: "rgba(6,182,212,0.5)",
      bgGlow: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",
      target: "ពិន្ទុកិច្ចការ និង Quiz ចាប់ពី ១២/១៥ (≥៨០%)",
      currentValue: quizScore,
      targetValue: 12,
      maxScore: 15,
      unit: "pts",
      unlocked: quizScore >= 12,
      description: "ផ្តល់ជូននិស្សិតដែលទទួលបានពិន្ទុខ្ពស់ក្នុងកម្រងសំណួរស្រាវជ្រាវ និងកិច្ចការប្រចាំសប្តាហ៍។"
    },
    {
      id: "midterm_champ",
      titleKh: "ជើងឯកពាក់កណ្តាលឆមាស",
      titleEn: "Midterm Champion",
      icon: Target,
      color: "from-blue-500 to-indigo-600",
      glowColor: "rgba(59,130,246,0.5)",
      bgGlow: "bg-blue-500/10 border-blue-500/30 text-blue-400",
      target: "ពិន្ទុ Midterm ចាប់ពី ២០/២៥ (≥៨០%)",
      currentValue: midtermScore,
      targetValue: 20,
      maxScore: 25,
      unit: "pts",
      unlocked: midtermScore >= 20,
      description: "បានឆ្លងផុតការប្រឡងពាក់កណ្តាលឆមាសដោយទទួលបានលទ្ធផលល្អប្រសើរ។"
    },
    {
      id: "finals_conqueror",
      titleKh: "អ្នកប្រយុទ្ធបញ្ចប់ឆមាស",
      titleEn: "Finals Conqueror",
      icon: Flame,
      color: "from-purple-500 to-pink-600",
      glowColor: "rgba(168,85,247,0.5)",
      bgGlow: "bg-purple-500/10 border-purple-500/30 text-purple-400",
      target: "ពិន្ទុ Final Exam ចាប់ពី ៤០/៥០ (≥៨០%)",
      currentValue: finalScore,
      targetValue: 40,
      maxScore: 50,
      unit: "pts",
      unlocked: finalScore >= 40,
      description: "បានបញ្ចប់ការប្រឡងបញ្ចប់ឆមាសដោយទទួលបានពិន្ទុកំពូល។"
    },
    {
      id: "certified_pass",
      titleKh: "កម្រិតស្តង់ដារជាប់",
      titleEn: "Certified Passing",
      icon: ShieldCheck,
      color: "from-teal-400 to-emerald-500",
      glowColor: "rgba(20,184,166,0.5)",
      bgGlow: "bg-teal-500/10 border-teal-500/30 text-teal-400",
      target: "ពិន្ទុសរុបចាប់ពី ៥០% ឡើងទៅ (និទ្ទេស C)",
      currentValue: totalScore,
      targetValue: 50,
      maxScore: 50,
      unit: "pts",
      unlocked: totalScore >= 50,
      description: "បានបំពេញលក្ខខណ្ឌអប្បបរមាឆ្លងផុតកម្រិតជាប់ស្តង់ដារជាតិ។"
    }
  ];

  const unlockedCount = badges.filter((b) => b.unlocked).length;
  const totalBadges = badges.length;
  const unlockedPercent = Math.round((unlockedCount / totalBadges) * 100);

  return (
    <div className="bg-white/85 dark:bg-[#0c1427]/85 rounded-3xl border border-slate-200/90 dark:border-white/10 shadow-sm p-5 sm:p-7 backdrop-blur-xl space-y-5 font-khmer">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-white/5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.3)]">
              <Trophy className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              ប្រព័ន្ធមេដាយកិត្តិយស និងសមិទ្ធផលសិក្សា (Academic Badges & Trophies)
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 pl-10">
            មេដាយកិត្តិយសត្រូវបានដោះសោដោយស្វ័យប្រវត្តិតាមរយៈលទ្ធផលជាក់ស្តែងនៃការសិក្សា
          </p>
        </div>

        {/* Progress Pill */}
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/60 p-2.5 px-4 rounded-2xl border border-slate-200 dark:border-white/10 shrink-0">
          <div className="text-right">
            <div className="text-xs font-bold text-slate-900 dark:text-white">
              បានដោះសោ៖ <strong className="text-cyan-500 font-mono text-sm">{unlockedCount}</strong> / {totalBadges}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              {unlockedPercent}% សម្រេចបាន
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-md">
            {unlockedPercent}%
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {badges.map((badge) => {
          const Icon = badge.icon;
          const pct = Math.min(100, Math.max(0, Math.round((badge.currentValue / badge.maxScore) * 100)));

          return (
            <div
              key={badge.id}
              onClick={() => setSelectedBadge(badge)}
              className={`relative p-4 rounded-2xl border transition-all duration-300 cursor-pointer group ${
                badge.unlocked
                  ? "bg-white/80 dark:bg-slate-900/60 border-slate-200/90 dark:border-white/10 hover:border-cyan-400/60 hover:shadow-[0_8px_30px_rgba(6,182,212,0.15)] hover:-translate-y-1"
                  : "bg-slate-50/60 dark:bg-slate-900/20 border-slate-200/50 dark:border-white/5 opacity-75 hover:opacity-100"
              }`}
            >
              {/* Unlocked Glow / Lock Badge */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-md ${
                      badge.unlocked
                        ? `bg-gradient-to-tr ${badge.color} text-white shadow-[0_0_15px_${badge.glowColor}]`
                        : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-cyan-500 transition-colors">
                      {badge.titleKh}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {badge.titleEn}
                    </p>
                  </div>
                </div>

                {badge.unlocked ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>ដោះសោ</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px]">
                    <Lock className="w-3 h-3" />
                    <span>ចាក់សោ</span>
                  </span>
                )}
              </div>

              {/* Requirement & Progress */}
              <div className="mt-3.5 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>{badge.target}</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                    {formatScore(badge.currentValue)} / {badge.maxScore}
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      badge.unlocked
                        ? `bg-gradient-to-r ${badge.color}`
                        : "bg-slate-400 dark:bg-slate-600"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Badge Detail Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-[#0c1427] border border-cyan-500/30 rounded-3xl p-6 text-white text-center space-y-4 shadow-2xl animate-fade-in">
            <div className={`w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr ${selectedBadge.color} flex items-center justify-center text-white shadow-lg`}>
              <selectedBadge.icon className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-black text-white">{selectedBadge.titleKh}</h4>
              <p className="text-xs text-cyan-400 font-mono">{selectedBadge.titleEn}</p>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-white/5 p-3 rounded-2xl border border-white/10">
              {selectedBadge.description}
            </p>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 space-y-1.5 text-left">
              <div>លក្ខខណ្ឌដោះសោ៖ <strong className="text-white">{selectedBadge.target}</strong></div>
              <div>ពិន្ទុជាក់ស្តែង៖ <strong className="text-cyan-400 font-mono">{formatScore(selectedBadge.currentValue)} / {selectedBadge.maxScore}</strong></div>
              <div className="pt-1 text-cyan-300 font-medium">
                ស្ថានភាព៖ {selectedBadge.unlocked ? "✅ បានដោះសោជោគជ័យ!" : `⏳ នៅខ្វះ ${Math.max(0, selectedBadge.targetValue - selectedBadge.currentValue).toFixed(1)} ពិន្ទុទៀត`}
              </div>
            </div>

            <button
              onClick={() => setSelectedBadge(null)}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all cursor-pointer"
            >
              បិទផ្ទាំងនេះ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
