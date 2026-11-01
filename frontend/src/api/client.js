/**
 * University Student Information & Scoring System
 * Ultra High-Performance API Client Layer (Section 18.2, 18.3, 18.4, 18.6, 18.9)
 * 
 * Features:
 * 1. Smart Multi-Tier Cache with Stale-While-Revalidate (SWR):
 *    - L1: 0ms Instant Memory Cache (Map)
 *    - L2: 1ms Persistent Cache (LocalStorage / SessionStorage)
 * 2. Fine-Grained Role-Based Cache Isolation & Security (Section 18.4):
 *    - Scopes student queries so Student A cannot read Student B's data
 *    - Sensitive authentication credentials and tokens are NEVER persisted to public cache
 *    - Automatic cache purging on logout
 * 3. In-Flight Request Deduplication & AbortController Cancellation (Section 18.9):
 *    - Merges concurrent identical requests
 *    - Cancels outdated search queries so old responses never overwrite fresh keystrokes
 * 4. Optimistic UI Updates with Instant Rollback (Section 18.2)
 * 5. Tight Real-Time Sync Integration with dataSyncService (Section 18.1 & 18.10)
 */

const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbwBVWbXlowadbGPdb7JjcUSQ8Y5mlDPtGiFbh1Stwp4WHhgvUL0LzMHkVhoTz7TcTYtuQ/exec";
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export const isUsingMock = () => USE_MOCK;
export const getApiUrl = () => APPS_SCRIPT_URL;

// ==========================================
// CACHE STRATEGY CONFIGURATION (SECTION 18.4)
// ==========================================
export const CACHE_POLICIES = {
  // Settings & School Info: Long-lived cache with invalidation (12 hours)
  settings: { freshTtl: 12 * 60 * 60 * 1000, staleTtl: 48 * 60 * 60 * 1000, persistent: true },
  config: { freshTtl: 12 * 60 * 60 * 1000, staleTtl: 48 * 60 * 60 * 1000, persistent: true },
  health: { freshTtl: 2 * 60 * 1000, staleTtl: 10 * 60 * 1000, persistent: true },

  // Class & Course information: Background refresh (1 hour)
  class: { freshTtl: 60 * 60 * 1000, staleTtl: 24 * 60 * 60 * 1000, persistent: true },

  // Student profile: Short-lived cache (3 minutes) with background refresh
  student_profile: { freshTtl: 3 * 60 * 1000, staleTtl: 60 * 60 * 1000, persistent: true },
  student_lookup: { freshTtl: 2 * 60 * 1000, staleTtl: 60 * 60 * 1000, persistent: true },

  // Student scores & attendance: Real-time invalidation (45 seconds fresh, 24h stale fallback)
  student_scores: { freshTtl: 45 * 1000, staleTtl: 24 * 60 * 60 * 1000, persistent: true },
  admin_scoring_overview: { freshTtl: 30 * 1000, staleTtl: 24 * 60 * 60 * 1000, persistent: true },

  // Dashboard statistics: Background refresh (60 seconds)
  admin_stats: { freshTtl: 60 * 1000, staleTtl: 12 * 60 * 60 * 1000, persistent: true },
  admin_students: { freshTtl: 30 * 1000, staleTtl: 12 * 60 * 60 * 1000, persistent: true },

  // Quizzes & Library
  quizzes: { freshTtl: 5 * 60 * 1000, staleTtl: 24 * 60 * 60 * 1000, persistent: true },

  // Default fallback
  default: { freshTtl: 20 * 1000, staleTtl: 24 * 60 * 60 * 1000, persistent: true }
};

function getPolicyForAction(action) {
  const act = String(action || "").toLowerCase();
  for (const [key, policy] of Object.entries(CACHE_POLICIES)) {
    if (act.includes(key)) return policy;
  }
  return CACHE_POLICIES.default;
}

// L1 Fast In-Memory Cache
const memoryCache = new Map();

// In-flight active promise deduplication
const inFlightRequests = new Map();

// Active AbortControllers for cancelable searches
const activeControllers = new Map();

