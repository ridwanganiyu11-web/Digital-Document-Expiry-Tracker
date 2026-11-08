/**
 * Calculate SHA-256 hash of a File or Blob using native Web Crypto API.
 * Files never leave the browser.
 * Returns bytes32 formatted hex string (0x...)
 */
export async function calculateFileSha256(file) {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hexString = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return `0x${hexString}`;
}

/**
 * Calculate SHA-256 hash of a string
 */
export async function calculateStringSha256(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hexString = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return `0x${hexString}`;
}

/**
 * Generate a random Reference ID like EXP-000124 or EXP-839210
 */
export function generateReferenceId() {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `EXP-${randomNum}`;
}

/**
 * Format bytes32 or address for clean UI display
 */
export function truncateHash(hash, chars = 6) {
  if (!hash) return '';
  if (hash.length <= chars * 2 + 2) return hash;
  return `${hash.slice(0, chars + 2)}...${hash.slice(-chars)}`;
}

/**
 * Format Unix timestamp to human date
 */
export function formatTimestamp(timestamp) {
  if (!timestamp) return 'N/A';
  const num = typeof timestamp === 'bigint' ? Number(timestamp) : Number(timestamp);
  if (num === 0) return 'N/A';
  const date = new Date(num * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Format time remaining (days, hours)
 */
export function formatTimeRemaining(seconds) {
  const s = typeof seconds === 'bigint' ? Number(seconds) : Number(seconds);
  if (s <= 0) return 'Expired';
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  if (days > 1) return `${days} days left`;
  if (days === 1) return `1 day ${hours}h left`;
  return `${hours} hours left`;
}

