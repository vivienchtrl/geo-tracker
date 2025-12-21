/**
 * Tracking Snippet Generator
 * 
 * Purpose: Generate high-reliability tracking snippets for users.
 * Strategy: Triple-layer approach:
 *   1. Pixel (noscript) - Captures pure crawlers (no JS needed)
 *   2. tracker.js + pixel - Captures headless browsers (fast exit)
 *   3. Visitor ID - Tracks repeat visitors (humans with JS)
 * 
 * Coverage:
 * - Pure HTTP crawlers (Perplexity, pure Googlebot) → Pixel direct
 * - Headless browsers (ChatGPT, Claude Web) → Pixel + JS race condition
 * - Humans → Full JS tracking + localStorage
 */

export interface SnippetOptions {
  projectId: string;
  baseUrl: string;
}

/**
 * Generates the "Robust Triple-Layer" tracking code.
 * 
 * This snippet MUST be placed in <head> BEFORE any other scripts.
 * 
 * Security:
 * - Pixel requests are logged server-side with User-Agent
 * - Bot detection happens server-side (not spoofable)
 * - No sensitive data exposed in HTML
 * 
 * @param options - Configuration with projectId and baseUrl
 * @returns HTML snippet to insert in <head>
 */
export function generateRobustSnippet({ projectId, baseUrl }: SnippetOptions): string {
  const scriptUrl = `${baseUrl}/tracker.js`;
  const pixelUrl = `${baseUrl}/api/tracking/pixel`;

  return `<!-- Geo Tracker: Triple-Layer Bot + Human Tracking -->
<!-- Layer 1: Pixel for pure crawlers (no JS required) -->
<img 
  src="${pixelUrl}?projectId=${projectId}&source=head-pixel&timestamp=\${Date.now()}"
  width="1" 
  height="1" 
  alt="" 
  style="position:absolute;left:-9999px;width:1px;height:1px;"
  loading="lazy"
/>

<!-- Layer 2: tracker.js for JS-enabled visitors (humans + headless browsers) -->
<script src="${scriptUrl}" data-project-id="${projectId}" async defer></script>

<!-- Layer 3: Pixel fallback for noscript + early exit crawlers -->
<noscript>
  <img 
    src="${pixelUrl}?projectId=${projectId}&source=noscript&timestamp=\${Date.now()}" 
    width="1" 
    height="1" 
    alt="" 
    style="position:absolute;left:-9999px;width:1px;height:1px;"
  />
</noscript>

<!-- Layer 4: Diagnostic console logs (development only) -->
<script>
  (function() {
    if (typeof console !== 'undefined' && typeof console.debug === 'function') {
      console.debug('[GeoTracker] Initialized for project: ${projectId}');
      console.debug('[GeoTracker] Pixel endpoint: ${pixelUrl}');
      console.debug('[GeoTracker] User-Agent:', navigator.userAgent);
    }
  })();
</script>`;
}

/**
 * Generate minimal snippet (if you want just the pixel)
 * Use this for non-JavaScript tracking
 * 
 * @param options - Configuration with projectId and baseUrl
 * @returns Minimal HTML pixel snippet
 */
export function generateMinimalPixelSnippet({ projectId, baseUrl }: SnippetOptions): string {
  const pixelUrl = `${baseUrl}/api/tracking/pixel`;
  
  return `<!-- Geo Tracker: Pixel Only (No JS) -->
<img src="${pixelUrl}?projectId=${projectId}&source=pixel-only" width="1" height="1" alt="" loading="lazy" />`;
}

/**
 * Generate debug version with additional logging
 * Use for troubleshooting bot tracking issues
 * 
 * @param options - Configuration with projectId and baseUrl
 * @returns HTML snippet with debug logging
 */
export function generateDebugSnippet({ projectId, baseUrl }: SnippetOptions): string {
  const scriptUrl = `${baseUrl}/tracker.js`;
  const pixelUrl = `${baseUrl}/api/tracking/pixel`;

  return `<!-- Geo Tracker: Debug Version with Diagnostics -->
<script>
  window.__GEO_TRACKER_DEBUG__ = {
    projectId: '${projectId}',
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    pixelUrl: '${pixelUrl}',
    log: function(msg) {
      console.log('[GeoTracker-Debug]', msg, this);
    }
  };
  window.__GEO_TRACKER_DEBUG__.log('Initialized');
  
  // Log if JavaScript is disabled
  (function() {
    console.log('[GeoTracker-Debug] JavaScript is ENABLED');
  })();
</script>

<!-- Layer 1: Early pixel for fast crawlers -->
<img 
  src="${pixelUrl}?projectId=${projectId}&source=head-early&debug=true" 
  width="1" 
  height="1" 
  alt="" 
/>

<!-- Layer 2: Main tracker script -->
<script src="${scriptUrl}" data-project-id="${projectId}" async defer></script>

<!-- Layer 3: Noscript fallback -->
<noscript>
  <img src="${pixelUrl}?projectId=${projectId}&source=noscript&debug=true" width="1" height="1" alt="" />
  <p style="color: red; font-size: 10px;">GeoTracker: JavaScript disabled. Basic tracking only.</p>
</noscript>`;
}

