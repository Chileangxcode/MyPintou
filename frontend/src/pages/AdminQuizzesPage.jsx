import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ClipboardList,
  Sparkles,
  Search,
  Filter,
  Plus,
  Edit3,
  Trash2,
  Save,
  RotateCcw,
  RefreshCw,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  TrendingUp,
  BarChart3,
  Award,
  Users,
  Layers,
  ChevronDown,
  ChevronUp,
  Eye,
  Sliders,
  Check,
  Trophy,
  SlidersHorizontal,
  Flame,
  FileSpreadsheet,
  Zap,
  Clock
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
import {
  getAdminQuizzes,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  updateStudentQuizzes,
  resetStudentQuizzes,
  syncQuizStudents,
  forceLiveSyncSpreadsheet
} from "../api/adminApi.js";
import StatusBadge from "../components/StatusBadge.jsx";
import RealtimeIndicator from "../components/RealtimeIndicator.jsx";
import { SkeletonTable } from "../components/LoadingSkeleton.jsx";
import { useAutoRefresh } from "../hooks/useAutoRefresh.js";

// Custom Cyber Tooltip for Recharts
const CustomChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900/95 dark:bg-[#070b14]/95 border border-cyan-500/30 rounded-xl px-3.5 py-2.5 shadow-xl shadow-cyan-950/40 backdrop-blur-md">
        <p className="text-xs font-bold text-white font-khmer">{data.name}</p>
        <p className="text-sm font-bold text-cyan-400 font-mono mt-0.5">
          {data.averageScore} / {data.maxScore} pts ({data.averagePercentage}%)
        </p>
        <p className="text-[11px] text-slate-400 font-khmer mt-0.5">
          និស្សិតបានប្រឡង: {data.completedCount} / {data.totalCount} នាក់
        </p>
      </div>
    );
  }
  return null;
};

