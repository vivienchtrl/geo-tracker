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
        // OpenAI (ChatGPT)
        ['pattern' => '/GPTBot/i', 'name' => 'GPTBot', 'category' => 'ai_crawler', 'company' => 'OpenAI', 'visitType' => 'crawler'],
        ['pattern' => '/ChatGPT-User/i', 'name' => 'ChatGPT-User', 'category' => 'ai_crawler', 'company' => 'OpenAI', 'visitType' => 'user_mention'],
        ['pattern' => '/ChatGPT-Browser/i', 'name' => 'ChatGPT-Browser', 'category' => 'ai_crawler', 'company' => 'OpenAI', 'visitType' => 'user_mention'],
        ['pattern' => '/OAI-SearchBot/i', 'name' => 'OAI-SearchBot', 'category' => 'ai_crawler', 'company' => 'OpenAI', 'visitType' => 'search'],

        // Anthropic (Claude)
        ['pattern' => '/ClaudeBot/i', 'name' => 'ClaudeBot', 'category' => 'ai_crawler', 'company' => 'Anthropic', 'visitType' => 'crawler'],
        ['pattern' => '/Claude-Web/i', 'name' => 'Claude-Web', 'category' => 'ai_crawler', 'company' => 'Anthropic', 'visitType' => 'user_mention'],
        ['pattern' => '/Anthropic-Claude/i', 'name' => 'Anthropic-Claude', 'category' => 'ai_crawler', 'company' => 'Anthropic', 'visitType' => 'crawler'],
        ['pattern' => '/anthropic-ai/i', 'name' => 'anthropic-ai', 'category' => 'ai_crawler', 'company' => 'Anthropic', 'visitType' => 'crawler'],

        // Google (Gemini/Bard/Vertex)
        ['pattern' => '/Google-Extended/i', 'name' => 'Google-Extended', 'category' => 'ai_crawler', 'company' => 'Google', 'visitType' => 'crawler'],
        ['pattern' => '/Google-CloudVertexBot/i', 'name' => 'Google-CloudVertexBot', 'category' => 'ai_crawler', 'company' => 'Google', 'visitType' => 'crawler'],
        ['pattern' => '/Google-NotebookLM/i', 'name' => 'Google-NotebookLM', 'category' => 'ai_crawler', 'company' => 'Google', 'visitType' => 'user_mention'],
        ['pattern' => '/GoogleAgent-Mariner/i', 'name' => 'GoogleAgent-Mariner', 'category' => 'ai_crawler', 'company' => 'Google', 'visitType' => 'user_mention'],
        ['pattern' => '/Gemini-Deep-Research/i', 'name' => 'Gemini-Deep-Research', 'category' => 'ai_crawler', 'company' => 'Google', 'visitType' => 'user_mention'],
        ['pattern' => '/Gemini-AI/i', 'name' => 'Gemini-AI', 'category' => 'ai_crawler', 'company' => 'Google', 'visitType' => 'crawler'],
        ['pattern' => '/Bard-AI/i', 'name' => 'Bard-AI', 'category' => 'ai_crawler', 'company' => 'Google', 'visitType' => 'crawler'],

        // Perplexity
        ['pattern' => '/PerplexityBot/i', 'name' => 'PerplexityBot', 'category' => 'ai_crawler', 'company' => 'Perplexity', 'visitType' => 'crawler'],
        ['pattern' => '/Perplexity-User/i', 'name' => 'Perplexity-User', 'category' => 'ai_crawler', 'company' => 'Perplexity', 'visitType' => 'user_mention'],

        // Microsoft (Copilot/Bing)
        ['pattern' => '/bingbot/i', 'name' => 'BingBot', 'category' => 'ai_crawler', 'company' => 'Microsoft', 'visitType' => 'search'],

        // Mistral
        ['pattern' => '/MistralAI-User/i', 'name' => 'MistralAI-User', 'category' => 'ai_crawler', 'company' => 'Mistral', 'visitType' => 'user_mention'],

        // Cohere
        ['pattern' => '/Cohere-AI/i', 'name' => 'Cohere-AI', 'category' => 'ai_crawler', 'company' => 'Cohere', 'visitType' => 'crawler'],
        ['pattern' => '/Cohere-Command/i', 'name' => 'Cohere-Command', 'category' => 'ai_crawler', 'company' => 'Cohere', 'visitType' => 'crawler'],

        // Meta (Llama)
        ['pattern' => '/FacebookBot/i', 'name' => 'FacebookBot', 'category' => 'ai_crawler', 'company' => 'Meta', 'visitType' => 'crawler'],
        ['pattern' => '/facebookexternalhit/i', 'name' => 'FacebookBot', 'category' => 'ai_crawler', 'company' => 'Meta', 'visitType' => 'crawler'],
        ['pattern' => '/Meta-ExternalAgent/i', 'name' => 'Meta-ExternalAgent', 'category' => 'ai_crawler', 'company' => 'Meta', 'visitType' => 'crawler'],
        ['pattern' => '/meta-webindexer/i', 'name' => 'Meta-WebIndexer', 'category' => 'ai_crawler', 'company' => 'Meta', 'visitType' => 'crawler'],

        // Apple (Siri/Apple Intelligence)
        ['pattern' => '/Applebot-Extended/i', 'name' => 'Applebot-Extended', 'category' => 'ai_crawler', 'company' => 'Apple', 'visitType' => 'crawler'],
        ['pattern' => '/Applebot/i', 'name' => 'Applebot', 'category' => 'ai_crawler', 'company' => 'Apple', 'visitType' => 'crawler'],

        // Amazon (Alexa)
        ['pattern' => '/Amazonbot/i', 'name' => 'Amazonbot', 'category' => 'ai_crawler', 'company' => 'Amazon', 'visitType' => 'crawler'],

        // ByteDance (TikTok/Doubao)
        ['pattern' => '/Bytespider/i', 'name' => 'Bytespider', 'category' => 'ai_crawler', 'company' => 'ByteDance', 'visitType' => 'crawler'],

        // xAI (Grok)
        ['pattern' => '/xAI-Bot/i', 'name' => 'xAI-Bot', 'category' => 'ai_crawler', 'company' => 'xAI', 'visitType' => 'crawler'],

        // Groq
        ['pattern' => '/Groq-Bot/i', 'name' => 'Groq-Bot', 'category' => 'ai_crawler', 'company' => 'Groq', 'visitType' => 'crawler'],

        // DeepSeek
        ['pattern' => '/DeepseekBot/i', 'name' => 'DeepseekBot', 'category' => 'ai_crawler', 'company' => 'DeepSeek', 'visitType' => 'crawler'],

        // You.com
        ['pattern' => '/YouBot/i', 'name' => 'YouBot', 'category' => 'ai_crawler', 'company' => 'You.com', 'visitType' => 'search'],

        // DuckDuckGo
        ['pattern' => '/DuckAssistBot/i', 'name' => 'DuckAssistBot', 'category' => 'ai_crawler', 'company' => 'DuckDuckGo', 'visitType' => 'user_mention'],

        // Character.AI
        ['pattern' => '/Character-AI/i', 'name' => 'Character-AI', 'category' => 'ai_crawler', 'company' => 'Character.AI', 'visitType' => 'user_mention'],

        // HuggingFace
        ['pattern' => '/HuggingFace-Bot/i', 'name' => 'HuggingFace-Bot', 'category' => 'ai_crawler', 'company' => 'HuggingFace', 'visitType' => 'crawler'],

        // Together.ai
        ['pattern' => '/Together-Bot/i', 'name' => 'Together-Bot', 'category' => 'ai_crawler', 'company' => 'Together.ai', 'visitType' => 'crawler'],

        // Replicate
        ['pattern' => '/Replicate-Bot/i', 'name' => 'Replicate-Bot', 'category' => 'ai_crawler', 'company' => 'Replicate', 'visitType' => 'crawler'],

        // RunPod
        ['pattern' => '/RunPod-Bot/i', 'name' => 'RunPod-Bot', 'category' => 'ai_crawler', 'company' => 'RunPod', 'visitType' => 'crawler'],

        // AI2 (Allen Institute)
        ['pattern' => '/AI2Bot/i', 'name' => 'AI2Bot', 'category' => 'ai_crawler', 'company' => 'Allen Institute', 'visitType' => 'crawler'],

        // Diffbot
        ['pattern' => '/Diffbot/i', 'name' => 'Diffbot', 'category' => 'ai_crawler', 'company' => 'Diffbot', 'visitType' => 'crawler'],

        // Webz.io
        ['pattern' => '/Webzio/i', 'name' => 'Webzio', 'category' => 'ai_crawler', 'company' => 'Webz.io', 'visitType' => 'crawler'],
        ['pattern' => '/Webzio-Extended/i', 'name' => 'Webzio-Extended', 'category' => 'ai_crawler', 'company' => 'Webz.io', 'visitType' => 'crawler'],

        // Common Crawl
        ['pattern' => '/CCBot/i', 'name' => 'CCBot', 'category' => 'ai_crawler', 'company' => 'Common Crawl', 'visitType' => 'crawler'],

        // Cognizant/Devin
        ['pattern' => '/Devin/i', 'name' => 'Devin', 'category' => 'ai_crawler', 'company' => 'Cognition', 'visitType' => 'user_mention'],

        // Firecrawl
        ['pattern' => '/FirecrawlAgent/i', 'name' => 'FirecrawlAgent', 'category' => 'ai_crawler', 'company' => 'Firecrawl', 'visitType' => 'crawler'],

        // Other AI Bots
        ['pattern' => '/Andibot/i', 'name' => 'Andibot', 'category' => 'ai_crawler', 'company' => 'Andi', 'visitType' => 'search'],
        ['pattern' => '/Brightbot/i', 'name' => 'Brightbot', 'category' => 'ai_crawler', 'company' => 'Bright', 'visitType' => 'crawler'],
        ['pattern' => '/Crawlspace/i', 'name' => 'Crawlspace', 'category' => 'ai_crawler', 'company' => 'Crawlspace', 'visitType' => 'crawler'],
        ['pattern' => '/IbouBot/i', 'name' => 'IbouBot', 'category' => 'ai_crawler', 'company' => 'Ibou', 'visitType' => 'crawler'],
        ['pattern' => '/ImagesiftBot/i', 'name' => 'ImagesiftBot', 'category' => 'ai_crawler', 'company' => 'Imagesift', 'visitType' => 'crawler'],
        ['pattern' => '/TimpiBot/i', 'name' => 'TimpiBot', 'category' => 'ai_crawler', 'company' => 'Timpi', 'visitType' => 'crawler'],
        ['pattern' => '/PanguBot/i', 'name' => 'PanguBot', 'category' => 'ai_crawler', 'company' => 'Huawei', 'visitType' => 'crawler'],
        ['pattern' => '/bigsur\.ai/i', 'name' => 'bigsur.ai', 'category' => 'ai_crawler', 'company' => 'BigSur', 'visitType' => 'crawler'],
        ['pattern' => '/TerraCotta/i', 'name' => 'TerraCotta', 'category' => 'ai_crawler', 'company' => 'Ceramic', 'visitType' => 'crawler'],
        ['pattern' => '/Cotoyogi/i', 'name' => 'Cotoyogi', 'category' => 'ai_crawler', 'company' => 'Cotoyogi', 'visitType' => 'crawler'],
        ['pattern' => '/Kangaroo Bot/i', 'name' => 'Kangaroo Bot', 'category' => 'ai_crawler', 'company' => 'Kangaroo', 'visitType' => 'crawler'],
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
                    'name'      => $bot['name'],
                    'category'  => $bot['category'],
                    'company'   => $bot['company'],
                    'visitType' => $bot['visitType'],
                ];
            }
        }

        // Capture tous les autres bots inconnus
        if (preg_match('/bot|crawl|spider|agent|fetch|curl|wget|python|http/i', $this->user_agent)) {
            preg_match('/^([A-Za-z0-9_.-]+)/', $this->user_agent, $m);
            return [
                'name'      => $m[1] ?? 'Unknown',
                'category'  => 'other',
                'company'   => 'Unknown',
                'visitType' => 'crawler',
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
