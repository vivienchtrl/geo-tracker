/**
 * GEO-TRACKER JavaScript
 *
 * Installation:
 * <script src="https://your-domain.com/tracker.js" data-project-id="PROJECT_UUID" async defer></script>
 *
 * Features:
 * - Automatic page view tracking
 * - Device detection (mobile/tablet/desktop)
 * - Referrer capture with domain extraction
 * - UTM parameter extraction
 * - Persistent visitor ID (localStorage)
 * - Performance metrics (page load time)
 * - GDPR compliant (no cookies, no PII)
 * - Fallback support (sendBeacon + fetch)
 *
 * Performance:
 * - Non-blocking (async)
 * - Minimal payload (~500 bytes)
 * - No external dependencies
 * - Efficient visitor ID persistence
 */

(function () {
  "use strict";

  // =========================================================================
  // CONFIGURATION
  // =========================================================================

  const TRACKING_VERSION = "2.0.0";

  // Get script element and configuration
  const script = document.currentScript;
  if (!script) {
    console.warn("[GeoTracker] Could not access script element");
    return;
  }

  const projectId = script.getAttribute("data-project-id");
  if (!projectId) {
    console.warn("[GeoTracker] Missing data-project-id attribute");
    return;
  }

  // Determine endpoint (same origin or custom)
  const customEndpoint = script.getAttribute("data-endpoint");
  const ENDPOINT = customEndpoint || "/api/tracking/capture";

  // Determine base URL for API calls
  const scriptSrc = script.src;
  let API_BASE = "";
  if (scriptSrc) {
    try {
      const url = new URL(scriptSrc);
      API_BASE = url.origin;
    } catch {
      // Use relative path if parsing fails
    }
  }

  const FULL_ENDPOINT = API_BASE ? `${API_BASE}${ENDPOINT}` : ENDPOINT;

  // =========================================================================
  // UTILITIES
  // =========================================================================

  /**
   * Generate or retrieve persistent visitor ID
   * Stored in localStorage to track repeat visitors
   *
   * Privacy:
   * - Visitor ID is anonymous (random UUID)
   * - No PII is stored
   * - Users can clear localStorage to reset
   * - Cross-domain tracking not possible
   */
  function getVisitorId() {
    const storageKey = `_geo_tracker_vid`;
    let id = null;

    try {
      id = localStorage.getItem(storageKey);
      if (!id) {
        // Generate UUID v4
        id = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
          /[xy]/g,
          function (c) {
            const r = (Math.random() * 16) | 0;
            const v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
          }
        );
        localStorage.setItem(storageKey, id);
      }
    } catch {
      // localStorage not available (private browsing)
      // Generate session-only ID
      id = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        function (c) {
          const r = (Math.random() * 16) | 0;
          const v = c === "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        }
      );
    }

    return id;
  }

  /**
   * Detect device type from User-Agent and screen
   */
  function detectDeviceType() {
    const ua = navigator.userAgent.toLowerCase();

    // Check for mobile indicators
    if (/iphone|ipod/.test(ua)) return "mobile";
    if (/ipad/.test(ua)) return "tablet";
    if (/android/.test(ua)) {
      // Android tablets typically have "tablet" in UA or wider screens
      if (/tablet/.test(ua) || (window.innerWidth > 768)) {
        return "tablet";
      }
      return "mobile";
    }
    if (/windows phone|blackberry|webos|opera mini/.test(ua)) return "mobile";

    return "desktop";
  }

  /**
   * Extract UTM parameters from URL
   */
  function extractUtmParams() {
    const params = {};
    const utmFields = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
    ];

    try {
      const url = new URL(window.location.href);
      for (const field of utmFields) {
        const value = url.searchParams.get(field);
        if (value) {
          // Convert utm_source to utmSource
          const key = field.replace(/_([a-z])/g, (_, letter) =>
            letter.toUpperCase()
          );
          params[key] = value;
        }
      }
    } catch {
      // URL parsing failed, skip
    }

    return params;
  }

  /**
   * Get page load time (Performance API)
   */
  function getPageLoadTime() {
    try {
      if (window.performance && window.performance.timing) {
        const timing = window.performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        return loadTime > 0 ? loadTime : null;
      }
    } catch {
      // Performance API not available
    }
    return null;
  }

  /**
   * Send tracking payload
   * Uses sendBeacon for reliability, falls back to fetch
   */
  function sendPayload(payload) {
    const json = JSON.stringify(payload);
    const blob = new Blob([json], { type: "application/json" });

    // Try sendBeacon first (most reliable for page unload)
    if (navigator.sendBeacon) {
      const sent = navigator.sendBeacon(FULL_ENDPOINT, blob);
      if (sent) return;
    }

    // Fallback to fetch
    fetch(FULL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: json,
      keepalive: true, // Ensure request completes on page unload
    }).catch(function () {
      // Silently fail - don't break user's page
    });
  }

  // =========================================================================
  // TRACKING FUNCTIONS
  // =========================================================================

  /**
   * Track page view
   */
  function trackPageView() {
    try {
      const referrer = document.referrer;
      const utmParams = extractUtmParams();
      const pageLoadTime = getPageLoadTime();

      // Build payload
      const payload = {
        projectId: projectId,
        eventType: "page_view",
        path: window.location.pathname,
        url: window.location.href,
        hash: window.location.hash || undefined,
        title: document.title || undefined,
        referrer: referrer || undefined,
        userAgent: navigator.userAgent,
        visitorId: getVisitorId(),
        deviceType: detectDeviceType(),
        acceptLanguage: navigator.language || navigator.userLanguage,
        pageLoadTime: pageLoadTime || undefined,
        metadata: {
          trackerVersion: TRACKING_VERSION,
          screenWidth: window.screen.width,
          screenHeight: window.screen.height,
          colorDepth: window.screen.colorDepth,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      };

      // Add UTM parameters if present
      if (utmParams.utmSource) payload.utmSource = utmParams.utmSource;
      if (utmParams.utmMedium) payload.utmMedium = utmParams.utmMedium;
      if (utmParams.utmCampaign) payload.utmCampaign = utmParams.utmCampaign;
      if (utmParams.utmContent) payload.utmContent = utmParams.utmContent;
      if (utmParams.utmTerm) payload.utmTerm = utmParams.utmTerm;

      // Send
      sendPayload(payload);
    } catch (error) {
      // Never break page functionality
      console.debug("[GeoTracker] Error:", error);
    }
  }

  // =========================================================================
  // INITIALIZATION
  // =========================================================================

  function init() {
    // Wait for DOM to be ready
    if (
      document.readyState === "complete" ||
      document.readyState === "interactive"
    ) {
      // Small delay to ensure page load metrics are available
      setTimeout(trackPageView, 100);
    } else {
      document.addEventListener("DOMContentLoaded", function () {
        setTimeout(trackPageView, 100);
      });
    }
  }

  // Start tracking
  init();
})();
