<?php
/**
 * Plugin Name: Geo Tracker - AI Bot Detection
 * Plugin URI: https://geo-tracker.com/integrations/wordpress
 * Description: Detect and monitor AI crawlers (GPTBot, ClaudeBot, PerplexityBot, etc.) visiting your WordPress site.
 * Version: 1.0.0
 * Author: Geo Tracker
 * Author URI: https://geo-tracker.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: geo-tracker
 * Domain Path: /languages
 * Requires at least: 5.0
 * Requires PHP: 7.4
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Plugin constants
define('GEO_TRACKER_VERSION', '1.0.0');
define('GEO_TRACKER_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('GEO_TRACKER_PLUGIN_URL', plugin_dir_url(__FILE__));
define('GEO_TRACKER_PLUGIN_BASENAME', plugin_basename(__FILE__));

/**
 * Main plugin class
 */
final class Geo_Tracker {

    /**
     * Single instance
     */
    private static $instance = null;

    /**
     * Get instance
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Constructor
     */
    private function __construct() {
        $this->load_dependencies();
        $this->init_hooks();
    }

    /**
     * Load required files
     */
    private function load_dependencies() {
        require_once GEO_TRACKER_PLUGIN_DIR . 'includes/class-bot-detector.php';
        require_once GEO_TRACKER_PLUGIN_DIR . 'includes/class-api.php';
        require_once GEO_TRACKER_PLUGIN_DIR . 'includes/class-settings.php';
    }

    /**
     * Initialize hooks
     */
    private function init_hooks() {
        // Initialize settings page
        if (is_admin()) {
            new Geo_Tracker_Settings();
        }

        // Initialize bot detection on frontend
        if (!is_admin() && !wp_doing_ajax() && !wp_doing_cron()) {
            add_action('init', [$this, 'detect_bots'], 1);
        }

        // Activation/deactivation hooks
        register_activation_hook(__FILE__, [$this, 'activate']);
        register_deactivation_hook(__FILE__, [$this, 'deactivate']);

        // Add settings link to plugins page
        add_filter('plugin_action_links_' . GEO_TRACKER_PLUGIN_BASENAME, [$this, 'add_settings_link']);
    }

    /**
     * Detect AI bots
     */
    public function detect_bots() {
        $api_key = get_option('geo_tracker_api_key', '');

        if (empty($api_key)) {
            return;
        }

        $detector = new Geo_Tracker_Bot_Detector();
        $bot = $detector->detect();

        if ($bot) {
            $api = new Geo_Tracker_API($api_key);
            $api->log_visit($bot, $detector->get_request_data());
        }
    }

    /**
     * Plugin activation
     */
    public function activate() {
        // Set default options
        add_option('geo_tracker_api_key', '');
        add_option('geo_tracker_endpoint', 'https://geo-tracker.com/api/v1/crawlers/log');
        add_option('geo_tracker_enabled', '1');

        // Flush rewrite rules
        flush_rewrite_rules();
    }

    /**
     * Plugin deactivation
     */
    public function deactivate() {
        flush_rewrite_rules();
    }

    /**
     * Add settings link to plugins page
     */
    public function add_settings_link($links) {
        $settings_link = '<a href="' . admin_url('options-general.php?page=geo-tracker') . '">' . __('Settings', 'geo-tracker') . '</a>';
        array_unshift($links, $settings_link);
        return $links;
    }
}

/**
 * Initialize plugin
 */
function geo_tracker_init() {
    return Geo_Tracker::get_instance();
}

// Start the plugin
geo_tracker_init();
