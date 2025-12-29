import type { IntegrationSnippet } from "../types";

export const CLOUDFLARE_SNIPPET: IntegrationSnippet = {
  id: "cloudflare",
  name: "Cloudflare Workers",
  description: "Deploy as a Worker and add route to your domain",
  language: "javascript",
  filename: "worker.js",
  docsUrl: "https://developers.cloudflare.com/workers/get-started/guide/",
  available: true,
  instructions: [
    "Create a new Worker in your Cloudflare dashboard",
    "Paste this code and update YOUR_DOMAIN with your actual domain",
    "Add GEO_TRACKER_API_KEY environment variable with your API key",
    "Add a route to trigger the Worker on your domain (e.g., example.com/*)",
  ],
  code: `// Geo Tracker - Cloudflare Worker for AI Bot Detection & Human Traffic
// Deploy this as a Cloudflare Worker and add it to your website routes

export default {
  async fetch(request, env, ctx) {
    // Pass through to origin
    const response = await fetch(request);

    const userAgent = request.headers.get("user-agent") || "";
    const url = new URL(request.url);

    // AI Bot patterns
    const botPatterns = [
      { pattern: /GPTBot/i, name: "GPTBot", category: "ai_crawler" },
      { pattern: /ClaudeBot/i, name: "ClaudeBot", category: "ai_crawler" },
      { pattern: /PerplexityBot/i, name: "PerplexityBot", category: "ai_crawler" },
      { pattern: /Googlebot-Extended/i, name: "Googlebot-Extended", category: "ai_crawler" },
      { pattern: /ChatGPT-User/i, name: "ChatGPT-User", category: "ai_crawler" },
      { pattern: /anthropic-ai/i, name: "Anthropic", category: "ai_crawler" },
      { pattern: /cohere-ai/i, name: "Cohere", category: "ai_crawler" },
      { pattern: /Bytespider/i, name: "Bytespider", category: "ai_crawler" },
      { pattern: /CCBot/i, name: "CCBot", category: "ai_crawler" },
      { pattern: /Google-Extended/i, name: "Google-Extended", category: "ai_crawler" },
    ];

    // Common bot patterns to exclude from human tracking
    const commonBotPatterns = [
      /bot/i, /crawler/i, /spider/i, /scraper/i,
      /curl/i, /wget/i, /python/i, /axios/i, /node-fetch/i,
      /headless/i, /phantom/i, /selenium/i, /puppeteer/i,
    ];

    const matchedBot = botPatterns.find(b => b.pattern.test(userAgent));
    const isCommonBot = commonBotPatterns.some(p => p.test(userAgent));

    if (matchedBot) {
      // ============ AI BOT DETECTED ============
      const logData = {
        botName: matchedBot.name,
        botCategory: matchedBot.category,
        userAgent: userAgent.slice(0, 2048),
        path: url.pathname,
        method: request.method,
        timestamp: new Date().toISOString(),
        responseStatus: response.status,
        countryCode: request.cf?.country,
        country: request.cf?.countryName || request.cf?.country,
        region: request.cf?.region,
        city: request.cf?.city,
        ipAddress: request.headers.get("cf-connecting-ip"),
        headers: {
          "Accept": request.headers.get("accept"),
          "Accept-Language": request.headers.get("accept-language"),
        },
        source: "cloudflare",
      };

      ctx.waitUntil(
        fetch("https://YOUR_DOMAIN/api/v1/crawlers/log", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": env.GEO_TRACKER_API_KEY,
          },
          body: JSON.stringify(logData),
        }).catch(err => console.error("Geo Tracker bot log failed:", err))
      );
    } else if (!isCommonBot && request.method === "GET") {
      // ============ HUMAN VISITOR DETECTED ============
      // Generate a simple visitor ID from IP + User-Agent
      const visitorId = await generateVisitorId(
        request.headers.get("cf-connecting-ip") || "",
        userAgent
      );

      // Parse UTM parameters
      const utmSource = url.searchParams.get("utm_source");
      const utmMedium = url.searchParams.get("utm_medium");
      const utmCampaign = url.searchParams.get("utm_campaign");
      const utmTerm = url.searchParams.get("utm_term");
      const utmContent = url.searchParams.get("utm_content");

      const visitData = {
        visitorId,
        path: url.pathname,
        url: url.href,
        referrer: request.headers.get("referer"),
        timestamp: new Date().toISOString(),
        userAgent: userAgent.slice(0, 2048),
        countryCode: request.cf?.country,
        country: request.cf?.countryName || request.cf?.country,
        region: request.cf?.region,
        city: request.cf?.city,
        ipAddress: request.headers.get("cf-connecting-ip"),
        utmSource,
        utmMedium,
        utmCampaign,
        utmTerm,
        utmContent,
        source: "cloudflare",
      };

      ctx.waitUntil(
        fetch("https://YOUR_DOMAIN/api/v1/visits/log", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": env.GEO_TRACKER_API_KEY,
          },
          body: JSON.stringify(visitData),
        }).catch(err => console.error("Geo Tracker visit log failed:", err))
      );
    }

    return response;
  }
};

// Generate a hashed visitor ID for privacy
async function generateVisitorId(ip, userAgent) {
  const data = ip + userAgent + new Date().toDateString();
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(data));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
}`,
};
