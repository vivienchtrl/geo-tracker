/**
 * Tracking Snippet Generator - Next.js 16 with Proxy
 * 
 * NEW APPROACH (Simplified):
 * - Bots are tracked server-side automatically via proxy.ts
 * - Users don't need HTML modifications
 * - Optional: Add tracker.min.js for human analytics (1 line)
 * 
 * Why this is better:
 * - Zero friction for users
 * - Bots can't be missed (server-side detection)
 * - Full page data available (User-Agent, IP, referer, etc.)
 */

export interface SnippetOptions {
  projectId: string;
  baseUrl: string;
}

/**
 * Generates the minimal tracker snippet for users (OPTIONAL)
 * 
 * This is optional - bots are tracked automatically via proxy.ts
 * Users can add this if they want to track human visitors too
 * 
 * @param options - Configuration with projectId and baseUrl
 * @returns HTML snippet (1 line)
 */
export function generateRobustSnippet({ projectId, baseUrl }: SnippetOptions): string {
  return `<!-- Geo Tracker -->
<script src="${baseUrl}/tracker.min.js?p=${projectId}" async></script>
<noscript><img src="${baseUrl}/api/tracking/pixel?p=${projectId}&source=noscript" style="display:none;" alt="" /></noscript>
<!-- End Geo Tracker -->`;
}

/**
 * Generate tracking info message for documentation
 * Shows what happens automatically vs what's optional
 */
export function getTrackingInfo(): string {
  return `
Geo Tracker - Next.js 16 with Proxy

AUTOMATIC (No user code needed):
✅ Bot tracking via proxy.ts
✅ User-Agent detection
✅ Server-side bot classification
✅ Logs in console: [BOT-DETECTED]

OPTIONAL (1 line of code):
📝 Human visitor tracking with tracker.min.js
<script src="https://yourdomain.com/tracker.min.js?p=PROJECT_ID"></script>

Note: Bots are tracked automatically regardless of whether tracker.min.js is added.
`;
}

