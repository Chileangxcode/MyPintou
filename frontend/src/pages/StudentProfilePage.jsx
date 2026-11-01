import React, { useState } from "react";
import { User, GraduationCap, Building2, BookOpen, Calendar, MapPin, ShieldCheck, CheckCircle2, QrCode, Copy, Check, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useSchool } from "../context/SchoolContext.jsx";

export default function StudentProfilePage() {
  const { studentSession } = useAuth();
  const { schoolInfo } = useSchool();
  const [copied, setCopied] = useState(false);

  if (!studentSession) return null;

  const { profile } = studentSession;
  const schoolLogo = schoolInfo?.schoolLogoUrl || "/assets/images/app_icon.svg";
  const schoolName = schoolInfo?.schoolNameKh || "សាកលវិទ្យាល័យជាតិ";

  const renderGenderKhmer = (g) => {
    if (!g) return "មិនបញ្ជាក់";
    const str = String(g).trim().toUpperCase();
    if (str === "F" || str === "FEMALE" || str.includes("ស្រី")) return "ស្រី";
    if (str === "M" || str === "MALE" || str.includes("ប្រុស")) return "ប្រុស";
    return g;
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(profile.studentId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const details = [
    { label: "លេខសម្គាល់និស្សិត", value: profile.studentId, icon: ShieldCheck, mono: true, copyable: true },
    { label: "ឈ្មោះជាភាសាខ្មែរ", value: profile.fullNameKh || profile.fullName || "—", icon: User },
    { label: "ឈ្មោះជាអក្សរឡាតាំង", value: profile.fullNameEn || "—", icon: User },
    { label: "ភេទ", value: renderGenderKhmer(profile.gender), icon: User },
    { label: "បន្ទប់ / ថ្នាក់សិក្សា", value: profile.room || "ទូទៅ", icon: MapPin },
    { label: "ជំនាញ / ឯកទេស", value: profile.skill || "វិទ្យាសាស្ត្រកុំព្យូទ័រ", icon: GraduationCap },
    { label: "មុខវិជ្ជាគោល", value: schoolInfo?.subject || profile.subject || "ការអភិវឌ្ឍន៍គេហទំព័រ", icon: BookOpen },
    { label: "គ្រឹះស្ថានសិក្សា", value: schoolName, icon: Building2 },
    { label: "មហាវិទ្យាល័យ", value: schoolInfo?.faculty || profile.faculty || "មហាវិទ្យាល័យវិទ្យាសាស្ត្រ និងវិស្វកម្ម", icon: Building2 },
    { label: "ដេប៉ាតឺម៉ង់", value: schoolInfo?.department || profile.department || "ដេប៉ាតឺម៉ង់បច្ចេកវិទ្យាព័ត៌មានវិទ្យា", icon: Building2 },
    { label: "ឆ្នាំសិក្សា", value: schoolInfo?.academicYear || profile.academicYear || "២០២៤-២០២៥", icon: Calendar },
    { label: "ឆមាស", value: schoolInfo?.semester || profile.semester || "ឆមាសទី ១", icon: Calendar },
    { label: "ស្ថានភាពសិក្សា", value: profile.status === "Regular" ? "និស្សិតពេញសិទ្ធិ" : profile.status || "សកម្ម", icon: CheckCircle2 }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-khmer tracking-tight">
            ប័ណ្ណសម្គាល់អត្តសញ្ញាណនិស្សិតឌីជីថល
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-khmer">
            ប័ណ្ណសម្គាល់អត្តសញ្ញាណនិស្សិតឌីជីថល • MyPintou (Myពិន្ទុ)
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold self-start sm:self-auto shadow-xs font-khmer">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>ទិន្នន័យបានផ្ទៀងផ្ទាត់ត្រឹមត្រូវ</span>
        </div>
      </div>

      {/* Futuristic Holographic ID Card */}
      <div className="relative p-[1.5px] rounded-[32px] bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 shadow-[0_20px_60px_rgba(6,182,212,0.25)] group">
        <div className="relative rounded-[30.5px] bg-white/95 dark:bg-[#0c1427]/95 backdrop-blur-2xl p-6 sm:p-9 space-y-8 overflow-hidden">
          {/* Background Ambient Mesh */}
          <div className="cyber-grid absolute inset-0 opacity-20 pointer-events-none" />
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none group-hover:bg-cyan-500/25 transition-all" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

          {/* Card Top National & School Seal */}
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800/80">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-600 p-0.5 shadow-[0_0_20px_rgba(6,182,212,0.4)] shrink-0">
                <div className="w-full h-full rounded-[14px] bg-[#070b14] flex items-center justify-center font-bold text-2xl text-cyan-400 font-khmer overflow-hidden">
                  <img
                    src={schoolLogo}
                    alt="School Logo"
                    className="w-full h-full object-contain p-1"
                    onError={(e) => {
                      e.currentTarget.src = "/assets/images/app_icon.svg";
                    }}
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] shadow-sm">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest font-khmer">
                  ព្រះរាជាណាចក្រកម្ពុជា • {schoolName}
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-khmer mt-0.5">
                  {profile.fullNameKh || profile.fullName}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  <span className="font-khmer text-slate-400">ឈ្មោះជាអក្សរឡាតាំង៖ </span><span className="font-semibold text-slate-700 dark:text-slate-300">{profile.fullNameEn || "—"}</span>
                </p>
              </div>
            </div>

            {/* Smart Holographic Chip & QR simulation */}
            <div className="flex items-center gap-3 self-end sm:self-center">
              <div className="w-11 h-9 rounded-lg bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 shadow-sm border border-amber-300 flex items-center justify-center p-1 relative overflow-hidden">
                <div className="w-full h-full border border-amber-600/40 rounded flex flex-col justify-between p-0.5">
                  <div className="w-full h-0.5 bg-amber-600/40" />
                  <div className="w-full h-0.5 bg-amber-600/40" />
                </div>
              </div>

              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-cyan-400">
                <QrCode className="w-7 h-7" />
              </div>
            </div>
          </div>

          {/* Academic Info Grid (Frosted Glass Tiles) */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {details.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/70 dark:border-white/[0.08] hover:border-cyan-500/40 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all duration-300 group/tile shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 text-cyan-600 dark:text-cyan-400 shrink-0 shadow-2xs group-hover/tile:scale-105 group-hover/tile:text-cyan-500 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 block leading-tight">
                        {item.label}
                      </span>
                      <span className={`text-sm font-semibold text-slate-800 dark:text-slate-200 block truncate mt-0.5 ${item.mono ? "font-mono" : ""}`}>
                        {item.value}
                      </span>
                    </div>
                  </div>

                  {item.copyable && (
                    <button
                      onClick={handleCopyId}
                      className="p-2 rounded-xl hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
                      title="ចម្លងអត្តលេខ"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Barcode Strip & Digital Security Footnote */}
          <div className="relative z-10 pt-4 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-khmer">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>ប្រព័ន្ធទិន្នន័យសុវត្ថិភាពនិស្សិតឌីជីថល</span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-khmer">
                ប័ណ្ណនេះត្រូវបានបង្កើតឡើងដោយស្វ័យប្រវត្តិតាមរយៈប្រព័ន្ធ MyPintou (Myពិន្ទុ)
              </p>
            </div>

            {/* Visual Barcode Bars */}
            <div className="flex items-center gap-1 self-start sm:self-auto opacity-70">
              <div className="w-1 h-7 bg-slate-800 dark:bg-slate-300 rounded" />
              <div className="w-0.5 h-7 bg-slate-800 dark:bg-slate-300 rounded" />
              <div className="w-1.5 h-7 bg-slate-800 dark:bg-slate-300 rounded" />
              <div className="w-0.5 h-7 bg-slate-800 dark:bg-slate-300 rounded" />
              <div className="w-2 h-7 bg-slate-800 dark:bg-slate-300 rounded" />
              <div className="w-1 h-7 bg-slate-800 dark:bg-slate-300 rounded" />
              <div className="w-0.5 h-7 bg-slate-800 dark:bg-slate-300 rounded" />
              <div className="w-1.5 h-7 bg-slate-800 dark:bg-slate-300 rounded" />
              <div className="w-1 h-7 bg-slate-800 dark:bg-slate-300 rounded" />
              <span className="text-[10px] font-mono text-slate-500 ml-2">{profile.studentId}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
