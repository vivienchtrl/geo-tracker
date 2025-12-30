<?php
/**
 * API Class
 *
 * Handles communication with Geo Tracker API
 *
 * @package Geo_Tracker
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class Geo_Tracker_API {

    /**
     * API Key
     */
    private $api_key;

    /**
     * API Endpoint
     */
    private $endpoint;

    /**
     * Constructor
     *
     * @param string $api_key API key for authentication
     */
    public function __construct($api_key) {
        $this->api_key = $api_key;
        $this->endpoint = get_option('geo_tracker_endpoint', 'https://geo-tracker.com/api/v1/crawlers/log');
    }

    /**
     * Log a bot visit
     *
     * @param array $bot         Bot data (name, category, company)
     * @param array $request_data Request data (path, method, etc.)
     * @return bool Success status
     */
    public function log_visit($bot, $request_data) {
        if (!get_option('geo_tracker_enabled', '1')) {
            return false;
        }

        $payload = array_merge($request_data, [
            'botName'     => $bot['name'],
            'botCategory' => $bot['category'],
            'botCompany'  => $bot['company'],
            'visitType'   => $bot['visitType'] ?? 'crawler',
        ]);

        // Use non-blocking request to not slow down page load
        $args = [
            'timeout'     => 5,
            'redirection' => 0,
            'httpversion' => '1.1',
            'blocking'    => false, // Non-blocking!
            'headers'     => [
                'Content-Type' => 'application/json',
                'X-API-Key'    => $this->api_key,
                'User-Agent'   => 'Prexia-WordPress/' . GEO_TRACKER_VERSION,
            ],
            'body'        => wp_json_encode($payload),
            'cookies'     => [],
            'sslverify'   => true,
        ];

        $response = wp_remote_post($this->endpoint, $args);

        if (is_wp_error($response)) {
            $this->log_error('API request failed: ' . $response->get_error_message());
            return false;
        }

        return true;
    }

    /**
     * Test API connection test ping
     *
     * @return array Result with success status and message
     */
    public function test_connection() {
        $test_endpoint = str_replace('/log', '/ping', $this->endpoint);

        $args = [
            'timeout'     => 10,
            'httpversion' => '1.1',
            'headers'     => [
                'Content-Type' => 'application/json',
                'X-API-Key'    => $this->api_key,
                'User-Agent'   => 'Prexia-WordPress/' . GEO_TRACKER_VERSION,
            ],
            'sslverify'   => true,
        ];

        $response = wp_remote_get($test_endpoint, $args);

        if (is_wp_error($response)) {
            return [
                'success' => false,
                'message' => $response->get_error_message(),
            ];
        }

        $status_code = wp_remote_retrieve_response_code($response);

        if ($status_code === 200) {
            return [
                'success' => true,
                'message' => __('Connection successful!', 'geo-tracker'),
            ];
        }

        if ($status_code === 401) {
            return [
                'success' => false,
                'message' => __('Invalid API key.', 'geo-tracker'),
            ];
        }

        return [
            'success' => false,
            'message' => sprintf(__('Unexpected response: %d', 'geo-tracker'), $status_code),
        ];
    }

    /**
     * Log a human page visit
     *
     * @param array $request_data Request data (path, visitorId, etc.)
     * @return bool Success status
     */
    public function log_page_visit($request_data) {
        if (!get_option('geo_tracker_enabled', '1')) {
            return false;
        }

        // Use visits endpoint instead of crawlers
        $visits_endpoint = str_replace('/crawlers/log', '/visits/log', $this->endpoint);

        $args = [
            'timeout'     => 5,
            'redirection' => 0,
            'httpversion' => '1.1',
            'blocking'    => false,
            'headers'     => [
                'Content-Type' => 'application/json',
                'X-API-Key'    => $this->api_key,
                'User-Agent'   => 'Prexia-WordPress/' . GEO_TRACKER_VERSION,
            ],
            'body'        => wp_json_encode($request_data),
            'cookies'     => [],
            'sslverify'   => true,
        ];

        $response = wp_remote_post($visits_endpoint, $args);

        if (is_wp_error($response)) {
            $this->log_error('Page visit log failed: ' . $response->get_error_message());
            return false;
        }

        return true;
    }

    /**
     * Log error message
     *
     * @param string $message Error message
     */
    private function log_error($message) {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('[Geo Tracker] ' . $message);
        }
    }
}
