export function extractUrls(text: string): string[] {
  // Regex that excludes trailing punctuation often found in text (like ) or . or ,)
  const urlRegex = /(https?:\/\/[^\s)]+)/g
  const matches = text.match(urlRegex) || []
  return matches.map(url => url.replace(/[.,;)]$/, ''))
}

/**
 * Normalizes a URL/Domain for comparison
 * Removes protocol, www, and trailing slashes
 */
export function normalizeUrl(url: string): string {
  try {
    let clean = url.toLowerCase().trim();
    if (clean.includes('://')) {
      clean = clean.split('://')[1];
    }
    clean = clean.replace(/^www\./, '');
    clean = clean.split('/')[0]; // Keep only domain
    return clean;
  } catch {
    return url.toLowerCase().trim();
  }
}
