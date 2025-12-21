/**
 * User-Agent Parser
 *
 * Purpose: Extract device, OS, and browser information from User-Agent strings
 * Strategy: Pattern matching with fallback heuristics
 *
 * Note: This is a lightweight parser for basic info extraction
 * For production-grade parsing, consider using a library like:
 * - ua-parser-js
 * - useragent
 * - bowser
 */

export interface DeviceInfo {
  deviceType: "mobile" | "tablet" | "desktop" | null;
  osName: string | null;
  osVersion: string | null;
  browserName: string | null;
  browserVersion: string | null;
  browserEngine: string | null;
}

/**
 * Parse User-Agent string to extract device information
 *
 * Strategy:
 * 1. Detect device type first (mobile/tablet indicators are most reliable)
 * 2. Parse OS from common signatures
 * 3. Parse browser from engine hints and version numbers
 *
 * Accuracy: ~85% (some older/obscure UAs may fail gracefully)
 */
export function parseUserAgent(userAgent: string): DeviceInfo {
  if (!userAgent) {
    return {
      deviceType: null,
      osName: null,
      osVersion: null,
      browserName: null,
      browserVersion: null,
      browserEngine: null,
    };
  }

  const ua = userAgent.toLowerCase();

  // ===== DEVICE TYPE DETECTION =====
  const deviceType = detectDeviceType(ua);

  // ===== OPERATING SYSTEM DETECTION =====
  const { osName, osVersion } = detectOS(ua);

  // ===== BROWSER DETECTION =====
  const { browserName, browserVersion, browserEngine } = detectBrowser(ua);

  return {
    deviceType,
    osName,
    osVersion,
    browserName,
    browserVersion,
    browserEngine,
  };
}

/**
 * Detect device type from User-Agent
 *
 * Indicators:
 * - Mobile: iPhone, Android (without tablet indicator), Windows Phone, BlackBerry
 * - Tablet: iPad, Android with tablet indicator
 * - Desktop: Everything else
 */
function detectDeviceType(ua: string): "mobile" | "tablet" | "desktop" | null {
  // Mobile devices
  if (/iphone|ipod|mobile|android(?!.*tablet)|windows phone|blackberry|webos|opera mini/i.test(ua)) {
    // Check if it's actually a tablet
    if (/ipad|android.*tablet|kindle|playbook|nexus 7|nexus 10|xoom/i.test(ua)) {
      return "tablet";
    }
    return "mobile";
  }

  // Tablets
  if (/ipad|android|tablet|playbook|silk|kindle|nexus|xoom|lumia|nexus 7|nexus 10/i.test(ua)) {
    return "tablet";
  }

  // Desktop (default)
  return "desktop";
}

/**
 * Detect Operating System
 */
function detectOS(ua: string): { osName: string | null; osVersion: string | null } {
  // Windows
  if (/windows|win32|win64/i.test(ua)) {
    const match = /windows nt ([\d.]+)|win(32|64)/i.exec(ua);
    const version = match ? match[1] : null;

    // Map Windows NT versions to release names
    const versionMap: Record<string, string> = {
      "10.0": "Windows 11", // Win 11 uses 10.0
      "6.3": "Windows 8.1",
      "6.2": "Windows 8",
      "6.1": "Windows 7",
      "6.0": "Windows Vista",
      "5.1": "Windows XP",
    };

    const osName = version ? versionMap[version] || `Windows ${version}` : "Windows";
    return { osName, osVersion: version };
  }

  // macOS
  if (/mac os x|macos|darwin/i.test(ua)) {
    const match = /mac os x ([\d._]+)|macos ([\d._]+)/i.exec(ua);
    const version = match ? (match[1] || match[2]) : null;
    return { osName: "macOS", osVersion: version };
  }

  // Linux
  if (/linux/i.test(ua)) {
    // Try to identify specific Linux distributions
    if (/ubuntu/i.test(ua)) {
      const match = /ubuntu\/([\d.]+)/i.exec(ua);
      return { osName: "Ubuntu", osVersion: match ? match[1] : null };
    }
    if (/debian/i.test(ua)) return { osName: "Debian", osVersion: null };
    if (/fedora/i.test(ua)) return { osName: "Fedora", osVersion: null };
    if (/centos/i.test(ua)) return { osName: "CentOS", osVersion: null };

    return { osName: "Linux", osVersion: null };
  }

  // iOS
  if (/iphone|ipad|ipod/i.test(ua)) {
    const match = /os ([\d_]+)/i.exec(ua);
    const version = match ? match[1]?.replace(/_/g, ".") : null;
    return { osName: "iOS", osVersion: version };
  }

  // Android
  if (/android/i.test(ua)) {
    const match = /android ([\d.]+)/i.exec(ua);
    return { osName: "Android", osVersion: match ? match[1] : null };
  }

  // Other/Unknown
  return { osName: null, osVersion: null };
}

