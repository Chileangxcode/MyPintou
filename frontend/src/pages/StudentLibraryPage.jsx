import React, { useState } from "react";
import {
  BookOpen,
  Search,
  Download,
  Eye,
  FileText,
  Video,
  Presentation,
  Code2,
  Sparkles,
  GraduationCap,
  Calendar,
  User,
  X,
  Play,
  Share2,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  ExternalLink,
  Layers,
  ArrowDownToLine,
  TrendingUp,
  RefreshCw,
  Globe
} from "lucide-react";
import { useELibrary, RESOURCE_CATEGORIES, MAJORS_LIST, DEFAULT_MAJORS_PRESETS, detectPlatform } from "../context/ELibraryContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useSchool } from "../context/SchoolContext.jsx";
import { SocialPlatformIcon } from "../components/SocialPlatformIcon.jsx";
import { dataSyncService } from "../services/dataSyncService.js";

export default function StudentLibraryPage() {
  const {
    resources,
    recordDownload,
    recordView,
    refreshLibraryResources,
    isSyncing,
    lastSyncTime
  } = useELibrary();
  const { studentSession } = useAuth();
  const { schoolInfo } = useSchool();

  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedMajor, setSelectedMajor] = useState("ទាំងអស់ (All Majors)");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewItem, setPreviewItem] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [syncToast, setSyncToast] = useState(null);
  const [savedIds, setSavedIds] = useState(() => {
    try {
      const s = localStorage.getItem("mypintou_student_bookmarks");
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  // Subscribe to real-time elibrary events for instant cross-tab / cloud push updates
  React.useEffect(() => {
    const unsub = dataSyncService.subscribeToEntity("elibrary", () => {
      refreshLibraryResources(true);
    });
    return () => unsub();
  }, []);

  const handleManualSync = async () => {
    try {
      await refreshLibraryResources(true);
      setSyncToast({
        type: "success",
        message: "បាន Sync ធនធានបណ្ណាល័យឌីជីថលពី Cloud Server ជោគជ័យ! (Real-Time Live)"
      });
      setTimeout(() => setSyncToast(null), 4000);
    } catch (e) {
      setSyncToast({
        type: "error",
        message: "បរាជ័យក្នុងការ Sync ពី Cloud Server"
      });
      setTimeout(() => setSyncToast(null), 4000);
    }
  };

  const toggleBookmark = (id) => {
    setSavedIds((prev) => {
      const updated = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem("mypintou_student_bookmarks", JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });
  };

  const handleDownload = (res) => {
    setDownloadingId(res.id);
    recordDownload(res.id);

    setTimeout(() => {
      if (res.fileUrl && res.fileUrl.startsWith("/")) {
        const a = document.createElement("a");
        a.href = res.fileUrl;
        a.download = res.fileUrl.split("/").pop();
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else if (res.fileUrl && res.fileUrl.startsWith("http")) {
        window.open(res.fileUrl, "_blank");
      }
      setDownloadingId(null);
    }, 400);
  };

  const handleOpenPreview = (res) => {
    recordView(res.id);
    setPreviewItem(res);
  };

  const dynamicMajors = React.useMemo(() => {
    const list = ["ទាំងអស់ (All Majors)"];
    const found = new Set();

    if (Array.isArray(DEFAULT_MAJORS_PRESETS)) {
      DEFAULT_MAJORS_PRESETS.forEach((p) => {
        if (p && !found.has(p)) {
          found.add(p);
          list.push(p);
        }
      });
    }

    resources.forEach((r) => {
      if (r.major && !found.has(r.major)) {
        found.add(r.major);
        list.push(r.major);
      }
    });

    if (!found.has("គណនេយ្យ")) {
      list.push("គណនេយ្យ");
    }
    return list;
  }, [resources]);

  // Filter items
  const filteredResources = resources.filter((res) => {
    if (showSavedOnly && !savedIds.includes(res.id)) return false;
    const matchCategory = activeCategory === "all" || res.category === activeCategory;
    const matchMajor = selectedMajor === "ទាំងអស់ (All Majors)" || res.major === selectedMajor || res.major.includes(selectedMajor);
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      res.title.toLowerCase().includes(q) ||
      res.subject.toLowerCase().includes(q) ||
      res.lecturer.toLowerCase().includes(q) ||
      res.description.toLowerCase().includes(q);
    return matchCategory && matchMajor && matchSearch;
  });

  const getCategoryBadge = (category, fileUrl = "") => {
    switch (category) {
      case "website": {
        const plat = detectPlatform(fileUrl);
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <SocialPlatformIcon type={plat.type} className="w-3.5 h-3.5" />
            <span>{plat.name}</span>
          </span>
        );
      }
      case "slides":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20"><Presentation className="w-3.5 h-3.5" /> ស្លាយ PowerPoint</span>;
      case "ebook":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20"><BookOpen className="w-3.5 h-3.5" /> សៀវភៅ PDF</span>;
      case "video":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20"><Video className="w-3.5 h-3.5" /> វីដេអូពន្យល់</span>;
      case "exercise":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><Code2 className="w-3.5 h-3.5" /> លំហាត់គំរូ</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20"><FileText className="w-3.5 h-3.5" /> ឯកសារ</span>;
    }
  };

  return (
    <div className="space-y-6 font-khmer pb-16">
      {/* Real-time Sync Toast Notification */}
      {syncToast && (
        <div className={`p-4 rounded-2xl flex items-center justify-between shadow-xl transition-all border ${
          syncToast.type === "success"
            ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-200"
            : "bg-rose-950/80 border-rose-500/40 text-rose-200"
        }`}>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-sm font-bold font-khmer">{syncToast.message}</span>
          </div>
          <button onClick={() => setSyncToast(null)} className="text-slate-400 hover:text-white p-1 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Student E-Library Hero Header (Unified Royal Blue System) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-slate-900 text-white shadow-2xl border border-blue-500/30 p-6 md:p-8">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 bg-blue-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-20 w-72 h-72 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/20 text-white text-xs font-semibold tracking-wide backdrop-blur-md shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-blue-300" />
                <span>បណ្ណាល័យឌីជីថលនិស្សិត (Student E-Library & Courseware)</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/25 border border-blue-400/40 text-blue-200 text-xs font-bold tracking-wide backdrop-blur-md shadow-sm">
                <span className={`w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_0_8px_#3b82f6] ${isSyncing ? "animate-ping" : ""}`} />
                <span>Cloud Repository Live</span>
                {lastSyncTime && (
                  <span className="text-blue-200/80 text-[11px] ml-1">
                    • {new Date(lastSyncTime).toLocaleTimeString("km-KH", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                )}
              </div>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3 drop-shadow-sm">
              <div className="w-11 h-11 rounded-2xl bg-white/20 border border-white/25 flex items-center justify-center text-white shadow-inner">
                <BookOpen className="w-6 h-6" />
              </div>
              <span>បណ្ណាល័យ និងធនធានសិក្សាឌីជីថល</span>
            </h1>

            <p className="text-blue-100 text-sm md:text-base font-normal leading-relaxed">
              ទាញយកស្លាយមេរៀន (PowerPoint), សៀវភៅអេឡិចត្រូនិច (PDF), វីដេអូពន្យល់ និងកម្រងលំហាត់គំរូគ្រប់មុខវិជ្ជា ដើម្បីបង្កើនសមត្ថភាព និងត្រៀមប្រឡងឆមាស (ទិន្នន័យផ្ទុកផ្ទាល់ពី Cloud Repository)។
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleManualSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/25 text-white text-xs font-bold transition-all cursor-pointer active:scale-95 disabled:opacity-50 backdrop-blur-md shadow-sm"
              title="ទាញយកទិន្នន័យចុងក្រោយពី Cloud Database"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-200 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "កំពុង Sync..." : "Sync ពី Cloud Server"}</span>
            </button>

            {/* Quick Bookmark Toggle button */}
            <button
              onClick={() => setShowSavedOnly(!showSavedOnly)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all cursor-pointer backdrop-blur-md ${
                showSavedOnly
                  ? "bg-amber-400 text-slate-950 border-amber-300 shadow-lg shadow-amber-400/30 font-black"
                  : "bg-white/15 text-white border-white/25 hover:bg-white/25"
              }`}
            >
              <Bookmark className="w-4 h-4 fill-current text-amber-300" />
              <span>ឯកសាររក្សាទុក ({savedIds.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-5 shadow-sm space-y-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {RESOURCE_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                <i className={`${cat.icon} text-xs`} />
                <span>{cat.labelKh}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Major Filter */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
          <div className="md:col-span-7 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ស្វែងរកតាមឈ្មោះមេរៀន, មុខវិជ្ជា, ឈ្មោះសាស្ត្រាចារ្យ..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>

          <div className="md:col-span-5 relative">
            <select
              value={selectedMajor}
              onChange={(e) => setSelectedMajor(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 cursor-pointer"
            >
              {dynamicMajors.map((m) => (
                <option key={m} value={m} className="bg-slate-900 text-white">
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Resource Cards */}
      {filteredResources.length === 0 ? (
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mx-auto flex items-center justify-center text-slate-400 mb-3">
            <BookOpen className="w-8 h-8" />
          </div>
          <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
            មិនមានឯកសារត្រូវតាមលក្ខខណ្ឌស្វែងរកនេះទេ
          </p>
          <p className="text-xs text-slate-500 mt-1">
            សូមផ្លាស់ប្តូរពាក្យស្វែងរក ឬប្រភេទមុខវិជ្ជាផ្សេងទៀត
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResources.map((res) => {
            const isSaved = savedIds.includes(res.id);
            const isDownloading = downloadingId === res.id;

            return (
              <div
                key={res.id}
                className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-md hover:shadow-xl hover:border-cyan-500/40 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Glow accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl group-hover:bg-cyan-500/10 transition-all pointer-events-none" />

                <div className="space-y-3">
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    {getCategoryBadge(res.category, res.fileUrl)}
                    <button
                      onClick={() => toggleBookmark(res.id)}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        isSaved
                          ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                          : "text-slate-400 hover:text-amber-500 border-transparent hover:border-slate-700"
                      }`}
                      title={isSaved ? "ដកចេញពីបញ្ជីរក្សាទុក" : "រក្សាទុកឯកសារនេះ"}
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
                    </button>
                  </div>

                  {/* Title & Subject */}
                  <div>
                    <span className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 block mb-1">
                      {res.subject}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-cyan-400 transition-colors">
                      {res.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {res.description}
                  </p>

                  {/* Meta Details */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5 truncate">
                      <User className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>{res.lecturer}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="flex items-center gap-1 text-[11px]">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {res.academicYear}
                      </span>
                      <span className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 dark:text-slate-400">
                        {res.fileType} • {res.fileSize}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="grid grid-cols-2 gap-2 mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <button
                    onClick={() => handleOpenPreview(res)}
                    className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-cyan-500 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-4 h-4 text-cyan-500" />
                    <span>មើលគំរូ</span>
                  </button>

                  {res.category === "website" ? (
                    <a
                      href={res.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => recordView(res.id)}
                      className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-sky-500/20 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>បើកស្រាវជ្រាវ</span>
                    </a>
                  ) : (
                    <button
                      onClick={() => handleDownload(res)}
                      disabled={isDownloading}
                      className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-cyan-500/20 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      {isDownloading ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          <span>កំពុងទាញ...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          <span>ទាញយក</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Resource Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div className="flex items-center gap-2.5">
                {getCategoryBadge(previewItem.category, previewItem.fileUrl)}
                <h3 className="font-bold text-white text-base truncate max-w-md">
                  {previewItem.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {previewItem.category === "website" ? (
                <div className="space-y-4">
                  {/* Embedded Video If YouTube */}
                  {previewItem.videoEmbedUrl && (
                    <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center relative">
                      <iframe
                        src={previewItem.videoEmbedUrl}
                        title={previewItem.title}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}

                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <span className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                          <SocialPlatformIcon type={detectPlatform(previewItem.fileUrl).type} className="w-5 h-5" />
                        </span>
                        <div>
                          <div className="text-sm font-bold text-white font-khmer">
                            {detectPlatform(previewItem.fileUrl).name}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            តំណភ្ជាប់ស្រាវជ្រាវ (Online Research & Reference)
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> គេហទំព័រស្រាវជ្រាវ
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-base font-bold text-white leading-snug">{previewItem.title}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed font-khmer">{previewItem.description}</p>
                    </div>

                    {/* URL destination preview with copy */}
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 truncate">
                        <ExternalLink className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <span className="truncate">{previewItem.fileUrl}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(previewItem.fileUrl);
                          alert("បានចម្លងតំណភ្ជាប់ជោគជ័យ!");
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 shrink-0 font-khmer transition-colors cursor-pointer"
                      >
                        ចម្លង Link
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-slate-400 border-t border-slate-800">
                      <div>សាស្ត្រាចារ្យណែនាំ៖ <span className="text-white font-medium">{previewItem.lecturer}</span></div>
                      <div>កម្រិតសិក្សា៖ <span className="text-white font-medium">{previewItem.academicYear}</span></div>
                    </div>
                  </div>

                  <a
                    href={previewItem.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => recordView(previewItem.id)}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-sky-500/20 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
                  >
                    <SocialPlatformIcon type={detectPlatform(previewItem.fileUrl).type} className="w-4 h-4" />
                    <span>បើកចូលទៅកាន់ {detectPlatform(previewItem.fileUrl).name} ឥឡូវនេះ</span>
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </a>
                </div>
              ) : previewItem.category === "video" ? (
                <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center relative">
                  {previewItem.videoEmbedUrl ? (
                    <iframe
                      src={previewItem.videoEmbedUrl}
                      title={previewItem.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="text-center p-8 space-y-3">
                      <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                        <Play className="w-8 h-8 fill-current" />
                      </div>
                      <p className="text-white font-semibold">វីដេអូពន្យល់កម្រិតច្បាស់ HD</p>
                      <a
                        href={previewItem.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-500 transition-colors"
                      >
                        បើកមើលលើ YouTube <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              ) : previewItem.category === "slides" ? (
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-3">
                    <span className="flex items-center gap-2">
                      <Presentation className="w-4 h-4 text-amber-400" />
                      ស្លាយបទបង្ហាញ PowerPoint (Slide Deck Preview)
                    </span>
                    <span className="font-mono bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded">
                      {previewItem.fileSize}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[1, 2, 3, 4, 5, 6].map((s) => (
                      <div
                        key={s}
                        className="aspect-[16/10] bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between hover:border-amber-500/40 transition-colors"
                      >
                        <div className="text-[10px] text-slate-500 font-mono">Slide {s}</div>
                        <div className="space-y-1">
                          <div className="h-2 w-3/4 bg-slate-700 rounded-full" />
                          <div className="h-1.5 w-1/2 bg-slate-800 rounded-full" />
                        </div>
                        <div className="text-[10px] text-amber-400/80 font-khmer truncate">
                          {previewItem.subject}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-3">
                    <span className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-400" />
                      ឯកសារ PDF & សៀវភៅអេឡិចត្រូនិច
                    </span>
                    <span className="font-mono bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded">
                      {previewItem.fileSize}
                    </span>
                  </div>
                  <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 text-sm text-slate-300 leading-relaxed font-khmer">
                    <h4 className="font-bold text-white mb-2">{previewItem.title}</h4>
                    <p className="text-xs text-slate-400 mb-3">{previewItem.description}</p>
                    <div className="text-xs text-slate-400 grid grid-cols-2 gap-2 border-t border-slate-800 pt-3">
                      <div>សាស្ត្រាចារ្យ៖ {previewItem.lecturer}</div>
                      <div>កម្រិតសិក្សា៖ {previewItem.academicYear}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-xs text-slate-400 bg-slate-900/40 p-4 rounded-xl border border-slate-800/60 flex items-center justify-between">
                <span>
                  {previewItem.category === "website" ? "ចំនួនចូលមើលសរុប៖" : "ចំនួនទាញយកសរុប៖"} {previewItem.viewCount || previewItem.downloadCount || 0} ដង
                </span>
                <span className="text-cyan-400">{previewItem.major}</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 flex items-center justify-end gap-3 bg-slate-900/90">
              <button
                onClick={() => setPreviewItem(null)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800 cursor-pointer"
              >
                បិទផ្ទាំង
              </button>
              {previewItem.category === "website" ? (
                <a
                  href={previewItem.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => recordView(previewItem.id)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-sky-500/20 flex items-center gap-2 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>បើកមើលតំណភ្ជាប់ ({previewItem.fileType})</span>
                </a>
              ) : (
                <button
                  onClick={() => handleDownload(previewItem)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>ទាញយកឯកសារឥឡូវនេះ ({previewItem.fileSize})</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
