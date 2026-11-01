import React, { useState } from "react";
import {
  AlertTriangle,
  ShieldAlert,
  ChevronRight,
  TrendingDown,
  UserX,
  Mail,
  Filter,
  CheckCircle2,
  X,
  Send,
  Sparkles,
  Info,
  Eye,
  Download,
  Search,
  Copy,
  Check,
  Printer,
  ExternalLink,
  BookOpen
} from "lucide-react";
import { Link } from "react-router-dom";

export default function AtRiskStudentsWidget({ students = [] }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [interventionNote, setInterventionNote] = useState("");
  const [noteSent, setNoteSent] = useState(false);
  const [filterRisk, setFilterRisk] = useState("all"); // 'all' | 'high' (<40) | 'medium' (40-49.9)
  const [filterRoom, setFilterRoom] = useState("all");
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  const getStudentInfo = (s) => {
    const p = s.profile || {};
    return {
      id: s.studentId || p.studentId || s.id || "",
      fullNameKh: s.fullNameKh || p.fullNameKh || s.nameKh || s.fullNameEn || p.fullName || "",
      fullNameEn: s.fullNameEn || p.fullNameEn || s.fullName || p.fullName || "",
      gender: s.gender || p.gender || "ប្រុស",
      room: s.room || p.room || s.class || p.class || "ថ្នាក់ទូទៅ",
      major: s.skill || s.major || p.skill || p.major || p.faculty || "វិទ្យាសាស្ត្រកុំព្យូទ័រ"
    };
  };

  // Determine at-risk criteria: STRICTLY total score under 50 (< 50)
  const analyzedStudents = (students || []).map((s) => {
    const sum = s.academicSummary || {};

    let total = null;
    if (sum.totalScore !== null && sum.totalScore !== undefined && !isNaN(sum.totalScore) && sum.totalScore !== "") {
      total = Number(sum.totalScore);
    } else if (s.scores && s.scores.length > 0) {
      total = s.scores.reduce((acc, it) => acc + (Number(it.score) || 0), 0);
    }

    const attendance = sum.attendance !== null && sum.attendance !== undefined && !isNaN(sum.attendance) && sum.attendance !== ""
      ? Number(sum.attendance)
      : null;

    const midterm = sum.midterm !== null && sum.midterm !== undefined && !isNaN(sum.midterm) && sum.midterm !== ""
      ? Number(sum.midterm)
      : null;

    const finalScore = sum.finalScore !== null && sum.finalScore !== undefined && !isNaN(sum.finalScore) && sum.finalScore !== ""
      ? Number(sum.finalScore)
      : null;

    const qha = sum.totalQHA !== null && sum.totalQHA !== undefined && !isNaN(sum.totalQHA) && sum.totalQHA !== ""
      ? Number(sum.totalQHA)
      : null;

    // Condition requested by user: At Risk for students whose total score is under 50
    const isAtRisk = total !== null && total < 50;

    const reasons = [];
    if (total !== null) {
      if (total < 40) {
        reasons.push(`ពិន្ទុសរុបខ្សោយខ្លាំង (${total.toFixed(1)}/១០០)`);
      } else {
        reasons.push(`ពិន្ទុសរុបទាបជាង ៥០ (${total.toFixed(1)}/១០០)`);
      }
    }
    if (attendance !== null && attendance < 7) {
      reasons.push(`វត្តមានខ្វះច្រើន (${attendance}/១០)`);
    }
    if (midterm !== null && midterm < 12.5) {
      reasons.push(`Midterm ធ្លាក់ (${midterm}/២៥)`);
    }
    if (finalScore !== null && finalScore < 25) {
      reasons.push(`Final ធ្លាក់ (${finalScore}/៥០)`);
    }

    const severity = total !== null && total < 40 ? "high" : "medium";

    return {
      ...s,
      totalScore: total !== null ? total : 0,
      attendanceScore: attendance,
      midtermScore: midterm,
      finalScore: finalScore,
      qhaScore: qha,
      reasons,
      isAtRisk,
      severity
    };
  }).filter((s) => s.isAtRisk);

  // Distinct rooms for filtering
  const distinctRooms = Array.from(
    new Set(analyzedStudents.map((s) => getStudentInfo(s).room).filter(Boolean))
  );

  // Apply filters inside modal
  const displayedList = analyzedStudents.filter((s) => {
    const info = getStudentInfo(s);

    if (filterRisk === "high" && s.severity !== "high") return false;
    if (filterRisk === "medium" && s.severity !== "medium") return false;

    if (filterRoom !== "all" && info.room !== filterRoom) return false;

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const match =
        info.id.toLowerCase().includes(q) ||
        info.fullNameKh.toLowerCase().includes(q) ||
        info.fullNameEn.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  const highRiskCount = analyzedStudents.filter((s) => s.severity === "high").length;
  const mediumRiskCount = analyzedStudents.filter((s) => s.severity === "medium").length;

  const handleCopyId = (id, e) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleExportCSV = (e) => {
    if (e) e.stopPropagation();
    if (!analyzedStudents.length) return;

    const headers = [
      "លេខសម្គាល់ (ID)",
      "ឈ្មោះជាភាសាខ្មែរ",
      "ឈ្មោះអក្សរឡាតាំង",
      "បន្ទប់/ថ្នាក់",
      "ជំនាញ",
      "ពិន្ទុសរុប",
      "វត្តមាន",
      "ពាក់កណ្តាលឆមាស",
      "បញ្ចប់ឆមាស",
      "កម្រិតហានិភ័យ",
      "មូលហេតុ"
    ];

    const rows = analyzedStudents.map((st) => {
      const info = getStudentInfo(st);
      return [
        `"${info.id}"`,
        `"${info.fullNameKh}"`,
        `"${info.fullNameEn}"`,
        `"${info.room}"`,
        `"${info.major}"`,
        `"${st.totalScore.toFixed(2)}"`,
        `"${st.attendanceScore !== null ? st.attendanceScore : ""}"`,
        `"${st.midtermScore !== null ? st.midtermScore : ""}"`,
        `"${st.finalScore !== null ? st.finalScore : ""}"`,
        `"${st.severity === "high" ? "ធ្ងន់ធ្ងរ (<40)" : "មធ្យម (40-49)"}"`,
        `"${st.reasons.join(", ")}"`
      ];
    });

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `បញ្ជីសិស្សប្រឈមធ្លាក់_ពិន្ទុក្រោម៥០_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendIntervention = (e) => {
    e.preventDefault();
    setNoteSent(true);
    setTimeout(() => {
      setNoteSent(false);
      setSelectedStudent(null);
      setInterventionNote("");
    }, 1500);
  };

  return (
    <>
      {/* ============================================================ */}
      {/* COMPACT SMALL BOX ON ADMIN DASHBOARD (ONE TAP TO OPEN)       */}
      {/* ============================================================ */}
      {analyzedStudents.length > 0 ? (
        <div
          onClick={() => setShowModal(true)}
          className="group relative p-[1px] rounded-2xl bg-gradient-to-r from-rose-500/35 via-red-500/25 to-amber-500/30 hover:from-rose-500/60 hover:to-amber-500/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-rose-500/10 cursor-pointer font-khmer"
          title="ចុចដើម្បីពិនិត្យបញ្ជីនិស្សិតប្រឈមនឹងការធ្លាក់ (ពិន្ទុ < ៥០) ដោយ ១-Tap"
        >
          <div className="relative h-full bg-white/95 dark:bg-[#0b1329]/95 backdrop-blur-xl rounded-[15px] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 to-red-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/30 group-hover:scale-105 transition-transform">
                <ShieldAlert className="w-5 h-5 animate-pulse" />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-400 border-2 border-white dark:border-[#0b1329] animate-ping" />
              </div>

              <div className="space-y-0.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                    ប្រព័ន្ធផ្តល់សញ្ញាអាសន្នសិស្សរៀនខ្សោយ (At-Risk Early Warning)
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 shrink-0">
                    {analyzedStudents.length} នាក់ (ពិន្ទុ &lt; ៥០)
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  រកឃើញនិស្សិត {analyzedStudents.length} នាក់ ដែលមានពិន្ទុសរុបក្រោម ៥០ (Total Score &lt; 50) ប្រឈមនឹងការធ្លាក់
                </p>
              </div>
            </div>

            {/* Action Area: One-Tap Trigger */}
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              {highRiskCount > 0 && (
                <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-600/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>ធ្ងន់ធ្ងរ (&lt; ៤០)៖ {highRiskCount}</span>
                </span>
              )}
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-600/25 transition-all group-hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>ពិនិត្យបញ្ជីលម្អិត (One Tap)</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={() => setShowModal(true)}
          className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-khmer cursor-pointer hover:bg-emerald-500/15 transition-all shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  ប្រព័ន្ធផ្តល់សញ្ញាអាសន្នសិស្សរៀនខ្សោយ (At-Risk Early Warning)
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                  ០ នាក់ (ពិន្ទុ &lt; ៥០)
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ស្ថានភាពសិក្សាទូទៅល្អប្រសើរ • និស្សិតទាំងអស់មានពិន្ទុសរុបចាប់ពី ៥០ ឡើងទៅ (ជាប់ ១០០%)
              </p>
            </div>
          </div>

          <button
            type="button"
            className="self-end sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>ពិនិត្យទិន្នន័យ (One Tap)</span>
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* ONE-TAP FULL AT-RISK STUDENTS INSPECTION & INTERVENTION MODAL */}
      {/* ============================================================ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-md font-khmer animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl max-h-[92vh] bg-white dark:bg-[#0b1329] rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-white/10 flex items-center justify-between bg-gradient-to-r from-rose-500/10 via-red-500/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center border border-rose-500/30 shadow-xs">
                  <ShieldAlert className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      ប្រព័ន្ធផ្តល់សញ្ញាអាសន្នសិស្សរៀនខ្សោយ (At-Risk Early Warning)
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-500 text-white shadow-xs">
                      {analyzedStudents.length} នាក់
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    បញ្ជីរាយនាមនិស្សិតដែលមានពិន្ទុសរុបក្រោម ៥០ (Total Score &lt; 50) ប្រឈមនឹងការធ្លាក់ និងត្រូវការអន្តរាគមន៍ជួយបន្ទាន់
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCSV}
                  disabled={analyzedStudents.length === 0}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer disabled:opacity-40"
                  title="ទាញយកបញ្ជីសិស្សប្រឈមធ្លាក់ជា CSV"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 sm:px-6 bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
              {/* Search input */}
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ស្វែងរកតាមឈ្មោះ ឬអត្តលេខ..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden"
                />
              </div>

              {/* Severity & Class filters */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Room / Class Dropdown */}
                {distinctRooms.length > 1 && (
                  <select
                    value={filterRoom}
                    onChange={(e) => setFilterRoom(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-300 cursor-pointer focus:outline-hidden"
                  >
                    <option value="all">គ្រប់ថ្នាក់ទាំងអស់</option>
                    {distinctRooms.map((rm) => (
                      <option key={rm} value={rm}>
                        ថ្នាក់ {rm}
                      </option>
                    ))}
                  </select>
                )}

                {/* Severity Pills */}
                <button
                  onClick={() => setFilterRisk("all")}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    filterRisk === "all"
                      ? "bg-rose-600 text-white shadow-xs"
                      : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  ទាំងអស់ ({analyzedStudents.length})
                </button>
                <button
                  onClick={() => setFilterRisk("high")}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    filterRisk === "high"
                      ? "bg-rose-600 text-white shadow-xs"
                      : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-rose-500"
                  }`}
                >
                  🚨 ធ្ងន់ធ្ងរ &lt; ៤០ ({highRiskCount})
                </button>
                <button
                  onClick={() => setFilterRisk("medium")}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    filterRisk === "medium"
                      ? "bg-amber-600 text-white shadow-xs"
                      : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-amber-500"
                  }`}
                >
                  ⚠️ មធ្យម ៤០-៤៩.៩ ({mediumRiskCount})
                </button>
              </div>
            </div>

            {/* Modal Body: Cards of At-Risk Students */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3.5">
              {displayedList.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    មិនមាននិស្សិតក្នុងលក្ខខណ្ឌនេះឡើយ
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    សូមសាកល្បងលុបពាក្យស្វែងរក ឬផ្លាស់ប្តូរតម្រងខាងលើ។
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {displayedList.map((st) => {
                    const info = getStudentInfo(st);
                    const isHigh = st.severity === "high";

                    return (
                      <div
                        key={info.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                          isHigh
                            ? "bg-rose-500/[0.04] dark:bg-rose-950/20 border-rose-500/30 hover:border-rose-500/60 shadow-xs"
                            : "bg-amber-500/[0.04] dark:bg-amber-950/20 border-amber-500/30 hover:border-amber-500/60 shadow-xs"
                        }`}
                      >
                        <div className="space-y-3">
                          {/* Student Header */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                {info.fullNameKh || info.fullNameEn || "និស្សិត"}
                              </h4>
                              <p className="text-[11px] text-slate-500 font-mono truncate">
                                {info.fullNameEn || "—"}
                              </p>
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono mt-0.5">
                                <span className="font-bold text-slate-700 dark:text-slate-300">{info.id}</span>
                                <button
                                  type="button"
                                  onClick={(e) => handleCopyId(info.id, e)}
                                  className="text-slate-400 hover:text-cyan-500 cursor-pointer"
                                  title="ចម្លងអត្តលេខ"
                                >
                                  {copiedId === info.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                </button>
                                <span>•</span>
                                <span className="text-slate-600 dark:text-slate-400 font-khmer">ថ្នាក់ {info.room}</span>
                              </div>
                            </div>

                            {/* Total Score Badge */}
                            <div className="text-right shrink-0">
                              <div className="px-2.5 py-1 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-bold">
                                <span className="text-sm font-black font-mono">{st.totalScore.toFixed(1)}</span>
                                <span className="text-[10px] text-slate-400 font-mono ml-0.5">/100</span>
                              </div>
                              <span className="text-[10px] text-rose-500 font-bold block mt-0.5">
                                {isHigh ? "🚨 < ៤០" : "⚠️ ៤០ - ៤៩.៩"}
                              </span>
                            </div>
                          </div>

                          {/* Mini Score Breakdown */}
                          <div className="grid grid-cols-4 gap-1 p-2 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/5 text-[10px] text-center font-mono">
                            <div>
                              <span className="text-slate-400 block text-[9px] font-khmer">វត្តមាន</span>
                              <strong className={st.attendanceScore !== null && st.attendanceScore < 7 ? "text-amber-600 font-bold" : "text-slate-700 dark:text-slate-300"}>
                                {st.attendanceScore !== null ? `${st.attendanceScore}/10` : "-"}
                              </strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[9px] font-khmer">កិច្ចការ</span>
                              <strong className={st.qhaScore !== null && st.qhaScore < 7.5 ? "text-amber-600 font-bold" : "text-slate-700 dark:text-slate-300"}>
                                {st.qhaScore !== null ? `${st.qhaScore}/15` : "-"}
                              </strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[9px] font-khmer">Midterm</span>
                              <strong className={st.midtermScore !== null && st.midtermScore < 12.5 ? "text-rose-600 font-bold" : "text-slate-700 dark:text-slate-300"}>
                                {st.midtermScore !== null ? `${st.midtermScore}/25` : "-"}
                              </strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[9px] font-khmer">Final</span>
                              <strong className={st.finalScore !== null && st.finalScore < 25 ? "text-rose-600 font-bold" : "text-slate-700 dark:text-slate-300"}>
                                {st.finalScore !== null ? `${st.finalScore}/50` : "-"}
                              </strong>
                            </div>
                          </div>

                          {/* Specific Risk Reasons */}
                          <div className="space-y-1">
                            {st.reasons.map((r, i) => (
                              <div key={i} className="flex items-center gap-1.5 text-[10px] text-rose-600 dark:text-rose-400 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                                <span>{r}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Action Buttons Toolbar */}
                        <div className="pt-3 mt-3 border-t border-slate-200/60 dark:border-white/5 flex items-center justify-between gap-1 text-xs">
                          <Link
                            to={`/admin/print?studentId=${encodeURIComponent(st.profile?.studentId || st.studentId || "")}`}
                            state={{ student: st }}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => {
                              try {
                                const data = JSON.stringify(st);
                                localStorage.setItem("active_print_student", data);
                                sessionStorage.setItem("active_print_student", data);
                              } catch (_) {}
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                            title="បោះពុម្ពព្រឹត្តិបត្រពិន្ទុសម្រាប់សិស្សនេះ"
                          >
                            <Printer className="w-3 h-3 text-cyan-500" />
                            <span>ព្រឹត្តិបត្រ</span>
                          </Link>

                          <div className="flex items-center gap-1">
                            <Link
                              to="/admin/scoring"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-[11px] font-semibold transition-colors"
                              title="ទៅកាន់តារាងពិន្ទុដើម្បីកែប្រែ"
                            >
                              <span>កែពិន្ទុ</span>
                              <ChevronRight className="w-3 h-3" />
                            </Link>

                            <button
                              type="button"
                              onClick={() => setSelectedStudent(st)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold shadow-xs transition-colors cursor-pointer"
                              title="កត់ត្រាការណែនាំ ឬផែនការជួយសិស្ស"
                            >
                              <Mail className="w-3 h-3" />
                              <span>ណែនាំ</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-slate-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Info className="w-4 h-4 text-cyan-500 shrink-0" />
                <span>
                  សិស្សដែលមានពិន្ទុសរុប &lt; ៥០ ត្រូវបានកំណត់ជា <strong>At-Risk</strong> យោងតាមស្តង់ដារអប្បបរមា ៥០% (និទ្ទេស C) ឡើងទៅ។
                </span>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <Link
                  to="/admin/scoring"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-xs"
                >
                  ទៅកាន់តារាងពិន្ទុរួម
                </Link>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold transition-colors cursor-pointer"
                >
                  បិទផ្ទាំង
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* INTERVENTION NOTE FORM DIALOG (NESTED)                        */}
      {/* ============================================================ */}
      {selectedStudent && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm font-khmer animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-[#0c1427] border border-rose-500/30 rounded-3xl p-6 text-slate-900 dark:text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">វិធានការជួយសិស្សរៀនខ្សោយ (Intervention Note)</h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {getStudentInfo(selectedStudent).fullNameKh} ({getStudentInfo(selectedStudent).id})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {noteSent ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-emerald-500">បានកត់ត្រា និងរក្សាទុកកំណត់ចំណាំជោគជ័យ!</h4>
                <p className="text-xs text-slate-400">ប្រព័ន្ធបានកត់ត្រាផែនការអន្តរាគមន៍សម្រាប់សិស្សរូបនេះរួចរាល់។</p>
              </div>
            ) : (
              <form onSubmit={handleSendIntervention} className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 space-y-1">
                  <div className="font-semibold text-rose-700 dark:text-rose-300">
                    ពិន្ទុសរុប៖ <span className="font-mono">{selectedStudent.totalScore.toFixed(1)} / 100</span> (ក្រោម ៥០)
                  </div>
                  <ul className="list-disc pl-4 text-slate-600 dark:text-slate-300 space-y-0.5">
                    {selectedStudent.reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    វិធានការ ឬផែនការជួយសិស្ស (Intervention Plan) *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="ឧ. ហៅសិស្សមកជួបពន្យល់បន្ថែមលើមុខវិជ្ជាខ្សោយ ឬផ្តល់ឱកាសធ្វើកិច្ចការស្រាវជ្រាវសងវត្តមាន..."
                    value={interventionNote}
                    onChange={(e) => setInterventionNote(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setSelectedStudent(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold cursor-pointer"
                  >
                    បោះបង់
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer shadow-md shadow-rose-600/30"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>រក្សាទុកកំណត់ចំណាំ</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
