import React, { createContext, useContext, useState, useEffect } from "react";
import { apiRequest, invalidateRelatedCaches } from "../api/client.js";
import { getHealthStatus } from "../api/settingsApi.js";
import { dataSyncService } from "../services/dataSyncService.js";

const ELibraryContext = createContext(null);

export const DEFAULT_MAJORS_PRESETS = [
  "គណនេយ្យ",
  "គណនេយ្យ (Accounting)",
  "ICT / វិទ្យាសាស្ត្រកុំព្យូទ័រ",
  "គ្រប់គ្រងពាណិជ្ជកម្ម (Management)",
  "ទីផ្សារ (Marketing)",
  "ធនាគារ និងហិរញ្ញវត្ថុ (Banking)",
  "នីតិសាស្ត្រ (Law)",
  "ទេសចរណ៍ និងបដិសណ្ឋារកិច្ច",
  "ភាសាអង់គ្លេស (English)",
  "ឆ្នាំសិក្សាមូលដ្ឋាន (Foundation Year)",
  "ទូទៅ / គ្រប់ជំនាញ (General / All)"
];

export const MAJORS_LIST = [
  "ទាំងអស់ (All Majors)",
  ...DEFAULT_MAJORS_PRESETS
];

export const RESOURCE_CATEGORIES = [
  { id: "all", labelKh: "ទាំងអស់", labelEn: "All Types", icon: "fas fa-layer-group" },
  { id: "slides", labelKh: "ស្លាយមេរៀន (PowerPoint)", labelEn: "Slides / PPTX", icon: "fas fa-file-powerpoint", color: "from-orange-500 to-amber-500", text: "text-amber-500" },
  { id: "ebook", labelKh: "សៀវភៅអេឡិចត្រូនិច (PDF)", labelEn: "E-Books & Textbooks", icon: "fas fa-book-bookmark", color: "from-blue-500 to-indigo-500", text: "text-blue-500" },
  { id: "video", labelKh: "វីដេអូពន្យល់ & ការបង្រៀន", labelEn: "Video Lectures", icon: "fas fa-circle-play", color: "from-rose-500 to-red-500", text: "text-rose-500" },
  { id: "exercise", labelKh: "លំហាត់គំរូ & កិច្ចការស្រាវជ្រាវ", labelEn: "Exercises & Labs", icon: "fas fa-file-code", color: "from-emerald-500 to-teal-500", text: "text-emerald-500" },
  { id: "website", labelKh: "គេហទំព័រ & តំណស្រាវជ្រាវ (Web, FB, YouTube, TikTok)", labelEn: "Websites & Social Media Links", icon: "fas fa-globe", color: "from-sky-500 via-blue-500 to-indigo-600", text: "text-sky-400" }
];

