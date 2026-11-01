import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import RobotMascot from "../components/RobotMascot.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import BrandLogo from "../components/BrandLogo.jsx";
import { triggerPWAInstall } from "../utils/pwaManager.js";

export default function LandingPage({ defaultTab = "student" }) {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const getInitialTab = () => {
    const qTab = searchParams.get("tab");
    if (qTab === "staff" || qTab === "teacher" || qTab === "admin") return "staff";
    if (location.pathname.includes("/teacher")) return "staff";
    return "student";
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);
  const navigate = useNavigate();

  useEffect(() => {
    const qTab = searchParams.get("tab");
    if (qTab === "staff" || qTab === "teacher" || qTab === "admin") setActiveTab("staff");
    else if (location.pathname.includes("/teacher")) setActiveTab("staff");
    else setActiveTab("student");
  }, [searchParams, location.pathname]);

  // Staff Form State
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [staffError, setStaffError] = useState("");

  // Student Form State
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [showStudentPassword, setShowStudentPassword] = useState(false);
  const [studentError, setStudentError] = useState("");

  // Mascot Robot State
  const [robotStatus, setRobotStatus] = useState("idle"); // "idle" | "error" | "success"
  const [isTypingPassword, setIsTypingPassword] = useState(false);

  const { loginStudent, loginTeacherAdmin, loading, studentSession, adminSession } = useAuth();

  // If already logged in, redirect appropriately
  useEffect(() => {
    // Only auto-redirect to admin if specifically on /teacher-login or ?tab=staff
    const isTeacherRoute = location.pathname.includes("/teacher") || searchParams.get("tab") === "staff";
    if (isTeacherRoute && adminSession) {
      navigate("/admin/dashboard");
    } else if (studentSession) {
      // If student session exists, redirect to student dashboard
      navigate("/student/dashboard");
    }
  }, [adminSession, studentSession, navigate, location.pathname, searchParams]);

  // Detect Caps Lock on keydown
  const handleKeyDown = (e) => {
    if (e.getModifierState && e.getModifierState("CapsLock")) {
      setCapsLockActive(true);
    } else {
      setCapsLockActive(false);
    }
  };

  // Staff Login Submit
  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    setStaffError("");
    setRobotStatus("idle");

    if (!username.trim() || !password) {
      setStaffError("សូមបញ្ចូលឈ្មោះគណនី និងលេខសម្ងាត់របស់អ្នក។");
      setRobotStatus("error");
      return;
    }

    const res = await loginTeacherAdmin(username.trim(), password);
    if (res.success) {
      setRobotStatus("success");
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 500);
    } else {
      setRobotStatus("error");
      const raw = String(res.message || res.error || "").toLowerCase();
      let khMsg = "ឈ្មោះគណនី ឬលេខសម្ងាត់មិនត្រឹមត្រូវឡើយ។ សូមពិនិត្យម្តងទៀត។";
      if (raw.includes("network") || raw.includes("failed to fetch")) {
        khMsg = "មិនអាចភ្ជាប់ទៅកាន់ម៉ាស៊ីនមេបានទេ។ សូមពិនិត្យការតភ្ជាប់អ៊ីនធឺណិត។";
      } else if (raw.includes("unauthorized")) {
        khMsg = "អ្នកមិនមានសិទ្ធិចូលប្រើប្រាស់ប្រព័ន្ធឡើយ។";
      }
      setStaffError(khMsg);
    }
  };

  // Student Lookup Submit
  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setStudentError("");
    setRobotStatus("idle");

    const trimmedName = studentName.trim();
    const trimmedId = studentId.trim();

    if (!trimmedName) {
      setStudentError("សូមបញ្ចូលឈ្មោះនិស្សិត (ឈ្មោះខ្មែរ ឬ អក្សរឡាតាំង)។");
      setRobotStatus("error");
      return;
    }
    if (!trimmedId) {
      setStudentError("សូមបញ្ចូលលេខសម្គាល់និស្សិតជាលេខសម្ងាត់ (Student ID Password)។");
      setRobotStatus("error");
      return;
    }

    const res = await loginStudent(trimmedName, trimmedId);
    if (res.success) {
      setRobotStatus("success");
      setTimeout(() => {
        navigate("/student/dashboard");
      }, 500);
    } else {
      setRobotStatus("error");
      const raw = String(res.message || res.error || "").toLowerCase();
      let khMsg = "មិនស្វែងរកឃើញទិន្នន័យនិស្សិតទេ។ សូមពិនិត្យលេខសម្គាល់ និងឈ្មោះឡើងវិញ។";
      if (raw.includes("network") || raw.includes("failed to fetch")) {
        khMsg = "មិនអាចភ្ជាប់ទៅកាន់ម៉ាស៊ីនមេបានទេ។ សូមពិនិត្យការតភ្ជាប់អ៊ីនធឺណិត។";
      } else if (raw.includes("required") || raw.includes("missing")) {
        khMsg = "សូមបញ្ចូលលេខសម្គាល់ និងឈ្មោះនិស្សិតឱ្យបានពេញលេញ។";
      }
      setStudentError(khMsg);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col justify-between relative overflow-hidden font-['Kantumruy_Pro'] selection:bg-blue-600 selection:text-white">
      {/* Dynamic Aurora & Cyber Grid Ambient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="cyber-grid absolute inset-0 opacity-40 dark:opacity-30" />
        <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-blue-600/20 mix-blend-screen filter blur-[130px] animate-aurora-1" />
        <div className="absolute top-[20%] -right-[20%] w-[60vw] h-[60vw] rounded-full bg-purple-600/20 mix-blend-screen filter blur-[130px] animate-aurora-2" />
        <div className="absolute -bottom-[20%] left-[20%] w-[80vw] h-[80vw] rounded-full bg-indigo-600/20 mix-blend-screen filter blur-[130px] animate-aurora-3" />
        {/* Subtle noise texture */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZUZpbHRlciI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgibm9pc2VGaWx0ZXIpIi8+PC9zdmc+')] opacity-15 mix-blend-overlay pointer-events-none" />
      </div>

      {/* Top Header Navbar */}
      <header className="relative z-20 w-full px-4 sm:px-8 py-5 flex items-center justify-between border-b border-white/[0.06] backdrop-blur-md bg-[#0B0F19]/40">
        <div className="flex items-center gap-3.5 group cursor-pointer" onClick={() => navigate("/")}>
          <BrandLogo size="md" showSubtitle={true} />
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Live Telemetry Pill */}
          <div className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-[11px] text-slate-300 backdrop-blur-md font-khmer">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 font-semibold">តភ្ជាប់ពពក</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">សមកាលកម្មប្រព័ន្ធទិន្នន័យ</span>
          </div>

          {/* PWA Install Button */}
          <button
            type="button"
            onClick={triggerPWAInstall}
            className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-xs font-semibold text-cyan-300 hover:text-white backdrop-blur-md transition-all hover:scale-105 active:scale-95 shadow-sm cursor-pointer font-khmer min-h-[44px]"
            title="ដំឡើងលើទូរស័ព្ទ (Install Mobile App)"
          >
            <i className="fas fa-download text-cyan-400" />
            <span className="hidden sm:inline">ដំឡើងលើទូរស័ព្ទ</span>
          </button>

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>
      </header>

      {/* Main Hero Container */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16 w-full flex-1 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center w-full">
          
          {/* Left Column: Vision & Features */}
          <div className="lg:col-span-7 space-y-8 animate-fade-in-up order-2 lg:order-1">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-medium backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
                </span>
                <span className="font-semibold tracking-wide font-khmer">ប្រព័ន្ធគ្រប់គ្រងសាលារៀនឌីជីថលជំនាន់ថ្មី ២០២៦</span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight font-khmer">
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300 bg-clip-text text-transparent">
                  បច្ចេកវិទ្យាឌីជីថល
                </span>
                <br />
                <span className="text-slate-100">ដើម្បីអនាគតនៃការអប់រំ</span>
              </h2>

              <p className="text-sm sm:text-base text-slate-300/80 max-w-xl leading-relaxed font-khmer">
                ប្រព័ន្ធគ្រប់គ្រងសាលារៀនឌីជីថលឆ្លាតវៃ ងាយស្រួលប្រើប្រាស់ គ្រប់គ្រងទិន្នន័យសិស្ស បុគ្គលិក ពិន្ទុ និងការវាយតម្លៃលទ្ធផលសិក្សាប្រកបដោយប្រសិទ្ធភាពខ្ពស់ និងសុវត្ថិភាពទិន្នន័យកម្រិតខ្ពស់។
              </p>

              {/* High-tech Key Highlights */}
              <div className="flex flex-wrap gap-3 pt-2 font-khmer">
                <div className="px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-md flex items-center gap-2 text-xs text-slate-300">
                  <i className="fas fa-bolt text-amber-400" />
                  <span>សមកាលកម្មទិន្នន័យផ្ទាល់តាម Cloud Database</span>
                </div>
                <div className="px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-md flex items-center gap-2 text-xs text-slate-300">
                  <i className="fas fa-shield-halved text-cyan-400" />
                  <span>ស្វែងរកទិន្នន័យរហ័សទាន់ចិត្ត</span>
                </div>
                <div className="px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-md flex items-center gap-2 text-xs text-slate-300">
                  <i className="fas fa-print text-indigo-400" />
                  <span>ព្រឹត្តិបត្រពិន្ទុ A4</span>
                </div>
              </div>
            </div>

            {/* Feature Cards Grid (Cyber-Academic Glassmorphism) */}
            <div className="space-y-3.5 max-w-lg">
              {/* Feature 1 */}
              <div className="p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-cyan-500/40 backdrop-blur-xl transition-all duration-300 hover:translate-x-2 flex items-start gap-4 group shadow-sm hover:shadow-[0_0_25px_rgba(6,182,212,0.2)]">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.25)] group-hover:scale-110 transition-transform">
                  <i className="fas fa-bolt text-lg" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-khmer group-hover:text-cyan-300 transition-colors">
                    រហ័ស និងងាយស្រួល
                  </h3>
                  <p className="text-xs text-slate-300/70 mt-0.5 leading-relaxed font-khmer">
                    ប្រតិបត្តិការទិន្នន័យបានលឿនក្នុងមួយចុច គណនាពិន្ទុ និងមធ្យមភាគដោយស្វ័យប្រវត្តិ។
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-indigo-500/40 backdrop-blur-xl transition-all duration-300 hover:translate-x-2 flex items-start gap-4 group shadow-sm hover:shadow-[0_0_25px_rgba(99,102,241,0.2)]">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.25)] group-hover:scale-110 transition-transform">
                  <i className="fas fa-shield-halved text-lg" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-khmer group-hover:text-indigo-300 transition-colors">
                    សុវត្ថិភាពទិន្នន័យ ១០០%
                  </h3>
                  <p className="text-xs text-slate-300/70 mt-0.5 leading-relaxed font-khmer">
                    ប្រព័ន្ធផ្ទុកទិន្នន័យមានសុវត្ថិភាពខ្ពស់ និងរក្សាការសម្ងាត់យ៉ាងតឹងរ៉ឹងតាមរយៈស្ថាបត្យកម្ម Cloud ស្តង់ដារអន្តរជាតិ។
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-purple-500/40 backdrop-blur-xl transition-all duration-300 hover:translate-x-2 flex items-start gap-4 group shadow-sm hover:shadow-[0_0_25px_rgba(168,85,247,0.2)]">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.25)] group-hover:scale-110 transition-transform">
                  <i className="fas fa-chart-pie text-lg" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-khmer group-hover:text-purple-300 transition-colors">
                    របាយការណ៍ និងស្ថិតិឆ្លាតវៃ
                  </h3>
                  <p className="text-xs text-slate-300/70 mt-0.5 leading-relaxed font-khmer">
                    វិភាគ និងទាញយករបាយការណ៍ស្វ័យប្រវត្តិក្តៅៗ ឬបោះពុម្ពជាសន្លឹកលទ្ធផលបានភ្លាមៗ។
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Floating Auth Card with Robot Mascot */}
          <div className="lg:col-span-5 relative order-1 lg:order-2">
            <div className="relative pt-14">
              {/* Mascot Floating on Top of Card */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
                <RobotMascot status={robotStatus} isShy={isTypingPassword} />
              </div>

              {/* High-Tech Cyber Glassmorphism Card */}
              <div className="relative p-[1px] rounded-[32px] bg-gradient-to-b from-cyan-400/30 via-white/10 to-indigo-500/30 shadow-[0_25px_70px_rgba(0,0,0,0.7)] group">
                <div className="relative rounded-[31px] bg-[#0c1427]/85 backdrop-blur-2xl p-6 sm:p-8 pt-20 transition-all duration-300">
                  
                  {/* Title & System Status */}
                  <div className="text-center mb-6 pt-2">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[11px] font-semibold text-cyan-400 mb-2 font-khmer">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                      <span>{activeTab === "student" ? "ច្រកស្វែងរកពិន្ទុនិស្សិត" : "ច្រកសាស្ត្រាចារ្យ និងបុគ្គលិក"}</span>
                    </div>
                    <h3 className="text-2xl font-black text-white font-khmer tracking-wide">
                      {activeTab === "student" ? "ស្វែងរកលទ្ធផលសិក្សា" : "ចូលគ្រប់គ្រងប្រព័ន្ធ"}
                    </h3>
                    <p className="text-xs text-slate-300/70 mt-1 font-khmer">
                      {activeTab === "student"
                        ? "សូមបញ្ចូលលេខសម្គាល់ និងឈ្មោះរបស់អ្នកដើម្បីពិនិត្យពិន្ទុ"
                        : "សូមបញ្ចូលឈ្មោះគណនី និងលេខសម្ងាត់របស់អ្នក"}
                    </p>
                  </div>

                  {/* Role Switcher Tabs - STUDENT FIRST, THEN TEACHER */}
                  <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-black/40 border border-white/10 mb-6 backdrop-blur-md shadow-inner font-khmer">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("student");
                        setRobotStatus("idle");
                        setStaffError("");
                        setStudentError("");
                      }}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                        activeTab === "student"
                          ? "bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-[0_4px_16px_rgba(6,182,212,0.4)]"
                          : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                      }`}
                    >
                      <i className="fas fa-user-graduate text-sm" />
                      <span>និស្សិត (Student)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("staff");
                        setRobotStatus("idle");
                        setStaffError("");
                        setStudentError("");
                      }}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                        activeTab === "staff"
                          ? "bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-[0_4px_16px_rgba(6,182,212,0.4)]"
                          : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                      }`}
                    >
                      <i className="fas fa-chalkboard-teacher text-sm" />
                      <span>សាស្ត្រាចារ្យ / បុគ្គលិក</span>
                    </button>
                  </div>

                  {/* Error Banner */}
                  {(staffError || studentError) && (
                    <div className="mb-5 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 backdrop-blur-md animate-fade-in-up font-khmer">
                      <i className="fas fa-triangle-exclamation text-rose-400 shrink-0 mt-0.5" />
                      <span>{staffError || studentError}</span>
                    </div>
                  )}

                  {/* Staff Login Form */}
                  {activeTab === "staff" && (
                    <form onSubmit={handleStaffSubmit} className="space-y-4">
                      {/* Username Input */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-300 font-khmer">
                          ឈ្មោះគណនី
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-cyan-400 transition-colors">
                            <i className="fas fa-user text-sm" />
                          </div>
                          <input
                            type="text"
                            value={username}
                            onChange={(e) => {
                              setUsername(e.target.value);
                              setRobotStatus("idle");
                            }}
                            onFocus={() => {
                              setIsTypingPassword(false);
                              setRobotStatus("idle");
                            }}
                            placeholder="បញ្ចូលឈ្មោះគណនីរបស់អ្នក"
                            autoComplete="username"
                            disabled={loading}
                            className="w-full pl-11 pr-4 py-3 bg-white/[0.04] border border-white/10 rounded-2xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400/80 focus:bg-white/[0.08] focus:ring-4 focus:ring-cyan-500/20 transition-all backdrop-blur-md"
                            required
                          />
                        </div>
                      </div>

                      {/* Password Input */}
                      <div className="space-y-1.5 relative">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-semibold text-slate-300 font-khmer">
                            លេខសម្ងាត់
                          </label>
                          {capsLockActive && (
                            <span className="text-[10px] text-amber-400 flex items-center gap-1 font-semibold animate-pulse font-khmer">
                              <i className="fas fa-arrow-up" /> Caps Lock បើក
                            </span>
                          )}
                        </div>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-cyan-400 transition-colors">
                            <i className="fas fa-lock text-sm" />
                          </div>
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => {
                              setPassword(e.target.value);
                              setRobotStatus("idle");
                            }}
                            onKeyDown={handleKeyDown}
                            onFocus={() => setIsTypingPassword(true)}
                            onBlur={() => setIsTypingPassword(false)}
                            placeholder="••••••••"
                            autoComplete="current-password"
                            disabled={loading}
                            className="w-full pl-11 pr-11 py-3 bg-white/[0.04] border border-white/10 rounded-2xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400/80 focus:bg-white/[0.08] focus:ring-4 focus:ring-cyan-500/20 transition-all backdrop-blur-md"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                            tabIndex={-1}
                          >
                            <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"} text-sm`} />
                          </button>
                        </div>
                      </div>

                      {/* Checkbox and Forgot Password */}
                      <div className="flex items-center justify-between pt-1 text-xs font-khmer">
                        <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-300">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="rounded border-slate-700 bg-white/5 text-cyan-500 focus:ring-0 focus:ring-offset-0"
                          />
                          <span>ចងចាំគណនី</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => alert("សូមទាក់ទងអ្នកគ្រប់គ្រងប្រព័ន្ធ (Admin) ឬ Telegram @LeangOCL ដើម្បីកំណត់លេខសម្ងាត់ឡើងវិញ។")}
                          className="text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer"
                        >
                          ភ្លេចលេខសម្ងាត់?
                        </button>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-4 py-3.5 rounded-2xl font-bold text-white text-base bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-[0_8px_30px_rgba(6,182,212,0.4)] hover:shadow-[0_8px_40px_rgba(6,182,212,0.6)] transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-50 relative overflow-hidden group/btn cursor-pointer font-khmer"
                      >
                        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-25deg] group-hover/btn:animate-shine pointer-events-none" />
                        
                        <div className="flex items-center justify-center gap-2">
                          {loading ? (
                            <>
                              <i className="fas fa-circle-notch fa-spin text-sm" />
                              <span>កំពុងចូល...</span>
                            </>
                          ) : (
                            <>
                              <span>ចូលប្រព័ន្ធ</span>
                              <i className="fas fa-arrow-right text-sm transform group-hover/btn:translate-x-1 transition-transform" />
                            </>
                          )}
                        </div>
                      </button>
                    </form>
                  )}

                  {/* Student Lookup Form */}
                  {activeTab === "student" && (
                    <form onSubmit={handleStudentSubmit} className="space-y-4">
                      {/* Student Name (Username) */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-300 font-khmer">
                          ឈ្មោះនិស្សិត (ឈ្មោះខ្មែរ ឬ អក្សរឡាតាំង / English & Khmer Name)
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-cyan-400 transition-colors">
                            <i className="fas fa-user-tag text-sm" />
                          </div>
                          <input
                            type="text"
                            value={studentName}
                            onChange={(e) => {
                              setStudentName(e.target.value);
                              setRobotStatus("idle");
                            }}
                            onFocus={() => {
                              setIsTypingPassword(false);
                              setRobotStatus("idle");
                            }}
                            placeholder="ឈ្មោះជាភាសាខ្មែរ ឬ អក្សរឡាតាំង (ឧ. កោ អារីហ្សា ឬ KOR ARYSHA)"
                            autoComplete="username"
                            disabled={loading}
                            className="w-full pl-11 pr-4 py-3 bg-white/[0.04] border border-white/10 rounded-2xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400/80 focus:bg-white/[0.08] focus:ring-4 focus:ring-cyan-500/20 transition-all backdrop-blur-md font-khmer"
                            required
                          />
                        </div>
                      </div>

                      {/* Student ID as Password */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-semibold text-slate-300 font-khmer">
                            លេខសម្គាល់និស្សិតជាលេខសម្ងាត់ (Student ID Password)
                          </label>
                        </div>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-cyan-400 transition-colors">
                            <i className="fas fa-lock text-sm" />
                          </div>
                          <input
                            type={showStudentPassword ? "text" : "password"}
                            value={studentId}
                            onChange={(e) => {
                              setStudentId(e.target.value);
                              setRobotStatus("idle");
                            }}
                            onFocus={() => setIsTypingPassword(true)}
                            onBlur={() => setIsTypingPassword(false)}
                            placeholder="បញ្ចូលលេខសម្គាល់និស្សិត..."
                            autoComplete="current-password"
                            disabled={loading}
                            className="w-full pl-11 pr-11 py-3 bg-white/[0.04] border border-white/10 rounded-2xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400/80 focus:bg-white/[0.08] focus:ring-4 focus:ring-cyan-500/20 transition-all backdrop-blur-md font-mono"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowStudentPassword(!showStudentPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                            tabIndex={-1}
                          >
                            <i className={`fas ${showStudentPassword ? "fa-eye-slash" : "fa-eye"} text-sm`} />
                          </button>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-4 py-3.5 rounded-2xl font-bold text-white text-base bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-[0_8px_30px_rgba(6,182,212,0.4)] hover:shadow-[0_8px_40px_rgba(6,182,212,0.6)] transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-50 relative overflow-hidden group/btn cursor-pointer font-khmer"
                      >
                        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-25deg] group-hover/btn:animate-shine pointer-events-none" />
                        
                        <div className="flex items-center justify-center gap-2">
                          {loading ? (
                            <>
                              <i className="fas fa-circle-notch fa-spin text-sm" />
                              <span>កំពុងស្វែងរក...</span>
                            </>
                          ) : (
                            <>
                              <span>ស្វែងរកលទ្ធផល</span>
                              <i className="fas fa-search text-sm transform group-hover/btn:scale-110 transition-transform" />
                            </>
                          )}
                        </div>
                      </button>
                    </form>
                  )}

                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Centered Footer */}
      <footer className="relative z-10 w-full py-5 px-4 sm:px-8 border-t border-white/[0.08] text-center text-xs text-slate-400 backdrop-blur-md font-khmer">
        <div className="max-w-7xl mx-auto flex items-center justify-center text-center">
          <div>
            <span>រក្សាសិទ្ធិគ្រប់យ៉ាងឆ្នាំ ២០២៦។ បង្កើតឡើងដោយ លោកគ្រូ ធីលាង | Telegram </span>
            <a
              href="https://t.me/LeangOCL"
              target="_blank"
              rel="noreferrer"
              className="text-blue-400 hover:text-blue-300 font-medium underline font-mono"
            >
              @LeangOCL
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
