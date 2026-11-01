import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, Home } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
      <div className="w-16 h-16 rounded-3xl bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center shadow-inner">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-khmer tracking-tight">
          ៤០៣ - មិនមានសិទ្ធិចូលប្រើប្រាស់
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          លោកអ្នកមិនមានសិទ្ធិអនុញ្ញាតដើម្បីចូលទៅកាន់ទំព័រការពារនេះឡើយ។ សូមចូលប្រើប្រព័ន្ធដោយប្រើប្រាស់គណនីសាស្ត្រាចារ្យ ឬគណនីនិស្សិតដែលត្រឹមត្រូវ។
        </p>
      </div>

      <div className="flex items-center justify-center gap-3 pt-2">
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm hover:scale-105 active:scale-95"
        >
          <Home className="w-4 h-4" />
          <span>ទំព័រដើម</span>
        </Link>
        <Link
          to="/teacher-login"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <span>ច្រកសាស្ត្រាចារ្យ</span>
        </Link>
      </div>
    </div>
  );
}
