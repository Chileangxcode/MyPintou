import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import RealtimeIndicator from "./RealtimeIndicator.jsx";
import ThemeToggle from "./ThemeToggle.jsx";

import { useSchool } from "../context/SchoolContext.jsx";
import BrandLogo from "./BrandLogo.jsx";

export default function Navbar() {
  const { studentSession, adminSession, logoutStudent, logoutAdmin } = useAuth();
  const { schoolInfo } = useSchool();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleStudentLogout = () => {
    logoutStudent();
    navigate("/student-lookup");
  };

  const handleAdminLogout = () => {
    logoutAdmin();
    navigate("/teacher-login");
  };

  return (
    <nav className="h-[72px] bg-white/85 dark:bg-[#0a0b10]/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 sticky top-0 z-40 no-print transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
        {/* Brand Left */}
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <BrandLogo size="md" showSubtitle={true} />
          {schoolInfo?.schoolNameKh && (
            <span className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs font-semibold text-slate-700 dark:text-slate-300 font-khmer">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span className="truncate max-w-[180px]">{schoolInfo.schoolNameKh}</span>
            </span>
          )}
        </Link>

        {/* Center Live Sync Indicator */}
        <div className="hidden lg:flex items-center">
          <RealtimeIndicator />
        </div>

        {/* Right Navigation & Controls */}
        <div className="hidden md:flex items-center gap-3 text-sm">
          <Link
            to="/"
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              location.pathname === "/"
                ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
            }`}
          >
            <i className="fas fa-home mr-1.5" />
            <span>ទំព័រដើម</span>
          </Link>

          {studentSession ? (
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-800">
              <Link
                to="/student/dashboard"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 hover:bg-blue-100/70 transition-colors text-xs font-semibold"
              >
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                  <i className="fas fa-user-graduate" />
                </div>
                <span className="max-w-[120px] truncate">{studentSession.studentName}</span>
                <span className="px-1.5 py-0.5 rounded bg-blue-200 dark:bg-blue-800 text-[10px] font-mono">
                  {studentSession.studentId}
                </span>
              </Link>
              <button
                onClick={handleStudentLogout}
                title="ចាកចេញ"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
              >
                <i className="fas fa-arrow-right-from-bracket text-xs" />
              </button>
            </div>
          ) : (
            <Link
              to="/student-lookup"
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                location.pathname === "/student-lookup"
                  ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
              }`}
            >
              <i className="fas fa-user-graduate mr-1.5" />
              <span>ស្វែងរកពិន្ទុ</span>
            </Link>
          )}

          {adminSession ? (
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-800">
              <Link
                to="/admin/dashboard"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 hover:bg-indigo-100/70 transition-colors text-xs font-semibold"
              >
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                  <i className="fas fa-shield-alt" />
                </div>
                <span>{adminSession.displayName || "Admin"}</span>
                <span className="px-1.5 py-0.5 rounded bg-indigo-200 dark:bg-indigo-900 text-[10px]">
                  {adminSession.role === "admin" ? "អ្នកគ្រប់គ្រង" : "សាស្ត្រាចារ្យ"}
                </span>
              </Link>
              <button
                onClick={handleAdminLogout}
                title="ចាកចេញ"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
              >
                <i className="fas fa-arrow-right-from-bracket text-xs" />
              </button>
            </div>
          ) : (
            <Link
              to="/teacher-login"
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                location.pathname === "/teacher-login"
                  ? "text-white bg-blue-600 shadow-[0_2px_10px_rgba(37,99,235,0.4)]"
                  : "text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <i className="fas fa-chalkboard-teacher mr-1.5 text-blue-500" />
              <span>ច្រកសាស្ត្រាចារ្យ</span>
            </Link>
          )}

          {/* Theme Switcher Toggle */}
          <div className="pl-2 border-l border-slate-200 dark:border-slate-800">
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile controls */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center cursor-pointer"
            aria-label="Toggle Menu"
          >
            <i className={`fas ${mobileMenuOpen ? "fa-times" : "fa-bars"} text-base`} />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 dark:bg-[#0b1120]/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 py-4 space-y-3 animate-fade-in-down shadow-xl">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <i className="fas fa-home text-blue-500 w-5" />
            <span>ទំព័រដើម</span>
          </Link>
          <Link
            to="/student-lookup"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <i className="fas fa-user-graduate text-blue-500 w-5" />
            <span>ស្វែងរកពិន្ទុសិស្ស</span>
          </Link>
          <Link
            to="/teacher-login"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <i className="fas fa-chalkboard-teacher text-indigo-500 w-5" />
            <span>ច្រកសាស្ត្រាចារ្យ និងបុគ្គលិក</span>
          </Link>
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-center">
            <RealtimeIndicator />
          </div>
        </div>
      )}
    </nav>
  );
}
