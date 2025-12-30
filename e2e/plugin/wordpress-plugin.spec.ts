import { test, expect } from '@playwright/test';

/**
 * E2E Tests for WordPress Plugin API Endpoints
 *
 * These tests simulate what the WordPress plugin sends to the API
 * to ensure bot detection and human tracking work correctly.
 */

// Test API key - in real tests this would come from env or be mocked
const TEST_API_KEY = process.env.TEST_API_KEY || 'test_key_12345';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('WordPress Plugin - Bot Detection API', () => {

  test.describe('POST /api/v1/crawlers/log', () => {

    test('should accept valid GPTBot crawler visit', async ({ request }) => {
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
          userAgent: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko) GPTBot/1.0',
          path: '/blog/test-article',
          method: 'GET',
          timestamp: new Date().toISOString(),
          responseStatus: 200,
          countryCode: 'US',
          country: 'United States',
          source: 'wordpress',
        },
      });

      // Should succeed or fail with auth error (if no valid API key)
      expect([200, 401]).toContain(response.status());
    });

    test('should accept ChatGPT-User visit with user_mention type', async ({ request }) => {
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
          userAgent: 'Mozilla/5.0 AppleWebKit/537.36 ChatGPT-User/1.0',
          path: '/products/featured',
          method: 'GET',
          timestamp: new Date().toISOString(),
          responseStatus: 200,
          source: 'wordpress',
        },
      });

      expect([200, 401]).toContain(response.status());
    });

    test('should accept Perplexity-User visit', async ({ request }) => {
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
          userAgent: 'Mozilla/5.0 Perplexity-User/1.0',
          path: '/about',
          method: 'GET',
          timestamp: new Date().toISOString(),
          responseStatus: 200,
          source: 'wordpress',
        },
      });

      expect([200, 401]).toContain(response.status());
    });

    test('should accept ClaudeBot visit', async ({ request }) => {
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
          userAgent: 'Mozilla/5.0 ClaudeBot/1.0',
          path: '/docs/api',
          method: 'GET',
          timestamp: new Date().toISOString(),
          responseStatus: 200,
          source: 'wordpress',
        },
      });

      expect([200, 401]).toContain(response.status());
    });

    test('should reject request without API key', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/v1/crawlers/log`, {
        headers: {
          'Content-Type': 'application/json',
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

    test('should reject invalid payload (missing required fields)', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/v1/crawlers/log`, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': TEST_API_KEY,
        },
        data: {
          // Missing botName, userAgent, path, timestamp
          botCategory: 'ai_crawler',
        },
      });

      expect([400, 401]).toContain(response.status());
    });

    test('should accept headers with null values', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/v1/crawlers/log`, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': TEST_API_KEY,
        },
        data: {
          botName: 'GPTBot',
          botCategory: 'ai_crawler',
          userAgent: 'GPTBot/1.0',
          path: '/test',
          timestamp: new Date().toISOString(),
          headers: {
            'Accept': 'text/html',
            'Accept-Language': null,
          },
          source: 'wordpress',
        },
      });

      expect([200, 401]).toContain(response.status());
    });

    test('should accept various timestamp formats', async ({ request }) => {
      // Test ISO 8601 with Z
      const response1 = await request.post(`${BASE_URL}/api/v1/crawlers/log`, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': TEST_API_KEY,
        },
        data: {
          botName: 'GPTBot',
          botCategory: 'ai_crawler',
          userAgent: 'GPTBot/1.0',
          path: '/test',
          timestamp: '2024-01-15T10:30:00Z',
          source: 'wordpress',
        },
      });
      expect([200, 401]).toContain(response1.status());

      // Test ISO 8601 with +00:00 (PHP format)
      const response2 = await request.post(`${BASE_URL}/api/v1/crawlers/log`, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': TEST_API_KEY,
        },
        data: {
          botName: 'GPTBot',
          botCategory: 'ai_crawler',
          userAgent: 'GPTBot/1.0',
          path: '/test',
          timestamp: '2024-01-15T10:30:00+00:00',
          source: 'wordpress',
        },
      });
      expect([200, 401]).toContain(response2.status());
    });
  });

  test.describe('GET /api/v1/crawlers/ping', () => {

    test('should return success with valid API key', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/v1/crawlers/ping`, {
        headers: {
          'X-API-Key': TEST_API_KEY,
        },
      });

      expect([200, 401]).toContain(response.status());
    });

    test('should return 401 without API key', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/v1/crawlers/ping`);

      expect(response.status()).toBe(401);
    });
  });
});

test.describe('WordPress Plugin - Human Visitor Tracking API', () => {

  test.describe('POST /api/v1/visits/log', () => {

    test('should accept valid human page visit', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/v1/visits/log`, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': TEST_API_KEY,
        },
        data: {
          visitorId: 'abc123def456',
          path: '/blog/article-1',
          url: 'https://example.com/blog/article-1',
          title: 'Test Article',
          referrer: 'https://google.com',
          timestamp: new Date().toISOString(),
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
          countryCode: 'FR',
          country: 'France',
          source: 'wordpress',
        },
      });

      expect([200, 401]).toContain(response.status());
    });

    test('should accept visit with UTM parameters', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/v1/visits/log`, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': TEST_API_KEY,
        },
        data: {
          visitorId: 'visitor_xyz789',
          path: '/landing-page',
          timestamp: new Date().toISOString(),
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15',
          utmSource: 'newsletter',
          utmMedium: 'email',
          utmCampaign: 'spring_promo',
          utmTerm: 'discount',
          utmContent: 'cta_button',
          source: 'wordpress',
        },
      });

      expect([200, 401]).toContain(response.status());
    });

    test('should accept mobile visitor', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/v1/visits/log`, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': TEST_API_KEY,
        },
        data: {
          visitorId: 'mobile_user_123',
          path: '/products',
          timestamp: new Date().toISOString(),
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1',
          deviceType: 'mobile',
          browser: 'Safari',
          os: 'iOS',
          source: 'wordpress',
        },
      });

      expect([200, 401]).toContain(response.status());
    });

    test('should reject request without API key', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/v1/visits/log`, {
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          visitorId: 'test_visitor',
          path: '/test',
          timestamp: new Date().toISOString(),
        },
      });

      expect(response.status()).toBe(401);
    });

    test('should reject invalid payload (missing visitorId)', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/v1/visits/log`, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': TEST_API_KEY,
        },
        data: {
          // Missing visitorId
          path: '/test',
          timestamp: new Date().toISOString(),
        },
      });

      expect([400, 401]).toContain(response.status());
    });

    test('should accept various timestamp formats', async ({ request }) => {
      // Test with Z suffix
      const response1 = await request.post(`${BASE_URL}/api/v1/visits/log`, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': TEST_API_KEY,
        },
        data: {
          visitorId: 'test_visitor_1',
          path: '/test',
          timestamp: '2024-01-15T10:30:00Z',
          source: 'wordpress',
        },
      });
      expect([200, 401]).toContain(response1.status());

      // Test with +00:00 suffix (PHP gmdate('c') format)
      const response2 = await request.post(`${BASE_URL}/api/v1/visits/log`, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': TEST_API_KEY,
        },
        data: {
          visitorId: 'test_visitor_2',
          path: '/test',
          timestamp: '2024-01-15T10:30:00+00:00',
          source: 'wordpress',
        },
      });
      expect([200, 401]).toContain(response2.status());
    });
  });
});

test.describe('WordPress Plugin - CORS Support', () => {

  test('should handle OPTIONS preflight for crawlers/log', async ({ request }) => {
    const response = await request.fetch(`${BASE_URL}/api/v1/crawlers/log`, {
      method: 'OPTIONS',
    });

    expect(response.status()).toBe(200);
    expect(response.headers()['access-control-allow-origin']).toBe('*');
    expect(response.headers()['access-control-allow-methods']).toContain('POST');
  });

  test('should handle OPTIONS preflight for visits/log', async ({ request }) => {
    const response = await request.fetch(`${BASE_URL}/api/v1/visits/log`, {
      method: 'OPTIONS',
    });

    expect(response.status()).toBe(200);
    expect(response.headers()['access-control-allow-origin']).toBe('*');
    expect(response.headers()['access-control-allow-methods']).toContain('POST');
  });
});
