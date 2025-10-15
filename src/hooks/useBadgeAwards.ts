import { type NostrEvent } from '@nostrify/nostrify';
import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';

export interface BadgeAward {
  id: string;
  pubkey: string;
  badgeAddress: string; // a tag: "30009:pubkey:d"
  awardedTo: Array<{ pubkey: string; relay?: string }>;
  event: NostrEvent;
}

function parseBadgeAward(event: NostrEvent): BadgeAward {
  const tags = event.tags;
  const badgeAddress = tags.find(([name]) => name === 'a')?.[1] ?? '';
  const awardedTo = tags
    .filter(([name]) => name === 'p')
    .map(([, pubkey, relay]) => ({ pubkey, relay }));

  return {
    id: event.id,
    pubkey: event.pubkey,
    badgeAddress,
    awardedTo,
    event,
  };
}

interface UseBadgeAwardsOptions {
  badgeAddress?: string; // Filter by badge definition address
  awardedTo?: string; // Filter by awarded pubkey
  awardedBy?: string; // Filter by issuer pubkey
  limit?: number;
}

export function useBadgeAwards(options: UseBadgeAwardsOptions = {}) {
  const { nostr } = useNostr();
  const { badgeAddress, awardedTo, awardedBy, limit = 50 } = options;

  return useQuery<BadgeAward[]>({
    queryKey: ['badgeAwards', badgeAddress, awardedTo, awardedBy, limit],
    queryFn: async ({ signal }) => {
      const filter: Parameters<typeof nostr.query>[0][0] = {
        kinds: [8],
        limit,
      };

      if (badgeAddress) {
        filter['#a'] = [badgeAddress];
      }

      if (awardedTo) {
        filter['#p'] = [awardedTo];
      }

      if (awardedBy) {
        filter.authors = [awardedBy];
      }

      const events = await nostr.query(
        [filter],
        { signal: AbortSignal.any([signal, AbortSignal.timeout(5000)]) },
      );

      return events.map(parseBadgeAward);
    },
    retry: 2,
  });
}
