import React, { useState, useEffect } from "react";
import {
  Trophy,
  Award,
  Crown,
  Sparkles,
  Download,
  Search,
  Filter,
  GraduationCap,
  Calendar,
  Layers,
  FileSpreadsheet,
  Printer,
  ChevronRight,
  TrendingUp,
  Share2,
  Users,
  CheckCircle2,
  Star,
  Flame,
  Medal
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useSchool } from "../context/SchoolContext.jsx";
import { getAdminScoringOverview } from "../api/adminApi.js";
import HonorPosterModal from "../components/HonorPosterModal.jsx";
import { MAJORS_LIST } from "../context/ELibraryContext.jsx";

export default function DeansHonorsPage() {
  const { adminSession } = useAuth();
  const { schoolInfo } = useSchool();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMajor, setSelectedMajor] = useState("ទាំងអស់ (All Majors)");
  const [selectedTopCount, setSelectedTopCount] = useState("10"); // '3' | '5' | '10' | '20' | 'all-a'
  const [searchQuery, setSearchQuery] = useState("");
  const [showPosterModal, setShowPosterModal] = useState(false);

  const [selectedRoom, setSelectedRoom] = useState("ទាំងអស់ (All Rooms)");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getAdminScoringOverview(adminSession?.token);
        if (res.success && res.data?.students) {
          setStudents(res.data.students);
        }
      } catch (err) {
        console.error("Failed to load students for honors list", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [adminSession]);

  // Clean student object and calculate score directly from Google Sheet data
  const processedStudents = students
    .map((s) => {
      const p = s.profile || {};
      const summary = s.academicSummary || {};
      const score = Number(s.totalScore ?? summary.totalScore ?? 0);
      const grade = (s.overallGrade || summary.overallGrade || "C").trim().toUpperCase();

      // Estimate GPA from score if not provided
      let gpa = s.gpa;
      if (!gpa) {
        if (score >= 90) gpa = 4.0;
        else if (score >= 85) gpa = 3.8;
        else if (score >= 80) gpa = 3.5;
        else if (score >= 75) gpa = 3.0;
        else if (score >= 70) gpa = 2.5;
        else gpa = 2.0;
      }

      const realSkill = s.skill || p.skill || s.major || p.major || "គណនេយ្យ";
      const realRoom = s.room || p.room || "N";
      const realSubject = s.subject || p.subject || schoolInfo?.subject || "ICT";

      return {
        id: s.studentId || p.studentId || s.id || "",
        studentId: s.studentId || p.studentId || s.id || "",
        fullNameKh: s.fullNameKh || p.fullNameKh || s.nameKh || s.fullNameEn || p.fullName || "និស្សិត",
        fullNameEn: s.fullNameEn || p.fullNameEn || p.fullName || "",
        gender: s.gender || p.gender || "មិនបញ្ជាក់",
        major: realSkill,
        room: realRoom,
        subject: realSubject,
        totalScore: score,
        overallGrade: grade,
        gpa: Number(gpa).toFixed(2),
        rank: s.rank || 0,
        scores: s.scores || summary.quizBreakdown || []
      };
    })
    .sort((a, b) => b.totalScore - a.totalScore); // Sort descending

  // Dynamic filter lists extracted directly from Google Sheets
  const availableMajors = React.useMemo(() => {
    const list = ["ទាំងអស់ (All Majors)"];
    const found = new Set();
    processedStudents.forEach((st) => {
      if (st.major && !found.has(st.major)) {
        found.add(st.major);
        list.push(st.major);
      }
    });
    return list;
  }, [processedStudents]);

  const availableRooms = React.useMemo(() => {
    const list = ["ទាំងអស់ (All Rooms)"];
    const found = new Set();
    processedStudents.forEach((st) => {
      if (st.room && !found.has(st.room)) {
        found.add(st.room);
        list.push(`បន្ទប់ ${st.room}`);
      }
    });
    return list;
  }, [processedStudents]);

  // Filter students based on Google Sheet values
  const filteredStudents = processedStudents.filter((st) => {
    // Major filter
    if (selectedMajor !== "ទាំងអស់ (All Majors)") {
      if (st.major !== selectedMajor && !st.major.includes(selectedMajor)) return false;
    }

    // Room filter
    if (selectedRoom !== "ទាំងអស់ (All Rooms)") {
      const targetRoom = selectedRoom.replace("បន្ទប់ ", "").trim();
      if (st.room !== targetRoom) return false;
    }

    // Search query
    const q = searchQuery.toLowerCase().trim();
    if (
      q &&
      !st.fullNameKh.toLowerCase().includes(q) &&
      !st.fullNameEn.toLowerCase().includes(q) &&
      !st.studentId.toLowerCase().includes(q)
    ) {
      return false;
    }

    // Grade threshold if 'all-a'
    if (selectedTopCount === "all-a") {
      return st.totalScore >= 85 || st.overallGrade === "A";
    }

    return true;
  });

  // Limit count
  const rankedStudents = (
    selectedTopCount === "all-a"
      ? filteredStudents
      : filteredStudents.slice(0, parseInt(selectedTopCount, 10))
  ).map((st, idx) => ({
    ...st,
    honorsRank: idx + 1
  }));

  // Top 3 Podium Students
  const top1 = rankedStudents[0];
  const top2 = rankedStudents[1];
  const top3 = rankedStudents[2];

  // Stats calculation
  const totalHonorsCount = rankedStudents.length;
  const averageHonorsScore =
    totalHonorsCount > 0
      ? (rankedStudents.reduce((acc, curr) => acc + curr.totalScore, 0) / totalHonorsCount).toFixed(1)
      : "0";
  const highestScore = rankedStudents[0]?.totalScore ? rankedStudents[0].totalScore.toFixed(1) : "0";

  // Export to CSV
  const handleExportCSV = () => {
    if (rankedStudents.length === 0) return;
    let csv = "Rank,Student ID,Full Name (Khmer),Full Name (English),Major,Total Score,Grade,GPA\n";
    rankedStudents.forEach((st) => {
      csv += `${st.honorsRank},"${st.studentId}","${st.fullNameKh}","${st.fullNameEn}","${st.major}",${st.totalScore},"${st.overallGrade}",${st.gpa}\n`;
    });
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Deans_Honors_List_Top${selectedTopCount}_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 font-khmer pb-16">
      {/* Top Banner / Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/60 border border-amber-500/30 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-72 h-72 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold tracking-wide">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>ប្រព័ន្ធចម្រាញ់និស្សិតឆ្នើមប្រចាំសាលា (Dean's Honors & Top Achievers)</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Trophy className="w-8 h-8 text-amber-400" />
              <span>តារាងនិស្សិតឆ្នើម & កិត្តិយសសិក្សា</span>
            </h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              ប្រព័ន្ធចម្រាញ់ស្វ័យប្រវត្តិនូវ Top 5 ឬ Top 10 និស្សិតឆ្នើមប្រចាំដេប៉ាតឺម៉ង់ និងមុខជំនាញ ព្រមទាំងផ្តល់ប៊ូតុង ១-Tap ដើម្បីបង្កើតផ្ទាំងរូបភាព Social Banner សម្រាប់បង្ហោះលើ Facebook Page ផ្លូវការ!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setShowPosterModal(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-bold shadow-lg shadow-amber-500/25 transition-all duration-200 active:scale-95 cursor-pointer text-sm"
            >
              <Sparkles className="w-5 h-5 text-slate-950" />
              <span>✨ បង្កើត Digital Honor Poster (Social Banner)</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">ចំនួននិស្សិតក្នុងតារាង</p>
              <p className="text-2xl font-bold text-white font-mono">{totalHonorsCount} <span className="text-sm font-normal text-slate-400 font-khmer">នាក់</span></p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center shrink-0">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">ពិន្ទុខ្ពស់បំផុត (Top Score)</p>
              <p className="text-2xl font-bold text-amber-400 font-mono">{highestScore} <span className="text-sm font-normal text-slate-400 font-khmer">/ 100</span></p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">ពិន្ទុមធ្យមភាគនិស្សិតឆ្នើម</p>
              <p className="text-2xl font-bold text-cyan-400 font-mono">{averageHonorsScore} <span className="text-sm font-normal text-slate-400 font-khmer">/ 100</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Selection Controls */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Search */}
          <div className="lg:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ស្វែងរកតាមឈ្មោះនិស្សិត ឬអត្តលេខ..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          {/* Department / Major Filter (Directly from Google Sheets) */}
          <div className="lg:col-span-3 relative">
            <select
              value={selectedMajor}
              onChange={(e) => setSelectedMajor(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer"
            >
              {availableMajors.map((m) => (
                <option key={m} value={m} className="bg-slate-900 text-white">
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Room / Class Filter (Directly from Google Sheets) */}
          <div className="lg:col-span-2 relative">
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer"
            >
              {availableRooms.map((r) => (
                <option key={r} value={r} className="bg-slate-900 text-white">
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Top Count Selection */}
          <div className="lg:col-span-2 relative">
            <select
              value={selectedTopCount}
              onChange={(e) => setSelectedTopCount(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer font-semibold"
            >
              <option value="5" className="bg-slate-900 text-white">Top 5 ឆ្នើម</option>
              <option value="10" className="bg-slate-900 text-white">Top 10 ឆ្នើម</option>
              <option value="20" className="bg-slate-900 text-white">Top 20 ឆ្នើម</option>
              <option value="3" className="bg-slate-900 text-white">Top 3 ជើងឯក (Podium)</option>
              <option value="all-a" className="bg-slate-900 text-white">ទាំងអស់ (និទ្ទេស A: 85+)</option>
            </select>
          </div>
        </div>
      </div>

      {/* TOP 3 PODIUM DISPLAY */}
      {top1 && (
        <div className="relative rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-900 to-slate-950 border border-slate-800 p-6 md:p-8 shadow-2xl overflow-hidden">
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase mb-2">
              <Medal className="w-3.5 h-3.5" />
              <span>វេទិកាជើងឯកកំពូលទាំង ៣ (Top 3 Achievers Podium)</span>
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-white">
              កំពូលនិស្សិតពិន្ទុខ្ពស់បំផុតប្រចាំដេប៉ាតឺម៉ង់
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-4xl mx-auto pt-6">
            {/* Rank 2 (Silver) */}
            {top2 ? (
              <div className="order-2 md:order-1 bg-gradient-to-t from-slate-900/90 to-slate-800/60 border border-slate-700/80 rounded-3xl p-5 text-center relative shadow-xl transform md:translate-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-300 text-slate-950 font-extrabold text-sm flex items-center justify-center mx-auto -mt-10 shadow-lg border-2 border-slate-800">
                  #2
                </div>
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-slate-400 to-slate-200 p-1 mx-auto my-3 shadow-lg">
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-slate-200 font-bold text-xl">
                    {top2.fullNameKh?.charAt(0) || "🥈"}
                  </div>
                </div>
                <span className="text-xs text-slate-400 font-mono">{top2.studentId}</span>
                <h3 className="text-base font-bold text-white truncate mt-0.5">{top2.fullNameKh}</h3>
                <p className="text-xs text-cyan-400 font-medium truncate">{top2.major}</p>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-around">
                  <div>
                    <span className="text-[10px] text-slate-400 block">ពិន្ទុ</span>
                    <span className="font-mono font-bold text-base text-white">{top2.totalScore.toFixed(1)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">GPA</span>
                    <span className="font-mono font-bold text-base text-amber-400">{top2.gpa}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">និទ្ទេស</span>
                    <span className="font-mono font-bold text-base text-emerald-400">{top2.overallGrade}</span>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Rank 1 (Gold Champion) */}
            {top1 ? (
              <div className="order-1 md:order-2 bg-gradient-to-t from-amber-950/40 via-slate-900 to-slate-800/80 border-2 border-amber-400/80 rounded-3xl p-6 text-center relative shadow-[0_0_35px_rgba(245,158,11,0.35)] transform md:-translate-y-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-black text-base flex items-center justify-center mx-auto -mt-12 shadow-xl border-2 border-slate-900">
                  <Crown className="w-6 h-6 fill-current" />
                </div>
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 p-1 mx-auto my-3 shadow-xl animate-pulse">
                  <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-amber-300 font-bold text-2xl">
                    {top1.fullNameKh?.charAt(0) || "🥇"}
                  </div>
                </div>
                <span className="inline-block text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase mb-1">
                  ជើងឯកពិន្ទុលេខ ១
                </span>
                <span className="text-xs text-slate-400 font-mono block">{top1.studentId}</span>
                <h3 className="text-lg font-extrabold text-white truncate mt-0.5">{top1.fullNameKh}</h3>
                <p className="text-xs text-amber-300 font-medium truncate">{top1.major}</p>

                <div className="mt-4 pt-3 border-t border-amber-500/30 flex items-center justify-around">
                  <div>
                    <span className="text-[10px] text-slate-400 block">ពិន្ទុសរុប</span>
                    <span className="font-mono font-extrabold text-lg text-amber-300">{top1.totalScore.toFixed(1)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">GPA</span>
                    <span className="font-mono font-extrabold text-lg text-amber-400">{top1.gpa}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">និទ្ទេស</span>
                    <span className="font-mono font-extrabold text-lg text-emerald-400">{top1.overallGrade}</span>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Rank 3 (Bronze) */}
            {top3 ? (
              <div className="order-3 bg-gradient-to-t from-slate-900/90 to-slate-800/60 border border-amber-700/60 rounded-3xl p-5 text-center relative shadow-xl transform md:translate-y-4">
                <div className="w-10 h-10 rounded-full bg-amber-700 text-white font-extrabold text-sm flex items-center justify-center mx-auto -mt-10 shadow-lg border-2 border-slate-800">
                  #3
                </div>
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-600 to-amber-700 p-1 mx-auto my-3 shadow-lg">
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-amber-500 font-bold text-xl">
                    {top3.fullNameKh?.charAt(0) || "🥉"}
                  </div>
                </div>
                <span className="text-xs text-slate-400 font-mono">{top3.studentId}</span>
                <h3 className="text-base font-bold text-white truncate mt-0.5">{top3.fullNameKh}</h3>
                <p className="text-xs text-cyan-400 font-medium truncate">{top3.major}</p>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-around">
                  <div>
                    <span className="text-[10px] text-slate-400 block">ពិន្ទុ</span>
                    <span className="font-mono font-bold text-base text-white">{top3.totalScore.toFixed(1)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">GPA</span>
                    <span className="font-mono font-bold text-base text-amber-400">{top3.gpa}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">និទ្ទេស</span>
                    <span className="font-mono font-bold text-base text-emerald-400">{top3.overallGrade}</span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* FULL LEADERBOARD TABLE */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-slate-800 dark:text-white">
              តារាងលំដាប់ថ្នាក់និស្សិតឆ្នើមពេញលេញ
            </h3>
            <span className="text-xs bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-full font-mono">
              {rankedStudents.length} នាក់
            </span>
          </div>

          <button
            onClick={() => setShowPosterModal(true)}
            className="text-xs font-bold text-amber-500 hover:text-amber-400 flex items-center gap-1 cursor-pointer"
          >
            <span>បង្កើត Poster សម្រាប់បញ្ជីនេះ</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {rankedStudents.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Trophy className="w-12 h-12 text-slate-500 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold text-slate-400">មិនមានទិន្នន័យត្រូវតាមលក្ខខណ្ឌនេះទេ</p>
          </div>
        ) : (
          <div>
            {/* Mobile Cards View (< 768px) */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800/80 p-3 space-y-3">
              {rankedStudents.map((st) => {
                const isTop3 = st.honorsRank <= 3;
                return (
                  <div
                    key={st.studentId}
                    className={`p-4 rounded-2xl border transition-all ${
                      st.honorsRank === 1
                        ? "bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/40 shadow-sm"
                        : isTop3
                        ? "bg-slate-50 dark:bg-slate-800/50 border-indigo-500/20"
                        : "bg-white dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-mono font-bold ${
                            st.honorsRank === 1
                              ? "bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 shadow-md"
                              : st.honorsRank === 2
                              ? "bg-slate-300 text-slate-950"
                              : st.honorsRank === 3
                              ? "bg-amber-700 text-white"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                          }`}
                        >
                          #{st.honorsRank}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{st.fullNameKh}</span>
                            {st.honorsRank === 1 && <Crown className="w-4 h-4 text-amber-400 shrink-0" />}
                          </div>
                          <span className="text-xs text-slate-400 font-mono">{st.studentId}</span>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                          st.honorsRank === 1
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : isTop3
                            ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
                            : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                        }`}
                      >
                        <Star className="w-3 h-3 fill-current" />
                        {st.honorsRank === 1 ? "ជើងឯក" : isTop3 ? "Dean's" : "Honors"}
                      </span>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400 truncate max-w-[160px]">{st.major}</span>
                      <div className="flex items-center gap-3">
                        <div>
                          <span className="text-[10px] text-slate-400">ពិន្ទុ: </span>
                          <span className="font-mono font-bold text-amber-500 dark:text-amber-400">{st.totalScore.toFixed(1)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400">GPA: </span>
                          <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{st.gpa}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {st.overallGrade}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View (>= 768px) */}
            <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-800/40">
                  <th className="py-3.5 px-4 text-center w-16">លំដាប់</th>
                  <th className="py-3.5 px-4">អត្តលេខ</th>
                  <th className="py-3.5 px-4">គោត្តនាម-នាម</th>
                  <th className="py-3.5 px-4">ជំនាញ / ដេប៉ាតឺម៉ង់</th>
                  <th className="py-3.5 px-4 text-center">ពិន្ទុសរុប</th>
                  <th className="py-3.5 px-4 text-center">និទ្ទេស</th>
                  <th className="py-3.5 px-4 text-center">GPA</th>
                  <th className="py-3.5 px-4 text-center">កិត្តិយស</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
                {rankedStudents.map((st) => {
                  const isTop3 = st.honorsRank <= 3;
                  return (
                    <tr
                      key={st.studentId}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                        st.honorsRank === 1
                          ? "bg-amber-500/5 font-semibold"
                          : ""
                      }`}
                    >
                      {/* Rank badge */}
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-mono font-bold ${
                            st.honorsRank === 1
                              ? "bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 shadow-md"
                              : st.honorsRank === 2
                              ? "bg-slate-300 text-slate-950"
                              : st.honorsRank === 3
                              ? "bg-amber-700 text-white"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                          }`}
                        >
                          #{st.honorsRank}
                        </span>
                      </td>

                      {/* Student ID */}
                      <td className="py-4 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                        {st.studentId}
                      </td>

                      {/* Student Name */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{st.fullNameKh}</span>
                          {st.honorsRank === 1 && (
                            <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                          )}
                        </div>
                        {st.fullNameEn && (
                          <div className="text-xs text-slate-400 font-medium">
                            {st.fullNameEn}
                          </div>
                        )}
                      </td>

                      {/* Major */}
                      <td className="py-4 px-4 text-xs text-slate-600 dark:text-slate-300">
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium">
                          {st.major}
                        </span>
                      </td>

                      {/* Total Score */}
                      <td className="py-4 px-4 text-center">
                        <span className="font-mono font-extrabold text-base text-amber-500 dark:text-amber-400">
                          {st.totalScore.toFixed(1)}
                        </span>
                      </td>

                      {/* Grade */}
                      <td className="py-4 px-4 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {st.overallGrade}
                        </span>
                      </td>

                      {/* GPA */}
                      <td className="py-4 px-4 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                        {st.gpa}
                      </td>

                      {/* Award Title */}
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                            st.honorsRank === 1
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              : isTop3
                              ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
                              : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                          }`}
                        >
                          <Star className="w-3 h-3 fill-current" />
                          {st.honorsRank === 1
                            ? "ជើងឯកឆ្នើម"
                            : isTop3
                            ? "Dean's Honors"
                            : "Honors List"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </div>

      {/* 1-Tap Honor Poster Generator Modal */}
      <HonorPosterModal
        isOpen={showPosterModal}
        onClose={() => setShowPosterModal(false)}
        topStudents={rankedStudents}
        schoolInfo={schoolInfo}
        selectedMajor={selectedMajor === "ទាំងអស់ (All Majors)" ? (schoolInfo?.department || schoolInfo?.subject || "គណនេយ្យ") : selectedMajor}
        academicYear={`${schoolInfo?.academicYear || "២០២៥-២០២៦"} • ${schoolInfo?.semester || "ឆមាសទី ១"}`}
      />
    </div>
  );
}
