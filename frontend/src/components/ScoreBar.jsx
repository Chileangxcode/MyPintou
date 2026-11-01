import React from "react";

export default function ScoreBar({ percentage }) {
  if (percentage === null || percentage === undefined || isNaN(percentage)) {
    return <span className="text-slate-400 font-mono text-xs">—</span>;
  }

  const clamped = Math.min(Math.max(percentage, 0), 100);
  let gradient = "from-blue-500 to-cyan-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]";
  let textColor = "text-blue-600 dark:text-cyan-400";

  if (clamped >= 85) {
    gradient = "from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]";
    textColor = "text-emerald-600 dark:text-emerald-400";
  } else if (clamped >= 70) {
    gradient = "from-blue-600 to-indigo-500 shadow-[0_0_10px_rgba(37,99,235,0.5)]";
    textColor = "text-blue-600 dark:text-blue-400";
  } else if (clamped >= 50) {
    gradient = "from-amber-500 to-yellow-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]";
    textColor = "text-amber-600 dark:text-amber-400";
  } else {
    gradient = "from-rose-500 to-pink-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]";
    textColor = "text-rose-600 dark:text-rose-400";
  }

  return (
    <div className="w-full max-w-[130px] flex items-center gap-2.5">
      <div className="w-full bg-slate-200/80 dark:bg-slate-800/80 rounded-full h-2 overflow-hidden p-0.5 border border-slate-300/40 dark:border-slate-700/50 backdrop-blur-sm">
        <div
          className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className={`text-xs font-mono font-bold ${textColor} w-10 text-right shrink-0`}>
        {percentage}%
      </span>
    </div>
  );
}
