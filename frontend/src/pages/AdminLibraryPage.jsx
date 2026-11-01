import React, { useState } from "react";
import {
  BookOpen,
  Upload,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  Download,
  Eye,
  FileText,
  Video,
  Presentation,
  Code2,
  CheckCircle2,
  Sparkles,
  Layers,
  GraduationCap,
  Calendar,
  User,
  X,
  Play,
  Share2,
  FileUp,
  FolderOpen,
  RefreshCw,
  Database,
  Globe,
  Link2
} from "lucide-react";
import { useELibrary, RESOURCE_CATEGORIES, MAJORS_LIST, DEFAULT_MAJORS_PRESETS, detectPlatform, getYouTubeVideoId } from "../context/ELibraryContext.jsx";
import { useSchool } from "../context/SchoolContext.jsx";
import { SocialPlatformIcon } from "../components/SocialPlatformIcon.jsx";
import { dataSyncService } from "../services/dataSyncService.js";

export default function AdminLibraryPage() {
  const {
    resources,
    addResource,
    updateResource,
    deleteResource,
    recordDownload,
    recordView,
    refreshLibraryResources,
    isSyncing,
    isGoogleSheetConnected,
    lastSyncTime
  } = useELibrary();
  const { schoolInfo } = useSchool();

  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedMajor, setSelectedMajor] = useState("ទាំងអស់ (All Majors)");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [syncToast, setSyncToast] = useState(null);

  // Form State for Upload/Edit
  const [formData, setFormData] = useState({
    title: "",
    subject: schoolInfo?.subject || "ICT",
    major: "គណនេយ្យ",
    category: "slides",
    platform: "website",
    fileType: "PPTX",
    fileSize: "12.5 MB",
    academicYear: `${schoolInfo?.academicYear || "2025-2026"} • ${schoolInfo?.semester || "ឆមាសទី ១"}`,
    lecturer: "លោកគ្រូ ធីលាង",
    description: "",
    fileUrl: "",
    videoEmbedUrl: "",
    isFeatured: false
  });

  // Real-Time auto-sync across all open tabs/windows and devices
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

  const dynamicMajors = React.useMemo(() => {
    const list = ["ទាំងអស់ (All Majors)"];
    const found = new Set();
    
    // Add all preset majors first
    if (Array.isArray(DEFAULT_MAJORS_PRESETS)) {
      DEFAULT_MAJORS_PRESETS.forEach((p) => {
        if (p && !found.has(p)) {
          found.add(p);
          list.push(p);
        }
      });
    }

    // Add any custom majors created in resources
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

  // Filtered resources
  const filteredResources = resources.filter((res) => {
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

  // Stats calculation
  const totalItems = resources.length;
  const totalDownloads = resources.reduce((acc, curr) => acc + (curr.downloadCount || 0), 0);
  const slidesCount = resources.filter((r) => r.category === "slides").length;
  const ebookCount = resources.filter((r) => r.category === "ebook").length;
  const videoCount = resources.filter((r) => r.category === "video").length;
  const exerciseCount = resources.filter((r) => r.category === "exercise").length;
  const websiteCount = resources.filter((r) => r.category === "website").length;

  const handleOpenUpload = (itemToEdit = null) => {
    if (itemToEdit) {
      setEditingItem(itemToEdit);
      setFormData({
        title: itemToEdit.title,
        subject: itemToEdit.subject,
        major: itemToEdit.major,
        category: itemToEdit.category,
        platform: itemToEdit.platform || detectPlatform(itemToEdit.fileUrl || "").type,
        fileType: itemToEdit.fileType || "PDF",
        fileSize: itemToEdit.fileSize || "10 MB",
        academicYear: itemToEdit.academicYear,
        lecturer: itemToEdit.lecturer,
        description: itemToEdit.description || "",
        fileUrl: itemToEdit.fileUrl || "",
        videoEmbedUrl: itemToEdit.videoEmbedUrl || "",
        isFeatured: !!itemToEdit.isFeatured
      });
    } else {
      setEditingItem(null);
      setFormData({
        title: "",
        subject: schoolInfo?.subject || "ICT",
        major: "គណនេយ្យ",
        category: "website",
        platform: "youtube",
        fileType: "YOUTUBE",
        fileSize: "Online Link",
        academicYear: `${schoolInfo?.academicYear || "2025-2026"} • ${schoolInfo?.semester || "ឆមាសទី ១"}`,
        lecturer: "លោកគ្រូ ធីលាង",
        description: "",
        fileUrl: "",
        videoEmbedUrl: "",
        isFeatured: false
      });
    }
    setShowUploadModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.subject.trim()) {
      alert("សូមបំពេញចំណងជើង និងមុខវិជ្ជាឱ្យបានត្រឹមត្រូវ!");
      return;
    }

    if (editingItem) {
      updateResource(editingItem.id, formData);
    } else {
      addResource({
        ...formData,
        fileUrl: formData.fileUrl || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
      });
    }
    setShowUploadModal(false);
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`តើអ្នកពិតជាចង់លុបឯកសារ "${title}" នេះមែនទេ?`)) {
      deleteResource(id);
    }
  };

  const handleCopyLink = (res) => {
    const dummyLink = res.fileUrl || `${window.location.origin}/student/library?item=${res.id}`;
    navigator.clipboard?.writeText(dummyLink);
    setCopiedId(res.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSimulateDownload = (res) => {
    recordDownload(res.id);
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
  };

  const getCategoryBadge = (category, item = null) => {
    if (category === "website") {
      const plat = detectPlatform(item?.fileUrl || "");
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${plat.bgColor} ${plat.color} border ${plat.borderColor}`}>
          <SocialPlatformIcon type={plat.type} className="w-3.5 h-3.5" />
          <span>{plat.badgeLabel}</span>
        </span>
      );
    }
    switch (category) {
      case "slides":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20"><Presentation className="w-3.5 h-3.5" /> ស្លាយ PowerPoint</span>;
      case "ebook":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20"><BookOpen className="w-3.5 h-3.5" /> សៀវភៅ PDF</span>;
      case "video":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20"><Video className="w-3.5 h-3.5" /> វីដេអូពន្យល់</span>;
      case "exercise":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><Code2 className="w-3.5 h-3.5" /> លំហាត់ & កិច្ចការ</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20"><FileText className="w-3.5 h-3.5" /> ឯកសារ</span>;
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

      {/* Top Banner / Header (High Contrast, Crisp & Easy to Read) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white shadow-2xl border border-indigo-400/30 p-6 md:p-8">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-64 h-64 bg-indigo-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/20 text-white text-xs font-semibold tracking-wide backdrop-blur-md shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                <span>ប្រព័ន្ធគ្រប់គ្រងបណ្ណាល័យឌីជីថល (Admin E-Library Suite)</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/25 border border-emerald-400/40 text-emerald-200 text-xs font-bold tracking-wide backdrop-blur-md shadow-sm">
                <span className={`w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] ${isSyncing ? "animate-ping" : ""}`} />
                <span>Cloud Database Sync</span>
                {lastSyncTime && (
                  <span className="text-emerald-300/80 text-[11px] ml-1">
                    • {new Date(lastSyncTime).toLocaleTimeString("km-KH", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                )}
              </div>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3 drop-shadow-sm">
              <div className="w-11 h-11 rounded-2xl bg-white/20 border border-white/25 flex items-center justify-center text-cyan-200 shadow-inner">
                <BookOpen className="w-6 h-6" />
              </div>
              <span>បណ្ណាល័យឌីជីថល & ធនធានសិក្សា</span>
            </h1>

            <p className="text-blue-100 text-sm md:text-base font-normal leading-relaxed">
              គ្រប់គ្រង និងចែកចាយស្លាយមេរៀន (PowerPoint), សៀវភៅអេឡិចត្រូនិច (PDF), វីដេអូពន្យល់, គេហទំព័រ & តំណស្រាវជ្រាវ (YouTube, Facebook, TikTok) ជូននិស្សិតគ្រប់ជំនាញ និងកម្រិតសិក្សា (រក្សាទុកផ្ទាល់ក្នុង Cloud Database)។
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleManualSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/25 text-white text-sm font-bold shadow-md transition-all active:scale-95 cursor-pointer backdrop-blur-md disabled:opacity-50"
              title="ទាញយកទិន្នន័យចុងក្រោយពី Cloud Database"
            >
              <RefreshCw className={`w-4 h-4 text-emerald-300 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "កំពុង Sync..." : "Sync ពី Cloud Server"}</span>
            </button>

            <button
              onClick={() => handleOpenUpload(null)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-indigo-700 hover:bg-blue-50 font-black text-sm shadow-xl hover:shadow-2xl transition-all active:scale-95 cursor-pointer"
            >
              <Upload className="w-5 h-5 text-indigo-600" />
              <span>Upload ឯកសារ / បញ្ចូលតំណ Link ថ្មី</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Cards (High-Contrast Glassmorphism) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mt-8 pt-6 border-t border-white/15">
          <div className="bg-white/10 hover:bg-white/15 border border-white/15 rounded-2xl p-4 flex items-center gap-3.5 backdrop-blur-md transition-all shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-white/20 border border-white/20 flex items-center justify-center text-cyan-200 shrink-0 shadow-inner">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-blue-100 font-medium">ឯកសារសរុប</p>
              <p className="text-2xl font-black text-white font-mono tracking-tight">{totalItems}</p>
            </div>
          </div>

          <div className="bg-white/10 hover:bg-white/15 border border-white/15 rounded-2xl p-4 flex items-center gap-3.5 backdrop-blur-md transition-all shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-amber-400/25 border border-amber-300/30 flex items-center justify-center text-amber-200 shrink-0 shadow-inner">
              <Presentation className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-blue-100 font-medium">ស្លាយ PowerPoint</p>
              <p className="text-2xl font-black text-amber-300 font-mono tracking-tight">{slidesCount}</p>
            </div>
          </div>

          <div className="bg-white/10 hover:bg-white/15 border border-white/15 rounded-2xl p-4 flex items-center gap-3.5 backdrop-blur-md transition-all shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-indigo-400/25 border border-indigo-300/30 flex items-center justify-center text-indigo-200 shrink-0 shadow-inner">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-blue-100 font-medium">សៀវភៅ E-Books</p>
              <p className="text-2xl font-black text-indigo-200 font-mono tracking-tight">{ebookCount}</p>
            </div>
          </div>

          <div className="bg-white/10 hover:bg-white/15 border border-white/15 rounded-2xl p-4 flex items-center gap-3.5 backdrop-blur-md transition-all shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-rose-400/25 border border-rose-300/30 flex items-center justify-center text-rose-200 shrink-0 shadow-inner">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-blue-100 font-medium">វីដេអូពន្យល់</p>
              <p className="text-2xl font-black text-rose-200 font-mono tracking-tight">{videoCount}</p>
            </div>
          </div>

          <div className="bg-white/10 hover:bg-white/15 border border-white/15 rounded-2xl p-4 flex items-center gap-3.5 backdrop-blur-md transition-all shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-sky-400/25 border border-sky-300/30 flex items-center justify-center text-sky-200 shrink-0 shadow-inner">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-blue-100 font-medium">តំណស្រាវជ្រាវ (Web/FB/YT)</p>
              <p className="text-2xl font-black text-sky-200 font-mono tracking-tight">{websiteCount}</p>
            </div>
          </div>

          <div className="bg-white/10 hover:bg-white/15 border border-white/15 rounded-2xl p-4 flex items-center gap-3.5 backdrop-blur-md transition-all shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-emerald-400/25 border border-emerald-300/30 flex items-center justify-center text-emerald-200 shrink-0 shadow-inner">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-blue-100 font-medium">ទាញយកសរុប</p>
              <p className="text-2xl font-black text-emerald-300 font-mono tracking-tight">{totalDownloads}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-5 shadow-sm space-y-4">
        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {RESOURCE_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                <i className={`${cat.icon} text-xs`} />
                <span>{cat.labelKh}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Major Dropdown */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
          <div className="md:col-span-7 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ស្វែងរកតាមចំណងជើង, មុខវិជ្ជា, សាស្ត្រាចារ្យ, ឬពាក្យគន្លឹះ..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div className="md:col-span-5 relative">
            <select
              value={selectedMajor}
              onChange={(e) => setSelectedMajor(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
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

      {/* Resources Table / Grid */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-white">បញ្ជីឯកសារបណ្ណាល័យ</span>
            <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-mono">
              {filteredResources.length}
            </span>
          </div>
          <span className="text-xs text-slate-400">
            ធ្វើបច្ចុប្បន្នភាពចុងក្រោយ៖ {new Date().toLocaleDateString("km-KH")}
          </span>
        </div>

        {filteredResources.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mx-auto flex items-center justify-center text-slate-400 mb-3">
              <BookOpen className="w-8 h-8" />
            </div>
            <p className="text-base font-semibold text-slate-700 dark:text-slate-300">មិនមានឯកសារត្រូវតាមលក្ខខណ្ឌស្វែងរកទេ</p>
            <p className="text-xs text-slate-400 mt-1">សូមសាកល្បងផ្លាស់ប្តូរពាក្យស្វែងរក ឬប្រភេទមុខវិជ្ជាឡើងវិញ</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredResources.map((res) => (
              <div
                key={res.id}
                className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Resource Info */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {getCategoryBadge(res.category, res)}
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      {res.fileType} • {res.fileSize}
                    </span>
                    <span className="text-xs text-indigo-500 dark:text-indigo-400 font-medium">
                      {res.subject}
                    </span>
                    {res.isFeatured && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                        <Sparkles className="w-3 h-3" /> មេរៀនសំខាន់
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {res.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {res.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-indigo-400" />
                      {res.lecturer}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                      {res.major}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {res.academicYear}
                    </span>
                    <span className="flex items-center gap-1 text-emerald-400 font-mono">
                      {res.category === "website" ? (
                        <>
                          <Eye className="w-3.5 h-3.5" /> {res.viewCount || res.downloadCount || 0} ចូលមើល
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" /> {res.downloadCount || 0} ដង
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setPreviewItem(res)}
                    title="មើលគំរូឯកសារ"
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-400 hover:border-indigo-500/50 transition-colors cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleCopyLink(res)}
                    title="ចម្លងតំណភ្ជាប់ចែករំលែក"
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-cyan-400 hover:border-cyan-500/50 transition-colors cursor-pointer relative"
                  >
                    {copiedId === res.id ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Share2 className="w-4 h-4" />
                    )}
                  </button>

                  {res.category === "website" ? (
                    <a
                      href={res.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => recordView(res.id)}
                      title="បើកមើលតំណភ្ជាប់ស្រាវជ្រាវ (Open External Link)"
                      className="px-3.5 py-2.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 hover:text-sky-300 border border-sky-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                    >
                      <SocialPlatformIcon type={detectPlatform(res.fileUrl).type} className="w-3.5 h-3.5" />
                      <span>បើកតំណ</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <button
                      onClick={() => handleSimulateDownload(res)}
                      title="ទាញយកឯកសារ"
                      className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => handleOpenUpload(res)}
                    title="កែសម្រួលព័ត៌មាន"
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-amber-400 hover:border-amber-500/50 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(res.id, res.title)}
                    title="លុបឯកសារ"
                    className="p-2.5 rounded-xl border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload & Edit Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 md:p-8 shadow-2xl relative my-8">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                <FileUp className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {editingItem ? "កែសម្រួលឯកសារមេរៀន" : "Upload ឯកសារមេរៀនថ្មី"}
                </h2>
                <p className="text-xs text-slate-400">
                  ដាក់បញ្ចូលស្លាយ PowerPoint, សៀវភៅ PDF, វីដេអូ ឬលំហាត់សម្រាប់និស្សិត
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  ចំណងជើងឯកសារមេរៀន <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="ឧ. ស្លាយមេរៀន៖ React Architecture 2026..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    មុខវិជ្ជា <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="ឧ. ការអភិវឌ្ឍន៍គេហទំព័រ (Web Dev)"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    ប្រភេទធនធាន (Resource Type)
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      const cat = e.target.value;
                      let fType = "PDF";
                      let fSize = "10 MB";
                      if (cat === "slides") { fType = "PPTX"; fSize = "15.0 MB"; }
                      if (cat === "video") { fType = "VIDEO"; fSize = "45 នាទី"; }
                      if (cat === "exercise") { fType = "ZIP"; fSize = "8.5 MB"; }
                      if (cat === "website") { fType = "WEBSITE"; fSize = "Online Link"; }
                      setFormData({ ...formData, category: cat, fileType: fType, fileSize: fSize });
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="slides">ស្លាយមេរៀន (PowerPoint / PPTX)</option>
                    <option value="ebook">សៀវភៅអេឡិចត្រូនិច (PDF / E-Book)</option>
                    <option value="video">វីដេអូពន្យល់ & ការបង្រៀន (Video)</option>
                    <option value="exercise">លំហាត់គំរូ & Assignment (Lab / ZIP)</option>
                    <option value="website">🌐 គេហទំព័រ & តំណស្រាវជ្រាវ (Web, FB, YouTube, TikTok)</option>
                  </select>
                </div>
              </div>

              {/* Quick Platform Presets for Website Category */}
              {formData.category === "website" && (
                <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      ជ្រើសរើសប្រភេទបណ្ដាញ / វេទិកា (Platform Preset)៖
                    </span>
                    <span className="text-[11px] text-slate-400">ចុចដើម្បីជ្រើសរើសលឿន</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          platform: "youtube",
                          fileType: "YOUTUBE",
                          fileSize: "Online Video"
                        }))
                      }
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        formData.platform === "youtube"
                          ? "bg-red-500 text-white shadow-md shadow-red-500/30 scale-105"
                          : "bg-slate-800 text-red-400 hover:bg-slate-700 border border-red-500/30"
                      }`}
                    >
                      <SocialPlatformIcon type="youtube" className="w-3.5 h-3.5" />
                      <span>YouTube</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          platform: "facebook",
                          fileType: "FACEBOOK",
                          fileSize: "Social Page"
                        }))
                      }
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        formData.platform === "facebook"
                          ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-105"
                          : "bg-slate-800 text-blue-400 hover:bg-slate-700 border border-blue-600/30"
                      }`}
                    >
                      <SocialPlatformIcon type="facebook" className="w-3.5 h-3.5" />
                      <span>Facebook</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          platform: "tiktok",
                          fileType: "TIKTOK",
                          fileSize: "Short Video"
                        }))
                      }
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        formData.platform === "tiktok"
                          ? "bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-500/30 scale-105"
                          : "bg-slate-800 text-pink-400 hover:bg-slate-700 border border-pink-500/30"
                      }`}
                    >
                      <SocialPlatformIcon type="tiktok" className="w-3.5 h-3.5" />
                      <span>TikTok</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          platform: "gdrive",
                          fileType: "GDRIVE",
                          fileSize: "Cloud Drive"
                        }))
                      }
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        formData.platform === "gdrive"
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-105"
                          : "bg-slate-800 text-emerald-400 hover:bg-slate-700 border border-emerald-500/30"
                      }`}
                    >
                      <SocialPlatformIcon type="gdrive" className="w-3.5 h-3.5" />
                      <span>Google Drive</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          platform: "website",
                          fileType: "WEBSITE",
                          fileSize: "Web Portal"
                        }))
                      }
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        formData.platform === "website"
                          ? "bg-sky-600 text-white shadow-md shadow-sky-600/30 scale-105"
                          : "bg-slate-800 text-sky-400 hover:bg-slate-700 border border-sky-500/30"
                      }`}
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>គេហទំព័រទូទៅ</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      ជំនាញ / ដេប៉ាតឺម៉ង់ (Major / Department)
                    </label>
                    <span className="text-[11px] text-cyan-400 font-medium">អាចវាយបញ្ចូលសេរី ឬជ្រើសរើស</span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      list="admin-majors-datalist"
                      value={formData.major}
                      onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                      placeholder="បញ្ចូលឈ្មោះជំនាញ ឬជ្រើសរើស (ឧទាហរណ៍៖ ICT, គណនេយ្យ...)"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
                    />
                    <datalist id="admin-majors-datalist">
                      {dynamicMajors.filter((m) => m !== "ទាំងអស់ (All Majors)").map((m) => (
                        <option key={m} value={m} />
                      ))}
                    </datalist>
                  </div>

                  {/* Quick Select Preset Buttons for Instant 1-Click Major Selection */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[10px] text-slate-400 mr-0.5">ជម្រើសរហ័ស៖</span>
                    {["គណនេយ្យ", "ICT / វិទ្យាសាស្ត្រកុំព្យូទ័រ", "គ្រប់គ្រងពាណិជ្ជកម្ម", "ទីផ្សារ", "ធនាគារ", "ភាសាអង់គ្លេស", "ទូទៅ / គ្រប់ជំនាញ"].map((preset) => {
                      const isSelected = formData.major === preset || (formData.major && preset.startsWith(formData.major));
                      return (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setFormData({ ...formData, major: preset })}
                          className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-indigo-600 text-white border-indigo-400 font-bold shadow-sm scale-105"
                              : "bg-slate-800/90 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white"
                          }`}
                        >
                          {preset.split(" ")[0]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    សាស្ត្រាចារ្យទទួលបន្ទុក / អ្នកណែនាំ
                  </label>
                  <input
                    type="text"
                    value={formData.lecturer}
                    onChange={(e) => setFormData({ ...formData, lecturer: e.target.value })}
                    placeholder="ឈ្មោះសាស្ត្រាចារ្យ..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    ឆ្នាំសិក្សា & ឆមាស
                  </label>
                  <input
                    type="text"
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    placeholder="ឆ្នាំទី ២ • ឆមាសទី ១"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    ទម្រង់ឯកសារ / Platform
                  </label>
                  <input
                    type="text"
                    value={formData.fileType}
                    onChange={(e) => setFormData({ ...formData, fileType: e.target.value })}
                    placeholder="PPTX / PDF / YOUTUBE / FB / WEB"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    ទំហំ / ប្រភេទចូលមើល
                  </label>
                  <input
                    type="text"
                    value={formData.fileSize}
                    onChange={(e) => setFormData({ ...formData, fileSize: e.target.value })}
                    placeholder="15.4 MB ឬ Online Link"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>
                    {formData.category === "website"
                      ? "តំណភ្ជាប់គេហទំព័រ ឬបណ្ដាញសង្គម (Website, YouTube, Facebook, TikTok URL)"
                      : "តំណភ្ជាប់ឯកសារ (File URL / Google Drive / Cloud Link)"}
                  </span>
                  <span className="text-[11px] text-cyan-400 font-normal">គាំទ្រ HTTPS គ្រប់ប្រភេទ</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.fileUrl}
                    onChange={(e) => {
                      const val = e.target.value;
                      const plat = detectPlatform(val);
                      const ytId = getYouTubeVideoId(val);
                      let embed = formData.videoEmbedUrl;
                      if (ytId) {
                        embed = `https://www.youtube.com/embed/${ytId}`;
                      }
                      let fType = formData.fileType;
                      let fSize = formData.fileSize;
                      if (formData.category === "website") {
                        if (plat.type === "youtube") { fType = "YOUTUBE"; fSize = "Online Video"; }
                        else if (plat.type === "facebook") { fType = "FACEBOOK"; fSize = "Social Page"; }
                        else if (plat.type === "tiktok") { fType = "TIKTOK"; fSize = "Short Video"; }
                        else if (plat.type === "gdrive") { fType = "GDRIVE"; fSize = "Cloud Drive"; }
                        else { fType = "WEBSITE"; fSize = "Web Portal"; }
                      }
                      setFormData({
                        ...formData,
                        fileUrl: val,
                        videoEmbedUrl: embed,
                        platform: plat.type,
                        fileType: fType,
                        fileSize: fSize
                      });
                    }}
                    placeholder={
                      formData.category === "website"
                        ? "https://www.youtube.com/..., https://facebook.com/..., https://www.tiktok.com/@..."
                        : "https://drive.google.com/... ឬតំណភ្ជាប់ផ្ទាល់"
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono pr-10"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <SocialPlatformIcon type={detectPlatform(formData.fileUrl).type} className="w-4 h-4" />
                  </div>
                </div>

                {/* Real-time Platform Detection Indicator */}
                {formData.fileUrl && (
                  <div className="flex items-center gap-2 pt-2 text-xs">
                    <span className="text-slate-400">វេទិកាដែលបានសម្គាល់៖</span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold ${detectPlatform(formData.fileUrl).bgColor} ${detectPlatform(formData.fileUrl).color} border ${detectPlatform(formData.fileUrl).borderColor}`}>
                      <SocialPlatformIcon type={detectPlatform(formData.fileUrl).type} className="w-3.5 h-3.5" />
                      <span>{detectPlatform(formData.fileUrl).name}</span>
                      <span className="text-[10px] opacity-80">({detectPlatform(formData.fileUrl).badgeLabel})</span>
                    </span>
                  </div>
                )}
              </div>

              {(formData.category === "video" || (formData.category === "website" && formData.platform === "youtube")) && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    តំណភ្ជាប់វីដេអូ YouTube Embed URL (បង្កើតស្វ័យប្រវត្ត)
                  </label>
                  <input
                    type="text"
                    value={formData.videoEmbedUrl}
                    onChange={(e) => setFormData({ ...formData, videoEmbedUrl: e.target.value })}
                    placeholder="https://www.youtube.com/embed/..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    នៅពេលសិស្សបើកមើលវីដេអូ ប្រព័ន្ធនឹងចាក់បញ្ចាំងវីដេអូនេះដោយផ្ទាល់នៅក្នុង E-Library។
                  </p>
                </div>
              )}

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>{editingItem ? "រក្សាទុកការកែប្រែ" : "Upload រក្សាទុក"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resource Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div className="flex items-center gap-2.5">
                {getCategoryBadge(previewItem.category, previewItem)}
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

            {/* Modal Body / Viewer */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {previewItem.category === "website" ? (
                <div className="space-y-4">
                  {previewItem.videoEmbedUrl ? (
                    <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center relative shadow-2xl">
                      <iframe
                        src={previewItem.videoEmbedUrl}
                        title={previewItem.title}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : null}

                  <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-[#0c1427] border border-slate-800 space-y-4 shadow-inner">
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
                            តំណភ្ជាប់ស្រាវជ្រាវផ្លូវការ (Official Research Link)
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> គេហទំព័រត្រឹមត្រូវ
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-base font-bold text-white leading-snug">{previewItem.title}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed font-khmer">{previewItem.description}</p>
                    </div>

                    {/* URL destination preview with copy */}
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between gap-3">
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
                <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center relative group">
                  {previewItem.videoEmbedUrl ? (
                    <iframe
                      src={previewItem.videoEmbedUrl}
                      title={previewItem.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="text-center p-6">
                      <Play className="w-12 h-12 text-rose-500 mx-auto mb-2 opacity-80" />
                      <p className="text-xs text-slate-400 font-khmer">វីដេអូបង្រៀន (Video Lecture)</p>
                      <a
                        href={previewItem.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> បើកមើលវីដេអូ
                      </a>
                    </div>
                  )}
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
                  {previewItem.category === "website" ? "ចំនួនចូលមើលសរុប៖" : "ទាញយករួច៖"} {previewItem.viewCount || previewItem.downloadCount || 0} ដង
                </span>
                <span className="text-indigo-400 font-medium">{previewItem.major}</span>
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
                  onClick={() => {
                    recordView(previewItem.id);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-sky-500/20 flex items-center gap-2 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>បើកមើលតំណភ្ជាប់ ({previewItem.fileType})</span>
                </a>
              ) : (
                <button
                  onClick={() => {
                    handleSimulateDownload(previewItem);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>ទាញយកឯកសារ ({previewItem.fileSize})</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
