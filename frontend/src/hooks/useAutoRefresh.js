import { useEffect, useRef } from "react";

/**
 * Custom Hook for Smart Near-Realtime Auto-Refresh
 * - Refreshes periodically when tab is active
 * - Pauses polling when browser tab is hidden
 * - Refreshes immediately when tab becomes visible again
 * - Prevents overlapping requests
 */
export function useAutoRefresh(refreshFn, intervalMs = 30000, enabled = true) {
  const isFetchingRef = useRef(false);
  const lastRunRef = useRef(Date.now());

  useEffect(() => {
    if (!enabled || typeof refreshFn !== "function") return;

    const executeRefresh = async () => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      try {
        await refreshFn();
        lastRunRef.current = Date.now();
      } catch (err) {
        console.warn("Auto-refresh error:", err);
      } finally {
        isFetchingRef.current = false;
      }
    };

    // 1. Tab visibility listener (re-fetch when user switches back to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const timeSinceLastRun = Date.now() - lastRunRef.current;
        // If more than 15 seconds have passed since last run, refresh immediately
        if (timeSinceLastRun > 15000) {
          executeRefresh();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 2. Periodic interval when tab is visible
    const timer = setInterval(() => {
      if (document.visibilityState === "visible" && !document.hidden) {
        executeRefresh();
      }
    }, intervalMs);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refreshFn, intervalMs, enabled]);
}
