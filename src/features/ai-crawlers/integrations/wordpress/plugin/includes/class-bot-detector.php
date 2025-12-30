<?php
/**
 * Bot Detector Class
 *
 * Detects AI crawlers based on User-Agent patterns
 *
 * @package Geo_Tracker
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class Geo_Tracker_Bot_Detector {

    /**
     * AI bot patterns to detect
     */
    private $bot_patterns = [
        // OpenAI
        ['pattern' => '/GPTBot/i', 'name' => 'GPTBot', 'category' => 'ai_crawler', 'company' => 'OpenAI'],
        ['pattern' => '/ChatGPT-User/i', 'name' => 'ChatGPT-User', 'category' => 'ai_crawler', 'company' => 'OpenAI'],
        ['pattern' => '/OAI-SearchBot/i', 'name' => 'OAI-SearchBot', 'category' => 'ai_crawler', 'company' => 'OpenAI'],

        // Anthropic
        ['pattern' => '/ClaudeBot/i', 'name' => 'ClaudeBot', 'category' => 'ai_crawler', 'company' => 'Anthropic'],
        ['pattern' => '/Claude-Web/i', 'name' => 'Claude-Web', 'category' => 'ai_crawler', 'company' => 'Anthropic'],
        ['pattern' => '/anthropic-ai/i', 'name' => 'Anthropic', 'category' => 'ai_crawler', 'company' => 'Anthropic'],

        // Google
        ['pattern' => '/Googlebot-Extended/i', 'name' => 'Googlebot-Extended', 'category' => 'ai_crawler', 'company' => 'Google'],
        ['pattern' => '/Google-Extended/i', 'name' => 'Google-Extended', 'category' => 'ai_crawler', 'company' => 'Google'],

        // Perplexity
        ['pattern' => '/PerplexityBot/i', 'name' => 'PerplexityBot', 'category' => 'ai_crawler', 'company' => 'Perplexity'],

        // Cohere
        ['pattern' => '/cohere-ai/i', 'name' => 'Cohere', 'category' => 'ai_crawler', 'company' => 'Cohere'],

        // ByteDance
        ['pattern' => '/Bytespider/i', 'name' => 'Bytespider', 'category' => 'ai_crawler', 'company' => 'ByteDance'],

        // Common Crawl
        ['pattern' => '/CCBot/i', 'name' => 'CCBot', 'category' => 'ai_crawler', 'company' => 'Common Crawl'],

        // Meta
        ['pattern' => '/FacebookBot/i', 'name' => 'FacebookBot', 'category' => 'ai_crawler', 'company' => 'Meta'],
        ['pattern' => '/meta-externalagent/i', 'name' => 'Meta-ExternalAgent', 'category' => 'ai_crawler', 'company' => 'Meta'],

        // Apple
        ['pattern' => '/Applebot-Extended/i', 'name' => 'Applebot-Extended', 'category' => 'ai_crawler', 'company' => 'Apple'],

        // Amazon
        ['pattern' => '/Amazonbot/i', 'name' => 'Amazonbot', 'category' => 'ai_crawler', 'company' => 'Amazon'],

        // Microsoft
        ['pattern' => '/Bingbot/i', 'name' => 'Bingbot', 'category' => 'search_crawler', 'company' => 'Microsoft'],
    ];

    /**
     * Current user agent
     */
    private $user_agent = '';

    /**
     * Constructor
     */
    public function __construct() {
        $this->user_agent = isset($_SERVER['HTTP_USER_AGENT'])
            ? sanitize_text_field(wp_unslash($_SERVER['HTTP_USER_AGENT']))
            : '';
    }

    /**
     * Detect if current request is from an AI bot
     *
     * @return array|null Bot data if detected, null otherwise
     */
    public function detect() {
        if (empty($this->user_agent)) {
            return null;
        }

        foreach ($this->bot_patterns as $bot) {
            if (preg_match($bot['pattern'], $this->user_agent)) {
                return [
                    'name'     => $bot['name'],
                    'category' => $bot['category'],
                    'company'  => $bot['company'],
                ];
            }
        }

        // Capture tous les autres bots inconnus
        if (preg_match('/bot|crawl|spider|agent|fetch|curl|wget|python|http/i', $this->user_agent)) {
            preg_match('/^([A-Za-z0-9_.-]+)/', $this->user_agent, $m);
            return [
                'name'     => $m[1] ?? 'Unknown',
                'category' => 'other',
                'company'  => 'Unknown',
            ];
        }

        return null;
    }

    /**
     * Get request data for logging
     *
     * @return array Request data
     */
    public function get_request_data() {
        return [
            'userAgent'      => substr($this->user_agent, 0, 2048),
            'path'           => isset($_SERVER['REQUEST_URI'])
                ? sanitize_text_field(wp_unslash($_SERVER['REQUEST_URI']))
                : '/',
            'method'         => isset($_SERVER['REQUEST_METHOD'])
                ? sanitize_text_field(wp_unslash($_SERVER['REQUEST_METHOD']))
                : 'GET',
            'timestamp'      => gmdate('c'),
            'responseStatus' => http_response_code() ?: 200,
            'ipAddress'      => $this->get_client_ip(),
            'countryCode'    => $this->get_country_code(),
            'headers'        => [
                'Accept'          => isset($_SERVER['HTTP_ACCEPT'])
                    ? sanitize_text_field(wp_unslash($_SERVER['HTTP_ACCEPT']))
                    : null,
                'Accept-Language' => isset($_SERVER['HTTP_ACCEPT_LANGUAGE'])
                    ? sanitize_text_field(wp_unslash($_SERVER['HTTP_ACCEPT_LANGUAGE']))
                    : null,
                'Referer'         => isset($_SERVER['HTTP_REFERER'])
                    ? esc_url_raw(wp_unslash($_SERVER['HTTP_REFERER']))
                    : null,
            ],
            'source'         => 'wordpress',
        ];
    }

    /**
     * Get client IP address
     *
     * @return string|null IP address
     */
    private function get_client_ip() {
        $headers = [
            'HTTP_CF_CONNECTING_IP',     // Cloudflare
            'HTTP_X_FORWARDED_FOR',      // Common proxy
            'HTTP_X_REAL_IP',            // Nginx proxy
            'HTTP_CLIENT_IP',            // Other proxies
            'REMOTE_ADDR',               // Direct connection
        ];

        foreach ($headers as $header) {
            if (!empty($_SERVER[$header])) {
                $ip = sanitize_text_field(wp_unslash($_SERVER[$header]));

                // Handle comma-separated list (X-Forwarded-For)
                if (strpos($ip, ',') !== false) {
                    $ip = trim(explode(',', $ip)[0]);
                }

                if (filter_var($ip, FILTER_VALIDATE_IP)) {
                    return $ip;
                }
            }
        }

        return null;
    }

    /**
     * Get country code from Cloudflare or other CDN headers
     *
     * @return string|null Country code
     */
    private function get_country_code() {
        $headers = [
            'HTTP_CF_IPCOUNTRY',         // Cloudflare
            'HTTP_X_COUNTRY_CODE',       // Some CDNs
        ];

        foreach ($headers as $header) {
            if (!empty($_SERVER[$header])) {
                return sanitize_text_field(wp_unslash($_SERVER[$header]));
            }
        }

        return null;
    }

    /**
     * Get all bot patterns (for display in admin)
     *
     * @return array Bot patterns
     */
    public function get_bot_patterns() {
        return $this->bot_patterns;
    }
}
