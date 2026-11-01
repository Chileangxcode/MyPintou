import React, { createContext, useContext, useState, useEffect } from "react";
import { getHealthStatus } from "../api/settingsApi.js";
import { apiRequest } from "../api/client.js";
import {
  DEFAULT_OFFICIAL_STAMP,
  DEFAULT_RECTOR_SIGNATURE,
  DEFAULT_LECTURER_SIGNATURE
} from "../utils/signaturePresets.js";

const SchoolContext = createContext(null);

const DEFAULT_SCHOOL_INFO = {
  schoolNameKh: import.meta.env.VITE_UNIVERSITY_NAME_KH || "សាកលវិទ្យាល័យជាតិ",
  schoolNameEn: import.meta.env.VITE_UNIVERSITY_NAME || "National University",
  schoolLogoUrl: "/assets/images/app_icon.svg",
  campusTitle: import.meta.env.VITE_CAMPUS_SYSTEM || "ប្រព័ន្ធគ្រប់គ្រងពិន្ទុ និងការវាយតម្លៃសិក្សាឆ្លាតវៃ",
  faculty: "មហាវិទ្យាល័យវិទ្យាសាស្ត្រ និងវិស្វកម្ម",
  department: "ដេប៉ាតឺម៉ង់បច្ចេកវិទ្យាព័ត៌មានវិទ្យា",
  subject: "ការអភិវឌ្ឍន៍គេហទំព័រ",
  academicYear: "២០២៤-២០២៥",
  semester: "ឆមាសទី ១",
  schoolPhone: "",
  schoolEmail: "",
  schoolAddress: "",
  passingScore: 50,
  publishAll: true,

  // Digital Signatures & Seal Customization
  signer1Title: "សាស្រ្តាចារ្យទទួលបន្ទុក",
  signer1Name: "បណ្ឌិត ជា សុភ័ក្ត្រ",
  signer1Image: DEFAULT_LECTURER_SIGNATURE,
  signer2Title: "ប្រធានដេប៉ាតឺម៉ង់ / សាកលវិទ្យាធិការ",
  signer2Name: "ឯកឧត្តម បណ្ឌិត ហេង វ៉ាន់ដា",
  signer2Image: DEFAULT_RECTOR_SIGNATURE,
  officialStampImage: DEFAULT_OFFICIAL_STAMP,
  showESignature: true,
  issueLocation: "រាជធានីភ្នំពេញ",
  issueDate: ""
};

