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

    // AI Bot patterns with company and visitType
    // visitType: "crawler" = indexing/training, "user_mention" = user asked AI to read site, "search" = search indexing
    const botPatterns = [
      // ============ OpenAI (ChatGPT) ============
      { pattern: /GPTBot/i, name: "GPTBot", category: "ai_crawler", company: "OpenAI", visitType: "crawler" },
      { pattern: /ChatGPT-User/i, name: "ChatGPT-User", category: "ai_crawler", company: "OpenAI", visitType: "user_mention" },
      { pattern: /OAI-SearchBot/i, name: "OAI-SearchBot", category: "ai_crawler", company: "OpenAI", visitType: "search" },

      // ============ Anthropic (Claude) ============
      { pattern: /ClaudeBot/i, name: "ClaudeBot", category: "ai_crawler", company: "Anthropic", visitType: "crawler" },
      { pattern: /Claude-Web/i, name: "Claude-Web", category: "ai_crawler", company: "Anthropic", visitType: "user_mention" },
      { pattern: /anthropic-ai/i, name: "Anthropic-AI", category: "ai_crawler", company: "Anthropic", visitType: "crawler" },

      // ============ Perplexity ============
      { pattern: /PerplexityBot/i, name: "PerplexityBot", category: "ai_crawler", company: "Perplexity", visitType: "crawler" },
      { pattern: /Perplexity-User/i, name: "Perplexity-User", category: "ai_crawler", company: "Perplexity", visitType: "user_mention" },

      // ============ Google ============
      { pattern: /Google-Extended/i, name: "Google-Extended", category: "ai_crawler", company: "Google", visitType: "crawler" },
      { pattern: /Googlebot-Extended/i, name: "Googlebot-Extended", category: "ai_crawler", company: "Google", visitType: "crawler" },
      { pattern: /GoogleOther/i, name: "GoogleOther", category: "ai_crawler", company: "Google", visitType: "crawler" },
      { pattern: /GoogleOther-Image/i, name: "GoogleOther-Image", category: "ai_crawler", company: "Google", visitType: "crawler" },
      { pattern: /GoogleOther-Video/i, name: "GoogleOther-Video", category: "ai_crawler", company: "Google", visitType: "crawler" },
      { pattern: /Storebot-Google/i, name: "Storebot-Google", category: "ai_crawler", company: "Google", visitType: "crawler" },
      { pattern: /Google-InspectionTool/i, name: "Google-InspectionTool", category: "ai_crawler", company: "Google", visitType: "crawler" },

      // ============ Microsoft/Bing ============
      { pattern: /Bingbot/i, name: "Bingbot", category: "search_engine", company: "Microsoft", visitType: "search" },

      // ============ Cohere ============
      { pattern: /cohere-ai/i, name: "Cohere-AI", category: "ai_crawler", company: "Cohere", visitType: "crawler" },
      { pattern: /cohere-training-data-crawler/i, name: "Cohere-Training", category: "ai_crawler", company: "Cohere", visitType: "crawler" },

      // ============ Meta ============
      { pattern: /meta-externalagent/i, name: "Meta-ExternalAgent", category: "ai_crawler", company: "Meta", visitType: "crawler" },
      { pattern: /meta-externalfetcher/i, name: "Meta-ExternalFetcher", category: "ai_crawler", company: "Meta", visitType: "crawler" },
      { pattern: /FacebookBot/i, name: "FacebookBot", category: "social_crawler", company: "Meta", visitType: "crawler" },
      { pattern: /facebookexternalhit/i, name: "Facebook-ExternalHit", category: "social_crawler", company: "Meta", visitType: "crawler" },

      // ============ Apple ============
      { pattern: /Applebot/i, name: "Applebot", category: "ai_crawler", company: "Apple", visitType: "crawler" },
      { pattern: /Applebot-Extended/i, name: "Applebot-Extended", category: "ai_crawler", company: "Apple", visitType: "crawler" },

      // ============ Amazon ============
      { pattern: /Amazonbot/i, name: "Amazonbot", category: "ai_crawler", company: "Amazon", visitType: "crawler" },

      // ============ ByteDance (TikTok) ============
      { pattern: /Bytespider/i, name: "Bytespider", category: "ai_crawler", company: "ByteDance", visitType: "crawler" },

      // ============ Common Crawl ============
      { pattern: /CCBot/i, name: "CCBot", category: "ai_crawler", company: "Common Crawl", visitType: "crawler" },

      // ============ AI Search Engines ============
      { pattern: /YouBot/i, name: "YouBot", category: "ai_crawler", company: "You.com", visitType: "search" },
      { pattern: /AI2Bot/i, name: "AI2Bot", category: "ai_crawler", company: "AI2", visitType: "crawler" },
      { pattern: /Diffbot/i, name: "Diffbot", category: "ai_crawler", company: "Diffbot", visitType: "crawler" },

      // ============ Other AI Crawlers ============
      { pattern: /Omgilibot/i, name: "Omgilibot", category: "ai_crawler", company: "Omgili", visitType: "crawler" },
      { pattern: /Omgili/i, name: "Omgili", category: "ai_crawler", company: "Omgili", visitType: "crawler" },
      { pattern: /Webzio-Extended/i, name: "Webzio-Extended", category: "ai_crawler", company: "Webz.io", visitType: "crawler" },
      { pattern: /img2dataset/i, name: "img2dataset", category: "ai_crawler", company: "LAION", visitType: "crawler" },
      { pattern: /Scrapy/i, name: "Scrapy", category: "ai_crawler", company: "Scrapy", visitType: "crawler" },
      { pattern: /Kangaroo Bot/i, name: "Kangaroo Bot", category: "ai_crawler", company: "Kangaroo", visitType: "crawler" },
      { pattern: /Timpibot/i, name: "Timpibot", category: "ai_crawler", company: "Timpi", visitType: "crawler" },
      { pattern: /VelenPublicWebCrawler/i, name: "VelenPublicWebCrawler", category: "ai_crawler", company: "Velen", visitType: "crawler" },
      { pattern: /Velenpublicwebcrawler/i, name: "VelenCrawler", category: "ai_crawler", company: "Velen", visitType: "crawler" },
      { pattern: /PanguBot/i, name: "PanguBot", category: "ai_crawler", company: "Pangu", visitType: "crawler" },
      { pattern: /ISSCyberRiskCrawler/i, name: "ISSCyberRiskCrawler", category: "ai_crawler", company: "ISS", visitType: "crawler" },
      { pattern: /Sidetrade indexer bot/i, name: "Sidetrade", category: "ai_crawler", company: "Sidetrade", visitType: "crawler" },
      { pattern: /ICC-Crawler/i, name: "ICC-Crawler", category: "ai_crawler", company: "ICC", visitType: "crawler" },
      { pattern: /Nicecrawler/i, name: "Nicecrawler", category: "ai_crawler", company: "Nice", visitType: "crawler" },
      { pattern: /FriendlyCrawler/i, name: "FriendlyCrawler", category: "ai_crawler", company: "Friendly", visitType: "crawler" },
      { pattern: /Crawlson/i, name: "Crawlson", category: "ai_crawler", company: "Crawlson", visitType: "crawler" },
      { pattern: /PetalBot/i, name: "PetalBot", category: "ai_crawler", company: "Huawei", visitType: "crawler" },
      { pattern: /sentibot/i, name: "Sentibot", category: "ai_crawler", company: "Sentibot", visitType: "crawler" },
      { pattern: /Iframely/i, name: "Iframely", category: "ai_crawler", company: "Iframely", visitType: "crawler" },

      // ============ Brightdata/Luminati ============
      { pattern: /BrightData/i, name: "BrightData", category: "ai_crawler", company: "Bright Data", visitType: "crawler" },
      { pattern: /Brightbot/i, name: "Brightbot", category: "ai_crawler", company: "Bright Data", visitType: "crawler" },

      // ============ Additional Social Crawlers ============
      { pattern: /Twitterbot/i, name: "Twitterbot", category: "social_crawler", company: "X/Twitter", visitType: "crawler" },
      { pattern: /LinkedInBot/i, name: "LinkedInBot", category: "social_crawler", company: "LinkedIn", visitType: "crawler" },

      // ============ Traditional Search Engines ============
      { pattern: /Googlebot(?!-Extended)/i, name: "Googlebot", category: "search_engine", company: "Google", visitType: "search" },
      { pattern: /DuckDuckBot/i, name: "DuckDuckBot", category: "search_engine", company: "DuckDuckGo", visitType: "search" },
      { pattern: /YandexBot/i, name: "YandexBot", category: "search_engine", company: "Yandex", visitType: "search" },
      { pattern: /Baiduspider/i, name: "Baiduspider", category: "search_engine", company: "Baidu", visitType: "search" },
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
        botCompany: matchedBot.company,
        visitType: matchedBot.visitType,
        siteMentioned: matchedBot.visitType === "user_mention",
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
          "Accept": request.headers.get("accept") || null,
          "Accept-Language": request.headers.get("accept-language") || null,
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
