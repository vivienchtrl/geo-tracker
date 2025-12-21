import { NextRequest, NextResponse } from "next/server";
import { capturePageVisit } from "@/backend/services/tracking.service";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    // LOG DE DIAGNOSTIC
    const userAgent = request.headers.get("user-agent") || "unknown";
    console.log(`[PIXEL-TRACKER] Requête reçue pour le projet: ${projectId}`);
    console.log(`[PIXEL-TRACKER] User-Agent: ${userAgent}`);

    if (!projectId) {
      console.error("[PIXEL-TRACKER] Erreur: ProjectID manquant");
      return new NextResponse(null, { status: 400 });
    }

    // 1. Extraction des métadonnées
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

    // 3. Capture de la visite (Server-Side)
    // On doit 'await' sinon Vercel coupe la fonction avant l'enregistrement en DB
    await capturePageVisit(
      {
        projectId,
        eventType: "page_view",
        path: path,
        userAgent: userAgent,
        metadata: {
          source: "pixel",
          referer: referer,
        },
      },
      ipAddress
    );

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

