/**
 * AI Crawlers Integrations
 *
 * This module exports all available integration snippets for
 * logging AI bot visits from various platforms.
 */

// Types
export type { IntegrationSnippet, IntegrationConfig } from "./types";

// Integration snippets
export { CLOUDFLARE_SNIPPET } from "./cloudflare";
export { WORDPRESS_SNIPPET } from "./wordpress";

// All integrations as an array for easy iteration
import { CLOUDFLARE_SNIPPET } from "./cloudflare";
import { WORDPRESS_SNIPPET } from "./wordpress";
import type { IntegrationSnippet } from "./types";

export const ALL_INTEGRATIONS: IntegrationSnippet[] = [
  CLOUDFLARE_SNIPPET,
  WORDPRESS_SNIPPET,
];

// Helper to get integration by ID
export function getIntegrationById(id: string): IntegrationSnippet | undefined {
  return ALL_INTEGRATIONS.find((i) => i.id === id);
}
