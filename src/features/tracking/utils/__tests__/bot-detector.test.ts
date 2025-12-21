/**
 * Bot Detection Tests
 * 
 * Tests pour vérifier que tous les bots IA sont correctement détectés
 */

import {
  detectBot,
  isBot,
  isBotType,
  isAICrawler,
  isSearchEngine,
  isKnownAIProvider,
  getBotInfo,
} from "../bot-detector";

describe("Bot Detector", () => {
  describe("OpenAI GPT Family", () => {
    it("should detect GPTBot/1.0 (official)", () => {
      const result = detectBot("Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)");
      expect(result.botType).toBe("gpt");
      expect(result.botName).toBe("OpenAI GPT Bot");
      expect(result.category).toBe("ai_crawler");
      expect(result.confidence).toBe("high");
      expect(isBot(result.userAgentPattern || "")).toBe(true);
    });

    it("should detect ChatGPT-User (browser)", () => {
      const ua = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 ChatGPT-User";
      const result = detectBot(ua);
      expect(result.botType).toBe("gpt");
      expect(result.botName).toBe("ChatGPT Browser");
      expect(result.category).toBe("browser_bot");
    });
  });

  describe("Anthropic Claude Family", () => {
    it("should detect Claude-Web (browsing feature)", () => {
      const ua = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Claude-Web";
      const result = detectBot(ua);
      expect(result.botType).toBe("claude");
      expect(result.botName).toBe("Claude Web");
      expect(result.category).toBe("browser_bot");
      expect(result.confidence).toBe("high");
    });

    it("should detect Claude-Bot", () => {
      const ua = "Mozilla/5.0 (compatible; Claude-Bot/1.0)";
      const result = detectBot(ua);
      expect(result.botType).toBe("claude");
      expect(result.category).toBe("ai_crawler");
    });

    it("should detect AnthropicBot", () => {
      const ua = "Mozilla/5.0 (compatible; AnthropicBot/1.0)";
      const result = detectBot(ua);
      expect(result.botType).toBe("claude");
    });
  });

  describe("Perplexity", () => {
    it("should detect PerplexityBot/0.x", () => {
      const ua = "Mozilla/5.0 (compatible; PerplexityBot/0.0.0; +https://www.perplexity.ai)";
      const result = detectBot(ua);
      expect(result.botType).toBe("perplexity");
      expect(result.botName).toBe("Perplexity Bot");
      expect(result.confidence).toBe("high");
    });

    it("should detect pplx-bot", () => {
      const ua = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 pplx-bot";
      const result = detectBot(ua);
      expect(result.botType).toBe("perplexity");
    });
  });

  describe("Google Family", () => {
    it("should detect Googlebot-Extended (AI crawler)", () => {
      const ua = "Mozilla/5.0 (compatible; Googlebot-Extended; +http://www.google.com/bot.html)";
      const result = detectBot(ua);
      expect(result.botType).toBe("google");
      expect(result.botName).toBe("Googlebot Extended");
      expect(result.category).toBe("ai_crawler");
    });

    it("should detect regular Googlebot (search engine)", () => {
      const ua = "Mozilla/5.0 (compatible; Googlebot/2.1)";
      const result = detectBot(ua);
      expect(result.botType).toBe("google");
      expect(result.category).toBe("search_engine");
    });

    it("should detect Gemini", () => {
      const ua = "Mozilla/5.0 (compatible; Google-Gemini/1.0)";
      const result = detectBot(ua);
      expect(result.botType).toBe("gemini");
    });
  });

  describe("Microsoft Copilot", () => {
    it("should detect Copilot", () => {
      const ua = "Mozilla/5.0 (compatible; Microsoft-Copilot/1.0)";
      const result = detectBot(ua);
      expect(result.botType).toBe("copilot");
      expect(result.botName).toBe("Microsoft Copilot");
    });

    it("should detect BingBot", () => {
      const ua = "Mozilla/5.0 (compatible; bingbot/2.0)";
      const result = detectBot(ua);
      expect(result.botType).toBe("bing");
      expect(result.category).toBe("search_engine");
    });
  });

  describe("Apple", () => {
    it("should detect AppleBot", () => {
      const ua = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleBot";
      const result = detectBot(ua);
      expect(result.botType).toBe("apple");
      expect(result.category).toBe("ai_crawler");
    });
  });

  describe("Social Crawlers", () => {
    it("should detect Facebook Bot", () => {
      const ua = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 facebookexternalhit";
      const result = detectBot(ua);
      expect(result.botType).toBe("facebook");
      expect(result.category).toBe("social_crawler");
    });

    it("should detect Twitter Bot", () => {
      const ua = "Twitterbot/1.0";
      const result = detectBot(ua);
      expect(result.botType).toBe("twitter");
    });

    it("should detect Instagram Bot", () => {
      const ua = "Mozilla/5.0 InstagramBot";
      const result = detectBot(ua);
      expect(result.botType).toBe("instagram");
    });

    it("should detect ByteDance Bot", () => {
      const ua = "Mozilla/5.0 BytespiderBot/1.0";
      const result = detectBot(ua);
      expect(result.botType).toBe("bytedance");
    });
  });

  describe("Utility Functions", () => {
    it("isKnownAIProvider should identify AI providers", () => {
      expect(isKnownAIProvider("Mozilla/5.0 (compatible; GPTBot/1.0)")).toBe(true);
      expect(isKnownAIProvider("Mozilla/5.0 (compatible; Claude-Web)")).toBe(true);
      expect(isKnownAIProvider("Mozilla/5.0 (compatible; PerplexityBot/0.0)")).toBe(true);
      expect(isKnownAIProvider("Mozilla/5.0 (compatible; Googlebot/2.1)")).toBe(true);
      expect(isKnownAIProvider("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0")).toBe(false);
    });

    it("isAICrawler should identify AI crawlers", () => {
      expect(isAICrawler("Mozilla/5.0 (compatible; GPTBot/1.0)")).toBe(true);
      expect(isAICrawler("Mozilla/5.0 (compatible; Claude-Web)")).toBe(true);
      expect(isAICrawler("Mozilla/5.0 (compatible; Googlebot/2.1)")).toBe(false);
    });

    it("isSearchEngine should identify search engines", () => {
      expect(isSearchEngine("Mozilla/5.0 (compatible; Googlebot/2.1)")).toBe(true);
      expect(isSearchEngine("Mozilla/5.0 (compatible; bingbot/2.0)")).toBe(true);
      expect(isSearchEngine("Mozilla/5.0 (compatible; GPTBot/1.0)")).toBe(false);
    });

    it("getBotInfo should return comprehensive info", () => {
      const info = getBotInfo("Mozilla/5.0 (compatible; GPTBot/1.0)");
      expect(info.botType).toBe("gpt");
      expect(info.isAIProvider).toBe(true);
      expect(info.timestamp).toBeDefined();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty User-Agent", () => {
      const result = detectBot("");
      expect(result.botType).toBeNull();
      expect(result.confidence).toBe("low");
    });

    it("should handle whitespace-only User-Agent", () => {
      const result = detectBot("   ");
      expect(result.botType).toBeNull();
    });

    it("should handle unknown User-Agent as human", () => {
      const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/91.0.4472.124 Safari/537.36";
      const result = detectBot(ua);
      expect(result.botType).toBeNull();
      expect(isBot(ua)).toBe(false);
    });

    it("should catch generic bot keywords with low confidence", () => {
      const ua = "Python-Requests/2.28.0";
      const result = detectBot(ua);
      expect(result.botType).toBe("other");
      expect(result.confidence).toBe("low");
    });
  });

  describe("Pattern Matching Order", () => {
    it("should prefer specific patterns over generic ones", () => {
      // GPTBot should match before generic 'bot' pattern
      const result = detectBot("Mozilla/5.0 (compatible; GPTBot/1.0)");
      expect(result.botName).toBe("OpenAI GPT Bot");
      expect(result.confidence).toBe("high");
    });

    it("should match first pattern in order", () => {
      const ua = "Mozilla/5.0 (compatible; GPTBot/1.0) and Claude-Web";
      const result = detectBot(ua);
      // Should match GPTBot first (appears earlier in pattern list)
      expect(result.botType).toBe("gpt");
    });
  });
});

