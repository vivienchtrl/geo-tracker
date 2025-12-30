<?php
/**
 * Settings Class
 *
 * Handles the plugin settings page in WordPress admin
 *
 * @package Geo_Tracker
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class Geo_Tracker_Settings {

    /**
     * Constructor
     */
    public function __construct() {
        add_action('admin_menu', [$this, 'add_menu_page']);
        add_action('admin_init', [$this, 'register_settings']);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_styles']);
        add_action('wp_ajax_geo_tracker_test_connection', [$this, 'ajax_test_connection']);
    }

    /**
     * Add settings page to admin menu
     */
    public function add_menu_page() {
        add_options_page(
            __('Geo Tracker', 'geo-tracker'),
            __('Geo Tracker', 'geo-tracker'),
            'manage_options',
            'geo-tracker',
            [$this, 'render_settings_page']
        );
    }

    /**
     * Register settings
     */
    public function register_settings() {
        register_setting('geo_tracker_settings', 'geo_tracker_api_key', [
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default'           => '',
        ]);

        register_setting('geo_tracker_settings', 'geo_tracker_endpoint', [
            'type'              => 'string',
            'sanitize_callback' => 'esc_url_raw',
            'default'           => 'https://geo-tracker.com/api/v1/crawlers/log',
        ]);

        register_setting('geo_tracker_settings', 'geo_tracker_enabled', [
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default'           => '1',
        ]);

        // Settings section
        add_settings_section(
            'geo_tracker_main_section',
            __('API Configuration', 'geo-tracker'),
            [$this, 'render_section_description'],
            'geo-tracker'
        );

        // API Key field
        add_settings_field(
            'geo_tracker_api_key',
            __('API Key', 'geo-tracker'),
            [$this, 'render_api_key_field'],
            'geo-tracker',
            'geo_tracker_main_section'
        );

        // Endpoint field
        add_settings_field(
            'geo_tracker_endpoint',
            __('API Endpoint', 'geo-tracker'),
            [$this, 'render_endpoint_field'],
            'geo-tracker',
            'geo_tracker_main_section'
        );

        // Enabled field
        add_settings_field(
            'geo_tracker_enabled',
            __('Enable Bot Tracking', 'geo-tracker'),
            [$this, 'render_enabled_field'],
            'geo-tracker',
            'geo_tracker_main_section'
        );

    }

    /**
     * Enqueue admin styles
     */
    public function enqueue_admin_styles($hook) {
        if ($hook !== 'settings_page_geo-tracker') {
            return;
        }

        wp_add_inline_style('wp-admin', $this->get_admin_css());
    }

    /**
     * Get admin CSS
     */
    private function get_admin_css() {
        return '
            .geo-tracker-wrap {
                max-width: 800px;
            }
            .geo-tracker-header {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 20px;
                padding: 20px;
                background: #fff;
                border: 1px solid #c3c4c7;
                border-left: 4px solid #2271b1;
            }
            .geo-tracker-header h1 {
                margin: 0;
                padding: 0;
            }
            .geo-tracker-header .version {
                background: #f0f0f1;
                padding: 2px 8px;
                border-radius: 3px;
                font-size: 12px;
                color: #50575e;
            }
            .geo-tracker-card {
                background: #fff;
                border: 1px solid #c3c4c7;
                padding: 20px;
                margin-bottom: 20px;
            }
            .geo-tracker-card h2 {
                margin-top: 0;
                padding-bottom: 10px;
                border-bottom: 1px solid #f0f0f1;
            }
            .geo-tracker-status {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 4px 10px;
                border-radius: 3px;
                font-size: 12px;
                font-weight: 500;
            }
            .geo-tracker-status.active {
                background: #d4edda;
                color: #155724;
            }
            .geo-tracker-status.inactive {
                background: #f8d7da;
                color: #721c24;
            }
            .geo-tracker-status .dashicons {
                font-size: 14px;
                width: 14px;
                height: 14px;
            }
            .geo-tracker-bots-list {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 10px;
                margin-top: 15px;
            }
            .geo-tracker-bot-item {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 12px;
                background: #f6f7f7;
                border-radius: 4px;
                font-size: 13px;
            }
            .geo-tracker-bot-item .company {
                color: #646970;
                font-size: 11px;
            }
            .geo-tracker-test-btn {
                margin-left: 10px !important;
            }
            .geo-tracker-test-result {
                display: inline-block;
                margin-left: 10px;
                padding: 4px 10px;
                border-radius: 3px;
                font-size: 12px;
            }
            .geo-tracker-test-result.success {
                background: #d4edda;
                color: #155724;
            }
            .geo-tracker-test-result.error {
                background: #f8d7da;
                color: #721c24;
            }
        ';
    }

    /**
     * Render section description
     */
    public function render_section_description() {
        echo '<p>' . esc_html__('Connect your WordPress site to Geo Tracker to monitor AI crawler visits.', 'geo-tracker') . '</p>';
    }

    /**
     * Render API key field
     */
    public function render_api_key_field() {
        $api_key = get_option('geo_tracker_api_key', '');
        ?>
        <input
            type="password"
            id="geo_tracker_api_key"
            name="geo_tracker_api_key"
            value="<?php echo esc_attr($api_key); ?>"
            class="regular-text"
            autocomplete="off"
        />
        <button type="button" class="button geo-tracker-test-btn" id="geo-tracker-test-connection">
            <?php esc_html_e('Test Connection', 'geo-tracker'); ?>
        </button>
        <span id="geo-tracker-test-result" class="geo-tracker-test-result" style="display:none;"></span>
        <p class="description">
            <?php
            printf(
                /* translators: %s: link to Geo Tracker dashboard */
                esc_html__('Get your API key from your %s.', 'geo-tracker'),
                '<a href="https://geo-tracker.com/dashboard" target="_blank">' . esc_html__('Geo Tracker dashboard', 'geo-tracker') . '</a>'
            );
            ?>
        </p>
        <script>
            jQuery(document).ready(function($) {
                $('#geo-tracker-test-connection').on('click', function() {
                    var btn = $(this);
                    var result = $('#geo-tracker-test-result');

                    btn.prop('disabled', true).text('<?php esc_html_e('Testing...', 'geo-tracker'); ?>');
                    result.hide();

                    $.post(ajaxurl, {
                        action: 'geo_tracker_test_connection',
                        api_key: $('#geo_tracker_api_key').val(),
                        endpoint: $('#geo_tracker_endpoint').val(),
                        _ajax_nonce: '<?php echo wp_create_nonce('geo_tracker_test'); ?>'
                    }, function(response) {
                        btn.prop('disabled', false).text('<?php esc_html_e('Test Connection', 'geo-tracker'); ?>');

                        if (response.success) {
                            result.removeClass('error').addClass('success').text(response.data.message).show();
                        } else {
                            result.removeClass('success').addClass('error').text(response.data.message).show();
                        }
                    });
                });
            });
        </script>
        <?php
    }

    /**
     * Render endpoint field
     */
    public function render_endpoint_field() {
        $endpoint = get_option('geo_tracker_endpoint', 'https://geo-tracker.com/api/v1/crawlers/log');
        ?>
        <input
            type="url"
            id="geo_tracker_endpoint"
            name="geo_tracker_endpoint"
            value="<?php echo esc_url($endpoint); ?>"
            class="regular-text"
        />
        <p class="description">
            <?php esc_html_e('The API endpoint to send crawler data to. Only change if using a custom server.', 'geo-tracker'); ?>
        </p>
        <?php
    }

    /**
     * Render enabled field
     */
    public function render_enabled_field() {
        $enabled = get_option('geo_tracker_enabled', '1');
        ?>
        <label>
            <input
                type="checkbox"
                name="geo_tracker_enabled"
                value="1"
                <?php checked($enabled, '1'); ?>
            />
            <?php esc_html_e('Enable AI bot tracking', 'geo-tracker'); ?>
        </label>
        <p class="description">
            <?php esc_html_e('Track AI crawlers like GPTBot, ClaudeBot, PerplexityBot, etc.', 'geo-tracker'); ?>
        </p>
        <?php
    }

    /**
     * Render settings page
     */
    public function render_settings_page() {
        if (!current_user_can('manage_options')) {
            return;
        }

        $api_key = get_option('geo_tracker_api_key', '');
        $enabled = get_option('geo_tracker_enabled', '1');
        $is_configured = !empty($api_key);

        $detector = new Geo_Tracker_Bot_Detector();
        $bots = $detector->get_bot_patterns();
        ?>
        <div class="wrap geo-tracker-wrap">
            <div class="geo-tracker-header">
                <h1><?php esc_html_e('Geo Tracker', 'geo-tracker'); ?></h1>
                <span class="version">v<?php echo esc_html(GEO_TRACKER_VERSION); ?></span>
                <?php if ($is_configured && $enabled === '1') : ?>
                    <span class="geo-tracker-status active">
                        <span class="dashicons dashicons-yes-alt"></span>
                        <?php esc_html_e('Active', 'geo-tracker'); ?>
                    </span>
                <?php else : ?>
                    <span class="geo-tracker-status inactive">
                        <span class="dashicons dashicons-warning"></span>
                        <?php echo $is_configured ? esc_html__('Disabled', 'geo-tracker') : esc_html__('Not configured', 'geo-tracker'); ?>
                    </span>
                <?php endif; ?>
            </div>

            <div class="geo-tracker-card">
                <h2><?php esc_html_e('Settings', 'geo-tracker'); ?></h2>
                <form method="post" action="options.php">
                    <?php
                    settings_fields('geo_tracker_settings');
                    do_settings_sections('geo-tracker');
                    submit_button();
                    ?>
                </form>
            </div>

            <div class="geo-tracker-card">
                <h2><?php esc_html_e('Detected AI Bots', 'geo-tracker'); ?></h2>
                <p><?php esc_html_e('The following AI crawlers will be detected and logged:', 'geo-tracker'); ?></p>
                <div class="geo-tracker-bots-list">
                    <?php foreach ($bots as $bot) : ?>
                        <div class="geo-tracker-bot-item">
                            <strong><?php echo esc_html($bot['name']); ?></strong>
                            <span class="company"><?php echo esc_html($bot['company']); ?></span>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>
        <?php
    }

    /**
     * AJAX handler for testing connection
     */
    public function ajax_test_connection() {
        check_ajax_referer('geo_tracker_test', '_ajax_nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(['message' => __('Permission denied.', 'geo-tracker')]);
        }

        $api_key = isset($_POST['api_key']) ? sanitize_text_field(wp_unslash($_POST['api_key'])) : '';

        if (empty($api_key)) {
            wp_send_json_error(['message' => __('Please enter an API key.', 'geo-tracker')]);
        }

        $api = new Geo_Tracker_API($api_key);
        $result = $api->test_connection();

        if ($result['success']) {
            wp_send_json_success(['message' => $result['message']]);
        } else {
            wp_send_json_error(['message' => $result['message']]);
        }
    }
}
