import * as cheerio from 'cheerio';

/**
 * Service to scrape and clean website content
 */
export async function scrapeWebsiteContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GeoTrackerBot/1.0; +http://geotracker.com)'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch website: ${response.statusText}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove unnecessary elements
    $('script, style, noscript, iframe, nav, footer, header').remove();

    // Get the main content
    // We can prioritize certain tags like article or main
    let mainContent = $('article').text() || $('main').text() || $('body').text();

    // Clean up whitespace
    mainContent = mainContent
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 8000); // Increased limit for mistral-small/medium if needed

    return mainContent;
  } catch (error) {
    console.error("Scraping error:", error);
    throw new Error(`Scraping failed for ${url}`);
  }
}