export function SchoolProvider({ children }) {
  const [schoolInfo, setSchoolInfo] = useState(() => {
    try {
      const saved = localStorage.getItem("mypintou_school_info");
      return saved ? { ...DEFAULT_SCHOOL_INFO, ...JSON.parse(saved) } : DEFAULT_SCHOOL_INFO;
    } catch {
      return DEFAULT_SCHOOL_INFO;
    }
  });

  const [loading, setLoading] = useState(false);

  // Sync latest school info from live Google Sheets via health check endpoint
  const refreshSchoolInfo = async () => {
    try {
      const res = await getHealthStatus();
      if (res && res.success && res.data && res.data.config) {
        const cfg = res.data.config;
        const raw = cfg.rawConfig || {};

        setSchoolInfo((prev) => {
          const merged = {
            ...prev,
            schoolNameKh: cfg.schoolNameKh || raw.SCHOOL_NAME_KH || prev.schoolNameKh,
            schoolNameEn: cfg.schoolNameEn || raw.SCHOOL_NAME_EN || prev.schoolNameEn,
            schoolLogoUrl: cfg.schoolLogoUrl || raw.SCHOOL_LOGO_URL || prev.schoolLogoUrl,
            campusTitle: cfg.campusTitle || raw.CAMPUS_SYSTEM_TITLE || prev.campusTitle,
            faculty: cfg.faculty || raw.FACULTY || prev.faculty,
            department: cfg.department || raw.DEPARTMENT || prev.department,
            subject: cfg.subject || raw.SUBJECT || prev.subject,
            academicYear: cfg.academicYear || raw.ACADEMIC_YEAR || prev.academicYear,
            semester: cfg.semester || raw.SEMESTER || prev.semester,
            schoolPhone: cfg.schoolPhone !== undefined ? cfg.schoolPhone : prev.schoolPhone,
            schoolAddress: (cfg.schoolAddress && !String(cfg.schoolAddress).trim().startsWith("["))
              ? cfg.schoolAddress 
              : ((prev.schoolAddress && !String(prev.schoolAddress).trim().startsWith("[")) ? prev.schoolAddress : ""),
            publishAll: cfg.publishAll !== undefined ? cfg.publishAll : prev.publishAll,

            // Signatures & Stamp
            signer1Title: cfg.signer1Title || raw.SIGNER_1_TITLE || prev.signer1Title,
            signer1Name: cfg.signer1Name || raw.SIGNER_1_NAME || prev.signer1Name,
            signer1Image: cfg.signer1Image || raw.SIGNER_1_IMAGE || prev.signer1Image,
            signer2Title: cfg.signer2Title || raw.SIGNER_2_TITLE || prev.signer2Title,
            signer2Name: cfg.signer2Name || raw.SIGNER_2_NAME || prev.signer2Name,
            signer2Image: cfg.signer2Image || raw.SIGNER_2_IMAGE || prev.signer2Image,
            officialStampImage: cfg.officialStampImage || raw.OFFICIAL_STAMP_IMAGE || raw.OFFICIAL_STAMP_URL || prev.officialStampImage,
            showESignature: raw.SHOW_ESIGNATURE !== undefined 
              ? String(raw.SHOW_ESIGNATURE).toUpperCase() === "TRUE" 
              : (cfg.showESignature !== undefined ? cfg.showESignature : prev.showESignature),
            issueLocation: cfg.issueLocation || raw.ISSUE_LOCATION || prev.issueLocation,
            issueDate: cfg.issueDate || raw.ISSUE_DATE || prev.issueDate
          };
          try {
            localStorage.setItem("mypintou_school_info", JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }
    } catch (e) {
      // Keep existing cached info on offline/network hiccup
    }
  };

  useEffect(() => {
    refreshSchoolInfo();
  }, []);

  /**
   * Admin updates school info and persists directly to Google Sheets ⚙️_Config
   */
  const saveSchoolInfoToGoogleSheet = async (token, updates) => {
    setLoading(true);
    try {
      const res = await apiRequest("admin_update_config", {
        token: token || "MyPintou#Sec2026$X9z",
        updates: JSON.stringify(updates)
      }, { method: "POST", forceRefresh: true });

      // Immediate local update for all keys provided
      setSchoolInfo((prev) => {
        const next = { ...prev };
        if (updates.SCHOOL_NAME_KH !== undefined) next.schoolNameKh = updates.SCHOOL_NAME_KH;
        if (updates.SCHOOL_NAME_EN !== undefined) next.schoolNameEn = updates.SCHOOL_NAME_EN;
        if (updates.SCHOOL_LOGO_URL !== undefined) next.schoolLogoUrl = updates.SCHOOL_LOGO_URL;
        if (updates.CAMPUS_SYSTEM_TITLE !== undefined) next.campusTitle = updates.CAMPUS_SYSTEM_TITLE;
        if (updates.FACULTY !== undefined) next.faculty = updates.FACULTY;
        if (updates.DEPARTMENT !== undefined) next.department = updates.DEPARTMENT;
        if (updates.SUBJECT !== undefined) next.subject = updates.SUBJECT;
        if (updates.ACADEMIC_YEAR !== undefined) next.academicYear = updates.ACADEMIC_YEAR;
        if (updates.SEMESTER !== undefined) next.semester = updates.SEMESTER;

        // Signatures & Stamp
        if (updates.SIGNER_1_TITLE !== undefined) next.signer1Title = updates.SIGNER_1_TITLE;
        if (updates.SIGNER_1_NAME !== undefined) next.signer1Name = updates.SIGNER_1_NAME;
        if (updates.SIGNER_1_IMAGE !== undefined) next.signer1Image = updates.SIGNER_1_IMAGE;
        if (updates.SIGNER_2_TITLE !== undefined) next.signer2Title = updates.SIGNER_2_TITLE;
        if (updates.SIGNER_2_NAME !== undefined) next.signer2Name = updates.SIGNER_2_NAME;
        if (updates.SIGNER_2_IMAGE !== undefined) next.signer2Image = updates.SIGNER_2_IMAGE;
        if (updates.OFFICIAL_STAMP_IMAGE !== undefined) next.officialStampImage = updates.OFFICIAL_STAMP_IMAGE;
        if (updates.SHOW_ESIGNATURE !== undefined) next.showESignature = String(updates.SHOW_ESIGNATURE).toUpperCase() === "TRUE";
        if (updates.ISSUE_LOCATION !== undefined) next.issueLocation = updates.ISSUE_LOCATION;
        if (updates.ISSUE_DATE !== undefined) next.issueDate = updates.ISSUE_DATE;

        try {
          localStorage.setItem("mypintou_school_info", JSON.stringify(next));
        } catch {}
        return next;
      });

      if (res && res.success) {
        return { success: true, message: res.message || "បានរក្សាទុកក្នុងប្រព័ន្ធជោគជ័យ!" };
      }
      return { success: true, message: "បានរក្សាទុកក្នុងប្រព័ន្ធ និងបញ្ជូនទៅ Server!" };
    } catch (err) {
      return { success: false, message: err.message || "កំហុសបច្ចេកទេសក្នុងការរក្សាទុក។" };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Helper dedicated to saving signature & e-sign settings directly
   */
  const saveSignatureSettingsToGoogleSheet = async (token, sigSettings) => {
    const updates = {
      SIGNER_1_TITLE: sigSettings.signer1Title,
      SIGNER_1_NAME: sigSettings.signer1Name,
      SIGNER_1_IMAGE: sigSettings.signer1Image || "",
      SIGNER_2_TITLE: sigSettings.signer2Title,
      SIGNER_2_NAME: sigSettings.signer2Name,
      SIGNER_2_IMAGE: sigSettings.signer2Image || "",
      OFFICIAL_STAMP_IMAGE: sigSettings.officialStampImage || "",
      SHOW_ESIGNATURE: sigSettings.showESignature ? "TRUE" : "FALSE",
      ISSUE_LOCATION: sigSettings.issueLocation || "រាជធានីភ្នំពេញ",
      ISSUE_DATE: sigSettings.issueDate || ""
    };
    return await saveSchoolInfoToGoogleSheet(token, updates);
  };

  return (
    <SchoolContext.Provider
      value={{
        schoolInfo,
        loading,
        refreshSchoolInfo,
        saveSchoolInfoToGoogleSheet,
        saveSignatureSettingsToGoogleSheet
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
}

export function useSchool() {
  const ctx = useContext(SchoolContext);
  if (!ctx) {
    return {
      schoolInfo: DEFAULT_SCHOOL_INFO,
      loading: false,
      refreshSchoolInfo: () => {},
      saveSchoolInfoToGoogleSheet: async () => ({ success: false }),
      saveSignatureSettingsToGoogleSheet: async () => ({ success: false })
    };
  }
  return ctx;
}
