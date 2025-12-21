import { NextRequest, NextResponse } from "next/server";
import { capturePageVisit } from "@/backend/services/tracking.service";

/**
 * GET /api/tracking/pixel
 * 
 * Tracking "fantôme" pour les robots et les navigateurs sans JavaScript.
 * Renvoie une image GIF transparente de 1x1 pixel.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return new NextResponse(null, { status: 400 });
    }

    // 1. Extraction des métadonnées
    const userAgent = request.headers.get("user-agent") || "unknown";
    const referer = request.headers.get("referer") || "unknown";
    const ipAddress =
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // 2. Extraction du chemin (path) depuis le Referer
    let path = "/";
    try {
      if (referer !== "unknown") {
        const refererUrl = new URL(referer);
        path = refererUrl.pathname;
      }
    } catch (e) {
      path = "/";
    }

    // 3. Capture de la visite en arrière-plan (Server-Side)
    // On ne l'attend pas avec 'await' pour répondre le plus vite possible au robot
    capturePageVisit(
      {
        projectId,
        eventType: "page_view",
        path: path,
        userAgent: userAgent,
        metadata: {
          source: "pixel-noscript",
          referer: referer,
        },
      },
      ipAddress
    ).catch((err) => console.error("[Pixel API] Tracking error:", err));

    // 4. Construction de la réponse (Image GIF 1x1 transparente)
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
    console.error("[Pixel API] Critical error:", error);
    return new NextResponse(null, { status: 500 });
  }
}