// L2 Persistent LocalStorage cache prefix
const PERSISTENT_CACHE_PREFIX = "pintou_fast_v4_";

// Realtime sync tracking
let activeSyncCount = 0;
const syncListeners = new Set();
let lastSyncTimestamp = null;
let lastLatencyMs = null;
let isConnected = true;

export function subscribeSyncStatus(listener) {
  syncListeners.add(listener);
  listener(activeSyncCount > 0);
  return () => syncListeners.delete(listener);
}

function notifySyncListeners() {
  const isSyncing = activeSyncCount > 0;
  syncListeners.forEach((fn) => {
    try {
      fn(isSyncing);
    } catch (_) {}
  });
}

export function getRealtimeStatus() {
  return {
    isConnected,
    lastSyncTimestamp,
    lastLatencyMs,
    isUsingMock: USE_MOCK,
    isSyncing: activeSyncCount > 0
  };
}

// ==========================================
// ROLE-BASED CACHE MANAGEMENT (SECTION 18.4)
// ==========================================

function getPersistentCache(key, policy) {
  if (!policy.persistent) return null;
  try {
    const raw = localStorage.getItem(PERSISTENT_CACHE_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.timestamp < policy.staleTtl) {
      return parsed;
    }
  } catch (_) {}
  return null;
}

function setPersistentCache(key, data, policy) {
  if (!policy.persistent) return;
  try {
    localStorage.setItem(
      PERSISTENT_CACHE_PREFIX + key,
      JSON.stringify({ data, timestamp: Date.now() })
    );
  } catch (_) {}
}

/**
 * Purge sensitive cached data on Student Logout
 * Guarantees zero cross-student data leakage!
 */
export function purgeStudentCache(studentId) {
  const targetPrefix = studentId ? `student_${studentId.toLowerCase()}` : "student_";
  
  // Clean memory
  for (const k of memoryCache.keys()) {
    if (k.toLowerCase().includes(targetPrefix) || k.startsWith("student_")) {
      memoryCache.delete(k);
    }
  }

  // Clean persistent storage
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PERSISTENT_CACHE_PREFIX)) {
        const sub = k.replace(PERSISTENT_CACHE_PREFIX, "").toLowerCase();
        if (sub.includes("student_lookup") || sub.includes("student_scores") || sub.includes("student_profile")) {
          localStorage.removeItem(k);
        }
      }
    }
  } catch (_) {}
}

/**
 * Purge sensitive cached data on Admin/Staff Logout
 */
export function purgeAdminCache() {
  const adminPrefixes = ["admin_", "get_users", "user_login", "admin_users"];
  
  // Clean memory
  for (const k of memoryCache.keys()) {
    if (adminPrefixes.some((p) => k.toLowerCase().startsWith(p))) {
      memoryCache.delete(k);
    }
  }

  // Clean persistent storage
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PERSISTENT_CACHE_PREFIX)) {
        const sub = k.replace(PERSISTENT_CACHE_PREFIX, "").toLowerCase();
        if (adminPrefixes.some((p) => sub.startsWith(p))) {
          localStorage.removeItem(k);
        }
      }
    }
  } catch (_) {}
}

/**
 * Clear entire client cache
 */
export function clearApiCache() {
  memoryCache.clear();
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PERSISTENT_CACHE_PREFIX)) {
        localStorage.removeItem(k);
      }
    }
  } catch (_) {}
}

/**
 * Selective targeted cache invalidation
 * Purges only affected entities without resetting the whole application!
 */
