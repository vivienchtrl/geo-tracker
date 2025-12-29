import type { IntegrationSnippet } from "../types";

export const WORDPRESS_SNIPPET: IntegrationSnippet = {
  id: "wordpress",
  name: "WordPress Plugin",
  description: "Install our official plugin from your WordPress admin",
  language: "php",
  filename: "geo-tracker.php",
  docsUrl: "https://geo-tracker.com/integrations/wordpress",
  available: true,
  isPlugin: true,
  downloadUrl: "/api/integrations/wordpress/download",
  instructions: [
    "Download the Geo Tracker plugin (.zip file)",
    "Go to your WordPress Admin > Plugins > Add New > Upload Plugin",
    "Upload the .zip file and click 'Install Now'",
    "Activate the plugin",
    "Go to Settings > Geo Tracker and enter your API key",
    "Click 'Test Connection' to verify, then save",
  ],
  code: `// This is a preview of the plugin's main detection logic.
// Download the full plugin for the complete installation.

/**
 * Geo Tracker - AI Bot Detection & Human Traffic for WordPress
 *
 * Features:
 * - Automatic detection of 15+ AI crawlers
 * - Human visitor tracking (non-bot traffic)
 * - Settings page in WP Admin (Settings > Geo Tracker)
 * - Non-blocking API calls (no performance impact)
 * - Works with Cloudflare and other CDNs
 * - Privacy-compliant (IP hashing)
 *
 * Detected Bots:
 * - OpenAI: GPTBot, ChatGPT-User, OAI-SearchBot
 * - Anthropic: ClaudeBot, Claude-Web
 * - Google: Googlebot-Extended, Google-Extended
 * - Perplexity: PerplexityBot
 * - Meta: FacebookBot, Meta-ExternalAgent
 * - ByteDance: Bytespider
 * - Common Crawl: CCBot
 * - Amazon: Amazonbot
 * - Apple: Applebot-Extended
 * - And more...
 */

// Detection runs on every frontend request
add_action('init', function() {
    $api_key = get_option('geo_tracker_api_key', '');
    if (empty($api_key)) return;

    $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? '';

    // AI Bot patterns
    $bot_patterns = [
        '/GPTBot/i'           => ['name' => 'GPTBot', 'company' => 'OpenAI'],
        '/ClaudeBot/i'        => ['name' => 'ClaudeBot', 'company' => 'Anthropic'],
        '/PerplexityBot/i'    => ['name' => 'PerplexityBot', 'company' => 'Perplexity'],
        '/Googlebot-Extended/i' => ['name' => 'Googlebot-Extended', 'company' => 'Google'],
        // ... 10+ more patterns
    ];

    // Common bot patterns (to exclude from human tracking)
    $common_bots = '/bot|crawler|spider|scraper|curl|wget|python/i';

    $is_ai_bot = false;
    $bot_name = '';

    foreach ($bot_patterns as $pattern => $bot) {
        if (preg_match($pattern, $user_agent)) {
            $is_ai_bot = true;
            $bot_name = $bot['name'];
            break;
        }
    }

    if ($is_ai_bot) {
        // ============ AI BOT DETECTED ============
        wp_remote_post('https://geo-tracker.com/api/v1/crawlers/log', [
            'blocking' => false,
            'headers'  => ['X-API-Key' => $api_key],
            'body'     => json_encode([
                'botName'   => $bot_name,
                'path'      => $_SERVER['REQUEST_URI'],
                'userAgent' => substr($user_agent, 0, 2048),
                'timestamp' => gmdate('c'),
                'ipAddress' => $_SERVER['REMOTE_ADDR'],
                'source'    => 'wordpress',
            ]),
        ]);
    } elseif (!preg_match($common_bots, $user_agent) && $_SERVER['REQUEST_METHOD'] === 'GET') {
        // ============ HUMAN VISITOR DETECTED ============
        $visitor_id = hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . $user_agent . date('Y-m-d'));

        wp_remote_post('https://geo-tracker.com/api/v1/visits/log', [
            'blocking' => false,
            'headers'  => ['X-API-Key' => $api_key],
            'body'     => json_encode([
                'visitorId' => substr($visitor_id, 0, 32),
                'path'      => $_SERVER['REQUEST_URI'],
                'url'       => home_url($_SERVER['REQUEST_URI']),
                'referrer'  => $_SERVER['HTTP_REFERER'] ?? null,
                'userAgent' => substr($user_agent, 0, 2048),
                'timestamp' => gmdate('c'),
                'ipAddress' => $_SERVER['REMOTE_ADDR'],
                'utmSource' => $_GET['utm_source'] ?? null,
                'utmMedium' => $_GET['utm_medium'] ?? null,
                'utmCampaign' => $_GET['utm_campaign'] ?? null,
                'source'    => 'wordpress',
            ]),
        ]);
    }
}, 1);`,
};
