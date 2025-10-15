import { type NostrEvent } from '@nostrify/nostrify';
import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { type BadgeDefinition } from './useBadgeDefinition';
import { countLeadingZeroes, getRarityByDifficulty } from '@/lib/pow';

function parseBadgeDefinition(event: NostrEvent): BadgeDefinition {
  const tags = event.tags;
  const d = tags.find(([name]) => name === 'd')?.[1] ?? '';
  const name = tags.find(([name]) => name === 'name')?.[1];
  const description = tags.find(([name]) => name === 'description')?.[1];
  const imageTag = tags.find(([name]) => name === 'image');
  const image = imageTag?.[1];
  const imageDimensions = imageTag?.[2];
  const thumbs = tags
    .filter(([name]) => name === 'thumb')
    .map(([, url, dimensions]) => ({ url, dimensions }));

  // Calculate difficulty from event ID
  const difficulty = countLeadingZeroes(event.id);
  const rarity = getRarityByDifficulty(difficulty);

  return {
    id: event.id,
    pubkey: event.pubkey,
    d,
    name,
    description,
    image,
    imageDimensions,
    thumbs,
    difficulty,
    rarity,
    event,
  };
}

export function useBadgeDefinitions(pubkey?: string, limit = 50) {
  const { nostr } = useNostr();

  return useQuery<BadgeDefinition[]>({
    queryKey: ['badgeDefinitions', pubkey, limit],
    queryFn: async ({ signal }) => {
      const filter: Parameters<typeof nostr.query>[0][0] = {
        kinds: [30009],
        limit,
      };

      if (pubkey) {
        filter.authors = [pubkey];
      }

      const events = await nostr.query(
        [filter],
        { signal: AbortSignal.any([signal, AbortSignal.timeout(5000)]) },
      );

      return events.map(parseBadgeDefinition);
    },
    retry: 2,
  });
}
