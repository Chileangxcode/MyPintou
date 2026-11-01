import React, { useState, useEffect, useMemo } from "react";
import {
  Printer,
  ArrowLeft,
  GraduationCap,
  Download,
  Image as ImageIcon,
  Share2,
  Loader2,
  Sparkles,
  PenTool,
  Users,
  ShieldCheck
} from "lucide-react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";
import { useAuth } from "../context/AuthContext.jsx";
import { useSchool } from "../context/SchoolContext.jsx";
import { getAdminStudentDetail } from "../api/adminApi.js";
import { lookupStudent } from "../api/studentApi.js";
import SocialShareModal from "../components/SocialShareModal.jsx";
import SignatureCustomizerModal from "../components/SignatureCustomizerModal.jsx";
import { formatKhmerDate } from "../utils/signaturePresets.js";

export default function PrintableResultPage() {
  const { studentSession, adminSession, refreshStudentScores, loading } = useAuth();
  const { schoolInfo } = useSchool();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const targetStudentId = searchParams.get("studentId") || searchParams.get("id");

  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingPng, setDownloadingPng] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSigModal, setShowSigModal] = useState(false);
  const [fetchedStudent, setFetchedStudent] = useState(null);
  const [fetchingStudent, setFetchingStudent] = useState(false);

  // Auto-fetch fresh live scores from Google Sheet on mount if student session exists
  useEffect(() => {
    if (refreshStudentScores && studentSession) {
      refreshStudentScores();
    }
  }, []);

  // Stored student from localStorage / sessionStorage (preserves active student across new tabs)
  const storedStudent = useMemo(() => {
    try {
      const raw = localStorage.getItem("active_print_student") || sessionStorage.getItem("active_print_student");
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return null;
  }, []);

  // Resolve student either from location.state (Admin viewing specific student), storedStudent, fetchedStudent, or studentSession
  const activeStudent = useMemo(() => {
    if (location.state?.student) return location.state.student;
    if (fetchedStudent) return fetchedStudent;
    if (storedStudent) {
      if (!targetStudentId) return storedStudent;
      const sId = storedStudent.profile?.studentId || storedStudent.studentId;
      if (sId === targetStudentId) return storedStudent;
    }
    return studentSession || null;
  }, [location.state?.student, fetchedStudent, storedStudent, targetStudentId, studentSession]);

  // If a studentId is provided in URL but no matching student is loaded yet, fetch from server
  useEffect(() => {
    if (!targetStudentId) return;
    const currentId = activeStudent?.profile?.studentId || activeStudent?.studentId;
    if (currentId === targetStudentId) return;

    let isMounted = true;
    setFetchingStudent(true);

    const fetchDetail = async () => {
      try {
        if (adminSession?.token) {
          const res = await getAdminStudentDetail(adminSession.token, targetStudentId);
          if (isMounted && res && res.success && res.data) {
            setFetchedStudent(res.data);
            return;
          }
        }
        const res = await lookupStudent(targetStudentId, "");
        if (isMounted && res && res.success && res.data) {
          setFetchedStudent(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch student details for print:", err);
      } finally {
        if (isMounted) setFetchingStudent(false);
      }
    };

    fetchDetail();
    return () => { isMounted = false; };
  }, [targetStudentId, activeStudent, adminSession?.token]);

  if (fetchingStudent) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 gap-3 animate-fade-in font-khmer">
        <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
        <span className="text-xs text-slate-400 font-medium">កំពុងទាញយកទិន្នន័យព្រឹត្តិបត្រពិន្ទុ...</span>
      </div>
    );
  }

  if (!activeStudent) {
    if (adminSession) {
      return (
        <div className="max-w-2xl mx-auto py-12 px-4 text-center font-khmer space-y-6">
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xl space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
              <PenTool className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              ផ្ទាំងបោះពុម្ពព្រឹត្តិបត្រពិន្ទុ & លិខិតបញ្ជាក់លទ្ធផលសិក្សា
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              អ្នកកំពុងចូលប្រើប្រាស់ជាអ្នកគ្រប់គ្រង (Admin Mode)។ លោកអ្នកអាចកំណត់ហត្ថលេខា និងត្រាផ្លូវការនៅទីនេះ ឬជ្រើសរើសនិស្សិតពីបញ្ជីឈ្មោះដើម្បីបោះពុម្ព។
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowSigModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-xs sm:text-sm shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-all"
              >
                <PenTool className="w-4 h-4" />
                <span>កំណត់ហត្ថលេខា & ត្រាផ្លូវការ</span>
              </button>
              <Link
                to="/admin/students"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm shadow-sm cursor-pointer hover:scale-105 active:scale-95 transition-all"
              >
                <Users className="w-4 h-4" />
                <span>ទៅកាន់បញ្ជីឈ្មោះនិស្សិត</span>
              </Link>
            </div>
          </div>
          <SignatureCustomizerModal
            isOpen={showSigModal}
            onClose={() => setShowSigModal(false)}
          />
        </div>
      );
    }
    return null;
  }

  const profile = activeStudent.profile || {
    studentId: activeStudent.studentId || activeStudent.id,
    fullNameKh: activeStudent.fullNameKh || activeStudent.fullName,
    fullNameEn: activeStudent.fullNameEn,
    gender: activeStudent.gender,
    room: activeStudent.room || activeStudent.class,
    skill: activeStudent.skill || activeStudent.major,
    academicYear: activeStudent.academicYear || schoolInfo?.academicYear || "2025-2026"
  };
  const academicSummary = activeStudent.academicSummary || {};
  const scores = activeStudent.scores || [];
  const universityKhmer = schoolInfo?.schoolNameKh || import.meta.env.VITE_UNIVERSITY_NAME_KH || "សាកលវិទ្យាល័យគ្រប់គ្រង និងសេដ្ឋកិច្ច";
  const universityEnglish = schoolInfo?.schoolNameEn || import.meta.env.VITE_UNIVERSITY_NAME || "UNIVERSITY OF MANAGEMENT AND ECONOMICS";
  const logoUrl = schoolInfo?.schoolLogoUrl || "/assets/images/app_icon.svg";

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPng = async () => {
    const element = document.getElementById("printable-certificate");
    if (!element) return;
    setDownloadingPng(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        windowWidth: element.scrollWidth
      });
      const studentName = profile?.fullNameKh || profile?.fullName || "Student";
      const studentId = profile?.studentId || "ID";
      const link = document.createElement("a");
      link.download = `ព្រឹត្តិបត្រពិន្ទុ_${studentName}_${studentId}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error(err);
      alert("មានបញ្ហាក្នុងការទាញយករូបភាព។ សូមសាកល្បងម្តងទៀត។");
    } finally {
      setDownloadingPng(false);
    }
  };

  const handleDownloadPdf = async () => {
    const element = document.getElementById("printable-certificate");
    if (!element) return;
    setDownloadingPdf(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        windowWidth: element.scrollWidth
      });
      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgProps = pdf.getImageProperties(imgData);
      const ratio = imgProps.width / imgProps.height;
      let renderWidth = pdfWidth;
      let renderHeight = renderWidth / ratio;

      if (renderHeight > pdfHeight) {
        renderHeight = pdfHeight;
        renderWidth = renderHeight * ratio;
      }

      const marginX = (pdfWidth - renderWidth) / 2;
      const marginY = (pdfHeight - renderHeight) / 2;

      pdf.addImage(imgData, "JPEG", marginX, marginY, renderWidth, renderHeight);
      const studentName = profile?.fullNameKh || profile?.fullName || "Student";
      const studentId = profile?.studentId || "ID";
      pdf.save(`ព្រឹត្តិបត្រពិន្ទុ_${studentName}_${studentId}.pdf`);
    } catch (err) {
      console.error(err);
      alert("មានបញ្ហាក្នុងការបង្កើតឯកសារ PDF។ សូមសាកល្បងម្តងទៀត។");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const renderGenderKhmer = (g) => {
    if (!g) return "មិនបញ្ជាក់";
    const str = String(g).trim().toUpperCase();
    if (str === "F" || str === "FEMALE" || str.includes("ស្រី")) return "ស្រី";
    if (str === "M" || str === "MALE" || str.includes("ប្រុស")) return "ប្រុស";
    return g;
  };

  const resolveItemScore = (s) => {
    if (s.score !== null && s.score !== undefined && s.score !== "") return Number(s.score);
    const title = (s.assessment || "").toLowerCase();
    if (title.includes("midterm") || title.includes("ពាក់កណ្") || title.includes("ពាក់កណ្តាល")) {
      if (academicSummary?.midterm !== null && academicSummary?.midterm !== undefined && academicSummary?.midterm !== "") {
        return Number(academicSummary.midterm);
      }
    }
    if (title.includes("final") || title.includes("បញ្ចប់")) {
      if (academicSummary?.finalScore !== null && academicSummary?.finalScore !== undefined && academicSummary?.finalScore !== "") {
        return Number(academicSummary.finalScore);
      }
    }
    if (title.includes("attendance") || title.includes("វត្តមាន")) {
      if (academicSummary?.attendance !== null && academicSummary?.attendance !== undefined && academicSummary?.attendance !== "") {
        return Number(academicSummary.attendance);
      }
    }
    if (title.includes("quiz") || title.includes("កិច្ចការ")) {
      if (academicSummary?.totalQHA !== null && academicSummary?.totalQHA !== undefined && academicSummary?.totalQHA !== "") {
        return Number(academicSummary.totalQHA);
      }
    }
    if (s.rawScore !== null && s.rawScore !== undefined && s.rawScore !== "") {
      return Number(s.rawScore);
    }
    return null;
  };

  const calculateScorePercentage = (s, resolvedScore) => {
    if (s.percentage !== null && s.percentage !== undefined && !isNaN(s.percentage)) {
      return Math.round(Number(s.percentage) * 10) / 10;
    }
    const val = resolvedScore !== null && resolvedScore !== undefined ? resolvedScore : resolveItemScore(s);
    if (val !== null && val !== undefined && val !== "" && s.maxScore > 0 && !isNaN(val)) {
      return Math.round((Number(val) / Number(s.maxScore)) * 1000) / 10;
    }
    return null;
  };

  const getEvaluationLabel = (score, pct) => {
    if (score === null || score === undefined || score === "" || isNaN(score)) {
      return <span className="text-slate-400 font-medium">មិនទាន់ប្រឡង</span>;
    }
    if (pct === null || isNaN(pct)) return <span className="text-slate-400">-</span>;
    if (pct >= 85) return <span className="text-emerald-700 font-bold">ល្អប្រសើរ</span>;
    if (pct >= 80) return <span className="text-blue-700 font-bold">ល្អណាស់</span>;
    if (pct >= 70) return <span className="text-blue-600 font-bold">ល្អ</span>;
    if (pct >= 65) return <span className="text-teal-700 font-bold">ល្អបង្គួរ</span>;
    if (pct >= 50) return <span className="text-amber-700 font-bold">មធ្យម</span>;
    if (pct >= 45) return <span className="text-orange-700 font-bold">ខ្សោយ</span>;
    if (pct >= 40) return <span className="text-purple-700 font-bold">ខ្សោយណាស់</span>;
    return <span className="text-rose-700 font-bold">ធ្លាក់</span>;
  };

  const displayScores = (scores && scores.length >= 4) ? scores : [
    { assessment: "វត្តមាន និងការចូលរួម (Attendance)", maxScore: 10, weight: 10 },
    { assessment: "សំណួរ និងកិច្ចការស្រាវជ្រាវ (Quizzes & Tasks)", maxScore: 15, weight: 15 },
    { assessment: "ការប្រឡងពាក់កណ្តាលឆមាស (Midterm)", maxScore: 25, weight: 25 },
    { assessment: "ការប្រឡងបញ្ចប់ឆមាស (Final Exam)", maxScore: 50, weight: 50 }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-4 print:space-y-0 print:max-w-none print:m-0">
      {/* On-screen control bar (Hidden during print) */}
      <div className="no-print bg-white/80 dark:bg-[#0c1427]/85 p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-[0_10px_35px_rgba(0,0,0,0.1)] flex flex-wrap items-center justify-between gap-3 backdrop-blur-xl">
        <Link
          to={adminSession ? "/admin/students" : "/student/dashboard"}
          className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-cyan-500 transition-colors font-khmer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{adminSession ? "ត្រឡប់ទៅបញ្ជីនិស្សិត" : "ត្រឡប់ទៅផ្ទាំងគ្រប់គ្រង"}</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {/* Admin Signature & Stamp Customizer Button (Only visible to Admin) */}
          {adminSession && (
            <button
              onClick={() => setShowSigModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer font-khmer"
              title="កំណត់ហត្ថលេខា ត្រាផ្លូវការ និង E-Signature សម្រាប់រដ្ឋបាល"
            >
              <PenTool className="w-4 h-4" />
              <span>កំណត់ហត្ថលេខា & ត្រា (Admin)</span>
            </button>
          )}
          {/* Social Share Story Button */}
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-pink-500 hover:from-amber-400 hover:to-pink-400 text-white font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer font-khmer"
            title="បង្កើតកាតបញ្ឈរ Story សម្រាប់ចែករំលែក"
          >
            <Share2 className="w-4 h-4" />
            <span>ចែករំលែកសមិទ្ធផល (Story)</span>
          </button>

          {/* Download PNG Button */}
          <button
            onClick={handleDownloadPng}
            disabled={downloadingPng}
            className="flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer font-khmer disabled:opacity-50"
            title="រក្សាទុកព្រឹត្តិបត្រពិន្ទុជារូបភាព PNG"
          >
            {downloadingPng ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                <span>កំពុងរក្សាទុក...</span>
              </>
            ) : (
              <>
                <ImageIcon className="w-4 h-4 text-emerald-400" />
                <span>រក្សាទុកជារូបភាព (PNG)</span>
              </>
            )}
          </button>

          {/* Download PDF Button */}
          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer font-khmer disabled:opacity-50"
            title="ទាញយកជាឯកសារ PDF A4 ដោយផ្ទាល់"
          >
            {downloadingPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>កំពុងបង្កើត PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>ទាញយកជា PDF</span>
              </>
            )}
          </button>

          {/* Print A4 Button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-[0_4px_16px_rgba(6,182,212,0.35)] transition-all hover:scale-105 active:scale-95 cursor-pointer font-khmer"
            title="បោះពុម្ពជាក្រដាស A4 តាមម៉ាស៊ីនព្រីន"
          >
            <Printer className="w-4 h-4" />
            <span>បោះពុម្ព (Print A4)</span>
          </button>
        </div>
      </div>

      {/* Official Grade Slip Document (Expanded Height - 1 Single A4 Page Fit) */}
      <div id="printable-certificate" className="bg-white rounded-2xl border border-slate-200/90 shadow-md p-6 sm:p-9 space-y-5 print:space-y-4 print:p-0 print:border-none print:shadow-none print-card text-slate-900 box-border">
        {/* Document National Header & University Heading */}
        <div className="text-center space-y-2 pb-3.5 border-b-2 border-slate-900">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img 
              src={logoUrl} 
              alt="School Logo" 
              className="w-15 h-15 sm:w-16 sm:h-16 object-contain" 
              crossOrigin="anonymous"
              onError={(e) => { e.currentTarget.src = "/assets/images/app_icon.svg"; }}
            />
          </div>

          {/* 3 Main Header Lines - Same size, balanced, authoritative */}
          <div className="text-sm sm:text-base font-bold text-slate-950 tracking-wide font-khmer">
            ព្រះរាជាណាចក្រកម្ពុជា
          </div>
          <div className="text-sm sm:text-base font-bold text-slate-900 tracking-wider font-khmer">
            ជាតិ សាសនា ព្រះមហាក្សត្រ
          </div>
          <div className="w-20 h-0.5 bg-slate-400 mx-auto my-1.5"></div>
          <div className="text-sm sm:text-base font-bold text-slate-950 tracking-tight font-khmer">
            {universityKhmer}
          </div>
          <div className="text-xs font-semibold text-slate-600 tracking-wider uppercase font-mono">
            {universityEnglish}
          </div>
          <div className="text-base sm:text-lg font-extrabold text-blue-950 tracking-wide pt-1.5 font-khmer underline decoration-blue-500/40 decoration-1 underline-offset-4">
            លិខិតបញ្ជាក់លទ្ធផលសិក្សា និងព្រឹត្តិបត្រពិន្ទុ
          </div>
        </div>

        {/* Student Meta Details Card */}
        <div className="border border-slate-300 rounded-xl p-4 sm:p-5 bg-slate-50/70 text-xs sm:text-sm">
          <div className="grid grid-cols-2 gap-x-8 gap-y-2.5">
            <div className="space-y-2">
              <div className="flex justify-between sm:justify-start sm:gap-2">
                <span className="text-slate-500 font-khmer">ឈ្មោះនិស្សិត៖</span>
                <strong className="text-slate-950 font-bold font-khmer">{profile.fullNameKh || profile.fullName}</strong>
              </div>
              <div className="flex justify-between sm:justify-start sm:gap-2">
                <span className="text-slate-500 font-khmer">អក្សរឡាតាំង៖</span>
                <strong className="text-slate-900 font-semibold font-mono">{profile.fullNameEn || "-"}</strong>
              </div>
              <div className="flex justify-between sm:justify-start sm:gap-2">
                <span className="text-slate-500 font-khmer">លេខសម្គាល់និស្សិត (ID)៖</span>
                <strong className="text-slate-950 font-mono font-bold">{profile.studentId}</strong>
              </div>
              <div className="flex justify-between sm:justify-start sm:gap-2">
                <span className="text-slate-500 font-khmer">ភេទ៖</span>
                <strong className="text-slate-900 font-khmer">{renderGenderKhmer(profile.gender)}</strong>
              </div>
            </div>

            <div className="space-y-2 sm:text-right">
              <div className="flex justify-between sm:justify-end sm:gap-2">
                <span className="text-slate-500 font-khmer">បន្ទប់ / ថ្នាក់៖</span>
                <strong className="text-slate-900 font-mono">{profile.room || "ទូទៅ"}</strong>
              </div>
              <div className="flex justify-between sm:justify-end sm:gap-2">
                <span className="text-slate-500 font-khmer">ជំនាញ / កម្មវិធី៖</span>
                <strong className="text-slate-900 font-khmer">{profile.skill || "គណនេយ្យ"}</strong>
              </div>
              <div className="flex justify-between sm:justify-end sm:gap-2">
                <span className="text-slate-500 font-khmer">ឆ្នាំសិក្សា៖</span>
                <strong className="text-slate-900 font-mono">{profile.academicYear || "2025-2026"}</strong>
              </div>
              <div className="flex justify-between sm:justify-end sm:gap-2">
                <span className="text-slate-500 font-khmer">កាលបរិច្ឆេទចេញលិខិត៖</span>
                <strong className="text-slate-900 font-khmer">
                  {schoolInfo?.issueDate || new Date().toLocaleDateString("km-KH", { day: "numeric", month: "long", year: "numeric" })}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Score Table */}
        <div className="space-y-1">
          <table className="w-full text-left border-collapse text-xs sm:text-sm border border-slate-300">
            <thead>
              <tr className="border-b-2 border-slate-900 text-slate-950 uppercase text-[11px] sm:text-xs font-bold tracking-wider bg-slate-100">
                <th className="py-2.5 sm:py-3 px-3 font-khmer text-center w-10">ល.រ</th>
                <th className="py-2.5 sm:py-3 px-3.5 font-khmer">ផ្នែកវាយតម្លៃ / វិញ្ញាសា</th>
                <th className="py-2.5 sm:py-3 px-3 text-right font-khmer w-20">ពិន្ទុពេញ</th>
                <th className="py-2.5 sm:py-3 px-3 text-right font-khmer w-24">ពិន្ទុទទួលបាន</th>
                <th className="py-2.5 sm:py-3 px-3 text-right font-khmer w-20">ភាគរយ</th>
                <th className="py-2.5 sm:py-3 px-3.5 text-right font-khmer w-24">ការវាយតម្លៃ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {displayScores.map((s, idx) => {
                const currentScore = resolveItemScore(s);
                const pct = calculateScorePercentage(s, currentScore);

                return (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 font-mono text-slate-500 text-center">{idx + 1}</td>
                    <td className="py-3 px-3.5 font-semibold text-slate-900 font-khmer">{s.assessment}</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-600 font-semibold">{s.maxScore || "-"}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-950 text-sm">
                      {currentScore !== null && currentScore !== undefined && currentScore !== "" ? currentScore : "-"}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-700 font-medium">
                      {pct !== null ? `${pct}%` : "-"}
                    </td>
                    <td className="py-3 px-3.5 text-right text-xs sm:text-sm font-khmer">
                      {getEvaluationLabel(currentScore, pct)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-900 font-bold bg-slate-100/90">
                <td colSpan={3} className="py-3 px-3.5 uppercase text-xs sm:text-sm tracking-wider text-slate-950 font-khmer">
                  សរុបលទ្ធផលវាយតម្លៃរួម
                </td>
                <td className="py-3 px-3 text-right font-mono text-sm sm:text-base text-blue-950">
                  {academicSummary?.totalScore !== null && academicSummary?.totalScore !== undefined
                    ? `${academicSummary.totalScore} ពិន្ទុ`
                    : "-"}
                </td>
                <td colSpan={2} className="py-3 px-3.5 text-right text-slate-900 font-khmer text-xs sm:text-sm">
                  និទ្ទេសរួម៖{" "}
                  <span className="text-sm sm:text-base text-blue-950 font-black font-mono ml-1.5 px-2 py-0.5 rounded bg-blue-50 border border-blue-300">
                    {academicSummary?.overallGrade || "A"}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* 8-Tier Grading Scale Legend */}
        <div className="pt-2.5 border-t border-slate-300 text-xs text-slate-600 space-y-2 font-khmer">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 text-xs sm:text-sm">កម្រិតវាយតម្លៃនិទ្ទេសទាំង ៨ ថ្នាក់ (8-Tier Grading Standard)៖</span>
            <span className="text-emerald-700 font-bold text-xs">ពិន្ទុជាប់ចាប់ពី ៥០% (និទ្ទេស C) ឡើងទៅ</span>
          </div>
          <div className="grid grid-cols-4 gap-2 pt-0.5 font-mono text-[10px] sm:text-xs">
            <div className="bg-slate-50 px-2 py-2 rounded-lg border border-slate-200 text-center">
              <strong className="text-emerald-700">A</strong> : 85%-100% (ល្អប្រសើរ)
            </div>
            <div className="bg-slate-50 px-2 py-2 rounded-lg border border-slate-200 text-center">
              <strong className="text-cyan-700">B+</strong> : 80%-84% (ល្អណាស់)
            </div>
            <div className="bg-slate-50 px-2 py-2 rounded-lg border border-slate-200 text-center">
              <strong className="text-blue-700">B</strong> : 70%-79% (ល្អ)
            </div>
            <div className="bg-slate-50 px-2 py-2 rounded-lg border border-slate-200 text-center">
              <strong className="text-teal-700">C+</strong> : 65%-69% (ល្អបង្គួរ)
            </div>
            <div className="bg-slate-50 px-2 py-2 rounded-lg border border-slate-200 text-center">
              <strong className="text-amber-700">C</strong> : 50%-64% (មធ្យម - ជាប់)
            </div>
            <div className="bg-slate-50 px-2 py-2 rounded-lg border border-slate-200 text-center">
              <strong className="text-orange-700">D</strong> : 45%-49% (ខ្សោយ)
            </div>
            <div className="bg-slate-50 px-2 py-2 rounded-lg border border-slate-200 text-center">
              <strong className="text-purple-700">E</strong> : 40%-44% (ខ្សោយណាស់)
            </div>
            <div className="bg-slate-50 px-2 py-2 rounded-lg border border-slate-200 text-center">
              <strong className="text-rose-700">F</strong> : ≤ 39% (ធ្លាក់)
            </div>
          </div>
        </div>

        {/* Official Signatures Area - Dynamic & Customizable for Admin */}
        <div className="pt-6 sm:pt-7 print:pt-4 break-inside-avoid">
          {/* Top Date & Location above Seen & Approved / Rector */}
          <div className="grid grid-cols-2 text-xs text-slate-700 font-khmer mb-2">
            <div></div>
            <div className="text-center">
              <p className="font-semibold text-slate-800 text-xs sm:text-sm">
                {schoolInfo?.issueLocation || "រាជធានីភ្នំពេញ"}, {schoolInfo?.issueDate || formatKhmerDate()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 text-center text-xs sm:text-sm text-slate-900">
            {/* Left Signer: Document Preparer */}
            <div className="flex flex-col justify-between items-center min-h-[140px] sm:min-h-[155px]">
              <div>
                <p className="font-bold text-slate-950 font-khmer text-sm sm:text-base">
                  {schoolInfo?.signer1Title || "អ្នករៀបចំឯកសារ"}
                </p>
                <p className="text-xs text-slate-500 font-khmer mt-0.5">
                  មន្ត្រីកិច្ចការសិក្សា
                </p>
              </div>

              {/* Digital E-Signature Image or Dignified Wet Signing Room */}
              <div className="h-16 sm:h-20 flex items-center justify-center my-1 w-full">
                {schoolInfo?.showESignature && schoolInfo?.signer1Image ? (
                  <img
                    src={schoolInfo.signer1Image}
                    alt="ហត្ថលេខាអ្នករៀបចំឯកសារ"
                    className="h-14 sm:h-18 max-w-[190px] object-contain mx-auto"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className="h-14 sm:h-18" />
                )}
              </div>

              <div className="border-t-2 border-slate-500 w-48 sm:w-56 mx-auto pt-1.5 font-bold text-xs sm:text-sm text-slate-900 font-khmer">
                {schoolInfo?.signer1Name || "ហត្ថលេខា និងកាលបរិច្ឆេទ"}
              </div>
            </div>

            {/* Right Signer: Seen & Approved (Dean / Rector) with Official Red Stamp */}
            <div className="flex flex-col justify-between items-center min-h-[140px] sm:min-h-[155px]">
              <div>
                <p className="font-bold text-slate-950 font-khmer text-sm sm:text-base">
                  {schoolInfo?.signer2Title || "បានឃើញ និងឯកភាព"}
                </p>
                <p className="text-xs text-slate-500 font-khmer mt-0.5">
                  ព្រឹទ្ធបុរស / សាកលវិទ្យាធិការ
                </p>
              </div>

              {/* Digital E-Signature with Authentic Red Stamp Overlay */}
              <div className="relative h-16 sm:h-20 flex items-center justify-center my-1 w-full">
                {schoolInfo?.showESignature && schoolInfo?.signer2Image ? (
                  <img
                    src={schoolInfo.signer2Image}
                    alt="ហត្ថលេខាសាកលវិទ្យាធិការ"
                    className="h-14 sm:h-18 max-w-[190px] object-contain mx-auto relative z-10"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className="h-14 sm:h-18" />
                )}

                {/* Red Circular Stamp Overlay */}
                {schoolInfo?.showESignature && schoolInfo?.officialStampImage && (
                  <img
                    src={schoolInfo.officialStampImage}
                    alt="ត្រាផ្លូវការ"
                    className="w-20 h-20 sm:w-22 sm:h-22 object-contain absolute -top-3.5 right-6 sm:right-10 z-20 pointer-events-none opacity-85 rotate-[-8deg] mix-blend-multiply"
                    crossOrigin="anonymous"
                  />
                )}
              </div>

              <div className="border-t-2 border-slate-500 w-48 sm:w-56 mx-auto pt-1.5 font-bold text-xs sm:text-sm text-slate-900 font-khmer">
                {schoolInfo?.signer2Name || "ត្រា និងហត្ថលេខា"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Share Story Modal */}
      <SocialShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        studentSession={activeStudent}
        schoolInfo={schoolInfo}
      />

      {/* Signature & E-Sign Customization Modal for Admin */}
      {adminSession && (
        <SignatureCustomizerModal
          isOpen={showSigModal}
          onClose={() => setShowSigModal(false)}
        />
      )}
    </div>
  );
}
