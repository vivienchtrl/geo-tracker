<?php
/**
 * Visitor Tracker Class
 *
 * Tracks human page visits (non-bot traffic)
 *
 * @package Geo_Tracker
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class Geo_Tracker_Visitor_Tracker {

    /**
     * User Agent
     */
    private $user_agent;

    /**
     * Constructor
     */
    public function __construct() {
        $this->user_agent = isset($_SERVER['HTTP_USER_AGENT']) ? sanitize_text_field($_SERVER['HTTP_USER_AGENT']) : '';
    }

    /**
     * Generate a visitor ID based on IP + User Agent
     * Hashed for privacy
     *
     * @return string
     */
    public function generate_visitor_id() {
        $ip = $this->get_client_ip();
        $date = gmdate('Y-m-d');
        $data = $ip . $this->user_agent . $date;
        return substr(hash('sha256', $data), 0, 32);
    }

    /**
     * Get request data for logging
     *
     * @return array
     */
    public function get_request_data() {
        $path = isset($_SERVER['REQUEST_URI']) ? sanitize_text_field($_SERVER['REQUEST_URI']) : '/';
        $current_url = home_url($path);

        return [
            'visitorId'   => $this->generate_visitor_id(),
            'path'        => $path,
            'url'         => $current_url,
            'title'       => wp_get_document_title(),
            'referrer'    => isset($_SERVER['HTTP_REFERER']) ? esc_url_raw($_SERVER['HTTP_REFERER']) : null,
            'timestamp'   => gmdate('Y-m-d\TH:i:s\Z'),
            'userAgent'   => substr($this->user_agent, 0, 2048),
            'ipAddress'   => $this->get_client_ip(),
            'utmSource'   => isset($_GET['utm_source']) ? sanitize_text_field($_GET['utm_source']) : null,
            'utmMedium'   => isset($_GET['utm_medium']) ? sanitize_text_field($_GET['utm_medium']) : null,
            'utmCampaign' => isset($_GET['utm_campaign']) ? sanitize_text_field($_GET['utm_campaign']) : null,
            'utmTerm'     => isset($_GET['utm_term']) ? sanitize_text_field($_GET['utm_term']) : null,
            'utmContent'  => isset($_GET['utm_content']) ? sanitize_text_field($_GET['utm_content']) : null,
            'source'      => 'wordpress',
        ];
    }

    /**
     * Get client IP address
     *
     * @return string
     */
    private function get_client_ip() {
        $headers = [
            'HTTP_CF_CONNECTING_IP',
            'HTTP_X_FORWARDED_FOR',
            'HTTP_X_REAL_IP',
            'REMOTE_ADDR',
        ];

        foreach ($headers as $header) {
            if (!empty($_SERVER[$header])) {
                $ip = $_SERVER[$header];
                if (strpos($ip, ',') !== false) {
                    $ip = trim(explode(',', $ip)[0]);
                }
                if (filter_var($ip, FILTER_VALIDATE_IP)) {
                    return sanitize_text_field($ip);
                }
            }
        }

        return '';
    }

    /**
     * Check if this is a common bot
     *
     * @return bool
     */
    public function is_common_bot() {
        $bot_patterns = [
            '/bot/i', '/crawler/i', '/spider/i', '/scraper/i',
            '/curl/i', '/wget/i', '/python/i', '/axios/i',
            '/node-fetch/i', '/headless/i', '/phantom/i',
            '/selenium/i', '/puppeteer/i', '/lighthouse/i',
            '/pagespeed/i', '/gtmetrix/i', '/pingdom/i',
            '/uptime/i', '/monitor/i',
        ];

        foreach ($bot_patterns as $pattern) {
            if (preg_match($pattern, $this->user_agent)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if request should be tracked
     *
     * @return bool
     */
    public function should_track() {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            return false;
        }

        if ($this->is_common_bot()) {
            return false;
        }

        $path = isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '';

        // Skip assets
        $skip_extensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.map'];
        foreach ($skip_extensions as $ext) {
            if (stripos($path, $ext) !== false) {
                return false;
            }
        }

        // Skip WordPress paths
        $skip_paths = ['/wp-admin', '/wp-includes', '/wp-content', '/wp-json', '/xmlrpc.php', '/wp-cron.php'];
        foreach ($skip_paths as $skip) {
            if (stripos($path, $skip) !== false) {
                return false;
            }
        }

        return true;
    }
}
