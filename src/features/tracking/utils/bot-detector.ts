/**
 * Bot Detection Utility
 *
 * Purpose: Identify and classify bots from User-Agent strings
 * Strategy: Layered detection ordered by specificity for accuracy
 *
 * Security Note:
 * - Server-side validation: Client bot detection is hints only
 * - Server re-detects all bots for audit trail
 * - Pattern matching is case-insensitive
 * - Detection includes confidence level for data quality tracking
 */

export type BotType =
  | "gpt"
  | "claude"
  | "google"
  | "perplexity"
  | "bing"
  | "apple"
  | "amazon"
  | "bytedance"
  | "commoncrawl"
  | "facebook"
  | "instagram"
  | "twitter"
  | "copilot"
  | "gemini"
  | "other"
  | null;

export interface BotDetectionResult {
  botType: BotType;
  botName: string | null;
  category: "ai_crawler" | "search_engine" | "social_crawler" | "monitoring" | "browser_bot" | null;
  confidence: "high" | "medium" | "low";
  userAgentPattern?: string; // Matched pattern source
}

interface BotPattern {
  pattern: RegExp;
  botType: BotType;
  botName: string;
  category: "ai_crawler" | "search_engine" | "social_crawler" | "monitoring" | "browser_bot" | "other";
  confidence: "high" | "medium" | "low";
  description?: string; // For debugging
}

/**
 * Comprehensive bot detection patterns
 * Ordered by specificity (most specific first) for accuracy
 * 
 * Sources:
 * - https://openai.com/robots.txt (GPTBot)
 * - https://www.anthropic.com/claude-crawler-user-agent (Claude)
 * - https://www.perplexity.ai/help/crawler (PerplexityBot)
 * - Real production User-Agents from logs
 */
