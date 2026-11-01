import React from "react";
import { Link } from "react-router-dom";
import { FileQuestion, Home } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
      <div className="w-16 h-16 rounded-3xl bg-blue-500/10 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center shadow-inner">
        <FileQuestion className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-khmer tracking-tight">
          ៤០៤ - រកមិនឃើញទំព័រ
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          ទំព័រដែលលោកអ្នកកំពុងស្វែងរកមិនមាន ឬអាចត្រូវបានផ្លាស់ប្តូរទីតាំង។
        </p>
      </div>

      <div className="pt-2">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm hover:scale-105 active:scale-95"
        >
          <Home className="w-4 h-4" />
          <span>ត្រឡប់ទៅទំព័រដើមវិញ</span>
        </Link>
      </div>
    </div>
  );
}
