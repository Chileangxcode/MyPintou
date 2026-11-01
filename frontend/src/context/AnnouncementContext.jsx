import React, { createContext, useContext, useState, useEffect } from "react";
import { apiRequest } from "../api/client.js";
import { getHealthStatus } from "../api/settingsApi.js";
import { dataSyncService } from "../services/dataSyncService.js";

const AnnouncementContext = createContext(null);

const DEFAULT_ANNOUNCEMENTS = [
  {
    id: "ann-001",
    title: "កាលវិភាគប្រឡងបញ្ចប់ឆមាស (Final Exam Schedule)",
    content: "ការប្រឡងបញ្ចប់ឆមាសនឹងចាប់ផ្តើមពីថ្ងៃទី ១៥ ដល់ថ្ងៃទី ២០ ខែក្រោយ។ សូមនិស្សិតទាំងអស់ពិនិត្យមើលកាលវិភាគបន្ទប់ប្រឡង និងត្រៀមប័ណ្ណសម្គាល់ខ្លួនឱ្យបានរួចរាល់។",
    type: "urgent", // 'urgent' | 'warning' | 'info' | 'event'
    category: "ការប្រឡង",
    targetClass: "ទាំងអស់",
    createdAt: "2026-10-20",
    expiresAt: "2026-11-20",
    isActive: true,
    author: "ការិយាល័យសិក្សា"
  },
  {
    id: "ann-002",
    title: "ការផុតកំណត់ដាក់កិច្ចការស្រាវជ្រាវ (Quiz & Research Tasks)",
    content: "សូមរំលឹកដល់និស្សិតគ្រប់រូបដែលមិនទាន់បានប្រគល់កិច្ចការស្រាវជ្រាវប្រចាំសប្តាហ៍ សូមរួសរាន់បញ្ជូនត្រឹមថ្ងៃសុក្រនេះ វេលាម៉ោង ២៣:៥៩ នាទីយប់។",
    type: "warning",
    category: "កិច្ចការ",
    targetClass: "ទាំងអស់",
    createdAt: "2026-10-22",
    expiresAt: "2026-10-30",
    isActive: true,
    author: "សាស្រ្តាចារ្យទទួលបន្ទុក"
  },
  {
    id: "ann-003",
    title: "ពិធីប្រគល់វិញ្ញាបនបត្រ និងលិខិតសរសើរនិស្សិតឆ្នើម",
    content: "សាលានឹងរៀបចំពិធីប្រគល់លិខិតសរសើរដល់និស្សិតឆ្នើមប្រចាំឆមាស (និទ្ទេស A និង B+) នៅសាលប្រជុំធំ នៅចុងខែនេះ។",
    type: "event",
    category: "ព្រឹត្តិការណ៍",
    targetClass: "ទាំងអស់",
    createdAt: "2026-10-23",
    expiresAt: "2026-11-15",
    isActive: true,
    author: "គណៈគ្រប់គ្រងសាលា"
  }
];

export function AnnouncementProvider({ children }) {
  const [announcements, setAnnouncements] = useState(() => {
    try {
      const saved = localStorage.getItem("mypintou_announcements");
      return saved ? JSON.parse(saved) : DEFAULT_ANNOUNCEMENTS;
    } catch {
      return DEFAULT_ANNOUNCEMENTS;
    }
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Sync to Google Sheet ⚙️_Config sheet under ANNOUNCEMENTS_DATA
  const syncToGoogleSheet = async (list) => {
    setIsSyncing(true);
    try {
      const token = localStorage.getItem("mypintou_admin_token") || "MyPintou#Sec2026$X9z";
      await apiRequest(
        "admin_update_config",
        {
          token,
          updates: JSON.stringify({
            ANNOUNCEMENTS_DATA: JSON.stringify(list)
          })
        },
        { method: "POST" }
      );
      setLastSyncTime(new Date());
      // Broadcast real-time announcement event
      dataSyncService.publishEvent({
        entityType: "announcement",
        action: "announcement.updated"
      });
    } catch (e) {
      console.warn("Announcement background sync to Google Sheet error:", e);
    } finally {
      setIsSyncing(false);
    }
  };

  // Fetch latest announcements from Google Sheet on initial mount
  const refreshAnnouncements = async () => {
    try {
      const res = await getHealthStatus();
      const raw = res?.data?.config?.rawConfig || {};
      const dataStr = res?.data?.config?.announcementsData || raw.ANNOUNCEMENTS_DATA;
      if (dataStr) {
        try {
          const parsed = JSON.parse(dataStr);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setAnnouncements(parsed);
            localStorage.setItem("mypintou_announcements", JSON.stringify(parsed));
            setLastSyncTime(new Date());
          }
        } catch (err) {
          console.warn("Failed to parse announcements from Google Sheets:", err);
        }
      }
    } catch (e) {
      // Use local storage if network is offline
    }
  };

  useEffect(() => {
    refreshAnnouncements();

    // Subscribe to real-time announcement updates across devices & tabs
    const unsub = dataSyncService.subscribeToEntity("announcement", () => {
      refreshAnnouncements();
    });
    return () => unsub();
  }, []);

  // Save to localStorage whenever announcements change
  useEffect(() => {
    try {
      localStorage.setItem("mypintou_announcements", JSON.stringify(announcements));
    } catch (e) {
      console.error("Failed to save announcements:", e);
    }
  }, [announcements]);

  const addAnnouncement = (newAnn) => {
    const item = {
      ...newAnn,
      id: "ann-" + Date.now(),
      createdAt: new Date().toISOString().split("T")[0],
      isActive: true
    };
    setAnnouncements((prev) => {
      const next = [item, ...prev];
      syncToGoogleSheet(next);
      return next;
    });
    return item;
  };

  const updateAnnouncement = (id, updates) => {
    setAnnouncements((prev) => {
      const next = prev.map((a) => (a.id === id ? { ...a, ...updates } : a));
      syncToGoogleSheet(next);
      return next;
    });
  };

  const deleteAnnouncement = (id) => {
    setAnnouncements((prev) => {
      const next = prev.filter((a) => a.id !== id);
      syncToGoogleSheet(next);
      return next;
    });
  };

  const toggleActive = (id) => {
    setAnnouncements((prev) => {
      const next = prev.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a));
      syncToGoogleSheet(next);
      return next;
    });
  };

  const activeAnnouncements = announcements.filter((a) => a.isActive);

  return (
    <AnnouncementContext.Provider
      value={{
        announcements,
        activeAnnouncements,
        isSyncing,
        lastSyncTime,
        refreshAnnouncements,
        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        toggleActive
      }}
    >
      {children}
    </AnnouncementContext.Provider>
  );
}

export function useAnnouncements() {
  const ctx = useContext(AnnouncementContext);
  if (!ctx) {
    throw new Error("useAnnouncements must be used within an AnnouncementProvider");
  }
  return ctx;
}
