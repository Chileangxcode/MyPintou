import React, { useState, useRef } from "react";
import {
  Download,
  Share2,
  X,
  Sparkles,
  Trophy,
  Award,
  CheckCircle2,
  QrCode,
  Flame,
  Send,
  Copy,
  Check
} from "lucide-react";
import html2canvas from "html2canvas-pro";

export default function SocialShareModal({ isOpen, onClose, studentSession, schoolInfo }) {
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef(null);

  if (!isOpen || !studentSession) return null;

  const { profile, academicSummary } = studentSession;
  const schoolLogo = schoolInfo?.schoolLogoUrl || "/assets/images/app_icon.svg";
  const schoolNameKh = schoolInfo?.schoolNameKh || "សាកលវិទ្យាល័យជាតិ";
  const schoolNameEn = schoolInfo?.schoolNameEn || "NATIONAL UNIVERSITY";

  const totalScore = academicSummary?.totalScore != null ? Number(academicSummary.totalScore) : 0;
  const grade = (academicSummary?.overallGrade || "A").trim().toUpperCase();
  const studentName = profile?.fullNameKh || profile?.fullNameEn || studentSession.studentName || "និស្សិត";

  const getGradeTitle = (gr) => {
    if (gr === "A") return "A • ល្អប្រសើរ (EXCELLENT)";
    if (gr === "B+") return "B+ • ល្អណាស់ (VERY GOOD)";
    if (gr === "B") return "B • ល្អ (GOOD)";
    if (gr === "C+") return "C+ • ល្អបង្គួរ (FAIRLY GOOD)";
    if (gr === "C") return "C • មធ្យម (PASS)";
    return `${gr} • បន្តការខិតខំ`;
  };

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3, // Ultra-high resolution 3x
        useCORS: true,
        backgroundColor: null,
        logging: false
      });
      const link = document.createElement("a");
      link.download = `សមិទ្ធផលសិក្សា_${studentName}_${profile?.studentId || "ID"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error(err);
      alert("មានបញ្ហាក្នុងការបង្កើតរូបភាព។ សូមសាកល្បងម្តងទៀត។");
    } finally {
      setDownloading(false);
    }
  };

  const shareText = `🎉 អបអរសាទរ! ខ្ញុំទើបតែទទួលបានលទ្ធផលសិក្សា និទ្ទេស ${grade} (${totalScore}/100) លើមុខវិជ្ជា ${schoolInfo?.subject || profile?.subject || "វិទ្យាសាស្ត្រកុំព្យូទ័រ"} ពី ${schoolNameKh}! 🚀✨`;

  const handleTelegramShare = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(window.location.origin)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto font-khmer animate-fade-in no-print">
      <div className="relative w-full max-w-lg bg-[#0a0f1d] border border-cyan-500/30 rounded-[32px] p-5 sm:p-7 shadow-[0_25px_80px_rgba(0,0,0,0.8)] space-y-5 my-8">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.5)]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white leading-tight">
                កាតចែករំលែកសមិទ្ធផលសិក្សា (Story Card)
              </h3>
              <p className="text-[11px] text-slate-400">
                ទម្រង់ 9:16 ស័ក្តិសមសម្រាប់ Facebook / Telegram / Instagram Story
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* The 9:16 Story Card Canvas Container */}
        <div className="flex justify-center overflow-hidden py-2">
          <div
            ref={cardRef}
            className="w-[320px] sm:w-[340px] h-[580px] sm:h-[610px] rounded-[32px] p-6 text-white relative overflow-hidden flex flex-col justify-between shadow-[0_15px_60px_rgba(6,182,212,0.3)] border-2 border-cyan-400/50 bg-[#070b15]"
          >
            {/* Cyber Gradient & Ambient Lighting */}
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-600/25 via-[#070b15] to-indigo-900/35 pointer-events-none" />
            <div className="cyber-grid absolute inset-0 opacity-25 pointer-events-none" />
            <div className="absolute -top-24 -right-24 w-56 h-56 rounded-full bg-cyan-500/25 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-56 h-56 rounded-full bg-indigo-600/30 blur-3xl pointer-events-none" />

            {/* Top School Branding */}
            <div className="relative z-10 text-center space-y-1.5 pt-1">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-white/10 p-1.5 border border-white/20 backdrop-blur-md flex items-center justify-center shadow-md">
                <img
                  src={schoolLogo}
                  alt="School Logo"
                  className="w-full h-full object-contain"
                  crossOrigin="anonymous"
                  onError={(e) => { e.currentTarget.src = "/assets/images/app_icon.svg"; }}
                />
              </div>
              <div className="text-[11px] font-black tracking-wider text-cyan-300 uppercase font-khmer">
                {schoolNameKh}
              </div>
              <div className="text-[9px] font-mono tracking-widest text-slate-400 uppercase">
                {schoolNameEn}
              </div>
            </div>

            {/* Middle Section: Achievement Ribbon & Glowing Grade */}
            <div className="relative z-10 text-center space-y-3.5 my-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-400/25 to-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                <Trophy className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                <span>សមិទ្ធផលសិក្សាឆ្នើម</span>
              </div>

              {/* Massive Glowing Grade Ring */}
              <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500 via-indigo-500 to-amber-400 animate-spin-slow blur-md opacity-70" />
                <div className="relative w-28 h-28 rounded-full bg-[#080d1a] border-2 border-white/30 flex flex-col items-center justify-center shadow-inner">
                  <span className="text-5xl font-black font-mono tracking-tighter bg-gradient-to-b from-white via-cyan-200 to-amber-300 bg-clip-text text-transparent">
                    {grade}
                  </span>
                  <span className="text-[10px] font-bold text-cyan-400 font-khmer -mt-1">
                    {totalScore} / 100
                  </span>
                </div>
              </div>

              <div className="text-xs font-bold text-amber-300 tracking-wide font-khmer">
                {getGradeTitle(grade)}
              </div>

              {/* Student Identity Pill */}
              <div className="p-3 rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-md space-y-1">
                <div className="text-base font-black text-white font-khmer">
                  {studentName}
                </div>
                <div className="flex items-center justify-center gap-2 text-[11px] text-slate-300 font-mono">
                  <span>ID: <strong className="text-cyan-400">{profile?.studentId || "23537"}</strong></span>
                  <span>•</span>
                  <span>បន្ទប់ {profile?.room || "101"}</span>
                </div>
                <div className="text-[10px] text-slate-400 font-khmer">
                  {schoolInfo?.subject || profile?.subject || "ការអភិវឌ្ឍន៍គេហទំព័រ"}
                </div>
              </div>
            </div>

            {/* Bottom Section: Footer Meta & Verification */}
            <div className="relative z-10 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
              <div className="text-left space-y-0.5">
                <div className="text-white font-bold font-khmer">
                  {schoolInfo?.semester || "ឆមាសទី ១"} • {schoolInfo?.academicYear || "២០២៤-២០២៥"}
                </div>
                <div className="text-[9px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>លទ្ធផលត្រូវបានផ្ទៀងផ្ទាត់</span>
                </div>
              </div>

              <div className="w-10 h-10 rounded-lg bg-white p-1 shrink-0 shadow-sm flex items-center justify-center">
                <QrCode className="w-full h-full text-slate-900" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
          <button
            type="button"
            onClick={handleDownloadImage}
            disabled={downloading}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-[0_4px_20px_rgba(6,182,212,0.4)] transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? "កំពុងទាញយក..." : "ទាញយក Story PNG"}</span>
          </button>

          <button
            type="button"
            onClick={handleTelegramShare}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#229ED9] hover:bg-[#1e8bc0] text-white font-bold text-xs shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>ចែករំលែក Telegram</span>
          </button>

          <button
            type="button"
            onClick={handleCopyText}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-slate-200 hover:text-white font-bold text-xs transition-all cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
            <span>{copied ? "បានចម្លង!" : "ចម្លងអត្ថបទ"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