export function getYouTubeVideoId(url = "") {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = String(url).match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export function detectPlatform(url = "", category = "") {
  const u = String(url || "").toLowerCase();
  if (u.includes("youtube.com") || u.includes("youtu.be")) {
    return {
      type: "youtube",
      name: "YouTube",
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/25",
      gradient: "from-red-500 to-rose-600",
      badgeLabel: "YouTube Video / Channel",
      actionText: "បើកមើលលើ YouTube"
    };
  }
  if (u.includes("facebook.com") || u.includes("fb.watch") || u.includes("fb.me")) {
    return {
      type: "facebook",
      name: "Facebook",
      color: "text-blue-500",
      bgColor: "bg-blue-600/10",
      borderColor: "border-blue-600/25",
      gradient: "from-blue-600 to-indigo-600",
      badgeLabel: "Facebook Page / Group",
      actionText: "បើកមើលលើ Facebook"
    };
  }
  if (u.includes("tiktok.com")) {
    return {
      type: "tiktok",
      name: "TikTok",
      color: "text-pink-400",
      bgColor: "bg-pink-500/10",
      borderColor: "border-pink-500/25",
      gradient: "from-slate-900 via-pink-600 to-rose-500",
      badgeLabel: "TikTok Clip / Tips",
      actionText: "បើកមើលលើ TikTok"
    };
  }
  if (u.includes("drive.google.com") || u.includes("docs.google.com")) {
    return {
      type: "gdrive",
      name: "Google Drive",
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/25",
      gradient: "from-emerald-500 to-teal-600",
      badgeLabel: "Google Drive & Cloud",
      actionText: "បើកមើលលើ Drive"
    };
  }
  if (u.includes("wikipedia.org")) {
    return {
      type: "wikipedia",
      name: "Wikipedia",
      color: "text-slate-300",
      bgColor: "bg-slate-700/20",
      borderColor: "border-slate-600/30",
      gradient: "from-slate-700 to-slate-900",
      badgeLabel: "Wikipedia Research",
      actionText: "ស្រាវជ្រាវលើ Wikipedia"
    };
  }
  return {
    type: "website",
    name: "គេហទំព័រ (Website)",
    color: "text-sky-400",
    bgColor: "bg-sky-500/10",
    borderColor: "border-sky-500/25",
    gradient: "from-sky-500 to-blue-600",
    badgeLabel: "គេហទំព័រស្រាវជ្រាវ",
    actionText: "ចូលទៅកាន់គេហទំព័រ"
  };
}

const DEFAULT_RESOURCES = [
  {
    id: "lib-001",
    title: "ស្លាយមេរៀន៖ កុំព្យូទ័រ & ICT សម្រាប់គណនេយ្យ (ICT for Accounting 2026)",
    subject: "ICT",
    major: "គណនេយ្យ",
    category: "slides",
    fileType: "PPTX",
    fileSize: "14.8 MB",
    academicYear: "2025-2026 • ឆមាសទី ១",
    lecturer: "លោកគ្រូ ធីលាង (Lecturer Thea Leang)",
    description: "ស្លាយមេរៀនពេញលេញអំពីមូលដ្ឋានគ្រឹះ ICT, ប្រព័ន្ធគ្រប់គ្រងទិន្នន័យ, សុវត្ថិភាពឌីជីថល និងការអនុវត្តលើការងារគណនេយ្យជាក់ស្តែង។",
    downloadCount: 312,
    viewCount: 750,
    fileUrl: "/assets/docs/ict_accounting_slides.pdf",
    previewType: "slides",
    createdAt: "2026-10-10",
    isFeatured: true
  },
  {
    id: "lib-002",
    title: "ស្លាយមេរៀន៖ Microsoft Excel & Financial Formulas កម្រិតខ្ពស់សម្រាប់គណនេយ្យ",
    subject: "ICT",
    major: "គណនេយ្យ",
    category: "slides",
    fileType: "PPTX",
    fileSize: "16.4 MB",
    academicYear: "2025-2026 • ឆមាសទី ១",
    lecturer: "លោកគ្រូ ធីលាង",
    description: "បច្ចេកទេសប្រើប្រាស់រូបមន្ត IF, VLOOKUP, XLOOKUP, INDEX-MATCH, Pivot Table, Data Validation និងការបង្កើត Dashboard វិភាគទិន្នន័យ។",
    downloadCount: 428,
    viewCount: 920,
    fileUrl: "/assets/docs/excel_financial_formulas.pdf",
    previewType: "slides",
    createdAt: "2026-10-12",
    isFeatured: true
  },
  {
    id: "lib-003",
    title: "សៀវភៅអេឡិចត្រូនិច៖ មូលដ្ឋានគ្រឹះកុំព្យូទ័រ & ICT Handbook 2026 (ជាភាសាខ្មែរ)",
    subject: "ICT",
    major: "គណនេយ្យ",
    category: "ebook",
    fileType: "PDF",
    fileSize: "22.5 MB",
    academicYear: "2025-2026 • ឆមាសទី ១",
    lecturer: "ដេប៉ាតឺម៉ង់ឆ្នាំសិក្សាមូលដ្ខាន",
    description: "សៀវភៅណែនាំពេញលេញស្តីពីផ្នែករឹង (Hardware), ផ្នែកទន់ (Software), បណ្តាញ Network, ប្រព័ន្ធអ៊ីនធឺណិត និងបច្ចេកវិទ្យា Cloud សម្រាប់និស្សិតសាកលវិទ្យាល័យ។",
    downloadCount: 512,
    viewCount: 1240,
    fileUrl: "/assets/docs/ict_student_handbook.pdf",
    previewType: "pdf",
    createdAt: "2026-10-14",
    isFeatured: true
  },
  {
    id: "lib-004",
    title: "វីដេអូពន្យល់៖ របៀបអនុវត្តលំហាត់ Excel, Pivot Tables & VLOOKUP មួយជំហានម្តងៗ",
    subject: "ICT",
    major: "គណនេយ្យ",
    category: "video",
    fileType: "VIDEO",
    fileSize: "42 នាទី (1080p HD)",
    academicYear: "2025-2026 • ឆមាសទី ១",
    lecturer: "លោកគ្រូ ធីលាង",
    description: "វីដេអូបង្រៀនជាក់ស្តែងពីការដោះស្រាយលំហាត់អនុវត្ត Excel ប្រចាំសប្តាហ៍ ត្រៀមសម្រាប់ការប្រឡងពាក់កណ្តាលឆមាស និងបញ្ចប់ឆមាស។",
    downloadCount: 390,
    viewCount: 880,
    fileUrl: "https://www.youtube.com/watch?v=Vl0H-qTclOg",
    videoEmbedUrl: "https://www.youtube.com/embed/Vl0H-qTclOg",
    previewType: "video",
    createdAt: "2026-10-16",
    isFeatured: false
  },
  {
    id: "lib-005",
    title: "លំហាត់គំរូ & Assignment៖ កម្រងលំហាត់អនុវត្តទី១ ដល់ ទី៧ & ការងារក្រុម",
    subject: "ICT",
    major: "គណនេយ្យ",
    category: "exercise",
    fileType: "ZIP",
    fileSize: "7.8 MB",
    academicYear: "2025-2026 • ឆមាសទី ១",
    lecturer: "ដេប៉ាតឺម៉ង់ឆ្នាំសិក្សាមូលដ្ខាន",
    description: "កម្រងឯកសារលំហាត់អនុវត្ត Quiz 1 ដល់ Quiz 7, លំហាត់អនុវត្ត Excel, និងឯកសារណែនាំការងារក្រុមសម្រាប់និស្សិតគ្រប់បន្ទប់ (N & TU)។",
    downloadCount: 460,
    viewCount: 910,
    fileUrl: "/assets/docs/accounting_exercises_pack.pdf",
    previewType: "exercise",
    createdAt: "2026-10-18",
    isFeatured: true
  },
  {
    id: "lib-006",
    title: "វីដេអូពន្យល់៖ ការរៀបចំឯកសារអាជីវកម្ម និង Email វិជ្ជាជីវៈ (Professional Email)",
    subject: "ICT",
    major: "គណនេយ្យ",
    category: "video",
    fileType: "VIDEO",
    fileSize: "35 នាទី (1080p HD)",
    academicYear: "2025-2026 • ឆមាសទី ១",
    lecturer: "លោកគ្រូ ធីលាង",
    description: "ការណែនាំស្តង់ដារសរសេរ Email ផ្លូវការ ការភ្ជាប់ឯកសារ Attachment និងការគ្រប់គ្រង Google Drive & Cloud សម្រាប់ការងារ។",
    downloadCount: 280,
    viewCount: 620,
    fileUrl: "https://www.youtube.com/watch?v=0nbkaYsR94c",
    videoEmbedUrl: "https://www.youtube.com/embed/0nbkaYsR94c",
    previewType: "video",
    createdAt: "2026-10-19",
    isFeatured: false
  },
  {
    id: "lib-007",
    title: "វីដេអូបង្រៀន & គន្លឹះស្រាវជ្រាវកុំព្យូទ័រ ICT កម្រិតខ្ពស់លើ YouTube (YouTube Channel)",
    subject: "ICT Research",
    major: "គណនេយ្យ",
    category: "website",
    platform: "youtube",
    fileType: "YOUTUBE",
    fileSize: "Online Video",
    academicYear: "2025-2026 • ឆមាសទី ១",
    lecturer: "លោកគ្រូ ធីលាង",
    description: "កម្រងវីដេអូបង្រៀនជាក់ស្តែង និងគន្លឹះដោះស្រាយបញ្ហាបច្ចេកវិទ្យាព័ត៌មានលើ YouTube សម្រាប់ជំនួយការស្រាវជ្រាវរបស់និស្សិត។",
    downloadCount: 520,
    viewCount: 1450,
    fileUrl: "https://www.youtube.com/watch?v=Vl0H-qTclOg",
    videoEmbedUrl: "https://www.youtube.com/embed/Vl0H-qTclOg",
    previewType: "website",
    createdAt: "2026-10-20",
    isFeatured: true
  },
  {
    id: "lib-008",
    title: "ទំព័រ Facebook ផ្លូវការ៖ ចែករំលែកឯកសារ និងចំណេះដឹង ICT & Accounting",
    subject: "ICT Community",
    major: "គណនេយ្យ",
    category: "website",
    platform: "facebook",
    fileType: "FACEBOOK",
    fileSize: "Social Page",
    academicYear: "2025-2026 • ឆមាសទី ១",
    lecturer: "ដេប៉ាតឺម៉ង់ ICT",
    description: "ចូលរួមក្នុងសហគមន៍ Facebook ដើម្បីទទួលព័ត៌មានថ្មីៗ សួរសំណួរមេរៀន ពិភាក្សា និងទាញយកឯកសារស្រាវជ្រាវបន្ថែម។",
    downloadCount: 380,
    viewCount: 980,
    fileUrl: "https://www.facebook.com",
    previewType: "website",
    createdAt: "2026-10-21",
    isFeatured: true
  },
  {
    id: "lib-009",
    title: "គន្លឹះរហ័ស 1 នាទីលើ TikTok៖ Excel Tricks, Shortcuts & Tech Hacks",
    subject: "ICT Tips",
    major: "គណនេយ្យ",
    category: "website",
    platform: "tiktok",
    fileType: "TIKTOK",
    fileSize: "Micro Learning",
    academicYear: "2025-2026 • ឆមាសទី ១",
    lecturer: "លោកគ្រូ ធីលាង",
    description: "វីដេអូខ្លីៗកន្ត្រាក់អារម្មណ៍រៀនលឿនចងចាំបានយូរ លើបណ្តាញ TikTok ណែនាំគន្លឹះកាត់បន្ថយពេលវេលាធ្វើការជាមួយ Excel និងកុំព្យូទ័រ។",
    downloadCount: 640,
    viewCount: 2100,
    fileUrl: "https://www.tiktok.com",
    previewType: "website",
    createdAt: "2026-10-22",
    isFeatured: false
  },
  {
    id: "lib-010",
    title: "គេហទំព័រស្រាវជ្រាវ W3Schools & Computer Science Learning Portal",
    subject: "ICT Self-Study",
    major: "គណនេយ្យ",
    category: "website",
    platform: "website",
    fileType: "WEBSITE",
    fileSize: "Web Portal",
    academicYear: "2025-2026 • ឆមាសទី ១",
    lecturer: "ដេប៉ាតឺម៉ង់ ICT",
    description: "គេហទំព័រសិក្សាស្រាវជ្រាវអន្តរជាតិ សម្បូរបែបដោយមេរៀនអនុវត្តជាក់ស្តែង កូដគំរូ និងលំហាត់តេស្តសមត្ថភាពដោយឥតគិតថ្លៃ។",
    downloadCount: 490,
    viewCount: 1320,
    fileUrl: "https://www.w3schools.com",
    previewType: "website",
    createdAt: "2026-10-23",
    isFeatured: false
  }
];

export function ELibraryProvider({ children }) {
  const [resources, setResources] = useState(() => {
    try {
      const saved = localStorage.getItem("mypintou_elibrary_resources");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // If the stored data doesn't have any website/link items yet, merge the default website resources so user sees them right away
          const hasWebsiteCategory = parsed.some((r) => r.category === "website");
          if (!hasWebsiteCategory) {
            const websiteDefaults = DEFAULT_RESOURCES.filter((r) => r.category === "website");
            const merged = [...parsed, ...websiteDefaults];
            localStorage.setItem("mypintou_elibrary_resources", JSON.stringify(merged));
            return merged;
          }
          return parsed;
        }
      }
      return DEFAULT_RESOURCES;
    } catch {
      return DEFAULT_RESOURCES;
    }
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [isGoogleSheetConnected, setIsGoogleSheetConnected] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncError, setSyncError] = useState(null);

  // Sync resources list to Google Sheets (persists to ⚙️_Config sheet)
  const syncToGoogleSheet = async (list) => {
    setIsSyncing(true);
    setSyncError(null);
    try {
      const token = localStorage.getItem("mypintou_admin_token") || "MyPintou#Sec2026$X9z";
      const jsonPayload = JSON.stringify(list);
      await apiRequest(
        "admin_update_config",
        {
          token,
          updates: JSON.stringify({
            SCHOOL_ADDRESS: jsonPayload,
            LIBRARY_RESOURCES_DATA: jsonPayload
          })
        },
        { method: "POST" }
      );
      setLastSyncTime(new Date());
      setIsGoogleSheetConnected(true);

      // Auto Real-Time sync broadcast across all connected clients & devices
      dataSyncService.publishEvent({
        entityType: "elibrary",
        action: "elibrary.updated",
        recordId: "resources"
      });
    } catch (e) {
      console.warn("E-Library sync to Google Sheet notice:", e);
      setSyncError(e?.message || "បរាជ័យក្នុងការ Sync ជាមួយ Cloud Server");
    } finally {
      setIsSyncing(false);
    }
  };

  // Fetch latest resources from live Google Sheet
  const refreshLibraryResources = async (force = true) => {
    setIsSyncing(true);
    try {
      if (force) {
        invalidateRelatedCaches("config");
        invalidateRelatedCaches("elibrary");
      }
      const res = await getHealthStatus(force);
      const cfg = res?.data?.config || {};
      const raw = cfg.rawConfig || {};
      const candidateStr = cfg.libraryResourcesData || raw.LIBRARY_RESOURCES_DATA || cfg.schoolAddress || raw.SCHOOL_ADDRESS;

      if (candidateStr && typeof candidateStr === "string" && candidateStr.trim().startsWith("[")) {
        try {
          const parsed = JSON.parse(candidateStr);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setResources(parsed);
            localStorage.setItem("mypintou_elibrary_resources", JSON.stringify(parsed));
            setLastSyncTime(new Date());
            setIsGoogleSheetConnected(true);
            return parsed;
          }
        } catch (err) {
          console.warn("Failed to parse library resources from Google Sheets candidate:", err);
        }
      }
      setIsGoogleSheetConnected(true);
    } catch (e) {
      console.warn("Error checking live Google Sheet resources:", e);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    refreshLibraryResources(false);

    // Subscribe to real-time sync events for instant updates across Admin, Teacher, and Student
    const unsubElib = dataSyncService.subscribeToEntity("elibrary", (event) => {
      console.log("[ELibraryContext] Real-time event received:", event);
      refreshLibraryResources(true);
    });
    const unsubConfig = dataSyncService.subscribeToEntity("config", () => {
      refreshLibraryResources(true);
    });

    return () => {
      unsubElib();
      unsubConfig();
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("mypintou_elibrary_resources", JSON.stringify(resources));
    } catch (e) {
      console.warn("Failed to persist elibrary resources to localStorage", e);
    }
  }, [resources]);

  const addResource = (newRes) => {
    const item = {
      ...newRes,
      id: newRes.id || `lib-${Date.now()}`,
      downloadCount: Number(newRes.downloadCount) || 0,
      viewCount: Number(newRes.viewCount) || 1,
      createdAt: newRes.createdAt || new Date().toISOString().split("T")[0]
    };
    const updated = [item, ...resources];
    setResources(updated);
    syncToGoogleSheet(updated);
    return item;
  };

  const updateResource = (id, fields) => {
    const updated = resources.map((r) =>
      r.id === id ? { ...r, ...fields, updatedAt: new Date().toISOString().split("T")[0] } : r
    );
    setResources(updated);
    syncToGoogleSheet(updated);
  };

  const deleteResource = (id) => {
    const updated = resources.filter((r) => r.id !== id);
    setResources(updated);
    syncToGoogleSheet(updated);
  };

  const recordDownload = (id) => {
    const updated = resources.map((r) =>
      r.id === id ? { ...r, downloadCount: (Number(r.downloadCount) || 0) + 1 } : r
    );
    setResources(updated);
    syncToGoogleSheet(updated);
  };

  const recordView = (id) => {
    const updated = resources.map((r) =>
      r.id === id ? { ...r, viewCount: (Number(r.viewCount) || 0) + 1 } : r
    );
    setResources(updated);
  };

  return (
    <ELibraryContext.Provider
      value={{
        resources,
        addResource,
        updateResource,
        deleteResource,
        recordDownload,
        recordView,
        refreshLibraryResources,
        isSyncing,
        isGoogleSheetConnected,
        lastSyncTime,
        syncError,
        categories: RESOURCE_CATEGORIES,
        majors: MAJORS_LIST
      }}
    >
      {children}
    </ELibraryContext.Provider>
  );
}

export function useELibrary() {
  const ctx = useContext(ELibraryContext);
  if (!ctx) {
    throw new Error("useELibrary must be used within an ELibraryProvider");
  }
  return ctx;
}

