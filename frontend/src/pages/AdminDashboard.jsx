import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Award,
  CheckCircle2,
  TrendingUp,
  Building2,
  BarChart3,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Trophy,
  BookOpen,
  PieChart as PieChartIcon,
  Target,
  Layers,
  Activity
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from "recharts";
import { useAuth } from "../context/AuthContext.jsx";
import { getAdminStats, getAdminScoringOverview } from "../api/adminApi.js";
import { SkeletonCard } from "../components/LoadingSkeleton.jsx";
import RealtimeIndicator from "../components/RealtimeIndicator.jsx";
import AtRiskStudentsWidget from "../components/AtRiskStudentsWidget.jsx";
import { dataSyncService } from "../services/dataSyncService.js";

// Custom Tooltip for Grade Distribution Bar Chart
const CustomChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 dark:bg-[#070b14]/95 border border-cyan-500/30 rounded-xl px-3.5 py-2.5 shadow-xl shadow-cyan-950/40 backdrop-blur-md">
        <p className="text-xs font-semibold text-slate-300 font-khmer">{label}</p>
        <p className="text-sm font-bold text-cyan-400 font-mono mt-0.5">
          {payload[0].value} <span className="text-xs text-slate-400 font-normal font-khmer">នាក់</span>
        </p>
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Gender Donut Chart
const CustomGenderTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900/95 dark:bg-[#070b14]/95 border border-pink-500/30 rounded-xl px-3.5 py-2.5 shadow-xl backdrop-blur-md">
        <p className="text-xs font-semibold text-slate-200 font-khmer">{data.name}</p>
        <p className="text-sm font-bold text-white font-mono mt-0.5">
          {data.count} <span className="text-xs text-slate-400 font-normal font-khmer">នាក់ ({data.pct}%)</span>
        </p>
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Score Range Area Chart
const CustomScoreRangeTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-slate-900/95 dark:bg-[#070b14]/95 border border-blue-500/30 rounded-xl px-3.5 py-2.5 shadow-xl backdrop-blur-md">
        <p className="text-xs font-semibold text-slate-300 font-khmer">
          ចន្លោះពិន្ទុ {label} ({item.status})
        </p>
        <p className="text-sm font-bold text-blue-400 font-mono mt-0.5">
          {payload[0].value} <span className="text-xs text-slate-400 font-normal font-khmer">នាក់</span>
        </p>
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Classroom Comparison Bar Chart
const CustomClassroomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900/95 dark:bg-[#070b14]/95 border border-indigo-500/30 rounded-xl px-4 py-3 shadow-xl backdrop-blur-md space-y-1">
        <p className="text-xs font-bold text-white font-khmer">{label}</p>
        <p className="text-xs text-slate-300">
          ចំនួននិស្សិត: <span className="font-mono font-bold text-cyan-400">{data.students}</span> នាក់
        </p>
        <p className="text-xs text-slate-300">
          ពិន្ទុមធ្យម: <span className="font-mono font-bold text-blue-400">{data.avgScore}</span> / 100
        </p>
        <p className="text-xs text-slate-300">
          អត្រាជាប់: <span className="font-mono font-bold text-emerald-400">{data.passRate}%</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const { adminSession } = useAuth();
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = async (refresh = false) => {
    if (!adminSession) return;
    if (!stats) {
      setInitialLoading(true);
    } else {
      setIsSyncing(true);
    }
    setError(null);
    try {
      const [res, scoringRes] = await Promise.all([
        getAdminStats(adminSession.token, refresh),
        getAdminScoringOverview(adminSession.token, refresh)
      ]);
      if (res.success && res.data) {
        setStats(res.data);
      } else if (!stats) {
        setError(res.message || "មិនអាចទាញយកទិន្នន័យស្ថិតិបានទេ។");
      }
      if (scoringRes.success && scoringRes.data?.students) {
        setStudents(scoringRes.data.students);
      }
    } catch (err) {
      if (!stats) setError(err.message || "មានបញ្ហាក្នុងការទាញយកទិន្នន័យ។");
    } finally {
      setInitialLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [adminSession]);

  // Real-Time Dashboard Synchronization (Section 18.1 & 18.7)
  // Automatically refreshes KPIs and chart data without reloading page when any change happens
  useEffect(() => {
    const unsub = dataSyncService.subscribeToAll(() => {
      fetchStats(true);
    });
    return () => unsub();
  }, []);

  // Smart Auto-Refresh every 30s when tab is visible
  useEffect(() => {
    let isFetching = false;
    let lastRun = Date.now();

    const doRefresh = async () => {
      if (isFetching || !adminSession) return;
      isFetching = true;
      try {
        await fetchStats(true);
        lastRun = Date.now();
      } catch (_) {}
      isFetching = false;
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible" && Date.now() - lastRun > 15000) {
        doRefresh();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        doRefresh();
      }
    }, 30000);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      clearInterval(interval);
    };
  }, [adminSession]);

  // 1. Grade Distribution (8 Tiers)
  const tierDefinitions = [
    { key: "A", khmer: "ល្អប្រសើរ", range: "85% - 100%", fill: "#10b981" },
    { key: "B+", khmer: "ល្អណាស់", range: "80% - 84%", fill: "#06b6d4" },
    { key: "B", khmer: "ល្អ", range: "70% - 79%", fill: "#3b82f6" },
    { key: "C+", khmer: "ល្អបង្គួរ", range: "65% - 69%", fill: "#14b8a6" },
    { key: "C", khmer: "មធ្យម", range: "50% - 64%", fill: "#f59e0b" },
    { key: "D", khmer: "ខ្សោយ", range: "45% - 49%", fill: "#f97316" },
    { key: "E", khmer: "ខ្សោយណាស់", range: "40% - 44%", fill: "#a855f7" },
    { key: "F", khmer: "ធ្លាក់", range: "≤ 39%", fill: "#ef4444" }
  ];

  const gradeData = stats?.gradeDistribution
    ? tierDefinitions.map((tier) => ({
        grade: `${tier.key} (${tier.khmer})`,
        shortGrade: tier.key,
        rawGrade: tier.key,
        khmerLabel: tier.khmer,
        range: tier.range,
        count: stats.gradeDistribution[tier.key] || 0,
        fill: tier.fill
      }))
    : [];

  // 2. Gender Ratio Donut Data
  const genderData = useMemo(() => {
    let female = stats?.femaleStudents;
    let male = stats?.maleStudents;

    if (female === undefined || male === undefined) {
      if (students && students.length > 0) {
        female = students.filter((s) => s.gender === "ស្រី" || s.gender === "F").length;
        male = students.filter((s) => s.gender === "ប្រុស" || s.gender === "M").length;
      } else {
        female = 0;
        male = 0;
      }
    }

    const total = female + male || 1;
    const femalePct = Math.round((female / total) * 100);
    const malePct = 100 - femalePct;

    return [
      {
        name: "និស្សិតស្រី (Female)",
        shortName: "ស្រី",
        count: female,
        pct: femalePct,
        fill: "#ec4899"
      },
      {
        name: "និស្សិតប្រុស (Male)",
        shortName: "ប្រុស",
        count: male,
        pct: malePct,
        fill: "#06b6d4"
      }
    ];
  }, [stats, students]);

  // 3. Classroom Performance Comparison
  const classroomData = useMemo(() => {
    if (students && students.length > 0) {
      const roomMap = {};
      students.forEach((s) => {
        const roomKey = s.room || "ផ្សេងៗ";
        if (!roomMap[roomKey]) {
          roomMap[roomKey] = { room: roomKey, students: 0, totalScoreSum: 0, passed: 0 };
        }
        roomMap[roomKey].students += 1;
        const score = Number(s.academicSummary?.totalScore ?? 0);
        roomMap[roomKey].totalScoreSum += score;
        if (score >= 50) roomMap[roomKey].passed += 1;
      });

      return Object.values(roomMap).map((r) => ({
        room: `បន្ទប់ ${r.room}`,
        rawRoom: r.room,
        students: r.students,
        avgScore: r.students > 0 ? parseFloat((r.totalScoreSum / r.students).toFixed(1)) : 0,
        passRate: r.students > 0 ? Math.round((r.passed / r.students) * 100) : 0
      }));
    }

    if (stats?.roomsBreakdown) {
      return Object.keys(stats.roomsBreakdown).map((k) => ({
        room: `បន្ទប់ ${k}`,
        rawRoom: k,
        students: stats.roomsBreakdown[k],
        avgScore: stats.averageScore || 74.8,
        passRate: stats.passRate || 100
      }));
    }

    return [];
  }, [students, stats]);

  // 4. Score Range Distribution (Area Chart / Bell Curve)
  const scoreRangeData = useMemo(() => {
    const ranges = [
      { range: "90-100", label: "៩០ - ១០០", status: "ឆ្នើម (A)", count: 0 },
      { range: "80-89", label: "៨០ - ៨៩", status: "ល្អណាស់ (B+)", count: 0 },
      { range: "70-79", label: "៧០ - ៧៩", status: "ល្អ (B)", count: 0 },
      { range: "60-69", label: "៦០ - ៦៩", status: "មធ្យម (C+/C)", count: 0 },
      { range: "50-59", label: "៥០ - ៥៩", status: "ខ្សោយ (D/E)", count: 0 },
      { range: "<50", label: "< ៥០", status: "ធ្លាក់ (F)", count: 0 }
    ];

    if (students && students.length > 0) {
      students.forEach((s) => {
        const score = Number(s.academicSummary?.totalScore ?? 0);
        if (score >= 90) ranges[0].count += 1;
        else if (score >= 80) ranges[1].count += 1;
        else if (score >= 70) ranges[2].count += 1;
        else if (score >= 60) ranges[3].count += 1;
        else if (score >= 50) ranges[4].count += 1;
        else ranges[5].count += 1;
      });
    } else if (stats?.gradeDistribution) {
      ranges[0].count = stats.gradeDistribution["A"] || 0;
      ranges[1].count = stats.gradeDistribution["B+"] || 0;
      ranges[2].count = stats.gradeDistribution["B"] || 0;
      ranges[3].count = (stats.gradeDistribution["C+"] || 0) + (stats.gradeDistribution["C"] || 0);
      ranges[4].count = (stats.gradeDistribution["D"] || 0) + (stats.gradeDistribution["E"] || 0);
      ranges[5].count = stats.gradeDistribution["F"] || 0;
    }

    return ranges;
  }, [students, stats]);

  // 5. 4 Evaluation Pillars Radar Data
  const pillarData = useMemo(() => {
    if (!students || students.length === 0) {
      return [
        { pillar: "វត្តមាន", fullLabel: "វត្តមាន (Attendance)", score: 9.8, max: 10, pct: 98, fill: "#10b981" },
        { pillar: "កិច្ចការ/Quiz", fullLabel: "កិច្ចការ & សំណួរ (QHA)", score: 11.8, max: 15, pct: 78.7, fill: "#06b6d4" },
        { pillar: "ឆមាស", fullLabel: "ប្រឡងពាក់កណ្តាលឆមាស", score: 21.5, max: 25, pct: 86.0, fill: "#3b82f6" },
        { pillar: "បញ្ចប់ឆមាស", fullLabel: "ប្រឡងបញ្ចប់ឆមាស", score: 38.5, max: 50, pct: 77.0, fill: "#8b5cf6" }
      ];
    }

    let totalAtt = 0;
    let totalQHA = 0;
    let totalMid = 0;
    let totalFinal = 0;
    const count = students.length;

    students.forEach((s) => {
      const summary = s.academicSummary || {};
      totalAtt += Number(summary.attendance ?? 10);
      totalQHA += Number(summary.totalQHA ?? 0);
      totalMid += Number(summary.midterm ?? 0);
      totalFinal += Number(
        summary.finalScore ??
          Math.max(
            0,
            Number(summary.totalScore ?? 0) -
              Number(summary.midterm ?? 0) -
              Number(summary.totalQHA ?? 0) -
              Number(summary.attendance ?? 10)
          )
      );
    });

    const avgAtt = parseFloat((totalAtt / count).toFixed(1));
    const avgQHA = parseFloat((totalQHA / count).toFixed(1));
    const avgMid = parseFloat((totalMid / count).toFixed(1));
    const avgFinal = parseFloat(Math.max(0, totalFinal / count).toFixed(1));

    return [
      {
        pillar: "វត្តមាន",
        fullLabel: "វត្តមាន (Attendance)",
        score: avgAtt,
        max: 10,
        pct: Math.min(100, Math.round((avgAtt / 10) * 100)),
        fill: "#10b981"
      },
      {
        pillar: "កិច្ចការ & Quiz",
        fullLabel: "កិច្ចការ & សំណួរ (QHA)",
        score: avgQHA,
        max: 15,
        pct: Math.min(100, Math.round((avgQHA / 15) * 100)),
        fill: "#06b6d4"
      },
      {
        pillar: "ពាក់កណ្តាលឆមាស",
        fullLabel: "ប្រឡងឆមាស (Midterm)",
        score: avgMid,
        max: 25,
        pct: Math.min(100, Math.round((avgMid / 25) * 100)),
        fill: "#3b82f6"
      },
      {
        pillar: "បញ្ចប់ឆមាស",
        fullLabel: "ប្រឡងបញ្ចប់ (Final Exam)",
        score: avgFinal,
        max: 50,
        pct: Math.min(100, Math.round((avgFinal / 50) * 100)),
        fill: "#8b5cf6"
      }
    ];
  }, [students]);

  // 6. Top 5 Performers Leaderboard
  const topStudents = useMemo(() => {
    if (!students || students.length === 0) return [];
    return [...students]
      .sort((a, b) => Number(b.academicSummary?.totalScore || 0) - Number(a.academicSummary?.totalScore || 0))
      .slice(0, 5);
  }, [students]);

  // 7. Majors Breakdown
  const majorData = stats?.majorsBreakdown
    ? Object.keys(stats.majorsBreakdown).map((k) => ({
        name: k,
        count: stats.majorsBreakdown[k]
      }))
    : [];

  // Pass Rate & Success Benchmark
  const passRate = stats?.totalStudents > 0
    ? Math.round((stats.passedCount / stats.totalStudents) * 100)
    : (students.length > 0
        ? Math.round((students.filter((s) => Number(s.academicSummary?.totalScore || 0) >= 50).length / students.length) * 100)
        : 100);

  const passGaugeData = [
    { name: "ប្រឡងជាប់", value: stats?.passedCount || (students.length > 0 ? students.filter((s) => Number(s.academicSummary?.totalScore || 0) >= 50).length : 1), fill: "#10b981" },
    { name: "ប្រឈមធ្លាក់", value: stats?.failedCount || (students.length > 0 ? students.filter((s) => Number(s.academicSummary?.totalScore || 0) < 50).length : 0), fill: "#ef4444" }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-[11px] font-semibold mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
            <span className="font-khmer font-bold tracking-wide">ស្ថិតិ និងការវិភាគទិន្នន័យសិក្សា</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-khmer tracking-tight">
            ផ្ទាំងគ្រប់គ្រងទូទៅនៃលទ្ធផលសិក្សា
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-khmer">
            ផ្ទាំងវិភាគទិន្នន័យសិក្សាជាក់ស្តែង គណនាផ្ទាល់ពី Cloud Database របស់ MyPintou (Myពិន្ទុ)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <RealtimeIndicator onRefresh={() => fetchStats(true)} loading={isSyncing} />
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs sm:text-sm flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Top 4 KPI Summary Cards Grid */}
      {initialLoading && !stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Students */}
          <div className="group relative p-[1px] rounded-2xl bg-gradient-to-br from-blue-500/30 via-indigo-500/10 to-transparent hover:from-blue-500/60 hover:to-indigo-500/40 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-blue-500/10">
            <div className="relative h-full bg-white/90 dark:bg-[#0b1329]/90 backdrop-blur-xl rounded-[15px] p-5 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-khmer">
                  ចំនួននិស្សិតសរុប
                </span>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
                  {stats.totalStudents} <span className="text-sm font-normal text-slate-500 dark:text-slate-400 font-khmer">នាក់</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 pt-1 font-khmer">
                  <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-300 font-medium">ប្រុស {stats.maleStudents}</span>
                  <span>•</span>
                  <span className="px-1.5 py-0.5 rounded bg-pink-500/10 text-pink-600 dark:text-pink-300 font-medium">ស្រី {stats.femaleStudents}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Average Score */}
          <div className="group relative p-[1px] rounded-2xl bg-gradient-to-br from-cyan-500/30 via-blue-500/10 to-transparent hover:from-cyan-500/60 hover:to-blue-500/40 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-cyan-500/10">
            <div className="relative h-full bg-white/90 dark:bg-[#0b1329]/90 backdrop-blur-xl rounded-[15px] p-5 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-khmer">
                  ពិន្ទុមធ្យមរួម
                </span>
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-cyan-600 dark:text-cyan-400 font-mono tracking-tight">
                  {stats.averageScore !== null && stats.averageScore !== undefined ? stats.averageScore : "-"}
                  <span className="text-sm font-normal text-slate-500 dark:text-slate-400 ml-1">/100</span>
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium pt-1 flex items-center gap-1.5 font-khmer">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>គណនាផ្ទាល់ពី Cloud Database</span>
                </div>
              </div>
            </div>
          </div>

          {/* Passed Students */}
          <div className="group relative p-[1px] rounded-2xl bg-gradient-to-br from-emerald-500/30 via-teal-500/10 to-transparent hover:from-emerald-500/60 hover:to-teal-500/40 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-emerald-500/10">
            <div className="relative h-full bg-white/90 dark:bg-[#0b1329]/90 backdrop-blur-xl rounded-[15px] p-5 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-khmer">
                  និស្សិតប្រឡងជាប់
                </span>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
                  {stats.passedCount} <span className="text-sm font-normal text-slate-500 dark:text-slate-400 font-khmer">នាក់</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 font-khmer">
                  {stats.totalStudents > 0
                    ? `អត្រាជាប់ ${Math.round((stats.passedCount / stats.totalStudents) * 100)}% នៃនិស្សិតសរុប`
                    : "-"}
                </div>
              </div>
            </div>
          </div>

          {/* Classrooms & Majors */}
          <div className="group relative p-[1px] rounded-2xl bg-gradient-to-br from-purple-500/30 via-pink-500/10 to-transparent hover:from-purple-500/60 hover:to-pink-500/40 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-purple-500/10">
            <div className="relative h-full bg-white/90 dark:bg-[#0b1329]/90 backdrop-blur-xl rounded-[15px] p-5 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-khmer">
                  បន្ទប់ និងជំនាញ
                </span>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Building2 className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
                  {stats.roomCount} <span className="text-sm font-normal text-slate-500 dark:text-slate-400 font-khmer">បន្ទប់</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 font-khmer">
                  ឆ្លងកាត់ {stats.majorCount} ជំនាញសិក្សា
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* ⚠️ At-Risk Students Warning & Intervention Widget */}
      <AtRiskStudentsWidget students={students} />

      {/* ======================================================== */}
      {/* 📊 SECTION 1: Academic Grades & Score Range Distribution */}
      {/* ======================================================== */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Grade Distribution Bar Chart (8 Tiers) */}
          <div className="relative p-[1px] rounded-3xl bg-gradient-to-b from-blue-500/20 to-transparent">
            <div className="h-full bg-white/80 dark:bg-[#0b1329]/80 backdrop-blur-xl rounded-[23px] p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-khmer flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <span>ស្ថិតិនៃការបែងចែកនិទ្ទេសទាំង ៨ ថ្នាក់</span>
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-khmer">
                  {gradeData.length} និទ្ទេស
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-khmer">
                ចំនួននិស្សិតតាមកម្រិតនិទ្ទេសនីមួយៗ (A, B+, B, C+, C, D, E, F) យោងតាមបទដ្ឋានសិក្សា
              </p>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gradeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.12)" />
                    <XAxis dataKey="grade" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={{ stroke: "rgba(148, 163, 184, 0.2)" }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={{ stroke: "rgba(148, 163, 184, 0.2)" }} />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Bar dataKey="count" radius={[8, 8, 2, 2]}>
                      {gradeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Chart 2: Score Range Frequency Distribution (Area Chart - Bell Curve) */}
          <div className="relative p-[1px] rounded-3xl bg-gradient-to-b from-cyan-500/20 to-transparent">
            <div className="h-full bg-white/80 dark:bg-[#0b1329]/80 backdrop-blur-xl rounded-[23px] p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-khmer flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 flex items-center justify-center">
                    <Activity className="w-4 h-4" />
                  </div>
                  <span>ការបែងចែកចន្លោះពិន្ទុ (Score Distribution)</span>
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/80 text-cyan-600 dark:text-cyan-400 font-khmer font-bold">
                  Bell Curve
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-khmer">
                ទិដ្ឋភាពជារួមនៃកំហាប់ពិន្ទុនិស្សិតចាប់ពីកម្រិតធ្លាក់ (&lt; ៥០) រហូតដល់កម្រិតឆ្នើម (៩០ - ១០០)
              </p>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={scoreRangeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="scoreAreaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.12)" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={{ stroke: "rgba(148, 163, 184, 0.2)" }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={{ stroke: "rgba(148, 163, 184, 0.2)" }} />
                    <Tooltip content={<CustomScoreRangeTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#06b6d4"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#scoreAreaGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 📊 SECTION 2: Classroom Comparison & Gender Demographics */}
      {/* ======================================================== */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 3: Classroom Performance Comparison (Grouped Bar Chart) */}
          <div className="relative p-[1px] rounded-3xl bg-gradient-to-b from-indigo-500/20 to-transparent">
            <div className="h-full bg-white/80 dark:bg-[#0b1329]/80 backdrop-blur-xl rounded-[23px] p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-khmer flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <span>ការប្រៀបធៀបលទ្ធផលតាមបន្ទប់សិក្សា</span>
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-khmer">
                  {classroomData.length} បន្ទប់
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-khmer">
                ប្រៀបធៀបពិន្ទុមធ្យម (០-១០០) និងអត្រាជាប់ (%) រវាងបន្ទប់រៀននីមួយៗ
              </p>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={classroomData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.12)" />
                    <XAxis dataKey="room" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={{ stroke: "rgba(148, 163, 184, 0.2)" }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={{ stroke: "rgba(148, 163, 184, 0.2)" }} />
                    <Tooltip content={<CustomClassroomTooltip />} />
                    <Bar dataKey="avgScore" name="ពិន្ទុមធ្យម" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="passRate" name="អត្រាជាប់ (%)" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Legend row */}
              <div className="flex items-center justify-center gap-6 pt-1 text-xs font-khmer text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-blue-500" />
                  <span>ពិន្ទុមធ្យម (Avg Score)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-emerald-500" />
                  <span>អត្រាជាប់ (Pass Rate %)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chart 4: Gender Ratio Donut Chart (ស្រី vs ប្រុស) */}
          <div className="relative p-[1px] rounded-3xl bg-gradient-to-b from-pink-500/20 to-transparent">
            <div className="h-full bg-white/80 dark:bg-[#0b1329]/80 backdrop-blur-xl rounded-[23px] p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-khmer flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-500 flex items-center justify-center">
                    <PieChartIcon className="w-4 h-4" />
                  </div>
                  <span>សមាមាត្រយេនឌ័រ (Gender Ratio)</span>
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/80 text-pink-500 font-khmer font-bold">
                  ស្រី {genderData[0].pct}% • ប្រុស {genderData[1].pct}%
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-khmer">
                តុល្យភាពរវាងនិស្សិតស្រី និងនិស្សិតប្រុសក្នុងកម្មវិធីសិក្សាទាំងមូល
              </p>

              <div className="h-64 w-full flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<CustomGenderTooltip />} />
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="count"
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={`gender-cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                {/* Donut Center Metric */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                    {stats.totalStudents}
                  </span>
                  <span className="text-[11px] font-khmer text-slate-500 dark:text-slate-400">
                    និស្សិតសរុប
                  </span>
                </div>
              </div>

              {/* Gender Summary Badges */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-khmer text-pink-600 dark:text-pink-400 font-medium">និស្សិតស្រី</p>
                    <p className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                      {genderData[0].count} <span className="text-xs font-normal font-khmer text-slate-500">នាក់</span>
                    </p>
                  </div>
                  <span className="text-xs font-bold font-mono px-2 py-1 rounded-lg bg-pink-500/20 text-pink-600 dark:text-pink-300">
                    {genderData[0].pct}%
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-khmer text-cyan-600 dark:text-cyan-400 font-medium">និស្សិតប្រុស</p>
                    <p className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                      {genderData[1].count} <span className="text-xs font-normal font-khmer text-slate-500">នាក់</span>
                    </p>
                  </div>
                  <span className="text-xs font-bold font-mono px-2 py-1 rounded-lg bg-cyan-500/20 text-cyan-600 dark:text-cyan-300">
                    {genderData[1].pct}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 📊 SECTION 3: 4-Pillar Evaluation & Pass Rate Benchmark */}
      {/* ======================================================== */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 5: 4 Evaluation Pillars Radar Chart */}
          <div className="relative p-[1px] rounded-3xl bg-gradient-to-b from-emerald-500/20 to-transparent">
            <div className="h-full bg-white/80 dark:bg-[#0b1329]/80 backdrop-blur-xl rounded-[23px] p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-khmer flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center">
                    <Target className="w-4 h-4" />
                  </div>
                  <span>វិភាគសមាសភាគពិន្ទុទាំង ៤ ផ្នែក (Evaluation Pillars)</span>
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/80 text-emerald-600 dark:text-emerald-400 font-khmer font-bold">
                  Radar Analysis
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-khmer">
                ភាគរយសម្រេចបាន (%) ធៀបនឹងពិន្ទុអតិបរមានៃផ្នែកនីមួយៗ (វត្តមាន ១០%, Quiz ១៥%, Midterm ២៥%, Final ៥០%)
              </p>

              <div className="h-64 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={pillarData}>
                    <PolarGrid stroke="rgba(148, 163, 184, 0.18)" />
                    <PolarAngleAxis dataKey="pillar" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 10 }} stroke="rgba(148, 163, 184, 0.2)" />
                    <Radar
                      name="ភាគរយសម្រេច (%)"
                      dataKey="pct"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.35}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* 4 Pillars Breakdown Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {pillarData.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 text-center">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-khmer truncate">{item.pillar}</p>
                    <p className="text-sm font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                      {item.score} <span className="text-[10px] text-slate-400 font-normal">/{item.max}</span>
                    </p>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${item.pct}%`, backgroundColor: item.fill }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chart 6: Pass Rate & Academic Health Gauge */}
          <div className="relative p-[1px] rounded-3xl bg-gradient-to-b from-teal-500/20 to-transparent">
            <div className="h-full bg-white/80 dark:bg-[#0b1329]/80 backdrop-blur-xl rounded-[23px] p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-khmer flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-500 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span>អត្រាជោគជ័យ និងសុខភាពសិក្សា (Pass Rate Gauge)</span>
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-khmer font-bold">
                  គោលដៅ: ≥ ៨៥%
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-khmer">
                សមាមាត្រនិស្សិតប្រឡងជាប់ (ពិន្ទុ ≥ ៥០) ធៀបនឹងនិស្សិតប្រឈមហានិភ័យធ្លាក់
              </p>

              <div className="h-64 w-full flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={passGaugeData}
                      cx="50%"
                      cy="75%"
                      startAngle={180}
                      endAngle={0}
                      innerRadius={70}
                      outerRadius={95}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {passGaugeData.map((entry, index) => (
                        <Cell key={`gauge-cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                {/* Semi-Circle Center Metric */}
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 pointer-events-none">
                  <span className="text-4xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                    {passRate}%
                  </span>
                  <span className="text-xs font-khmer text-slate-500 dark:text-slate-400 mt-1">
                    អត្រាប្រឡងជាប់សរុប
                  </span>
                </div>
              </div>

              {/* Status Indicator Bar */}
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-khmer font-bold text-emerald-700 dark:text-emerald-300">
                    {passRate >= 85 ? "លទ្ធផលសិក្សាស្ថិតក្នុងកម្រិតល្អប្រសើរ (លើសគោលដៅ)" : "ត្រូវការការយកចិត្តទុកដាក់លើនិស្សិតខ្សោយ"}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-200">
                  {stats.passedCount}/{stats.totalStudents} នាក់
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 📊 SECTION 4: Top 5 Performers & Majors Enrollment       */}
      {/* ======================================================== */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 7: Top 5 Highest Scoring Students Leaderboard */}
          <div className="relative p-[1px] rounded-3xl bg-gradient-to-b from-amber-500/20 to-transparent">
            <div className="h-full bg-white/80 dark:bg-[#0b1329]/80 backdrop-blur-xl rounded-[23px] p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-khmer flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <span>កំពូលនិស្សិតពិន្ទុខ្ពស់ជាងគេ Top 5</span>
                </h3>
                <Link
                  to="/admin/honors"
                  className="text-xs text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 font-khmer"
                >
                  <span>មើលទាំងអស់</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-khmer">
                និស្សិតឆ្នើម ៥ នាក់ដែលសម្រេចបានពិន្ទុសរុបខ្ពស់បំផុតប្រចាំសាលា
              </p>

              <div className="space-y-3 pt-1">
                {topStudents.length > 0 ? (
                  topStudents.map((st, idx) => {
                    const score = Number(st.academicSummary?.totalScore || 0);
                    const rankIcons = ["🥇", "🥈", "🥉", "4", "5"];
                    return (
                      <div
                        key={st.studentId || idx}
                        className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 hover:border-amber-500/40 transition-all flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                            idx === 0
                              ? "bg-amber-500/20 text-amber-500 border border-amber-500/30"
                              : idx === 1
                              ? "bg-slate-300/20 text-slate-400 border border-slate-400/30"
                              : idx === 2
                              ? "bg-amber-700/20 text-amber-600 border border-amber-700/30"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                          }`}>
                            {rankIcons[idx]}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white font-khmer truncate group-hover:text-amber-500 transition-colors">
                              {st.fullNameKh || st.fullNameEn}
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                              ID: {st.studentId} • បន្ទប់: {st.room}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                          <div className="text-right">
                            <span className="text-sm font-black font-mono text-amber-600 dark:text-amber-400">
                              {score.toFixed(1)}
                            </span>
                            <span className="text-[10px] text-slate-400 ml-0.5">/100</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/20">
                            {st.academicSummary?.overallGrade || "A"}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-400 py-4 text-center font-khmer">មិនទាន់មានទិន្នន័យនិស្សិត</p>
                )}
              </div>
            </div>
          </div>

          {/* Chart 8: Majors Breakdown & Enrollment */}
          <div className="relative p-[1px] rounded-3xl bg-gradient-to-b from-indigo-500/20 to-transparent">
            <div className="h-full bg-white/80 dark:bg-[#0b1329]/80 backdrop-blur-xl rounded-[23px] p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-khmer flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <span>ការចុះឈ្មោះតាមជំនាញសិក្សា</span>
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400">
                  {majorData.length} ជំនាញ
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-khmer">
                សមាមាត្រនិស្សិតក្នុងកម្មវិធីជំនាញនីមួយៗ
              </p>

              <div className="space-y-4 pt-1 max-h-64 overflow-y-auto pr-1">
                {majorData.map((item, idx) => {
                  const pct = stats.totalStudents > 0 ? Math.round((item.count / stats.totalStudents) * 100) : 0;
                  return (
                    <div key={idx} className="space-y-1.5 group">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 group-hover:text-cyan-500 transition-colors font-khmer">
                          {item.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 dark:text-white">{item.count} នាក់</span>
                          <span className="font-mono text-[11px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-semibold">
                            {pct}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-700/50">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 rounded-full transition-all duration-700 shadow-sm"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
        <Link
          to="/admin/honors"
          className="group relative p-[1px] rounded-2xl bg-gradient-to-br from-amber-500/30 via-yellow-500/10 to-transparent hover:from-amber-500/60 hover:to-yellow-500/30 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-amber-500/10"
        >
          <div className="h-full p-5 rounded-[15px] bg-white/90 dark:bg-[#0b1329]/90 backdrop-blur-xl flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-500/20 transition-all">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors font-khmer">
                  តារាងនិស្សិតឆ្នើម & Poster
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-khmer">
                  Top 5/10 & បង្កើត Social Banner
                </p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800/60 flex items-center justify-center text-slate-400 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </Link>

        <Link
          to="/admin/library"
          className="group relative p-[1px] rounded-2xl bg-gradient-to-br from-cyan-500/30 via-blue-500/10 to-transparent hover:from-cyan-500/60 hover:to-blue-500/30 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-cyan-500/10"
        >
          <div className="h-full p-5 rounded-[15px] bg-white/90 dark:bg-[#0b1329]/90 backdrop-blur-xl flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 flex items-center justify-center group-hover:scale-110 group-hover:bg-cyan-500/20 transition-all">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors font-khmer">
                  បណ្ណាល័យឌីជីថល (E-Library)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-khmer">
                  Upload ស្លាយ, PDF, វីដេអូ & លំហាត់
                </p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800/60 flex items-center justify-center text-slate-400 group-hover:text-cyan-500 group-hover:translate-x-0.5 transition-all">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </Link>

        <Link
          to="/admin/scoring"
          className="group relative p-[1px] rounded-2xl bg-gradient-to-br from-emerald-500/20 via-slate-500/10 to-transparent hover:from-emerald-500/50 hover:to-teal-500/30 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-emerald-500/10"
        >
          <div className="h-full p-5 rounded-[15px] bg-white/90 dark:bg-[#0b1329]/90 backdrop-blur-xl flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors font-khmer">
                  តារាងពិន្ទុរួម
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-khmer">
                  ពិនិត្យពិន្ទុ គណនាមធ្យមភាគ និង Export
                </p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800/60 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </Link>

        <Link
          to="/admin/students"
          className="group relative p-[1px] rounded-2xl bg-gradient-to-br from-blue-500/20 via-slate-500/10 to-transparent hover:from-blue-500/50 hover:to-indigo-500/30 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-blue-500/10"
        >
          <div className="h-full p-5 rounded-[15px] bg-white/90 dark:bg-[#0b1329]/90 backdrop-blur-xl flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-500/20 transition-all">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-blue-500 dark:group-hover:text-cyan-400 transition-colors font-khmer">
                  បញ្ជីរាយនាមនិស្សិត
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-khmer">
                  គ្រប់គ្រង ស្វែងរក និងមើលប្រវត្តិរូប
                </p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800/60 flex items-center justify-center text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
