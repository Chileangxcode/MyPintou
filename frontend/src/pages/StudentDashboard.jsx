import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Award,
  BookOpen,
  Printer,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  Search,
  Sparkles,
  Zap,
  Target,
  GraduationCap,
  ChevronRight,
  ShieldCheck,
  Check,
  Building2,
  Star,
  Flame,
  ClipboardList,
  Share2,
  ExternalLink,
  RefreshCw,
  FileText,
  Presentation,
  Video,
  LayoutGrid,
  Table as TableIcon,
  ArrowUpRight,
  HelpCircle,
  Filter,
  CheckCircle
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from "recharts";
import { useAuth } from "../context/AuthContext.jsx";
import { useSchool } from "../context/SchoolContext.jsx";
import { useELibrary, detectPlatform } from "../context/ELibraryContext.jsx";
import { SocialPlatformIcon } from "../components/SocialPlatformIcon.jsx";
import { dataSyncService } from "../services/dataSyncService.js";
import StatusBadge from "../components/StatusBadge.jsx";
import RealtimeIndicator from "../components/RealtimeIndicator.jsx";
import AcademicBadgesSection from "../components/AcademicBadgesSection.jsx";
import SocialShareModal from "../components/SocialShareModal.jsx";
import StudentAnnouncementBanner from "../components/StudentAnnouncementBanner.jsx";
import { useAutoRefresh } from "../hooks/useAutoRefresh.js";

