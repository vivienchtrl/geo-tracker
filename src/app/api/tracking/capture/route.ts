/**
 * POST /api/tracking/capture
 *
 * Public API endpoint for website tracker
 * No authentication required (public tracking endpoint)
 *
 * Security Measures:
 * 1. Project ID validation (must exist)
 * 2. Input validation via Zod schemas
 * 3. IP hashing for privacy
 * 4. Size limits (Next.js default + validation)
 * 5. CORS headers for cross-origin tracking
 *
 * Performance:
 * 1. Non-blocking insert and return
 * 2. Aggregation via separate cron jobs
 * 3. Indexes optimized for time-series
 */

import { NextRequest, NextResponse } from "next/server";
import { capturePageVisit } from "@/backend/services/tracking.service";

// Response headers for CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "no-cache, no-store, max-age=0",
};

/**
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      ...corsHeaders,
      "Access-Control-Max-Age": "86400", // 24 hours
    },
  });
}

/**
 * Handle tracking capture requests
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Parse JSON with error handling
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON" },
        { status: 400, headers: corsHeaders }
      );
    }

    // 2. Extract client IP from headers
    // Priority: CDN headers → reverse proxy → direct
    const ipAddress =
      request.headers.get("cf-connecting-ip") || // Cloudflare
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      request.headers.get("x-client-ip") ||
      "unknown";

    // 3. Capture the visit (service handles validation)
    const result = await capturePageVisit(
      body as Parameters<typeof capturePageVisit>[0],
      ipAddress
    );

    // 4. Return response
    // Always return 200 for successful tracking to not leak info
    return NextResponse.json(
      {
        success: result.success,
        message: result.message,
        // Only include ID in development for debugging
        ...(process.env.NODE_ENV === "development" && { id: result.id }),
      },
      {
        status: result.success ? 200 : 400,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("[Tracker API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