export default function AdminQuizzesPage() {
  const { adminSession } = useAuth();
  const { schoolInfo } = useSchool();
  const token = adminSession?.token || "MyPintou#Sec2026$X9z";

  // Data states
  const [quizzesData, setQuizzesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Active Tab: 'matrix' | 'quizzes' | 'analytics'
  const [activeTab, setActiveTab] = useState("matrix");

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortField, setSortField] = useState("studentId");
  const [sortAsc, setSortAsc] = useState(true);

  // Inline Quick Editing
  const [isInlineEditMode, setIsInlineEditMode] = useState(false);
  const [inlineDirtyScores, setInlineDirtyScores] = useState({}); // { [studentId]: { [quizName]: val } }
  const [isSavingInline, setIsSavingInline] = useState(false);

  // Modals
  // 1. Student Quiz Modal
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentModalScores, setStudentModalScores] = useState({});
  const [isSavingStudent, setIsSavingStudent] = useState(false);

  // 2. Create Quiz Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createQuizForm, setCreateQuizForm] = useState({ name: "", maxScore: 10, description: "" });
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);

  // 3. Edit Quiz Modal
  const [editQuizModal, setEditQuizModal] = useState(null);
  const [isUpdatingQuiz, setIsUpdatingQuiz] = useState(false);

  // 4. Delete Quiz Modal
  const [deleteQuizConfirm, setDeleteQuizConfirm] = useState(null);
  const [isDeletingQuiz, setIsDeletingQuiz] = useState(false);

  // 5. Reset Student Quiz Modal
  const [resetConfirmStudent, setResetConfirmStudent] = useState(null);
  const [isResetting, setIsResetting] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState({ type: "", text: "" });

  const showToast = (text, type = "success") => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage({ type: "", text: "" });
    }, 4000);
  };

  // Fetch Data (SWR fast-path: never block UI if data already exists!)
  const fetchData = async (silent = false, isBypass = false) => {
    if (!silent && !quizzesData) setLoading(true);
    else setIsSyncing(true);

    try {
      const res = await getAdminQuizzes(token, { refresh: isBypass ? "true" : "false" });
      if (res && res.success && res.data) {
        setQuizzesData(res.data);
        setLastSyncTime(new Date());
      } else if (!silent) {
        showToast(res?.message || "មិនអាចទាញយកទិន្នន័យកម្រងសំណួរបានឡើយ។", "error");
      }
    } catch (err) {
      if (!silent) showToast(err.message || "មានបញ្ហាតភ្ជាប់ទៅកាន់ប្រព័ន្ធ។", "error");
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  };

  // ⚡ 10x Fast Live Sync directly with Google Sheets (Bypasses server & browser caches)
  const handleForceSyncGoogleSheets = async () => {
    setIsSyncing(true);
    showToast("⚡ កំពុងទាញយកទិន្នន័យផ្ទាល់ពី Google Sheets...", "info");
    try {
      await forceLiveSyncSpreadsheet(token);
      await fetchData(true, true);
      showToast("⚡ សមកាលកម្មទិន្នន័យផ្ទាល់ពី Google Sheets ជោគជ័យ ១០០%!", "success");
    } catch (err) {
      showToast(err.message || "កំហុសពេលធ្វើសមកាលកម្ម", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchData();

    // SWR background cache listeners
    const handleCacheUpdated = (e) => {
      if (e.detail?.action === "admin_scoring_overview" || e.detail?.action === "admin_quizzes") {
        fetchData(true);
      }
    };

    const handleForceSynced = () => {
      fetchData(true);
    };

    window.addEventListener("pintou:cache-updated", handleCacheUpdated);
    window.addEventListener("pintou:force-synced", handleForceSynced);

    return () => {
      window.removeEventListener("pintou:cache-updated", handleCacheUpdated);
      window.removeEventListener("pintou:force-synced", handleForceSynced);
    };
  }, [token]);

  useAutoRefresh(() => fetchData(true), 25000);

  // Extracted core structures
  const quizzesList = quizzesData?.quizzes || [];
  const studentsList = quizzesData?.students || [];
  const totalMaxScore = quizzesData?.totalMaxScore || 100;
  const stats = quizzesData?.stats || {};
  const quizStats = quizzesData?.quizStats || [];

  // Available Rooms
  const availableRooms = useMemo(() => {
    const list = Array.from(new Set(studentsList.map((s) => s.room).filter(Boolean)));
    return list.length > 0 ? list : ["101", "M1", "M2", "N"];
  }, [studentsList]);

  // Filtered & Sorted Students
  const filteredStudents = useMemo(() => {
    let result = [...studentsList];

    // Room filter
    if (selectedRoom !== "all") {
      result = result.filter((s) => s.room === selectedRoom);
    }

    // Status filter
    if (selectedStatus === "complete") {
      result = result.filter((s) => s.completedCount >= quizzesList.length);
    } else if (selectedStatus === "incomplete") {
      result = result.filter((s) => s.completedCount < quizzesList.length);
    } else if (selectedStatus === "high") {
      result = result.filter((s) => s.scaled15 >= 12);
    } else if (selectedStatus === "low") {
      result = result.filter((s) => s.scaled15 < 7.5);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (s) =>
          String(s.studentId).toLowerCase().includes(q) ||
          String(s.fullNameKh || "").toLowerCase().includes(q) ||
          String(s.fullNameEn || "").toLowerCase().includes(q) ||
          String(s.room || "").toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === "name") {
        valA = a.fullNameKh || a.fullNameEn || "";
        valB = b.fullNameKh || b.fullNameEn || "";
      }

      if (typeof valA === "string") {
        const cmp = valA.localeCompare(valB);
        return sortAsc ? cmp : -cmp;
      }
      return sortAsc ? (valA || 0) - (valB || 0) : (valB || 0) - (valA || 0);
    });

    return result;
  }, [studentsList, selectedRoom, selectedStatus, searchQuery, sortField, sortAsc, quizzesList.length]);

  // ==========================================
  // INLINE QUICK EDIT HANDLERS
  // ==========================================
  const handleInlineScoreChange = (studentId, quizName, maxPoints, rawVal) => {
    let val = null;
    if (rawVal !== "" && rawVal !== null && rawVal !== undefined) {
      val = Math.max(0, Math.min(maxPoints, Number(rawVal)));
    }

    setInlineDirtyScores((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [quizName]: val
      }
    }));
  };

  const dirtyCount = Object.keys(inlineDirtyScores).length;

  const handleSaveAllInline = async () => {
    if (dirtyCount === 0) return;
    setIsSavingInline(true);

    const backupData = quizzesData ? JSON.parse(JSON.stringify(quizzesData)) : null;
    const updates = Object.entries(inlineDirtyScores).map(([sid, scores]) => ({
      studentId: sid,
      scores
    }));

    // 1. Instant local optimistic update (0ms UI feedback!)
    setQuizzesData((prev) => {
      if (!prev || !prev.students) return prev;
      return {
        ...prev,
        students: prev.students.map((s) => {
          if (!inlineDirtyScores[s.studentId]) return s;
          const mergedScores = { ...(s.scores || {}), ...inlineDirtyScores[s.studentId] };
          const scoreValues = Object.values(mergedScores).filter((v) => v !== null && v !== "" && !isNaN(v));
          const totalPoints = scoreValues.reduce((a, b) => a + Number(b), 0);
          const scaled15 = Math.round((totalPoints / 255) * 15 * 10) / 10;
          return {
            ...s,
            scores: mergedScores,
            totalPoints,
            scaled15
          };
        })
      };
    });

    setInlineDirtyScores({});
    showToast("បានរក្សាទុកពិន្ទុកែសម្រួលរហ័សដោយជោគជ័យ!", "success");

    // 2. Single Batch Write to Google Sheets
    try {
      const res = await updateStudentQuizzes(token, "", updates, true);
      if (!res || !res.success) {
        if (backupData) setQuizzesData(backupData);
        showToast(res?.message || "មិនអាចរក្សាទុកពិន្ទុបានឡើយ។", "error");
      }
    } catch (err) {
      if (backupData) setQuizzesData(backupData);
      showToast(err.message || "កំហុសបណ្តាញ", "error");
    } finally {
      setIsSavingInline(false);
    }
  };

  // ==========================================
  // STUDENT DETAIL MODAL HANDLERS
  // ==========================================
  const openStudentModal = (student) => {
    setSelectedStudent(student);
    const initialScores = {};
    quizzesList.forEach((q) => {
      initialScores[q.name] = student.scores?.[q.name] ?? "";
    });
    setStudentModalScores(initialScores);
  };

  const handleSaveStudentModal = async () => {
    if (!selectedStudent) return;
    const targetSid = selectedStudent.studentId;
    const targetName = selectedStudent.fullNameKh || selectedStudent.studentId;
    setIsSavingStudent(true);

    const formattedScores = {};
    quizzesList.forEach((q) => {
      const raw = studentModalScores[q.name];
      formattedScores[q.name] = raw !== "" && raw !== null && raw !== undefined ? Number(raw) : null;
    });

    const scoreValues = Object.values(formattedScores).filter((v) => v !== null && v !== "" && !isNaN(v));
    const totalPoints = scoreValues.reduce((a, b) => a + Number(b), 0);
    const scaled15 = Math.round((totalPoints / 255) * 15 * 10) / 10;

    const backupData = quizzesData ? JSON.parse(JSON.stringify(quizzesData)) : null;

    // 1. Instant local optimistic update (0ms!)
    setQuizzesData((prev) => {
      if (!prev || !prev.students) return prev;
      return {
        ...prev,
        students: prev.students.map((s) => {
          if (s.studentId !== targetSid) return s;
          return {
            ...s,
            scores: formattedScores,
            totalPoints,
            scaled15
          };
        })
      };
    });

    setSelectedStudent(null);
    showToast(`បានកែប្រែពិន្ទុនិស្សិត ${targetName} ជោគជ័យ!`);

    // 2. Background sync
    try {
      const res = await updateStudentQuizzes(token, targetSid, formattedScores);
      if (!res || !res.success) {
        if (backupData) setQuizzesData(backupData);
        showToast(res?.message || "មិនអាចរក្សាទុកបានឡើយ", "error");
      }
    } catch (err) {
      if (backupData) setQuizzesData(backupData);
      showToast(err.message || "កំហុសបណ្តាញ", "error");
    } finally {
      setIsSavingStudent(false);
    }
  };

  // Calculate live total in Student Modal
  const studentModalLiveStats = useMemo(() => {
    if (!selectedStudent) return { rawSum: 0, scaled15: 0, pct: 0 };
    let rawSum = 0;
    quizzesList.forEach((q) => {
      const val = studentModalScores[q.name];
      if (val !== "" && val !== null && val !== undefined) {
        rawSum += Number(val);
      }
    });
    const scaled15 = totalMaxScore > 0 ? Math.round((rawSum / totalMaxScore) * 15 * 100) / 100 : 0;
    const pct = totalMaxScore > 0 ? Math.round((rawSum / totalMaxScore) * 1000) / 10 : 0;
    return { rawSum: Math.round(rawSum * 10) / 10, scaled15, pct };
  }, [selectedStudent, studentModalScores, quizzesList, totalMaxScore]);

  // ==========================================
  // QUIZ COLUMN CRUD HANDLERS
  // ==========================================
  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    if (!createQuizForm.name.trim()) return;
    setIsCreatingQuiz(true);

    try {
      const res = await createQuiz(token, createQuizForm);
      if (res && res.success) {
        showToast(`បានបង្កើត Quiz ថ្មី "${createQuizForm.name}" ជោគជ័យ!`);
        setIsCreateModalOpen(false);
        setCreateQuizForm({ name: "", maxScore: 10, description: "" });
        await fetchData(true);
      } else {
        showToast(res?.message || "មិនអាចបង្កើត Quiz បានឡើយ", "error");
      }
    } catch (err) {
      showToast(err.message || "កំហុសបណ្តាញ", "error");
    } finally {
      setIsCreatingQuiz(false);
    }
  };

  const handleUpdateQuiz = async (e) => {
    e.preventDefault();
    if (!editQuizModal) return;
    setIsUpdatingQuiz(true);

    try {
      const res = await updateQuiz(token, editQuizModal.id, {
        name: editQuizModal.name,
        maxScore: Number(editQuizModal.maxScore) || 10,
        oldName: editQuizModal.originalName
      });
      if (res && res.success) {
        showToast(`បានកែប្រែ Quiz "${editQuizModal.name}" ជោគជ័យ!`);
        setEditQuizModal(null);
        await fetchData(true);
      } else {
        showToast(res?.message || "មិនអាចកែប្រែ Quiz បានឡើយ", "error");
      }
    } catch (err) {
      showToast(err.message || "កំហុសបណ្តាញ", "error");
    } finally {
      setIsUpdatingQuiz(false);
    }
  };

  const handleDeleteQuiz = async () => {
    if (!deleteQuizConfirm) return;
    setIsDeletingQuiz(true);

    try {
      const res = await deleteQuiz(token, deleteQuizConfirm.id);
      if (res && res.success) {
        showToast(`បានលុប Quiz "${deleteQuizConfirm.name}" ចេញពីប្រព័ន្ធ!`);
        setDeleteQuizConfirm(null);
        await fetchData(true);
      } else {
        showToast(res?.message || "មិនអាចលុប Quiz បានឡើយ", "error");
      }
    } catch (err) {
      showToast(err.message || "កំហុសបណ្តាញ", "error");
    } finally {
      setIsDeletingQuiz(false);
    }
  };

  const handleResetStudent = async () => {
    if (!resetConfirmStudent) return;
    setIsResetting(true);

    try {
      const res = await resetStudentQuizzes(token, resetConfirmStudent.studentId);
      if (res && res.success) {
        showToast(`បានកំណត់ពិន្ទុ Quiz ទាំងអស់របស់និស្សិតឡើងវិញជោគជ័យ!`);
        setResetConfirmStudent(null);
        await fetchData(true);
      } else {
        showToast(res?.message || "មិនអាចកំណត់ឡើងវិញបានឡើយ", "error");
      }
    } catch (err) {
      showToast(err.message || "កំហុសបណ្តាញ", "error");
    } finally {
      setIsResetting(false);
    }
  };

  const handleSyncAllStudents = async () => {
    setIsSyncing(true);
    try {
      const res = await syncQuizStudents(token);
      if (res && res.success) {
        showToast(res.message || "បានធ្វើសមកាលកម្មកម្រងសំណួរនិស្សិតជោគជ័យ!");
        await fetchData(true);
      } else {
        showToast(res?.message || "មិនអាចធ្វើសមកាលកម្មបានឡើយ", "error");
      }
    } catch (err) {
      showToast(err.message || "កំហុសបណ្តាញ", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  // ==========================================
  // EXPORT CSV
  // ==========================================
  const handleExportCSV = () => {
    if (!filteredStudents.length) return;
    const quizHeaders = quizzesList.map((q) => `"${q.name} (${q.maxScore})"`);
    const headers = ["លេខសម្គាល់", "ឈ្មោះខ្មែរ", "បន្ទប់", ...quizHeaders, "ពិន្ទុសរុបជាក់ស្តែង", "ពិន្ទុពេញ", "ពិន្ទុ១៥% (QHA)", "ភាគរយ (%)", "និទ្ទេស"];

    const rows = filteredStudents.map((s) => {
      const qScores = quizzesList.map((q) => {
        const val = s.scores?.[q.name];
        return val !== null && val !== undefined ? `"${val}"` : `""`;
      });
      return [
        `"${s.studentId}"`,
        `"${s.fullNameKh || ""}"`,
        `"${s.room || ""}"`,
        ...qScores,
        `"${s.rawTotal}"`,
        `"${totalMaxScore}"`,
        `"${s.scaled15}"`,
        `"${s.percentage}%"`,
        `"${s.grade}"`
      ];
    });

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Student_Quizzes_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("បានទាញយកតារាងពិន្ទុ Quiz ជាឯកសារ CSV ជោគជ័យ!");
  };

  // Helper pill color for individual quiz score
  const getScoreColorClass = (score, max) => {
    if (score === null || score === undefined || score === "") return "text-slate-400 bg-slate-800/20 border-slate-700/40";
    const pct = (Number(score) / max) * 100;
    if (pct >= 85) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
    if (pct >= 70) return "text-cyan-400 bg-cyan-500/10 border-cyan-500/30";
    if (pct >= 50) return "text-amber-400 bg-amber-500/10 border-amber-500/30";
    return "text-rose-400 bg-rose-500/10 border-rose-500/30";
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      {toastMessage.text && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl border transition-all animate-bounce ${
            toastMessage.type === "error"
              ? "bg-rose-950/90 border-rose-500/50 text-rose-200"
              : toastMessage.type === "info"
              ? "bg-cyan-950/90 border-cyan-500/50 text-cyan-200"
              : "bg-emerald-950/90 border-emerald-500/50 text-emerald-200"
          }`}
        >
          {toastMessage.type === "error" ? (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          ) : toastMessage.type === "info" ? (
            <RefreshCw className="w-5 h-5 text-cyan-400 shrink-0 animate-spin" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          <span className="text-sm font-bold font-khmer">{toastMessage.text}</span>
          <button
            type="button"
            onClick={() => setToastMessage({ type: "", text: "" })}
            className="ml-2 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. Header Banner */}
      <div className="relative p-[1.5px] rounded-[30px] bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 shadow-xl shadow-cyan-950/20">
        <div className="relative rounded-[28.5px] bg-[#0c1427]/95 backdrop-blur-2xl p-6 sm:p-8 overflow-hidden text-white border border-white/10">
          <div className="cyber-grid absolute inset-0 opacity-20 pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-xs font-bold font-khmer">
                <ClipboardList className="w-3.5 h-3.5 text-cyan-400" />
                <span>គ្រប់គ្រងការវាយតម្លៃប្រចាំឆមាស • ទម្ងន់ពិន្ទុ ១៥% (QHA)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-khmer text-white tracking-wide flex items-center gap-3">
                <span>គ្រប់គ្រងកម្រងសំណួរនិស្សិត (Quizzes & Tasks)</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  {quizzesList.length} Quizzes
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-khmer max-w-2xl leading-relaxed">
                ផ្ទាំងគ្រប់គ្រងពិន្ទុកម្រងសំណួរប្រចាំឆមាស អាចបញ្ចូលពិន្ទុរហ័ស បង្កើត Quiz ថ្មី កែប្រែពិន្ទុពេញ និងបម្លែងស្វ័យប្រវត្តិចូលក្នុងពិន្ទុឆមាសរួម (១៥%)។
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  177W...AoF9E (📝_Quizzes)
                </span>
                {lastSyncTime && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-300 font-khmer">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>ធ្វើបច្ចុប្បន្នភាពចុងក្រោយ: {lastSyncTime.toLocaleTimeString()}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {/* ⚡ High Priority Live Sync Button */}
              <button
                type="button"
                onClick={handleForceSyncGoogleSheets}
                disabled={isSyncing}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-emerald-500/30 transition-all cursor-pointer font-khmer active:scale-95 disabled:opacity-50"
                title="សមកាលកម្មទិន្នន័យផ្ទាល់ ១០០% ពី Google Sheets (Bypass Server Cache)"
              >
                <Zap className={`w-4 h-4 text-amber-200 ${isSyncing ? "animate-spin" : "animate-pulse"}`} />
                <span>{isSyncing ? "កំពុង Sync ពី Sheets..." : "⚡ Sync ពី Google Sheets"}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 transition-all cursor-pointer font-khmer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>បន្ថែម Quiz ថ្មី</span>
              </button>

              <button
                type="button"
                onClick={handleSyncAllStudents}
                disabled={isSyncing}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-slate-200 text-xs font-bold backdrop-blur-md transition-all font-khmer disabled:opacity-50 cursor-pointer"
                title="សមកាលកម្មនិស្សិតពី Directory"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isSyncing ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Sync និស្សិត</span>
              </button>

              <button
                type="button"
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-slate-200 text-xs font-bold backdrop-blur-md transition-all font-khmer cursor-pointer"
                title="ទាញយកជា CSV"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>

              <button
                type="button"
                onClick={() => fetchData(true)}
                disabled={isSyncing || loading}
                className="p-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 transition-all cursor-pointer disabled:opacity-50"
                title="Refresh ទិន្នន័យ"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Quizzes */}
        <div className="relative p-5 rounded-2xl bg-white dark:bg-[#0f172a]/80 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-xl group hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-khmer">
              កម្រងសំណួរដែលបានកំណត់
            </span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center border border-cyan-500/20">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {quizzesList.length}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-khmer">កម្រងសំណួរ</span>
          </div>
          <p className="text-[11px] text-cyan-500 font-mono mt-1">
            ពិន្ទុពេញសរុប: {totalMaxScore} pts
          </p>
        </div>

        {/* Card 2: Class Average */}
        <div className="relative p-5 rounded-2xl bg-white dark:bg-[#0f172a]/80 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-xl group hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-khmer">
              ពិន្ទុមធ្យមថ្នាក់ (Class Average)
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
              {stats.classAverageScaled || 0}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">/ 15 pts (15%)</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-khmer mt-1">
            មធ្យមភាគរយ: <span className="font-mono text-indigo-400 font-bold">{stats.classAveragePct || 0}%</span>
          </p>
        </div>

        {/* Card 3: Class Submission Rate */}
        <div className="relative p-5 rounded-2xl bg-white dark:bg-[#0f172a]/80 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-xl group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-khmer">
              អត្រាចូលរួមប្រឡង (Completion)
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {studentsList.length > 0
                ? Math.round((studentsList.filter((s) => s.completedCount >= quizzesList.length).length / studentsList.length) * 100)
                : 0}%
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-khmer">បានបញ្ចប់គ្រប់ Quiz</span>
          </div>
          <p className="text-[11px] text-emerald-500 font-khmer mt-1">
            {studentsList.filter((s) => s.completedCount >= quizzesList.length).length} / {studentsList.length} នាក់
          </p>
        </div>

        {/* Card 4: Top Performer */}
        <div className="relative p-5 rounded-2xl bg-white dark:bg-[#0f172a]/80 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-xl group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-khmer">
              និស្សិតពិន្ទុខ្ពស់ជាងគេ (Top Scorer)
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-base font-black text-slate-900 dark:text-white font-khmer truncate block">
              {stats.topScorer ? stats.topScorer.name : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-amber-500 font-mono mt-1">
            <span>ID: {stats.topScorer ? stats.topScorer.studentId : "—"}</span>
            <span className="font-bold">{stats.topScorer ? `${stats.topScorer.scaled15} / 15 pts` : ""}</span>
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs & Mode Switch */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab("matrix")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer font-khmer ${
              activeTab === "matrix"
                ? "bg-white dark:bg-cyan-500 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>តារាងពិន្ទុរួម (Matrix)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("quizzes")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer font-khmer ${
              activeTab === "quizzes"
                ? "bg-white dark:bg-cyan-500 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>គ្រប់គ្រង Quiz នីមួយៗ ({quizzesList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer font-khmer ${
              activeTab === "analytics"
                ? "bg-white dark:bg-cyan-500 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>វិភាគស្ថិតិ & គំនូសតាង</span>
          </button>
        </div>

        {/* Right side: Quick inline edit toggle */}
        {activeTab === "matrix" && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setIsInlineEditMode(!isInlineEditMode);
                if (isInlineEditMode && dirtyCount > 0) {
                  // Prompt or clear dirty
                }
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer font-khmer ${
                isInlineEditMode
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-400 shadow-md shadow-amber-500/10"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300"
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>របៀបកែសម្រួលរហ័ស (Quick Edit)</span>
              {isInlineEditMode && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              )}
            </button>

            {isInlineEditMode && dirtyCount > 0 && (
              <button
                type="button"
                onClick={handleSaveAllInline}
                disabled={isSavingInline}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer font-khmer animate-pulse"
              >
                <Save className={`w-3.5 h-3.5 ${isSavingInline ? "animate-spin" : ""}`} />
                <span>រក្សាទុកទាំងអស់ ({dirtyCount})</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 4. Filters Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a]/70 border border-slate-200 dark:border-slate-800/80 shadow-sm backdrop-blur-xl flex flex-wrap items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ស្វែងរកតាម ID, ឈ្មោះនិស្សិត, បន្ទប់..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500 font-khmer"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Room Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-khmer hidden sm:inline">បន្ទប់:</span>
          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200 font-khmer focus:outline-none focus:border-cyan-500"
          >
            <option value="all">គ្រប់បន្ទប់ទាំងអស់ ({studentsList.length})</option>
            {availableRooms.map((r) => (
              <option key={r} value={r}>
                បន្ទប់ {r}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-khmer hidden sm:inline">ស្ថានភាព:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200 font-khmer focus:outline-none focus:border-cyan-500"
          >
            <option value="all">ទាំងអស់</option>
            <option value="complete">បានប្រឡងចប់គ្រប់ Quiz</option>
            <option value="incomplete">នៅខ្វះ Quiz</option>
            <option value="high">ពិន្ទុខ្ពស់ (≥ 12/15 pts)</option>
            <option value="low">ពិន្ទុទាប/ប្រឈម (&lt; 7.5/15 pts)</option>
          </select>
        </div>

        {/* Sort Field */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-khmer hidden sm:inline">តម្រៀប:</span>
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200 font-khmer focus:outline-none focus:border-cyan-500"
          >
            <option value="studentId">លេខសម្គាល់ (ID)</option>
            <option value="name">ឈ្មោះនិស្សិត</option>
            <option value="scaled15">ពិន្ទុ ១៥% (QHA)</option>
            <option value="rawTotal">ពិន្ទុសរុបជាក់ស្តែង</option>
            <option value="completedCount">ចំនួន Quiz ដែលបានធ្វើ</option>
          </select>
          <button
            type="button"
            onClick={() => setSortAsc(!sortAsc)}
            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-cyan-500 text-xs"
            title={sortAsc ? "ពីតូចទៅធំ" : "ពីធំទៅតូច"}
          >
            {sortAsc ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 5. TAB 1: MASTER QUIZZES MATRIX (Spreadsheet Grid) */}
      {activeTab === "matrix" && (
        <div className="relative rounded-2xl bg-white dark:bg-[#0c1427]/90 border border-slate-200 dark:border-slate-800/80 shadow-xl overflow-hidden">
          {loading ? (
            <div className="p-8">
              <SkeletonTable rows={10} />
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <ClipboardList className="w-12 h-12 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-400 font-khmer">
                រកមិនឃើញទិន្នន័យកម្រងសំណួរដែលត្រូវនឹងការស្វែងរកឡើយ។
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner">
              <table className="w-full min-w-[2100px] text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider font-khmer">
                    <th className="py-3.5 px-4 sticky left-0 bg-slate-100 dark:bg-slate-900 z-20 min-w-[195px] shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                      ព័ត៌មាននិស្សិត
                    </th>
                    <th className="py-3.5 px-2.5 text-center min-w-[70px]">បន្ទប់</th>
                    {/* Individual Quiz Columns */}
                    {quizzesList.map((quiz) => (
                      <th
                        key={quiz.id}
                        className="py-3 px-2 text-center min-w-[95px] max-w-[110px] border-l border-slate-200/60 dark:border-slate-800/60 group relative cursor-pointer hover:bg-cyan-500/5 transition-colors"
                        onClick={() => setEditQuizModal({ ...quiz, originalName: quiz.name })}
                        title={`ចុចដើម្បីកែប្រែ ${quiz.name} (Max: ${quiz.maxScore} pts)`}
                      >
                        <div className="flex flex-col items-center justify-center">
                          <span className="font-khmer text-cyan-600 dark:text-cyan-400 group-hover:underline text-[11px] leading-tight text-center line-clamp-2 px-1">
                            {quiz.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                            / {quiz.maxScore} pts
                          </span>
                        </div>
                      </th>
                    ))}
                    {/* Computed Summary Columns */}
                    <th className="py-3.5 px-3 text-center border-l-2 border-indigo-500/40 bg-indigo-500/5 min-w-[95px]">
                      ពិន្ទុសរុប
                    </th>
                    <th className="py-3.5 px-3 text-center bg-cyan-500/10 min-w-[115px]">
                      ពិន្ទុ ១៥% (QHA)
                    </th>
                    <th className="py-3.5 px-2 text-center min-w-[70px]">និទ្ទេស</th>
                    <th className="py-3.5 px-3 text-center sticky right-0 bg-slate-100 dark:bg-slate-900 z-20 min-w-[100px] shadow-[-2px_0_5px_rgba(0,0,0,0.05)]">
                      សកម្មភាព
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200">
                  {filteredStudents.map((student, idx) => {
                    const dirtyForStudent = inlineDirtyScores[student.studentId] || {};
                    const isStudentDirty = Object.keys(dirtyForStudent).length > 0;

                    return (
                      <tr
                        key={student.studentId}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${
                          isStudentDirty ? "bg-amber-500/5 dark:bg-amber-500/10" : ""
                        }`}
                      >
                        {/* Student Name & ID (Sticky Left) */}
                        <td className="py-3 px-4 sticky left-0 bg-white dark:bg-[#0c1427] z-10 font-khmer border-r border-slate-100 dark:border-slate-800/60">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 font-bold flex items-center justify-center shrink-0 font-mono text-xs">
                              {idx + 1}
                            </div>
                            <div className="min-w-0">
                              <p
                                onClick={() => openStudentModal(student)}
                                className="font-bold text-slate-900 dark:text-white truncate hover:text-cyan-400 cursor-pointer"
                              >
                                {student.fullNameKh || student.fullNameEn}
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
                                <span>{student.studentId}</span>
                                <span>•</span>
                                <span>{student.gender || "—"}</span>
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Room */}
                        <td className="py-3 px-2.5 text-center font-mono text-slate-400">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px]">
                            {student.room || "—"}
                          </span>
                        </td>

                        {/* Quiz Score Cells */}
                        {quizzesList.map((quiz) => {
                          const originalVal = student.scores?.[quiz.name];
                          const hasDirty = dirtyForStudent.hasOwnProperty(quiz.name);
                          const currentVal = hasDirty ? dirtyForStudent[quiz.name] : originalVal;

                          return (
                            <td
                              key={quiz.id}
                              className="py-2.5 px-1.5 text-center border-l border-slate-100 dark:border-slate-800/60"
                            >
                              {isInlineEditMode ? (
                                <input
                                  type="number"
                                  min="0"
                                  max={quiz.maxScore}
                                  step="0.5"
                                  value={currentVal !== null && currentVal !== undefined ? currentVal : ""}
                                  placeholder="—"
                                  onChange={(e) =>
                                    handleInlineScoreChange(student.studentId, quiz.name, quiz.maxScore, e.target.value)
                                  }
                                  className={`w-14 text-center py-1 rounded-lg text-xs font-mono font-bold focus:outline-none border transition-all ${
                                    hasDirty
                                      ? "bg-amber-500/20 border-amber-400 text-amber-200 ring-1 ring-amber-400"
                                      : "bg-slate-100 dark:bg-slate-900/80 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:border-cyan-500"
                                  }`}
                                />
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => openStudentModal(student)}
                                  className={`px-2 py-1 rounded-lg border text-xs font-mono font-bold cursor-pointer transition-transform hover:scale-105 ${getScoreColorClass(
                                    currentVal,
                                    quiz.maxScore
                                  )}`}
                                  title={`Quiz: ${quiz.name} (Max: ${quiz.maxScore})`}
                                >
                                  {currentVal !== null && currentVal !== undefined ? currentVal : "—"}
                                </button>
                              )}
                            </td>
                          );
                        })}

                        {/* Raw Total */}
                        <td className="py-3 px-3 text-center font-mono font-bold border-l-2 border-indigo-500/40 bg-indigo-500/5 text-indigo-400">
                          {student.rawTotal} <span className="text-[10px] text-slate-400">/ {totalMaxScore}</span>
                        </td>

                        {/* Scaled 15% Score */}
                        <td className="py-3 px-3 text-center bg-cyan-500/10 font-mono font-bold text-cyan-300">
                          <div className="flex flex-col items-center">
                            <span>{student.scaled15} / 15</span>
                            <div className="w-16 h-1.5 rounded-full bg-slate-700 overflow-hidden mt-1">
                              <div
                                className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full"
                                style={{ width: `${Math.min(100, (student.scaled15 / 15) * 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Grade Pill */}
                        <td className="py-3 px-2 text-center">
                          <StatusBadge status={student.grade} size="sm" />
                        </td>

                        {/* Action buttons (Sticky Right) */}
                        <td className="py-3 px-3 text-center sticky right-0 bg-white dark:bg-[#0c1427] z-10 border-l border-slate-100 dark:border-slate-800/60">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openStudentModal(student)}
                              className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition-all cursor-pointer"
                              title="កែសម្រួលពិន្ទុនិស្សិតនេះ"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setResetConfirmStudent(student)}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all cursor-pointer"
                              title="កំណត់ពិន្ទុឡើងវិញ"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Footer info */}
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-500 font-khmer">
            <span>
              បង្ហាញនិស្សិតសរុប: <strong className="text-cyan-400 font-mono">{filteredStudents.length}</strong> / {studentsList.length} នាក់
            </span>
            <span>
              ទម្ងន់ពិន្ទុរួម: <strong className="text-cyan-400 font-mono">15%</strong> (កម្រងសំណួរទាំងអស់គណនាបម្លែងស្វ័យប្រវត្តិចូលតារាងពិន្ទុធំ)
            </span>
          </div>
        </div>
      )}

      {/* 6. TAB 2: QUIZZES MANAGER (Columns CRUD) */}
      {activeTab === "quizzes" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold font-khmer text-slate-900 dark:text-white">
                បញ្ជីកម្រងសំណួរដែលបានកំណត់ទាំងអស់ ({quizzesList.length} Quizzes)
              </h2>
              <p className="text-xs text-slate-500 font-khmer">
                អ្នកអាចបង្កើត Quiz ថ្មី កែប្រែឈ្មោះ កែប្រែពិន្ទុពេញ ឬលុប Quiz ចេញពីតារាង។
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-bold font-khmer cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>បន្ថែម Quiz ថ្មី</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quizzesList.map((quiz, qIdx) => {
              const qStat = quizStats.find((s) => s.name === quiz.name);
              const avg = qStat?.averageScore || 0;
              const pct = qStat?.averagePercentage || 0;
              const completed = qStat?.completedCount || 0;
              const total = qStat?.totalCount || studentsList.length;

              return (
                <div
                  key={quiz.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-xl space-y-4 relative group hover:border-cyan-500/50 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-cyan-500/15 text-cyan-400 text-xs font-bold font-mono flex items-center justify-center">
                          {qIdx + 1}
                        </span>
                        <h3 className="text-sm font-bold font-khmer text-slate-900 dark:text-white">
                          {quiz.name}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-400 font-mono">
                        ពិន្ទុពេញ: <strong className="text-cyan-400">{quiz.maxScore} pts</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => setEditQuizModal({ ...quiz, originalName: quiz.name })}
                        className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition-all cursor-pointer"
                        title="កែប្រែ"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteQuizConfirm(quiz)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all cursor-pointer"
                        title="លុប"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress & stats */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-khmer">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">មធ្យមភាគពិន្ទុ:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-100">
                        {avg} / {quiz.maxScore} pts ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          pct >= 80 ? "bg-emerald-500" : pct >= 60 ? "bg-cyan-500" : pct >= 40 ? "bg-amber-500" : "bg-rose-500"
                        }`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>បានបញ្ជូនពិន្ទុ:</span>
                      <span className="font-mono text-cyan-400 font-bold">
                        {completed} / {total} នាក់
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 7. TAB 3: ANALYTICS & RECHARTS */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          {/* Main Chart */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0c1427]/90 border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold font-khmer text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-cyan-400" />
                  <span>គំនូសតាងមធ្យមភាគពិន្ទុតាមកម្រងសំណួរនីមួយៗ (Quiz Class Averages)</span>
                </h3>
                <p className="text-xs text-slate-400 font-khmer">
                  ពិនិត្យមើលកម្រិតយល់ដឹងរបស់សិស្សលើកម្រងសំណួរ និងកិច្ចការនីមួយៗក្នុងថ្នាក់
                </p>
              </div>
            </div>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={quizStats} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#94a3b8", fontSize: 10 }}
                    angle={-25}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} domain={[0, 100]} unit="%" />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Bar dataKey="averagePercentage" radius={[6, 6, 0, 0]}>
                    {quizStats.map((entry, idx) => {
                      const pct = entry.averagePercentage || 0;
                      const fill = pct >= 80 ? "#10b981" : pct >= 65 ? "#06b6d4" : pct >= 50 ? "#f59e0b" : "#f43f5e";
                      return <Cell key={`cell-${idx}`} fill={fill} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Highlights & Weak Quizzes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Hardest Quizzes */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-bold font-khmer">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>កម្រងសំណួរដែលសិស្សពិបាក/ពិន្ទុទាប (At-Risk Quizzes)</span>
              </div>
              <div className="space-y-2">
                {[...quizStats]
                  .sort((a, b) => a.averagePercentage - b.averagePercentage)
                  .slice(0, 3)
                  .map((q) => (
                    <div
                      key={q.id}
                      className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/20 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-bold font-khmer text-slate-800 dark:text-slate-100">
                          {q.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          ពិន្ទុមធ្យម: {q.averageScore} / {q.maxScore} pts
                        </p>
                      </div>
                      <span className="text-xs font-mono font-bold text-rose-400">
                        {q.averagePercentage}%
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Best Quizzes */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold font-khmer">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>កម្រងសំណួរដែលសិស្សធ្វើបានល្អបំផុត (Top Performing Quizzes)</span>
              </div>
              <div className="space-y-2">
                {[...quizStats]
                  .sort((a, b) => b.averagePercentage - a.averagePercentage)
                  .slice(0, 3)
                  .map((q) => (
                    <div
                      key={q.id}
                      className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-bold font-khmer text-slate-800 dark:text-slate-100">
                          {q.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          ពិន្ទុមធ្យម: {q.averageScore} / {q.maxScore} pts
                        </p>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {q.averagePercentage}%
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: STUDENT QUIZ DETAIL & SCORING MODAL */}
      {/* ============================================================== */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-[#0c1427] border border-cyan-500/40 text-white shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-khmer text-white flex items-center gap-2">
                    <span>កែប្រែពិន្ទុ Quiz និស្សិត</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400">
                      ID: {selectedStudent.studentId}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 font-khmer">
                    {selectedStudent.fullNameKh || selectedStudent.fullNameEn} • បន្ទប់ {selectedStudent.room}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Computed Summary Bar */}
            <div className="px-6 py-3 bg-cyan-950/40 border-b border-cyan-900/50 flex flex-wrap items-center justify-between text-xs font-khmer shrink-0">
              <div className="flex items-center gap-4">
                <span>
                  ពិន្ទុសរុបជាក់ស្តែង:{" "}
                  <strong className="text-cyan-300 font-mono">
                    {studentModalLiveStats.rawSum} / {totalMaxScore} pts
                  </strong>
                </span>
                <span>
                  ភាគរយ: <strong className="text-indigo-300 font-mono">{studentModalLiveStats.pct}%</strong>
                </span>
              </div>
              <div className="flex items-center gap-2 font-bold">
                <span>ពិន្ទុបម្លែង ១៥% (QHA):</span>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 font-mono">
                  {studentModalLiveStats.scaled15} / 15 pts
                </span>
              </div>
            </div>

            {/* Modal Body: Quiz Inputs List */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {quizzesList.map((quiz) => {
                  const val = studentModalScores[quiz.name];
                  return (
                    <div
                      key={quiz.id}
                      className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 hover:border-cyan-500/40 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold font-khmer text-slate-200">
                          {quiz.name}
                        </label>
                        <span className="text-[11px] text-slate-400 font-mono">
                          ពិន្ទុពេញ: {quiz.maxScore}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max={quiz.maxScore}
                          step="0.5"
                          value={val !== null && val !== undefined ? val : ""}
                          onChange={(e) => {
                            const raw = e.target.value;
                            setStudentModalScores((prev) => ({
                              ...prev,
                              [quiz.name]: raw !== "" ? Math.max(0, Math.min(quiz.maxScore, Number(raw))) : ""
                            }));
                          }}
                          placeholder="មិនទាន់ប្រឡង (—)"
                          className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm font-mono font-bold text-white focus:outline-none focus:border-cyan-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setStudentModalScores((prev) => ({
                              ...prev,
                              [quiz.name]: quiz.maxScore // Max point shortcut
                            }));
                          }}
                          className="px-2.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold"
                          title="ដាក់ពិន្ទុពេញ"
                        >
                          Max
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setStudentModalScores((prev) => ({
                              ...prev,
                              [quiz.name]: "" // Clear shortcut
                            }));
                          }}
                          className="px-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs"
                          title="លុបពិន្ទុ"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-800 bg-slate-900/60 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-bold font-khmer hover:bg-slate-800 transition-colors cursor-pointer"
              >
                បោះបង់
              </button>
              <button
                type="button"
                onClick={handleSaveStudentModal}
                disabled={isSavingStudent}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold font-khmer shadow-lg shadow-cyan-500/25 transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className={`w-4 h-4 ${isSavingStudent ? "animate-spin" : ""}`} />
                <span>រក្សាទុកពិន្ទុ</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: CREATE QUIZ MODAL */}
      {/* ============================================================== */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-[#0c1427] border border-cyan-500/40 text-white shadow-2xl overflow-hidden p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-khmer text-white">បន្ថែម Quiz ថ្មី</h3>
                  <p className="text-xs text-slate-400 font-khmer">បង្កើតកម្រងសំណួរ ឬកិច្ចការថ្មី</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuiz} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold font-khmer text-slate-200">
                  ឈ្មោះកម្រងសំណួរ (Quiz Name) *
                </label>
                <input
                  type="text"
                  required
                  value={createQuizForm.name}
                  onChange={(e) => setCreateQuizForm({ ...createQuizForm, name: e.target.value })}
                  placeholder="ឧ. Quiz 16, លំហាត់ស្រាវជ្រាវ..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500 font-khmer"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold font-khmer text-slate-200">
                  ពិន្ទុពេញ (Max Score) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="100"
                  value={createQuizForm.maxScore}
                  onChange={(e) => setCreateQuizForm({ ...createQuizForm, maxScore: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono font-bold focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold font-khmer text-slate-200">
                  បរិយាយ / កំណត់ចំណាំ (Description)
                </label>
                <textarea
                  rows="2"
                  value={createQuizForm.description}
                  onChange={(e) => setCreateQuizForm({ ...createQuizForm, description: e.target.value })}
                  placeholder="ព័ត៌មានបន្ថែមអំពីកិច្ចការ..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500 font-khmer"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-bold font-khmer hover:bg-slate-800"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  disabled={isCreatingQuiz}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-bold font-khmer shadow-lg shadow-cyan-500/25 transition-all"
                >
                  <Plus className={`w-4 h-4 ${isCreatingQuiz ? "animate-spin" : ""}`} />
                  <span>បង្កើតឥឡូវនេះ</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: EDIT QUIZ MODAL */}
      {/* ============================================================== */}
      {editQuizModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-[#0c1427] border border-cyan-500/40 text-white shadow-2xl overflow-hidden p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-khmer text-white">កែប្រែកម្រងសំណួរ</h3>
                  <p className="text-xs text-slate-400 font-khmer">កែប្រែឈ្មោះ និងពិន្ទុពេញ</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditQuizModal(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateQuiz} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold font-khmer text-slate-200">
                  ឈ្មោះកម្រងសំណួរ (Quiz Name) *
                </label>
                <input
                  type="text"
                  required
                  value={editQuizModal.name}
                  onChange={(e) => setEditQuizModal({ ...editQuizModal, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500 font-khmer"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold font-khmer text-slate-200">
                  ពិន្ទុពេញ (Max Score) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="100"
                  value={editQuizModal.maxScore}
                  onChange={(e) => setEditQuizModal({ ...editQuizModal, maxScore: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono font-bold focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditQuizModal(null)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-bold font-khmer hover:bg-slate-800"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingQuiz}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-bold font-khmer shadow-lg shadow-cyan-500/25 transition-all"
                >
                  <Save className={`w-4 h-4 ${isUpdatingQuiz ? "animate-spin" : ""}`} />
                  <span>រក្សាទុក</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: DELETE QUIZ MODAL */}
      {/* ============================================================== */}
      {deleteQuizConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-[#0c1427] border border-rose-500/40 text-white shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold font-khmer text-white">បញ្ជាក់ការលុប Quiz</h3>
              <p className="text-xs text-slate-300 font-khmer leading-relaxed">
                តើអ្នកពិតជាចង់លុប Quiz <strong className="text-rose-400">"{deleteQuizConfirm.name}"</strong> មែនទេ?
                ពិន្ទុដែលបានបញ្ចូលសម្រាប់ Quiz នេះនឹងត្រូវលុបចេញពីនិស្សិតទាំងអស់។
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setDeleteQuizConfirm(null)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-bold font-khmer hover:bg-slate-800"
              >
                បោះបង់
              </button>
              <button
                type="button"
                onClick={handleDeleteQuiz}
                disabled={isDeletingQuiz}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold font-khmer shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
              >
                {isDeletingQuiz ? "កំពុងលុប..." : "លុប Quiz នេះ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 5: RESET STUDENT QUIZZES MODAL */}
      {/* ============================================================== */}
      {resetConfirmStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-[#0c1427] border border-rose-500/40 text-white shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold font-khmer text-white">កំណត់ពិន្ទុឡើងវិញ</h3>
              <p className="text-xs text-slate-300 font-khmer leading-relaxed">
                តើអ្នកពិតជាចង់កំណត់ពិន្ទុកម្រងសំណួរទាំងអស់របស់និស្សិត{" "}
                <strong className="text-cyan-400">
                  {resetConfirmStudent.fullNameKh || resetConfirmStudent.studentId}
                </strong>{" "}
                ទៅជាទទេ (—) វិញមែនទេ?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setResetConfirmStudent(null)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-bold font-khmer hover:bg-slate-800"
              >
                បោះបង់
              </button>
              <button
                type="button"
                onClick={handleResetStudent}
                disabled={isResetting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold font-khmer shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
              >
                {isResetting ? "កំពុងដំណើរការ..." : "កំណត់ឡើងវិញ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