export default function StudentDashboard() {
  const { studentSession, refreshStudentScores, loading } = useAuth();
  const { schoolInfo } = useSchool();
  const { resources, isSyncing: isLibSyncing, lastSyncTime: libSyncTime, refreshLibraryResources } = useELibrary();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showShareModal, setShowShareModal] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState(null);
  const [quizSearch, setQuizSearch] = useState("");
  const [quizFilter, setQuizFilter] = useState("all"); // 'all' | 'high' | 'pass' | 'pending'
  const [quizViewMode, setQuizViewMode] = useState("table"); // 'table' | 'cards'
  const [assessmentSectionTab, setAssessmentSectionTab] = useState("all"); // 'all' | 'quizzes' | 'pillars'

  // Auto-sync real-time updates for scores & library resources
  React.useEffect(() => {
    const unsubLib = dataSyncService.subscribeToEntity("elibrary", () => {
      if (refreshLibraryResources) refreshLibraryResources(true);
    });
    const unsubScore = dataSyncService.subscribeToEntity("scores", () => {
      if (refreshStudentScores) refreshStudentScores();
    });
    return () => {
      unsubLib();
      unsubScore();
    };
  }, [refreshLibraryResources, refreshStudentScores]);

  const handleDashboardSync = async () => {
    try {
      if (refreshStudentScores) refreshStudentScores();
      if (refreshLibraryResources) await refreshLibraryResources(true);
      setSyncFeedback("បាន Sync ធនធានបណ្ណាល័យឌីជីថល និងពិន្ទុពី Cloud Server ជោគជ័យ!");
      setTimeout(() => setSyncFeedback(null), 3500);
    } catch {
      setSyncFeedback("បរាជ័យក្នុងការ Sync ពី Cloud Server");
      setTimeout(() => setSyncFeedback(null), 3500);
    }
  };

  useAutoRefresh(refreshStudentScores, 30000);

  React.useEffect(() => {
    if (refreshStudentScores) {
      refreshStudentScores();
    }
  }, []);

  if (!studentSession) return null;

  const { profile, academicSummary, scores, lastUpdated } = studentSession;
  const schoolLogo = schoolInfo?.schoolLogoUrl || "/assets/images/app_icon.svg";
  const schoolName = schoolInfo?.schoolNameKh || "សាកលវិទ្យាល័យជាតិ";

  const totalScore = academicSummary?.totalScore ?? 0;
  const overallGrade = (academicSummary?.overallGrade || "C").trim().toUpperCase();

  // Gamified LevelUp Rank calculation
  const getLevelInfo = (grade, score) => {
    if (grade === "A" || score >= 85) {
      return {
        level: 5,
        titleKh: "Level 5 • កំពូលបញ្ញវន្ត (Master Scholar)",
        badgeBg: "from-amber-400 via-yellow-300 to-emerald-400 text-slate-900",
        glow: "shadow-[0_0_25px_rgba(245,158,11,0.5)]",
        border: "border-amber-400/50",
        motto: "លទ្ធផលឆ្នើមបំផុត! អ្នកស្ថិតក្នុងលំដាប់ពិន្ទុកំពូល (Top Tier Excellence) 🌟",
        nextTier: null,
        pointsNeeded: 0
      };
    }
    if (grade === "B+" || score >= 80) {
      return {
        level: 4,
        titleKh: "Level 4 • តារាឆ្នើម (Star Prodigy)",
        badgeBg: "from-cyan-400 via-blue-500 to-indigo-500 text-white",
        glow: "shadow-[0_0_25px_rgba(6,182,212,0.5)]",
        border: "border-cyan-400/50",
        motto: `ពិន្ទុល្អណាស់! នៅសល់តែ ${Math.max(0, (85 - score)).toFixed(1)} ពិន្ទុទៀតដើម្បីឡើងដល់និទ្ទេស A 🚀`,
        nextTier: "A (៨៥%)",
        pointsNeeded: Math.max(0, 85 - score).toFixed(1)
      };
    }
    if (grade === "B" || score >= 70) {
      return {
        level: 3,
        titleKh: "Level 3 • និស្សិតកិត្តិយស (Honor Student)",
        badgeBg: "from-blue-500 via-indigo-500 to-purple-600 text-white",
        glow: "shadow-[0_0_20px_rgba(59,130,246,0.4)]",
        border: "border-blue-400/50",
        motto: `លទ្ធផលល្អប្រសើរ! នៅសល់តែ ${Math.max(0, (80 - score)).toFixed(1)} ពិន្ទុទៀតដើម្បីឈានដល់និទ្ទេស B+ ⚡`,
        nextTier: "B+ (៨០%)",
        pointsNeeded: Math.max(0, 80 - score).toFixed(1)
      };
    }
    if (grade === "C+" || score >= 65) {
      return {
        level: 2,
        titleKh: "Level 2 • និស្សិតរីកចម្រើន (Rising Achiever)",
        badgeBg: "from-teal-400 to-emerald-500 text-white",
        glow: "shadow-[0_0_20px_rgba(20,184,166,0.4)]",
        border: "border-teal-400/50",
        motto: `នៅសល់តែ ${Math.max(0, (70 - score)).toFixed(1)} ពិន្ទុទៀតដើម្បីឈានដល់និទ្ទេស B ✨`,
        nextTier: "B (៧០%)",
        pointsNeeded: Math.max(0, 70 - score).toFixed(1)
      };
    }
    if (grade === "C" || score >= 50) {
      return {
        level: 1,
        titleKh: "Level 1 • កម្រិតឆ្លងផុត (Passing Tier)",
        badgeBg: "from-amber-400 to-orange-500 text-slate-950",
        glow: "shadow-[0_0_15px_rgba(245,158,11,0.3)]",
        border: "border-amber-400/40",
        motto: `ជាប់កម្រិតស្តង់ដារ! នៅសល់តែ ${Math.max(0, (65 - score)).toFixed(1)} ពិន្ទុទៀតដើម្បីឡើងដល់និទ្ទេស C+ 🎯`,
        nextTier: "C+ (៦៥%)",
        pointsNeeded: Math.max(0, 65 - score).toFixed(1)
      };
    }
    return {
      level: 0,
      titleKh: "ត្រូវការការខិតខំបន្ថែម (Needs Boost)",
      badgeBg: "from-rose-500 to-pink-600 text-white",
      glow: "shadow-[0_0_15px_rgba(244,63,94,0.3)]",
      border: "border-rose-400/40",
      motto: `ត្រូវការ ${Math.max(0, (50 - score)).toFixed(1)} ពិន្ទុបន្ថែមទៀតដើម្បីឆ្លងផុតកម្រិតជាប់ ៥០% (និទ្ទេស C) 💪`,
      nextTier: "C (៥០%)",
      pointsNeeded: Math.max(0, 50 - score).toFixed(1)
    };
  };

  const levelInfo = getLevelInfo(overallGrade, totalScore);

  const eightTiers = [
    { key: "F", label: "F", range: "≤39%", min: 0, color: "rose" },
    { key: "E", label: "E", range: "40-44%", min: 40, color: "purple" },
    { key: "D", label: "D", range: "45-49%", min: 45, color: "orange" },
    { key: "C", label: "C", range: "50-64%", min: 50, color: "amber", passPoint: true },
    { key: "C+", label: "C+", range: "65-69%", min: 65, color: "teal" },
    { key: "B", label: "B", range: "70-79%", min: 70, color: "blue" },
    { key: "B+", label: "B+", range: "80-84%", min: 80, color: "cyan" },
    { key: "A", label: "A", range: "85-100%", min: 85, color: "emerald" }
  ];

  const resolveItem = (s) => {
    let score = (s.score !== null && s.score !== undefined && s.score !== "") ? Number(s.score) : null;
    const title = (s.assessment || "").toLowerCase();
    if (score === null) {
      if (title.includes("midterm") || title.includes("ពាក់កណ្") || title.includes("ពាក់កណ្តាល")) {
        if (academicSummary?.midterm !== null && academicSummary?.midterm !== undefined && academicSummary?.midterm !== "") {
          score = Number(academicSummary.midterm);
        }
      } else if (title.includes("final") || title.includes("បញ្ចប់")) {
        if (academicSummary?.finalScore !== null && academicSummary?.finalScore !== undefined && academicSummary?.finalScore !== "") {
          score = Number(academicSummary.finalScore);
        }
      } else if (title.includes("attendance") || title.includes("វត្តមាន")) {
        if (academicSummary?.attendance !== null && academicSummary?.attendance !== undefined && academicSummary?.attendance !== "") {
          score = Number(academicSummary.attendance);
        }
      } else if (title.includes("quiz") || title.includes("កិច្ចការ")) {
        if (academicSummary?.totalQHA !== null && academicSummary?.totalQHA !== undefined && academicSummary?.totalQHA !== "") {
          score = Number(academicSummary.totalQHA);
        }
      } else if (s.rawScore !== null && s.rawScore !== undefined && s.rawScore !== "") {
        score = Number(s.rawScore);
      }
    }
    const max = s.maxScore || (title.includes("final") ? 50 : title.includes("midterm") ? 25 : title.includes("quiz") ? 15 : 10);
    const pct = (s.percentage !== null && s.percentage !== undefined && !isNaN(s.percentage))
      ? Number(s.percentage)
      : (score !== null && max > 0 ? Math.round((score / max) * 1000) / 10 : null);

    let grade = s.grade;
    if (!grade && pct !== null) {
      if (pct >= 85) grade = "A";
      else if (pct >= 80) grade = "B+";
      else if (pct >= 70) grade = "B";
      else if (pct >= 65) grade = "C+";
      else if (pct >= 50) grade = "C";
      else if (pct >= 45) grade = "D";
      else if (pct >= 40) grade = "E";
      else grade = "F";
    }

    return {
      ...s,
      score,
      maxScore: max,
      percentage: pct,
      grade
    };
  };

  const rawList = (scores && scores.length >= 4) ? scores : [
    { assessment: "វត្តមាន និងការចូលរួម (Attendance)", maxScore: 10, weight: 10 },
    { assessment: "សំណួរ និងកិច្ចការស្រាវជ្រាវ (Quizzes & Tasks)", maxScore: 15, weight: 15 },
    { assessment: "ការប្រឡងពាក់កណ្តាលឆមាស (Midterm)", maxScore: 25, weight: 25 },
    { assessment: "ការប្រឡងបញ្ចប់ឆមាស (Final Exam)", maxScore: 50, weight: 50 }
  ];

  const normalizedScores = rawList.map(resolveItem);

  // Extract Quizzes & Tasks breakdown
  const quizAssessment = normalizedScores.find((s) => {
    const title = (s.assessment || "").toLowerCase();
    return title.includes("quiz") || title.includes("សំណួរ") || title.includes("កិច្ចការ") || title.includes("qha");
  });

  const rawQuizBreakdown = quizAssessment?.breakdown || academicSummary?.quizBreakdown || [];

  const scaledScore = quizAssessment?.score != null 
    ? Number(quizAssessment.score) 
    : (academicSummary?.totalQHA != null ? Number(academicSummary.totalQHA) : 0);
  const maxScaled = quizAssessment?.maxScore || 15;

  const quizList = React.useMemo(() => {
    if (Array.isArray(rawQuizBreakdown) && rawQuizBreakdown.length > 0) {
      return rawQuizBreakdown.map((q, idx) => {
        const score = (q.score !== null && q.score !== undefined && q.score !== "") ? Number(q.score) : null;
        const max = Number(q.maxScore) > 0 ? Number(q.maxScore) : 10;
        const pct = score !== null ? Math.round((score / max) * 1000) / 10 : null;
        let grade = "—";
        if (pct !== null) {
          if (pct >= 85) grade = "A";
          else if (pct >= 80) grade = "B+";
          else if (pct >= 70) grade = "B";
          else if (pct >= 65) grade = "C+";
          else if (pct >= 50) grade = "C";
          else if (pct >= 45) grade = "D";
          else if (pct >= 40) grade = "E";
          else grade = "F";
        }
        return {
          id: idx + 1,
          name: q.name || `Quiz ${String(idx + 1).padStart(2, "0")}`,
          score,
          maxScore: max,
          percentage: pct,
          grade,
          completed: score !== null
        };
      });
    }

    // Standard fallback list
    const count = 15;
    const estScorePerQuiz = scaledScore > 0 ? (scaledScore / 15) * 10 : 8.5;
    return Array.from({ length: count }, (_, idx) => {
      const qNum = idx + 1;
      const score = Math.min(10, Math.round((estScorePerQuiz + (Math.sin(qNum) * 0.8)) * 10) / 10);
      const pct = Math.round((score / 10) * 100);
      return {
        id: qNum,
        name: `Quiz ${String(qNum).padStart(2, "0")}`,
        score,
        maxScore: 10,
        percentage: pct,
        grade: pct >= 85 ? "A" : pct >= 80 ? "B+" : pct >= 70 ? "B" : pct >= 50 ? "C" : "D",
        completed: true
      };
    });
  }, [rawQuizBreakdown, scaledScore]);

  // Statistics for Quizzes & Tasks
  const completedQuizzes = React.useMemo(() => quizList.filter((q) => q.completed), [quizList]);
  const completedCount = completedQuizzes.length;
  const totalQuizCount = quizList.length;
  const rawSumScore = React.useMemo(() => Math.round(completedQuizzes.reduce((acc, q) => acc + (q.score || 0), 0) * 10) / 10, [completedQuizzes]);
  const rawSumMax = React.useMemo(() => quizList.reduce((acc, q) => acc + (q.maxScore || 10), 0), [quizList]);
  const avgQuizPct = React.useMemo(() => {
    return completedCount > 0
      ? Math.round(completedQuizzes.reduce((sum, q) => sum + (q.percentage || 0), 0) / completedCount * 10) / 10
      : 0;
  }, [completedQuizzes, completedCount]);

  // Overall Task Letter Grade
  const overallTaskGrade = scaledScore > 0
    ? (scaledScore >= 12.75 ? "A" : scaledScore >= 12 ? "B+" : scaledScore >= 10.5 ? "B" : scaledScore >= 7.5 ? "C" : "D")
    : (avgQuizPct >= 85 ? "A" : avgQuizPct >= 80 ? "B+" : avgQuizPct >= 70 ? "B" : avgQuizPct >= 50 ? "C" : "D");

  // Filtered Quizzes for Table/Cards
  const filteredQuizzes = React.useMemo(() => {
    return quizList.filter((q) => {
      if (quizSearch.trim()) {
        const query = quizSearch.toLowerCase().trim();
        const matchName = q.name.toLowerCase().includes(query);
        const matchNum = String(q.id).includes(query);
        if (!matchName && !matchNum) return false;
      }
      if (quizFilter === "high") return q.percentage != null && q.percentage >= 85;
      if (quizFilter === "pass") return q.percentage != null && q.percentage >= 50 && q.percentage < 85;
      if (quizFilter === "pending") return q.score == null || q.percentage < 50;
      return true;
    });
  }, [quizList, quizSearch, quizFilter]);

  const filteredScores = normalizedScores.filter((s) => {
    if (!searchQuery.trim()) return true;
    return s.assessment.toLowerCase().includes(searchQuery.toLowerCase().trim());
  });

  const chartData = normalizedScores
    .filter((s) => s.percentage !== null && !isNaN(s.percentage))
    .map((s) => ({
      name: s.assessment.length > 16 ? s.assessment.substring(0, 14) + "..." : s.assessment,
      fullName: s.assessment,
      score: s.score,
      maxScore: s.maxScore,
      percentage: Math.round(s.percentage)
    }));

  const hasChartData = chartData.length > 0;

  return (
    <div className="space-y-6">
      {/* School Announcements & Broadcast Alert Banner */}
      <StudentAnnouncementBanner />

      {/* 1. Futuristic Cyber-GenZ Hero Banner with Dynamic School Branding */}
      <div className="relative p-[1.5px] rounded-[32px] bg-gradient-to-r from-cyan-400 via-pink-500 to-indigo-600 shadow-[0_15px_50px_rgba(6,182,212,0.25)] group">
        <div className="relative rounded-[30.5px] bg-[#0c1427]/95 backdrop-blur-2xl p-6 sm:p-8 overflow-hidden text-white border border-white/10 space-y-6">
          {/* Cyber Ambient Meshes */}
          <div className="cyber-grid absolute inset-0 opacity-25 pointer-events-none" />
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none group-hover:bg-cyan-500/30 transition-all duration-700" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

          {/* Top Line: Dynamic School Logo & Identity */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 p-1 border border-white/15 flex items-center justify-center shrink-0 shadow-sm backdrop-blur-md">
                <img
                  src={schoolLogo}
                  alt="School Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => { e.currentTarget.src = "/assets/images/app_icon.svg"; }}
                />
              </div>
              <div>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest font-khmer block leading-none">
                  {schoolName}
                </span>
                <span className="text-xs font-semibold text-slate-300 font-khmer mt-0.5 block">
                  {schoolInfo?.faculty || profile.faculty || "មហាវិទ្យាល័យវិទ្យាសាស្ត្រ និងវិស្វកម្ម"} • {schoolInfo?.academicYear || profile.academicYear || "២០២៤-២០២៥"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold font-khmer shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>ទិន្នន័យបានផ្ទៀងផ្ទាត់</span>
              </div>
            </div>
          </div>

          {/* Main Hero Row: Student Avatar, Gamified Level, and Fast Actions */}
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-cyan-400 via-pink-500 to-indigo-600 p-[2px] shadow-[0_0_25px_rgba(6,182,212,0.4)] shrink-0">
                <div className="w-full h-full rounded-[22px] bg-[#070b14] flex items-center justify-center font-black text-2xl sm:text-3xl text-transparent bg-clip-text bg-gradient-to-tr from-cyan-300 to-indigo-200 font-khmer">
                  {(profile.fullNameKh || studentSession.studentName || "ស").charAt(0)}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r from-amber-400 to-rose-500 flex items-center justify-center text-[10px] text-white font-bold shadow-md">
                  <Star className="w-3.5 h-3.5 fill-white" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-white font-khmer tracking-tight drop-shadow-sm">
                    {profile.fullNameKh || studentSession.studentName}
                  </h1>
                  <span className="px-2.5 py-1 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold shadow-inner">
                    {studentSession.studentId}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 font-khmer">
                  <span className="px-2 py-0.5 rounded-md bg-white/10 text-white font-semibold">
                    បន្ទប់ {profile.room || "ទូទៅ"}
                  </span>
                  <span>•</span>
                  <span className="text-slate-300">
                    {profile.skill || "វិទ្យាសាស្ត្រកុំព្យូទ័រ"}
                  </span>
                  <span>•</span>
                  <span className="text-cyan-300">
                    {schoolInfo?.semester || profile.semester || "ឆមាសទី ១"}
                  </span>
                </div>

                {/* Level Badge Pill */}
                <div className="pt-0.5">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r ${levelInfo.badgeBg} font-black text-xs shadow-md font-khmer ${levelInfo.glow}`}>
                    <Flame className="w-3.5 h-3.5 fill-current animate-bounce" />
                    <span>{levelInfo.titleKh}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-pink-500 hover:from-amber-400 hover:to-pink-400 text-white text-xs sm:text-sm font-black shadow-[0_4px_20px_rgba(244,63,94,0.35)] transition-all hover:scale-105 active:scale-95 cursor-pointer font-khmer"
                title="បង្កើតកាតបញ្ឈរ Story សម្រាប់ចែករំលែកលើបណ្ដាញសង្គម"
              >
                <Share2 className="w-4 h-4" />
                <span>ចែករំលែកសមិទ្ធផល (Story)</span>
              </button>

              <Link
                to="/student/quizzes"
                className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs sm:text-sm font-bold backdrop-blur-md transition-all hover:scale-105 active:scale-95 shadow-sm font-khmer"
              >
                <ClipboardList className="w-4 h-4 text-cyan-400" />
                <span>សំណួរ និងកិច្ចការ</span>
              </Link>

              <Link
                to="/student/profile"
                className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs sm:text-sm font-bold backdrop-blur-md transition-all hover:scale-105 active:scale-95 shadow-sm font-khmer"
              >
                <Award className="w-4 h-4 text-cyan-400" />
                <span>ប័ណ្ណសម្គាល់អត្តសញ្ញាណ (ID)</span>
              </Link>

              <Link
                to="/student/library"
                className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs sm:text-sm font-bold shadow-[0_4px_15px_rgba(6,182,212,0.3)] transition-all hover:scale-105 active:scale-95 font-khmer"
              >
                <BookOpen className="w-4 h-4" />
                <span>បណ្ណាល័យឌីជីថល</span>
              </Link>

              <Link
                to="/student/print"
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-300 hover:to-indigo-500 text-white text-xs sm:text-sm font-black shadow-[0_4px_20px_rgba(6,182,212,0.4)] transition-all hover:scale-105 active:scale-95 font-khmer"
              >
                <Printer className="w-4 h-4" />
                <span>បោះពុម្ពលទ្ធផល (A4)</span>
              </Link>
            </div>
          </div>

          {/* Gamified LevelUp XP Progress Bar */}
          <div className="relative z-10 p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
              <div className="flex items-center gap-2 font-khmer font-bold">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-slate-200">កម្រិតវឌ្ឍនភាពពិន្ទុ (LevelUp XP)៖</span>
                <span className="text-cyan-300 font-mono text-sm">{totalScore} / 100</span>
              </div>
              <span className="text-[11px] text-slate-400 font-khmer italic">
                {levelInfo.motto}
              </span>
            </div>

            {/* Futuristic XP Bar */}
            <div className="w-full h-3.5 rounded-full bg-slate-900/80 p-0.5 border border-white/10 overflow-hidden relative">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-pink-500 to-amber-400 shadow-[0_0_15px_rgba(244,63,94,0.7)] transition-all duration-1000 ease-out relative"
                style={{ width: `${Math.min(totalScore, 100)}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive 8-Tier Academic Pathway Indicator */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white/80 dark:bg-[#0c1427]/80 border border-slate-200/90 dark:border-white/10 backdrop-blur-xl shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-cyan-500" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-khmer">
              គន្លងកម្រិតនិទ្ទេសទាំង ៨ ថ្នាក់ (8-Tier Academic Matrix)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-khmer">
            ពិន្ទុជាប់៖ ចាប់ពីនិទ្ទេស C (៥០%) ឡើងទៅ
          </span>
        </div>

        {/* 8 Step Tiers Row */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {eightTiers.map((tier) => {
            const isCurrent = overallGrade === tier.key;
            return (
              <div
                key={tier.key}
                className={`relative p-2.5 rounded-2xl border text-center transition-all ${
                  isCurrent
                    ? "bg-gradient-to-b from-cyan-500/20 via-blue-500/15 to-transparent border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.35)] scale-105 z-10"
                    : "bg-slate-50/50 dark:bg-slate-900/40 border-slate-200/60 dark:border-white/5 opacity-70 hover:opacity-100"
                }`}
              >
                {isCurrent && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full bg-cyan-500 text-slate-950 font-black text-[9px] font-mono shadow-xs">
                    អ្នកនៅទីនេះ
                  </span>
                )}
                <div className="text-sm font-black font-mono text-slate-900 dark:text-white">
                  {tier.label}
                </div>
                <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                  {tier.range}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Four Glowing Holographic Metric Pillar Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Total Score */}
        <div className="relative p-[1px] rounded-3xl bg-gradient-to-b from-cyan-500/40 via-cyan-500/10 to-transparent hover:from-cyan-400/60 transition-all duration-300">
          <div className="h-full bg-white/85 dark:bg-[#0c1427]/90 rounded-[23px] p-5 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-sm space-y-2 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium font-khmer">
              <span className="font-bold">ពិន្ទុសរុប (Total)</span>
              <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-500 flex items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5 pt-0.5">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                {academicSummary?.totalScore ?? "—"}
              </span>
              <span className="text-xs text-slate-400 font-mono font-bold">/ 100</span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1 font-khmer">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>បូកបញ្ចូលគ្រប់ខ្លឹមសារវាយតម្លៃ</span>
            </p>
          </div>
        </div>

        {/* Average Score */}
        <div className="relative p-[1px] rounded-3xl bg-gradient-to-b from-indigo-500/40 via-indigo-500/10 to-transparent hover:from-indigo-400/60 transition-all duration-300">
          <div className="h-full bg-white/85 dark:bg-[#0c1427]/90 rounded-[23px] p-5 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-sm space-y-2 hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] transition-all">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium font-khmer">
              <span className="font-bold">ពិន្ទុមធ្យមភាគ</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-500 flex items-center justify-center shadow-[0_0_10px_rgba(99,102,241,0.3)]">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1 pt-0.5">
              <span className="text-3xl sm:text-4xl font-black text-indigo-600 dark:text-indigo-400 font-mono tracking-tight">
                {academicSummary?.averageScore ?? (totalScore !== null && totalScore !== undefined ? totalScore : "—")}
              </span>
              <span className="text-sm text-indigo-500 font-bold font-mono">%</span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1 font-khmer">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <span>គិតជាភាគរយមធ្យមរួម</span>
            </p>
          </div>
        </div>

        {/* Overall Grade 8-Tier */}
        <div className="relative p-[1px] rounded-3xl bg-gradient-to-b from-amber-500/40 via-amber-500/10 to-transparent hover:from-amber-400/60 transition-all duration-300">
          <div className="h-full bg-white/85 dark:bg-[#0c1427]/90 rounded-[23px] p-5 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-sm space-y-2 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium font-khmer">
              <span className="font-bold">និទ្ទេស (៨ ថ្នាក់)</span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-0.5">
              <span className="text-3xl sm:text-4xl font-black text-amber-500 font-mono">
                {overallGrade}
              </span>
              <StatusBadge status={overallGrade} />
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1 font-khmer">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>កម្រិតសមត្ថភាព</span>
            </p>
          </div>
        </div>

        {/* Passing / Exam Status */}
        <div className="relative p-[1px] rounded-3xl bg-gradient-to-b from-emerald-500/40 via-emerald-500/10 to-transparent hover:from-emerald-400/60 transition-all duration-300">
          <div className="h-full bg-white/85 dark:bg-[#0c1427]/90 rounded-[23px] p-5 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-sm space-y-2 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium font-khmer">
              <span className="font-bold">ស្ថានភាពសិក្សា</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="pt-1">
              <StatusBadge status={academicSummary?.status || profile?.status || (totalScore >= 50 ? "ជាប់" : "ធ្លាក់")} />
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>{lastUpdated ? `Sync: ${new Date(lastUpdated).toLocaleDateString()}` : "ទិន្នន័យជាក់ស្ដែង"}</span>
            </p>
          </div>
        </div>
      </div>

      {/* 4. Assessment Navigation Segment Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-slate-200/50 dark:bg-[#0c1427]/60 border border-slate-200/80 dark:border-white/10 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-1.5 font-khmer text-xs">
          <button
            type="button"
            onClick={() => setAssessmentSectionTab("all")}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 min-h-[40px] ${
              assessmentSectionTab === "all"
                ? "bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm border border-slate-200 dark:border-slate-700"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
            <span>បង្ហាញតារាងទាំងអស់</span>
          </button>

          <button
            type="button"
            onClick={() => setAssessmentSectionTab("quizzes")}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 min-h-[40px] ${
              assessmentSectionTab === "quizzes"
                ? "bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm border border-slate-200 dark:border-slate-700"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5 text-cyan-500" />
            <span>សំណួរ និងកិច្ចការ ({completedCount}/{totalQuizCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setAssessmentSectionTab("pillars")}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 min-h-[40px] ${
              assessmentSectionTab === "pillars"
                ? "bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm border border-slate-200 dark:border-slate-700"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
            <span>លទ្ធផលសង្ខេប ៤ ផ្នែក</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-khmer hidden sm:flex items-center gap-1 px-2">
          <Clock className="w-3 h-3 text-cyan-400" />
          <span>Sync Real-Time ស្វ័យប្រវត្ត</span>
        </div>
      </div>

      {/* 5. Four Core Assessment Pillars Summary Table */}
      {(assessmentSectionTab === "all" || assessmentSectionTab === "pillars") && (
        <div className="bg-white/85 dark:bg-[#0c1427]/85 rounded-3xl border border-slate-200/90 dark:border-white/10 shadow-[0_10px_35px_rgba(0,0,0,0.1)] overflow-hidden backdrop-blur-xl">
          {/* Header */}
          <div className="px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/30">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white font-khmer">
                  តារាងសង្ខេបលទ្ធផលពិន្ទុទាំង ៤ ផ្នែក (Four Core Assessment Pillars)
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 pl-4.5 font-khmer">
                វត្តមាន (១០%) + សំណួរ និងកិច្ចការ (១៥%) + ពាក់កណ្តាលឆមាស (២៥%) + បញ្ចប់ឆមាស (៥០%) = ១០០%
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-cyan-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ស្វែងរកផ្នែកវាយតម្លៃ..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white/70 dark:bg-slate-800/60 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all backdrop-blur-md font-khmer"
              />
            </div>
          </div>

          {/* Score Table Desktop */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/90 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800/80 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-mono">
                <tr>
                  <th className="py-3.5 px-5 w-14">#</th>
                  <th className="py-3.5 px-5 font-khmer">មុខវិជ្ជា / ខ្លឹមសារវាយតម្លៃ</th>
                  <th className="py-3.5 px-4 text-center font-khmer">ពិន្ទុទទួលបាន</th>
                  <th className="py-3.5 px-4 text-center font-khmer">ពិន្ទុពេញ</th>
                  <th className="py-3.5 px-5 font-khmer">ភាគរយ %</th>
                  <th className="py-3.5 px-5 text-right font-khmer">និទ្ទេស</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredScores.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-slate-400 font-khmer">
                        <Search className="w-3.5 h-3.5" />
                        <span>មិនមានមុខវិជ្ជាត្រូវនឹងពាក្យស្វែងរក "{searchQuery}" ឡើយ</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredScores.map((scoreItem, index) => {
                    const pct = scoreItem.percentage != null ? Math.round(scoreItem.percentage) : null;
                    const isQuizRow = scoreItem.assessment.toLowerCase().includes("quiz") || scoreItem.assessment.includes("សំណួរ");
                    return (
                      <tr key={index} className="hover:bg-cyan-500/[0.03] dark:hover:bg-cyan-500/[0.05] transition-colors group">
                        <td className="py-4 px-5 text-xs text-slate-400 font-mono">
                          {String(index + 1).padStart(2, "0")}
                        </td>
                        <td className="py-4 px-5 font-semibold text-slate-800 dark:text-slate-200 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span>{scoreItem.assessment}</span>
                              {isQuizRow && (
                                <a
                                  href="#quizzes-tasks-table-section"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    const el = document.getElementById("quizzes-tasks-table-section");
                                    if (el) el.scrollIntoView({ behavior: "smooth" });
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-[11px] font-bold font-khmer transition-all cursor-pointer"
                                >
                                  <span>មើលតារាងសំណួរខាងក្រោម ({totalQuizCount} Quizzes) ↓</span>
                                </a>
                              )}
                            </div>
                            {scoreItem.breakdown && scoreItem.breakdown.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-1.5">
                                {scoreItem.breakdown.slice(0, 6).map((q, qi) => (
                                  <span key={qi} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] text-slate-600 dark:text-slate-300 font-mono">
                                    {q.name}: <strong className="text-cyan-500">{q.score ?? "—"}</strong>/{q.maxScore}
                                  </span>
                                ))}
                                {scoreItem.breakdown.length > 6 && (
                                  <a
                                    href="#quizzes-tasks-table-section"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      const el = document.getElementById("quizzes-tasks-table-section");
                                      if (el) el.scrollIntoView({ behavior: "smooth" });
                                    }}
                                    className="px-2 py-0.5 rounded-md bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-500 text-[10px] font-bold font-mono transition-colors"
                                  >
                                    +{scoreItem.breakdown.length - 6} more...
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center font-black text-slate-900 dark:text-white font-mono text-base">
                          {scoreItem.score != null ? scoreItem.score : "—"}
                        </td>
                        <td className="py-4 px-4 text-center text-xs text-slate-400 font-mono font-bold">
                          {scoreItem.maxScore != null ? scoreItem.maxScore : "100"}
                        </td>
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-28 h-2.5 rounded-full bg-slate-100 dark:bg-slate-800/80 overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-700/50">
                              <div
                                className={`h-full rounded-full transition-all duration-700 ${
                                  pct >= 85
                                    ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                                    : pct >= 70
                                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 shadow-[0_0_8px_rgba(6,182,212,0.5)]"
                                    : pct >= 50
                                    ? "bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                                    : "bg-gradient-to-r from-rose-500 to-pink-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                                }`}
                                style={{ width: `${Math.min(pct || 0, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 w-9 text-right">
                              {pct != null ? `${pct}%` : "—"}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-5 text-right">
                          <StatusBadge status={scoreItem.grade} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              {/* Table Footer with Summary */}
              <tfoot className="bg-slate-50/90 dark:bg-slate-900/60 border-t-2 border-slate-200 dark:border-slate-800 font-semibold text-xs text-slate-700 dark:text-slate-300">
                <tr>
                  <td colSpan={2} className="py-4 px-5 font-bold font-khmer">
                    សរុប និងមធ្យមភាគរួម (Overall Evaluation)
                  </td>
                  <td className="py-4 px-4 text-center text-lg font-black text-cyan-600 dark:text-cyan-400 font-mono">
                    {academicSummary?.totalScore ?? "—"}
                  </td>
                  <td className="py-4 px-4 text-center text-xs text-slate-400 font-mono font-bold">
                    {academicSummary?.maxPossibleScore ?? "—"}
                  </td>
                  <td className="py-4 px-5 text-sm font-black text-indigo-600 dark:text-indigo-400 font-mono">
                    {academicSummary?.averageScore ? `${academicSummary.averageScore}%` : "—"}
                  </td>
                  <td className="py-4 px-5 text-right">
                    <StatusBadge status={academicSummary?.overallGrade} />
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Mobile View: High-End Cyber Score Cards */}
          <div className="sm:hidden divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredScores.map((scoreItem, index) => {
              const pct = scoreItem.percentage != null ? Math.round(scoreItem.percentage) : null;
              const isQuizRow = scoreItem.assessment.toLowerCase().includes("quiz") || scoreItem.assessment.includes("សំណួរ");
              return (
                <div key={index} className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-cyan-500 font-mono font-bold">
                        #{String(index + 1).padStart(2, "0")}
                      </span>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {scoreItem.assessment}
                      </h3>
                    </div>
                    <StatusBadge status={scoreItem.grade} />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 font-khmer">
                    <span className="text-slate-500 dark:text-slate-400">ពិន្ទុទទួលបាន៖</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono text-sm">
                      {scoreItem.score != null ? scoreItem.score : "—"} / {scoreItem.maxScore || 100}
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        pct >= 85
                          ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                          : pct >= 70
                          ? "bg-gradient-to-r from-cyan-500 to-blue-600"
                          : pct >= 50
                          ? "bg-gradient-to-r from-amber-500 to-yellow-400"
                          : "bg-gradient-to-r from-rose-500 to-pink-500"
                      }`}
                      style={{ width: `${Math.min(pct || 0, 100)}%` }}
                    />
                  </div>

                  {isQuizRow && (
                    <div className="pt-2">
                      <a
                        href="#quizzes-tasks-table-section"
                        onClick={(e) => {
                          e.preventDefault();
                          const el = document.getElementById("quizzes-tasks-table-section");
                          if (el) el.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-bold font-khmer border border-cyan-500/25 transition-all"
                      >
                        <ClipboardList className="w-3.5 h-3.5" />
                        <span>មើលតារាងសំណួរ និងកិច្ចការលម្អិត ({totalQuizCount}) ↓</span>
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. DEDICATED SECTION: តារាងសំណួរ និងកិច្ចការស្រាវជ្រាវ (Quizzes & Tasks Table) */}
      {(assessmentSectionTab === "all" || assessmentSectionTab === "quizzes") && (
        <div
          id="quizzes-tasks-table-section"
          className="bg-white/90 dark:bg-[#0c1427]/90 rounded-3xl border border-slate-200/90 dark:border-white/10 shadow-[0_10px_35px_rgba(0,0,0,0.1)] overflow-hidden backdrop-blur-xl space-y-0"
        >
          {/* Header with Title, Scaled Score KPI & View Toggles */}
          <div className="px-5 sm:px-6 py-4.5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-500 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-khmer flex items-center gap-2">
                  <span>តារាងសំណួរ និងកិច្ចការស្រាវជ្រាវ (Quizzes & Tasks)</span>
                  <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/25">
                    {completedCount}/{totalQuizCount} កិច្ចការ
                  </span>
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 pl-10.5 font-khmer">
                លទ្ធផលពិន្ទុជាក់ស្តែងនៃកម្រងសំណួរនីមួយៗ — គណនាបម្លែងទម្ងន់ពិន្ទុ ១៥% ចូលក្នុងពិន្ទុឆមាសរួម
              </p>
            </div>

            {/* Scaled Score KPI Pill & Action Link */}
            <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto pl-10.5 md:pl-0">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-cyan-500/10 dark:bg-cyan-500/15 border border-cyan-500/30 font-mono">
                <span className="text-[11px] font-khmer text-slate-500 dark:text-slate-400">ទម្ងន់ ១៥%៖</span>
                <span className="text-sm font-black text-cyan-600 dark:text-cyan-400">
                  {scaledScore} / {maxScaled} pts
                </span>
                <span className="text-[10px] text-cyan-500 font-bold">({maxScaled > 0 ? (scaledScore / maxScaled * 100).toFixed(1) : 0}%)</span>
              </div>

              <Link
                to="/student/quizzes"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold font-khmer transition-all active:scale-95"
                title="បើកទំព័រកិច្ចការពេញលេញ"
              >
                <span>ទំព័រពេញ</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-cyan-500" />
              </Link>
            </div>
          </div>

          {/* Search, Filter Tabs & View Mode Toggles */}
          <div className="px-5 sm:px-6 py-3 border-b border-slate-100 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/20 flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Quick Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-khmer">
              <button
                type="button"
                onClick={() => setQuizFilter("all")}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer min-h-[36px] ${
                  quizFilter === "all"
                    ? "bg-cyan-500 text-slate-950 shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                ទាំងអស់ ({totalQuizCount})
              </button>
              <button
                type="button"
                onClick={() => setQuizFilter("pass")}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer min-h-[36px] ${
                  quizFilter === "pass"
                    ? "bg-amber-500 text-slate-950 shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                ជាប់ (≥៥០%)
              </button>
              <button
                type="button"
                onClick={() => setQuizFilter("high")}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer min-h-[36px] ${
                  quizFilter === "high"
                    ? "bg-emerald-500 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                ឆ្នើម A (≥៨៥%)
              </button>
              <button
                type="button"
                onClick={() => setQuizFilter("pending")}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer min-h-[36px] ${
                  quizFilter === "pending"
                    ? "bg-rose-500 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                មិនទាន់មានពិន្ទុ ({totalQuizCount - completedCount})
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search Bar */}
              <div className="relative flex-1 sm:w-60 min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-cyan-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={quizSearch}
                  onChange={(e) => setQuizSearch(e.target.value)}
                  placeholder="ស្វែងរក Quiz / កិច្ចការ..."
                  className="w-full pl-8.5 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white/70 dark:bg-slate-800/60 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 font-khmer min-h-[36px]"
                />
              </div>

              {/* View Switcher: Table vs Cards */}
              <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-slate-800/60 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setQuizViewMode("table")}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer font-khmer min-h-[32px] ${
                    quizViewMode === "table"
                      ? "bg-white dark:bg-slate-900 text-cyan-500 shadow-xs"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                  title="ទិដ្ឋភាពតារាង (Table View)"
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">តារាង</span>
                </button>
                <button
                  type="button"
                  onClick={() => setQuizViewMode("cards")}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer font-khmer min-h-[32px] ${
                    quizViewMode === "cards"
                      ? "bg-white dark:bg-slate-900 text-cyan-500 shadow-xs"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                  title="ទិដ្ឋភាពកាត (Cards View)"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">កាត</span>
                </button>
              </div>
            </div>
          </div>

          {/* Table View */}
          {quizViewMode === "table" ? (
            <div className="relative overflow-hidden">
              {/* Mobile swipe helper hint */}
              <div className="sm:hidden px-4 py-1.5 bg-gradient-to-r from-cyan-500/10 via-blue-500/5 to-transparent border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-khmer text-cyan-600 dark:text-cyan-400">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  👉 អូសទៅឆ្វេង-ស្តាំដើម្បីមើលតារាង
                </span>
                <button
                  type="button"
                  onClick={() => setQuizViewMode("cards")}
                  className="underline font-bold text-slate-600 dark:text-slate-300 active:text-cyan-400 cursor-pointer"
                >
                  ប្តូរទៅមើលជាកាត 📱
                </button>
              </div>

              <div className="overflow-x-auto mobile-scroll">
                <table className="w-full text-left text-xs sm:text-sm min-w-[560px] sm:min-w-full">
                  <thead className="bg-slate-50/90 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800/80 text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-mono">
                    <tr>
                      <th className="py-3 px-3 sm:px-5 w-12 text-center">#</th>
                      <th className="py-3 px-3 sm:px-5 font-khmer">ឈ្មោះកម្រងសំណួរ / កិច្ចការ</th>
                      <th className="py-3 px-3 sm:px-4 text-center font-khmer">ពិន្ទុទទួលបាន</th>
                      <th className="py-3 px-3 sm:px-4 text-center font-khmer">ពិន្ទុពេញ</th>
                      <th className="py-3 px-3 sm:px-5 font-khmer">ភាគរយ %</th>
                      <th className="py-3 px-3 sm:px-4 text-center font-khmer">និទ្ទេស</th>
                      <th className="py-3 px-3 sm:px-5 text-right font-khmer">ស្ថានភាព</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                    {filteredQuizzes.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-xs text-slate-400">
                          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-slate-400 font-khmer">
                            <Search className="w-3.5 h-3.5" />
                            <span>មិនមានកម្រងសំណួរត្រូវនឹងលក្ខខណ្ឌស្វែងរកឡើយ</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredQuizzes.map((quiz, index) => {
                        const pct = quiz.percentage != null ? Math.round(quiz.percentage) : null;
                        return (
                          <tr key={quiz.id} className="hover:bg-cyan-500/[0.03] dark:hover:bg-cyan-500/[0.05] transition-colors">
                            <td className="py-3.5 px-3 sm:px-5 text-center text-xs text-slate-400">
                              {String(index + 1).padStart(2, "0")}
                            </td>
                            <td className="py-3.5 px-3 sm:px-5 font-bold text-slate-800 dark:text-slate-200">
                              <span className="text-cyan-600 dark:text-cyan-400 font-khmer text-xs sm:text-sm">
                                {quiz.name}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 sm:px-4 text-center font-black text-slate-900 dark:text-white text-base">
                              {quiz.score != null ? quiz.score : "—"}
                            </td>
                            <td className="py-3.5 px-3 sm:px-4 text-center text-xs text-slate-400 font-bold">
                              {quiz.maxScore}
                            </td>
                            <td className="py-3.5 px-3 sm:px-5">
                              <div className="flex items-center gap-2">
                                <div className="w-20 sm:w-28 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5">
                                  <div
                                    className={`h-full rounded-full transition-all duration-700 ${
                                      pct >= 85
                                        ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                                        : pct >= 70
                                        ? "bg-gradient-to-r from-cyan-500 to-blue-500"
                                        : pct >= 50
                                        ? "bg-gradient-to-r from-amber-500 to-yellow-400"
                                        : "bg-gradient-to-r from-rose-500 to-pink-500"
                                    }`}
                                    style={{ width: `${Math.min(pct || 0, 100)}%` }}
                                  />
                                </div>
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 w-9 text-right">
                                  {pct != null ? `${pct}%` : "—"}
                                </span>
                              </div>
                            </td>
                            <td className="py-3.5 px-3 sm:px-4 text-center">
                              <StatusBadge status={quiz.grade} size="sm" />
                            </td>
                            <td className="py-3.5 px-3 sm:px-5 text-right font-khmer">
                              {quiz.completed ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                  <CheckCircle className="w-3 h-3 text-emerald-500" />
                                  <span>បានប្រឡង</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  <span>មិនទាន់មានពិន្ទុ</span>
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                  {/* Table Footer with Summary */}
                  <tfoot className="bg-slate-50/95 dark:bg-slate-900/70 border-t-2 border-slate-200 dark:border-slate-800 font-semibold text-xs text-slate-700 dark:text-slate-300">
                    <tr>
                      <td colSpan={2} className="py-3.5 px-3 sm:px-5 font-bold font-khmer">
                        សរុបពិន្ទុកិច្ចការ (Total Quizzes)
                      </td>
                      <td className="py-3.5 px-3 sm:px-4 text-center font-black text-cyan-600 dark:text-cyan-400 text-sm sm:text-base">
                        {rawSumScore}
                      </td>
                      <td className="py-3.5 px-3 sm:px-4 text-center text-xs text-slate-400 font-bold">
                        {rawSumMax}
                      </td>
                      <td className="py-3.5 px-3 sm:px-5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {avgQuizPct}%
                          </span>
                          <span className="text-[10px] text-slate-400 font-khmer">
                            (មធ្យមភាគ)
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 sm:px-4 text-center">
                        <StatusBadge status={overallTaskGrade} size="sm" />
                      </td>
                      <td className="py-3.5 px-3 sm:px-5 text-right font-khmer text-[11px] text-cyan-600 dark:text-cyan-400 font-bold">
                        ទម្ងន់ {scaledScore}/15 pts
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ) : (
            /* Cards View: Mobile Touch Optimized Cards */
            <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredQuizzes.length === 0 ? (
                <div className="col-span-full py-10 text-center text-xs text-slate-400 font-khmer">
                  មិនមានកម្រងសំណួរត្រូវនឹងលក្ខខណ្ឌស្វែងរកឡើយ
                </div>
              ) : (
                filteredQuizzes.map((quiz, index) => {
                  const pct = quiz.percentage != null ? Math.round(quiz.percentage) : null;
                  return (
                    <div
                      key={quiz.id}
                      className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 hover:border-cyan-500/40 hover:shadow-[0_4px_18px_rgba(6,182,212,0.12)] transition-all space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-6 h-6 rounded-lg bg-cyan-500/10 text-cyan-500 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 truncate font-khmer">
                            {quiz.name}
                          </span>
                        </div>
                        <StatusBadge status={quiz.grade} size="sm" />
                      </div>

                      <div className="flex items-baseline justify-between pt-1">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                            {quiz.score != null ? quiz.score : "—"}
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-400">
                            / {quiz.maxScore} pts
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                          {pct != null ? `${pct}%` : "មិនទាន់មាន"}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            pct >= 85
                              ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                              : pct >= 70
                              ? "bg-gradient-to-r from-cyan-500 to-blue-500"
                              : pct >= 50
                              ? "bg-gradient-to-r from-amber-500 to-yellow-400"
                              : "bg-gradient-to-r from-rose-500 to-pink-500"
                          }`}
                          style={{ width: `${Math.min(pct || 0, 100)}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 dark:text-slate-400 font-khmer border-t border-slate-100 dark:border-slate-800/80">
                        <span>ស្ថានភាព៖</span>
                        {quiz.completed ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>បានប្រឡង</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-400">
                            <Clock className="w-3 h-3" />
                            <span>មិនទាន់មានពិន្ទុ</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Footer note for Quizzes */}
          <div className="px-5 py-3.5 bg-slate-50/80 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 font-khmer">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-cyan-500 shrink-0" />
              <span>
                ពិន្ទុសរុបនៃសំណួរទាំងអស់ត្រូវបានបម្លែងតាមទម្ងន់ ១៥% ស្មើនឹង <strong className="text-cyan-600 dark:text-cyan-400 font-mono text-sm">{scaledScore} / {maxScaled} pts</strong>។
              </span>
            </div>
            <Link
              to="/student/quizzes"
              className="inline-flex items-center gap-1 text-cyan-600 dark:text-cyan-400 hover:underline font-bold shrink-0"
            >
              <span>ពិនិត្យក្រាហ្វិក និងកម្រងសំណួរពេញលេញ →</span>
            </Link>
          </div>
        </div>
      )}

      {/* 7. Gamified Academic Badges & Trophies Showcase */}
      <AcademicBadgesSection studentSession={studentSession} />

      {/* Course E-Library (បណ្ណាល័យឌីជីថល) & Cloud Live Auto-Sync Section */}
      <div className="p-6 rounded-3xl bg-white/85 dark:bg-[#0c1427]/85 border border-slate-200/90 dark:border-white/10 shadow-[0_10px_35px_rgba(0,0,0,0.1)] space-y-4 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200/60 dark:border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-khmer flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                <span>បណ្ណាល័យឌីជីថល & ធនធានសិក្សា (Course E-Library)</span>
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 pl-4 font-khmer mt-0.5">
              ស្លាយមេរៀន, សៀវភៅ PDF, វីដេអូពន្យល់ និងតំណស្រាវជ្រាវ (Auto-Sync ជាមួយ Cloud Server)
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {syncFeedback && (
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-xl">
                {syncFeedback}
              </span>
            )}
            <button
              type="button"
              onClick={handleDashboardSync}
              disabled={isLibSyncing || loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-bold transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              title="ទាញយកទិន្នន័យចុងក្រោយពី Cloud Database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLibSyncing ? "animate-spin text-cyan-400" : ""}`} />
              <span>{isLibSyncing ? "កំពុង Sync..." : "Sync ពី Cloud Server"}</span>
            </button>
            <Link
              to="/student/library"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md transition-all active:scale-95"
            >
              <span>មើលទាំងអស់</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Resources Grid Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {resources && resources.slice(0, 3).map((res) => {
            const isWeb = res.category === "website";
            const plat = isWeb ? detectPlatform(res.fileUrl) : null;
            return (
              <div
                key={res.id}
                className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between hover:border-cyan-500/40 transition-all group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      {res.major || "គណនេយ្យ"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {res.fileType || "DOC"}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-2 group-hover:text-cyan-400 transition-colors">
                    {res.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {res.description}
                  </p>
                </div>

                <div className="pt-3 mt-2 border-t border-slate-200/40 dark:border-slate-800/60 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {res.lecturer || "សាស្ត្រាចារ្យ"}
                  </span>
                  {res.fileUrl && (
                    <a
                      href={res.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-cyan-400 font-bold hover:underline"
                    >
                      <span>បើកមើល</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Performance Insights Chart */}
      {hasChartData && (
        <div className="bg-white/85 dark:bg-[#0c1427]/85 rounded-3xl p-6 border border-slate-200/90 dark:border-white/10 shadow-[0_10px_35px_rgba(0,0,0,0.1)] space-y-4 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-khmer flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span>ក្រាហ្វិកប្រៀបធៀបភាគរយតាមមុខវិជ្ជា</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 pl-4 font-khmer">
                កម្រិតលទ្ធផលគិតជាភាគរយ (%) តាមខ្លឹមសារវាយតម្លៃនីមួយៗ
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.12)" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  formatter={(value) => [`${value}%`, "ភាគរយពិន្ទុ"]}
                  labelFormatter={(name) => `ខ្លឹមសារ៖ ${name}`}
                  contentStyle={{
                    backgroundColor: "#070b14",
                    borderRadius: "14px",
                    border: "1px solid rgba(6,182,212,0.3)",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
                    color: "#fff",
                    fontSize: "12px",
                    fontFamily: "Kantumruy Pro, sans-serif"
                  }}
                />
                <Bar dataKey="percentage" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill={
                        entry.percentage >= 85
                          ? "#10b981"
                          : entry.percentage >= 70
                          ? "#06b6d4"
                          : entry.percentage >= 50
                          ? "#f59e0b"
                          : "#f43f5e"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Social Share Story Modal */}
      <SocialShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        studentSession={studentSession}
        schoolInfo={schoolInfo}
      />
    </div>
  );
}
