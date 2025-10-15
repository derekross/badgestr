import { type NostrEvent } from '@nostrify/nostrify';
import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { countLeadingZeroes, getRarityByDifficulty, type BadgeRarity } from '@/lib/pow';

export interface BadgeDefinition {
  id: string;
  pubkey: string;
  d: string;
  name?: string;
  description?: string;
  image?: string;
  imageDimensions?: string;
  thumbs: Array<{ url: string; dimensions?: string }>;
  difficulty: number;
  rarity: BadgeRarity;
  event: NostrEvent;
}

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

export function useBadgeDefinition(pubkey: string | undefined, dTag: string | undefined) {
  const { nostr } = useNostr();

  return useQuery<BadgeDefinition | undefined>({
    queryKey: ['badgeDefinition', pubkey, dTag],
    queryFn: async ({ signal }) => {
      if (!pubkey || !dTag) {
        return undefined;
      }

      const [event] = await nostr.query(
        [{ kinds: [30009], authors: [pubkey], '#d': [dTag], limit: 1 }],
        { signal: AbortSignal.any([signal, AbortSignal.timeout(3000)]) },
      );

      if (!event) {
        return undefined;
      }

      return parseBadgeDefinition(event);
    },
    enabled: !!pubkey && !!dTag,
    retry: 2,
  });
}
