import React, { useState, useEffect } from "react";
import {
  Activity,
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Shield,
  Copy,
  Check,
  Zap,
  Terminal,
  Cpu,
  Layers,
  Sparkles,
  FileSpreadsheet,
  Building2,
  Save,
  PenTool,
  Link2,
  Smartphone,
  Download
} from "lucide-react";
import { getHealthStatus, prepareDatabaseSheets, setupSheetRelations, flushApiCache } from "../api/settingsApi.js";
import { getApiUrl, isUsingMock } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useSchool } from "../context/SchoolContext.jsx";
import SignatureCustomizerModal from "../components/SignatureCustomizerModal.jsx";
import { APP_VERSION, BUILD_TIMESTAMP, checkForAppUpdates, RELEASE_NOTES } from "../version.js";
import { isStandaloneMode, applyUpdateNow, triggerPWAInstall } from "../utils/pwaManager.js";

export default function SettingsPage() {
  const { adminSession } = useAuth();
  const { schoolInfo, saveSchoolInfoToGoogleSheet } = useSchool();
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState(null);
  const [showSigModal, setShowSigModal] = useState(false);

  // Application Version & PWA Update State
  const [versionInfo, setVersionInfo] = useState({
    currentVersion: APP_VERSION,
    latestVersion: APP_VERSION,
    buildTime: BUILD_TIMESTAMP,
    hasUpdate: false,
    checking: false,
    statusText: ""
  });

  const checkVersionUpdate = async () => {
    setVersionInfo(prev => ({ ...prev, checking: true, statusText: "កំពុងពិនិត្យ..." }));
    try {
      const res = await checkForAppUpdates();
      setVersionInfo({
        currentVersion: APP_VERSION,
        latestVersion: res.latestVersion || APP_VERSION,
        buildTime: res.buildTime || BUILD_TIMESTAMP,
        hasUpdate: res.hasUpdate,
        checking: false,
        statusText: res.hasUpdate ? `មានកំណែថ្មី v${res.latestVersion}!` : "កម្មវិធីស្ថិតក្នុងកំណែចុងក្រោយបង្អស់"
      });
    } catch (_) {
      setVersionInfo(prev => ({ ...prev, checking: false, statusText: "មិនអាចពិនិត្យកំណែថ្មីបានទេ" }));
    }
  };

  useEffect(() => {
    checkVersionUpdate();
  }, []);
  
  // School Info Form State
  const [schoolForm, setSchoolForm] = useState({
    schoolNameKh: schoolInfo?.schoolNameKh || "សាកលវិទ្យាល័យជាតិ",
    schoolNameEn: schoolInfo?.schoolNameEn || "National University",
    schoolLogoUrl: schoolInfo?.schoolLogoUrl || "/assets/images/app_icon.svg",
    campusTitle: schoolInfo?.campusTitle || "ប្រព័ន្ធគ្រប់គ្រងពិន្ទុ និងការវាយតម្លៃសិក្សាឆ្លាតវៃ",
    faculty: schoolInfo?.faculty || "មហាវិទ្យាល័យវិទ្យាសាស្ត្រ និងវិស្វកម្ម",
    department: schoolInfo?.department || "ដេប៉ាតឺម៉ង់បច្ចេកវិទ្យាព័ត៌មានវិទ្យា",
    subject: schoolInfo?.subject || "ការអភិវឌ្ឍន៍គេហទំព័រ",
    academicYear: schoolInfo?.academicYear || "២០២៤-២០២៥",
    semester: schoolInfo?.semester || "ឆមាសទី ១"
  });
  const [savingSchool, setSavingSchool] = useState(false);

  useEffect(() => {
    if (schoolInfo) {
      setSchoolForm({
        schoolNameKh: schoolInfo.schoolNameKh || "",
        schoolNameEn: schoolInfo.schoolNameEn || "",
        schoolLogoUrl: schoolInfo.schoolLogoUrl || "/assets/images/app_icon.svg",
        campusTitle: schoolInfo.campusTitle || "",
        faculty: schoolInfo.faculty || "",
        department: schoolInfo.department || "",
        subject: schoolInfo.subject || "",
        academicYear: schoolInfo.academicYear || "",
        semester: schoolInfo.semester || ""
      });
    }
  }, [schoolInfo]);

  const handleSaveSchoolInfo = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSavingSchool(true);
    setActionMessage(null);
    try {
      const token = adminSession?.token || "MyPintou#Sec2026$X9z";
      const updates = {
        SCHOOL_NAME_KH: schoolForm.schoolNameKh,
        SCHOOL_NAME_EN: schoolForm.schoolNameEn,
        SCHOOL_LOGO_URL: schoolForm.schoolLogoUrl,
        CAMPUS_SYSTEM_TITLE: schoolForm.campusTitle,
        FACULTY: schoolForm.faculty,
        DEPARTMENT: schoolForm.department,
        SUBJECT: schoolForm.subject,
        ACADEMIC_YEAR: schoolForm.academicYear,
        SEMESTER: schoolForm.semester
      };
      const res = await saveSchoolInfoToGoogleSheet(token, updates);
      if (res.success) {
        setActionMessage({
          type: "success",
          text: "ជោគជ័យ! បានរក្សាទុកព័ត៌មានសាលា និងឡូហ្គោរួចរាល់។"
        });
        await testConnection();
      } else {
        setActionMessage({ type: "error", text: res.message || "មិនអាចរក្សាទុកទៅ Server បានទេ។" });
      }
    } catch (err) {
      setActionMessage({ type: "error", text: err.message || "មានបញ្ហាក្នុងការរក្សាទុក។" });
    } finally {
      setSavingSchool(false);
    }
  };

  // Actions state
  const [preparingSheets, setPreparingSheets] = useState(false);
  const [settingUpRelations, setSettingUpRelations] = useState(false);
  const [flushingCache, setFlushingCache] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  const testConnection = async () => {
    setLoading(true);
    const start = Date.now();
    try {
      const res = await getHealthStatus(true);
      const elapsed = Date.now() - start;
      setHealth({ ...res, latencyMs: elapsed });
      setLastCheckTime(new Date().toLocaleTimeString());
    } catch (err) {
      setHealth({
        success: false,
        message: err.message,
        data: null,
        error: "NETWORK_ERROR",
        latencyMs: Date.now() - start
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  const handleCopySpreadsheetId = () => {
    navigator.clipboard.writeText("177W-KA6N6pFuP7_8vxo5SYQuBpm0BNPo8YSR3pAoF9E");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFlushCache = async () => {
    setFlushingCache(true);
    setActionMessage(null);
    try {
      const token = adminSession?.token || "MyPintou#Sec2026$X9z";
      const res = await flushApiCache(token);
      if (res.success) {
        setActionMessage({ type: "success", text: "បានសម្អាត Cache ជោគជ័យ! ទិន្នន័យត្រូវបានធ្វើសមកាលកម្មថ្មីទាំងអស់។" });
        await testConnection();
      } else {
        setActionMessage({ type: "error", text: res.message || "មិនអាចសម្អាត Cache បានទេ។" });
      }
    } catch (err) {
      setActionMessage({ type: "error", text: err.message || "មានបញ្ហាក្នុងការសម្អាត Cache។" });
    } finally {
      setFlushingCache(false);
    }
  };

  const handlePrepareSheets = async () => {
    const confirmed = window.confirm(
      "តើអ្នកចង់រៀបចំ/ធ្វើបច្ចុប្បន្នភាពរចនាសម្ព័ន្ធទិន្នន័យថ្មីដែរឬទេ?\n\nទិន្នន័យចាស់របស់អ្នកនឹងមិនត្រូវបានប៉ះពាល់ឡើយ។"
    );
    if (!confirmed) return;

    setPreparingSheets(true);
    setActionMessage(null);
    try {
      const token = adminSession?.token || "MyPintou#Sec2026$X9z";
      const res = await prepareDatabaseSheets(token);
      if (res.success) {
        setActionMessage({
          type: "success",
          text: `ជោគជ័យ! បានរៀបចំរចនាសម្ព័ន្ធទិន្នន័យស្តង់ដារ ដោយផ្ទេរនិស្សិតចំនួន ${res.data?.migratedCount || 0} នាក់។`
        });
        await testConnection();
      } else {
        setActionMessage({ type: "error", text: res.message || "មិនអាចរៀបចំទិន្នន័យបានទេ។" });
      }
    } catch (err) {
      setActionMessage({ type: "error", text: err.message || "មានបញ្ហាក្នុងការដំណើរការ។" });
    } finally {
      setPreparingSheets(false);
    }
  };

  const handleSetupRelations = async () => {
    const confirmed = window.confirm(
      "តើអ្នកចង់ភ្ជាប់ទំនាក់ទំនងទិន្នន័យស្វ័យប្រវត្តិ (Relational Engine) រវាងតារាងនិស្សិតមេ ជាមួយតារាងពិន្ទុ និងគណនីទាំងអស់ដែរឬទេ?\n\nរាល់ឈ្មោះនិស្សិត និងព័ត៌មានទាំងអស់នឹងត្រូវទាញចេញពីទិន្នន័យមេតែមួយគត់ ដើម្បីលុបបំបាត់កំហុស និងភាពមិនស៊ីសង្វាក់គ្នា។"
    );
    if (!confirmed) return;

    setSettingUpRelations(true);
    setActionMessage(null);
    try {
      const token = adminSession?.token || "MyPintou#Sec2026$X9z";
      const res = await setupSheetRelations(token);
      if (res.success) {
        setActionMessage({
          type: "success",
          text: res.message || "ជោគជ័យ! បានភ្ជាប់ទំនាក់ទំនងទិន្នន័យរវាងតារាងទាំងអស់រួចរាល់។"
        });
        await testConnection();
      } else {
        setActionMessage({ type: "error", text: res.message || "មិនអាចបង្កើតទំនាក់ទំនងរវាងតារាងទិន្នន័យបានទេ។" });
      }
    } catch (err) {
      setActionMessage({ type: "error", text: err.message || "មានបញ្ហាក្នុងការដំណើរការ។" });
    } finally {
      setSettingUpRelations(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-[11px] font-semibold mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
          <span className="font-khmer font-bold tracking-wide">ការត្រួតពិនិត្យប្រព័ន្ធ និងច្រកតភ្ជាប់ (Telemetry)</span>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-khmer tracking-tight">
          ការកំណត់ និងការត្រួតពិនិត្យប្រព័ន្ធ
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          ផ្ទៀងផ្ទាត់ការតភ្ជាប់រវាង Frontend ជាមួយ Cloud API និង Central Database
        </p>
      </div>

      {/* Action Notification Message */}
      {actionMessage && (
        <div className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-center justify-between gap-3 animate-fade-in-down ${
          actionMessage.type === "success"
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
            : "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300"
        }`}>
          <div className="flex items-center gap-2.5">
            {actionMessage.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
            )}
            <span>{actionMessage.text}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-xs opacity-75 hover:opacity-100 font-bold px-2 py-1 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Live Health Check Card */}
      <div className="relative p-[1px] rounded-3xl bg-gradient-to-br from-cyan-500/30 via-blue-500/20 to-purple-500/20 shadow-lg shadow-cyan-500/5">
        <div className="bg-white/90 dark:bg-[#0b1329]/90 backdrop-blur-xl rounded-[23px] border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-4">
              <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                health?.success
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
                  : "bg-amber-500/10 text-amber-500 border border-amber-500/30"
              }`}>
                <Activity className="w-6 h-6" />
                <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                  health?.success ? "bg-emerald-500 animate-ping" : "bg-amber-500"
                }`} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-khmer">
                  {health?.success ? "សេវាកម្ម API កំពុងដំណើរការល្អ (Online)" : "កំពុងត្រួតពិនិត្យការតភ្ជាប់..."}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono break-all mt-0.5">
                  {isUsingMock()
                    ? "ទម្រង់៖ ដំណើរការទិន្នន័យក្រៅបណ្ដាញ (Mock Data Fallback)"
                    : `ច្រកតភ្ជាប់ API: ${getApiUrl()}`}
                </p>
              </div>
            </div>

            <button
              onClick={testConnection}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-cyan-500/20 transition-all self-start sm:self-auto cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "កំពុងពិនិត្យ..." : "ត្រួតពិនិត្យការតភ្ជាប់"}</span>
            </button>
          </div>

          {/* Diagnostic Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 space-y-1.5">
              <span className="text-slate-400 font-medium block text-[11px]">
                ស្ថានភាពតភ្ជាប់
              </span>
              <span className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                {health?.success ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="text-emerald-600 dark:text-emerald-400">ដំណើរការល្អ (Online)</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="text-amber-500">ជូនដំណឹង / បម្រុងទុក</span>
                  </>
                )}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 space-y-1.5">
              <span className="text-slate-400 font-medium block text-[11px]">
                ល្បឿនឆ្លើយតប (Latency)
              </span>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 dark:text-white text-base font-mono">
                  {health?.latencyMs !== undefined ? `${health.latencyMs}` : "-"}
                </span>
                <span className="text-xs text-slate-400 font-mono">ms</span>
                {health?.latencyMs !== undefined && (
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    health.latencyMs < 300
                      ? "bg-emerald-500/10 text-emerald-500"
                      : health.latencyMs < 1000
                      ? "bg-cyan-500/10 text-cyan-500"
                      : "bg-amber-500/10 text-amber-500"
                  }`}>
                    {health.latencyMs < 300 ? "លឿនបំផុត" : health.latencyMs < 1000 ? "លឿន" : "ធម្មតា"}
                  </span>
                )}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 space-y-1.5">
              <span className="text-slate-400 font-medium block text-[11px]">
                ទម្រង់ Sheets ដែលបានរកឃើញ
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                {health?.data?.hasSeparatedSheets ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Sheets ដាច់ដោយឡែក (Optimized)</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold text-xs">
                    <span>ទម្រង់ទូទៅ (Single Sheet)</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Diagnostic Console */}
          {health?.data && (
            <div className="p-4 rounded-2xl bg-slate-950 dark:bg-[#050810] border border-cyan-500/20 text-slate-200 font-mono text-xs overflow-x-auto space-y-2 shadow-inner">
              <div className="flex items-center justify-between text-cyan-400 text-[11px] pb-1 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>LIVE_TELEMETRY.JSON</span>
                </div>
                <span className="text-[10px] text-slate-500">
                  Sheets: {health.data.totalSheets} | Version: {health.data.version}
                </span>
              </div>
              <pre className="text-slate-300 text-[11px] leading-relaxed">
                {JSON.stringify(health.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Database Sheets Optimization & Management Card */}
      <div className="relative p-[1px] rounded-3xl bg-gradient-to-br from-emerald-500/30 via-teal-500/10 to-transparent shadow-lg shadow-emerald-500/5">
        <div className="bg-white/90 dark:bg-[#0b1329]/90 backdrop-blur-xl rounded-[23px] border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-khmer">
                  ការរៀបចំរចនាសម្ព័ន្ធមូលទិន្នន័យកណ្តាល (Central Database Structure)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  រៀបចំទម្រង់ទិន្នន័យជា ៣ តារាងស្តង់ដារ (Students, Scoring, Config & Users) ដើម្បីងាយស្រួលគ្រប់គ្រង និងបង្កើនល្បឿន
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleFlushCache}
                disabled={flushingCache}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50"
                title="Flush API Cache and reload fresh"
              >
                <Zap className={`w-3.5 h-3.5 text-amber-500 ${flushingCache ? "animate-pulse" : ""}`} />
                <span>{flushingCache ? "កំពុងសម្អាត..." : "សម្អាត Cache (Sync)"}</span>
              </button>

              <button
                onClick={handleSetupRelations}
                disabled={settingUpRelations}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50"
                title="Establish dynamic relational links across all tables"
              >
                <Link2 className={`w-3.5 h-3.5 ${settingUpRelations ? "animate-spin" : ""}`} />
                <span>{settingUpRelations ? "កំពុងភ្ជាប់ទំនាក់ទំនង..." : "🔗 ភ្ជាប់ទំនាក់ទំនងទិន្នន័យ (Relational Engine)"}</span>
              </button>

              <button
                onClick={handlePrepareSheets}
                disabled={preparingSheets}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${preparingSheets ? "animate-spin" : ""}`} />
                <span>{preparingSheets ? "កំពុងរៀបចំ..." : "រៀបចំរចនាសម្ព័ន្ធទិន្នន័យឡើងវិញ"}</span>
              </button>
            </div>
          </div>

          {/* Active Sheets Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                1
              </div>
              <div>
                <span className="font-bold text-slate-900 dark:text-white block font-mono">
                  📋_Students
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  បញ្ជីឈ្មោះ អត្តលេខ ភេទ បន្ទប់ និងជំនាញ
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                2
              </div>
              <div>
                <span className="font-bold text-slate-900 dark:text-white block font-mono">
                  📊_Scoring
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  តារាងពិន្ទុរួម QHA, Midterm, Final, Total & Grade
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                3
              </div>
              <div>
                <span className="font-bold text-slate-900 dark:text-white block font-mono">
                  ⚙️_Config
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  កំណត់ឆ្នាំសិក្សា ឆមាស ពិន្ទុជាប់ និងនិទ្ទេស
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic School Information & System Logo Card */}
      <div className="relative p-[1px] rounded-3xl bg-gradient-to-br from-cyan-500/30 via-blue-500/10 to-indigo-500/20 shadow-lg shadow-cyan-500/5">
        <div className="bg-white/90 dark:bg-[#0b1329]/90 backdrop-blur-xl rounded-[23px] border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 flex items-center justify-center shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-khmer flex items-center gap-2">
                  <span>ព័ត៌មានគ្រឹះស្ថានសិក្សា និងឡូហ្គោប្រព័ន្ធ (School & Logo Settings)</span>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-[10px] font-mono font-bold">
                    ⚙️_Config Sync
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-khmer">
                  កែប្រែឈ្មោះសាលា ឡូហ្គោ ឆមាស និងមហាវិទ្យាល័យដែលត្រូវបង្ហាញលើទំព័រនិស្សិត និងវិញ្ញាបនបត្រ
                </p>
              </div>
            </div>

            <button
              onClick={handleSaveSchoolInfo}
              disabled={savingSchool}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer shrink-0 font-khmer"
            >
              {savingSchool ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>កំពុងរក្សាទុកទិន្នន័យ...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>រក្សាទុកការកំណត់</span>
                </>
              )}
            </button>
          </div>

          <form onSubmit={handleSaveSchoolInfo} className="space-y-5">
            {/* Logo Preview & Input Row */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 flex flex-col md:flex-row items-center gap-5">
              {/* Live Logo Preview Box */}
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-800 p-2 border-2 border-dashed border-cyan-500/40 shadow-inner flex items-center justify-center overflow-hidden group relative">
                  <img
                    src={schoolForm.schoolLogoUrl || "/assets/images/app_icon.svg"}
                    alt="School Logo Preview"
                    className="w-full h-full object-contain transition-transform group-hover:scale-110"
                    onError={(e) => { e.currentTarget.src = "/assets/images/app_icon.svg"; }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] text-white font-bold">
                    ទិដ្ឋភាពជាក់ស្តែង
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 font-khmer">
                  ទិដ្ឋភាពឡូហ្គោបច្ចុប្បន្ន
                </span>
              </div>

              {/* Logo URL Input & Presets */}
              <div className="flex-1 w-full space-y-2.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block font-khmer">
                  តំណភ្ជាប់ URL ឡូហ្គោសាលា (School Logo URL)៖
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={schoolForm.schoolLogoUrl}
                    onChange={(e) => setSchoolForm({ ...schoolForm, schoolLogoUrl: e.target.value })}
                    placeholder="https://example.com/logo.png ឬ /assets/images/app_icon.svg"
                    className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
                  />
                </div>
                {/* Logo Presets Quick Select */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-khmer">
                  <span className="text-slate-400">ជម្រើសឡូហ្គោរហ័ស៖</span>
                  <button
                    type="button"
                    onClick={() => setSchoolForm({ ...schoolForm, schoolLogoUrl: "/assets/images/app_icon.svg" })}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-cyan-500 hover:border-cyan-500 transition-colors cursor-pointer"
                  >
                    MyPintou App Icon
                  </button>
                  <button
                    type="button"
                    onClick={() => setSchoolForm({ ...schoolForm, schoolLogoUrl: "/assets/images/logo_dark_theme.svg" })}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-cyan-500 hover:border-cyan-500 transition-colors cursor-pointer"
                  >
                    Logo Dark Theme
                  </button>
                  <button
                    type="button"
                    onClick={() => setSchoolForm({ ...schoolForm, schoolLogoUrl: "/assets/images/logo_light_theme.svg" })}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-cyan-500 hover:border-cyan-500 transition-colors cursor-pointer"
                  >
                    Logo Light Theme
                  </button>
                </div>
              </div>
            </div>

            {/* School Text Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block font-khmer">
                  ឈ្មោះសាលា / គ្រឹះស្ថានសិក្សា (ភាសាខ្មែរ)៖
                </label>
                <input
                  type="text"
                  value={schoolForm.schoolNameKh}
                  onChange={(e) => setSchoolForm({ ...schoolForm, schoolNameKh: e.target.value })}
                  placeholder="ឧ. សាកលវិទ្យាល័យជាតិ..."
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 font-khmer"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block font-khmer">
                  ឈ្មោះសាលាជាអក្សរឡាតាំង (English / Latin Name)៖
                </label>
                <input
                  type="text"
                  value={schoolForm.schoolNameEn}
                  onChange={(e) => setSchoolForm({ ...schoolForm, schoolNameEn: e.target.value })}
                  placeholder="e.g. National University..."
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block font-khmer">
                  ចំណងជើងរងប្រព័ន្ធ / ពាក្យស្លោក (System Title/Tagline)៖
                </label>
                <input
                  type="text"
                  value={schoolForm.campusTitle}
                  onChange={(e) => setSchoolForm({ ...schoolForm, campusTitle: e.target.value })}
                  placeholder="ឧ. ប្រព័ន្ធគ្រប់គ្រងពិន្ទុ និងការវាយតម្លៃសិក្សាឆ្លាតវៃ"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 font-khmer"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block font-khmer">
                  មុខវិជ្ជាគោល (Subject/Course)៖
                </label>
                <input
                  type="text"
                  value={schoolForm.subject}
                  onChange={(e) => setSchoolForm({ ...schoolForm, subject: e.target.value })}
                  placeholder="ឧ. ការអភិវឌ្ឍន៍គេហទំព័រ"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 font-khmer"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block font-khmer">
                  មហាវិទ្យាល័យ (Faculty)៖
                </label>
                <input
                  type="text"
                  value={schoolForm.faculty}
                  onChange={(e) => setSchoolForm({ ...schoolForm, faculty: e.target.value })}
                  placeholder="ឧ. មហាវិទ្យាល័យវិទ្យាសាស្ត្រ និងវិស្វកម្ម"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 font-khmer"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block font-khmer">
                  ដេប៉ាតឺម៉ង់ (Department)៖
                </label>
                <input
                  type="text"
                  value={schoolForm.department}
                  onChange={(e) => setSchoolForm({ ...schoolForm, department: e.target.value })}
                  placeholder="ឧ. ដេប៉ាតឺម៉ង់បច្ចេកវិទ្យាព័ត៌មានវិទ្យា"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 font-khmer"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block font-khmer">
                  ឆ្នាំសិក្សា (Academic Year)៖
                </label>
                <input
                  type="text"
                  value={schoolForm.academicYear}
                  onChange={(e) => setSchoolForm({ ...schoolForm, academicYear: e.target.value })}
                  placeholder="ឧ. ២០២៤-២០២៥"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 font-khmer"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block font-khmer">
                  ឆមាស (Semester)៖
                </label>
                <input
                  type="text"
                  value={schoolForm.semester}
                  onChange={(e) => setSchoolForm({ ...schoolForm, semester: e.target.value })}
                  placeholder="ឧ. ឆមាសទី ១"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 font-khmer"
                />
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Digital Signatures & E-Sign Settings Card */}
      <div className="relative p-[1px] rounded-3xl bg-gradient-to-br from-emerald-500/30 via-teal-500/10 to-transparent shadow-lg shadow-emerald-500/5">
        <div className="bg-white/90 dark:bg-[#0b1329]/90 backdrop-blur-xl rounded-[23px] border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                <PenTool className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-khmer flex items-center gap-2">
                  <span>ការកំណត់ហត្ថលេខា ត្រាផ្លូវការ & E-Signature</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold">
                    ⚙️_Config Dynamic Sync
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-khmer">
                  គ្រប់គ្រងឈ្មោះ តួនាទី រូបភាពហត្ថលេខាឌីជីថល និងត្រាក្រហមផ្លូវការសម្រាប់បោះពុម្ពលើព្រឹត្តិបត្រពិន្ទុ និងវិញ្ញាបនបត្រ
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowSigModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 font-khmer"
            >
              <PenTool className="w-4 h-4" />
              <span>កែប្រែហត្ថលេខា & ត្រាផ្លូវការ</span>
            </button>
          </div>

          {/* Quick Overview Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-khmer">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">អ្នកចុះហត្ថលេខាទី ១ (Lecturer)</span>
                {schoolInfo?.signer1Image ? (
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-600 font-bold">មាន E-Sign</span>
                ) : (
                  <span className="text-slate-400 text-[10px]">មិនទាន់មាន</span>
                )}
              </div>
              <div className="font-bold text-slate-800 dark:text-slate-200">{schoolInfo?.signer1Name || "—"}</div>
              <div className="text-[11px] text-slate-500">{schoolInfo?.signer1Title || "—"}</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">អ្នកចុះហត្ថលេខាទី ២ (Rector)</span>
                {schoolInfo?.signer2Image ? (
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-600 font-bold">មាន E-Sign</span>
                ) : (
                  <span className="text-slate-400 text-[10px]">មិនទាន់មាន</span>
                )}
              </div>
              <div className="font-bold text-slate-800 dark:text-slate-200">{schoolInfo?.signer2Name || "—"}</div>
              <div className="text-[11px] text-slate-500">{schoolInfo?.signer2Title || "—"}</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">ត្រាផ្លូវការ & ទីតាំង</span>
                {schoolInfo?.showESignature ? (
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-600 font-bold">បើក E-Sign</span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-500/10 text-slate-500 font-bold">ចុះហត្ថលេខាផ្ទាល់ដៃ</span>
                )}
              </div>
              <div className="font-bold text-slate-800 dark:text-slate-200">{schoolInfo?.issueLocation || "រាជធានីភ្នំពេញ"}</div>
              <div className="text-[11px] text-slate-500">{schoolInfo?.officialStampImage ? "មានរូបត្រាក្រហមផ្លូវការ" : "មិនទាន់មានត្រា"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 8-Tier Grading System Standard Card */}
      <div className="relative p-[1px] rounded-3xl bg-gradient-to-br from-amber-500/30 via-orange-500/10 to-transparent shadow-lg shadow-amber-500/5">
        <div className="bg-white/90 dark:bg-[#0b1329]/90 backdrop-blur-xl rounded-[23px] border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-khmer flex items-center gap-2">
                  <span>ប្រព័ន្ធកំណត់និទ្ទេសទាំង ៨ ថ្នាក់ (8-Tier Grading System)</span>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-[11px] font-mono font-bold">
                    ស្តង់ដារជាតិ
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-khmer">
                  បទដ្ឋានគណនានិទ្ទេស និងកម្រិតវាយតម្លៃលទ្ធផលសិក្សារបស់និស្សិតក្នុងប្រព័ន្ធ MyPintou (Myពិន្ទុ)
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>ពិន្ទុជាប់៖ ចាប់ពី ៥០% (និទ្ទេស C) ឡើងទៅ</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {[
              { grade: "A", khmer: "ល្អប្រសើរ", range: "85% - 100%", gpa: "4.0", color: "from-emerald-500/20 to-teal-500/5", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-500/30", badge: "bg-emerald-500 text-white" },
              { grade: "B+", khmer: "ល្អណាស់", range: "80% - 84%", gpa: "3.5", color: "from-cyan-500/20 to-blue-500/5", text: "text-cyan-600 dark:text-cyan-400", border: "border-cyan-500/30", badge: "bg-cyan-500 text-white" },
              { grade: "B", khmer: "ល្អ", range: "70% - 79%", gpa: "3.0", color: "from-blue-500/20 to-indigo-500/5", text: "text-blue-600 dark:text-blue-400", border: "border-blue-500/30", badge: "bg-blue-600 text-white" },
              { grade: "C+", khmer: "ល្អបង្គួរ", range: "65% - 69%", gpa: "2.5", color: "from-teal-500/20 to-emerald-500/5", text: "text-teal-600 dark:text-teal-400", border: "border-teal-500/30", badge: "bg-teal-600 text-white" },
              { grade: "C", khmer: "មធ្យម", range: "50% - 64%", gpa: "2.0", color: "from-amber-500/20 to-yellow-500/5", text: "text-amber-600 dark:text-amber-400", border: "border-amber-500/30", badge: "bg-amber-500 text-slate-900" },
              { grade: "D", khmer: "ខ្សោយ", range: "45% - 49%", gpa: "1.5", color: "from-orange-500/20 to-amber-500/5", text: "text-orange-600 dark:text-orange-400", border: "border-orange-500/30", badge: "bg-orange-500 text-white" },
              { grade: "E", khmer: "ខ្សោយណាស់", range: "40% - 44%", gpa: "1.0", color: "from-purple-500/20 to-pink-500/5", text: "text-purple-600 dark:text-purple-400", border: "border-purple-500/30", badge: "bg-purple-600 text-white" },
              { grade: "F", khmer: "ធ្លាក់", range: "≤ 39%", gpa: "0.0", color: "from-rose-500/20 to-red-500/5", text: "text-rose-600 dark:text-rose-400", border: "border-rose-500/30", badge: "bg-rose-600 text-white" },
            ].map((t) => (
              <div
                key={t.grade}
                className={`p-3.5 rounded-2xl bg-gradient-to-br ${t.color} border ${t.border} backdrop-blur-sm space-y-1.5`}
              >
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded-lg text-xs font-black font-mono shadow-xs ${t.badge}`}>
                    {t.grade}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 font-semibold">
                    GPA {t.gpa}
                  </span>
                </div>
                <div className="font-bold text-slate-900 dark:text-white text-sm font-khmer">
                  {t.khmer}
                </div>
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  {t.range}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Target Spreadsheet Configuration Card */}
      <div className="relative p-[1px] rounded-3xl bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent">
        <div className="bg-white/90 dark:bg-[#0b1329]/90 backdrop-blur-xl rounded-[23px] border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-khmer">
                ការកំណត់ប្រព័ន្ធទិន្នន័យកណ្តាល (Central Database Configuration)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ប៉ារ៉ាម៉ែត្រ និងស្ថានភាពនៃការតភ្ជាប់ Cloud Database
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 space-y-2.5">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 block font-khmer">
                លេខសម្គាល់ Cluster (Database Cluster ID)៖
              </span>
              <div className="flex items-center justify-between gap-3 bg-white dark:bg-[#070b14] p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400 text-xs sm:text-sm break-all">
                  177W-KA6N6pFuP7_8vxo5SYQuBpm0BNPo8YSR3pAoF9E
                </span>
                <button
                  onClick={handleCopySpreadsheetId}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold shrink-0 transition-all cursor-pointer hover:scale-105 active:scale-95"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "បានចម្លង" : "ចម្លង"}</span>
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold pt-1 font-khmer">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Cloud Database Cluster Active & Synchronized</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Centralized Application Version Management & PWA Update Center */}
      <div className="relative p-[1px] rounded-3xl bg-gradient-to-br from-cyan-500/30 via-blue-500/15 to-transparent">
        <div className="bg-white/90 dark:bg-[#0b1329]/90 backdrop-blur-xl rounded-[23px] border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-khmer flex items-center gap-2">
                  <span>ការគ្រប់គ្រងកំណែកម្មវិធី និង PWA (Version Center)</span>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                    v{versionInfo.currentVersion}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  ព័ត៌មានលម្អិតអំពីកំណែ PWA ដែលបានដំឡើង និងការអាប់ដេតស្វ័យប្រវត្តិចុងក្រោយ
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={triggerPWAInstall}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500/15 to-blue-500/15 hover:from-cyan-500/25 hover:to-blue-500/25 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-xs font-bold transition-all cursor-pointer min-h-[44px]"
                title="ដំឡើងលើទូរស័ព្ទ"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ដំឡើងលើទូរស័ព្ទ</span>
              </button>

              <button
                type="button"
                onClick={checkVersionUpdate}
                disabled={versionInfo.checking}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer disabled:opacity-50 min-h-[44px]"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${versionInfo.checking ? "animate-spin" : ""}`} />
                <span>{versionInfo.checking ? "កំពុងពិនិត្យ..." : "ពិនិត្យកំណែថ្មី"}</span>
              </button>

              {versionInfo.hasUpdate && (
                <button
                  type="button"
                  onClick={applyUpdateNow}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer min-h-[44px]"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>អាប់ដេតឥឡូវនេះ (v{versionInfo.latestVersion})</span>
                </button>
              )}
            </div>
          </div>

          {/* Grid Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80">
              <span className="text-slate-500 block mb-1">កំណែដំឡើងបច្ចុប្បន្ន (Installed)</span>
              <span className="text-base font-black font-mono text-cyan-600 dark:text-cyan-400">
                v{versionInfo.currentVersion}
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">
                {isStandaloneMode() ? "📱 ដំណើរការក្នុង PWA Standalone Mode" : "🌐 ដំណើរការលើ Web Browser"}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80">
              <span className="text-slate-500 block mb-1">កំណែលើ Cloud Server</span>
              <span className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">
                v{versionInfo.latestVersion}
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">
                {versionInfo.statusText || "កម្មវិធីស្ថិតក្នុងកំណែចុងក្រោយ"}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80">
              <span className="text-slate-500 block mb-1">កាលបរិច្ឆេទ Build ចុងក្រោយ</span>
              <span className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 block truncate">
                {new Date(versionInfo.buildTime).toLocaleString("km-KH")}
              </span>
              <span className="text-[10px] text-emerald-500 font-semibold block mt-1">
                ✓ គាំទ្រ Auto-Update ដោយពុំបាច់ Reinstall
              </span>
            </div>
          </div>

          {/* Release Highlights */}
          <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 text-xs space-y-2">
            <h4 className="font-bold text-slate-800 dark:text-white font-khmer flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-500" />
              <span>លក្ខណៈពិសេសនៃកំណែថ្មីនេះ (Release Notes)</span>
            </h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 dark:text-slate-300 font-khmer text-[11px] list-disc list-inside">
              {RELEASE_NOTES.map((note, idx) => (
                <li key={idx}>{note}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Deployment & Non-destructive Safety Guide */}
      <div className="p-6 sm:p-7 rounded-3xl bg-blue-500/5 border border-blue-500/20 backdrop-blur-md space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white font-khmer">
            ការធានាសុវត្ថិភាព និងការរក្សាទិន្នន័យដើម
          </h4>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-khmer">
          ប្រព័ន្ធ Cloud Database API តភ្ជាប់ដោយសុវត្ថិភាពខ្ពស់ និងរក្សាការសម្ងាត់យ៉ាងម៉ត់ចត់។ ទិន្នន័យដើមរបស់អ្នកត្រូវបានការពារ និងបម្រុងទុក 100% ជានិច្ច។
        </p>
      </div>

      {/* Signature & E-Sign Customization Modal */}
      <SignatureCustomizerModal
        isOpen={showSigModal}
        onClose={() => setShowSigModal(false)}
      />
    </div>
  );
}