/**
 * Detect Browser and Engine
 */
function detectBrowser(ua: string): {
  browserName: string | null;
  browserVersion: string | null;
  browserEngine: string | null;
} {
  // ===== ENGINE FIRST (more reliable) =====
  let browserEngine: string | null = null;
  if (/webkit/i.test(ua)) browserEngine = "WebKit";
  if (/gecko/i.test(ua)) browserEngine = "Gecko";
  if (/blink/i.test(ua)) browserEngine = "Blink"; // Blink is based on WebKit

  // ===== BROWSER DETECTION =====

  // Chrome (includes Chromium-based browsers)
  if (/chrome|chromium|crios/i.test(ua) && !/edge|edg|opera|opr/i.test(ua)) {
    const match = /(?:chrome|crios)\/([\d.]+)/i.exec(ua);
    return {
      browserName: "Chrome",
      browserVersion: match ? match[1] : null,
      browserEngine: "Blink",
    };
  }

  // Firefox
  if (/firefox|fxios/i.test(ua)) {
    const match = /(?:firefox|fxios)\/([\d.]+)/i.exec(ua);
    return {
      browserName: "Firefox",
      browserVersion: match ? match[1] : null,
      browserEngine: "Gecko",
    };
  }

  // Safari
  if (/safari/i.test(ua) && !/chrome|chromium|crios|edge|edg/i.test(ua)) {
    const match = /version\/([\d.]+)/i.exec(ua);
    return {
      browserName: "Safari",
      browserVersion: match ? match[1] : null,
      browserEngine: "WebKit",
    };
  }

  // Edge (Chromium-based)
  if (/edge|edg/i.test(ua)) {
    const match = /(?:edge|edg)\/([\d.]+)/i.exec(ua);
    return {
      browserName: "Edge",
      browserVersion: match ? match[1] : null,
      browserEngine: "Blink",
    };
  }

  // Opera
  if (/opera|opr/i.test(ua)) {
    const match = /(?:opera|opr)\/([\d.]+)/i.exec(ua);
    return {
      browserName: "Opera",
      browserVersion: match ? match[1] : null,
      browserEngine: "Blink",
    };
  }

  // IE (legacy)
  if (/msie|trident/i.test(ua)) {
    const match = /(?:msie |trident.*rv:)([\d.]+)/i.exec(ua);
    return {
      browserName: "Internet Explorer",
      browserVersion: match ? match[1] : null,
      browserEngine: "Trident",
    };
  }

  // Default/Unknown
  return {
    browserName: null,
    browserVersion: null,
    browserEngine,
  };
}

/**
 * Get human-readable browser string
 * Example: "Chrome 120.0.0.0 on macOS 14.2"
 */
export function formatBrowserString(deviceInfo: DeviceInfo): string {
  const parts: string[] = [];

  if (deviceInfo.browserName) {
    const browser = deviceInfo.browserVersion
      ? `${deviceInfo.browserName} ${deviceInfo.browserVersion}`
      : deviceInfo.browserName;
    parts.push(browser);
  }

  if (deviceInfo.osName) {
    const os = deviceInfo.osVersion
      ? `${deviceInfo.osName} ${deviceInfo.osVersion}`
      : deviceInfo.osName;
    parts.push(`on ${os}`);
  }

  return parts.join(" ") || "Unknown";
}

