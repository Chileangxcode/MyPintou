import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  KeyRound,
  ShieldCheck,
  GraduationCap,
  Search,
  Filter,
  RefreshCw,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Check,
  X,
  AlertCircle,
  Sparkles,
  Lock,
  User,
  Copy,
  Save,
  CheckCircle2,
  Layers,
  FileSpreadsheet
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import {
  getUsersList,
  createUser,
  updateUser,
  deleteUser,
  syncUserLogins
} from "../api/adminApi.js";
import RealtimeIndicator from "../components/RealtimeIndicator.jsx";
import { SkeletonTable } from "../components/LoadingSkeleton.jsx";
import { useAutoRefresh } from "../hooks/useAutoRefresh.js";

export default function UserManagementPage() {
  const { adminSession } = useAuth();
  const [users, setUsers] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [stats, setStats] = useState({ totalUsers: 0, adminCount: 0, teacherCount: 0, studentCount: 0, activeCount: 0 });
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0, pageSize: 20 });

  // Filters
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Passwords visibility state { [userId]: boolean }
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [copiedId, setCopiedId] = useState("");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    fullName: "",
    role: "student",
    studentId: "",
    room: "",
    skill: "",
    status: "Active"
  });

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [syncLoading, setSyncLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState({ type: "", text: "" });

  const showToast = (type, text) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage({ type: "", text: "" }), 5000);
  };

  const fetchUsers = async (page = 1, refresh = false) => {
    if (!adminSession) return;
    if (users.length === 0) {
      setInitialLoading(true);
    } else {
      setIsSyncing(true);
    }
    try {
      const res = await getUsersList(adminSession.token, {
        page,
        pageSize: 20,
        search,
        role: roleFilter,
        status: statusFilter,
        refresh: refresh ? "true" : "false"
      });
      if (res.success && res.data) {
        setUsers(res.data.users || []);
        if (res.data.pagination) setPagination(res.data.pagination);
        if (res.data.stats) setStats(res.data.stats);
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setInitialLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, [adminSession, roleFilter, statusFilter]);

  useAutoRefresh(() => fetchUsers(pagination.currentPage, true), 30000);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers(1);
  };

  const togglePasswordVisibility = (userId) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(""), 2000);
  };

  // Open Add Modal
  const openAddModal = () => {
    setFormData({
      username: "",
      password: "",
      fullName: "",
      role: "student",
      studentId: "",
      room: "",
      skill: "",
      status: "Active"
    });
    setFormError("");
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.username || "",
      password: user.password || "",
      fullName: user.fullName || "",
      role: user.role || "student",
      studentId: user.studentId && user.studentId !== "N/A" ? user.studentId : "",
      room: user.room || "",
      skill: user.skill || "",
      status: user.status || "Active"
    });
    setFormError("");
    setIsEditModalOpen(true);
  };

  // Open Delete Modal
  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  // Submit Add User (0ms Optimistic Update - Zero Page Reload)
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    const tempId = `USR-${Date.now().toString().slice(-4)}`;
    const optimisticUser = {
      userId: tempId,
      username: formData.username.trim(),
      password: formData.password.trim(),
      fullName: (formData.fullName || formData.username).trim(),
      role: formData.role || "student",
      studentId: formData.studentId || (formData.role === "student" ? formData.password : "N/A"),
      room: formData.room || "",
      skill: formData.skill || "",
      status: formData.status || "Active",
      createdAt: new Date().toISOString(),
      lastLogin: ""
    };

    // Instant local UI feedback (0ms!)
    setUsers((prev) => [optimisticUser, ...prev]);
    setStats((prev) => ({
      ...prev,
      totalUsers: prev.totalUsers + 1,
      studentCount: optimisticUser.role === "student" ? prev.studentCount + 1 : prev.studentCount,
      teacherCount: optimisticUser.role === "teacher" ? prev.teacherCount + 1 : prev.teacherCount,
      adminCount: optimisticUser.role === "admin" ? prev.adminCount + 1 : prev.adminCount,
      activeCount: prev.activeCount + 1
    }));
    setIsAddModalOpen(false);
    showToast("success", `បានបង្កើតគណនី ${formData.username} ជោគជ័យ!`);

    // Background sync to Google Sheet
    try {
      const res = await createUser(adminSession.token, formData);
      if (res.success && res.data?.userId) {
        setUsers((prev) => prev.map((u) => u.userId === tempId ? { ...u, userId: res.data.userId } : u));
      } else if (!res.success) {
        // Rollback
        setUsers((prev) => prev.filter((u) => u.userId !== tempId));
        showToast("error", res.message || "មិនអាចរក្សាទុកគណនីទៅកាន់ Server ឡើយ។");
      }
    } catch (err) {
      setUsers((prev) => prev.filter((u) => u.userId !== tempId));
      showToast("error", err.message || "មានបញ្ហាបច្ចេកទេស។");
    }
  };

  // Submit Edit User (0ms Optimistic Update)
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    const prevUser = { ...selectedUser };

    // Instant local update (0ms!)
    setUsers((prev) =>
      prev.map((u) =>
        u.userId === selectedUser.userId
          ? {
              ...u,
              username: formData.username.trim(),
              password: formData.password.trim(),
              fullName: (formData.fullName || formData.username).trim(),
              role: formData.role || u.role,
              studentId: formData.studentId || u.studentId,
              room: formData.room || "",
              skill: formData.skill || "",
              status: formData.status || u.status
            }
          : u
      )
    );
    setIsEditModalOpen(false);
    showToast("success", `បានកែប្រែព័ត៌មានគណនី ${selectedUser.username} ជោគជ័យ!`);

    // Background sync to Google Sheet
    try {
      const res = await updateUser(adminSession.token, selectedUser.userId, formData);
      if (!res.success) {
        // Rollback
        setUsers((prev) => prev.map((u) => u.userId === prevUser.userId ? prevUser : u));
        showToast("error", res.message || "មិនអាចកែប្រែគណនីបានឡើយ។");
      }
    } catch (err) {
      setUsers((prev) => prev.map((u) => u.userId === prevUser.userId ? prevUser : u));
      showToast("error", err.message || "មានបញ្ហាបច្ចេកទេស។");
    }
  };

  // Submit Delete User (0ms Optimistic Update)
  const handleDeleteSubmit = async () => {
    if (!selectedUser) return;
    const deletedUser = { ...selectedUser };

    // Instant local removal (0ms!)
    setUsers((prev) => prev.filter((u) => u.userId !== selectedUser.userId));
    setStats((prev) => ({
      ...prev,
      totalUsers: Math.max(0, prev.totalUsers - 1),
      activeCount: deletedUser.status === "Active" ? Math.max(0, prev.activeCount - 1) : prev.activeCount
    }));
    setIsDeleteModalOpen(false);
    showToast("success", `បានលុបគណនី ${deletedUser.username} ជោគជ័យ!`);

    // Background sync to Google Sheet
    try {
      const res = await deleteUser(adminSession.token, selectedUser.userId);
      if (!res.success) {
        // Rollback
        setUsers((prev) => [deletedUser, ...prev]);
        showToast("error", res.message || "មិនអាចលុបគណនីបានឡើយ។");
      }
    } catch (err) {
      setUsers((prev) => [deletedUser, ...prev]);
      showToast("error", err.message || "មានបញ្ហាបច្ចេកទេស។");
    }
  };

  // Trigger Sheet Sync (Silent in-place update without blanking page)
  const handleSyncUsers = async () => {
    setSyncLoading(true);
    showToast("info", "កំពុងធ្វើសមកាលកម្មទិន្នន័យក្នុងផ្ទៃខាងក្រោយ...");
    try {
      const res = await syncUserLogins(adminSession.token);
      if (res.success) {
        showToast("success", res.message || "បានធ្វើសមកាលកម្មគណនីទាំងអស់ទៅ Database ជោគជ័យ!");
        // Re-fetch users silently in-place without unmounting table
        fetchUsers(1, true);
      } else {
        showToast("error", res.message || "ការធ្វើសមកាលកម្មមិនជោគជ័យទេ។");
      }
    } catch (err) {
      showToast("error", err.message || "មានបញ្ហាបច្ចេកទេសក្នុងការ Sync។");
    } finally {
      setSyncLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-khmer">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="font-bold">ប្រព័ន្ធមូលទិន្នន័យគណនី (User Directory)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <span>គ្រប់គ្រងគណនីចូលប្រព័ន្ធ (User Logins)</span>
            <span className="text-xs px-2.5 py-0.5 rounded-lg bg-blue-500/10 text-blue-500 font-mono font-bold">
              CRUD Active
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            គ្រប់គ្រងគណនីគ្រូ និងសិស្សទាំងអស់ក្នុងប្រព័ន្ធ (គ្រូប្រើ Username/Password • សិស្សប្រើឈ្មោះ និង Student ID ជា Password)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleSyncUsers}
            disabled={syncLoading}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 text-blue-600 dark:text-blue-400 text-xs font-bold transition-all cursor-pointer shadow-sm disabled:opacity-50"
            title="ទាញបញ្ជីឈ្មោះសិស្សទាំងអស់មកបង្កើតជាគណនីចូលដោយស្វ័យប្រវត្តិ"
          >
            <RefreshCw className={`w-4 h-4 ${syncLoading ? "animate-spin" : ""}`} />
            <span>{syncLoading ? "កំពុង Sync..." : "Sync គណនីសិស្សពីទិន្នន័យមេ"}</span>
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>បន្ថែមគណនីថ្មី</span>
          </button>

          <RealtimeIndicator onRefresh={() => fetchUsers(pagination.currentPage, true)} loading={isSyncing} />
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
          <button onClick={() => setToastMessage({ type: "", text: "" })} className="p-1 hover:opacity-70">
            ✕
          </button>
        </div>
      )}

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-white/80 dark:bg-[#0c1427]/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-indigo-500/15 text-indigo-500 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">គណនីសរុប</div>
            <div className="text-xl font-black text-slate-900 dark:text-white font-mono">{stats.totalUsers}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/80 dark:bg-[#0c1427]/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">អ្នកគ្រប់គ្រង (Admin)</div>
            <div className="text-xl font-black text-blue-600 dark:text-blue-400 font-mono">{stats.adminCount}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/80 dark:bg-[#0c1427]/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">សាស្ត្រាចារ្យ (Teacher)</div>
            <div className="text-xl font-black text-blue-600 dark:text-blue-400 font-mono">{stats.teacherCount}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/80 dark:bg-[#0c1427]/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">គណនីសិស្ស (Student)</div>
            <div className="text-xl font-black text-blue-600 dark:text-blue-400 font-mono">{stats.studentCount}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/80 dark:bg-[#0c1427]/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-sm flex items-center gap-3 col-span-2 sm:col-span-1">
          <div className="w-11 h-11 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">សកម្ម (Active)</div>
            <div className="text-xl font-black text-blue-600 dark:text-blue-400 font-mono">{stats.activeCount}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="relative p-[1px] rounded-3xl bg-gradient-to-r from-blue-500/20 via-blue-500/10 to-transparent">
        <div className="bg-white/85 dark:bg-[#0b1329]/85 backdrop-blur-xl rounded-[23px] border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-sm space-y-3">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-blue-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ស្វែងរកតាម User ID, ឈ្មោះគណនី, ឈ្មោះពេញ ឬ Student ID..."
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all h-10"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900/80 focus:outline-none focus:ring-2 focus:ring-blue-500/50 h-10 cursor-pointer"
              >
                <option value="all">តួនាទីទាំងអស់</option>
                <option value="admin">Admin (អ្នកគ្រប់គ្រង)</option>
                <option value="teacher">Teacher (សាស្ត្រាចារ្យ)</option>
                <option value="student">Student (និស្សិត)</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900/80 focus:outline-none focus:ring-2 focus:ring-blue-500/50 h-10 cursor-pointer"
              >
                <option value="all">ស្ថានភាពទាំងអស់</option>
                <option value="active">Active (សកម្ម)</option>
                <option value="inactive">Inactive (អសកម្ម)</option>
              </select>

              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold transition-all h-10 cursor-pointer shadow-sm shadow-blue-600/20 active:scale-95 shrink-0"
              >
                ស្វែងរក
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-[#0c1427]/90 backdrop-blur-xl overflow-hidden shadow-sm relative">
        {/* Subtle Sync Indicator at top edge - 0ms flicker */}
        {isSyncing && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 animate-pulse z-10" />
        )}
        {initialLoading && users.length === 0 ? (
          <div className="p-6">
            <SkeletonTable rows={8} />
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto">
              <Users className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-800 dark:text-white">មិនមានទិន្នន័យគណនីឡើយ</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              ចុចប៊ូតុង "Sync គណនីសិស្សពីទិន្នន័យមេ" ដើម្បីទាញបញ្ជីសិស្សមកបង្កើតគណនីស្វ័យប្រវត្តិ ឬចុច "បន្ថែមគណនីថ្មី"។
            </p>
            <button
              onClick={handleSyncUsers}
              disabled={syncLoading}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-all cursor-pointer shadow-md"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync គណនីសិស្សឥឡូវនេះ</span>
            </button>
          </div>
        ) : (
          <div>
            {/* Mobile Cards View (< 768px) */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-white/5 p-3 space-y-3">
              {users.map((user) => {
                const isPassVisible = visiblePasswords[user.userId];
                const isStudent = user.role === "student";
                const isAdmin = user.role === "admin";
                const isTeacher = user.role === "teacher";

                return (
                  <div
                    key={user.userId}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 space-y-3 shadow-xs"
                  >
                    {/* Header: User ID & Badges */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-mono font-bold text-slate-800 dark:text-slate-200">
                          #{user.userId}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isAdmin
                              ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                              : isTeacher
                              ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                              : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isAdmin ? "bg-rose-500" : isTeacher ? "bg-blue-500" : "bg-emerald-500"
                            }`}
                          />
                          <span>{isAdmin ? "Admin" : isTeacher ? "Teacher" : "Student"}</span>
                        </span>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          user.status?.toLowerCase() === "active"
                            ? "bg-teal-500/10 text-teal-600 dark:text-teal-400"
                            : "bg-slate-500/10 text-slate-500"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            user.status?.toLowerCase() === "active" ? "bg-teal-500 animate-pulse" : "bg-slate-400"
                          }`}
                        />
                        <span>{user.status || "Active"}</span>
                      </span>
                    </div>

                    {/* Name & Username */}
                    <div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white">
                        {user.fullName || user.username}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                        <span>@{user.username}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(user.username, `u-${user.userId}`)}
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white touch-target flex items-center justify-center"
                          title="Copy Username"
                        >
                          {copiedId === `u-${user.userId}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Student Info if applicable */}
                    {isStudent && user.studentId && (
                      <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
                        <span className="font-mono font-bold text-indigo-500 dark:text-indigo-400">ID: {user.studentId}</span>
                        {user.room && (
                          <span className="text-slate-400">• បន្ទប់ {user.room}</span>
                        )}
                      </div>
                    )}

                    {/* Password Row */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/5 text-xs">
                      <span className="font-mono text-slate-700 dark:text-slate-300">
                        {isPassVisible ? user.password : "••••••••"}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(user.userId)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                          title={isPassVisible ? "លាក់" : "បង្ហាញ"}
                        >
                          {isPassVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(user.password, `p-${user.userId}`)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                          title="Copy Password"
                        >
                          {copiedId === `p-${user.userId}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-white/5">
                      <button
                        type="button"
                        onClick={() => openEditModal(user)}
                        className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition-all"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>កែប្រែ</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => openDeleteModal(user)}
                        className="min-h-[44px] px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold transition-all"
                        title="លុបគណនី"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View (>= 768px) */}
            <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-semibold">
                  <th className="py-3.5 px-4 font-mono">User ID</th>
                  <th className="py-3.5 px-4">ឈ្មោះគណនី (Username)</th>
                  <th className="py-3.5 px-4">លេខសម្ងាត់ (Password)</th>
                  <th className="py-3.5 px-4">ឈ្មោះពេញ</th>
                  <th className="py-3.5 px-4">តួនាទី (Role)</th>
                  <th className="py-3.5 px-4">Student ID / បន្ទប់</th>
                  <th className="py-3.5 px-4">ស្ថានភាព</th>
                  <th className="py-3.5 px-4 text-right">សកម្មភាព (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {users.map((user) => {
                  const isPassVisible = visiblePasswords[user.userId];
                  const isStudent = user.role === "student";
                  const isAdmin = user.role === "admin";
                  const isTeacher = user.role === "teacher";

                  return (
                    <tr
                      key={user.userId}
                      className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* User ID */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px]">
                          {user.userId}
                        </span>
                      </td>

                      {/* Username */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{user.username}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(user.username, `u-${user.userId}`)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                            title="Copy Username"
                          >
                            {copiedId === `u-${user.userId}` ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Password */}
                      <td className="py-3 px-4">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 font-mono text-[11px]">
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {isPassVisible ? user.password : "••••••••"}
                          </span>
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(user.userId)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                            title={isPassVisible ? "លាក់" : "បង្ហាញ"}
                          >
                            {isPassVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(user.password, `p-${user.userId}`)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                            title="Copy Password"
                          >
                            {copiedId === `p-${user.userId}` ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        {isStudent && (
                          <div className="text-[10px] text-slate-400 mt-0.5 font-sans">
                            (ប្រើ Student ID)
                          </div>
                        )}
                      </td>

                      {/* Full Name */}
                      <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                        {user.fullName || user.username}
                      </td>

                      {/* Role */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            isAdmin
                              ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                              : isTeacher
                              ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                              : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isAdmin ? "bg-rose-500" : isTeacher ? "bg-blue-500" : "bg-emerald-500"
                            }`}
                          />
                          <span>{isAdmin ? "Admin" : isTeacher ? "Teacher" : "Student"}</span>
                        </span>
                      </td>

                      {/* Student ID / Room */}
                      <td className="py-3 px-4">
                        {isStudent ? (
                          <div>
                            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                              {user.studentId}
                            </span>
                            {user.room && (
                              <span className="ml-1.5 text-[11px] text-slate-400">
                                (បន្ទប់ {user.room})
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono">N/A</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold ${
                            user.status?.toLowerCase() === "active"
                              ? "bg-teal-500/10 text-teal-600 dark:text-teal-400"
                              : "bg-slate-500/10 text-slate-500"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              user.status?.toLowerCase() === "active" ? "bg-teal-500 animate-pulse" : "bg-slate-400"
                            }`}
                          />
                          <span>{user.status || "Active"}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(user)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors cursor-pointer"
                            title="កែប្រែគណនី"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => openDeleteModal(user)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="លុបគណនី"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs text-slate-500">
            <div>
              បង្ហាញ {users.length} នៃ {pagination.totalItems} គណនីសរុប (ទំព័រ {pagination.currentPage}/{pagination.totalPages})
            </div>
            <div className="flex items-center gap-1.5">
              <button
                disabled={pagination.currentPage <= 1}
                onClick={() => fetchUsers(pagination.currentPage - 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 cursor-pointer"
              >
                មុន
              </button>
              <button
                disabled={pagination.currentPage >= pagination.totalPages}
                onClick={() => fetchUsers(pagination.currentPage + 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 cursor-pointer"
              >
                បន្ទាប់
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* ADD USER MODAL */}
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
                    បន្ថែមគណនីអ្នកប្រើប្រាស់ថ្មី
                  </h3>
                  <p className="text-xs text-slate-400">ទិន្នន័យនឹងត្រូវសរសេរផ្ទាល់ទៅកាន់ Database មេ</p>
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
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  តួនាទីគណនី (Role) *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["student", "teacher", "admin"].map((r) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setFormData({ ...formData, role: r })}
                      className={`py-2 rounded-xl border text-center font-bold capitalize transition-all cursor-pointer ${
                        formData.role === r
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      {r === "student" ? "និស្សិត (Student)" : r === "teacher" ? "គ្រូ (Teacher)" : "Admin"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ឈ្មោះគណនី (Username) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder={formData.role === "student" ? "ឈ្មោះនិស្សិត (ខ្មែរ/ឡាតាំង)" : "ឧ. admin ឬ leang"}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white"
                  />
                  {formData.role === "student" && (
                    <span className="text-[10px] text-slate-400">សម្រាប់សិស្ស៖ ឈ្មោះនិស្សិតជា Username</span>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    លេខសម្ងាត់ (Password) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={formData.role === "student" ? "Student ID ជាលេខសម្ងាត់" : "លេខសម្ងាត់ខ្លាំង"}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-mono"
                  />
                  {formData.role === "student" && (
                    <span className="text-[10px] text-slate-400">សម្រាប់សិស្ស៖ Student ID ជា Password</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ឈ្មោះពេញ (Full Name / Display Name)
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="ឈ្មោះពេញរបស់គណនី"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white"
                />
              </div>

              {formData.role === "student" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-800/30">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Student ID *
                    </label>
                    <input
                      type="text"
                      value={formData.studentId}
                      onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                      placeholder="ឧ. STU001"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      បន្ទប់ (Room)
                    </label>
                    <input
                      type="text"
                      value={formData.room}
                      onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                      placeholder="ឧ. 101"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
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
                      placeholder="ឧ. ICT"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ស្ថានភាព (Status)
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white cursor-pointer"
                >
                  <option value="Active">Active (សកម្ម)</option>
                  <option value="Inactive">Inactive (ផ្អាកដំណើរការ)</option>
                </select>
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
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-md shadow-blue-600/30 disabled:opacity-50"
                >
                  {formLoading ? "កំពុងរក្សាទុក..." : "រក្សាទុកទិន្នន័យ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* EDIT USER MODAL */}
      {/* ============================================================== */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-white/15 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-500 flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    កែប្រែគណនី ({selectedUser.userId})
                  </h3>
                  <p className="text-xs text-slate-400">ធ្វើបច្ចុប្បន្នភាពទិន្នន័យលើ Cloud Server</p>
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
                    ឈ្មោះគណនី (Username) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    លេខសម្ងាត់ (Password) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ឈ្មោះពេញ (Full Name)
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    តួនាទី (Role)
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white cursor-pointer capitalize"
                  >
                    <option value="student">Student (និស្សិត)</option>
                    <option value="teacher">Teacher (សាស្ត្រាចារ្យ)</option>
                    <option value="admin">Admin (អ្នកគ្រប់គ្រង)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ស្ថានភាព (Status)
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white cursor-pointer"
                  >
                    <option value="Active">Active (សកម្ម)</option>
                    <option value="Inactive">Inactive (អសកម្ម)</option>
                  </select>
                </div>
              </div>

              {formData.role === "student" && (
                <div className="grid grid-cols-2 gap-3.5 p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-800/30">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Student ID
                    </label>
                    <input
                      type="text"
                      value={formData.studentId}
                      onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      បន្ទប់ (Room)
                    </label>
                    <input
                      type="text"
                      value={formData.room}
                      onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              )}

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
      {isDeleteModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-white/15 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                តើអ្នកពិតជាចង់លុបគណនីនេះមែនទេ?
              </h3>
              <p className="text-xs text-slate-400">
                គណនី <span className="font-bold text-slate-700 dark:text-slate-200">{selectedUser.username}</span> ({selectedUser.userId}) នឹងត្រូវលុបចេញពីប្រព័ន្ធទិន្នន័យ។
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
    </div>
  );
}
