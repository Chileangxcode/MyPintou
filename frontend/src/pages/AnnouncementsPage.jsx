import React, { useState } from "react";
import { useAnnouncements } from "../context/AnnouncementContext.jsx";
import {
  Megaphone,
  Plus,
  AlertTriangle,
  Bell,
  Calendar,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  Radio,
  Sparkles,
  Search,
  Filter,
  RefreshCw
} from "lucide-react";

export default function AnnouncementsPage() {
  const {
    announcements,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    toggleActive,
    isSyncing,
    refreshAnnouncements
  } = useAnnouncements();

  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "info",
    category: "ដំណឹងទូទៅ",
    targetClass: "ទាំងអស់",
    expiresAt: "",
    author: "ការិយាល័យសិក្សា"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      alert("សូមបំពេញចំណងជើង និងខ្លឹមសារសេចក្តីប្រកាស!");
      return;
    }
    addAnnouncement(formData);
    setShowModal(false);
    setFormData({
      title: "",
      content: "",
      type: "info",
      category: "ដំណឹងទូទៅ",
      targetClass: "ទាំងអស់",
      expiresAt: "",
      author: "ការិយាល័យសិក្សា"
    });
  };

  const filtered = announcements.filter((a) => {
    const matchSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.content.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || a.type === filterType;
    return matchSearch && matchType;
  });

  const totalCount = announcements.length;
  const activeCount = announcements.filter((a) => a.isActive).length;
  const urgentCount = announcements.filter((a) => a.type === "urgent" && a.isActive).length;

  return (
    <div className="space-y-6 font-khmer">
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 sm:p-8 text-white shadow-xl overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-200">
                School Broadcast System
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black">
              ប្រព័ន្ធផ្សព្វផ្សាយសេចក្តីជូនដំណឹង និងការប្រកាស (Announcements)
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 max-w-xl leading-relaxed">
              សរសេរប្រកាសព័ត៌មានបន្ទាន់ កាលវិភាគប្រឡង ឬការរំលឹកកិច្ចការនានា។ សេចក្តីប្រកាសដែលសកម្មនឹងបង្ហាញលើ Student Dashboard ភ្លាមៗ។
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={refreshAnnouncements}
              disabled={isSyncing}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs sm:text-sm backdrop-blur-md transition-all cursor-pointer shadow-md disabled:opacity-50"
              title="ទាញយកសេចក្តីជូនដំណឹងចុងក្រោយពី Cloud Server"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "កំពុង Sync..." : "Sync សេចក្តីជូនដំណឹង"}</span>
            </button>

            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs sm:text-sm shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>បង្កើតសេចក្តីប្រកាសថ្មី</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400">សេចក្តីប្រកាសសរុប</span>
            <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
              {totalCount}
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <Megaphone className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400">កំពុងផ្សាយលើ App (Active)</span>
            <div className="text-2xl font-black font-mono text-emerald-500">
              {activeCount}
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Radio className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400">ដំណឹងបន្ទាន់ខ្លាំង (Urgent)</span>
            <div className="text-2xl font-black font-mono text-rose-500">
              {urgentCount}
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters and List */}
      <div className="bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-white/10 p-5 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="ស្វែងរកតាមចំណងជើង ឬខ្លឹមសារ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                filterType === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              ទាំងអស់ ({announcements.length})
            </button>
            <button
              onClick={() => setFilterType("urgent")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                filterType === "urgent"
                  ? "bg-rose-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              បន្ទាន់
            </button>
            <button
              onClick={() => setFilterType("warning")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                filterType === "warning"
                  ? "bg-amber-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              ការរំលឹក
            </button>
            <button
              onClick={() => setFilterType("event")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                filterType === "event"
                  ? "bg-purple-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              ព្រឹត្តិការណ៍
            </button>
          </div>
        </div>

        {/* Announcements List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              មិនមានសេចក្តីប្រកាសដែលត្រូវនឹងការស្វែងរកឡើយ។
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  item.isActive
                    ? "bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-white/10"
                    : "bg-slate-100/40 dark:bg-slate-900/30 border-slate-200/50 dark:border-white/5 opacity-60"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          item.type === "urgent"
                            ? "bg-rose-500/15 text-rose-500 border border-rose-500/30"
                            : item.type === "warning"
                            ? "bg-amber-500/15 text-amber-500 border border-amber-500/30"
                            : item.type === "event"
                            ? "bg-purple-500/15 text-purple-500 border border-purple-500/30"
                            : "bg-blue-500/15 text-blue-500 border border-blue-500/30"
                        }`}
                      >
                        {item.type === "urgent"
                          ? "🚨 បន្ទាន់ខ្លាំង"
                          : item.type === "warning"
                          ? "⚠️ ការរំលឹក"
                          : item.type === "event"
                          ? "🎉 ព្រឹត្តិការណ៍"
                          : "📢 ដំណឹងទូទៅ"}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        កាលបរិច្ឆេទ៖ {item.createdAt}
                      </span>
                      {item.expiresAt && (
                        <span className="text-[11px] text-slate-400 font-mono">
                          • ផុតកំណត់៖ {item.expiresAt}
                        </span>
                      )}
                      <span className="text-[11px] text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded-md">
                        {item.targetClass || "គ្រប់ថ្នាក់"}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      {item.content}
                    </p>
                    <div className="text-[11px] text-slate-400">
                      អ្នកផ្សាយ៖ <strong className="text-slate-500 dark:text-slate-300">{item.author}</strong>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-white/5">
                    <button
                      onClick={() => toggleActive(item.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        item.isActive
                          ? "bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 border border-emerald-500/30"
                          : "bg-slate-200 dark:bg-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-white"
                      }`}
                    >
                      {item.isActive ? "🟢 កំពុងផ្សាយ" : "⚪ បានផ្អាក"}
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`តើអ្នកប្រាកដជាចង់លុបសេចក្តីប្រកាស «${item.title}» មែនទេ?`)) {
                          deleteAnnouncement(item.id);
                        }
                      }}
                      className="p-2 rounded-xl text-rose-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="លុបសេចក្តីប្រកាស"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-khmer animate-fade-in">
          <div className="w-full max-w-xl bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center">
                  <Megaphone className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  បង្កើតសេចក្តីប្រកាសថ្មី (New Announcement)
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  ចំណងជើងសេចក្តីប្រកាស *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ឧ. កាលវិភាគប្រឡងបញ្ចប់ឆមាស..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-hidden focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    ប្រភេទ / កម្រិតបន្ទាន់
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-hidden"
                  >
                    <option value="info">📢 ដំណឹងទូទៅ (General Info)</option>
                    <option value="urgent">🚨 បន្ទាន់ខ្លាំង (Urgent Alert)</option>
                    <option value="warning">⚠️ ការរំលឹក (Reminder / Warning)</option>
                    <option value="event">🎉 ព្រឹត្តិការណ៍ (Event / Activity)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    គោលដៅសិស្ស (Target Class)
                  </label>
                  <input
                    type="text"
                    placeholder="ទាំងអស់ ឬ ថ្នាក់ IT-Year 3"
                    value={formData.targetClass}
                    onChange={(e) => setFormData({ ...formData, targetClass: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  ខ្លឹមសារសេចក្តីប្រកាសលម្អិត *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="សរសេរខ្លឹមសារសេចក្តីជូនដំណឹងនៅទីនេះ..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-hidden leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    កាលបរិច្ឆេទផុតកំណត់ (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    អ្នកផ្សាយ / ស្ថាប័ន
                  </label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/30 cursor-pointer"
                >
                  ផ្សាយដំណឹងនេះភ្លាមៗ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
