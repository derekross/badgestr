import { type NostrEvent } from '@nostrify/nostrify';
import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';

export interface ProfileBadge {
  badgeAddress: string; // a tag: "30009:pubkey:d"
  awardEventId: string; // e tag
  relay?: string;
}

export interface ProfileBadges {
  pubkey: string;
  badges: ProfileBadge[];
  event: NostrEvent;
}

function parseProfileBadges(event: NostrEvent): ProfileBadges {
  const tags = event.tags;
  const badges: ProfileBadge[] = [];

  // Profile badges use consecutive pairs of 'a' and 'e' tags
  for (let i = 0; i < tags.length - 1; i++) {
    const currentTag = tags[i];
    const nextTag = tags[i + 1];

    if (currentTag[0] === 'a' && nextTag[0] === 'e') {
      badges.push({
        badgeAddress: currentTag[1],
        awardEventId: nextTag[1],
        relay: nextTag[2],
      });
      i++; // Skip the next tag since we've processed it
    }
  }

  return {
    pubkey: event.pubkey,
    badges,
    event,
  };
}

export function useProfileBadges(pubkey: string | undefined) {
  const { nostr } = useNostr();

  return useQuery<ProfileBadges | undefined>({
    queryKey: ['profileBadges', pubkey],
    queryFn: async ({ signal }) => {
      if (!pubkey) {
        return undefined;
      }

      const [event] = await nostr.query(
        [{ kinds: [30008], authors: [pubkey], '#d': ['profile_badges'], limit: 1 }],
        { signal: AbortSignal.any([signal, AbortSignal.timeout(3000)]) },
      );

      if (!event) {
        return undefined;
      }

      return parseProfileBadges(event);
    },
    enabled: !!pubkey,
    retry: 2,
  });
}
