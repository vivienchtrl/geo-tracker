import { NextRequest, NextResponse } from "next/server";
import { capturePageVisit } from "@/backend/services/tracking.service";
import { isKnownAIProvider, getBotInfo } from "@/features/tracking/utils/bot-detector";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const source = searchParams.get("source") || "unknown";

    // Extract headers for diagnostics
    const userAgent = request.headers.get("user-agent") || "unknown";
    const referer = request.headers.get("referer") || "unknown";
    
    // Perform bot detection
    const botInfo = getBotInfo(userAgent);
    const isAIBot = isKnownAIProvider(userAgent);

    // DIAGNOSTIC LOG - Pixel request received
    console.log("[PIXEL] Request received", {
      timestamp: new Date().toISOString(),
      projectId,
      source,
      userAgent,
      referer,
      botDetection: {
        type: botInfo.botType,
        name: botInfo.botName,
        category: botInfo.category,
        confidence: botInfo.confidence,
        isAIProvider: isAIBot,
      },
    });

    if (!projectId) {
      console.warn("[PIXEL] ❌ Missing projectId", {
        timestamp: new Date().toISOString(),
        source,
        ip: request.headers.get("x-forwarded-for"),
      });
      return new NextResponse(null, { status: 400 });
    }

    // Extract metadata
    const ipAddress =
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Extract path from query or referer
    const searchPath = searchParams.get("path");
    let path = "/";
    
    if (searchPath && searchPath !== "noscript") {
      path = searchPath;
    } else if (referer !== "unknown") {
      try {
        const refererUrl = new URL(referer);
        path = refererUrl.pathname;
      } catch {
        path = "/";
      }
    }

    // Capture the visit
    const result = await capturePageVisit(
      {
        projectId,
        eventType: "page_view",
        path,
        userAgent,
        metadata: {
          source: "pixel",
          pixelSource: source,
          referer,
          botDetected: botInfo.botType !== null,
          botName: botInfo.botName,
          botCategory: botInfo.category,
        },
      },
      ipAddress
    );

    // DIAGNOSTIC LOG - Pixel captured
    const duration = Date.now() - startTime;
    console.log("[PIXEL] ✅ Captured", {
      timestamp: new Date().toISOString(),
      projectId,
      source,
      duration: `${duration}ms`,
      botType: botInfo.botType,
      path,
      visitId: result.id,
    });

    // Return 1x1 transparent GIF
    const pixelBase64 = "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    const pixelBuffer = Buffer.from(pixelBase64, "base64");

    return new NextResponse(pixelBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/gif",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error) {
    console.error("[PIXEL] Critical error:", {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return new NextResponse(null, { status: 500 });
  }
}

