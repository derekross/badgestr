import { getEventHash, type Event as NostrEvent } from 'nostr-tools';

/**
 * Count the number of leading zero bits in a hex string (event ID)
 */
export function countLeadingZeroes(hex: string): number {
  let count = 0;

  for (let i = 0; i < hex.length; i++) {
    const nibble = parseInt(hex[i], 16);
    if (nibble === 0) {
      count += 4;
    } else {
      count += Math.clz32(nibble) - 28;
      break;
    }
  }

  return count;
}

/**
 * Mine a Nostr event to achieve a target difficulty (leading zero bits)
 * Updates the nonce tag and recalculates the event ID until target is met
 */
export function mineEvent(
  event: NostrEvent,
  targetDifficulty: number,
  onProgress?: (nonce: number, difficulty: number) => void
): NostrEvent {
  let nonce = 0;
  const minedEvent = { ...event };

  // Remove any existing nonce tag
  minedEvent.tags = minedEvent.tags.filter(([tagName]) => tagName !== 'nonce');

  while (true) {
    // Add/update nonce tag with current nonce and target difficulty
    const nonceTag = ['nonce', nonce.toString(), targetDifficulty.toString()];
    minedEvent.tags = [
      ...minedEvent.tags.filter(([tagName]) => tagName !== 'nonce'),
      nonceTag,
    ];

    // Update created_at to current time during mining
    minedEvent.created_at = Math.floor(Date.now() / 1000);

    // Calculate event ID
    minedEvent.id = getEventHash(minedEvent);

    // Check if we've achieved the target difficulty
    const difficulty = countLeadingZeroes(minedEvent.id);

    // Report progress
    if (onProgress && nonce % 10000 === 0) {
      onProgress(nonce, difficulty);
    }

    if (difficulty >= targetDifficulty) {
      return minedEvent;
    }

    nonce++;

    // Safety check to prevent infinite loops
    if (nonce > 10000000) {
      throw new Error('Mining timeout: exceeded 10 million attempts');
    }
  }
}

/**
 * Badge rarity levels and their corresponding PoW difficulty
 */
export const BADGE_RARITY = {
  COMMON: { name: 'Common', difficulty: 0, color: '#9CA3AF' },
  UNCOMMON: { name: 'Uncommon', difficulty: 16, color: '#10B981' },
  RARE: { name: 'Rare', difficulty: 21, color: '#3B82F6' },
  EPIC: { name: 'Epic', difficulty: 32, color: '#8B5CF6' },
  LEGENDARY: { name: 'Legendary', difficulty: 64, color: '#F59E0B' },
} as const;

export type BadgeRarity = keyof typeof BADGE_RARITY;

/**
 * Get rarity info by difficulty level
 */
export function getRarityByDifficulty(difficulty: number): BadgeRarity {
  if (difficulty >= 64) return 'LEGENDARY';
  if (difficulty >= 32) return 'EPIC';
  if (difficulty >= 21) return 'RARE';
  if (difficulty >= 16) return 'UNCOMMON';
  return 'COMMON';
}

/**
 * Estimate mining time based on difficulty
 * Returns approximate time in milliseconds
 */
export function estimateMiningTime(difficulty: number): number {
  // Very rough estimation: ~100,000 hashes per second on average hardware
  const hashesPerSecond = 100000;
  const expectedHashes = Math.pow(2, difficulty);
  const expectedSeconds = expectedHashes / hashesPerSecond;
  return expectedSeconds * 1000;
}

/**
 * Format mining time for display
 */
export function formatMiningTime(milliseconds: number): string {
  if (milliseconds < 1000) return 'Less than 1 second';
  if (milliseconds < 60000) return `~${Math.round(milliseconds / 1000)} seconds`;
  if (milliseconds < 3600000) return `~${Math.round(milliseconds / 60000)} minutes`;
  return `~${Math.round(milliseconds / 3600000)} hours`;
}