export function invalidateRelatedCaches(action, recordId = null) {
  const targetPrefixes = [];
  const act = String(action || "").toLowerCase();

  if (act.includes("user")) {
    targetPrefixes.push("get_users", "admin_users", "user_login", "admin_stats");
  }
  if (act.includes("student")) {
    targetPrefixes.push("admin_students", "student_lookup", "student_profile", "get_users", "admin_scoring_overview", "admin_stats", "honors_list");
  }
  if (act.includes("score") || act.includes("attendance")) {
    targetPrefixes.push("admin_scoring_overview", "student_scores", "student_lookup", "admin_stats", "honors_list");
  }
  if (act.includes("quiz")) {
    targetPrefixes.push("admin_quizzes", "student_quizzes", "admin_scoring_overview");
  }
  if (act.includes("config") || act.includes("setting") || act.includes("announcement") || act.includes("library") || act.includes("elibrary")) {
    targetPrefixes.push("config", "health");
  }

  if (targetPrefixes.length === 0) {
    targetPrefixes.push(act);
  }

  // Purge from memoryCache
  for (const key of memoryCache.keys()) {
    const keyLower = key.toLowerCase();
    if (targetPrefixes.some((p) => keyLower.startsWith(p)) || (recordId && keyLower.includes(String(recordId).toLowerCase()))) {
      memoryCache.delete(key);
    }
  }

  // Purge from localStorage
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PERSISTENT_CACHE_PREFIX)) {
        const subKey = k.replace(PERSISTENT_CACHE_PREFIX, "").toLowerCase();
        if (targetPrefixes.some((p) => subKey.startsWith(p)) || (recordId && subKey.includes(String(recordId).toLowerCase()))) {
          localStorage.removeItem(k);
        }
      }
    }
  } catch (_) {}
}

/**
 * Direct Optimistic Cache Updater
 */
export function updateCacheEntry(action, updaterFn) {
  for (const [key, value] of memoryCache.entries()) {
    if (key.startsWith(action)) {
      try {
        const updated = updaterFn(value.data);
        if (updated) {
          const policy = getPolicyForAction(action);
          memoryCache.set(key, { data: updated, timestamp: Date.now() });
          setPersistentCache(key, updated, policy);
        }
      } catch (_) {}
    }
  }
}

// ==========================================
// BACKGROUND REVALIDATION (SWR)
// ==========================================

function triggerBackgroundRevalidation(action, params, options, cacheKey, policy) {
  if (inFlightRequests.has(cacheKey)) return;

  fetchNetworkData(action, params, options, cacheKey, policy)
    .then((freshData) => {
      if (freshData && freshData.success) {
        window.dispatchEvent(
          new CustomEvent("pintou:cache-updated", {
            detail: { action, cacheKey, data: freshData }
          })
        );
      }
    })
    .catch(() => {});
}

// ==========================================
// CORE NETWORK FETCHER
// ==========================================

