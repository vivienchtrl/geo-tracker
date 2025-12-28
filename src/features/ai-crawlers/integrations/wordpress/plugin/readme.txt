=== Geo Tracker - AI Bot Detection ===
Contributors: geotracker
Tags: ai, bots, crawlers, gptbot, claudebot, analytics, monitoring
Requires at least: 5.0
Tested up to: 6.4
Stable tag: 1.0.0
Requires PHP: 7.4
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Detect and monitor AI crawlers (GPTBot, ClaudeBot, PerplexityBot, etc.) visiting your WordPress site.

== Description ==

**Geo Tracker** helps you understand how AI systems are crawling and using your content.

With the rise of AI-powered search and content generation, it's more important than ever to know which AI bots are visiting your site. This plugin automatically detects AI crawlers and sends visit data to your Geo Tracker dashboard for analysis.

= Features =

* **Automatic Detection** - Identifies 15+ AI crawlers including GPTBot (OpenAI), ClaudeBot (Anthropic), PerplexityBot, and more
* **Zero Performance Impact** - Uses non-blocking requests to log visits without slowing down your site
* **Easy Setup** - Just enter your API key and you're ready to go
* **Privacy Focused** - IP addresses are hashed server-side, no personal data stored
* **Real-time Monitoring** - See AI crawler visits in your Geo Tracker dashboard as they happen

= Detected AI Bots =

* **OpenAI**: GPTBot, ChatGPT-User, OAI-SearchBot
* **Anthropic**: ClaudeBot, Claude-Web
* **Google**: Googlebot-Extended, Google-Extended
* **Perplexity**: PerplexityBot
* **Meta**: FacebookBot, Meta-ExternalAgent
* **ByteDance**: Bytespider
* **Common Crawl**: CCBot
* **Amazon**: Amazonbot
* **Apple**: Applebot-Extended
* **And more...**

= Requirements =

* A Geo Tracker account (free tier available)
* API key from your Geo Tracker dashboard

== Installation ==

1. Upload the `geo-tracker` folder to the `/wp-content/plugins/` directory
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Go to Settings > Geo Tracker
4. Enter your API key from your Geo Tracker dashboard
5. Click "Test Connection" to verify everything works
6. Save your settings

That's it! The plugin will now automatically detect and log AI crawler visits.

== Frequently Asked Questions ==

= Where do I get an API key? =

Sign up for a free account at [geo-tracker.com](https://geo-tracker.com) and get your API key from the dashboard.

= Does this slow down my site? =

No. The plugin uses WordPress's non-blocking HTTP API to send data asynchronously. Your page loads are not affected.

= What data is collected? =

* Bot name and category
* Page URL visited
* Timestamp
* Country (if available via CDN headers)
* User-Agent string

IP addresses are hashed server-side for privacy.

= Does this work with caching plugins? =

Yes, but if you're using full-page caching, the detection may not work for cached pages. This is a limitation of all WordPress request-based tracking.

= Does this work behind Cloudflare? =

Yes! The plugin automatically detects Cloudflare's headers for accurate IP and country detection.

== Screenshots ==

1. Settings page in WordPress admin
2. List of detected AI bots
3. Test connection feature

== Changelog ==

= 1.0.0 =
* Initial release
* Detection for 15+ AI crawlers
* Settings page with connection testing
* Non-blocking API logging

== Upgrade Notice ==

= 1.0.0 =
Initial release of Geo Tracker AI Bot Detection plugin.
