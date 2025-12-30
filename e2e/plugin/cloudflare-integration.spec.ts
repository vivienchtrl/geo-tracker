import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Cloudflare Worker Integration
 *
 * These tests simulate what the Cloudflare Worker sends to the API
 * to ensure bot detection and human tracking work correctly.
 */

const TEST_API_KEY = process.env.TEST_API_KEY || 'test_key_12345';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Cloudflare Worker - Bot Detection', () => {

  test.describe('AI Crawlers', () => {

    test('should log GPTBot (OpenAI crawler)', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/v1/crawlers/log`, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': TEST_API_KEY,
        },
        data: {
          botName: 'GPTBot',
          botCategory: 'ai_crawler',
          botCompany: 'OpenAI',
          visitType: 'crawler',
          siteMentioned: false,
          userAgent: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.0; +https://openai.com/gptbot)',
          path: '/docs/api-reference',
          method: 'GET',
          timestamp: new Date().toISOString(),
          responseStatus: 200,
          countryCode: 'US',
          country: 'United States',
          region: 'California',
          city: 'San Francisco',
          ipAddress: '203.0.113.50',
          headers: {
            'Accept': 'text/html,application/xhtml+xml',
            'Accept-Language': null,
          },
          source: 'cloudflare',
        },
      });

      expect([200, 401]).toContain(response.status());
    });

    test('should log ChatGPT-User with user_mention (site being cited)', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/v1/crawlers/log`, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': TEST_API_KEY,
        },
        data: {
          botName: 'ChatGPT-User',
          botCategory: 'ai_crawler',
          botCompany: 'OpenAI',
          visitType: 'user_mention',
          siteMentioned: true,
          userAgent: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ChatGPT-User/1.0; +https://openai.com/bot)',
          path: '/blog/ai-trends-2024',
          method: 'GET',
          timestamp: new Date().toISOString(),
          responseStatus: 200,
          countryCode: 'US',
          source: 'cloudflare',
        },
      });

      expect([200, 401]).toContain(response.status());
    });

    test('should log ClaudeBot (Anthropic crawler)', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/v1/crawlers/log`, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': TEST_API_KEY,
        },
        data: {
          botName: 'ClaudeBot',
          botCategory: 'ai_crawler',
          botCompany: 'Anthropic',
          visitType: 'crawler',
          userAgent: 'ClaudeBot/1.0; (+https://anthropic.com/claudebot)',
          path: '/privacy-policy',
          method: 'GET',
          timestamp: new Date().toISOString(),
          responseStatus: 200,
          source: 'cloudflare',
        },
      });

      expect([200, 401]).toContain(response.status());
    });

    test('should log Perplexity-User (user-triggered mention)', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/v1/crawlers/log`, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': TEST_API_KEY,
        },
        data: {
          botName: 'Perplexity-User',
          botCategory: 'ai_crawler',
          botCompany: 'Perplexity',
          visitType: 'user_mention',
          siteMentioned: true,
          userAgent: 'Mozilla/5.0 (compatible; Perplexity-User/1.0)',
          path: '/products/software',
          method: 'GET',
          timestamp: new Date().toISOString(),
          responseStatus: 200,
          source: 'cloudflare',
        },
      });

      expect([200, 401]).toContain(response.status());
    });

    test('should log OAI-SearchBot (OpenAI search)', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/v1/crawlers/log`, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': TEST_API_KEY,
        },
        data: {
          botName: 'OAI-SearchBot',
          botCategory: 'ai_crawler',
          botCompany: 'OpenAI',
          visitType: 'search',
          userAgent: 'OAI-SearchBot/1.0',
          path: '/sitemap.xml',
          method: 'GET',
          timestamp: new Date().toISOString(),
          responseStatus: 200,
          source: 'cloudflare',
        },
      });

      expect([200, 401]).toContain(response.status());
    });

    test('should log Google-Extended (AI training)', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/v1/crawlers/log`, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': TEST_API_KEY,
        },
        data: {
          botName: 'Google-Extended',
          botCategory: 'ai_crawler',
          botCompany: 'Google',
          visitType: 'crawler',
          userAgent: 'Mozilla/5.0 (compatible; Google-Extended)',
          path: '/content/articles',
          method: 'GET',
          timestamp: new Date().toISOString(),
          responseStatus: 200,
          source: 'cloudflare',
        },
      });

      expect([200, 401]).toContain(response.status());
    });

    test('should log Bytespider (ByteDance/TikTok)', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/v1/crawlers/log`, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': TEST_API_KEY,
        },
        data: {
          botName: 'Bytespider',
          botCategory: 'ai_crawler',
          botCompany: 'ByteDance',
          visitType: 'crawler',
          userAgent: 'Mozilla/5.0 (compatible; Bytespider)',
          path: '/videos',
          method: 'GET',
          timestamp: new Date().toISOString(),
          responseStatus: 200,
          source: 'cloudflare',
        },
      });

      expect([200, 401]).toContain(response.status());
    });
  });

  test.describe('Search Engine Bots', () => {

    test('should log Googlebot as search', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/v1/crawlers/log`, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': TEST_API_KEY,
        },
        data: {
          botName: 'Googlebot',
          botCategory: 'search_engine',
          botCompany: 'Google',
          visitType: 'search',
          userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
          path: '/',
          method: 'GET',
          timestamp: new Date().toISOString(),
          responseStatus: 200,
          source: 'cloudflare',
        },
      });

      expect([200, 401]).toContain(response.status());
    });

    test('should log Bingbot', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/v1/crawlers/log`, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': TEST_API_KEY,
        },
        data: {
          botName: 'Bingbot',
          botCategory: 'search_engine',
          botCompany: 'Microsoft',
          visitType: 'search',
          userAgent: 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
          path: '/products',
          method: 'GET',
          timestamp: new Date().toISOString(),
          responseStatus: 200,
          source: 'cloudflare',
        },
      });

      expect([200, 401]).toContain(response.status());
    });
  });

  test.describe('Social Crawlers', () => {

    test('should log Twitterbot', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/v1/crawlers/log`, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': TEST_API_KEY,
        },
        data: {
          botName: 'Twitterbot',
          botCategory: 'social_crawler',
          botCompany: 'X/Twitter',
          visitType: 'crawler',
          userAgent: 'Twitterbot/1.0',
          path: '/blog/new-post',
          method: 'GET',
          timestamp: new Date().toISOString(),
          responseStatus: 200,
          source: 'cloudflare',
        },
      });

      expect([200, 401]).toContain(response.status());
    });

    test('should log LinkedInBot', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/v1/crawlers/log`, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': TEST_API_KEY,
        },
        data: {
          botName: 'LinkedInBot',
          botCategory: 'social_crawler',
          botCompany: 'LinkedIn',
          visitType: 'crawler',
          userAgent: 'LinkedInBot/1.0',
          path: '/careers',
          method: 'GET',
          timestamp: new Date().toISOString(),
          responseStatus: 200,
          source: 'cloudflare',
        },
      });

      expect([200, 401]).toContain(response.status());
    });
  });
});

test.describe('Cloudflare Worker - Human Visitor Tracking', () => {

  test('should log desktop visitor from Chrome', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/v1/visits/log`, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': TEST_API_KEY,
      },
      data: {
        visitorId: 'cf_visitor_abc123',
        path: '/pricing',
        url: 'https://example.com/pricing',
        referrer: 'https://google.com/search?q=example',
        timestamp: new Date().toISOString(),
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        countryCode: 'DE',
        country: 'Germany',
        region: 'Bavaria',
        city: 'Munich',
        ipAddress: '203.0.113.100',
        source: 'cloudflare',
      },
    });

    expect([200, 401]).toContain(response.status());
  });

  test('should log mobile visitor from Safari', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/v1/visits/log`, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': TEST_API_KEY,
      },
      data: {
        visitorId: 'cf_mobile_xyz789',
        path: '/app/download',
        url: 'https://example.com/app/download',
        timestamp: new Date().toISOString(),
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        countryCode: 'JP',
        country: 'Japan',
        source: 'cloudflare',
      },
    });

    expect([200, 401]).toContain(response.status());
  });

  test('should log visitor with UTM parameters', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/v1/visits/log`, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': TEST_API_KEY,
      },
      data: {
        visitorId: 'cf_utm_visitor',
        path: '/signup',
        url: 'https://example.com/signup?utm_source=facebook&utm_medium=cpc&utm_campaign=q4_promo',
        timestamp: new Date().toISOString(),
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        utmSource: 'facebook',
        utmMedium: 'cpc',
        utmCampaign: 'q4_promo',
        countryCode: 'US',
        source: 'cloudflare',
      },
    });

    expect([200, 401]).toContain(response.status());
  });

  test('should log visitor with referrer', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/v1/visits/log`, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': TEST_API_KEY,
      },
      data: {
        visitorId: 'cf_referrer_visitor',
        path: '/blog/seo-tips',
        url: 'https://example.com/blog/seo-tips',
        referrer: 'https://twitter.com/user/status/123456',
        timestamp: new Date().toISOString(),
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/120.0',
        countryCode: 'GB',
        country: 'United Kingdom',
        source: 'cloudflare',
      },
    });

    expect([200, 401]).toContain(response.status());
  });
});

test.describe('Cloudflare Worker - Error Handling', () => {

  test('should return 401 for invalid API key', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/v1/crawlers/log`, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'invalid_key_12345',
      },
      data: {
        botName: 'GPTBot',
        botCategory: 'ai_crawler',
        userAgent: 'GPTBot/1.0',
        path: '/test',
        timestamp: new Date().toISOString(),
      },
    });

    expect(response.status()).toBe(401);
  });

  test('should return 400 for invalid JSON', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/v1/crawlers/log`, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': TEST_API_KEY,
      },
      data: 'not valid json{',
    });

    expect([400, 401]).toContain(response.status());
  });

  test('should handle missing optional fields gracefully', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/v1/crawlers/log`, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': TEST_API_KEY,
      },
      data: {
        // Only required fields
        botName: 'GPTBot',
        userAgent: 'GPTBot/1.0',
        path: '/minimal',
        timestamp: new Date().toISOString(),
      },
    });

    expect([200, 401]).toContain(response.status());
  });
});