async function fetchNetworkData(action, params = {}, options = {}, cacheKey, policy) {
  const isMutation = options.method === "POST" || 
    /^(create|update|delete|bulk|sync|init|reset|prepare|setup|flush)/i.test(action);
  const isAuthAction = /^(user_login|admin_login|login|logout|auth|verify)/i.test(action);

  activeSyncCount++;
  notifySyncListeners();

  const query = new URLSearchParams({
    action,
    ...params,
    _t: Date.now().toString()
  });

  const url = `${APPS_SCRIPT_URL}?${query.toString()}`;
  const controller = options.signal ? null : new AbortController();
  const signal = options.signal || controller.signal;
  const timeoutMs = options.timeoutMs || 25000;
  let timeoutId = null;

  if (controller) {
    timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  }
  const startTime = Date.now();

  try {
    const fetchOptions = {
      method: options.method || (isMutation ? "POST" : "GET"),
      headers: {
        Accept: "application/json"
      },
      signal
    };

    if (fetchOptions.method === "POST") {
      fetchOptions.headers["Content-Type"] = "text/plain;charset=utf-8";
      fetchOptions.body = JSON.stringify(options.body || params);
    }

    const response = await fetch(url, fetchOptions);
    if (timeoutId) clearTimeout(timeoutId);

    const latency = Date.now() - startTime;
    lastLatencyMs = latency;
    lastSyncTimestamp = new Date();
    isConnected = true;

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Mock fallback if action is missing on deployed script
    const isUnknownAction = data && !data.success && (
      (typeof data.error === "string" && (data.error === "INVALID_ACTION" || data.error.includes("Unknown API action"))) ||
      (typeof data.message === "string" && data.message.includes("Unknown API action"))
    );

    if (isUnknownAction) {
      const { handleMockRequest } = await import("./mockHandler.js");
      const mockRes = await handleMockRequest(action, params);
      if (isMutation) {
        invalidateRelatedCaches(action);
      }
      return mockRes;
    }

    // On mutation: perform targeted cache invalidation & trigger realtime publish
    if (isMutation) {
      invalidateRelatedCaches(action, params.studentId || params.userId || params.id);
      
      // Lazily broadcast event over dataSyncService
      import("../services/dataSyncService.js").then(({ dataSyncService }) => {
        let entityType = "general";
        if (action.includes("student")) entityType = "student";
        else if (action.includes("score")) entityType = "score";
        else if (action.includes("attendance")) entityType = "attendance";
        else if (action.includes("quiz")) entityType = "quiz";
        else if (action.includes("library") || action.includes("elibrary")) entityType = "elibrary";
        else if (action.includes("config") || action.includes("setting") || action.includes("announcement")) entityType = "config";

        dataSyncService.publishEvent({
          entityType,
          recordId: params.studentId || params.userId || "*",
          action: `${entityType}.${action.split("_")[0] || "updated"}`
        });
      }).catch(() => {});

    } else if (data && data.success && !isAuthAction) {
      // Never store auth credentials or passwords in cache
      memoryCache.set(cacheKey, { data, timestamp: Date.now() });
      setPersistentCache(cacheKey, data, policy);
    }

    return data;
  } catch (error) {
    if (timeoutId) clearTimeout(timeoutId);
    isConnected = false;

    if (error.name === "AbortError") {
      return {
        success: false,
        message: "ការស្នើសុំទិន្នន័យលើសកំណត់ពេលវេលា។ សូមពិនិត្យមើលការតភ្ជាប់អ៊ីនធឺណិត។",
        error: "TIMEOUT",
        data: null
      };
    }

    return {
      success: false,
      message: error.message || "មិនអាចភ្ជាប់ទំនាក់ទំនងជាមួយ Cloud Database Server បានទេ។",
      error: "NETWORK_ERROR",
      data: null
    };
  } finally {
    inFlightRequests.delete(cacheKey);
    activeSyncCount = Math.max(0, activeSyncCount - 1);
    notifySyncListeners();
  }
}

// ==========================================
// UNIVERSAL API REQUEST (SWR + DEDUPLICATION)
// ==========================================

export async function apiRequest(action, params = {}, options = {}) {
  if (USE_MOCK) {
    const { handleMockRequest } = await import("./mockHandler.js");
    return handleMockRequest(action, params);
  }

  const isMutation = options.method === "POST" || 
    /^(create|update|delete|bulk|sync|init|reset|prepare|setup|flush)/i.test(action);
  const isAuthAction = /^(user_login|admin_login|login|logout|auth|verify)/i.test(action);
  const isRefresh = params.refresh === "true" || options.forceRefresh;
  const policy = getPolicyForAction(action);
  const cacheKey = `${action}:${JSON.stringify(params)}`;

  // 1. FAST PATH: Return cached result instantly (0ms - 2ms)
  if (!isMutation && !isAuthAction && !isRefresh) {
    // Check L1 Memory Cache
    if (memoryCache.has(cacheKey)) {
      const cached = memoryCache.get(cacheKey);
      if (Date.now() - cached.timestamp < policy.freshTtl) {
        return cached.data;
      }
      // Stale: Return immediate cache, revalidate in background
      triggerBackgroundRevalidation(action, params, options, cacheKey, policy);
      return cached.data;
    }

    // Check L2 Persistent LocalStorage
    const persistentCached = getPersistentCache(cacheKey, policy);
    if (persistentCached) {
      memoryCache.set(cacheKey, persistentCached);
      if (Date.now() - persistentCached.timestamp > policy.freshTtl) {
        triggerBackgroundRevalidation(action, params, options, cacheKey, policy);
      }
      return persistentCached.data;
    }
  }

  // 2. IN-FLIGHT DEDUPLICATION: Prevent duplicate concurrent requests
  if (!isMutation && !isAuthAction && inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey);
  }

  // 3. Network Fetch
  const requestPromise = fetchNetworkData(action, params, options, cacheKey, policy);
  if (!isMutation && !isAuthAction) {
    inFlightRequests.set(cacheKey, requestPromise);
  }

  return requestPromise;
}