const BOT_PATTERNS: BotPattern[] = [
  // === OPENAI / GPT FAMILY ===
  {
    pattern: /GPTBot\/1\.0/i,
    botType: "gpt",
    botName: "OpenAI GPT Bot",
    category: "ai_crawler",
    confidence: "high",
    description: "Official OpenAI GPT crawler",
  },
  {
    pattern: /GPTBot|OpenAI-Gpt/i,
    botType: "gpt",
    botName: "OpenAI GPT",
    category: "ai_crawler",
    confidence: "high",
  },
  {
    pattern: /ChatGPT-User/i,
    botType: "gpt",
    botName: "ChatGPT Browser",
    category: "browser_bot",
    confidence: "high",
    description: "ChatGPT Web Browser / Claude for Web with GPT integration",
  },

  // === ANTHROPIC / CLAUDE FAMILY ===
  {
    pattern: /Claude-Web/i,
    botType: "claude",
    botName: "Claude Web",
    category: "browser_bot",
    confidence: "high",
    description: "Anthropic Claude Web browsing feature",
  },
  {
    pattern: /Claude-Bot|Claude\/\d+\.\d+/i,
    botType: "claude",
    botName: "Claude Bot",
    category: "ai_crawler",
    confidence: "high",
  },
  {
    pattern: /anthropic-ai|AnthropicBot|ClaudeBot/i,
    botType: "claude",
    botName: "Anthropic Claude",
    category: "ai_crawler",
    confidence: "high",
  },

  // === PERPLEXITY ===
  {
    pattern: /PerplexityBot\/0\.\d+|pplx-bot/i,
    botType: "perplexity",
    botName: "Perplexity Bot",
    category: "ai_crawler",
    confidence: "high",
    description: "Perplexity.ai official crawler",
  },
  {
    pattern: /PerplexityBot|Perplexity/i,
    botType: "perplexity",
    botName: "Perplexity AI",
    category: "ai_crawler",
    confidence: "high",
  },

  // === GOOGLE FAMILY ===
  {
    pattern: /Googlebot-Extended/i,
    botType: "google",
    botName: "Googlebot Extended",
    category: "ai_crawler",
    confidence: "high",
    description: "Google's AI-powered crawler (for SGE, Gemini)",
  },
  {
    pattern: /Googlebot|Google-Tagmanager|GoogleKeywordPlanner/i,
    botType: "google",
    botName: "Googlebot",
    category: "search_engine",
    confidence: "high",
  },

  // === MICROSOFT / COPILOT ===
  {
    pattern: /Copilot|Microsoft-Copilot/i,
    botType: "copilot",
    botName: "Microsoft Copilot",
    category: "ai_crawler",
    confidence: "high",
  },
  {
    pattern: /bingbot|msnbot|BingPreview/i,
    botType: "bing",
    botName: "BingBot",
    category: "search_engine",
    confidence: "high",
  },

  // === GOOGLE GEMINI ===
  {
    pattern: /gemini|Google-Gemini/i,
    botType: "gemini",
    botName: "Google Gemini",
    category: "ai_crawler",
    confidence: "high",
  },

  // === APPLE ===
  {
    pattern: /AppleBot|AppleWebKit.*\(KHTML.*Version.*Safari/i,
    botType: "apple",
    botName: "Apple Web Crawler",
    category: "ai_crawler",
    confidence: "medium",
    description: "Apple's crawler for Spotlight, Siri, and Apple Intelligence",
  },

  // === AMAZON ===
  {
    pattern: /AmazonBot|kendra\.crawler|AWSBot/i,
    botType: "amazon",
    botName: "Amazon Crawler",
    category: "monitoring",
    confidence: "high",
  },

  // === BYTEDANCE (TikTok, Douyin) ===
  {
    pattern: /Bytedance|BytespiderBot|DouyinBot|ToutiaoBot/i,
    botType: "bytedance",
    botName: "ByteDance Bot",
    category: "social_crawler",
    confidence: "high",
  },

  // === FACEBOOK / META ===
  {
    pattern: /facebookexternalhit|facebookcatalog|OGScraper|FacebookBot/i,
    botType: "facebook",
    botName: "Facebook Bot",
    category: "social_crawler",
    confidence: "high",
  },

  // === INSTAGRAM ===
  {
    pattern: /InstagramBot|IGramsBot/i,
    botType: "instagram",
    botName: "Instagram Bot",
    category: "social_crawler",
    confidence: "high",
  },

  // === TWITTER / X ===
  {
    pattern: /Twitterbot|TwitterBot|x-bot/i,
    botType: "twitter",
    botName: "Twitter Bot",
    category: "social_crawler",
    confidence: "high",
  },

  // === COMMON CRAWL ===
  {
    pattern: /CCBot|CommonCrawl/i,
    botType: "commoncrawl",
    botName: "Common Crawl",
    category: "monitoring",
    confidence: "high",
  },

  // === GENERIC BOT INDICATORS (Low specificity, fallback) ===
  {
    pattern: /(bot|crawler|spider|scraper|wget|curl|scrapy|libcurl|urllib|request|httpx|python|java|go-http-client)(?:\s|\/|$)/i,
    botType: "other",
    botName: "Generic Bot",
    category: "other",
    confidence: "low",
    description: "Matches common bot keywords in User-Agent",
  },
];

/**
 * Detect bot from User-Agent string
 *
 * @param userAgent - Browser's User-Agent string
 * @returns Detection result with bot type, name, category, and confidence
 *
 * Algorithm:
 * 1. Iterate through patterns in order (most specific first)
 * 2. Return on first match (specificity ensures accuracy)
 * 3. Return null if no patterns match
 *
 * Performance: O(n) where n = number of patterns (~50)
 * Optimization: Could use trie for scale, but not needed at current volume
 */
export function detectBot(userAgent: string): BotDetectionResult {
  if (!userAgent || userAgent.trim() === "") {
    return {
      botType: null,
      botName: null,
      category: null,
      confidence: "low",
    };
  }

  // Iterate through patterns in order (most specific first)
  for (const detector of BOT_PATTERNS) {
    if (detector.pattern.test(userAgent)) {
      return {
        botType: detector.botType,
        botName: detector.botName,
        category: detector.category as "ai_crawler" | "search_engine" | "social_crawler" | "monitoring" | "browser_bot" | null,
        confidence: detector.confidence,
        userAgentPattern: detector.pattern.source,
      };
    }
  }

  // No match found
  return {
    botType: null,
    botName: null,
    category: null,
    confidence: "low",
  };
}

/**
 * Check if User-Agent is a bot (any type)
 *
 * @param userAgent - Browser's User-Agent string
 * @returns true if bot detected
 */
export function isBot(userAgent: string): boolean {
  return detectBot(userAgent).botType !== null;
}

/**
 * Check if User-Agent matches specific bot type
 *
 * @param userAgent - Browser's User-Agent string
 * @param type - Bot type to check
 * @returns true if User-Agent matches the specified bot type
 */
export function isBotType(userAgent: string, type: BotType): boolean {
  return detectBot(userAgent).botType === type;
}

/**
 * Get all AI crawlers (not search engines)
 * Useful for filtering in dashboard
 */
export function isAICrawler(userAgent: string): boolean {
  const result = detectBot(userAgent);
  return result.category === "ai_crawler";
}

/**
 * Get all search engines
 */
export function isSearchEngine(userAgent: string): boolean {
  const result = detectBot(userAgent);
  return result.category === "search_engine";
}

/**
 * Check if bot is a known AI provider (high priority)
 * Includes: OpenAI, Anthropic, Perplexity, Google, Microsoft, Apple
 */
export function isKnownAIProvider(userAgent: string): boolean {
  const result = detectBot(userAgent);
  return [
    "gpt",
    "claude",
    "perplexity",
    "google",
    "copilot",
    "gemini",
    "apple",
    "bing",
  ].includes(result.botType as string);
}

/**
 * Get detailed bot information for logging
 */
export function getBotInfo(userAgent: string) {
  const result = detectBot(userAgent);
  const isAI = isKnownAIProvider(userAgent);
  
  return {
    ...result,
    isAIProvider: isAI,
    timestamp: new Date().toISOString(),
  };
}
