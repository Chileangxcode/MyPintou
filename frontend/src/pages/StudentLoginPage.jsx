import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useSchool } from "../context/SchoolContext.jsx";
import RobotMascot from "../components/RobotMascot.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import BrandLogo from "../components/BrandLogo.jsx";

export default function StudentLoginPage() {
  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [validationError, setValidationError] = useState("");
  const [robotStatus, setRobotStatus] = useState("idle");

  const { loginStudent, loading, error } = useAuth();
  const { schoolInfo } = useSchool();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");
    setRobotStatus("idle");

    const trimmedName = studentName.trim();
    const trimmedId = studentId.trim();

    if (!trimmedName) {
      setValidationError("សូមបញ្ចូលឈ្មោះនិស្សិតរបស់អ្នក (ឈ្មោះខ្មែរ ឬ អក្សរឡាតាំង)។");
      setRobotStatus("error");
      return;
    }
    if (!trimmedId) {
      setValidationError("សូមបញ្ចូលលេខសម្គាល់និស្សិត (Student ID) ជាពាក្យសម្ងាត់របស់អ្នក។");
      setRobotStatus("error");
      return;
    }

    const res = await loginStudent(trimmedName, trimmedId);
    if (res.success) {
      setRobotStatus("success");
      setTimeout(() => {
        navigate("/student/dashboard");
      }, 500);
    } else {
      setRobotStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col justify-between relative overflow-hidden font-['Kantumruy_Pro'] selection:bg-blue-600 selection:text-white">
      {/* Dynamic Aurora & Cyber Grid Ambient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="cyber-grid absolute inset-0 opacity-40 dark:opacity-30" />
        <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-blue-600/20 mix-blend-screen filter blur-[130px] animate-aurora-1" />
        <div className="absolute top-[20%] -right-[20%] w-[60vw] h-[60vw] rounded-full bg-purple-600/20 mix-blend-screen filter blur-[130px] animate-aurora-2" />
        <div className="absolute -bottom-[20%] left-[20%] w-[80vw] h-[80vw] rounded-full bg-indigo-600/20 mix-blend-screen filter blur-[130px] animate-aurora-3" />
      </div>

      {/* Top Navbar */}
      <header className="relative z-20 w-full px-4 sm:px-8 py-5 flex items-center justify-between border-b border-white/[0.06] backdrop-blur-md bg-[#0B0F19]/40">
        <Link to="/" className="flex items-center gap-3.5 group">
          <BrandLogo size="md" showSubtitle={true} />
        </Link>
        <ThemeToggle />
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 flex flex-col justify-center items-center px-4 py-8">
        <div className="max-w-md w-full relative pt-14">
          {/* Floating Robot Mascot */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
            <RobotMascot status={robotStatus} />
          </div>

          <div className="relative p-[1px] rounded-[32px] bg-gradient-to-b from-cyan-400/30 via-white/10 to-indigo-500/30 shadow-[0_25px_70px_rgba(0,0,0,0.7)]">
            <div className="bg-[#0c1427]/85 backdrop-blur-2xl rounded-[31px] p-6 sm:p-8 pt-20 space-y-6">
              <div className="text-center space-y-1.5 pt-2">
                {/* Dynamic School Identity Header */}
                <div className="flex items-center justify-center gap-2 mb-1">
                  <img
                    src={schoolInfo?.schoolLogoUrl || "/assets/images/app_icon.svg"}
                    alt="School Logo"
                    className="w-7 h-7 object-contain rounded-lg"
                    onError={(e) => { e.currentTarget.src = "/assets/images/app_icon.svg"; }}
                  />
                  <span className="text-xs font-bold text-cyan-300 font-khmer">
                    {schoolInfo?.schoolNameKh || "សាកលវិទ្យាល័យជាតិ"}
                  </span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[11px] font-semibold text-cyan-400 font-khmer">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span>ច្រកចូលនិស្សិត (Student Portal)</span>
                </div>
                <h2 className="text-2xl font-black text-white font-khmer tracking-wide">
                  ចូលពិនិត្យលទ្ធផលសិក្សា
                </h2>
                <p className="text-xs text-slate-300/70 font-khmer">
                  និស្សិតអាចប្រើឈ្មោះជាភាសាខ្មែរ ឬ អក្សរឡាតាំង (English Name) និង Student ID ជាលេខសម្ងាត់
                </p>
              </div>

            {(validationError || error) && (
              <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 backdrop-blur-md">
                <i className="fas fa-triangle-exclamation text-rose-400 shrink-0 mt-0.5" />
                <span>
                  {validationError ||
                    (error && (error.toLowerCase().includes("network") || error.toLowerCase().includes("fetch"))
                      ? "មិនអាចភ្ជាប់ទៅកាន់ប្រព័ន្ធបានទេ។ សូមពិនិត្យការតភ្ជាប់អ៊ីនធឺណិត។"
                      : "ឈ្មោះ ឬលេខសម្ងាត់មិនត្រឹមត្រូវឡើយ។ សូមពិនិត្យឈ្មោះ និង Student ID ឡើងវិញ។")}
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Field 1: Student Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300 font-khmer">
                  ឈ្មោះនិស្សិត (ឈ្មោះខ្មែរ ឬ អក្សរឡាតាំង / English & Khmer Name)
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-400 transition-colors">
                    <i className="fas fa-user-tag text-sm" />
                  </div>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => {
                      setStudentName(e.target.value);
                      setRobotStatus("idle");
                    }}
                    placeholder="ឈ្មោះជាភាសាខ្មែរ ឬ អក្សរឡាតាំង (ឧ. កោ អារីហ្សា ឬ KOR ARYSHA)"
                    autoComplete="username"
                    disabled={loading}
                    className="w-full pl-11 pr-4 py-3 bg-white/[0.05] border border-white/10 rounded-2xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-400/60 focus:bg-white/[0.09] focus:ring-4 focus:ring-blue-500/20 transition-all backdrop-blur-md font-khmer"
                    required
                  />
                </div>
              </div>

              {/* Field 2: Student ID as Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300 font-khmer flex items-center justify-between">
                  <span>លេខសម្គាល់និស្សិតជាពាក្យសម្ងាត់ (Student ID Password)</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-400 transition-colors">
                    <i className="fas fa-key text-sm" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={studentId}
                    onChange={(e) => {
                      setStudentId(e.target.value);
                      setRobotStatus("idle");
                    }}
                    placeholder="បញ្ចូលលេខសម្គាល់និស្សិតរបស់អ្នក"
                    autoComplete="current-password"
                    disabled={loading}
                    className="w-full pl-11 pr-11 py-3 bg-white/[0.05] border border-white/10 rounded-2xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-400/60 focus:bg-white/[0.09] focus:ring-4 focus:ring-blue-500/20 transition-all backdrop-blur-md font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"} text-sm`} />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs font-khmer">
                <Link to="/" className="text-blue-400 hover:text-blue-300 hover:underline">
                  ← ត្រឡប់ទៅទំព័រដើម
                </Link>
                <Link to="/teacher-login" className="text-slate-400 hover:text-white">
                  ច្រកសាស្ត្រាចារ្យ →
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3.5 rounded-2xl font-bold text-white text-base bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 shadow-[0_8px_30px_rgba(37,99,235,0.4)] hover:shadow-[0_8px_40px_rgba(37,99,235,0.6)] transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-50 relative overflow-hidden group/btn cursor-pointer font-khmer"
              >
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-25deg] group-hover/btn:animate-shine pointer-events-none" />
                <div className="flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <i className="fas fa-circle-notch fa-spin text-sm" />
                      <span>កំពុងស្វែងរក...</span>
                    </>
                  ) : (
                    <>
                      <span>ស្វែងរកលទ្ធផល</span>
                      <i className="fas fa-search text-sm transform group-hover/btn:scale-110 transition-transform" />
                    </>
                  )}
                </div>
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-4 text-center text-xs text-slate-400 border-t border-white/[0.08]">
        រក្សាសិទ្ធិគ្រប់យ៉ាងឆ្នាំ ២០២៦។ បង្កើតឡើងដោយ លោកគ្រូ ធីលាង | Telegram @LeangOCL
      </footer>
    </div>
  );
}
