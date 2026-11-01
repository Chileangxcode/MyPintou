import React, { useState, useEffect } from "react";
import { RefreshCw, Zap, WifiOff } from "lucide-react";
import { dataSyncService } from "../services/dataSyncService.js";

export default function RealtimeIndicator({ onRefresh, loading = false, className = "" }) {
  const [syncStatus, setSyncStatus] = useState(dataSyncService.getSyncStatus());
  const [statusText, setStatusText] = useState("Real-Time ផ្ទាល់");

  useEffect(() => {
    return dataSyncService.subscribeSyncStatus((s) => {
      setSyncStatus(s);
    });
  }, []);

  useEffect(() => {
    const update = () => {
      const s = dataSyncService.getSyncStatus();
      setSyncStatus(s);

      if (loading || s.isSyncing) {
        setStatusText("កំពុង Sync...");
        return;
      }

      if (!s.isConnected || !s.isOnline) {
        setStatusText("ផ្ដាច់ការតភ្ជាប់ (Offline)");
        return;
      }

      if (s.lastSyncTimestamp) {
        const diffSeconds = Math.floor((Date.now() - s.lastSyncTimestamp) / 1000);
        if (diffSeconds < 15) {
          setStatusText("Real-Time: ផ្ទាល់ (Live)");
        } else if (diffSeconds < 60) {
          setStatusText(`Sync: ${diffSeconds}វិនាទីមុន`);
        } else {
          const mins = Math.floor(diffSeconds / 60);
          setStatusText(`Sync: ${mins}នាទីមុន`);
        }
      } else {
        setStatusText("Real-Time ផ្ទាល់");
      }
    };

    update();
    const interval = setInterval(update, 3000);
    return () => clearInterval(interval);
  }, [loading]);

  const isSyncing = loading || syncStatus.isSyncing;
  const isOk = syncStatus.isConnected && syncStatus.isOnline;

  const providerLabel = syncStatus.activeProvider === "supabase_realtime"
    ? "Supabase WebSocket"
    : syncStatus.activeProvider === "firebase"
    ? "Firebase Realtime"
    : "Local Broadcast + Adaptive Sync";

  return (
    <div
      title={`ស្ថានភាព: ${isOk ? "ភ្ជាប់ជោគជ័យ" : "ផ្ដាច់ការតភ្ជាប់"} | Engine: ${providerLabel} | Latency: ${syncStatus.latencyMs || 40}ms`}
      className={`inline-flex items-center space-x-2 px-3 sm:px-3.5 py-1.5 rounded-2xl text-[11px] font-bold tracking-wide border shadow-sm transition-all select-none ${
        !isOk
          ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
          : isSyncing
          ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800 shadow-amber-500/10"
          : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800 shadow-emerald-500/10"
      } ${className}`}
    >
      <div className="relative flex h-2 w-2 mr-1">
        {isOk && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isSyncing ? "bg-amber-400" : "bg-emerald-400"
            }`}
          />
        )}
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            !isOk ? "bg-rose-500" : isSyncing ? "bg-amber-500" : "bg-emerald-500"
          }`}
        />
      </div>

      <span className="font-semibold flex items-center gap-1">
        {!isOk ? <WifiOff className="w-3 h-3 inline" /> : isSyncing ? null : <Zap className="w-2.5 h-2.5 inline text-emerald-500" />}
        {isSyncing ? "កំពុង Sync..." : statusText}
      </span>

      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={loading || isSyncing}
          title="ធ្វើបច្ចុប្បន្នភាពទិន្នន័យផ្ទាល់ (Sync)"
          className="ml-1 p-0.5 rounded-full hover:bg-emerald-200/50 dark:hover:bg-emerald-800/50 text-emerald-800 dark:text-emerald-300 transition-colors cursor-pointer disabled:opacity-50"
          aria-label="Sync"
        >
          <RefreshCw className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`} />
        </button>
      )}
    </div>
  );
}
