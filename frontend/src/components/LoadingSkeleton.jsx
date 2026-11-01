import React from "react";

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-[#0b1120]/70 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm animate-pulse space-y-4 backdrop-blur-md">
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
      <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
      <div className="space-y-2">
        <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded"></div>
        <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded w-5/6"></div>
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="bg-white dark:bg-[#0b1120]/70 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden animate-pulse backdrop-blur-md">
      <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 h-12"></div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800/60 p-4 space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex justify-between items-center py-2">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
            <div className="h-4 bg-slate-100 dark:bg-slate-800/60 rounded w-1/6"></div>
            <div className="h-4 bg-slate-100 dark:bg-slate-800/60 rounded w-1/6"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/12"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
