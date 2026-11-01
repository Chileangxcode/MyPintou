import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[ErrorBoundary caught an unhandled error]:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    // Clean up any stale service workers or caches that might block chunk loading
    if (typeof window !== "undefined") {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const reg of registrations) reg.unregister();
        }).catch(() => {});
      }
      if ("caches" in window) {
        caches.keys().then((keys) => {
          for (const k of keys) caches.delete(k);
        }).catch(() => {});
      }
      try {
        sessionStorage.clear();
      } catch (_) {}
      window.location.reload();
    }
  };

  handleGoHome = () => {
    window.location.href = "/admin/dashboard";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6 font-khmer">
          <div className="max-w-lg w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-5 animate-fade-in">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {this.state.error?.message?.includes("dynamically imported module") || this.state.error?.name === "ChunkLoadError"
                  ? "មានកំណែទម្រង់ថ្មីនៃប្រព័ន្ធ"
                  : "មានបញ្ហាបច្ចេកទេសក្នុងការបង្ហាញទំព័រនេះ"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {this.state.error?.message?.includes("dynamically imported module") || this.state.error?.name === "ChunkLoadError"
                  ? "ប្រព័ន្ធត្រូវបានធ្វើបច្ចុប្បន្នភាព សូមចុច 'ដំណើរការឡើងវិញ' ដើម្បីទទួលបានទំព័រចុងក្រោយ។"
                  : "(A rendering error occurred in this view. Your data is completely safe.)"}
              </p>
            </div>

            {this.state.error && (
              <div className="p-3.5 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-left overflow-x-auto text-xs font-mono text-rose-600 dark:text-rose-400 max-h-36">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-500/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>ដំណើរការឡើងវិញ (Reload)</span>
              </button>

              <button
                onClick={this.handleGoHome}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <Home className="w-3.5 h-3.5" />
                <span>ត្រឡប់ទៅផ្ទាំងគ្រប់គ្រង</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

