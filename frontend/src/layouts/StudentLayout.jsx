import React, { useState, useEffect } from "react";
import { Outlet, Navigate, NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { prefetchApiData } from "../api/client.js";
import MockBanner from "../components/MockBanner.jsx";
import Footer from "../components/Footer.jsx";
import RealtimeIndicator from "../components/RealtimeIndicator.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import BrandLogo from "../components/BrandLogo.jsx";
import { APP_VERSION, checkForAppUpdates } from "../version.js";
import { triggerPWAInstall } from "../utils/pwaManager.js";

export default function StudentLayout() {
  const { studentSession, isStudentAuthenticated, refreshStudentScores, logoutStudent, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [updateChecking, setUpdateChecking] = useState(false);
  const [updateStatus, setUpdateStatus] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const handleCheckUpdate = async () => {
    setUpdateChecking(true);
    setUpdateStatus("កំពុងពិនិត្យ...");
    try {
      const res = await checkForAppUpdates();
      if (res.hasUpdate) {
        setUpdateStatus(`មានកំណែថ្មី v${res.latestVersion}!`);
      } else {
        setUpdateStatus("កំណែចុងក្រោយបង្អស់");
      }
    } catch (_) {
      setUpdateStatus("មិនអាចពិនិត្យបាន");
    } finally {
      setUpdateChecking(false);
      setTimeout(() => setUpdateStatus(""), 4000);
    }
  };

  // Background non-blocking prefetch of student library, scores, and profile for instant navigation
  useEffect(() => {
    if (isStudentAuthenticated && studentSession?.studentId) {
      const timer = setTimeout(() => {
        prefetchApiData("student_scores", {
          studentId: studentSession.studentId,
          studentName: studentSession.fullName || ""
        });
        prefetchApiData("student_profile", {
          studentId: studentSession.studentId,
          studentName: studentSession.fullName || ""
        });
        prefetchApiData("health", { refresh: "false" });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isStudentAuthenticated, studentSession?.studentId, studentSession?.fullName]);

  if (!isStudentAuthenticated || !studentSession) {
    return <Navigate to="/student-lookup" replace />;
  }

  const handleLogout = () => {
    logoutStudent();
    navigate("/student-lookup");
  };

  const getPageTitle = () => {
    if (location.pathname.includes("/library")) return "បណ្ណាល័យឌីជីថល (Course E-Library)";
    if (location.pathname.includes("/quizzes")) return "សំណួរ និងកិច្ចការស្រាវជ្រាវ (Quizzes & Tasks)";
    if (location.pathname.includes("/profile")) return "ប្រវត្តិរូបនិស្សិត";
    if (location.pathname.includes("/print")) return "លិខិតបញ្ជាក់លទ្ធផលសិក្សា";
    return "ផ្ទាំងគ្រប់គ្រងពិន្ទុ";
  };

  const navItems = [
    {
      name: "ផ្ទាំងគ្រប់គ្រងពិន្ទុ",
      shortName: "ពិន្ទុ",
      to: "/student/dashboard",
      iconClass: "fas fa-chart-line"
    },
    {
      name: "សំណួរ និងកិច្ចការ",
      shortName: "កិច្ចការ",
      to: "/student/quizzes",
      iconClass: "fas fa-list-check"
    },
    {
      name: "បណ្ណាល័យឌីជីថល",
      shortName: "បណ្ណាល័យ",
      to: "/student/library",
      iconClass: "fas fa-book-open"
    },
    {
      name: "ប្រវត្តិរូបនិស្សិត",
      shortName: "ប្រវត្តិរូប",
      to: "/student/profile",
      iconClass: "fas fa-id-card"
    },
    {
      name: "លិខិតបញ្ជាក់លទ្ធផល",
      shortName: "ព្រីនលទ្ធផល",
      to: "/student/print",
      iconClass: "fas fa-print"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0B0F19] text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <div className="flex flex-1">
        {/* Desktop Sidebar - Fixed to viewport */}
        <aside
          id="student-sidebar"
          className="hidden md:flex flex-col w-[260px] fixed top-0 left-0 bottom-0 z-30 bg-[#070b14] border-r border-slate-800/80 no-print text-slate-300 shadow-[4px_0_30px_rgba(0,0,0,0.5)] font-khmer"
        >
          {/* Header with MyPintou Logo */}
          <div className="px-5 py-5 flex items-center justify-between shrink-0 border-b border-slate-800/80 bg-slate-900/60 relative group">
            <div className="flex flex-col">
              <BrandLogo size="sm" showSubtitle={false} />
              <div className="flex items-center mt-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide flex items-center bg-blue-500/15 text-blue-400 border border-blue-500/30">
                  <i className="fas fa-user-graduate text-[9px] mr-1 text-blue-400" />
                  <span>និស្សិត</span>
                </span>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-60" />
          </div>

          {/* Student Identity Card in Sidebar (Holographic Card) */}
          <div className="p-4 m-3.5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-800/60 border border-blue-500/20 shadow-[0_4px_20px_rgba(0,0,0,0.3)] space-y-2 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-blue-500/10 blur-xl pointer-events-none group-hover:bg-blue-500/20 transition-all" />
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span className="text-blue-400 font-bold tracking-wider font-khmer">ប័ណ្ណសម្គាល់និស្សិត</span>
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(37,99,235,0.8)]" />
            </div>
            <div className="text-sm font-bold text-white truncate font-khmer">
              {studentSession.studentName}
            </div>
            <div className="text-xs text-blue-400 font-mono font-semibold flex items-center gap-1.5">
              <span>អត្តលេខ៖</span>
              <span className="bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">{studentSession.studentId}</span>
            </div>
            <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <span>បន្ទប់៖ {studentSession.profile?.room || "ទូទៅ"}</span>
              <span className="text-slate-400 truncate max-w-[90px]">{studentSession.profile?.skill || "ព័ត៌មានវិទ្យា"}</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-3 py-2 space-y-1.5">
            <div className="px-3 pb-1 pt-1 flex items-center space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(37,99,235,0.8)]" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-khmer">
                ច្រកកិច្ចការសិក្សា
              </p>
            </div>

            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-left text-[13px] font-khmer transition-all duration-300 group ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600/25 via-blue-500/15 to-transparent text-white font-bold border-l-4 border-blue-500 shadow-[inset_2px_0_12px_rgba(37,99,235,0.25)]"
                      : "hover:bg-slate-800/60 text-slate-400 hover:text-white font-medium border-l-4 border-transparent hover:translate-x-1"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-all ${
                        isActive
                          ? "bg-blue-600/20 text-blue-400 drop-shadow-[0_0_8px_rgba(37,99,235,0.6)] scale-110"
                          : "bg-transparent text-slate-400 group-hover:text-blue-400"
                      }`}
                    >
                      <i className={item.iconClass} />
                    </div>
                    <span className="truncate font-khmer">{item.name}</span>
                  </>
                )}
              </NavLink>
            ))}

            <div className="pt-3 px-1">
              <button
                type="button"
                onClick={() => refreshStudentScores()}
                disabled={loading}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800 border border-slate-700/60 hover:border-blue-500/40 transition-all cursor-pointer disabled:opacity-50 group font-khmer"
              >
                <span className="flex items-center gap-2">
                  <i className={`fas fa-rotate ${loading ? "fa-spin text-blue-400" : "text-blue-400 group-hover:rotate-180 transition-transform duration-500"}`} />
                  <span>ធ្វើបច្ចុប្បន្នភាពទិន្នន័យ</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Sync</span>
              </button>
            </div>
          </nav>

          {/* Bottom Sidebar Controls & Version */}
          <div className="p-3.5 border-t border-slate-800/80 mt-auto bg-slate-900/50 backdrop-blur-md space-y-2 shrink-0">
            <div className="px-1 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5 font-bold text-slate-300">
                <i className="fas fa-code-branch text-[9px] text-blue-400" />
                <span>v{APP_VERSION}</span>
              </span>
              <button
                type="button"
                onClick={handleCheckUpdate}
                disabled={updateChecking}
                className="text-[10px] text-blue-400 hover:text-blue-300 hover:underline cursor-pointer disabled:opacity-50"
              >
                {updateChecking ? "កំពុងពិនិត្យ..." : "ពិនិត្យកំណែថ្មី"}
              </button>
            </div>
            {updateStatus && (
              <div className="text-[10px] text-blue-400 font-khmer text-center px-1 animate-fade-in">
                {updateStatus}
              </div>
            )}

            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3.5 py-2.5 hover:bg-rose-500/15 text-slate-400 hover:text-rose-400 rounded-xl transition-all duration-200 text-xs font-semibold group cursor-pointer border-l-4 border-transparent hover:border-rose-500/60 font-khmer min-h-[44px]"
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm group-hover:scale-110 transition-transform">
                <i className="fas fa-right-from-bracket" />
              </div>
              <span>ចាកចេញ</span>
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0 md:pl-[260px]">
          <MockBanner />
          {/* Header with Safe Area Top */}
          <header className="min-h-[72px] pt-[env(safe-area-inset-top,0px)] bg-white/85 dark:bg-[#070b14]/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20 transition-colors duration-300 no-print">
            <div className="flex items-center space-x-3 py-2">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Toggle Sidebar"
              >
                <i className="fas fa-bars text-lg" />
              </button>

              <div>
                <h1 className="text-base sm:text-lg md:text-xl font-bold text-slate-800 dark:text-white font-khmer leading-tight">
                  {getPageTitle()}
                </h1>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block font-khmer">
                  MyPintou (Myពិន្ទុ) • ច្រកពិនិត្យលទ្ធផលសិក្សានិស្សិត
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 py-2">
              <div className="hidden sm:flex">
                <RealtimeIndicator onRefresh={refreshStudentScores} loading={loading} />
              </div>

              <ThemeToggle />

              <div className="flex items-center space-x-2.5 pl-2 sm:pl-3 border-l border-slate-200 dark:border-slate-800">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-[0_0_12px_rgba(37,99,235,0.4)] ring-2 ring-blue-500/20 shrink-0">
                  <i className="fas fa-user-graduate text-xs" />
                </div>

                <div className="hidden lg:block text-left">
                  <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight max-w-[130px] truncate">
                    {studentSession.studentName}
                  </p>
                  <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 mt-0.5">
                    {studentSession.studentId}
                  </span>
                </div>

                {/* PWA App Install Button (Near Logout) */}
                <button
                  type="button"
                  onClick={triggerPWAInstall}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-600 dark:text-blue-400 text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer min-h-[44px]"
                  title="ដំឡើងលើទូរស័ព្ទ (Install Mobile App)"
                >
                  <i className="fas fa-download text-xs text-blue-500" />
                  <span className="font-khmer hidden sm:inline text-[11px]">ដំឡើងលើទូរស័ព្ទ</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-9 h-9 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center justify-center transition-all cursor-pointer min-h-[44px] min-w-[44px]"
                  title="ចាកចេញ"
                >
                  <i className="fas fa-right-from-bracket text-sm" />
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 pb-24 md:pb-8">
            <Outlet />
          </main>

          <Footer />
        </div>
      </div>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex no-print">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative w-[280px] bg-[#0b1120] text-slate-200 h-full flex flex-col z-10 shadow-2xl p-4 pt-[max(1rem,env(safe-area-inset-top,0px))] pb-[max(1rem,env(safe-area-inset-bottom,0px))] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <BrandLogo size="xs" showSubtitle={false} />
              <button
                onClick={() => setSidebarOpen(false)}
                className="w-10 h-10 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center cursor-pointer min-h-[44px] min-w-[44px]"
                aria-label="Close Sidebar"
              >
                <i className="fas fa-times text-lg" />
              </button>
            </div>

            <nav className="flex-1 space-y-2 overflow-y-auto mobile-scroll">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold min-h-[44px] font-khmer ${
                      isActive
                        ? "bg-blue-600 text-white shadow-md font-bold"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    }`
                  }
                >
                  <i className={`${item.iconClass} text-sm w-5 text-center`} />
                  <span className="font-khmer">{item.name}</span>
                </NavLink>
              ))}
            </nav>

            <div className="pt-3 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between px-2 text-[11px] font-mono text-slate-400">
                <span>Version {APP_VERSION}</span>
                <button
                  type="button"
                  onClick={handleCheckUpdate}
                  className="text-blue-400 underline font-khmer text-[10px]"
                >
                  ពិនិត្យកំណែថ្មី
                </button>
              </div>

              {/* Install PWA Button in Mobile Drawer */}
              <button
                type="button"
                onClick={() => {
                  setSidebarOpen(false);
                  triggerPWAInstall();
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 font-bold text-xs min-h-[44px] cursor-pointer"
              >
                <i className="fas fa-download text-xs" />
                <span>ដំឡើងលើទូរស័ព្ទ</span>
              </button>

              <button
                onClick={() => {
                  setSidebarOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 font-medium min-h-[44px]"
              >
                <i className="fas fa-right-from-bracket" />
                <span>ចាកចេញពីប្រព័ន្ធ</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar with Safe Area Support */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/98 dark:bg-[#0c1427]/98 backdrop-blur-2xl border-t border-slate-200/90 dark:border-white/10 px-2 pt-2 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] no-print font-khmer mobile-bottom-nav"
      >
        <div className="flex items-center justify-around max-w-md mx-auto">
          {navItems.slice(0, 4).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-1 rounded-xl text-[10px] min-h-[44px] min-w-[54px] flex-1 transition-all ${
                  isActive
                    ? "text-blue-600 dark:text-blue-400 font-extrabold scale-105"
                    : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`
              }
            >
              <i className={`${item.iconClass} text-base`} />
              <span className="mt-1 font-khmer font-bold text-[10px] leading-snug text-center whitespace-nowrap">
                {item.shortName || item.name}
              </span>
            </NavLink>
          ))}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex flex-col items-center justify-center py-1 px-1 rounded-xl text-[10px] min-h-[44px] min-w-[54px] flex-1 text-slate-400 dark:text-slate-500 hover:text-blue-500 cursor-pointer transition-all active:scale-95"
            title="ម៉ឺនុយបន្ថែម"
          >
            <i className="fas fa-bars text-base" />
            <span className="mt-1 font-khmer font-bold text-[10px] leading-snug text-center whitespace-nowrap">
              ម៉ឺនុយ
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
}
