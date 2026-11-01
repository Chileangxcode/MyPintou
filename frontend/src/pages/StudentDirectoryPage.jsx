import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Users,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Sparkles,
  MapPin,
  GraduationCap,
  ShieldCheck,
  Award,
  Layers,
  Copy,
  Check,
  FileSpreadsheet,
  Printer,
  Edit3,
  Trash2,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Phone,
  Save
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import {
  getAdminStudents,
  getAdminStudentDetail,
  searchAdminStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  bulkCreateStudents
} from "../api/adminApi.js";
import { dataSyncService } from "../services/dataSyncService.js";
import StatusBadge from "../components/StatusBadge.jsx";
import ScoreBar from "../components/ScoreBar.jsx";
import RealtimeIndicator from "../components/RealtimeIndicator.jsx";
import BulkStudentImportModal from "../components/BulkStudentImportModal.jsx";
import { SkeletonTable } from "../components/LoadingSkeleton.jsx";
import { useAutoRefresh } from "../hooks/useAutoRefresh.js";
import { setFormDirtyState } from "../utils/pwaManager.js";

export default function StudentDirectoryPage() {
  const { adminSession } = useAuth();
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [filterOptions, setFilterOptions] = useState({ rooms: [], majors: [] });
  const [search, setSearch] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedMajor, setSelectedMajor] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [toastMessage, setToastMessage] = useState({ type: "", text: "" });

  // CRUD Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStudentForAction, setSelectedStudentForAction] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState({
    studentId: "",
    fullNameKh: "",
    fullNameEn: "",
    gender: "ប្រុស",
    room: "101",
    skill: "ICT",
    phone: "",
    status: "Active"
  });

  const showToast = (type, text) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage({ type: "", text: "" }), 5000);
  };

  // Sync PWA update protection when form modal is open
  useEffect(() => {
    setFormDirtyState(isAddModalOpen || isEditModalOpen);
    return () => setFormDirtyState(false);
  }, [isAddModalOpen, isEditModalOpen]);

  const fetchStudents = async (page = 1, refresh = false, activeSearch = search) => {
    if (!adminSession) return;
    if (students.length === 0) {
      setInitialLoading(true);
    } else {
      setIsSyncing(true);
    }
    try {
      const fetcher = activeSearch ? searchAdminStudents : getAdminStudents;
      const res = await fetcher(adminSession.token, {
        page,
        pageSize: 15,
        search: activeSearch,
        room: selectedRoom,
        major: selectedMajor,
        refresh: refresh ? "true" : "false"
      });
      if (res.success && res.data) {
        setStudents(res.data.students || []);
        if (res.data.pagination) setPagination(res.data.pagination);
        if (res.data.filterOptions) setFilterOptions(res.data.filterOptions);
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Failed to fetch students", err);
      }
    } finally {
      setInitialLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchStudents(1, false, search);
  }, [adminSession, selectedRoom, selectedMajor]);

  // Real-Time Push Invalidation Listener (Section 18.1 & 18.10)
  useEffect(() => {
    const unsub = dataSyncService.subscribeToEntity("student", () => {
      fetchStudents(pagination.currentPage, true, search);
    });
    return () => unsub();
  }, [pagination.currentPage, search]);

  // Live Debounced Instant Search (Section 18.9)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents(1, false, search);
    }, 280);
    return () => clearTimeout(timer);
  }, [search]);

  useAutoRefresh(() => fetchStudents(pagination.currentPage, true, search), 30000);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStudents(1);
  };

  const handleViewStudent = async (studentId) => {
    if (!adminSession) return;
    setDetailLoading(true);
    try {
      const res = await getAdminStudentDetail(adminSession.token, studentId);
      if (res.success && res.data) {
        setSelectedStudentDetail(res.data);
      }
    } catch (err) {
      console.error("Failed to load student detail", err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCopyId = (id) => {
    if (!id) return;
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Open Add Modal
  const openAddModal = () => {
    setFormData({
      studentId: "",
      fullNameKh: "",
      fullNameEn: "",
      gender: "ប្រុស",
      room: selectedRoom || "101",
      skill: selectedMajor || "ICT",
      phone: "",
      status: "Active"
    });
    setFormError("");
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (stu) => {
    setSelectedStudentForAction(stu);
    setFormData({
      studentId: stu.studentId,
      fullNameKh: stu.fullNameKh || "",
      fullNameEn: stu.fullNameEn || "",
      gender: stu.gender || "ប្រុស",
      room: stu.room || "101",
      skill: stu.skill || "ICT",
      phone: stu.phone || "",
      status: stu.status || "Active"
    });
    setFormError("");
    setIsEditModalOpen(true);
  };

  // Open Delete Modal
  const openDeleteModal = (stu) => {
    setSelectedStudentForAction(stu);
    setIsDeleteModalOpen(true);
  };

  // Submit Add Student (0ms Optimistic Update - Zero Page Reload)
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    const newStudent = {
      studentId: formData.studentId.trim(),
      fullNameKh: formData.fullNameKh.trim(),
      fullNameEn: formData.fullNameEn.trim(),
      gender: formData.gender,
      room: formData.room,
      skill: formData.skill,
      phone: formData.phone,
      status: formData.status || "Active",
      academicSummary: {
        attendance: 10,
        totalQHA: 0,
        midterm: 0,
        finalScore: 0,
        totalScore: 10,
        overallGrade: "F"
      }
    };

    // 1. Instant local state update (0ms!)
    setStudents((prev) => [newStudent, ...prev]);
    setPagination((prev) => ({ ...prev, totalItems: prev.totalItems + 1 }));
    setIsAddModalOpen(false);
    showToast("success", `បានបន្ថែមនិស្សិត ${formData.fullNameKh || formData.fullNameEn} ជោគជ័យ!`);

    // 2. Background sync to Google Sheet
    try {
      const res = await createStudent(adminSession.token, formData);
      if (!res.success) {
        // Rollback
        setStudents((prev) => prev.filter((s) => s.studentId !== newStudent.studentId));
        setPagination((prev) => ({ ...prev, totalItems: Math.max(0, prev.totalItems - 1) }));
        showToast("error", res.message || "មិនអាចបញ្ចូលនិស្សិតបានឡើយ។");
      }
    } catch (err) {
      setStudents((prev) => prev.filter((s) => s.studentId !== newStudent.studentId));
      setPagination((prev) => ({ ...prev, totalItems: Math.max(0, prev.totalItems - 1) }));
      showToast("error", err.message || "មានបញ្ហាបច្ចេកទេស។");
    }
  };

  // Submit Edit Student (0ms Optimistic Update)
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudentForAction) return;
    const prevStudent = { ...selectedStudentForAction };

    // 1. Instant local update (0ms!)
    setStudents((prev) =>
      prev.map((s) =>
        s.studentId === selectedStudentForAction.studentId
          ? {
              ...s,
              fullNameKh: formData.fullNameKh.trim(),
              fullNameEn: formData.fullNameEn.trim(),
              gender: formData.gender,
              room: formData.room,
              skill: formData.skill,
              phone: formData.phone,
              status: formData.status
            }
          : s
      )
    );
    setIsEditModalOpen(false);
    showToast("success", `បានកែប្រែព័ត៌មាននិស្សិត ${selectedStudentForAction.studentId} ជោគជ័យ!`);

    // 2. Background sync to Google Sheet
    try {
      const res = await updateStudent(adminSession.token, selectedStudentForAction.studentId, formData);
      if (!res.success) {
        setStudents((prev) => prev.map((s) => s.studentId === prevStudent.studentId ? prevStudent : s));
        showToast("error", res.message || "មិនអាចកែប្រែព័ត៌មានបានឡើយ។");
      }
    } catch (err) {
      setStudents((prev) => prev.map((s) => s.studentId === prevStudent.studentId ? prevStudent : s));
      showToast("error", err.message || "មានបញ្ហាបច្ចេកទេស។");
    }
  };

  // Submit Delete Student (0ms Optimistic Update)
  const handleDeleteSubmit = async () => {
    if (!selectedStudentForAction) return;
    const deletedStudent = { ...selectedStudentForAction };

    // 1. Instant local removal (0ms!)
    setStudents((prev) => prev.filter((s) => s.studentId !== selectedStudentForAction.studentId));
    setPagination((prev) => ({ ...prev, totalItems: Math.max(0, prev.totalItems - 1) }));
    setIsDeleteModalOpen(false);
    showToast("success", `បានលុបនិស្សិត ${deletedStudent.studentId} ជោគជ័យ!`);

    // 2. Background sync to Google Sheet
    try {
      const res = await deleteStudent(adminSession.token, selectedStudentForAction.studentId);
      if (!res.success) {
        setStudents((prev) => [deletedStudent, ...prev]);
        setPagination((prev) => ({ ...prev, totalItems: prev.totalItems + 1 }));
        showToast("error", res.message || "មិនអាចលុបនិស្សិតបានឡើយ។");
      }
    } catch (err) {
      setStudents((prev) => [deletedStudent, ...prev]);
      setPagination((prev) => ({ ...prev, totalItems: prev.totalItems + 1 }));
      showToast("error", err.message || "មានបញ្ហាបច្ចេកទេស។");
    }
  };

  // Excel Bulk Import Success -> Write to Google Sheets
  const handleImportSuccess = async (importedList) => {
    setShowImportModal(false);
    setIsSyncing(true);
    try {
      const payload = importedList.map((s) => ({
        studentId: s.profile?.studentId || s.studentId,
        fullNameKh: s.profile?.fullNameKh || s.fullNameKh,
        fullNameEn: s.profile?.fullNameEn || s.fullNameEn,
        gender: s.profile?.gender || s.gender,
        room: s.profile?.room || s.room,
        skill: s.profile?.skill || s.skill || s.profile?.major,
        phone: s.profile?.phone || s.phone,
        status: "Active"
      }));

      const res = await bulkCreateStudents(adminSession.token, payload);
      if (res.success) {
        showToast("success", `បាននាំចូលនិស្សិតថ្មីចំនួន ${importedList.length} នាក់ទៅកាន់ប្រព័ន្ធមូលទិន្នន័យ និងបង្កើតគណនីចូលជោគជ័យ!`);
        fetchStudents(1, true);
      } else {
        showToast("error", res.message || "មិនអាចនាំចូលទៅប្រព័ន្ធទិន្នន័យបានឡើយ។");
      }
    } catch (err) {
      showToast("error", err.message || "មានបញ្ហាបច្ចេកទេសក្នុងការនាំចូល។");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6 font-khmer">
      {/* Header with Realtime Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-[11px] font-semibold mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="font-bold tracking-wide">បញ្ជីមូលទិន្នន័យនិស្សិត (Student Registry)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <span>បញ្ជីរាយនាមនិស្សិត (Student Directory)</span>
            <span className="text-xs px-2.5 py-0.5 rounded-lg bg-cyan-500/10 text-cyan-500 font-mono font-bold">
              Full CRUD
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            គ្រប់គ្រង កែប្រែ បន្ថែម និងលុបទិន្នន័យនិស្សិតក្នុងប្រព័ន្ធពពក ({pagination.totalItems || 0} នាក់)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>បន្ថែមនិស្សិតថ្មី</span>
          </button>

          <button
            type="button"
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>នាំចូលពី Excel</span>
          </button>

          <RealtimeIndicator onRefresh={() => fetchStudents(pagination.currentPage, true)} loading={isSyncing} />
        </div>
      </div>

      {/* Toast Notification */}
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
          <button onClick={() => setToastMessage({ type: "", text: "" })} className="p-1 hover:opacity-70">
            ✕
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="relative p-[1px] rounded-3xl bg-gradient-to-r from-blue-500/20 via-indigo-500/10 to-transparent">
        <div className="bg-white/85 dark:bg-[#0b1329]/85 backdrop-blur-xl rounded-[23px] border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-sm space-y-3.5">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-cyan-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ស្វែងរកតាមលេខសម្គាល់ ឬឈ្មោះនិស្សិត..."
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all h-10"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 h-10 cursor-pointer"
              >
                <option value="">បន្ទប់ទាំងអស់ ({filterOptions.rooms.length})</option>
                {filterOptions.rooms.map((r) => (
                  <option key={r} value={r}>បន្ទប់ {r}</option>
                ))}
              </select>

              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold transition-all h-10 cursor-pointer shadow-sm hover:shadow-cyan-500/20 active:scale-95 shrink-0"
              >
                ស្វែងរក
              </button>
            </div>
          </form>

          {/* Quick Room Filter Pills */}
          {filterOptions.rooms.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 text-xs">
              <span className="text-slate-400 text-[11px] shrink-0 font-medium">បន្ទប់រហ័ស៖</span>
              <button
                onClick={() => setSelectedRoom("")}
                className={`px-3 py-1 rounded-lg text-xs transition-all cursor-pointer shrink-0 ${
                  selectedRoom === ""
                    ? "bg-cyan-500 text-white font-bold shadow-sm shadow-cyan-500/30"
                    : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                ទាំងអស់
              </button>
              {filterOptions.rooms.map((r) => (
                <button
                  key={r}
                  onClick={() => setSelectedRoom(r)}
                  className={`px-3 py-1 rounded-lg text-xs transition-all cursor-pointer shrink-0 font-mono ${
                    selectedRoom === r
                      ? "bg-cyan-500 text-white font-bold shadow-sm shadow-cyan-500/30"
                      : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Student Directory Table */}
      <div className="relative p-[1px] rounded-3xl bg-gradient-to-b from-blue-500/20 via-transparent to-indigo-500/10">
        <div className="bg-white/90 dark:bg-[#0c1427]/90 backdrop-blur-2xl rounded-[23px] border border-slate-200/80 dark:border-white/10 overflow-hidden shadow-sm relative">
          {/* Subtle Sync Indicator at top edge - 0ms flicker */}
          {isSyncing && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 animate-pulse z-10" />
          )}
          {initialLoading && students.length === 0 ? (
            <div className="p-6">
              <SkeletonTable rows={10} />
            </div>
          ) : (
            <>
              {/* Mobile Responsive Student Cards (Screens < 768px) */}
              <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800/80">
                {students.length === 0 ? (
                  <div className="py-12 px-4 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40 text-cyan-500" />
                    <div>មិនមានទិន្នន័យនិស្សិតដែលត្រូវនឹងលក្ខខណ្ឌស្វែងរកនេះឡើយ។</div>
                  </div>
                ) : (
                  students.map((student) => {
                    const initial = (student.fullNameKh || student.fullName || "N").charAt(0);
                    const isFemale = student.gender === "F" || student.gender === "ស្រី";
                    return (
                      <div
                        key={student.studentId}
                        className="p-4 space-y-3 bg-white dark:bg-[#0c1427] hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-bold shrink-0 ${
                                isFemale
                                  ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                                  : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                              }`}
                            >
                              {initial}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 dark:text-white text-sm truncate">
                                {student.fullNameKh || student.fullName}
                              </div>
                              {student.fullNameEn && student.fullNameEn !== student.fullNameKh && (
                                <div className="text-xs text-slate-400 truncate">{student.fullNameEn}</div>
                              )}
                              <div className="flex items-center gap-2 mt-1">
                                <span className="font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                                  {student.studentId}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                    isFemale
                                      ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                                      : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                  }`}
                                >
                                  {isFemale ? "ស្រី" : "ប្រុស"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                              {student.academicSummary?.totalScore ?? "—"}{" "}
                              <span className="text-[10px] text-slate-400 font-normal">pts</span>
                            </div>
                            <div className="mt-1">
                              <StatusBadge status={student.academicSummary?.overallGrade} />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <span>
                            បន្ទប់៖ <strong className="text-slate-700 dark:text-slate-200">{student.room || "—"}</strong>
                          </span>
                          <span>
                            ជំនាញ៖ <strong className="text-slate-700 dark:text-slate-200">{student.skill || "—"}</strong>
                          </span>
                        </div>

                        {/* Touch-Friendly Action Buttons (Min 44px) */}
                        <div className="grid grid-cols-3 gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleViewStudent(student.studentId)}
                            className="py-2.5 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 text-xs font-semibold flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                            <span>មើល</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(student)}
                            className="py-2.5 px-3 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-semibold flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                            <span>កែប្រែ</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openDeleteModal(student)}
                            className="py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>លុប</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Desktop / Tablet Table (Screens >= 768px) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-semibold">
                      <th className="py-3.5 px-4 font-mono">ID</th>
                      <th className="py-3.5 px-4">ឈ្មោះនិស្សិត</th>
                      <th className="py-3.5 px-3 text-center">ភេទ</th>
                      <th className="py-3.5 px-4">បន្ទប់</th>
                      <th className="py-3.5 px-4">ជំនាញ</th>
                      <th className="py-3.5 px-4 text-center">ពិន្ទុសរុប</th>
                      <th className="py-3.5 px-4 text-center">និទ្ទេស</th>
                      <th className="py-3.5 px-4 text-right">សកម្មភាព (Actions)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {students.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400">
                          <Users className="w-8 h-8 mx-auto mb-2 opacity-40 text-cyan-500" />
                          <div>មិនមានទិន្នន័យនិស្សិតដែលត្រូវនឹងលក្ខខណ្ឌស្វែងរកនេះឡើយ។</div>
                        </td>
                      </tr>
                    ) : (
                      students.map((student) => {
                        const initial = (student.fullNameKh || student.fullName || "N").charAt(0);
                        const isFemale = student.gender === "F" || student.gender === "ស្រី";
                        return (
                          <tr
                            key={student.studentId}
                            className="hover:bg-blue-500/5 dark:hover:bg-cyan-500/5 transition-colors group"
                          >
                            <td className="py-3.5 px-4 font-mono font-bold text-cyan-600 dark:text-cyan-400 text-xs tracking-wider">
                              {student.studentId}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                                    isFemale
                                      ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                                      : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                                  }`}
                                >
                                  {initial}
                                </div>
                                <div>
                                  <div className="font-bold text-slate-900 dark:text-white group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors">
                                    {student.fullNameKh || student.fullName}
                                  </div>
                                  {student.fullNameEn && student.fullNameEn !== student.fullNameKh && (
                                    <div className="text-[11px] text-slate-400 font-normal">{student.fullNameEn}</div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-3 text-center text-xs">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                  isFemale
                                    ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                                    : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                                }`}
                              >
                                {isFemale ? "ស្រី" : "ប្រុស"}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-xs font-mono font-semibold text-slate-600 dark:text-slate-300">
                              {student.room || "—"}
                            </td>
                            <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-400 max-w-[150px] truncate">
                              {student.skill || "—"}
                            </td>
                            <td className="py-3.5 px-4 text-center font-bold text-slate-900 dark:text-white font-mono text-xs">
                              {student.academicSummary?.totalScore ?? "—"}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <StatusBadge status={student.academicSummary?.overallGrade} />
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleViewStudent(student.studentId)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-xs font-semibold transition-all cursor-pointer min-h-[36px]"
                                  title="មើលពិន្ទុលម្អិត"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>មើល</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => openEditModal(student)}
                                  className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 border border-transparent hover:border-indigo-500/20 transition-all cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                                  title="កែប្រែព័ត៌មាននិស្សិត"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => openDeleteModal(student)}
                                  className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                                  title="លុបនិស្សិត"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
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
            </>
          )}

          {/* Pagination Bar */}
          {pagination.totalPages > 1 && (
            <div className="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/40">
              <span className="font-mono">
                ទំព័រ {pagination.currentPage} / {pagination.totalPages} (សរុប {pagination.totalItems} នាក់)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchStudents(pagination.currentPage - 1)}
                  disabled={pagination.currentPage <= 1 || isSyncing}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-40 transition-all cursor-pointer flex items-center gap-1 font-semibold"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>ថយ</span>
                </button>
                <button
                  onClick={() => fetchStudents(pagination.currentPage + 1)}
                  disabled={pagination.currentPage >= pagination.totalPages || isSyncing}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-40 transition-all cursor-pointer flex items-center gap-1 font-semibold"
                >
                  <span>បន្ទាប់</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* ADD STUDENT MODAL */}
      {/* ============================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-white/15 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-500 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    បន្ថែមនិស្សិតថ្មី (Add Student)
                  </h3>
                  <p className="text-xs text-slate-400">
                    បញ្ចូលទិន្នន័យទៅកាន់ប្រព័ន្ធ និងបង្កើតគណនីចូលដោយស្វ័យប្រវត្តិ
                  </p>
                </div>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    លេខសម្គាល់និស្សិត (Student ID) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    placeholder="ឧ. STU025 ឬ B2024025"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-mono"
                  />
                  <span className="text-[10px] text-slate-400">នឹងត្រូវប្រើជា Password សម្រាប់សិស្សចូល</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ភេទ (Gender)
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white cursor-pointer"
                  >
                    <option value="ប្រុស">ប្រុស (Male)</option>
                    <option value="ស្រី">ស្រី (Female)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ឈ្មោះខ្មែរ (Khmer Name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullNameKh}
                    onChange={(e) => setFormData({ ...formData, fullNameKh: e.target.value })}
                    placeholder="ឧ. ចាន់ សុខា"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white"
                  />
                  <span className="text-[10px] text-slate-400">នឹងត្រូវប្រើជា Username សម្រាប់សិស្សចូល</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ឈ្មោះឡាតាំង (Latin Name)
                  </label>
                  <input
                    type="text"
                    value={formData.fullNameEn}
                    onChange={(e) => setFormData({ ...formData, fullNameEn: e.target.value })}
                    placeholder="ឧ. Chan Sokha"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    បន្ទប់ (Room / Class)
                  </label>
                  <input
                    type="text"
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    placeholder="ឧ. 101 ឬ M1"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ជំនាញ (Major / Skill)
                  </label>
                  <input
                    type="text"
                    value={formData.skill}
                    onChange={(e) => setFormData({ ...formData, skill: e.target.value })}
                    placeholder="ឧ. ICT ឬ Computer Science"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  លេខទូរស័ព្ទ (Phone Number)
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="ឧ. 012 345 678"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-md shadow-blue-600/30 disabled:opacity-50"
                >
                  {formLoading ? "កំពុងរក្សាទុក..." : "រក្សាទុកទិន្នន័យ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* EDIT STUDENT MODAL */}
      {/* ============================================================== */}
      {isEditModalOpen && selectedStudentForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-white/15 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-500 flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    កែប្រែព័ត៌មាននិស្សិត ({selectedStudentForAction.studentId})
                  </h3>
                  <p className="text-xs text-slate-400">ធ្វើបច្ចុប្បន្នភាពទិន្នន័យលើ Cloud Database</p>
                </div>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ឈ្មោះខ្មែរ (Khmer Name)
                  </label>
                  <input
                    type="text"
                    value={formData.fullNameKh}
                    onChange={(e) => setFormData({ ...formData, fullNameKh: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ឈ្មោះឡាតាំង (Latin Name)
                  </label>
                  <input
                    type="text"
                    value={formData.fullNameEn}
                    onChange={(e) => setFormData({ ...formData, fullNameEn: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ភេទ (Gender)
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white cursor-pointer"
                  >
                    <option value="ប្រុស">ប្រុស</option>
                    <option value="ស្រី">ស្រី</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    បន្ទប់ (Room)
                  </label>
                  <input
                    type="text"
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ជំនាញ (Major)
                  </label>
                  <input
                    type="text"
                    value={formData.skill}
                    onChange={(e) => setFormData({ ...formData, skill: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-all cursor-pointer shadow-md shadow-indigo-600/30 disabled:opacity-50"
                >
                  {formLoading ? "កំពុងកែប្រែ..." : "កែប្រែទិន្នន័យ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ============================================================== */}
      {isDeleteModalOpen && selectedStudentForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-white/15 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                តើអ្នកពិតជាចង់លុបនិស្សិតនេះមែនទេ?
              </h3>
              <p className="text-xs text-slate-400">
                និស្សិត <span className="font-bold text-slate-700 dark:text-slate-200">{selectedStudentForAction.fullNameKh || selectedStudentForAction.fullName}</span> ({selectedStudentForAction.studentId}) នឹងត្រូវលុបចេញពីប្រព័ន្ធទិន្នន័យទាំងស្រុង។
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
              >
                ទេ, មិនលុបទេ
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                disabled={formLoading}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/30 cursor-pointer disabled:opacity-50"
              >
                {formLoading ? "កំពុងលុប..." : "បាទ/ចាស, លុបចេញពីប្រព័ន្ធ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* DETAIL MODAL */}
      {/* ============================================================== */}
      {selectedStudentDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-khmer animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">ព័ត៌មានលម្អិតនិស្សិត</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-xs text-cyan-600 dark:text-cyan-400 font-bold">
                      {selectedStudentDetail.studentId}
                    </span>
                    <button
                      onClick={() => handleCopyId(selectedStudentDetail.studentId)}
                      className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 cursor-pointer"
                    >
                      {copiedId ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudentDetail(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-100 dark:border-cyan-900/30 flex items-center justify-between">
                <div>
                  <div className="text-base font-extrabold text-slate-900 dark:text-white">
                    {selectedStudentDetail.fullNameKh || selectedStudentDetail.fullName}
                  </div>
                  {selectedStudentDetail.fullNameEn && (
                    <div className="text-xs text-slate-500 dark:text-slate-400">{selectedStudentDetail.fullNameEn}</div>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">បន្ទប់សិក្សា</span>
                  <span className="font-mono font-bold text-sm text-cyan-600 dark:text-cyan-400">
                    {selectedStudentDetail.room || "—"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80">
                  <span className="text-slate-400 block text-[11px]">ជំនាញ (Major)</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-xs mt-0.5 block truncate">
                    {selectedStudentDetail.skill || "—"}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80">
                  <span className="text-slate-400 block text-[11px]">ភេទ</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-xs mt-0.5 block">
                    {selectedStudentDetail.gender || "—"}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80">
                  <span className="text-slate-400 block text-[11px]">ពិន្ទុសរុប</span>
                  <span className="font-extrabold text-cyan-600 dark:text-cyan-400 text-base mt-0.5 block font-mono">
                    {selectedStudentDetail.academicSummary?.totalScore ?? "—"}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80">
                  <span className="text-slate-400 block text-[11px]">និទ្ទេសរួម</span>
                  <div className="mt-1">
                    <StatusBadge status={selectedStudentDetail.academicSummary?.overallGrade} />
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>ពិន្ទុតាមមុខវិជ្ជា និងការវាយតម្លៃ៖</span>
                  <span className="text-[11px] font-mono text-slate-400 font-normal">
                    {selectedStudentDetail.scores?.length || 0} ផ្នែក
                  </span>
                </h4>
                <div className="max-h-52 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 p-2">
                  {(selectedStudentDetail.scores || []).map((sc, i) => (
                    <div key={i} className="py-2.5 px-3 flex items-center justify-between text-xs">
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{sc.assessment}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{sc.score ?? "—"}</span>
                        <span className="text-[10px] text-slate-400 font-mono">/ {sc.maxScore || 100}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Link
                  to={`/admin/print?studentId=${encodeURIComponent(selectedStudentDetail.profile?.studentId || selectedStudentDetail.studentId || "")}`}
                  state={{ student: selectedStudentDetail }}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    try {
                      const data = JSON.stringify(selectedStudentDetail);
                      localStorage.setItem("active_print_student", data);
                      sessionStorage.setItem("active_print_student", data);
                    } catch (_) {}
                  }}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer hover:scale-[1.02] active:scale-95"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>បោះពុម្ពព្រឹត្តិបត្រពិន្ទុ (Print Slip)</span>
                </Link>

                <button
                  onClick={() => setSelectedStudentDetail(null)}
                  className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all cursor-pointer"
                >
                  បិទផ្ទាំង
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import from Excel Modal */}
      <BulkStudentImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportSuccess={handleImportSuccess}
        existingStudents={students}
      />
    </div>
  );
}
