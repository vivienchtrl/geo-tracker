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
 * Geo Tracker - AI Bot Detection for WordPress
 *
 * Features:
 * - Automatic detection of 15+ AI crawlers
 * - Settings page in WP Admin (Settings > Geo Tracker)
 * - Non-blocking API calls (no performance impact)
 * - Works with Cloudflare and other CDNs
 * - Connection testing built-in
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
    $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? '';

    $bot_patterns = [
        '/GPTBot/i'           => ['name' => 'GPTBot', 'company' => 'OpenAI'],
        '/ClaudeBot/i'        => ['name' => 'ClaudeBot', 'company' => 'Anthropic'],
        '/PerplexityBot/i'    => ['name' => 'PerplexityBot', 'company' => 'Perplexity'],
        '/Googlebot-Extended/i' => ['name' => 'Googlebot-Extended', 'company' => 'Google'],
        // ... 10+ more patterns
    ];

    foreach ($bot_patterns as $pattern => $bot) {
        if (preg_match($pattern, $user_agent)) {
            // Log to Geo Tracker API (non-blocking)
            wp_remote_post('https://geo-tracker.com/api/v1/crawlers/log', [
                'blocking' => false,
                'headers'  => ['X-API-Key' => get_option('geo_tracker_api_key')],
                'body'     => json_encode([
                    'botName' => $bot['name'],
                    'path'    => $_SERVER['REQUEST_URI'],
                    // ... more data
                ]),
            ]);
            break;
        }
    }
}, 1);`,
};
