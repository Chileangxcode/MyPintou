import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  X,
  FileText,
  AlertTriangle,
  Users,
  Sparkles,
  ArrowRight
} from "lucide-react";

export default function BulkStudentImportModal({ isOpen, onClose, onImportSuccess, existingStudents = [] }) {
  const [parsedRows, setParsedRows] = useState([]);
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filterValidOnly, setFilterValidOnly] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const existingIds = new Set(existingStudents.map((s) => (s.profile?.studentId || s.studentId || "").trim().toLowerCase()));

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        "អត្តលេខ (Student ID)": "STU-2026-001",
        "ឈ្មោះខ្មែរ (Khmer Name)": "ចាន់ សុខា",
        "ឈ្មោះឡាតាំង (Latin Name)": "Chan Sokha",
        "ភេទ (Gender)": "ប្រុស",
        "ថ្នាក់/បន្ទប់ (Room/Class)": "IT-Year3-A",
        "ជំនាញ (Major)": "វិទ្យាសាស្ត្រកុំព្យូទ័រ (Computer Science)",
        "លេខទូរស័ព្ទ (Phone)": "012345678"
      },
      {
        "អត្តលេខ (Student ID)": "STU-2026-002",
        "ឈ្មោះខ្មែរ (Khmer Name)": "គង់ ម៉ាលី",
        "ឈ្មោះឡាតាំង (Latin Name)": "Kong Maly",
        "ភេទ (Gender)": "ស្រី",
        "ថ្នាក់/បន្ទប់ (Room/Class)": "IT-Year3-A",
        "ជំនាញ (Major)": "វិទ្យាសាស្ត្រកុំព្យូទ័រ (Computer Science)",
        "លេខទូរស័ព្ទ (Phone)": "098765432"
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "គំរូបញ្ជីសិស្ស");
    XLSX.writeFile(workbook, "គំរូឯកសារ_បញ្ចូលបញ្ជីសិស្ស_MyPintou.xlsx");
  };

  const processFile = (file) => {
    if (!file) return;
    setFileName(file.name);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        const seenIds = new Set();
        const validated = json.map((row, index) => {
          // Normalize column headers
          const id = (
            row["អត្តលេខ (Student ID)"] ||
            row["អត្តលេខ"] ||
            row["Student ID"] ||
            row["studentId"] ||
            row["ID"] ||
            row["id"] ||
            ""
          ).toString().trim();

          const nameKh = (
            row["ឈ្មោះខ្មែរ (Khmer Name)"] ||
            row["ឈ្មោះខ្មែរ"] ||
            row["Khmer Name"] ||
            row["fullNameKh"] ||
            row["ឈ្មោះ"] ||
            ""
          ).toString().trim();

          const nameEn = (
            row["ឈ្មោះឡាតាំង (Latin Name)"] ||
            row["ឈ្មោះឡាតាំង"] ||
            row["Latin Name"] ||
            row["fullName"] ||
            row["Name"] ||
            ""
          ).toString().trim();

          const gender = (
            row["ភេទ (Gender)"] ||
            row["ភេទ"] ||
            row["Gender"] ||
            row["gender"] ||
            "ប្រុស"
          ).toString().trim();

          const room = (
            row["ថ្នាក់/បន្ទប់ (Room/Class)"] ||
            row["ថ្នាក់"] ||
            row["បន្ទប់"] ||
            row["Room"] ||
            row["Class"] ||
            row["room"] ||
            ""
          ).toString().trim();

          const major = (
            row["ជំនាញ (Major)"] ||
            row["ជំនាញ"] ||
            row["Major"] ||
            row["major"] ||
            ""
          ).toString().trim();

          const phone = (
            row["លេខទូរស័ព្ទ (Phone)"] ||
            row["លេខទូរស័ព្ទ"] ||
            row["Phone"] ||
            row["phone"] ||
            ""
          ).toString().trim();

          const errors = [];
          if (!id) errors.push("ខ្វះអត្តលេខ (Student ID)");
          if (!nameKh && !nameEn) errors.push("ខ្វះឈ្មោះសិស្ស");

          const idLower = id.toLowerCase();
          if (id && existingIds.has(idLower)) {
            errors.push("ស្ទួនអត្តលេខដែលមានក្នុងប្រព័ន្ធស្រាប់");
          }
          if (id && seenIds.has(idLower)) {
            errors.push("ស្ទួនអត្តលេខក្នុង File នេះ");
          }
          if (id) seenIds.add(idLower);

          return {
            rowNumber: index + 2,
            studentId: id,
            fullNameKh: nameKh || nameEn,
            fullName: nameEn || nameKh,
            gender: gender || "ប្រុស",
            room: room || "ថ្នាក់ថ្មី",
            major: major || "ទូទៅ",
            phone,
            isValid: errors.length === 0,
            errors
          };
        });

        setParsedRows(validated);
      } catch (err) {
        console.error("Excel parse error:", err);
        alert("មិនអាចអានឯកសារនេះបានឡើយ។ សូមប្រាកដថាឯកសារជាទម្រង់ .xlsx ឬ .csv ត្រឹមត្រូវ។");
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const validRows = parsedRows.filter((r) => r.isValid);
  const invalidRows = parsedRows.filter((r) => !r.isValid);

  const handleConfirmImport = () => {
    if (validRows.length === 0) {
      alert("មិនមានជួរទិន្នន័យត្រឹមត្រូវសម្រាប់នាំចូលឡើយ!");
      return;
    }

    const formattedStudents = validRows.map((r) => ({
      id: r.studentId,
      profile: {
        studentId: r.studentId,
        fullNameKh: r.fullNameKh,
        fullName: r.fullName,
        gender: r.gender,
        room: r.room,
        major: r.major,
        phone: r.phone,
        status: "កំពុងសិក្សា",
        academicYear: "២០២៤-២០២៥"
      },
      academicSummary: {
        attendance: 10,
        totalQHA: 0,
        midterm: 0,
        finalScore: 0,
        totalScore: 10,
        overallGrade: "F",
        rank: null,
        status: "កំពុងសិក្សា"
      },
      scores: [
        { assessment: "វត្តមាន (Attendance)", score: 10, maxScore: 10, rawScore: "10/10", percentage: 100 },
        { assessment: "កិច្ចការ និងកម្រងសំណួរ (Quizzes)", score: 0, maxScore: 5, rawScore: "0/5", percentage: 0 },
        { assessment: "សរុបពិន្ទុ (Q,H,A)", score: 0, maxScore: 15, rawScore: "0/15", percentage: 0 },
        { assessment: "ប្រឡងពាក់កណ្តាលឆមាស (Midterm)", score: 0, maxScore: 25, rawScore: "0/25", percentage: 0 },
        { assessment: "ប្រឡងបញ្ចប់ឆមាស (Final)", score: 0, maxScore: 50, rawScore: "0/50", percentage: 0 }
      ]
    }));

    if (onImportSuccess) {
      onImportSuccess(formattedStudents);
    }
    onClose();
  };

  const rowsToDisplay = filterValidOnly ? validRows : parsedRows;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-khmer animate-fade-in">
      <div className="w-full max-w-4xl bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                នាំចូលបញ្ជីឈ្មោះសិស្សពី Excel (Bulk Student Import)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                អូសទម្លាក់ឯកសារ Excel (.xlsx, .xls, .csv) ដើម្បីបញ្ចូលសិស្សរាប់រយនាក់ក្នុងពេលតែមួយ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
              title="ទាញយកគំរូ Excel"
            >
              <Download className="w-3.5 h-3.5 text-emerald-500" />
              <span>ទាញយកគំរូ (.xlsx)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {parsedRows.length === 0 ? (
            /* Dropzone */
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                isDragging
                  ? "border-emerald-500 bg-emerald-500/10 scale-[1.01]"
                  : "border-slate-300 dark:border-white/15 hover:border-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    processFile(e.target.files[0]);
                  }
                }}
              />

              <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/10">
                <UploadCloud className="w-8 h-8 animate-bounce" />
              </div>

              <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                ចុចទីនេះ ឬទម្លាក់ឯកសារ Excel/CSV ចូលទីនេះ
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
                គាំទ្រទ្រង់ទ្រាយ .xlsx, .xls និង .csv។ ប្រព័ន្ធនឹងធ្វើការផ្ទៀងផ្ទាត់ឈ្មោះ និងអត្តលេខដោយស្វ័យប្រវត្តិ។
              </p>
            </div>
          ) : (
            /* Preview & Validation Table */
            <div className="space-y-3">
              {/* Telemetry pill */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 text-xs">
                <div className="flex items-center gap-3">
                  <span className="text-slate-600 dark:text-slate-300">
                    ឯកសារ៖ <strong className="text-cyan-500 font-mono">{fileName}</strong>
                  </span>
                  <span>•</span>
                  <span>សរុប៖ <strong className="font-mono">{parsedRows.length}</strong></span>
                  <span>•</span>
                  <span className="text-emerald-500 font-semibold">
                    ✓ ត្រឹមត្រូវ៖ <strong className="font-mono">{validRows.length}</strong>
                  </span>
                  {invalidRows.length > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-rose-500 font-semibold">
                        ✗ មានកំហុស៖ <strong className="font-mono">{invalidRows.length}</strong>
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFilterValidOnly(!filterValidOnly)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                      filterValidOnly
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {filterValidOnly ? "បង្ហាញតែជួរត្រឹមត្រូវ" : "បង្ហាញទាំងអស់"}
                  </button>
                  <button
                    onClick={() => { setParsedRows([]); setFileName(""); }}
                    className="text-xs text-slate-400 hover:text-rose-400 underline cursor-pointer"
                  >
                    ជ្រើសឯកសារផ្សេង
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/10 max-h-72">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-white/10">
                    <tr>
                      <th className="p-2.5 pl-3">ជួរ</th>
                      <th className="p-2.5">ស្ថានភាព</th>
                      <th className="p-2.5">អត្តលេខ</th>
                      <th className="p-2.5">ឈ្មោះខ្មែរ</th>
                      <th className="p-2.5">ឈ្មោះឡាតាំង</th>
                      <th className="p-2.5">ភេទ</th>
                      <th className="p-2.5">ថ្នាក់/បន្ទប់</th>
                      <th className="p-2.5">ជំនាញ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {rowsToDisplay.map((row) => (
                      <tr
                        key={row.rowNumber}
                        className={row.isValid ? "hover:bg-slate-50 dark:hover:bg-slate-800/30" : "bg-rose-500/10 hover:bg-rose-500/15"}
                      >
                        <td className="p-2.5 pl-3 font-mono text-slate-400">{row.rowNumber}</td>
                        <td className="p-2.5">
                          {row.isValid ? (
                            <span className="inline-flex items-center gap-1 text-emerald-500 font-bold text-[10px]">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>ត្រឹមត្រូវ</span>
                            </span>
                          ) : (
                            <span
                              title={row.errors.join(", ")}
                              className="inline-flex items-center gap-1 text-rose-500 font-bold text-[10px]"
                            >
                              <AlertCircle className="w-3 h-3" />
                              <span>{row.errors[0]}</span>
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 font-mono font-bold text-slate-800 dark:text-slate-200">
                          {row.studentId || "—"}
                        </td>
                        <td className="p-2.5 text-slate-800 dark:text-slate-200">{row.fullNameKh || "—"}</td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-400 font-mono">{row.fullName || "—"}</td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-400">{row.gender}</td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-400">{row.room}</td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-400 truncate max-w-xs">{row.major}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/10 shrink-0">
          <span className="text-xs text-slate-400">
            {validRows.length > 0 && `បានត្រៀមសិស្សត្រឹមត្រូវចំនួន ${validRows.length} នាក់សម្រាប់បញ្ចូល`}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold cursor-pointer"
            >
              បោះបង់
            </button>
            <button
              disabled={validRows.length === 0}
              onClick={handleConfirmImport}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg ${
                validRows.length > 0
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 cursor-pointer hover:scale-105 active:scale-95"
                  : "bg-slate-300 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
              }`}
            >
              <span>យល់ព្រមនាំចូល ({validRows.length} នាក់)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
