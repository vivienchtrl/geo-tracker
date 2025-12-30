/**
 * GET /api/v1/crawlers/ping
 *
 * Health check endpoint for WordPress plugin "Test Connection" feature
 * Validates the API key and returns success/failure
 */

import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/backend/services/api-keys.service";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      ...corsHeaders,
      "Access-Control-Max-Age": "86400",
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get("X-API-Key") || request.headers.get("x-api-key");

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing API key" },
        { status: 401, headers: corsHeaders }
      );
    }

    const keyValidation = await validateApiKey(apiKey);

    if (!keyValidation.valid) {
      return NextResponse.json(
        { error: keyValidation.error },
        { status: 401, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, message: "Connection successful" },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("[CRAWLER-PING] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
