/**
 * Proxy Handler for Next.js 16
 *
 * Combines:
 * 1. Supabase Auth Protection
 * 2. Bot Detection & Tracking (server-side, no user code needed)
 *
 * Purpose:
 * - Handle authentication and route protection
 * - Automatically capture ALL page visits (bot + human) server-side
 * - Log User-Agent and detect bots without user HTML modifications
 *
 * Performance:
 * - Runs at Edge (if using Vercel)
 * - ~1ms overhead per request
 * - Non-blocking async logging
 */

import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { getBotInfo, isKnownAIProvider } from "@/features/tracking/utils/bot-detector";
import { capturePageVisit } from "@/backend/services/tracking.service";

// ============================================================
// CONFIGURATION
// ============================================================

const EXCLUDED_PATHS = [
  '/_next',           // Next.js internals
  '/api/health',      // Health checks
  '/api/webhook',     // Webhooks (prevent loops)
  '.ico',             // Favicon
  '.png',             // Images
  '.jpg',
  '.svg',
  '.css',
  '.js.map',          // Source maps
];

// ============================================================
// HELPERS
// ============================================================

/**
 * Check if path should be tracked
 */
function shouldTrack(pathname: string): boolean {
  return !EXCLUDED_PATHS.some(path => pathname.includes(path));
}

/**
 * Extract useful information from request headers
 */
function extractRequestInfo(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const referer = request.headers.get('referer') || null;
  const acceptLanguage = request.headers.get('accept-language') || null;
  
  // Extract IP (from multiple possible headers)
  const ip =
    request.headers.get('cf-connecting-ip') ||     // Cloudflare
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('x-client-ip') ||
    'unknown';

  return {
    userAgent,
    referer,
    acceptLanguage,
    ip,
  };
}

// ============================================================
// MAIN PROXY FUNCTION
// ============================================================

/**
 * Main proxy handler
 * Handles auth + tracks all requests with bot detection
 */
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const searchParams = request.nextUrl.searchParams;
  const projectId = searchParams.get('p'); // ID du projet dans l'URL du script (ex: tracker.min.js?p=ID)

  // ============================================================
  // CAPTURE AUTOMATIQUE (Server-Side)
  // Si un bot charge le script, on l'enregistre immédiatement
  // ============================================================
  if ((pathname.includes('tracker.js') || pathname.includes('tracker.min.js')) && projectId) {
    const { userAgent, referer, ip } = extractRequestInfo(request);
    
    // On enregistre la visite en DB de manière asynchrone (non-bloquant)
    capturePageVisit({
      projectId,
      eventType: 'page_view',
      path: referer || 'external-site', // Le site où le bot a chargé le script
      userAgent,
      referrer: referer || undefined,
      metadata: { 
        detection_method: 'proxy_script_load',
        note: 'Captured server-side when tracker script was requested'
      }
    }, ip).catch(err => console.error('[PROXY-SAVE-ERROR]', err));
  }

  // ============================================================
  // STEP 1: Track requests with bot detection
  // ============================================================
  if (shouldTrack(pathname)) {
    try {
      const { userAgent, referer, acceptLanguage, ip } = extractRequestInfo(request);
      const botInfo = getBotInfo(userAgent);
      const isAI = isKnownAIProvider(userAgent);

      // Log all requests
      console.log('[PROXY-TRACK]', {
        timestamp: new Date().toISOString(),
        pathname,
        ip,
        userAgent,
        referer,
        acceptLanguage,
        botDetection: {
          type: botInfo.botType,
          name: botInfo.botName,
          category: botInfo.category,
          confidence: botInfo.confidence,
          isAIProvider: isAI,
        },
      });

      // Log bots separately for easy filtering
      if (botInfo.botType !== null) {
        console.log('[BOT-DETECTED]', {
          timestamp: new Date().toISOString(),
          botType: botInfo.botType,
          botName: botInfo.botName,
          pathname,
          ip,
        });
      }
    } catch (error) {
      // Don't break request if tracking fails
      console.error('[PROXY-TRACK-ERROR]', error);
    }
  }

  // ============================================================
  // STEP 2: Handle Supabase Session Refresh
  // ============================================================
  const { supabaseResponse, user } = await updateSession(request);

  // ============================================================
  // STEP 3: Protect Dashboard Routes
  // ============================================================
  if (pathname.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/auth/sign-in', request.url));
  }

  // ============================================================
  // STEP 4: Redirect Logged-in Users away from Auth pages
  // ============================================================
  if ((pathname.startsWith('/auth/sign-in') || pathname.startsWith('/auth/sign-up')) && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // ============================================================
  // STEP 5: Return auth response (with tracking already logged)
  // ============================================================
  return supabaseResponse;
}

/**
 * Proxy configuration
 * Defines which routes the proxy runs on
 */
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
