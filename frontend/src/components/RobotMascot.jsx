import React from "react";

export default function RobotMascot({ status = "idle", isShy = false }) {
  // status: "idle" | "error" | "success"
  return (
    <div className="relative w-24 h-24 mx-auto select-none pointer-events-none">
      {/* Outer ambient glow */}
      <div
        className={`absolute inset-0 rounded-full blur-xl transition-all duration-500 ${
          status === "error"
            ? "bg-rose-500/40"
            : status === "success"
            ? "bg-emerald-500/40"
            : "bg-sky-500/30"
        }`}
      />

      {/* Robot Circle Container */}
      <div className="relative w-24 h-24 rounded-full bg-gradient-to-b from-slate-700/80 to-slate-900/90 border-2 border-slate-600/50 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-md flex items-center justify-center overflow-hidden transition-transform duration-300 transform hover:scale-105">
        <svg
          viewBox="0 0 100 100"
          className="w-20 h-20 transition-all duration-300"
        >
          {/* Antenna */}
          <line
            x1="50"
            y1="22"
            x2="50"
            y2="10"
            stroke="#94a3b8"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle
            cx="50"
            cy="8"
            r="5"
            fill={status === "error" ? "#ef4444" : status === "success" ? "#10b981" : "#38bdf8"}
            className="animate-pulse"
          />

          {/* Ears */}
          <rect x="12" y="42" width="8" height="20" rx="3" fill="#475569" />
          <rect x="80" y="42" width="8" height="20" rx="3" fill="#475569" />

          {/* Head Body */}
          <rect
            x="18"
            y="22"
            width="64"
            height="58"
            rx="16"
            fill="#1e293b"
            stroke="#334155"
            strokeWidth="1.5"
          />

          {/* Screen Face */}
          <rect x="25" y="32" width="50" height="40" rx="9" fill="#0f172a" />

          {/* Face Expressions */}
          {status === "error" ? (
            /* Error Face: Angled red lines & flat mouth */
            <g className="transition-all duration-200">
              <line
                x1="32"
                y1="46"
                x2="42"
                y2="46"
                stroke="#ef4444"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <line
                x1="58"
                y1="46"
                x2="68"
                y2="46"
                stroke="#ef4444"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <line
                x1="42"
                y1="62"
                x2="58"
                y2="62"
                stroke="#ef4444"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </g>
          ) : status === "success" ? (
            /* Success Face: Big green happy eyes & mouth */
            <g className="transition-all duration-200">
              <circle cx="36" cy="46" r="6.5" fill="#10b981" />
              <circle cx="64" cy="46" r="6.5" fill="#10b981" />
              <circle cx="50" cy="61" r="5" fill="#10b981" />
            </g>
          ) : isShy ? (
            /* Shy / Password typing face */
            <g className="transition-all duration-200">
              <path
                d="M 32 46 Q 37 40 42 46"
                stroke="#38bdf8"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 58 46 Q 63 40 68 46"
                stroke="#38bdf8"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="50" cy="60" r="3.5" fill="#38bdf8" />
            </g>
          ) : (
            /* Normal Happy Idle Face */
            <g className="transition-all duration-200">
              <circle cx="36" cy="46" r="5" fill="#38bdf8" />
              <circle cx="64" cy="46" r="5" fill="#38bdf8" />
              <path
                d="M 38 60 Q 50 68 62 60"
                stroke="#38bdf8"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="transparent"
              />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
