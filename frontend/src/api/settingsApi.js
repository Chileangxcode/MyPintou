import { apiRequest } from "./client.js";

/**
 * Health & Diagnostics API Methods
 */

export async function getHealthStatus(refresh = false) {
  return apiRequest("health", {
    refresh: refresh ? "true" : "false"
  });
}

export async function prepareDatabaseSheets(token) {
  return apiRequest("prepare_sheets", {
    token: token || "MyPintou#Sec2026$X9z"
  }, { forceRefresh: true });
}

export async function setupSheetRelations(token) {
  return apiRequest("setup_relations", {
    token: token || "MyPintou#Sec2026$X9z"
  }, { forceRefresh: true });
}

export async function flushApiCache(token) {
  return apiRequest("flush_cache", {
    token: token || "MyPintou#Sec2026$X9z"
  }, { forceRefresh: true });
}
