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
  code: `// Geo Tracker - Cloudflare Worker for AI Bot Detection
// Deploy this as a Cloudflare Worker and add it to your website routes

export default {
  async fetch(request, env, ctx) {
    // Pass through to origin
    const response = await fetch(request);

    // Detect AI bots from User-Agent
    const userAgent = request.headers.get("user-agent") || "";
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

    const matchedBot = botPatterns.find(b => b.pattern.test(userAgent));

    if (matchedBot) {
      // Prepare log data
      const logData = {
        botName: matchedBot.name,
        botCategory: matchedBot.category,
        userAgent: userAgent.slice(0, 2048),
        path: new URL(request.url).pathname,
        method: request.method,
        timestamp: new Date().toISOString(),
        responseStatus: response.status,

        // Cloudflare provides geo data
        countryCode: request.cf?.country,
        country: request.cf?.countryName || request.cf?.country,
        region: request.cf?.region,
        city: request.cf?.city,

        // IP will be hashed server-side
        ipAddress: request.headers.get("cf-connecting-ip"),

        // Selected headers
        headers: {
          "Accept": request.headers.get("accept"),
          "Accept-Language": request.headers.get("accept-language"),
        },

        source: "cloudflare",
      };

      // Send to Geo Tracker (async, don't block response)
      ctx.waitUntil(
        fetch("https://YOUR_DOMAIN/api/v1/crawlers/log", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": env.GEO_TRACKER_API_KEY, // Set in Worker env vars
          },
          body: JSON.stringify(logData),
        }).catch(err => console.error("Geo Tracker log failed:", err))
      );
    }

    return response;
  }
};`,
};
