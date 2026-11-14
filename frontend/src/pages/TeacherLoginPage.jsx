import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import RobotMascot from "../components/RobotMascot.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import BrandLogo from "../components/BrandLogo.jsx";

export default function TeacherLoginPage() {
  const [username, setUsername] = useState(() => {
    try {
      return localStorage.getItem("mypintou_saved_staff_username") || "";
    } catch {
      return "";
    }
  });
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    try {
      return localStorage.getItem("mypintou_remember_staff") !== "false";
    } catch {
      return true;
    }
  });
  const [validationError, setValidationError] = useState("");
  const [robotStatus, setRobotStatus] = useState("idle");
  const [isTypingPassword, setIsTypingPassword] = useState(false);

  const { loginTeacherAdmin, loading, error, adminSession } = useAuth();
  const navigate = useNavigate();

  // If already authenticated as admin, automatically redirect to admin dashboard
  React.useEffect(() => {
    if (adminSession) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [adminSession, navigate]);

  const handleKeyDown = (e) => {
    if (e.getModifierState && e.getModifierState("CapsLock")) {
      setCapsLockActive(true);
    } else {
      setCapsLockActive(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");
    setRobotStatus("idle");

    const trimmedUser = username.trim();
    if (!trimmedUser || !password) {
      setValidationError("សូមបំពេញឈ្មោះគណនី និងលេខសម្ងាត់របស់អ្នក។");
      setRobotStatus("error");
      return;
    }

    const res = await loginTeacherAdmin(trimmedUser, password);
    if (res.success) {
      try {
        if (rememberMe) {
          localStorage.setItem("mypintou_saved_staff_username", trimmedUser);
          localStorage.setItem("mypintou_remember_staff", "true");
        } else {
          localStorage.removeItem("mypintou_saved_staff_username");
          localStorage.setItem("mypintou_remember_staff", "false");
        }
        if (window.PasswordCredential && navigator.credentials) {
          const cred = new window.PasswordCredential({
            id: trimmedUser,
            password: password,
            name: res.data?.displayName || trimmedUser
          });
          navigator.credentials.store(cred).catch(() => {});
        }
      } catch (_) {}

      setRobotStatus("success");
      setTimeout(() => {
        navigate("/admin/dashboard", { replace: true });
      }, 400);
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
            <RobotMascot status={robotStatus} isShy={isTypingPassword} />
          </div>

          <div className="relative p-[1px] rounded-[32px] bg-gradient-to-b from-cyan-400/30 via-white/10 to-indigo-500/30 shadow-[0_25px_70px_rgba(0,0,0,0.7)]">
            <div className="bg-[#0c1427]/85 backdrop-blur-2xl rounded-[31px] p-6 sm:p-8 pt-20 space-y-6">
              <div className="text-center space-y-1 pt-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[11px] font-semibold text-cyan-400 mb-1 font-khmer">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span>ច្រកសាស្ត្រាចារ្យ និងបុគ្គលិក</span>
                </div>
                <h2 className="text-2xl font-black text-white font-khmer tracking-wide">
                  ច្រកសាស្ត្រាចារ្យ និងបុគ្គលិក
                </h2>
                <p className="text-xs text-slate-300/70 font-khmer">
                  សូមបញ្ចូលឈ្មោះគណនី និងលេខសម្ងាត់ដើម្បីចូលគ្រប់គ្រង
                </p>
              </div>

            {(validationError || error) && (
              <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 backdrop-blur-md">
                <i className="fas fa-triangle-exclamation text-rose-400 shrink-0 mt-0.5" />
                <span>{validationError || "ឈ្មោះគណនី ឬលេខសម្ងាត់មិនត្រឹមត្រូវឡើយ។ សូមពិនិត្យម្តងទៀត។"}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300 font-khmer">
                  ឈ្មោះគណនី
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-400 transition-colors">
                    <i className="fas fa-user text-sm" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setRobotStatus("idle");
                    }}
                    onFocus={() => {
                      setIsTypingPassword(false);
                      setRobotStatus("idle");
                    }}
                    placeholder="ឈ្មោះគណនីរបស់អ្នក"
                    autoComplete="username"
                    disabled={loading}
                    className="w-full pl-11 pr-4 py-3 bg-white/[0.05] border border-white/10 rounded-2xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-400/60 focus:bg-white/[0.09] focus:ring-4 focus:ring-blue-500/20 transition-all backdrop-blur-md"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5 relative">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300 font-khmer">
                    លេខសម្ងាត់
                  </label>
                  {capsLockActive && (
                    <span className="text-[10px] text-amber-400 flex items-center gap-1 font-semibold animate-pulse font-khmer">
                      <i className="fas fa-arrow-up" /> Caps Lock បើក
                    </span>
                  )}
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-400 transition-colors">
                    <i className="fas fa-lock text-sm" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setRobotStatus("idle");
                    }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsTypingPassword(true)}
                    onBlur={() => setIsTypingPassword(false)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={loading}
                    className="w-full pl-11 pr-11 py-3 bg-white/[0.05] border border-white/10 rounded-2xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-400/60 focus:bg-white/[0.09] focus:ring-4 focus:ring-blue-500/20 transition-all backdrop-blur-md"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                    tabIndex={-1}
                  >
                    <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"} text-sm`} />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs font-khmer">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-white/5 text-blue-600 focus:ring-0 cursor-pointer accent-blue-600"
                  />
                  <span className="flex items-center gap-1.5 font-medium">
                    <i className="fas fa-bookmark text-[11px] text-blue-400" />
                    <span>ចងចាំគណនី (Save Login)</span>
                  </span>
                </label>
                <Link to="/" className="text-blue-400 hover:text-blue-300 hover:underline">
                  ត្រឡប់ទៅទំព័រដើម
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3.5 rounded-2xl font-bold text-white text-base bg-blue-600 hover:bg-blue-500 shadow-[0_8px_30px_rgba(37,99,235,0.4)] hover:shadow-[0_8px_40px_rgba(37,99,235,0.6)] transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-50 relative overflow-hidden group/btn cursor-pointer font-khmer"
              >
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-25deg] group-hover/btn:animate-shine pointer-events-none" />
                <div className="flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <i className="fas fa-circle-notch fa-spin text-sm" />
                      <span>កំពុងចូល...</span>
                    </>
                  ) : (
                    <>
                      <span>ចូលប្រព័ន្ធ</span>
                      <i className="fas fa-arrow-right text-sm transform group-hover/btn:translate-x-1 transition-transform" />
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
