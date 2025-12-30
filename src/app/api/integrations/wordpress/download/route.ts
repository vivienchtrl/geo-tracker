import { NextResponse } from "next/server";
import JSZip from "jszip";
import fs from "fs/promises";
import path from "path";

const PLUGIN_DIR = path.join(
  process.cwd(),
  "src/features/ai-crawlers/integrations/wordpress/plugin"
);

const PLACEHOLDER_URL = "https://geo-tracker.com";

function getAppUrl(): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    throw new Error("NEXT_PUBLIC_APP_URL environment variable is not set");
  }
  return appUrl.replace(/\/$/, ""); // Remove trailing slash
}

async function addFilesToZip(
  zip: JSZip,
  dirPath: string,
  zipPath: string = "",
  appUrl: string
): Promise<void> {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const zipFilePath = zipPath ? `${zipPath}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      await addFilesToZip(zip, fullPath, zipFilePath, appUrl);
    } else {
      // Read file content
      const content = await fs.readFile(fullPath);

      // Replace placeholder URL in PHP files
      if (entry.name.endsWith(".php")) {
        const textContent = content.toString("utf-8");
        const updatedContent = textContent.replaceAll(PLACEHOLDER_URL, appUrl);
        zip.file(zipFilePath, updatedContent);
      } else {
        zip.file(zipFilePath, content);
      }
    }
  }
}

export async function GET() {
  try {
    // Get app URL from environment
    let appUrl: string;
    try {
      appUrl = getAppUrl();
    } catch {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_APP_URL is not configured" },
        { status: 500 }
      );
    }

    // Verify plugin directory exists
    try {
      await fs.access(PLUGIN_DIR);
    } catch {
      return NextResponse.json(
        { error: "Plugin files not found" },
        { status: 404 }
      );
    }

    // Create ZIP archive
    const zip = new JSZip();
    const pluginFolder = zip.folder("geo-tracker");

    if (!pluginFolder) {
      return NextResponse.json(
        { error: "Failed to create ZIP folder" },
        { status: 500 }
      );
    }

    // Add all plugin files to the ZIP (with URL replacement)
    await addFilesToZip(pluginFolder, PLUGIN_DIR, "", appUrl);

    // Generate ZIP buffer
    const zipBuffer = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 9 },
    });

    // Return ZIP file as download
    return new NextResponse(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": "attachment; filename=geo-tracker.zip",
        "Content-Length": zipBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error generating plugin ZIP:", error);
    return NextResponse.json(
      { error: "Failed to generate plugin download" },
      { status: 500 }
    );
  }
}
