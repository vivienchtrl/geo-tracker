/**
 * API Key Generation & Hashing Utilities
 *
 * Security:
 * - Keys are generated with crypto.randomBytes (cryptographically secure)
 * - Keys are hashed with SHA256 + salt before storage
 * - Plain keys are shown ONCE on creation, then only hashes are stored
 *
 * Format: gtr_live_[32 random chars in base64url]
 * Example: gtr_live_Abc123XyzDef456GhiJkl789MnoPqr0
 */

import { createHash, randomBytes } from "crypto";

const API_KEY_PREFIX = "gtr_live_";
const KEY_LENGTH = 32; // bytes, will be ~43 chars in base64url

/**
 * Generate a new API key
 * Returns both the plain key (to show user once) and the hash (to store)
 */
export function generateApiKey(): {
  plainKey: string;
  keyHash: string;
  prefix: string;
} {
  // Generate random bytes and encode as base64url
  const randomPart = randomBytes(KEY_LENGTH)
    .toString("base64url")
    .slice(0, 32); // Ensure exactly 32 chars

  const plainKey = `${API_KEY_PREFIX}${randomPart}`;
  const prefix = plainKey.slice(0, 16); // "gtr_live_" + first 7 random chars
  const keyHash = hashApiKey(plainKey);

  return {
    plainKey,
    keyHash,
    prefix,
  };
}

/**
 * Hash an API key for storage or comparison
 * Uses SHA256 with environment salt
 */
export function hashApiKey(plainKey: string): string {
  const salt = process.env.API_KEY_SALT || "default-salt-change-in-production";
  return createHash("sha256")
    .update(plainKey + salt)
    .digest("hex");
}

/**
 * Validate API key format (before hashing)
 * Returns true if the key matches expected format
 */
export function isValidApiKeyFormat(key: string): boolean {
  // Must start with prefix and have correct length
  if (!key.startsWith(API_KEY_PREFIX)) return false;

  const randomPart = key.slice(API_KEY_PREFIX.length);
  // Should be 32 chars of base64url characters
  if (randomPart.length !== 32) return false;

  // Only allow base64url characters
  return /^[A-Za-z0-9_-]+$/.test(randomPart);
}

/**
 * Extract prefix from a plain API key (for display purposes)
 */
export function extractKeyPrefix(plainKey: string): string {
  return plainKey.slice(0, 16);
}

/**
 * Hash IP address for privacy-compliant storage
 */
export function hashIpAddress(ip: string): string {
  const salt = process.env.IP_HASH_SALT || "ip-salt-change-in-production";
  return createHash("sha256")
    .update(ip + salt)
    .digest("hex")
    .slice(0, 32); // Truncate to 32 chars for storage efficiency
}

/**
 * Compare a plain API key against a stored hash
 */
export function verifyApiKey(plainKey: string, storedHash: string): boolean {
  const computedHash = hashApiKey(plainKey);
  // Use timing-safe comparison to prevent timing attacks
  if (computedHash.length !== storedHash.length) return false;

  let result = 0;
  for (let i = 0; i < computedHash.length; i++) {
    result |= computedHash.charCodeAt(i) ^ storedHash.charCodeAt(i);
  }
  return result === 0;
}
