import React, { useState, useEffect } from "react";
import { Outlet, Navigate, NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { prefetchApiData } from "../api/client.js";
import MockBanner from "../components/MockBanner.jsx";
import Footer from "../components/Footer.jsx";
import RealtimeIndicator from "../components/RealtimeIndicator.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import BrandLogo from "../components/BrandLogo.jsx";
import ErrorBoundary from "../components/ErrorBoundary.jsx";
import { APP_VERSION, checkForAppUpdates } from "../version.js";
import { triggerPWAInstall } from "../utils/pwaManager.js";

export default function AdminLayout() {
  const { adminSession, isAdminAuthenticated, logoutAdmin } = useAuth();
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
        setUpdateStatus("អ្នកកំពុងប្រើកំណែចុងក្រោយបង្អស់");
      }
    } catch (_) {
      setUpdateStatus("មិនអាចពិនិត្យបាន");
    } finally {
      setUpdateChecking(false);
      setTimeout(() => setUpdateStatus(""), 4000);
    }
  };

  // Background non-blocking prefetch of core datasets for 10x faster navigation
  useEffect(() => {
    if (isAdminAuthenticated) {
      const token = adminSession?.token || "MyPintou#Sec2026$X9z";
      const timer = setTimeout(() => {
        prefetchApiData("admin_stats", { token });
        prefetchApiData("admin_scoring_overview", { token });
        prefetchApiData("admin_quizzes", { token });
        prefetchApiData("admin_students", { token, pageSize: "1000" });
        prefetchApiData("get_users", { token, pageSize: "1000" });
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [isAdminAuthenticated, adminSession?.token]);

  if (!isAdminAuthenticated || !adminSession) {
    return <Navigate to="/teacher-login" replace />;
  }

  const handleLogout = () => {
    logoutAdmin();
    navigate("/teacher-login");
  };

  const getPageTitle = () => {
    if (location.pathname.includes("/students")) return "បញ្ជីរាយនាមនិស្សិត";
    if (location.pathname.includes("/scoring")) return "តារាងពិន្ទុ និងការវាយតម្លៃ";
    if (location.pathname.includes("/quizzes")) return "គ្រប់គ្រងកម្រងសំណួរ (Student Quizzes)";
    if (location.pathname.includes("/honors")) return "តារាងនិស្សិតឆ្នើម (Dean's Honors List)";
    if (location.pathname.includes("/library")) return "បណ្ណាល័យឌីជីថល (Course E-Library)";
    if (location.pathname.includes("/race-game")) return "ល្បែងប្រណាំងជ្រើសរើសសិស្ស (Student Picker Race Game)";
    if (location.pathname.includes("/wheel")) return "កង់បង្វិលជ្រើសរើសឈ្មោះ (Wheel of Fortune)";
    if (location.pathname.includes("/groups")) return "បែងចែកក្រុមសិស្ស & រើសប្រធាន (Group Maker)";
    if (location.pathname.includes("/picker")) return "កង់បង្វិល & ហ្គេមក្នុងថ្នាក់ (Classroom Games & Picker)";
    if (location.pathname.includes("/announcements")) return "សេចក្តីជូនដំណឹង និងការប្រកាស";
    if (location.pathname.includes("/reports")) return "បោះពុម្ពព្រឹត្តិបត្រពិន្ទុ & Export";
    if (location.pathname.includes("/certificates")) return "វិញ្ញាបនបត្រ & លិខិតសរសើរ";
    if (location.pathname.includes("/users")) return "គ្រប់គ្រងគណនីចូលប្រព័ន្ធ (User Logins)";
    if (location.pathname.includes("/settings")) return "ការកំណត់ប្រព័ន្ធ";
    return "ផ្ទាំងគ្រប់គ្រងទូទៅ";
  };

  const navSections = [
    {
      group: "ទូទៅ",
      color: "bg-blue-500",
      items: [
        {
          name: "ផ្ទាំងគ្រប់គ្រងទូទៅ",
          to: "/admin/dashboard",
          iconClass: "fas fa-chart-pie",
          colorClass: "text-blue-400 group-hover:text-blue-300"
        },
        {
          name: "សេចក្តីជូនដំណឹង",
          to: "/admin/announcements",
          iconClass: "fas fa-bullhorn",
          colorClass: "text-cyan-400 group-hover:text-cyan-300"
        }
      ]
    },
    {
      group: "ផ្នែកនិស្សិត",
      color: "bg-indigo-500",
      items: [
        {
          name: "បញ្ជីរាយនាមនិស្សិត",
          to: "/admin/students",
          iconClass: "fas fa-user-graduate",
          colorClass: "text-indigo-400 group-hover:text-indigo-300"
        }
      ]
    },
    {
      group: "ពិន្ទុ និងការវាយតម្លៃ",
      color: "bg-emerald-500",
      items: [
        {
          name: "តារាងពិន្ទុរួម",
          to: "/admin/scoring",
          iconClass: "fas fa-award",
          colorClass: "text-emerald-400 group-hover:text-emerald-300"
        },
        {
          name: "កម្រងសំណួរ (Quizzes)",
          to: "/admin/quizzes",
          iconClass: "fas fa-tasks",
          colorClass: "text-cyan-400 group-hover:text-cyan-300"
        },
        {
          name: "តារាងនិស្សិតឆ្នើម (Honors)",
          to: "/admin/honors",
          iconClass: "fas fa-trophy",
          colorClass: "text-amber-400 group-hover:text-amber-300"
        },
        {
          name: "របាយការណ៍ & Export",
          to: "/admin/reports",
          iconClass: "fas fa-file-export",
          colorClass: "text-teal-400 group-hover:text-teal-300"
        },
        {
          name: "វិញ្ញាបនបត្រឌីជីថល",
          to: "/admin/certificates",
          iconClass: "fas fa-certificate",
          colorClass: "text-amber-400 group-hover:text-amber-300"
        }
      ]
    },
    {
      group: "ធនធានសិក្សា & បណ្ណាល័យ",
      color: "bg-cyan-500",
      items: [
        {
          name: "បណ្ណាល័យឌីជីថល (E-Library)",
          to: "/admin/library",
          iconClass: "fas fa-book-open",
          colorClass: "text-cyan-400 group-hover:text-cyan-300"
        }
      ]
    },
    {
      group: "សកម្មភាព & ហ្គេមក្នុងថ្នាក់",
      color: "bg-fuchsia-500",
      items: [
        {
          name: "ល្បែងប្រណាំងជ្រើសរើសសិស្ស",
          to: "/admin/race-game",
          iconClass: "fas fa-flag-checkered",
          colorClass: "text-amber-400 group-hover:text-amber-300"
        },
        {
          name: "កង់បង្វិលជ្រើសរើសឈ្មោះ",
          to: "/admin/wheel",
          iconClass: "fas fa-circle-notch",
          colorClass: "text-fuchsia-400 group-hover:text-fuchsia-300"
        },
        {
          name: "បែងចែកក្រុម & រើសប្រធាន",
          to: "/admin/groups",
          iconClass: "fas fa-users",
          colorClass: "text-emerald-400 group-hover:text-emerald-300"
        }
      ]
    },
    {
      group: "គណនី & សុវត្ថិភាព",
      color: "bg-rose-500",
      items: [
        {
          name: "គ្រប់គ្រងគណនី (Users)",
          to: "/admin/users",
          iconClass: "fas fa-user-shield",
          colorClass: "text-rose-400 group-hover:text-rose-300"
        }
      ]
    },
    {
      group: "ការកំណត់ប្រព័ន្ធ",
      color: "bg-purple-500",
      items: [
        {
          name: "ការកំណត់ប្រព័ន្ធ",
          to: "/admin/settings",
          iconClass: "fas fa-sliders",
          colorClass: "text-purple-400 group-hover:text-purple-300"
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0B0F19] text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <div className="flex flex-1">
        {/* Desktop Sidebar - Fixed to viewport */}
        <aside
          id="sidebar"
          className="hidden md:flex flex-col w-[260px] fixed top-0 left-0 bottom-0 z-30 bg-[#070b14] border-r border-slate-800/80 no-print text-slate-300 shadow-[4px_0_30px_rgba(0,0,0,0.5)] font-khmer"
        >
          {/* Sidebar Header with MyPintou Logo */}
          <div className="px-5 py-5 flex items-center justify-between shrink-0 border-b border-slate-800/80 bg-slate-900/60 relative group">
            <div className="flex flex-col">
              <BrandLogo size="sm" showSubtitle={false} />
              <div className="flex items-center mt-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-khmer tracking-wide flex items-center bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                  <i className="fas fa-shield-alt text-[9px] mr-1 text-cyan-400" />
                  <span>{adminSession?.role === "admin" ? "អ្នកគ្រប់គ្រងកំពូល" : "សាស្ត្រាចារ្យ"}</span>
                </span>
              </div>
            </div>

            {/* Glowing divider line */}
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto mobile-scroll font-khmer">
            {navSections.map((sec, idx) => (
              <div key={idx} className="space-y-1">
                <div className="px-3 pb-1 pt-1 flex items-center space-x-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${sec.color} shadow-[0_0_6px_rgba(6,182,212,0.8)]`} />
                  <p className="text-[11px] font-bold text-slate-400 tracking-wide font-khmer">
                    {sec.group}
                  </p>
                </div>

                {sec.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-left text-[13px] font-khmer transition-all duration-300 group ${
                        isActive
                          ? "bg-gradient-to-r from-cyan-500/20 via-blue-600/15 to-transparent text-white font-bold border-l-4 border-cyan-400 shadow-[inset_2px_0_12px_rgba(6,182,212,0.25)]"
                          : "hover:bg-slate-800/60 text-slate-400 hover:text-white font-medium border-l-4 border-transparent hover:translate-x-1"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-all ${
                            isActive
                              ? "bg-cyan-500/20 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)] scale-110"
                              : "bg-transparent text-slate-400 group-hover:text-cyan-400"
                          }`}
                        >
                          <i className={item.iconClass} />
                        </div>
                        <span className="truncate font-khmer">{item.name}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            ))}

            {/* Quick Student Link */}
            <div className="pt-2 px-1">
              <Link
                to="/student-lookup"
                target="_blank"
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800 border border-slate-700/60 hover:border-cyan-500/40 transition-all group font-khmer"
              >
                <span className="flex items-center gap-2">
                  <i className="fas fa-external-link-alt text-[10px] text-cyan-400 group-hover:scale-110 transition-transform" />
                  <span>បើកផ្ទាំងនិស្សិត</span>
                </span>
                <i className="fas fa-arrow-right text-[10px] text-slate-500 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </nav>

          {/* Bottom Sidebar Controls & Version */}
          <div className="p-3.5 border-t border-slate-800/80 mt-auto bg-slate-900/50 backdrop-blur-md space-y-2 shrink-0">
            {/* Version & Update Check */}
            <div className="px-1 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5 font-bold text-slate-300">
                <i className="fas fa-code-branch text-[9px] text-cyan-400" />
                <span>v{APP_VERSION}</span>
              </span>
              <button
                type="button"
                onClick={handleCheckUpdate}
                disabled={updateChecking}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer disabled:opacity-50"
              >
                {updateChecking ? "កំពុងពិនិត្យ..." : "ពិនិត្យកំណែថ្មី"}
              </button>
            </div>
            {updateStatus && (
              <div className="text-[10px] text-cyan-400 font-khmer text-center px-1 animate-fade-in">
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

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 md:pl-[260px]">
          <MockBanner />
          {/* Sticky Top Header with Safe Area */}
          <header className="min-h-[72px] pt-[env(safe-area-inset-top,0px)] bg-white/85 dark:bg-[#070b14]/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20 transition-colors duration-300 no-print">
            {/* Left Title & Mobile Menu Toggle */}
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
                  ប្រព័ន្ធតាមដានលទ្ធផលសិក្សា និងពិន្ទុឆ្លាតវៃ • MyPintou (Myពិន្ទុ)
                </p>
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center space-x-3 py-2">
              {/* Realtime Live Sync Indicator */}
              <div className="hidden sm:flex">
                <RealtimeIndicator />
              </div>

              {/* Theme Toggle Button */}
              <ThemeToggle />

              {/* User Profile Pill */}
              <div className="flex items-center space-x-2.5 pl-2 sm:pl-3 border-l border-slate-200 dark:border-slate-800">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-[0_0_12px_rgba(6,182,212,0.4)] ring-2 ring-cyan-500/20 shrink-0">
                  <i className="fas fa-user-shield text-xs" />
                </div>

                <div className="hidden lg:block text-left">
                  <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight">
                    {adminSession.displayName || "អ្នកគ្រប់គ្រង"}
                  </p>
                  <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-mono font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/60 mt-0.5">
                    <i className="fas fa-circle text-[6px] mr-1 text-emerald-400 animate-pulse" />
                    @{adminSession.username}
                  </span>
                </div>

                {/* PWA App Install Button (Near Logout) */}
                <button
                  type="button"
                  onClick={triggerPWAInstall}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer min-h-[44px]"
                  title="ដំឡើងលើទូរស័ព្ទ (Install Mobile App)"
                >
                  <i className="fas fa-download text-xs text-cyan-500" />
                  <span className="font-khmer hidden sm:inline text-[11px]">ដំឡើងលើទូរស័ព្ទ</span>
                </button>

                {/* Quick Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-9 h-9 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center justify-center transition-all cursor-pointer min-h-[44px] min-w-[44px]"
                  title="ចាកចេញពីប្រព័ន្ធ"
                >
                  <i className="fas fa-right-from-bracket text-sm" />
                </button>
              </div>
            </div>
          </header>

          {/* Page Body with Safe Bottom Padding */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 pb-24 md:pb-8">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </main>

          <Footer />
        </div>
      </div>

      {/* Mobile Drawer with Safe Area Top & Bottom */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex no-print">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative w-[280px] bg-[#0b1120] text-slate-200 h-full flex flex-col z-10 shadow-2xl p-4 pt-[max(1rem,env(safe-area-inset-top,0px))] pb-[max(1rem,env(safe-area-inset-bottom,0px))] space-y-4 font-khmer">
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

            <nav className="flex-1 space-y-4 overflow-y-auto mobile-scroll font-khmer">
              {navSections.map((sec, idx) => (
                <div key={idx} className="space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 tracking-wide px-2 font-khmer">
                    {sec.group}
                  </p>
                  {sec.items.map((item) => (
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
                </div>
              ))}
            </nav>

            <div className="pt-3 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between px-2 text-[11px] font-mono text-slate-400">
                <span>Version {APP_VERSION}</span>
                <button
                  type="button"
                  onClick={handleCheckUpdate}
                  className="text-cyan-400 underline font-khmer text-[10px]"
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
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400 font-bold text-xs min-h-[44px] cursor-pointer"
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

      {/* Mobile Bottom Navigation with Safe Area Support */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/98 dark:bg-[#0c1427]/98 backdrop-blur-2xl border-t border-slate-200/90 dark:border-white/10 px-2 pt-2 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] no-print font-khmer mobile-bottom-nav"
      >
        <div className="flex items-center justify-around max-w-md mx-auto">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-1 rounded-xl text-[10px] min-h-[44px] min-w-[54px] flex-1 transition-all ${
                isActive
                  ? "text-blue-600 dark:text-blue-400 font-extrabold scale-105"
                  : "text-slate-400 dark:text-slate-500"
              }`
            }
          >
            <i className="fas fa-chart-pie text-base" />
            <span className="mt-1 font-khmer font-bold text-[10px] leading-snug text-center whitespace-nowrap">ទិដ្ឋភាព</span>
          </NavLink>

          <NavLink
            to="/admin/students"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-1 rounded-xl text-[10px] min-h-[44px] min-w-[54px] flex-1 transition-all ${
                isActive
                  ? "text-blue-600 dark:text-blue-400 font-extrabold scale-105"
                  : "text-slate-400 dark:text-slate-500"
              }`
            }
          >
            <i className="fas fa-user-graduate text-base" />
            <span className="mt-1 font-khmer font-bold text-[10px] leading-snug text-center whitespace-nowrap">សិស្ស</span>
          </NavLink>

          <NavLink
            to="/admin/scoring"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-1 rounded-xl text-[10px] min-h-[44px] min-w-[54px] flex-1 transition-all ${
                isActive
                  ? "text-blue-600 dark:text-blue-400 font-extrabold scale-105"
                  : "text-slate-400 dark:text-slate-500"
              }`
            }
          >
            <i className="fas fa-award text-base" />
            <span className="mt-1 font-khmer font-bold text-[10px] leading-snug text-center whitespace-nowrap">ពិន្ទុ</span>
          </NavLink>

          <NavLink
            to="/admin/quizzes"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-1 rounded-xl text-[10px] min-h-[44px] min-w-[54px] flex-1 transition-all ${
                isActive
                  ? "text-blue-600 dark:text-blue-400 font-extrabold scale-105"
                  : "text-slate-400 dark:text-slate-500"
              }`
            }
          >
            <i className="fas fa-tasks text-base" />
            <span className="mt-1 font-khmer font-bold text-[10px] leading-snug text-center whitespace-nowrap">កិច្ចការ</span>
          </NavLink>

          <button
            onClick={() => setSidebarOpen(true)}
            className="flex flex-col items-center justify-center py-1 px-1 rounded-xl text-[10px] min-h-[44px] min-w-[54px] flex-1 text-slate-400 dark:text-slate-500 hover:text-blue-500 cursor-pointer"
          >
            <i className="fas fa-bars text-base" />
            <span className="mt-1 font-khmer font-bold text-[10px] leading-snug text-center whitespace-nowrap">ម៉ឺនុយ</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
