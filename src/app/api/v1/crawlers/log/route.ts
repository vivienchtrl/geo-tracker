/**
 * POST /api/v1/crawlers/log
 *
 * API endpoint for receiving crawler visit logs from external integrations
 * (Cloudflare Workers, WordPress, etc.)
 *
 * Authentication: X-API-Key header (project-scoped API key)
 *
 * Security Measures:
 * 1. API key validation (hash-based)
 * 2. Input validation via Zod schemas
 * 3. IP hashing for privacy
 * 4. Size limits on body fields
 * 5. CORS headers for cross-origin requests
 *
 * Rate Limiting: (TODO: implement with Upstash Redis)
 * - 1000 requests/minute per API key
 * - 10,000 requests/hour per project
 */

import { NextRequest, NextResponse } from "next/server";
import { validateApiKey, updateKeyLastUsed } from "@/backend/services/api-keys.service";
import { captureCrawlerVisit } from "@/backend/services/crawler-visits.service";
import { crawlerVisitSchema } from "@/backend/validators/crawler-visits.validators";

// CORS headers for cross-origin requests from Cloudflare Workers, etc.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
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
 * Handle crawler log submissions
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Extract and validate API key
    const apiKey = request.headers.get("X-API-Key") || request.headers.get("x-api-key");

    if (!apiKey) {
      console.warn("[CRAWLER-LOG] Missing API key", {
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json(
        { error: "Missing API key. Include X-API-Key header." },
        { status: 401, headers: corsHeaders }
      );
    }

    // 2. Validate API key
    const keyValidation = await validateApiKey(apiKey);

    if (!keyValidation.valid) {
      console.warn("[CRAWLER-LOG] Invalid API key", {
        timestamp: new Date().toISOString(),
        error: keyValidation.error,
      });
      return NextResponse.json(
        { error: keyValidation.error },
        { status: keyValidation.status || 401, headers: corsHeaders }
      );
    }

    // 3. Parse JSON body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      console.warn("[CRAWLER-LOG] Invalid JSON", {
        timestamp: new Date().toISOString(),
        projectId: keyValidation.projectId,
      });
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400, headers: corsHeaders }
      );
    }

    // 4. Validate request body
    const validation = crawlerVisitSchema.safeParse(body);

    if (!validation.success) {
      console.warn("[CRAWLER-LOG] Validation failed", {
        timestamp: new Date().toISOString(),
        projectId: keyValidation.projectId,
        errors: validation.error.issues,
      });
      return NextResponse.json(
        {
          error: "Invalid payload",
          details: validation.error.issues.map((i) => ({
            field: i.path.join("."),
            message: i.message,
          })),
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // 5. Log the visit
    await captureCrawlerVisit(keyValidation.projectId!, validation.data);

    // 6. Update key lastUsedAt (fire and forget)
    updateKeyLastUsed(keyValidation.keyId!).catch((err) => {
      console.error("[CRAWLER-LOG] Failed to update lastUsedAt", err);
    });

    // 7. Log success
    console.log("[CRAWLER-LOG] ✅ Visit logged", {
      timestamp: new Date().toISOString(),
      projectId: keyValidation.projectId,
      botName: validation.data.botName,
      path: validation.data.path,
    });

    return NextResponse.json(
      { success: true },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("[CRAWLER-LOG] Critical error:", {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