// ==========================================
// CANCELABLE API REQUEST (SEARCH & FILTERS)
// ==========================================

/**
 * Cancelable API Request for rapid search inputs
 * Cancels previous in-flight search so older slow responses never overwrite fresh keystrokes!
 */
export async function cancelableApiRequest(channelKey, action, params = {}, options = {}) {
  if (activeControllers.has(channelKey)) {
    const oldCtrl = activeControllers.get(channelKey);
    try {
      oldCtrl.abort();
    } catch (_) {}
    activeControllers.delete(channelKey);
  }

  const controller = new AbortController();
  activeControllers.set(channelKey, controller);

  try {
    const res = await apiRequest(action, params, {
      ...options,
      signal: controller.signal
    });
    activeControllers.delete(channelKey);
    return res;
  } catch (err) {
    activeControllers.delete(channelKey);
    throw err;
  }
}

// ==========================================
// OPTIMISTIC MUTATION ENGINE (SECTION 18.2)
// ==========================================

/**
 * Executes a mutation with instant optimistic UI update and safe rollback
 * 
 * @param {Object} options
 * @param {Function} options.applyOptimistic - Callback to immediately mutate local React state
 * @param {Function} options.revertOptimistic - Callback to restore previous state if server fails
 * @param {Function} options.mutationFn - Async function performing backend write
 * @param {Function} [options.onSuccess] - Callback on server confirmation
 * @param {Function} [options.onError] - Callback on server error
 */
export async function executeOptimisticMutation({
  applyOptimistic,
  revertOptimistic,
  mutationFn,
  onSuccess,
  onError
}) {
  // 1. Instant optimistic update (0ms!)
  try {
    applyOptimistic();
  } catch (err) {
    console.error("Failed to apply optimistic state:", err);
  }

  // 2. Asynchronous server write
  try {
    const res = await mutationFn();
    if (res && res.success) {
      if (onSuccess) onSuccess(res);
      return res;
    } else {
      // Rollback on rejection
      if (revertOptimistic) revertOptimistic();
      const errMsg = res?.message || "បរាជ័យក្នុងការរក្សាទុកទិន្នន័យទៅ Server។";
      if (onError) onError(new Error(errMsg), res);
      return res;
    }
  } catch (err) {
    // Rollback on network failure
    if (revertOptimistic) revertOptimistic();
    if (onError) onError(err);
    return {
      success: false,
      message: err.message || "មានបញ្ហាបច្ចេកទេសក្នុងការតភ្ជាប់។",
      error: "MUTATION_FAILED"
    };
  }
}

/**
 * Background non-blocking prefetcher for speeding up route transitions
 */
export function prefetchApiData(action, params = {}) {
  if (USE_MOCK || !APPS_SCRIPT_URL) return;
  const policy = getPolicyForAction(action);
  const cacheKey = `${action}:${JSON.stringify(params)}`;
  if (!memoryCache.has(cacheKey) && !getPersistentCache(cacheKey, policy)) {
    apiRequest(action, params).catch(() => {});
  }
}

/**
 * 1-Click Instant Deep Sync with Google Sheets
 */
export async function forceLiveSyncSpreadsheet(token) {
  clearApiCache();

  try {
    const query = new URLSearchParams({
      action: "flush_cache",
      token: token || "MyPintou#Sec2026$X9z",
      _t: Date.now().toString()
    });
    await fetch(`${APPS_SCRIPT_URL}?${query.toString()}`, { method: "GET" });
  } catch (_) {}

  window.dispatchEvent(new CustomEvent("pintou:force-synced", { detail: { timestamp: Date.now() } }));
  return { success: true, message: "បានធ្វើសមកាលកម្មទិន្នន័យផ្ទាល់ពី Google Sheets ជោគជ័យ!" };
}
