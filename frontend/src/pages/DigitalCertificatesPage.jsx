import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import {
  Award,
  Printer,
  Sparkles,
  Download,
  Filter,
  Search,
  CheckCircle2,
  QrCode,
  ShieldCheck,
  ChevronRight,
  Crown,
  FileCheck2,
  PenTool
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useSchool } from "../context/SchoolContext.jsx";
import { getAdminScoringOverview } from "../api/adminApi.js";
import SignatureCustomizerModal from "../components/SignatureCustomizerModal.jsx";
import { formatKhmerDate } from "../utils/signaturePresets.js";

export default function DigitalCertificatesPage() {
  const { adminSession } = useAuth();
  const { schoolInfo } = useSchool();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("honor"); // 'honor' (A) | 'distinction' (B/B+) | 'pass' (C+)
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [qrCodeUrls, setQrCodeUrls] = useState({});
  const [search, setSearch] = useState("");
  const [showSigModal, setShowSigModal] = useState(false);

  const schoolNameKh = schoolInfo?.schoolNameKh || "សាកលវិទ្យាល័យគ្រប់គ្រង និងសេដ្ឋកិច្ច";
  const schoolNameEn = schoolInfo?.schoolNameEn || "UNIVERSITY OF MANAGEMENT AND ECONOMICS";
  const schoolLogo = schoolInfo?.schoolLogoUrl || "/assets/images/app_icon.svg";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getAdminScoringOverview(adminSession?.token);
        if (res.success && res.data?.students) {
          setStudents(res.data.students);
        }
      } catch (err) {
        console.error("Failed to fetch students for certificates", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [adminSession]);

  const getStudentInfo = (s) => {
    const p = s.profile || {};
    return {
      id: s.studentId || p.studentId || s.id || "",
      fullNameKh: s.fullNameKh || p.fullNameKh || s.nameKh || s.fullNameEn || p.fullName || "",
      fullNameEn: s.fullNameEn || p.fullNameEn || s.fullName || p.fullName || "",
      gender: s.gender || p.gender || "ប្រុស",
      room: s.room || p.room || s.class || p.class || "ថ្នាក់ទូទៅ",
      major: s.skill || s.major || p.skill || p.major || p.faculty || "វិទ្យាសាស្ត្រកុំព្យូទ័រ",
      academicYear: schoolInfo?.academicYear || s.academicYear || p.academicYear || "២០២៥-២០២៦",
      faculty: schoolInfo?.faculty || s.faculty || p.faculty || "មហាវិទ្យាល័យឆ្នាំសិក្សាមូលដ្ខាន"
    };
  };

  const getStudentTotal = (s) => {
    if (s.academicSummary?.totalScore != null && !isNaN(s.academicSummary.totalScore)) return Number(s.academicSummary.totalScore);
    return (s.scores || []).reduce((acc, curr) => acc + (Number(curr.score) || 0), 0);
  };

  // Filter students based on category
  const filteredStudents = students.filter((s) => {
    const total = getStudentTotal(s);
    const info = getStudentInfo(s);
    const nameKh = info.fullNameKh;
    const nameEn = info.fullNameEn;
    const id = info.id;

    const matchSearch =
      nameKh.toLowerCase().includes(search.toLowerCase()) ||
      nameEn.toLowerCase().includes(search.toLowerCase()) ||
      id.toLowerCase().includes(search.toLowerCase());

    if (!matchSearch) return false;

    if (selectedCategory === "honor") {
      return total >= 85; // Grade A
    } else if (selectedCategory === "distinction") {
      return total >= 70 && total < 85; // Grade B / B+
    } else {
      return total >= 50; // Passing
    }
  });

  // Generate QR codes for all filtered students
  useEffect(() => {
    const generateQrs = async () => {
      const urls = {};
      for (const st of filteredStudents) {
        const info = getStudentInfo(st);
        const certId = `CERT-2026-${info.id || "000"}`;
        const verifyData = `https://mypintou.edu.kh/verify?id=${encodeURIComponent(certId)}&name=${encodeURIComponent(info.fullNameEn || info.fullNameKh)}&score=${getStudentTotal(st).toFixed(1)}`;
        try {
          const dataUrl = await QRCode.toDataURL(verifyData, {
            width: 120,
            margin: 1,
            color: { dark: "#0f172a", light: "#ffffff" }
          });
          urls[info.id] = dataUrl;
        } catch (e) {
          console.error(e);
        }
      }
      setQrCodeUrls(urls);
    };

    if (filteredStudents.length > 0) {
      generateQrs();
    }
  }, [students, selectedCategory, search]);

  const handlePrintAll = () => {
    if (filteredStudents.length === 0) {
      alert("មិនមាននិស្សិតក្នុងលក្ខខណ្ឌនេះឡើយ!");
      return;
    }
    window.print();
  };

  return (
    <div className="space-y-6 font-khmer">
      {/* Screen Control Header (Hidden when printing) */}
      <div className="no-print space-y-6">
        <div className="rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-600 p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-200 animate-bounce" />
              <span className="text-xs font-bold uppercase tracking-wider text-yellow-100">
                Digital Certificate & Honor Rolls Generator
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black">
              បង្កើតវិញ្ញាបនបត្រ & លិខិតសរសើរស្វ័យប្រវត្តិ (Digital Certificates)
            </h1>
            <p className="text-xs sm:text-sm text-amber-100 max-w-xl leading-relaxed">
              បង្កើតលិខិតសរសើរនិស្សិតឆ្នើម ឬវិញ្ញាបនបត្របញ្ចប់ការសិក្សាស្វ័យប្រវត្តិតាមស្តង់ដារជាតិ A4 Landscape មានភ្ជាប់ QR Code ផ្ទៀងផ្ទាត់ផ្លូវការ។
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setShowSigModal(true)}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs sm:text-sm backdrop-blur-md shadow-lg transition-all cursor-pointer"
              title="កំណត់ហត្ថលេខា ត្រាផ្លូវការ និង E-Signature"
            >
              <PenTool className="w-4 h-4 text-amber-200" />
              <span>កំណត់ហត្ថលេខា & E-Sign</span>
            </button>

            <button
              onClick={handlePrintAll}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-amber-800 hover:bg-amber-50 font-bold text-xs sm:text-sm shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 text-amber-600" />
              <span>បោះពុម្ពវិញ្ញាបនបត្រទាំងអស់ ({filteredStudents.length})</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs & Search */}
        <div className="bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-white/10 p-5 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setSelectedCategory("honor")}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold cursor-pointer transition-all ${
                  selectedCategory === "honor"
                    ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                }`}
              >
                <Crown className="w-3.5 h-3.5" />
                <span>លិខិតសរសើរនិទ្ទេស A (Valedictorian ≥ 85)</span>
              </button>

              <button
                onClick={() => setSelectedCategory("distinction")}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold cursor-pointer transition-all ${
                  selectedCategory === "distinction"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>លិខិតសរសើរនិទ្ទេស B/B+ (High Distinction 70-84)</span>
              </button>

              <button
                onClick={() => setSelectedCategory("pass")}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold cursor-pointer transition-all ${
                  selectedCategory === "pass"
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                }`}
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>វិញ្ញាបនបត្រជាប់ទាំងអស់ (Passed ≥ 50)</span>
              </button>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="ស្វែងរកតាមឈ្មោះ ឬអត្តលេខ..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Printable Certificates Container (Prints as A4 Landscape) */}
      <div className="space-y-12">
        {filteredStudents.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs no-print">
            មិនមាននិស្សិតក្នុងលក្ខខណ្ឌដែលបានជ្រើសរើសឡើយ។
          </div>
        ) : (
          filteredStudents.map((student) => {
            const info = getStudentInfo(student);
            const total = getStudentTotal(student);
            const qrUrl = qrCodeUrls[info.id];
            const certNumber = `CERT-2026-${info.id || "000"}`;

            const isHonor = total >= 85;
            const certTitleKh = isHonor ? "លិខិតសរសើរកិត្តិយស" : "វិញ្ញាបនបត្របញ្ជាក់ការសិក្សា";
            const certTitleEn = isHonor ? "CERTIFICATE OF ACADEMIC EXCELLENCE" : "CERTIFICATE OF ACHIEVEMENT";

            return (
              <div
                key={info.id}
                className="certificate-page relative bg-[#FDFBF7] text-slate-900 rounded-3xl border-8 border-double border-amber-600/60 shadow-2xl p-8 sm:p-12 mx-auto max-w-4xl overflow-hidden font-khmer print:p-8 print:border-8 print:shadow-none print:rounded-none"
                style={{
                  pageBreakAfter: "always",
                  minHeight: "560px"
                }}
              >
                {/* Royal & Luxury Ornaments Background Watermark */}
                <div className="absolute inset-0 border-2 border-amber-500/20 m-3 pointer-events-none rounded-2xl" />
                <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-amber-500/5 blur-2xl pointer-events-none" />

                {/* Top Kingdom Header */}
                <div className="text-center space-y-1 relative z-10 pb-4">
                  <h4 className="text-sm font-bold text-slate-900 tracking-wider">
                    ព្រះរាជាណាចក្រកម្ពុជា
                  </h4>
                  <p className="text-xs font-semibold text-slate-700 tracking-widest">
                    ជាតិ សាសនា ព្រះមហាក្សត្រ
                  </p>
                  <div className="w-16 h-0.5 bg-amber-600/60 mx-auto mt-1" />
                </div>

                {/* University Header */}
                <div className="flex items-center justify-center gap-3.5 py-2 relative z-10">
                  <img src={schoolLogo} alt="Logo" className="w-12 h-12 object-contain shrink-0" />
                  <div className="text-center">
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">
                      {schoolNameKh}
                    </h3>
                    <p className="text-[10px] font-semibold text-slate-600 uppercase font-mono tracking-wider">
                      {schoolNameEn}
                    </p>
                  </div>
                </div>

                {/* Certificate Main Title */}
                <div className="text-center py-4 space-y-1 relative z-10">
                  <h1 className="text-xl sm:text-2xl font-black text-amber-800 tracking-wide">
                    {certTitleKh}
                  </h1>
                  <h2 className="text-[11px] font-bold tracking-widest font-mono text-amber-700/90 uppercase">
                    {certTitleEn}
                  </h2>
                </div>

                {/* Recipient Statement */}
                <div className="text-center space-y-2 py-3 relative z-10 max-w-2xl mx-auto">
                  <p className="text-xs text-slate-600">
                    គណៈគ្រប់គ្រង និងក្រុមប្រឹក្សាសិក្សា សូមបញ្ជាក់ជូនថា៖
                  </p>

                  <div className="py-2">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                      {info.fullNameKh || info.fullNameEn}
                    </h2>
                    <h3 className="text-sm font-bold font-mono text-slate-700 uppercase tracking-wider mt-0.5">
                      {info.fullNameEn || "—"}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    អត្តលេខនិស្សិត៖ <strong className="font-mono text-slate-900">{info.id}</strong> ថ្នាក់៖ <strong className="text-slate-900">{info.room}</strong> ជំនាញ៖ <strong className="text-slate-900">{info.major}</strong>
                  </p>

                  <p className="text-xs text-slate-700 leading-relaxed pt-1">
                    {isHonor
                      ? `ទទួលបានជោគជ័យក្នុងការសិក្សា និងទទួលបានពិន្ទុឆ្នើមលំដាប់កិត្តិយសខ្ពស់បំផុត (និទ្ទេស A) ប្រចាំឆមាស ឆ្នាំសិក្សា ${schoolInfo?.academicYear || info.academicYear}។`
                      : "បានឆ្លងផុតការវាយតម្លៃសិក្សា និងការប្រឡងបញ្ចប់ឆមាសដោយជោគជ័យ ស្របតាមបទដ្ឋានអប់រំ និងស្តង់ដារជាតិ។"}
                  </p>
                </div>

                {/* Score & Honors Badge */}
                <div className="flex items-center justify-center gap-6 py-2 relative z-10 text-xs">
                  <div className="px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-900 font-bold">
                    ពិន្ទុសរុប៖ <span className="font-mono">{total.toFixed(2)} / 100</span>
                  </div>
                  <div className="px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-900 font-bold">
                    និទ្ទេស៖ <span className="font-mono">{student.academicSummary?.overallGrade || (total >= 85 ? "A" : total >= 70 ? "B" : "C")}</span>
                  </div>
                </div>

                {/* Bottom Footer: Verification QR Code & Official Signatures */}
                <div className="grid grid-cols-3 items-end gap-4 pt-6 mt-4 border-t border-amber-600/20 relative z-10 text-xs">
                  {/* Verification QR Code */}
                  <div className="flex items-center gap-2.5">
                    {qrUrl ? (
                      <img src={qrUrl} alt="Verify QR" className="w-16 h-16 rounded-lg border border-slate-300 p-0.5 bg-white shadow-xs" />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-slate-200 animate-pulse" />
                    )}
                    <div className="text-[10px] text-slate-500 space-y-0.5">
                      <div className="flex items-center gap-1 font-bold text-slate-700">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>ស្កេនផ្ទៀងផ្ទាត់</span>
                      </div>
                      <div className="font-mono">{certNumber}</div>
                      <div>សុពលភាពផ្លូវការ</div>
                    </div>
                  </div>

                  {/* Date Center */}
                  <div className="text-center text-[11px] text-slate-700">
                    <div className="font-semibold text-slate-900">
                      {schoolInfo.issueLocation || "រាជធានីភ្នំពេញ"}, {schoolInfo.issueDate || formatKhmerDate()}
                    </div>
                    <div className="text-slate-500 text-[10px] mt-0.5">កាលបរិច្ឆេទចេញលិខិត</div>
                  </div>

                  {/* Official Dean Seal & Signature */}
                  <div className="text-center">
                    <p className="text-[11px] text-slate-700 mb-1 font-medium">
                      {schoolInfo.signer2Title || "សាកលវិទ្យាធិការ / នាយកសាលា"}
                    </p>
                    <div className="relative h-16 flex items-center justify-center">
                      {schoolInfo.showESignature && schoolInfo.signer2Image ? (
                        <img
                          src={schoolInfo.signer2Image}
                          alt="Signature"
                          className="h-14 max-w-[170px] object-contain relative z-10"
                        />
                      ) : (
                        <div className="h-14" />
                      )}
                      {schoolInfo.showESignature && schoolInfo.officialStampImage && (
                        <img
                          src={schoolInfo.officialStampImage}
                          alt="Official Stamp"
                          className="w-20 h-20 object-contain absolute -top-3 right-0 z-20 pointer-events-none opacity-85 rotate-[-8deg] mix-blend-multiply"
                        />
                      )}
                    </div>
                    <div className="border-t border-slate-500 pt-1 font-bold text-slate-900 text-xs">
                      {schoolInfo.signer2Name || "ហត្ថលេខា និងត្រាផ្លូវការ"}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Signature & E-Sign Customization Modal */}
      <SignatureCustomizerModal
        isOpen={showSigModal}
        onClose={() => setShowSigModal(false)}
      />
    </div>
  );
}
