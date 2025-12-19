export function extractUrls(text: string): string[] {
  // Regex that excludes trailing punctuation often found in text (like ) or . or ,)
  const urlRegex = /(https?:\/\/[^\s)]+)/g
  const matches = text.match(urlRegex) || []
  return matches.map(url => url.replace(/[.,;)]$/, ''))
}
