import React, { useState, useEffect, useRef } from "react";
import {
  X,
  PenTool,
  Upload,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  ShieldCheck,
  Calendar,
  MapPin,
  RefreshCw,
  FileText,
  Award
} from "lucide-react";
import { useSchool } from "../context/SchoolContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import {
  DEFAULT_OFFICIAL_STAMP,
  DEFAULT_RECTOR_SIGNATURE,
  DEFAULT_LECTURER_SIGNATURE,
  formatKhmerDate
} from "../utils/signaturePresets.js";

export default function SignatureCustomizerModal({ isOpen, onClose, onSaveSuccess }) {
  const { schoolInfo, saveSignatureSettingsToGoogleSheet } = useSchool();
  const { adminSession } = useAuth();

  const [form, setForm] = useState({
    signer1Title: schoolInfo?.signer1Title || "អ្នករៀបចំឯកសារ",
    signer1Name: schoolInfo?.signer1Name || "ហត្ថលេខា និងកាលបរិច្ឆេទ",
    signer1Image: schoolInfo?.signer1Image || DEFAULT_LECTURER_SIGNATURE,
    signer2Title: schoolInfo?.signer2Title || "បានឃើញ និងឯកភាព",
    signer2Name: schoolInfo?.signer2Name || "ត្រា និងហត្ថលេខា",
    signer2Image: schoolInfo?.signer2Image || DEFAULT_RECTOR_SIGNATURE,
    officialStampImage: schoolInfo?.officialStampImage || DEFAULT_OFFICIAL_STAMP,
    showESignature: schoolInfo?.showESignature !== undefined ? schoolInfo.showESignature : true,
    issueLocation: schoolInfo?.issueLocation || "រាជធានីភ្នំពេញ",
    issueDate: schoolInfo?.issueDate || ""
  });

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fileInputSigner1 = useRef(null);
  const fileInputSigner2 = useRef(null);
  const fileInputStamp = useRef(null);

  // Sync state whenever modal opens or schoolInfo changes
  useEffect(() => {
    if (isOpen) {
      setForm({
        signer1Title: schoolInfo?.signer1Title || "អ្នករៀបចំឯកសារ",
        signer1Name: schoolInfo?.signer1Name || "ហត្ថលេខា និងកាលបរិច្ឆេទ",
        signer1Image: schoolInfo?.signer1Image || DEFAULT_LECTURER_SIGNATURE,
        signer2Title: schoolInfo?.signer2Title || "បានឃើញ និងឯកភាព",
        signer2Name: schoolInfo?.signer2Name || "ត្រា និងហត្ថលេខា",
        signer2Image: schoolInfo?.signer2Image || DEFAULT_RECTOR_SIGNATURE,
        officialStampImage: schoolInfo?.officialStampImage || DEFAULT_OFFICIAL_STAMP,
        showESignature: schoolInfo?.showESignature !== undefined ? schoolInfo.showESignature : true,
        issueLocation: schoolInfo?.issueLocation || "រាជធានីភ្នំពេញ",
        issueDate: schoolInfo?.issueDate || ""
      });
      setFeedback(null);
    }
  }, [isOpen, schoolInfo]);

  if (!isOpen) return null;

  // Presets for quick switching
  const applyTranscriptPreset = () => {
    setForm((prev) => ({
      ...prev,
      signer1Title: "អ្នករៀបចំឯកសារ",
      signer1Name: prev.signer1Name && prev.signer1Name !== "បណ្ឌិត ជា សុភ័ក្ត្រ" ? prev.signer1Name : "ហត្ថលេខា និងកាលបរិច្ឆេទ",
      signer2Title: "បានឃើញ និងឯកភាព",
      signer2Name: prev.signer2Name && prev.signer2Name !== "ឯកឧត្តម បណ្ឌិត ហេង វ៉ាន់ដា" ? prev.signer2Name : "ត្រា និងហត្ថលេខា"
    }));
  };

  const applyCertificatePreset = () => {
    setForm((prev) => ({
      ...prev,
      signer1Title: "សាស្រ្តាចារ្យទទួលបន្ទុក",
      signer1Name: prev.signer1Name && prev.signer1Name !== "ហត្ថលេខា និងកាលបរិច្ឆេទ" ? prev.signer1Name : "បណ្ឌិត ជា សុភ័ក្ត្រ",
      signer2Title: "ប្រធានដេប៉ាតឺម៉ង់ / សាកលវិទ្យាធិការ",
      signer2Name: prev.signer2Name && prev.signer2Name !== "ត្រា និងហត្ថលេខា" ? prev.signer2Name : "ឯកឧត្តម បណ្ឌិត ហេង វ៉ាន់ដា"
    }));
  };

  // Handle image upload and convert to base64 Data URL
  const handleFileUpload = (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("សូមជ្រើសរើសឯកសារជារូបភាព (PNG, JPG, SVG)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setForm((prev) => ({
        ...prev,
        [field]: event.target.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const token = adminSession?.token || localStorage.getItem("mypintou_admin_token") || "MyPintou#Sec2026$X9z";
      const res = await saveSignatureSettingsToGoogleSheet(token, form);
      if (res && res.success) {
        setFeedback({ type: "success", text: res.message || "បានរក្សាទុកការកំណត់ជោគជ័យ!" });
        if (onSaveSuccess) onSaveSuccess();
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setFeedback({ type: "error", text: res?.message || "មិនអាចរក្សាទុកការកំណត់បានទេ។" });
      }
    } catch (err) {
      setFeedback({ type: "error", text: err.message || "កំហុសបច្ចេកទេសក្នុងការរក្សាទុក។" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 font-khmer">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 dark:border-white/10 flex items-center justify-between bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                កំណត់ហត្ថលេខា ត្រាផ្លូវការ & E-Signature (Admin)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                កំណត់ហត្ថលេខាឌីជីថល និងត្រាផ្លូវការសម្រាប់ព្រឹត្តិបត្រពិន្ទុ និងវិញ្ញាបនបត្រ (រក្សាទុកក្នុងប្រព័ន្ធ Cloud Configuration)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-slate-700 dark:text-slate-300">
          
          {feedback && (
            <div
              className={`p-3.5 rounded-2xl flex items-center gap-2.5 text-xs font-semibold ${
                feedback.type === "success"
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                  : "bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30"
              }`}
            >
              {feedback.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{feedback.text}</span>
            </div>
          )}

          {/* Quick Preset Template Buttons */}
          <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>ទម្រង់គំរូរហ័ស (Quick Templates)៖</span>
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={applyTranscriptPreset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer text-xs shadow-xs transition-all hover:scale-105 active:scale-95"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>ព្រឹត្តិបត្រពិន្ទុ (អ្នករៀបចំឯកសារ & បានឃើញ និងឯកភាព)</span>
              </button>
              <button
                type="button"
                onClick={applyCertificatePreset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold cursor-pointer text-xs shadow-xs transition-all hover:scale-105 active:scale-95"
              >
                <Award className="w-3.5 h-3.5" />
                <span>វិញ្ញាបនបត្រ (សាស្រ្តាចារ្យ & សាកលវិទ្យាធិការ)</span>
              </button>
            </div>
          </div>

          {/* Toggle E-Sign Mode */}
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 dark:text-white block text-sm">
                បង្ហាញ E-Signature & ត្រាលើឯកសារ (Digital E-Signature Mode)
              </span>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                បើកដើម្បីបង្ហាញហត្ថលេខាឌីជីថល និងត្រាស្វ័យប្រវត្តិកាលណាព្រីន។ ប្រសិនបើបិទ ប្រព័ន្ធនឹងទុករន្ធទំនេរសម្រាប់ចុះហត្ថលេខាផ្ទាល់ដៃ (Wet Signature)។
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={form.showESignature}
                onChange={(e) => setForm({ ...form, showESignature: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {/* Realtime Live Preview on Document */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/90 border-2 border-dashed border-cyan-500/40 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="font-bold text-xs uppercase tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                <span>ទិដ្ឋភាពជាក់ស្តែងនៃហត្ថលេខា & ត្រាលើទម្រង់ (Live Preview)</span>
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                {form.issueLocation || "រាជធានីភ្នំពេញ"}, {form.issueDate || formatKhmerDate()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
              {/* Preview Signer 1 */}
              <div className="space-y-2">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-xs">{form.signer1Title || "អ្នករៀបចំឯកសារ"}</p>
                  <p className="text-[10px] text-slate-400">មន្ត្រីកិច្ចការសិក្សា</p>
                </div>
                <div className="h-16 flex items-center justify-center">
                  {form.showESignature && form.signer1Image ? (
                    <img src={form.signer1Image} alt="Preview 1" className="h-14 max-w-[150px] object-contain" />
                  ) : (
                    <div className="h-14 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg w-32 flex items-center justify-center text-[10px] text-slate-400">
                      កន្លែងចុះហត្ថលេខាផ្ទាល់ដៃ
                    </div>
                  )}
                </div>
                <div className="border-t border-slate-400 w-36 mx-auto pt-1 font-bold text-[11px] text-slate-800 dark:text-slate-200">
                  {form.signer1Name || "ហត្ថលេខា និងកាលបរិច្ឆេទ"}
                </div>
              </div>

              {/* Preview Signer 2 */}
              <div className="space-y-2">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-xs">{form.signer2Title || "បានឃើញ និងឯកភាព"}</p>
                  <p className="text-[10px] text-slate-400">ព្រឹទ្ធបុរស / សាកលវិទ្យាធិការ</p>
                </div>
                <div className="relative h-16 flex items-center justify-center">
                  {form.showESignature && form.signer2Image ? (
                    <img src={form.signer2Image} alt="Preview 2" className="h-14 max-w-[150px] object-contain relative z-10" />
                  ) : (
                    <div className="h-14 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg w-32 flex items-center justify-center text-[10px] text-slate-400">
                      កន្លែងចុះហត្ថលេខាផ្ទាល់ដៃ
                    </div>
                  )}
                  {form.showESignature && form.officialStampImage && (
                    <img
                      src={form.officialStampImage}
                      alt="Stamp"
                      className="w-18 h-18 object-contain absolute -top-2 right-4 z-20 pointer-events-none opacity-85 rotate-[-8deg] mix-blend-multiply"
                    />
                  )}
                </div>
                <div className="border-t border-slate-400 w-36 mx-auto pt-1 font-bold text-[11px] text-slate-800 dark:text-slate-200">
                  {form.signer2Name || "ត្រា និងហត្ថលេខា"}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Signer 1: Lecturer / Teacher / Preparer */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2">
                <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-emerald-500" />
                  <span>អ្នកចុះហត្ថលេខាទី ១ (ខាងឆ្វេង)</span>
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold block">តួនាទី / ចំណងជើង (Signer 1 Title)៖</label>
                <input
                  type="text"
                  value={form.signer1Title}
                  onChange={(e) => setForm({ ...form, signer1Title: e.target.value })}
                  placeholder="ឧ. អ្នករៀបចំឯកសារ / មន្ត្រីកិច្ចការសិក្សា..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs"
                />
                {/* Quick Title Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {["អ្នករៀបចំឯកសារ", "មន្ត្រីកិច្ចការសិក្សា", "សាស្រ្តាចារ្យទទួលបន្ទុក", "ប្រធានដេប៉ាតឺម៉ង់"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm({ ...form, signer1Title: t })}
                      className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-[10px] text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold block">គោត្តនាម និងនាមពេញ ឬចំណារ (Signer 1 Full Name)៖</label>
                <input
                  type="text"
                  value={form.signer1Name}
                  onChange={(e) => setForm({ ...form, signer1Name: e.target.value })}
                  placeholder="ឧ. ហត្ថលេខា និងកាលបរិច្ឆេទ ឬ បណ្ឌិត ជា សុភ័ក្ត្រ..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs"
                />
                {/* Quick Name Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {["ហត្ថលេខា និងកាលបរិច្ឆេទ", "បណ្ឌិត ជា សុភ័ក្ត្រ", "លោក គង់ សុជាតិ"].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setForm({ ...form, signer1Name: n })}
                      className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-[10px] text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Signer 1 E-Signature Image Preview & Controls */}
              <div className="space-y-2 pt-2">
                <label className="font-semibold block">រូបភាពហត្ថលេខាឌីជីថល (E-Signature)៖</label>
                
                <div className="h-24 w-full rounded-xl bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-white/10 flex items-center justify-center p-2 relative group overflow-hidden">
                  {form.signer1Image ? (
                    <img
                      src={form.signer1Image}
                      alt="Signer 1 E-Sign"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-slate-400 italic">មិនទាន់មានហត្ថលេខា</span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputSigner1}
                    onChange={(e) => handleFileUpload(e, "signer1Image")}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputSigner1.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold cursor-pointer shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload រូបភាព</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setForm({ ...form, signer1Image: DEFAULT_LECTURER_SIGNATURE })}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 font-semibold cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>ហត្ថលេខាគំរូ</span>
                  </button>

                  {form.signer1Image && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, signer1Image: "" })}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/60 font-semibold cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>ដកចេញ</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Signer 2: Rector / Dean / Approver */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2">
                <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-500" />
                  <span>អ្នកចុះហត្ថលេខាទី ២ (ខាងស្តាំ - អមដោយត្រា)</span>
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold block">តួនាទី / ចំណងជើង (Signer 2 Title)៖</label>
                <input
                  type="text"
                  value={form.signer2Title}
                  onChange={(e) => setForm({ ...form, signer2Title: e.target.value })}
                  placeholder="ឧ. បានឃើញ និងឯកភាព / សាកលវិទ្យាធិការ..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs"
                />
                {/* Quick Title Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {["បានឃើញ និងឯកភាព", "ព្រឹទ្ធបុរស / សាកលវិទ្យាធិការ", "សាកលវិទ្យាធិការ", "ព្រឹទ្ធបុរស"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm({ ...form, signer2Title: t })}
                      className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-[10px] text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold block">គោត្តនាម និងនាមពេញ ឬចំណារ (Signer 2 Full Name)៖</label>
                <input
                  type="text"
                  value={form.signer2Name}
                  onChange={(e) => setForm({ ...form, signer2Name: e.target.value })}
                  placeholder="ឧ. ត្រា និងហត្ថលេខា ឬ ឯកឧត្តម បណ្ឌិត ហេង វ៉ាន់ដា..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs"
                />
                {/* Quick Name Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {["ត្រា និងហត្ថលេខា", "ឯកឧត្តម បណ្ឌិត ហេង វ៉ាន់ដា", "បណ្ឌិត ស៊ុន ចាន់ថុល"].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setForm({ ...form, signer2Name: n })}
                      className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-[10px] text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Signer 2 E-Signature Image Preview & Controls */}
              <div className="space-y-2 pt-2">
                <label className="font-semibold block">រូបភាពហត្ថលេខាឌីជីថល (E-Signature)៖</label>
                
                <div className="h-24 w-full rounded-xl bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-white/10 flex items-center justify-center p-2 relative group overflow-hidden">
                  {form.signer2Image ? (
                    <img
                      src={form.signer2Image}
                      alt="Signer 2 E-Sign"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-slate-400 italic">មិនទាន់មានហត្ថលេខា</span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputSigner2}
                    onChange={(e) => handleFileUpload(e, "signer2Image")}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputSigner2.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold cursor-pointer shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload រូបភាព</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setForm({ ...form, signer2Image: DEFAULT_RECTOR_SIGNATURE })}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 font-semibold cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>ហត្ថលេខាគំរូ</span>
                  </button>

                  {form.signer2Image && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, signer2Image: "" })}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/60 font-semibold cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>ដកចេញ</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Section: Official University Seal / Stamp */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2">
              <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span>ត្រាផ្លូវការរបស់សាលា (Official Red University Seal / Stamp)</span>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-28 h-28 rounded-2xl bg-white dark:bg-slate-900 border-2 border-dashed border-red-300 dark:border-red-900/50 p-2 flex items-center justify-center shrink-0 shadow-inner">
                {form.officialStampImage ? (
                  <img
                    src={form.officialStampImage}
                    alt="Official Stamp"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <span className="text-slate-400 text-center text-[10px]">មិនទាន់មានត្រា</span>
                )}
              </div>

              <div className="space-y-3 flex-1 w-full">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  ត្រាក្រហមផ្លូវការរបស់គ្រឹះស្ថានសិក្សា នឹងត្រូវបានបោះពុម្ពត្រួតលើហត្ថលេខារបស់សាកលវិទ្យាធិការដោយស្វ័យប្រវត្តិតាមបទដ្ឋានឯកសារផ្លូវការ។
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputStamp}
                    onChange={(e) => handleFileUpload(e, "officialStampImage")}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputStamp.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold cursor-pointer shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload រូបត្រាក្រហម</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setForm({ ...form, officialStampImage: DEFAULT_OFFICIAL_STAMP })}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 font-semibold cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>ត្រាក្រហមផ្លូវការគំរូ</span>
                  </button>

                  {form.officialStampImage && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, officialStampImage: "" })}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/60 font-semibold cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>ដកចេញ</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section: Location and Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-white/10">
            <div className="space-y-1.5">
              <label className="font-semibold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                <span>រាជធានី / ខេត្ត ចេញលិខិត (Location)៖</span>
              </label>
              <input
                type="text"
                value={form.issueLocation}
                onChange={(e) => setForm({ ...form, issueLocation: e.target.value })}
                placeholder="ឧ. រាជធានីភ្នំពេញ..."
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                <span>កាលបរិច្ឆេទចេញលិខិត (Issue Date)៖</span>
              </label>
              <input
                type="text"
                value={form.issueDate}
                onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
                placeholder={`ទុកទំនេរដើម្បីប្រើថ្ងៃស្វ័យប្រវត្តិ (${formatKhmerDate()})`}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs"
              />
              <span className="text-[10px] text-slate-400 block">
                បច្ចុប្បន្ន៖ {form.issueDate || formatKhmerDate()}
              </span>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-slate-900/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            បិទ
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>កំពុងរក្សាទុកការកំណត់...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>រក្សាទុកការកំណត់ (Save Configuration)</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
