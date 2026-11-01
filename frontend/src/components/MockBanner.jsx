import React from "react";
import { Info } from "lucide-react";
import { isUsingMock } from "../api/client.js";

export default function MockBanner() {
  if (!isUsingMock()) return null;

  return (
    <div className="bg-amber-500/10 dark:bg-amber-500/15 border-b border-amber-500/20 px-4 py-2 text-xs md:text-sm text-amber-900 dark:text-amber-300 flex items-center justify-between no-print transition-colors">
      <div className="flex items-center gap-2 max-w-5xl mx-auto w-full">
        <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
        <span>
          <strong className="font-semibold">ការបង្ហាញទិន្នន័យគំរូ៖</strong> កំពុងប្រើប្រាស់ទិន្នន័យសាកល្បង។ ដើម្បីភ្ជាប់ Cloud Database សូមកំណត់ <code className="bg-amber-200/50 dark:bg-amber-900/50 px-1 py-0.5 rounded font-mono">VITE_APPS_SCRIPT_URL</code> ក្នុង <code className="bg-amber-200/50 dark:bg-amber-900/50 px-1 py-0.5 rounded font-mono">.env</code>។
        </span>
      </div>
    </div>
  );
}
