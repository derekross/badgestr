import { useSeoMeta } from '@unhead/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useBadgeAwards } from '@/hooks/useBadgeAwards';
import { useProfileBadges } from '@/hooks/useProfileBadges';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useToast } from '@/hooks/useToast';
import { BadgeAwardCard } from '@/components/badges/BadgeAwardCard';
import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

const MyBadges = () => {
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const publish = useNostrPublish();

  const { data: awards, isLoading: awardsLoading } = useBadgeAwards({
    awardedTo: user?.pubkey,
  });
  const { data: profileBadges, refetch } = useProfileBadges(user?.pubkey);

  const [selectedAwards, setSelectedAwards] = useState<Set<string>>(new Set());

  useSeoMeta({
    title: 'My Badges - Badgestr',
    description: 'Manage your Nostr badges and profile badges',
  });

  const handleToggleAward = (awardId: string) => {
    setSelectedAwards((prev) => {
      const next = new Set(prev);
      if (next.has(awardId)) {
        next.delete(awardId);
      } else {
        next.add(awardId);
      }
      return next;
    });
  };

  const handleSaveProfileBadges = async () => {
    if (!user) return;

    const selectedAwardsList = Array.from(selectedAwards);
    const tags: string[][] = [['d', 'profile_badges']];

    // Add consecutive pairs of 'a' and 'e' tags for each badge
    selectedAwardsList.forEach((awardId) => {
      const award = awards?.find((a) => a.id === awardId);
      if (award) {
        tags.push(['a', award.badgeAddress]);
        tags.push(['e', award.id]);
      }
    });

    try {
      await publish.mutateAsync({
        kind: 30008,
        content: '',
        tags,
      });

      toast({
        title: 'Profile Updated',
        description: 'Your profile badges have been updated successfully!',
      });

      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to update profile badges: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  };

  // Initialize selected awards from profile badges
  useState(() => {
    if (profileBadges?.badges) {
      const ids = new Set(profileBadges.badges.map((b) => b.awardEventId));
      setSelectedAwards(ids);
    }
  });

  if (!user) {
    return (
      <div className="container max-w-4xl mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Login Required</CardTitle>
            <CardDescription>
              You need to be logged in to view your badges.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (awardsLoading) {
    return (
      <div className="container max-w-4xl mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Badges</CardTitle>
          <CardDescription>
            Manage your awarded badges and choose which ones to display on your profile
          </CardDescription>
        </CardHeader>
      </Card>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>How to manage your badges</AlertTitle>
        <AlertDescription>
          Select the badges you want to display on your Nostr profile, then click "Save Profile Badges".
          The order of selection determines the display order.
        </AlertDescription>
      </Alert>

      {!awards || awards.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              You haven't been awarded any badges yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {awards.map((award) => (
              <div key={award.id} className="relative">
                <div className="absolute top-2 left-2 z-10">
                  <Checkbox
                    checked={selectedAwards.has(award.id)}
                    onCheckedChange={() => handleToggleAward(award.id)}
                    className="bg-white dark:bg-gray-800 border-2"
                  />
                </div>
                <BadgeAwardCard award={award} />
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleSaveProfileBadges}
              disabled={publish.isPending}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all"
            >
              {publish.isPending ? 'Saving...' : 'Save Profile Badges'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default MyBadges;
