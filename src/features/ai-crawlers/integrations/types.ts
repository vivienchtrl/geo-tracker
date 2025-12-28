/**
 * Shared types for AI Crawler integrations
 */

export interface IntegrationSnippet {
  /** Unique identifier for the integration */
  id: string;
  /** Display name */
  name: string;
  /** Short description */
  description: string;
  /** The actual code snippet */
  code: string;
  /** Programming language for syntax highlighting */
  language: "javascript" | "typescript" | "php";
  /** Filename to display */
  filename: string;
  /** External documentation URL */
  docsUrl: string;
  /** Whether this integration is available */
  available: boolean;
  /** Setup instructions */
  instructions: string[];
  /** Optional download URL for plugin-based integrations */
  downloadUrl?: string;
  /** Whether this is a downloadable plugin (vs code snippet) */
  isPlugin?: boolean;
}

export interface IntegrationConfig {
  /** The integration snippet data */
  snippet: IntegrationSnippet;
}
