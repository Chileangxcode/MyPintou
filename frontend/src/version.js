/**
 * Centralized Application Version Management
 * Auto-generated and synchronized at build time.
 */

export const APP_VERSION = "2.2.3";
export const BUILD_TIMESTAMP = new Date().toISOString();
export const RELEASE_CHANNEL = "production";
export const RELEASE_NOTES = [
  "Save Login: Automatic persistent sessions and credential remembering for students and staff",
  "Smart Redirect: Instant routing to Student or Admin Dashboard upon return",
  "Native Browser Password Manager / Keychain credential save support",
  "One-tap saved credential chip and clear-login convenience options"
];

/**
 * Checks for deployed version updates by querying public /version.json
 * @returns {Promise<{ hasUpdate: boolean, latestVersion: string, currentVersion: string, buildTime: string }>}
 */
export async function checkForAppUpdates() {
  try {
    const res = await fetch(`/version.json?t=${Date.now()}`, {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" }
    });
    if (!res.ok) {
      return { hasUpdate: false, currentVersion: APP_VERSION, latestVersion: APP_VERSION };
    }
    const data = await res.json();
    const latestVersion = data.version || APP_VERSION;
    const hasUpdate = latestVersion !== APP_VERSION || data.buildTimestamp > BUILD_TIMESTAMP;
    return {
      hasUpdate,
      currentVersion: APP_VERSION,
      latestVersion,
      buildTime: data.buildTimestamp || BUILD_TIMESTAMP,
      releaseNotes: data.releaseNotes || RELEASE_NOTES
    };
  } catch (err) {
    console.warn("Failed to check app updates:", err);
    return { hasUpdate: false, currentVersion: APP_VERSION, latestVersion: APP_VERSION };
  }
}

