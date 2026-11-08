import React, { useEffect, useState, useMemo } from "react";
import {
  Download,
  RefreshCw,
  Filter,
  Sparkles,
  Award,
  Layers,
  Edit3,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertCircle,
  X,
  Sliders,
  Check,
  Plus,
  Trash2,
  Search,
  ArrowUpDown,
  Zap,
  TrendingUp,
  Users,
  CheckCircle,
  Link2,
  SlidersHorizontal,
  ChevronDown,
  Calendar
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import {
  getAdminScoringOverview,
  updateStudentScores,
  bulkUpdateStudentScores,
  resetStudentScores,
  createStudentScore,
  deleteStudentScore,
  syncScoringStudents,
  getAdminStudents
} from "../api/adminApi.js";
import StatusBadge from "../components/StatusBadge.jsx";
import RealtimeIndicator from "../components/RealtimeIndicator.jsx";
import { SkeletonTable } from "../components/LoadingSkeleton.jsx";
import { useAutoRefresh } from "../hooks/useAutoRefresh.js";
import { setFormDirtyState } from "../utils/pwaManager.js";
import { dataSyncService } from "../services/dataSyncService.js";

export default function AcademicScoringPage() {
  const { adminSession } = useAuth();
  const [data, setData] = useState(null);
  const [allStudentsDirectory, setAllStudentsDirectory] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("all");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortField, setSortField] = useState("studentId");
  const [sortAsc, setSortAsc] = useState(true);

  // Inline Quick Editing Toggle
  const [isInlineEditMode, setIsInlineEditMode] = useState(false);
  const [inlineSavingId, setInlineSavingId] = useState(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [scoreForm, setScoreForm] = useState({
    attendance: 10,
    qha: 0,
    midterm: 0,
    finalScore: 0
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    studentId: "",
    fullNameKh: "",
    fullNameEn: "",
    room: "101",
    skill: "គណនេយ្យ",
    attendance: 10,
    qha: 0,
    midterm: 0,
    finalScore: 0
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [studentSearchInModal, setStudentSearchInModal] = useState("");

  // Delete Confirmation Modal
  const [deleteConfirmStudent, setDeleteConfirmStudent] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast Notifications
  const [toastMessage, setToastMessage] = useState({ type: "", text: "" });

  // Quick Attendance Taker State
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendanceRoom, setAttendanceRoom] = useState("all");
  const [attendanceMarks, setAttendanceMarks] = useState({});
  const [attendanceSaving, setAttendanceSaving] = useState(false);

  // Sync PWA update protection when form modal or inline edit is active
  useEffect(() => {
    setFormDirtyState(isEditModalOpen || isCreateModalOpen || isAttendanceModalOpen || isInlineEditMode);
    return () => setFormDirtyState(false);
  }, [isEditModalOpen, isCreateModalOpen, isAttendanceModalOpen, isInlineEditMode]);

  const showToast = (type, text) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage({ type: "", text: "" }), 5000);
  };

  // 1. Fetch Scoring Overview
  const fetchData = async (refresh = false) => {
    if (!adminSession) return;
    if (!data) {
      setInitialLoading(true);
    } else {
      setIsSyncing(true);
    }
    try {
      const res = await getAdminScoringOverview(adminSession.token, refresh);
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setInitialLoading(false);
      setIsSyncing(false);
    }
  };

  // 2. Fetch Directory Students for Picker
  const fetchStudentsDirectory = async () => {
    if (!adminSession) return;
    try {
      const res = await getAdminStudents(adminSession.token, false);
      if (res.success && res.data?.students) {
        setAllStudentsDirectory(res.data.students);
      }
    } catch (err) {
      console.warn("Could not load student directory for picker:", err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchStudentsDirectory();
  }, [adminSession]);

  // Real-Time Admin/Teacher Data Synchronization (Section 18.1 & 18.10)
  useEffect(() => {
    const unsubScore = dataSyncService.subscribeToEntity("score", () => fetchData(true));
    const unsubAtt = dataSyncService.subscribeToEntity("attendance", () => fetchData(true));
    const unsubStudent = dataSyncService.subscribeToEntity("student", () => {
      fetchData(true);
      fetchStudentsDirectory();
    });
    return () => {
      unsubScore();
      unsubAtt();
      unsubStudent();
    };
  }, []);

  useAutoRefresh(() => fetchData(true), 30000);

  // Grade Calculator
  const computeGrade = (tot) => {
    if (tot >= 85) return "A";
    if (tot >= 80) return "B+";
    if (tot >= 70) return "B";
    if (tot >= 65) return "C+";
    if (tot >= 50) return "C";
    if (tot >= 45) return "D";
    if (tot >= 40) return "E";
    return "F";
  };

  // Live Score Calculation for Edit Modal
  const editComputedTotal = Math.round(
    ((Number(scoreForm.attendance) || 0) +
     (Number(scoreForm.qha) || 0) +
     (Number(scoreForm.midterm) || 0) +
     (Number(scoreForm.finalScore) || 0)) * 10
  ) / 10;
  const editComputedGrade = computeGrade(editComputedTotal);

  // Live Score Calculation for Create Modal
  const createComputedTotal = Math.round(
    ((Number(createForm.attendance) || 0) +
     (Number(createForm.qha) || 0) +
     (Number(createForm.midterm) || 0) +
     (Number(createForm.finalScore) || 0)) * 10
  ) / 10;
  const createComputedGrade = computeGrade(createComputedTotal);

  // Rooms and Majors list
  const rooms = Array.from(new Set((data?.students || []).map((s) => s.room).filter(Boolean)));

  // Filtered & Sorted Students
  const filteredStudents = useMemo(() => {
    const list = data?.students || [];
    return list
      .filter((s) => {
        // Room Filter
        if (selectedRoom !== "all" && s.room !== selectedRoom) return false;

        // Grade Filter
        const grade = s.academicSummary?.overallGrade || computeGrade(s.academicSummary?.totalScore || 0);
        if (selectedGrade !== "all" && grade !== selectedGrade) return false;

        // Pass/Fail Filter
        const tot = s.academicSummary?.totalScore || 0;
        if (selectedStatus === "pass" && tot < 50) return false;
        if (selectedStatus === "fail" && tot >= 50) return false;

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchId = String(s.studentId || "").toLowerCase().includes(q);
          const matchKh = String(s.fullNameKh || "").toLowerCase().includes(q);
          const matchEn = String(s.fullNameEn || "").toLowerCase().includes(q);
          const matchRoom = String(s.room || "").toLowerCase().includes(q);
          const matchSkill = String(s.skill || "").toLowerCase().includes(q);
          if (!matchId && !matchKh && !matchEn && !matchRoom && !matchSkill) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (sortField === "totalScore") {
          valA = a.academicSummary?.totalScore || 0;
          valB = b.academicSummary?.totalScore || 0;
        } else if (sortField === "name") {
          valA = a.fullNameKh || a.fullNameEn || "";
          valB = b.fullNameKh || b.fullNameEn || "";
        }

        if (typeof valA === "string") {
          const comp = valA.localeCompare(valB);
          return sortAsc ? comp : -comp;
        }
        return sortAsc ? valA - valB : valB - valA;
      });
  }, [data, selectedRoom, selectedGrade, selectedStatus, searchQuery, sortField, sortAsc]);

  // KPI Calculations
  const allStudents = data?.students || [];
  const totalStudentsCount = allStudents.length;
  const scoredCount = allStudents.filter((s) => s.academicSummary?.totalScore !== null && s.academicSummary?.totalScore !== undefined).length;
  const passingStudents = allStudents.filter((s) => (s.academicSummary?.totalScore || 0) >= 50);
  const passRate = scoredCount > 0 ? Math.round((passingStudents.length / scoredCount) * 100) : 0;
  const averageScore = scoredCount > 0
    ? Math.round((allStudents.reduce((acc, s) => acc + (Number(s.academicSummary?.totalScore) || 0), 0) / scoredCount) * 10) / 10
    : 0;
  const highestScore = allStudents.reduce((max, s) => Math.max(max, Number(s.academicSummary?.totalScore) || 0), 0);

  // Handle Export CSV
  const handleExportCSV = () => {
    if (!filteredStudents.length) return;
    const headers = ["លេខសម្គាល់", "ឈ្មោះជាភាសាខ្មែរ", "ឈ្មោះអក្សរឡាតាំង", "បន្ទប់", "ជំនាញ", "វត្តមាន(10)", "កិច្ចការ(15)", "ពាក់កណ្តាល(25)", "បញ្ចប់(50)", "ពិន្ទុសរុប(100)", "និទ្ទេស", "លទ្ធផល"];
    const rows = filteredStudents.map((s) => {
      const tot = s.academicSummary?.totalScore ?? "";
      return [
        `"${s.studentId}"`,
        `"${s.fullNameKh || ""}"`,
        `"${s.fullNameEn || ""}"`,
        `"${s.room || ""}"`,
        `"${s.skill || ""}"`,
        `"${s.academicSummary?.attendance ?? 10}"`,
        `"${s.academicSummary?.totalQHA ?? ""}"`,
        `"${s.academicSummary?.midterm ?? ""}"`,
        `"${s.academicSummary?.finalScore ?? ""}"`,
        `"${tot}"`,
        `"${s.academicSummary?.overallGrade ?? (tot !== "" ? computeGrade(tot) : "")}"`,
        `"${tot !== "" && tot >= 50 ? "ជាប់ (Pass)" : "ធ្លាក់ (Fail)"}"`
      ];
    });

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `តារាងពិន្ទុនិស្សិត_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ==============================================================
  // CREATE: Add / Initialize Score Record
  // ==============================================================
  const openCreateModal = () => {
    setCreateForm({
      studentId: "",
      fullNameKh: "",
      fullNameEn: "",
      room: rooms[0] || "101",
      skill: "គណនេយ្យ",
      attendance: 10,
      qha: 0,
      midterm: 0,
      finalScore: 0
    });
    setStudentSearchInModal("");
    setCreateError("");
    setIsCreateModalOpen(true);
  };

  const handleSelectStudentForCreate = (stu) => {
    setCreateForm((prev) => ({
      ...prev,
      studentId: stu.studentId,
      fullNameKh: stu.fullNameKh || stu.name || "",
      fullNameEn: stu.fullNameEn || "",
      room: stu.room || "101",
      skill: stu.skill || stu.major || "គណនេយ្យ"
    }));
  };

  const handleCreateScoreSubmit = async (e) => {
    e.preventDefault();
    if (!createForm.studentId.trim()) {
      setCreateError("សូមជ្រើសរើស ឬបញ្ចូលលេខសម្គាល់និស្សិត (Student ID)។");
      return;
    }

    setCreateLoading(true);
    setCreateError("");

    const targetStudentId = createForm.studentId.trim();
    const newAttendance = Number(createForm.attendance) || 0;
    const newQHA = Number(createForm.qha) || 0;
    const newMidterm = Number(createForm.midterm) || 0;
    const newFinal = Number(createForm.finalScore) || 0;
    const newTotal = createComputedTotal;
    const newGrade = createComputedGrade;

    // 1. Optimistic Add to Table (0ms)
    setData((prev) => {
      if (!prev || !prev.students) return prev;
      const existingIdx = prev.students.findIndex((s) => s.studentId === targetStudentId);
      const studentObj = {
        studentId: targetStudentId,
        fullNameKh: createForm.fullNameKh || targetStudentId,
        fullNameEn: createForm.fullNameEn || "",
        room: createForm.room || "101",
        skill: createForm.skill || "គណនេយ្យ",
        academicSummary: {
          attendance: newAttendance,
          totalQHA: newQHA,
          midterm: newMidterm,
          finalScore: newFinal,
          totalScore: newTotal,
          overallGrade: newGrade
        }
      };

      if (existingIdx !== -1) {
        const nextStudents = [...prev.students];
        nextStudents[existingIdx] = studentObj;
        return { ...prev, students: nextStudents };
      } else {
        return { ...prev, students: [studentObj, ...prev.students] };
      }
    });

    setIsCreateModalOpen(false);
    showToast("success", `បានបញ្ចូលកំណត់ត្រាពិន្ទុរបស់ ${createForm.fullNameKh || targetStudentId} ជោគជ័យ!`);

    // 2. Background sync
    try {
      const res = await createStudentScore(adminSession.token, {
        studentId: targetStudentId,
        fullNameKh: createForm.fullNameKh,
        fullNameEn: createForm.fullNameEn,
        room: createForm.room,
        skill: createForm.skill,
        attendance: newAttendance,
        qha: newQHA,
        midterm: newMidterm,
        finalScore: newFinal
      });

      if (!res.success) {
        showToast("error", res.message || "មិនអាចបញ្ចូលពិន្ទុទៅ Server បានទេ។");
        fetchData(true);
      }
    } catch (err) {
      showToast("error", err.message || "មានបញ្ហាបច្ចេកទេស។");
      fetchData(true);
    } finally {
      setCreateLoading(false);
    }
  };

  // ==============================================================
  // UPDATE: Modal Edit
  // ==============================================================
  const openEditModal = (stu) => {
    setSelectedStudent(stu);
    const sum = stu.academicSummary || {};
    setScoreForm({
      attendance: sum.attendance !== null && sum.attendance !== undefined ? Number(sum.attendance) : 10,
      qha: sum.totalQHA !== null && sum.totalQHA !== undefined ? Number(sum.totalQHA) : 0,
      midterm: sum.midterm !== null && sum.midterm !== undefined ? Number(sum.midterm) : 0,
      finalScore: sum.finalScore !== null && sum.finalScore !== undefined ? Number(sum.finalScore) : 0
    });
    setFormError("");
    setIsEditModalOpen(true);
  };

  const handleSaveScores = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;
    const targetStudentId = selectedStudent.studentId;
    const newAttendance = Number(scoreForm.attendance) || 0;
    const newQHA = Number(scoreForm.qha) || 0;
    const newMidterm = Number(scoreForm.midterm) || 0;
    const newFinal = Number(scoreForm.finalScore) || 0;
    const newTotal = editComputedTotal;
    const newGrade = editComputedGrade;

    // 1. Instant local state update (0ms!)
    setData((prev) => {
      if (!prev || !prev.students) return prev;
      return {
        ...prev,
        students: prev.students.map((s) => {
          if (s.studentId !== targetStudentId) return s;
          return {
            ...s,
            academicSummary: {
              ...s.academicSummary,
              attendance: newAttendance,
              totalQHA: newQHA,
              midterm: newMidterm,
              finalScore: newFinal,
              totalScore: newTotal,
              overallGrade: newGrade
            }
          };
        })
      };
    });

    setIsEditModalOpen(false);
    showToast("success", `បានកែប្រែពិន្ទុរបស់ ${selectedStudent.fullNameKh || selectedStudent.studentId} ជោគជ័យ!`);

    // 2. Background sync
    try {
      const res = await updateStudentScores(adminSession.token, targetStudentId, scoreForm);
      if (!res.success) {
        showToast("error", res.message || "មិនអាចរក្សាទុកពិន្ទុទៅ Server ឡើយ។");
        fetchData(true);
      }
    } catch (err) {
      showToast("error", err.message || "មានបញ្ហាបច្ចេកទេស។");
      fetchData(true);
    }
  };

  // ==============================================================
  // UPDATE: Inline Quick Edit
  // ==============================================================
  const handleInlineScoreChange = (studentId, field, rawValue) => {
    const val = rawValue === "" ? 0 : Number(rawValue);
    setData((prev) => {
      if (!prev || !prev.students) return prev;
      return {
        ...prev,
        students: prev.students.map((s) => {
          if (s.studentId !== studentId) return s;
          const cur = s.academicSummary || { attendance: 10, totalQHA: 0, midterm: 0, finalScore: 0 };
          const updated = {
            ...cur,
            [field === "qha" ? "totalQHA" : field]: val
          };
          const att = Number(updated.attendance) || 0;
          const qha = Number(updated.totalQHA) || 0;
          const mid = Number(updated.midterm) || 0;
          const fin = Number(updated.finalScore) || 0;
          const tot = Math.round((att + qha + mid + fin) * 10) / 10;
          return {
            ...s,
            academicSummary: {
              ...updated,
              totalScore: tot,
              overallGrade: computeGrade(tot)
            }
          };
        })
      };
    });
  };

  const handleInlineScoreCommit = async (studentId) => {
    const student = data?.students?.find((s) => s.studentId === studentId);
    if (!student || !student.academicSummary) return;

    setInlineSavingId(studentId);
    const sum = student.academicSummary;

    try {
      await updateStudentScores(adminSession.token, studentId, {
        attendance: sum.attendance,
        qha: sum.totalQHA,
        midterm: sum.midterm,
        finalScore: sum.finalScore
      });
      showToast("success", `បានរក្សាទុកពិន្ទុ ${student.fullNameKh || studentId} ជោគជ័យ!`);
    } catch (err) {
      showToast("error", "មិនអាចធ្វើសមកាលកម្មពិន្ទុទៅ Server បានទេ។");
    } finally {
      setTimeout(() => setInlineSavingId(null), 800);
    }
  };

  // ==============================================================
  // UPDATE: Reset Scores
  // ==============================================================
  const handleResetScores = async () => {
    if (!selectedStudent) return;
    if (!window.confirm(`តើអ្នកពិតជាចង់កំណត់ពិន្ទុរបស់ ${selectedStudent.fullNameKh || selectedStudent.fullNameEn} ឡើងវិញមែនទេ?`)) return;
    const targetStudentId = selectedStudent.studentId;

    setData((prev) => {
      if (!prev || !prev.students) return prev;
      return {
        ...prev,
        students: prev.students.map((s) => {
          if (s.studentId !== targetStudentId) return s;
          return {
            ...s,
            academicSummary: {
              ...s.academicSummary,
              attendance: 10,
              totalQHA: 0,
              midterm: 0,
              finalScore: 0,
              totalScore: 10,
              overallGrade: "F"
            }
          };
        })
      };
    });

    setIsEditModalOpen(false);
    showToast("success", `បានកំណត់ពិន្ទុរបស់ ${targetStudentId} ឡើងវិញជោគជ័យ!`);

    try {
      const res = await resetStudentScores(adminSession.token, targetStudentId);
      if (!res.success) {
        showToast("error", res.message || "មិនអាចកំណត់ពិន្ទុឡើងវិញបានទេ។");
        fetchData(true);
      }
    } catch (err) {
      showToast("error", err.message || "មានបញ្ហាបច្ចេកទេស។");
      fetchData(true);
    }
  };

  // ==============================================================
  // DELETE: Delete Score Record from Sheet
  // ==============================================================
  const confirmDeleteScore = (stu) => {
    setDeleteConfirmStudent(stu);
  };

  const handleDeleteScoreSubmit = async () => {
    if (!deleteConfirmStudent) return;
    const targetStudentId = deleteConfirmStudent.studentId;
    const studentName = deleteConfirmStudent.fullNameKh || deleteConfirmStudent.studentId;

    setIsDeleting(true);

    // 1. Optimistic removal (0ms)
    setData((prev) => {
      if (!prev || !prev.students) return prev;
      return {
        ...prev,
        students: prev.students.filter((s) => s.studentId !== targetStudentId)
      };
    });

    setDeleteConfirmStudent(null);
    setIsEditModalOpen(false);
    showToast("success", `បានលុបកំណត់ត្រាពិន្ទុរបស់ ${studentName} ចេញពីតារាងពិន្ទុជោគជ័យ!`);

    // 2. Background sync
    try {
      const res = await deleteStudentScore(adminSession.token, targetStudentId);
      if (!res.success) {
        showToast("error", res.message || "មិនអាចលុបពិន្ទុពី Server បានទេ។");
        fetchData(true);
      }
    } catch (err) {
      showToast("error", err.message || "មានបញ្ហាបច្ចេកទេស។");
      fetchData(true);
    } finally {
      setIsDeleting(false);
    }
  };

  // ==============================================================
  // BULK SYNC: Sync All Students from Registry to Scoring Sheet
  // ==============================================================
  const handleSyncAllStudents = async () => {
    if (!window.confirm("តើអ្នកចង់ធ្វើសមកាលកម្មនិស្សិតទាំងអស់ដែលមិនទាន់មានពិន្ទុ ឱ្យចូលក្នុងតារាងពិន្ទុមែនទេ?")) return;
    setIsSyncingAll(true);
    try {
      const res = await syncScoringStudents(adminSession.token);
      if (res.success) {
        showToast("success", res.message || "បានធ្វើសមកាលកម្មនិស្សិតជោគជ័យ!");
        fetchData(true);
      } else {
        showToast("error", res.message || "ការធ្វើសមកាលកម្មមិនបានសម្រេច។");
      }
    } catch (err) {
      showToast("error", err.message || "មានបញ្ហាបច្ចេកទេស។");
    } finally {
      setIsSyncingAll(false);
    }
  };

  // ==============================================================
  // ATTENDANCE: Quick Attendance Taker
  // ==============================================================
  const openAttendanceModal = () => {
    const initialMarks = {};
    const relevant = selectedRoom === "all" ? (filteredStudents || []) : (filteredStudents || []).filter(s => s.room === selectedRoom);
    relevant.forEach(s => {
      const att = s.academicSummary?.attendance;
      initialMarks[s.studentId] = att !== undefined && att !== null ? att : 10;
    });
    setAttendanceMarks(initialMarks);
    setAttendanceRoom(selectedRoom);
    setIsAttendanceModalOpen(true);
  };

  const handleMarkAllAttendance = (score) => {
    const updated = { ...attendanceMarks };
    const roomStudents = attendanceRoom === "all" ? filteredStudents : filteredStudents.filter(s => s.room === attendanceRoom);
    roomStudents.forEach(s => {
      updated[s.studentId] = score;
    });
    setAttendanceMarks(updated);
  };

  const handleSaveAttendance = async () => {
    setAttendanceSaving(true);
    const roomStudents = attendanceRoom === "all" ? filteredStudents : filteredStudents.filter(s => s.room === attendanceRoom);
    
    // Optimistic local update
    setData(prev => {
      if (!prev || !prev.students) return prev;
      return {
        ...prev,
        students: prev.students.map(s => {
          if (attendanceMarks[s.studentId] !== undefined) {
            const newAtt = Number(attendanceMarks[s.studentId]);
            const sum = s.academicSummary || {};
            const newTotal = (newAtt || 0) + (sum.totalQHA || 0) + (sum.midterm || 0) + (sum.finalScore || 0);
            return {
              ...s,
              academicSummary: {
                ...sum,
                attendance: newAtt,
                totalScore: newTotal,
                overallGrade: computeGrade(newTotal)
              }
            };
          }
          return s;
        })
      };
    });

    setIsAttendanceModalOpen(false);
    showToast("success", `បានកត់ត្រាវត្តមានសម្រាប់ ${roomStudents.length} នាក់ជោគជ័យ!`);

    try {
      const updates = [];
      for (const s of roomStudents) {
        const mark = attendanceMarks[s.studentId];
        if (mark !== undefined) {
          const sum = s.academicSummary || {};
          updates.push({
            studentId: s.studentId,
            attendance: Number(mark),
            qha: sum.totalQHA || 0,
            midterm: sum.midterm || 0,
            finalScore: sum.finalScore || 0
          });
        }
      }
      if (updates.length > 0) {
        await bulkUpdateStudentScores(adminSession.token, updates);
      }
    } catch (e) {
      console.warn("Background attendance sync notice:", e);
    } finally {
      setAttendanceSaving(false);
    }
  };

  return (
    <div className="space-y-6 font-khmer pb-10">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold tracking-wide">តារាងពិន្ទុនិស្សិត (Academic Scoring Sheet)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <span>គ្រប់គ្រងតារាងពិន្ទុ និងការវាយតម្លៃ</span>
            <span className="text-xs px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-500 font-mono font-bold">
              Full CRUD
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            បញ្ចូល កែប្រែ លុប និងគណនាពិន្ទុនិស្សិតដោយផ្ទាល់ក្នុង Cloud Database
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {/* Inline Edit Mode Toggle */}
          <button
            onClick={() => setIsInlineEditMode(!isInlineEditMode)}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm ${
              isInlineEditMode
                ? "bg-amber-500 text-slate-950 shadow-amber-500/30 scale-105 ring-2 ring-amber-400/50"
                : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
            }`}
            title="បើក/បិទ មុខងារកែប្រែពិន្ទុផ្ទាល់លើតារាង"
          >
            <Zap className={`w-3.5 h-3.5 ${isInlineEditMode ? "fill-current" : "text-amber-500"}`} />
            <span>{isInlineEditMode ? "⚡ កំពុងកែប្រែផ្ទាល់" : "⚡ កែប្រែផ្ទាល់ (Inline Edit)"}</span>
          </button>

          {/* Sync All Students Button */}
          <button
            onClick={handleSyncAllStudents}
            disabled={isSyncingAll}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-600 dark:text-blue-400 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            title="សមកាលកម្មនិស្សិតទាំងអស់ពីបញ្ជីឈ្មោះចូលតារាងពិន្ទុ"
          >
            <Link2 className={`w-3.5 h-3.5 ${isSyncingAll ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">សមកាលកម្មនិស្សិត</span>
          </button>

          {/* Quick Attendance Taker Button */}
          <button
            type="button"
            onClick={openAttendanceModal}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer min-h-[44px]"
            title="កត់ត្រាវត្តមានរហ័សសម្រាប់ថ្នាក់រៀន"
          >
            <Calendar className="w-4 h-4" />
            <span>កត់វត្តមានរហ័ស (Attendance)</span>
          </button>

          {/* Add Score Record Button (Create) */}
          <button
            onClick={openCreateModal}
            className="relative overflow-hidden group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs font-bold shadow-md shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>+ បញ្ចូលពិន្ទុថ្មី</span>
          </button>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            disabled={!filteredStudents.length}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <RealtimeIndicator onRefresh={() => fetchData(true)} loading={isSyncing} />
        </div>
      </div>

      {/* Toast Notification Banner */}
      {toastMessage.text && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between animate-fade-in shadow-lg ${
            toastMessage.type === "success"
              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
              : "bg-rose-500/15 border-rose-500/30 text-rose-700 dark:text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toastMessage.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button onClick={() => setToastMessage({ type: "", text: "" })} className="p-1 hover:opacity-70 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0b1329] border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">និស្សិតក្នុងតារាងពិន្ទុ</span>
            <div className="text-xl font-black text-slate-900 dark:text-white font-mono mt-0.5">
              {scoredCount} <span className="text-xs font-normal text-slate-400">/ {totalStudentsCount}</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0b1329] border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">មធ្យមភាគពិន្ទុរួម</span>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
              {averageScore} <span className="text-xs font-normal text-slate-400">/ 100</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0b1329] border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-500 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">អត្រាប្រឡងជាប់ (Pass Rate)</span>
            <div className="text-xl font-black text-teal-600 dark:text-teal-400 font-mono mt-0.5">
              {passRate}%
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0b1329] border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">ពិន្ទុខ្ពស់បំផុត</span>
            <div className="text-xl font-black text-amber-500 font-mono mt-0.5">
              {highestScore} <span className="text-xs font-normal text-slate-400">ពិន្ទុ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white/90 dark:bg-[#0b1329]/90 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
          {/* Search Box */}
          <div className="sm:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ស្វែងរកតាម អត្តលេខ, ឈ្មោះ, បន្ទប់..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Room Filter */}
          <div className="sm:col-span-3 flex items-center gap-2">
            <span className="text-slate-500 font-semibold shrink-0">បន្ទប់៖</span>
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white cursor-pointer"
            >
              <option value="all">បន្ទប់ទាំងអស់ ({rooms.length})</option>
              {rooms.map((r) => (
                <option key={r} value={r}>បន្ទប់ {r}</option>
              ))}
            </select>
          </div>

          {/* Grade Filter */}
          <div className="sm:col-span-2 flex items-center gap-2">
            <span className="text-slate-500 font-semibold shrink-0">និទ្ទេស៖</span>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white cursor-pointer font-mono"
            >
              <option value="all">ទាំងអស់</option>
              <option value="A">A (85-100)</option>
              <option value="B+">B+ (80-84)</option>
              <option value="B">B (70-79)</option>
              <option value="C+">C+ (65-69)</option>
              <option value="C">C (50-64)</option>
              <option value="D">D (45-49)</option>
              <option value="E">E (40-44)</option>
              <option value="F">F (&lt; 40)</option>
            </select>
          </div>

          {/* Pass/Fail Filter */}
          <div className="sm:col-span-3 flex items-center gap-2">
            <span className="text-slate-500 font-semibold shrink-0">លទ្ធផល៖</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white cursor-pointer"
            >
              <option value="all">លទ្ធផលទាំងអស់</option>
              <option value="pass">ជាប់ (&ge; 50)</option>
              <option value="fail">ធ្លាក់ (&lt; 50)</option>
            </select>
          </div>
        </div>

        {/* Sorting / Summary Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800/60 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>តម្រៀបតាម៖</span>
            <button
              onClick={() => {
                if (sortField === "studentId") setSortAsc(!sortAsc);
                else { setSortField("studentId"); setSortAsc(true); }
              }}
              className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all ${
                sortField === "studentId" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400" : "border-slate-200 dark:border-slate-800"
              }`}
            >
              អត្តលេខ {sortField === "studentId" && (sortAsc ? "↑" : "↓")}
            </button>
            <button
              onClick={() => {
                if (sortField === "name") setSortAsc(!sortAsc);
                else { setSortField("name"); setSortAsc(true); }
              }}
              className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all ${
                sortField === "name" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400" : "border-slate-200 dark:border-slate-800"
              }`}
            >
              ឈ្មោះ {sortField === "name" && (sortAsc ? "↑" : "↓")}
            </button>
            <button
              onClick={() => {
                if (sortField === "totalScore") setSortAsc(!sortAsc);
                else { setSortField("totalScore"); setSortAsc(false); }
              }}
              className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all ${
                sortField === "totalScore" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400" : "border-slate-200 dark:border-slate-800"
              }`}
            >
              ពិន្ទុសរុប {sortField === "totalScore" && (sortAsc ? "↑" : "↓")}
            </button>
          </div>

          <div className="flex items-center gap-2 font-mono">
            <span>បង្ហាញ៖ <strong className="text-slate-900 dark:text-white">{filteredStudents.length}</strong> នាក់</span>
          </div>
        </div>
      </div>

      {/* Main Scoring Matrix Table */}
      {initialLoading && !data ? (
        <SkeletonTable rows={10} />
      ) : (
        <div className="relative p-[1px] rounded-3xl bg-gradient-to-b from-emerald-500/20 via-slate-800/10 to-transparent">
          <div className="bg-white/90 dark:bg-[#0b1329]/90 backdrop-blur-xl rounded-[23px] border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden relative">
            {isSyncing && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-400 animate-pulse z-10" />
            )}
            
            {/* Mobile Score Cards (Screens < 768px) */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredStudents.length === 0 ? (
                <div className="py-12 text-center text-slate-400 font-khmer p-4">
                  <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="font-semibold text-sm">មិនមានទិន្នន័យស្របតាមលក្ខខណ្ឌស្វែងរកឡើយ</p>
                  <button
                    type="button"
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold cursor-pointer mt-3"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ បញ្ចូលពិន្ទុថ្មីឥឡូវនេះ</span>
                  </button>
                </div>
              ) : (
                filteredStudents.map((s) => {
                  const sum = s.academicSummary || {};
                  return (
                    <div
                      key={s.studentId}
                      className="p-4 space-y-3 bg-white dark:bg-[#0b1329] hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 dark:text-white text-sm truncate">
                            {s.fullNameKh || s.fullNameEn || "-"}
                          </div>
                          {s.fullNameEn && s.fullNameKh && (
                            <div className="text-xs text-slate-400 truncate">{s.fullNameEn}</div>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                              {s.studentId}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                              បន្ទប់ {s.room || "—"}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-base font-black font-mono text-cyan-600 dark:text-cyan-400">
                            {sum.totalScore !== null && sum.totalScore !== undefined ? sum.totalScore : "—"}{" "}
                            <span className="text-[10px] text-slate-400 font-normal">/ 100</span>
                          </div>
                          <div className="mt-1">
                            <StatusBadge status={sum.overallGrade || (sum.totalScore ? computeGrade(sum.totalScore) : "ល្អ")} />
                          </div>
                        </div>
                      </div>

                      {/* 4 Score Component Cards */}
                      <div className="grid grid-cols-4 gap-1.5 pt-1 text-center font-mono">
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                          <span className="text-[10px] text-slate-400 block font-khmer">វត្តមាន</span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {sum.attendance ?? 10} <span className="text-[9px] text-slate-400">/10</span>
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                          <span className="text-[10px] text-slate-400 block font-khmer">កិច្ចការ</span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {sum.totalQHA ?? 0} <span className="text-[9px] text-slate-400">/15</span>
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                          <span className="text-[10px] text-slate-400 block font-khmer">ឆមាស</span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {sum.midterm ?? 0} <span className="text-[9px] text-slate-400">/25</span>
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                          <span className="text-[10px] text-slate-400 block font-khmer">បញ្ចប់</span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {sum.finalScore ?? 0} <span className="text-[9px] text-slate-400">/50</span>
                          </span>
                        </div>
                      </div>

                      {/* Touch-Friendly Action Buttons (44px min-height) */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(s)}
                          className="py-2.5 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                          <span>កែប្រែពិន្ទុ (Edit)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => confirmDeleteScore(s)}
                          className="py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>លុបកំណត់ត្រា</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Desktop / Tablet Matrix Table (Screens >= 768px) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                <thead className="text-[11px] font-mono uppercase bg-slate-50/80 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 tracking-wider border-b border-slate-200 dark:border-slate-800/80">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">អត្តលេខ</th>
                    <th className="py-3.5 px-4 font-semibold">ឈ្មោះនិស្សិត</th>
                    <th className="py-3.5 px-3 font-semibold text-center">បន្ទប់</th>
                    <th className="py-3.5 px-3 font-semibold">ជំនាញ</th>
                    <th className="py-3.5 px-3 text-right font-semibold">វត្តមាន (10)</th>
                    <th className="py-3.5 px-3 text-right font-semibold">កិច្ចការ (15)</th>
                    <th className="py-3.5 px-3 text-right font-semibold">ពាក់កណ្តាល (25)</th>
                    <th className="py-3.5 px-3 text-right font-semibold">បញ្ចប់ (50)</th>
                    <th className="py-3.5 px-4 text-right font-semibold">ពិន្ទុសរុប (100)</th>
                    <th className="py-3.5 px-3.5 text-center font-semibold">និទ្ទេស</th>
                    <th className="py-3.5 px-4 text-center font-semibold">សកម្មភាព (CRUD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-12 text-center text-slate-400 font-khmer">
                        <div className="max-w-xs mx-auto space-y-2">
                          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
                          <p className="font-semibold text-sm">មិនមានទិន្នន័យស្របតាមលក្ខខណ្ឌស្វែងរកឡើយ</p>
                          <button
                            type="button"
                            onClick={openCreateModal}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ បញ្ចូលពិន្ទុថ្មីឥឡូវនេះ</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((s) => {
                      const sum = s.academicSummary || {};
                      const isInlineSaving = inlineSavingId === s.studentId;

                      return (
                        <tr
                          key={s.studentId}
                          className={`hover:bg-emerald-500/5 dark:hover:bg-teal-500/5 transition-colors group ${
                            isInlineSaving ? "bg-emerald-500/10" : ""
                          }`}
                        >
                          {/* Student ID */}
                          <td className="py-3 px-4 font-mono font-bold text-cyan-600 dark:text-cyan-400 text-xs tracking-wider">
                            {s.studentId}
                          </td>

                          {/* Student Name */}
                          <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                            <div className="group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
                              {s.fullNameKh || s.fullNameEn || "-"}
                            </div>
                            {s.fullNameEn && s.fullNameKh && (
                              <div className="text-[11px] text-slate-400 font-normal">{s.fullNameEn}</div>
                            )}
                          </td>

                          {/* Room */}
                          <td className="py-3 px-3 text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 text-center">
                            {s.room || "-"}
                          </td>

                          {/* Major / Skill */}
                          <td className="py-3 px-3 text-xs text-slate-600 dark:text-slate-400 max-w-[130px] truncate">
                            {s.skill || "-"}
                          </td>

                          {/* Score: Attendance */}
                          <td className="py-3 px-3 text-right">
                            {isInlineEditMode ? (
                              <input
                                type="number"
                                min="0"
                                max="10"
                                step="0.5"
                                value={sum.attendance !== null && sum.attendance !== undefined ? sum.attendance : 10}
                                onChange={(e) => handleInlineScoreChange(s.studentId, "attendance", e.target.value)}
                                onBlur={() => handleInlineScoreCommit(s.studentId)}
                                onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
                                className="w-16 px-1.5 py-1 text-center font-mono font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500"
                              />
                            ) : (
                              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                                {sum.attendance !== null && sum.attendance !== undefined ? sum.attendance : 10}
                              </span>
                            )}
                          </td>

                          {/* Score: QHA / Tasks */}
                          <td className="py-3 px-3 text-right">
                            {isInlineEditMode ? (
                              <input
                                type="number"
                                min="0"
                                max="15"
                                step="0.5"
                                value={sum.totalQHA !== null && sum.totalQHA !== undefined ? sum.totalQHA : 0}
                                onChange={(e) => handleInlineScoreChange(s.studentId, "qha", e.target.value)}
                                onBlur={() => handleInlineScoreCommit(s.studentId)}
                                onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
                                className="w-16 px-1.5 py-1 text-center font-mono font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500"
                              />
                            ) : (
                              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                                {sum.totalQHA !== null && sum.totalQHA !== undefined ? sum.totalQHA : "-"}
                              </span>
                            )}
                          </td>

                          {/* Score: Midterm */}
                          <td className="py-3 px-3 text-right">
                            {isInlineEditMode ? (
                              <input
                                type="number"
                                min="0"
                                max="25"
                                step="0.5"
                                value={sum.midterm !== null && sum.midterm !== undefined ? sum.midterm : 0}
                                onChange={(e) => handleInlineScoreChange(s.studentId, "midterm", e.target.value)}
                                onBlur={() => handleInlineScoreCommit(s.studentId)}
                                onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
                                className="w-16 px-1.5 py-1 text-center font-mono font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-purple-500"
                              />
                            ) : (
                              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                                {sum.midterm !== null && sum.midterm !== undefined ? sum.midterm : "-"}
                              </span>
                            )}
                          </td>

                          {/* Score: Final Exam */}
                          <td className="py-3 px-3 text-right">
                            {isInlineEditMode ? (
                              <input
                                type="number"
                                min="0"
                                max="50"
                                step="0.5"
                                value={sum.finalScore !== null && sum.finalScore !== undefined ? sum.finalScore : 0}
                                onChange={(e) => handleInlineScoreChange(s.studentId, "finalScore", e.target.value)}
                                onBlur={() => handleInlineScoreCommit(s.studentId)}
                                onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
                                className="w-16 px-1.5 py-1 text-center font-mono font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-rose-500"
                              />
                            ) : (
                              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                                {sum.finalScore !== null && sum.finalScore !== undefined ? sum.finalScore : "-"}
                              </span>
                            )}
                          </td>

                          {/* Total Score */}
                          <td className="py-3 px-4 text-right font-mono font-black text-cyan-600 dark:text-cyan-400 text-sm">
                            {sum.totalScore !== null && sum.totalScore !== undefined ? sum.totalScore : "-"}
                          </td>

                          {/* Grade Badge */}
                          <td className="py-3 px-3.5 text-center">
                            <StatusBadge status={sum.overallGrade || (sum.totalScore ? computeGrade(sum.totalScore) : "ល្អ")} />
                          </td>

                          {/* Actions: Edit & Delete */}
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => openEditModal(s)}
                                className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition-all cursor-pointer hover:scale-105 min-h-[36px] min-w-[36px] flex items-center justify-center"
                                title="កែប្រែពិន្ទុ"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => confirmDeleteScore(s)}
                                className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition-all cursor-pointer hover:scale-105 min-h-[36px] min-w-[36px] flex items-center justify-center"
                                title="លុបកំណត់ត្រាពិន្ទុ"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* CREATE MODAL (+ បញ្ចូលពិន្ទុថ្មី) */}
      {/* ============================================================== */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-white/15 rounded-3xl p-6 shadow-2xl max-h-[92vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    បញ្ចូលកំណត់ត្រាពិន្ទុថ្មី (Add Score Record)
                  </h3>
                  <p className="text-xs text-slate-400">
                    បញ្ចូលពិន្ទុសម្រាប់និស្សិតថ្មី ឬជ្រើសរើសពីបញ្ជីឈ្មោះ
                  </p>
                </div>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            {/* Quick Student Selection from Directory */}
            {allStudentsDirectory.length > 0 && (
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  ជ្រើសរើសនិស្សិតពីបញ្ជីឈ្មោះ៖
                </label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={studentSearchInModal}
                    onChange={(e) => setStudentSearchInModal(e.target.value)}
                    placeholder="ស្វែងរកឈ្មោះ ឬអត្តលេខនិស្សិត..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
                {studentSearchInModal && (
                  <div className="max-h-36 overflow-y-auto space-y-1 divide-y divide-slate-100 dark:divide-slate-800 pt-1">
                    {allStudentsDirectory
                      .filter((stu) => {
                        const q = studentSearchInModal.toLowerCase();
                        return (
                          String(stu.studentId || "").toLowerCase().includes(q) ||
                          String(stu.fullNameKh || stu.name || "").toLowerCase().includes(q) ||
                          String(stu.fullNameEn || "").toLowerCase().includes(q)
                        );
                      })
                      .slice(0, 5)
                      .map((stu) => (
                        <div
                          key={stu.studentId}
                          onClick={() => {
                            handleSelectStudentForCreate(stu);
                            setStudentSearchInModal("");
                          }}
                          className="p-2 hover:bg-emerald-500/10 rounded-lg cursor-pointer flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {stu.fullNameKh || stu.name}
                            </span>
                            <span className="text-[11px] text-slate-400 ml-2 font-mono">
                              ({stu.studentId})
                            </span>
                          </div>
                          <span className="text-[11px] text-emerald-500 font-semibold">ជ្រើសរើស</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleCreateScoreSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Student ID */}
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    អត្តលេខនិស្សិត (Student ID) *
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.studentId}
                    onChange={(e) => setCreateForm({ ...createForm, studentId: e.target.value })}
                    placeholder="បញ្ចូលលេខសម្គាល់និស្សិត..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                {/* Full Name */}
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    ឈ្មោះនិស្សិត (Full Name)
                  </label>
                  <input
                    type="text"
                    value={createForm.fullNameKh}
                    onChange={(e) => setCreateForm({ ...createForm, fullNameKh: e.target.value })}
                    placeholder="ឈ្មោះជាភាសាខ្មែរ"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Room */}
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    បន្ទប់ (Room)
                  </label>
                  <input
                    type="text"
                    value={createForm.room}
                    onChange={(e) => setCreateForm({ ...createForm, room: e.target.value })}
                    placeholder="ឧ. 101"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                {/* Major / Skill */}
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    ជំនាញ (Major)
                  </label>
                  <input
                    type="text"
                    value={createForm.skill}
                    onChange={(e) => setCreateForm({ ...createForm, skill: e.target.value })}
                    placeholder="ឧ. គណនេយ្យ"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-500/20 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">ពិន្ទុសរុប (Total Score)</span>
                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                    {createComputedTotal} <span className="text-xs font-normal text-slate-400">/ 100</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">និទ្ទេសគណនា</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-base font-black font-mono px-2.5 py-0.5 rounded-lg bg-emerald-500 text-white">
                      {createComputedGrade}
                    </span>
                    <span className={`text-xs font-bold ${createComputedTotal >= 50 ? "text-emerald-500" : "text-rose-500"}`}>
                      {createComputedTotal >= 50 ? "PASS" : "FAIL"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Score Input Fields */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 space-y-1">
                  <div className="flex justify-between font-semibold text-[11px]">
                    <span>វត្តមាន (10%)</span>
                    <span className="font-mono text-cyan-600">{createForm.attendance}</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.5"
                    value={createForm.attendance}
                    onChange={(e) => setCreateForm({ ...createForm, attendance: Number(e.target.value) })}
                    className="w-full px-2 py-1 text-center font-mono font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 space-y-1">
                  <div className="flex justify-between font-semibold text-[11px]">
                    <span>កិច្ចការ & Quiz (15%)</span>
                    <span className="font-mono text-indigo-600">{createForm.qha}</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="15"
                    step="0.5"
                    value={createForm.qha}
                    onChange={(e) => setCreateForm({ ...createForm, qha: Number(e.target.value) })}
                    className="w-full px-2 py-1 text-center font-mono font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 space-y-1">
                  <div className="flex justify-between font-semibold text-[11px]">
                    <span>ពាក់កណ្តាលឆមាស (25%)</span>
                    <span className="font-mono text-purple-600">{createForm.midterm}</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="25"
                    step="0.5"
                    value={createForm.midterm}
                    onChange={(e) => setCreateForm({ ...createForm, midterm: Number(e.target.value) })}
                    className="w-full px-2 py-1 text-center font-mono font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 space-y-1">
                  <div className="flex justify-between font-semibold text-[11px]">
                    <span>ប្រឡងបញ្ចប់ (50%)</span>
                    <span className="font-mono text-rose-600">{createForm.finalScore}</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    step="0.5"
                    value={createForm.finalScore}
                    onChange={(e) => setCreateForm({ ...createForm, finalScore: Number(e.target.value) })}
                    className="w-full px-2 py-1 text-center font-mono font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-md shadow-emerald-600/30 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{createLoading ? "កំពុងបញ្ចូល..." : "បញ្ចូលពិន្ទុថ្មី"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* EDIT MODAL */}
      {/* ============================================================== */}
      {isEditModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-white/15 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    កែប្រែពិន្ទុនិស្សិត ({selectedStudent.studentId})
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedStudent.fullNameKh || selectedStudent.fullNameEn} • បន្ទប់ {selectedStudent.room || "101"}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Live Calculation Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-500/20 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">ពិន្ទុសរុបជាក់ស្តែង (Total Score)</span>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                  {editComputedTotal} <span className="text-xs font-normal text-slate-400">/ 100</span>
                </div>
              </div>

              <div className="text-right space-y-1">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">និទ្ទេសគណនាស្វ័យប្រវត្តិ</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black font-mono px-3 py-0.5 rounded-lg bg-emerald-500 text-white">
                    {editComputedGrade}
                  </span>
                  <span className={`text-xs font-bold ${editComputedTotal >= 50 ? "text-emerald-500" : "text-rose-500"}`}>
                    {editComputedTotal >= 50 ? "ជាប់ (PASS)" : "ធ្លាក់ (FAIL)"}
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveScores} className="space-y-4 text-xs">
              {/* Attendance */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between font-bold">
                  <label className="text-slate-700 dark:text-slate-300">វត្តមាន និងការចូលរួម (Attendance - 10%)</label>
                  <span className="font-mono text-cyan-600 dark:text-cyan-400 text-sm">{scoreForm.attendance} / 10</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={scoreForm.attendance}
                    onChange={(e) => setScoreForm({ ...scoreForm, attendance: Number(e.target.value) })}
                    className="flex-1 accent-cyan-500 cursor-pointer"
                  />
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.5"
                    value={scoreForm.attendance}
                    onChange={(e) => setScoreForm({ ...scoreForm, attendance: Number(e.target.value) })}
                    className="w-16 px-2.5 py-1 text-center font-mono font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* QHA */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between font-bold">
                  <label className="text-slate-700 dark:text-slate-300">កិច្ចការ & Quiz (QHA - 15%)</label>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400 text-sm">{scoreForm.qha} / 15</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="15"
                    step="0.5"
                    value={scoreForm.qha}
                    onChange={(e) => setScoreForm({ ...scoreForm, qha: Number(e.target.value) })}
                    className="flex-1 accent-indigo-500 cursor-pointer"
                  />
                  <input
                    type="number"
                    min="0"
                    max="15"
                    step="0.5"
                    value={scoreForm.qha}
                    onChange={(e) => setScoreForm({ ...scoreForm, qha: Number(e.target.value) })}
                    className="w-16 px-2.5 py-1 text-center font-mono font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* Midterm */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between font-bold">
                  <label className="text-slate-700 dark:text-slate-300">ពាក់កណ្តាលឆមាស (Midterm Exam - 25%)</label>
                  <span className="font-mono text-purple-600 dark:text-purple-400 text-sm">{scoreForm.midterm} / 25</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="25"
                    step="0.5"
                    value={scoreForm.midterm}
                    onChange={(e) => setScoreForm({ ...scoreForm, midterm: Number(e.target.value) })}
                    className="flex-1 accent-purple-500 cursor-pointer"
                  />
                  <input
                    type="number"
                    min="0"
                    max="25"
                    step="0.5"
                    value={scoreForm.midterm}
                    onChange={(e) => setScoreForm({ ...scoreForm, midterm: Number(e.target.value) })}
                    className="w-16 px-2.5 py-1 text-center font-mono font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* Final Exam */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between font-bold">
                  <label className="text-slate-700 dark:text-slate-300">ប្រឡងបញ្ចប់ឆមាស (Final Exam - 50%)</label>
                  <span className="font-mono text-rose-600 dark:text-rose-400 text-sm">{scoreForm.finalScore} / 50</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="0.5"
                    value={scoreForm.finalScore}
                    onChange={(e) => setScoreForm({ ...scoreForm, finalScore: Number(e.target.value) })}
                    className="flex-1 accent-rose-500 cursor-pointer"
                  />
                  <input
                    type="number"
                    min="0"
                    max="50"
                    step="0.5"
                    value={scoreForm.finalScore}
                    onChange={(e) => setScoreForm({ ...scoreForm, finalScore: Number(e.target.value) })}
                    className="w-16 px-2.5 py-1 text-center font-mono font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetScores}
                    disabled={formLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-xs font-semibold cursor-pointer disabled:opacity-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      confirmDeleteScore(selectedStudent);
                    }}
                    disabled={formLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>លុបពិន្ទុ</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                  >
                    បោះបង់
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-md shadow-emerald-600/30 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{formLoading ? "កំពុងរក្សាទុក..." : "រក្សាទុកពិន្ទុ"}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ============================================================== */}
      {deleteConfirmStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-white/15 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                តើអ្នកពិតជាចង់លុបកំណត់ត្រាពិន្ទុនេះមែនទេ?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                កំណត់ត្រាពិន្ទុរបស់ <strong className="text-slate-900 dark:text-white font-mono">{deleteConfirmStudent.fullNameKh || deleteConfirmStudent.studentId} ({deleteConfirmStudent.studentId})</strong> នឹងត្រូវបានលុបចេញពីតារាងពិន្ទុក្នុង Cloud Database។
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmStudent(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer"
              >
                បោះបង់
              </button>
              <button
                type="button"
                onClick={handleDeleteScoreSubmit}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? "កំពុងលុប..." : "យល់ព្រមលុប"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* QUICK ATTENDANCE TAKER MODAL */}
      {/* ============================================================== */}
      {isAttendanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in no-print">
          <div className="w-full max-w-2xl bg-white dark:bg-[#0c1427] border border-purple-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl max-h-[92vh] flex flex-col relative overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-500 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>កត់វត្តមានរហ័ស (Quick Attendance)</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                      Auto-Sync
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    ស្រង់វត្តមានប្រចាំថ្ងៃ និងគណនាពិន្ទុវត្តមានសរុប (១០ ពិន្ទុ)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAttendanceModalOpen(false)}
                className="w-8 h-8 rounded-xl text-slate-400 hover:text-white flex items-center justify-center hover:bg-slate-800 cursor-pointer min-h-[44px] min-w-[44px]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter & Date Bar */}
            <div className="py-3 grid grid-cols-1 sm:grid-cols-2 gap-3 shrink-0 border-b border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">កាលបរិច្ឆេទវត្តមាន (Date)៖</label>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-mono min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">ជ្រើសរើសបន្ទប់ / ថ្នាក់ (Class)៖</label>
                <select
                  value={attendanceRoom}
                  onChange={(e) => setAttendanceRoom(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white cursor-pointer min-h-[44px]"
                >
                  <option value="all">បន្ទប់ទាំងអស់ ({rooms.length})</option>
                  {rooms.map((r) => (
                    <option key={r} value={r}>បន្ទប់ {r}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bulk Quick Actions Bar */}
            <div className="py-2.5 flex items-center justify-between text-xs border-b border-slate-100 dark:border-slate-800 shrink-0">
              <span className="text-slate-500 text-[11px]">
                សរុប {attendanceRoom === "all" ? filteredStudents.length : filteredStudents.filter(s => s.room === attendanceRoom).length} នាក់
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleMarkAllAttendance(10)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[11px] font-bold hover:bg-emerald-500/25 cursor-pointer min-h-[36px]"
                >
                  វត្តមានទាំងអស់ (10)
                </button>
                <button
                  type="button"
                  onClick={() => handleMarkAllAttendance(8.5)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[11px] font-bold hover:bg-amber-500/25 cursor-pointer min-h-[36px]"
                >
                  ច្បាប់ទាំងអស់ (8.5)
                </button>
              </div>
            </div>

            {/* Students List with Touch Buttons (Min 44px) */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 py-2 mobile-scroll">
              {(attendanceRoom === "all" ? filteredStudents : filteredStudents.filter(s => s.room === attendanceRoom)).map((s) => {
                const currentMark = attendanceMarks[s.studentId] !== undefined ? attendanceMarks[s.studentId] : 10;
                return (
                  <div key={s.studentId} className="py-2.5 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 dark:text-white text-xs truncate">
                        {s.fullNameKh || s.fullNameEn}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                        <span className="text-cyan-400 font-semibold">{s.studentId}</span>
                        <span>•</span>
                        <span>បន្ទប់ {s.room || "—"}</span>
                      </div>
                    </div>

                    {/* Touch Action Buttons for Attendance */}
                    <div className="grid grid-cols-3 gap-1.5 sm:w-72 shrink-0">
                      <button
                        type="button"
                        onClick={() => setAttendanceMarks({ ...attendanceMarks, [s.studentId]: 10 })}
                        className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all min-h-[44px] flex items-center justify-center gap-1 cursor-pointer ${
                          currentMark === 10
                            ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-400/50"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-emerald-500/20"
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>វត្តមាន (10)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAttendanceMarks({ ...attendanceMarks, [s.studentId]: 8.5 })}
                        className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all min-h-[44px] flex items-center justify-center gap-1 cursor-pointer ${
                          currentMark > 0 && currentMark < 10
                            ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 ring-2 ring-amber-400/50"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-amber-500/20"
                        }`}
                      >
                        <span>ច្បាប់ (8.5)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAttendanceMarks({ ...attendanceMarks, [s.studentId]: 0 })}
                        className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all min-h-[44px] flex items-center justify-center gap-1 cursor-pointer ${
                          currentMark === 0
                            ? "bg-rose-600 text-white shadow-md shadow-rose-600/30 ring-2 ring-rose-400/50"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-rose-500/20"
                        }`}
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>អវត្តមាន (0)</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsAttendanceModalOpen(false)}
                className="py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium min-h-[44px] cursor-pointer"
              >
                បោះបង់ (Cancel)
              </button>
              <button
                type="button"
                onClick={handleSaveAttendance}
                disabled={attendanceSaving}
                className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-500/30 cursor-pointer min-h-[44px] disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{attendanceSaving ? "កំពុងរក្សាទុក..." : "រក្សាទុកវត្តមាន (Save)"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
