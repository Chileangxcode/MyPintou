import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext.jsx";

export default function ThemeToggle({ className = "" }) {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleDarkMode}
      className={`relative w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none shadow-sm cursor-pointer ${
        isDarkMode
          ? "bg-slate-800/90 text-amber-400 hover:bg-slate-700/90 border border-amber-500/30 shadow-[0_0_15px_rgba(251,191,36,0.25)]"
          : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:text-blue-600"
      } ${className}`}
      title={isDarkMode ? "ប្តូរទៅ Light Mode" : "ប្តូរទៅ Dark Mode"}
      aria-label="Toggle Dark and Light Mode"
    >
      {isDarkMode ? (
        <Sun className="w-5 h-5 transition-transform duration-300 rotate-0 hover:rotate-90 text-amber-400" />
      ) : (
        <Moon className="w-5 h-5 transition-transform duration-300 -rotate-12 hover:rotate-0 text-slate-700" />
      )}
    </button>
  );
}
