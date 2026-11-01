import React, { useState, useRef } from "react";
import {
  Download,
  Share2,
  X,
  Sparkles,
  Trophy,
  Award,
  Crown,
  CheckCircle2,
  Copy,
  Printer,
  Palette,
  Layout,
  Maximize2,
  Sliders,
  Send
} from "lucide-react";
import html2canvas from "html2canvas-pro";

export default function HonorPosterModal({
  isOpen,
  onClose,
  topStudents = [],
  schoolInfo,
  selectedMajor = "ទូទាំងសាកលវិទ្យាល័យ",
  academicYear = "២០២៥-២០២៦ • ឆមាសទី ១"
}) {
  const [downloading, setDownloading] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [aspectRatio, setAspectRatio] = useState("facebook-landscape"); // 'facebook-landscape' (1200x630) | 'portrait' (1080x1350) | 'square' (1080x1080)
  const [themeStyle, setThemeStyle] = useState("royal-gold"); // 'royal-gold' | 'cyber-cyan' | 'crimson-academic'
  const [displayCount, setDisplayCount] = useState("5"); // '3' | '5' | '10'
  const [bannerTitle, setBannerTitle] = useState("តារាងកិត្តិយស និស្សិតឆ្នើមប្រចាំឆមាស");
  const [bannerSubTitle, setBannerSubTitle] = useState("DEAN'S HONORS LIST & TOP ACHIEVERS");

  const posterRef = useRef(null);

  if (!isOpen) return null;

  const schoolLogo = schoolInfo?.schoolLogoUrl || "/assets/images/app_icon.svg";
  const schoolNameKh = schoolInfo?.schoolNameKh || "សាកលវិទ្យាល័យគ្រប់គ្រង និងសេដ្ឋកិច្ច";
  const schoolNameEn = schoolInfo?.schoolNameEn || "UNIVERSITY OF MANAGEMENT AND ECONOMICS";
  const officialStampImage = schoolInfo?.officialStampImage || null;

  const studentsToShow = topStudents.slice(0, parseInt(displayCount, 10));

  // Facebook post pre-formatted caption
  const generateFacebookCaption = () => {
    let caption = `🏆✨ 【សេចក្តីប្រកាសកិត្តិយស៖ ${bannerTitle}】 ✨🏆\n\n`;
    caption += `🎓 ${schoolNameKh} (${schoolNameEn})\n`;
    caption += `📅 ឆ្នាំសិក្សា៖ ${academicYear}\n`;
    caption += `🎯 ជំនាញ/ដេប៉ាតឺម៉ង់៖ ${selectedMajor}\n\n`;
    caption += `គណៈគ្រប់គ្រងសាកលវិទ្យាល័យ សូមសម្តែងនូវការអបអរសាទរយ៉ាងកក់ក្តៅបំផុតចំពោះនិស្សិតឆ្នើម Top ${studentsToShow.length} រូប ដែលទទួលបានលទ្ធផលសិក្សាល្អប្រសើរបំផុតប្រចាំឆមាស៖\n\n`;

    studentsToShow.forEach((st, idx) => {
      const medal = idx === 0 ? "🥇 [ជើងឯក Top 1]" : idx === 1 ? "🥈 [Top 2]" : idx === 2 ? "🥉 [Top 3]" : `🎖️ [Top ${idx + 1}]`;
      const name = st.fullNameKh || st.fullNameEn || st.nameKh || st.name || "និស្សិត";
      const id = st.studentId || st.id || "";
      const score = st.totalScore != null ? Number(st.totalScore).toFixed(1) : "0";
      const gpa = st.gpa ? ` | GPA: ${Number(st.gpa).toFixed(2)}` : "";
      caption += `${medal}៖ ${name} (អត្តលេខ: ${id}) • ពិន្ទុ: ${score}/100${gpa}\n`;
    });

    caption += `\n🌟 សូមជូនពរឱ្យប្អូនៗនិស្សិតទាំងអស់បន្តខិតខំប្រឹងប្រែង និងទទួលបានជោគជ័យត្រចះត្រចង់ក្នុងដំណើរជីវិតសិក្សាបន្តទៀត! 🚀\n\n`;
    caption += `#DeansHonorsList #TopAchievers #CambodiaUniversity #MyPintou #AcademicExcellence #${selectedMajor.replace(/[\s\/\(\)]+/g, "")}`;
    return caption;
  };

  const handleCopyCaption = () => {
    navigator.clipboard?.writeText(generateFacebookCaption());
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 3000);
  };

  const handleDownloadPoster = async () => {
    if (!posterRef.current) return;
    setDownloading(true);
    try {
      // High-res retina capture
      const canvas = await html2canvas(posterRef.current, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: null,
        logging: false,
        allowTaint: true
      });

      const link = document.createElement("a");
      const safeMajor = selectedMajor.replace(/[\s\/\(\)]+/g, "_");
      link.download = `Deans_Honors_Poster_Top${studentsToShow.length}_${safeMajor}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Poster download error:", err);
      alert("មានបញ្ហាក្នុងការបង្កើតរូបភាព Poster។ សូមសាកល្បងម្តងទៀត។");
    } finally {
      setDownloading(false);
    }
  };

  // Dimensions based on selected aspect ratio
  const getAspectRatioClasses = () => {
    switch (aspectRatio) {
      case "portrait":
        // 1080 x 1350 (4:5)
        return "w-[680px] min-h-[850px]";
      case "square":
        // 1080 x 1080 (1:1)
        return "w-[720px] min-h-[720px]";
      case "facebook-landscape":
      default:
        // 1200 x 630 (1.91:1)
        return "w-[920px] min-h-[500px]";
    }
  };

  // Theme styling classes
  const getThemeBackground = () => {
    switch (themeStyle) {
      case "cyber-cyan":
        return "bg-gradient-to-br from-[#060B18] via-[#0A1226] to-[#040711] text-white border-cyan-500/30";
      case "crimson-academic":
        return "bg-gradient-to-br from-[#1E080D] via-[#2A0C14] to-[#120407] text-white border-rose-500/30";
      case "royal-gold":
      default:
        return "bg-gradient-to-br from-[#0A0E1A] via-[#10172A] to-[#050811] text-white border-amber-500/40";
    }
  };

  const getAccentColor = () => {
    switch (themeStyle) {
      case "cyber-cyan":
        return {
          goldText: "text-cyan-400",
          badgeBorder: "border-cyan-400/50 bg-cyan-500/10",
          glow: "shadow-[0_0_25px_rgba(6,182,212,0.35)]",
          primaryGrad: "from-cyan-400 to-blue-500",
          medal: "from-cyan-400 to-blue-600"
        };
      case "crimson-academic":
        return {
          goldText: "text-amber-400",
          badgeBorder: "border-amber-400/40 bg-amber-500/10",
          glow: "shadow-[0_0_25px_rgba(244,63,94,0.35)]",
          primaryGrad: "from-rose-500 to-amber-500",
          medal: "from-amber-400 to-yellow-600"
        };
      case "royal-gold":
      default:
        return {
          goldText: "text-amber-300",
          badgeBorder: "border-amber-400/60 bg-amber-500/15",
          glow: "shadow-[0_0_35px_rgba(245,158,11,0.35)]",
          primaryGrad: "from-amber-300 via-yellow-400 to-amber-500",
          medal: "from-amber-300 via-yellow-400 to-amber-600"
        };
    }
  };

  const colors = getAccentColor();

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto font-khmer">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-6xl max-h-[96vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Modal Top Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>បង្កើត Digital Honor Poster សម្រាប់ Facebook</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-sans uppercase">
                  1-Tap Export
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                ផ្ទាំងរូបភាព HD សម្រាប់ផ្សព្វផ្សាយលើបណ្តាញសង្គមផ្លូវការរបស់សាកលវិទ្យាល័យ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCaption}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                copiedCaption
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  : "bg-slate-800 text-slate-300 hover:text-white border-slate-700"
              }`}
            >
              {copiedCaption ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCaption ? "បានចម្លង Caption!" : "ចម្លង Facebook Caption"}</span>
            </button>

            <button
              onClick={handleDownloadPoster}
              disabled={downloading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/25 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {downloading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>កំពុងបង្កើត HD PNG...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>ទាញយក Poster (PNG HD)</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Customization Settings Bar */}
        <div className="bg-slate-950/60 p-3 sm:px-6 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          {/* Aspect Ratio */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">ទំហំ Poster៖</span>
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
              <button
                onClick={() => setAspectRatio("facebook-landscape")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  aspectRatio === "facebook-landscape"
                    ? "bg-amber-500 text-slate-950 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Facebook Post (Landscape)
              </button>
              <button
                onClick={() => setAspectRatio("portrait")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  aspectRatio === "portrait"
                    ? "bg-amber-500 text-slate-950 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Feed (Portrait)
              </button>
              <button
                onClick={() => setAspectRatio("square")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  aspectRatio === "square"
                    ? "bg-amber-500 text-slate-950 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Square (1:1)
              </button>
            </div>
          </div>

          {/* Theme Style */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">រចនាបទ៖</span>
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
              <button
                onClick={() => setThemeStyle("royal-gold")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  themeStyle === "royal-gold"
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Royal Gold (មាសប្រណិត)
              </button>
              <button
                onClick={() => setThemeStyle("cyber-cyan")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  themeStyle === "cyber-cyan"
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Cyber Blue (ខៀវទំនើប)
              </button>
              <button
                onClick={() => setThemeStyle("crimson-academic")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  themeStyle === "crimson-academic"
                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Academic Crimson (ក្រហម)
              </button>
            </div>
          </div>

          {/* Top Students Count */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">បង្ហាញ៖</span>
            <select
              value={displayCount}
              onChange={(e) => setDisplayCount(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-white rounded-xl px-2.5 py-1 focus:outline-none cursor-pointer"
            >
              <option value="3">Top 3 ជើងឯក</option>
              <option value="5">Top 5 ឆ្នើម</option>
              <option value="10">Top 10 កិត្តិយស</option>
            </select>
          </div>
        </div>

        {/* Poster Canvas Preview Area (Scrollable if necessary) */}
        <div className="p-4 sm:p-6 overflow-auto flex-1 flex justify-center items-start bg-slate-950/80">
          {/* THE ACTUAL POSTER CONTAINER TO BE CAPTURED */}
          <div
            ref={posterRef}
            className={`relative rounded-3xl border shadow-2xl p-6 sm:p-8 overflow-hidden transition-all duration-300 font-khmer ${getThemeBackground()} ${getAspectRatioClasses()}`}
            style={{
              boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.9)"
            }}
          >
            {/* Background Ornaments / Watermark */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none opacity-40" />
            <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

            {/* Poster Header */}
            <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-5 mb-6">
              {/* University Branding */}
              <div className="flex items-center gap-3.5">
                <img
                  src={schoolLogo}
                  alt="School Emblem"
                  className="w-14 h-14 object-contain filter drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]"
                  crossOrigin="anonymous"
                />
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-wide leading-tight">
                    {schoolNameKh}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-slate-300 font-mono tracking-wider uppercase font-semibold">
                    {schoolNameEn}
                  </p>
                  <p className="text-[10px] text-amber-400 font-medium mt-0.5">
                    {academicYear} • ដេប៉ាតឺម៉ង់៖ {selectedMajor}
                  </p>
                </div>
              </div>

              {/* Royal Seal / Laurel Badge */}
              <div className="text-right hidden sm:block">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>DEAN'S HONORS AWARD</span>
                </div>
                <p className="text-[9px] text-slate-400 font-mono mt-1">
                  OFFICIAL ACADEMIC EXCELLENCE
                </p>
              </div>
            </div>

            {/* Main Poster Title */}
            <div className="relative z-10 text-center mb-6 space-y-1">
              <div className="inline-flex items-center justify-center gap-2 mb-1">
                <span className="h-[1px] w-8 sm:w-16 bg-gradient-to-r from-transparent to-amber-400" />
                <Crown className="w-6 h-6 text-amber-400 animate-pulse" />
                <span className="h-[1px] w-8 sm:w-16 bg-gradient-to-l from-transparent to-amber-400" />
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 tracking-tight leading-tight">
                {bannerTitle}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-mono font-semibold tracking-widest uppercase">
                {bannerSubTitle}
              </p>
            </div>

            {/* Students Showcase Cards */}
            <div className="relative z-10 mb-6">
              {/* TOP 3 PODIUM DISPLAY */}
              {studentsToShow.length <= 3 ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end pt-4">
                  {/* Rank 2 (Left) */}
                  {studentsToShow[1] && (
                    <div className="order-2 sm:order-1 bg-gradient-to-t from-slate-900/90 to-slate-800/80 border border-slate-700/80 rounded-2xl p-4 text-center relative overflow-hidden shadow-xl">
                      <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-slate-300 text-slate-950 font-bold font-mono text-xs flex items-center justify-center shadow">
                        #2
                      </div>
                      <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-slate-400 to-slate-200 p-0.5 mx-auto mb-2 shadow-lg">
                        <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-slate-200 font-bold text-lg">
                          {studentsToShow[1].fullNameKh?.charAt(0) || "🥈"}
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 font-mono">{studentsToShow[1].studentId}</p>
                      <h4 className="text-sm font-bold text-white truncate">{studentsToShow[1].fullNameKh || studentsToShow[1].fullNameEn}</h4>
                      <p className="text-[11px] text-cyan-400 font-medium truncate">{studentsToShow[1].major || selectedMajor}</p>
                      <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-around text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block">ពិន្ទុ</span>
                          <span className="font-mono font-bold text-white">{Number(studentsToShow[1].totalScore).toFixed(1)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">GPA</span>
                          <span className="font-mono font-bold text-amber-300">{studentsToShow[1].gpa || "3.85"}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Rank 1 (Center Champion - Tallest & Most Luxurious) */}
                  {studentsToShow[0] && (
                    <div className="order-1 sm:order-2 bg-gradient-to-t from-amber-950/40 via-slate-900/90 to-slate-800/90 border-2 border-amber-400/80 rounded-2xl p-5 text-center relative overflow-hidden shadow-[0_0_35px_rgba(245,158,11,0.4)] transform sm:-translate-y-2">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Crown className="w-7 h-7 text-amber-400 filter drop-shadow" />
                      </div>
                      <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-extrabold font-mono text-xs flex items-center justify-center shadow-md">
                        #1
                      </div>
                      <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 p-1 mx-auto mb-2 shadow-xl animate-pulse">
                        <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-amber-300 font-bold text-2xl">
                          {studentsToShow[0].fullNameKh?.charAt(0) || "🥇"}
                        </div>
                      </div>
                      <span className="inline-block text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase mb-1">
                        🏆 ជើងឯកឆ្នើម (Valedictorian)
                      </span>
                      <p className="text-xs text-slate-400 font-mono">{studentsToShow[0].studentId}</p>
                      <h4 className="text-base font-extrabold text-white truncate">{studentsToShow[0].fullNameKh || studentsToShow[0].fullNameEn}</h4>
                      <p className="text-xs text-amber-300 font-medium truncate">{studentsToShow[0].major || selectedMajor}</p>
                      <div className="mt-2.5 pt-2 border-t border-amber-500/30 flex items-center justify-around text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block">ពិន្ទុសរុប</span>
                          <span className="font-mono font-extrabold text-lg text-amber-300">{Number(studentsToShow[0].totalScore).toFixed(1)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">និទ្ទេស / GPA</span>
                          <span className="font-mono font-extrabold text-lg text-emerald-400">A ({studentsToShow[0].gpa || "4.00"})</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Rank 3 (Right) */}
                  {studentsToShow[2] && (
                    <div className="order-3 bg-gradient-to-t from-slate-900/90 to-slate-800/80 border border-amber-700/60 rounded-2xl p-4 text-center relative overflow-hidden shadow-xl">
                      <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-amber-700 text-white font-bold font-mono text-xs flex items-center justify-center shadow">
                        #3
                      </div>
                      <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 to-amber-700 p-0.5 mx-auto mb-2 shadow-lg">
                        <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-amber-500 font-bold text-lg">
                          {studentsToShow[2].fullNameKh?.charAt(0) || "🥉"}
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 font-mono">{studentsToShow[2].studentId}</p>
                      <h4 className="text-sm font-bold text-white truncate">{studentsToShow[2].fullNameKh || studentsToShow[2].fullNameEn}</h4>
                      <p className="text-[11px] text-cyan-400 font-medium truncate">{studentsToShow[2].major || selectedMajor}</p>
                      <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-around text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block">ពិន្ទុ</span>
                          <span className="font-mono font-bold text-white">{Number(studentsToShow[2].totalScore).toFixed(1)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">GPA</span>
                          <span className="font-mono font-bold text-amber-300">{studentsToShow[2].gpa || "3.75"}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* TOP 5 / TOP 10 GRID DISPLAY */
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {studentsToShow.map((st, idx) => {
                    const isChampion = idx === 0;
                    const isPodium = idx < 3;
                    return (
                      <div
                        key={st.studentId || idx}
                        className={`rounded-2xl p-3 text-center relative overflow-hidden transition-all ${
                          isChampion
                            ? "bg-gradient-to-b from-amber-950/60 to-slate-900/95 border-2 border-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                            : isPodium
                            ? "bg-slate-900/90 border border-slate-700/80"
                            : "bg-slate-900/60 border border-slate-800"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className={`w-6 h-6 rounded-full font-bold font-mono text-[11px] flex items-center justify-center ${
                              idx === 0
                                ? "bg-amber-400 text-slate-950 font-extrabold"
                                : idx === 1
                                ? "bg-slate-300 text-slate-950"
                                : idx === 2
                                ? "bg-amber-700 text-white"
                                : "bg-slate-800 text-slate-400 border border-slate-700"
                            }`}
                          >
                            #{idx + 1}
                          </span>
                          {idx === 0 && <Crown className="w-4 h-4 text-amber-400" />}
                        </div>

                        <div className="w-12 h-12 rounded-full bg-slate-800 border border-white/20 p-0.5 mx-auto mb-1.5">
                          <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-white font-bold text-sm">
                            {st.fullNameKh?.charAt(0) || "🎓"}
                          </div>
                        </div>

                        <p className="text-[10px] text-slate-400 font-mono truncate">{st.studentId}</p>
                        <h4 className="text-xs font-bold text-white truncate leading-tight mt-0.5">
                          {st.fullNameKh || st.fullNameEn}
                        </h4>
                        <div className="mt-1.5 pt-1 border-t border-white/10 flex items-center justify-center gap-1.5">
                          <span className="text-[10px] text-slate-400">ពិន្ទុ៖</span>
                          <span className={`font-mono font-bold text-xs ${idx === 0 ? "text-amber-300" : "text-cyan-400"}`}>
                            {Number(st.totalScore).toFixed(1)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Poster Footer with Official Stamp & Signatures */}
            <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="font-semibold text-slate-300">
                  ប្រព័ន្ធគ្រប់គ្រងពិន្ទុ MyPintou • Dean's Honors List System
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[10px] text-slate-300 font-medium">ព្រឹទ្ធបុរសមហាវិទ្យាល័យ</p>
                  <p className="text-[11px] text-amber-300 font-bold">Dean of Faculty</p>
                </div>
                {officialStampImage && (
                  <img
                    src={officialStampImage}
                    alt="Official Stamp"
                    className="w-12 h-12 object-contain opacity-85 filter drop-shadow"
                    crossOrigin="anonymous"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
