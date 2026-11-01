import React from "react";

export default function StatusBadge({ status, size = "md" }) {
  if (!status) return <span className="text-slate-400 font-mono text-xs">—</span>;

  let baseStyle = "border backdrop-blur-md transition-all duration-300 font-semibold tracking-wide inline-flex items-center gap-1.5 font-khmer";
  let dotColor = "bg-slate-400";
  let bg = "bg-slate-100/80 text-slate-700 border-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700/80";
  let label = String(status).trim();
  const raw = label.toUpperCase();

  // 1. Exact Letter Grades based on University Grading Policy
  if (raw === "A") {
    bg = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 dark:border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]";
    dotColor = "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]";
    label = "A (ល្អប្រសើរ)";
  } else if (raw === "B+") {
    bg = "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/30 dark:border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]";
    dotColor = "bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.7)]";
    label = "B+ (ល្អណាស់)";
  } else if (raw === "B") {
    bg = "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30 dark:border-blue-500/40 shadow-[0_0_12px_rgba(59,130,246,0.2)]";
    dotColor = "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.7)]";
    label = "B (ល្អ)";
  } else if (raw === "C+") {
    bg = "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/30 dark:border-teal-500/40 shadow-[0_0_12px_rgba(20,184,166,0.2)]";
    dotColor = "bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.7)]";
    label = "C+ (ល្អបង្គួរ)";
  } else if (raw === "C") {
    bg = "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 dark:border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]";
    dotColor = "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.7)]";
    label = "C (មធ្យម)";
  } else if (raw === "D") {
    bg = "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/30 dark:border-orange-500/40 shadow-[0_0_12px_rgba(249,115,22,0.2)]";
    dotColor = "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.7)]";
    label = "D (ខ្សោយ)";
  } else if (raw === "E") {
    bg = "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30 dark:border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.2)]";
    dotColor = "bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.7)]";
    label = "E (ខ្សោយណាស់)";
  } else if (raw === "F") {
    bg = "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30 dark:border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.2)]";
    dotColor = "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)]";
    label = "F (ធ្លាក់)";
  } else if (raw.includes("PASS") || raw.includes("ជាប់")) {
    bg = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 dark:border-emerald-500/40";
    dotColor = "bg-emerald-500";
    label = "ជាប់";
  } else if (raw.includes("FAIL") || raw.includes("ធ្លាក់")) {
    bg = "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30 dark:border-rose-500/40";
    dotColor = "bg-rose-500";
    label = "ធ្លាក់";
  } else if (raw.includes("ACTIVE") || raw.includes("សកម្ម")) {
    bg = "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30 dark:border-indigo-500/40";
    dotColor = "bg-indigo-500";
    label = "សកម្ម";
  }

  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-[10px] rounded-lg" : "px-2.5 py-1 text-xs rounded-xl";

  return (
    <span className={`${baseStyle} ${sizeClasses} ${bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{label}</span>
    </span>
  );
}
