/**
 * PWA Service Worker & Automatic Update Manager
 * Handles:
 * - Registration of sw.js
 * - Periodic and on-focus background update checks
 * - Safe waiting-worker activation (skipWaiting)
 * - Safe reload with unsaved form data protection
 * - iOS Safari, Chrome, Edge, and Android install detection
 * - Global PWA install trigger & modal coordination
 */

let registrationInstance = null;
let waitingWorker = null;
let updateListeners = new Set();
let isDirtyFormActive = false;

// PWA Install Prompt State
let deferredInstallPrompt = null;
let installChangeListeners = new Set();

// Immediately capture beforeinstallprompt at module load
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    console.log("[PWA] beforeinstallprompt event captured and ready.");
    notifyInstallChange();
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    console.log("[PWA] Application successfully installed.");
    notifyInstallChange();
  });
}

function notifyInstallChange() {
  installChangeListeners.forEach((fn) => {
    try {
      fn({
        isInstallable: Boolean(deferredInstallPrompt),
        isInstalled: isStandaloneMode(),
        deferredPrompt: deferredInstallPrompt
      });
    } catch (e) {
      console.error(e);
    }
  });
}

/**
 * Subscribe to PWA installation state changes
 */
export function onPWAInstallChange(callback) {
  installChangeListeners.add(callback);
  callback({
    isInstallable: Boolean(deferredInstallPrompt),
    isInstalled: isStandaloneMode(),
    deferredPrompt: deferredInstallPrompt
  });
  return () => installChangeListeners.delete(callback);
}

export function getDeferredInstallPrompt() {
  return deferredInstallPrompt;
}

/**
 * Open the central PWA Install & Information Modal
 */
export function openPWAInstallGuide(detail = {}) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("mypintou:open-pwa-install", { detail }));
  }
}

/**
 * Trigger PWA installation across any browser / device:
 * 1. If native deferredPrompt is ready -> triggers prompt()
 * 2. If already running standalone -> opens confirmation modal
 * 3. If on iOS or desktop where prompt is unavailable -> opens step-by-step installation guide
 */
export async function triggerPWAInstall() {
  if (isStandaloneMode()) {
    openPWAInstallGuide({ status: "already_installed" });
    return { outcome: "already_installed" };
  }

  if (deferredInstallPrompt) {
    try {
      deferredInstallPrompt.prompt();
      const choice = await deferredInstallPrompt.userChoice;
      console.log("[PWA] User installation choice:", choice);
      if (choice && choice.outcome === "accepted") {
        deferredInstallPrompt = null;
        notifyInstallChange();
      }
      return choice;
    } catch (err) {
      console.error("[PWA] Failed to trigger native install prompt:", err);
      openPWAInstallGuide({ status: "manual_guide", error: err.message });
      return { outcome: "manual_guide" };
    }
  }

  // Native prompt not yet available -> Open interactive PWA guide modal
  openPWAInstallGuide({ status: "manual_guide" });
  return { outcome: "manual_guide" };
}

/**
 * Register whether the user is currently editing a form (scoring, student edit, etc.)
 * Prevents disruptive reloads while data entry is in progress.
 */
export function setFormDirtyState(isDirty) {
  isDirtyFormActive = Boolean(isDirty);
}

export function isFormDirty() {
  return isDirtyFormActive;
}

/**
 * Subscribe to update availability events
 */
export function onUpdateAvailable(callback) {
  updateListeners.add(callback);
  if (waitingWorker) {
    callback({ waitingWorker, hasUpdate: true });
  }
  return () => updateListeners.delete(callback);
}

function notifyUpdateAvailable(worker) {
  waitingWorker = worker;
  updateListeners.forEach((fn) => {
    try {
      fn({ waitingWorker: worker, hasUpdate: true });
    } catch (e) {
      console.error(e);
    }
  });
}

/**
 * Register Service Worker and initialize update hooks
 */
export function registerPWA() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }

  // Disable Service Worker in local development to prevent intercepting Vite dynamic module imports
  const isDev =
    import.meta.env.DEV ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "[::1]";

  if (isDev) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
        console.log("[PWA] Cleaned up dev Service Worker:", registration.scope);
      }
    }).catch(() => {});

    if ("caches" in window) {
      caches.keys().then((keys) => {
        for (const key of keys) {
          if (key.startsWith("mypintou-")) {
            caches.delete(key);
            console.log("[PWA] Deleted dev cache:", key);
          }
        }
      }).catch(() => {});
    }
    return;
  }

  // Reload page when new worker takes control (after SKIP_WAITING)
  let refreshing = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshing) return;
    refreshing = true;
    console.log("[PWA] Controller changed, reloading page with latest version...");
    window.location.reload();
  });

  window.addEventListener("load", async () => {
    try {
      const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      registrationInstance = reg;
      console.log("[PWA] Service Worker registered with scope:", reg.scope);

      // Check if a worker is already waiting
      if (reg.waiting) {
        notifyUpdateAvailable(reg.waiting);
      }

      // Detect newly installed service worker
      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;
        if (!newWorker) return;

        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            console.log("[PWA] New version downloaded and ready to activate.");
            notifyUpdateAvailable(newWorker);
          }
        });
      });

      // Periodic update check every 15 minutes
      setInterval(() => {
        try {
          reg.update();
        } catch (_) {}
      }, 15 * 60 * 1000);

      // Check for updates when user returns to the tab/app
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
          try {
            reg.update();
          } catch (_) {}
        }
      });
    } catch (error) {
      console.error("[PWA] Service worker registration failed:", error);
    }
  });
}

/**
 * Triggers the waiting service worker to take over and reload the app
 */
export function applyUpdateNow() {
  if (waitingWorker) {
    waitingWorker.postMessage({ type: "SKIP_WAITING" });
  } else if (registrationInstance && registrationInstance.waiting) {
    registrationInstance.waiting.postMessage({ type: "SKIP_WAITING" });
  } else {
    window.location.reload();
  }
}

/**
 * Check if the app is currently running in Standalone (installed) mode
 */
export function isStandaloneMode() {
  if (typeof window === "undefined") return false;
  const isDisplayStandalone = window.matchMedia("(display-mode: standalone)").matches;
  const isIOSStandalone = window.navigator.standalone === true;
  return isDisplayStandalone || isIOSStandalone;
}

/**
 * Detect if running on an iOS device (iPhone / iPad / iPod)
 */
export function isIOSDevice() {
  if (typeof window === "undefined") return false;
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

/**
 * Detect if running on Android
 */
export function isAndroidDevice() {
  if (typeof window === "undefined") return false;
  return /android/.test(window.navigator.userAgent.toLowerCase());
}
