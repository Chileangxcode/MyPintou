/**
 * Centralized Application Version Management
 * Auto-generated and synchronized at build time.
 */

export const APP_VERSION = "2.2.2";
export const BUILD_TIMESTAMP = new Date().toISOString();
export const RELEASE_CHANNEL = "production";
export const RELEASE_NOTES = [
  "Unified Royal Blue (#2563EB) single-color academic brand identity",
  "Eliminated rainbow multi-color gradients across badges, buttons, and banners",
  "Tailwind CSS v4 Royal Blue theme aliasing for crisp visual harmony",
  "Mobile Navigation & Safe-Area Ergonomics with zero footer clipping"
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

