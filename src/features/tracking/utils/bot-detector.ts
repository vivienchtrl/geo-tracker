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
  | "other"
  | null;

export interface BotDetectionResult {
  botType: BotType;
  botName: string | null;
  category: "ai_crawler" | "search_engine" | "social_crawler" | "monitoring" | null;
  confidence: "high" | "medium" | "low";
  userAgentPattern?: string; // Matched pattern source
}

interface BotPattern {
  pattern: RegExp;
  botType: BotType;
  botName: string;
  category: "ai_crawler" | "search_engine" | "social_crawler" | "monitoring" | "other";
  confidence: "high" | "medium" | "low";
}

/**
 * Comprehensive bot detection patterns
 * Ordered by specificity (most specific first) for accuracy
 */
const BOT_PATTERNS: BotPattern[] = [
  // === AI Crawlers (High Priority) ===
  {
    pattern: /GPTBot|ChatGPT-User/i,
    botType: "gpt",
    botName: "OpenAI GPT Bot",
    category: "ai_crawler",
    confidence: "high",
  },
  {
    pattern: /Claude-Web|Claude-Bot|anthropic/i,
    botType: "claude",
    botName: "Anthropic Claude",
    category: "ai_crawler",
    confidence: "high",
  },
  {
    pattern: /PerplexityBot|pplx-bot|perplexity/i,
    botType: "perplexity",
    botName: "Perplexity AI",
    category: "ai_crawler",
    confidence: "high",
  },
  {
    pattern: /AppleBot|AppleWebKit.*\(KHTML.*Version/i,
    botType: "apple",
    botName: "Apple Web Crawler",
    category: "ai_crawler",
    confidence: "medium",
  },

  // === Search Engines ===
  {
    pattern: /Googlebot|Google-Extended|Bingbot|Slurp/i,
    botType: "google",
    botName: "Googlebot",
    category: "search_engine",
    confidence: "high",
  },
  {
    pattern: /bingbot|msnbot/i,
    botType: "bing",
    botName: "BingBot",
    category: "search_engine",
    confidence: "high",
  },

  // === Other Crawlers ===
  {
    pattern: /AmazonBot|kendra\.crawler|AWS/i,
    botType: "amazon",
    botName: "Amazon Crawler",
    category: "monitoring",
    confidence: "high",
  },
  {
    pattern: /Bytedance|BytespiderBot|douyinBot|toutiaoBot/i,
    botType: "bytedance",
    botName: "ByteDance Bot",
    category: "social_crawler",
    confidence: "high",
  },
  {
    pattern: /CCBot|CommonCrawl/i,
    botType: "commoncrawl",
    botName: "Common Crawl",
    category: "monitoring",
    confidence: "high",
  },
  {
    pattern: /facebookexternalhit|facebookcatalog/i,
    botType: "facebook",
    botName: "Facebook Bot",
    category: "social_crawler",
    confidence: "high",
  },

  // === Generic bot indicators (Low specificity, fallback) ===
  {
    pattern: /(bot|crawler|spider|wget|curl|scrapy|libcurl|urllib|request|http|java|python)/i,
    botType: "other",
    botName: "Unknown Bot",
    category: "other",
    confidence: "low",
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
        category: detector.category as "ai_crawler" | "search_engine" | "social_crawler" | "monitoring" | null,
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

