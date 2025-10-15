import { useSeoMeta } from '@unhead/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useBadgeDefinitions } from '@/hooks/useBadgeDefinitions';
import { BadgeCard } from '@/components/badges/BadgeCard';
import { Button } from '@/components/ui/button';
import { Edit, Award, Trash2, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useToast } from '@/hooks/useToast';
import { nip19 } from 'nostr-tools';
import type { BadgeDefinition } from '@/hooks/useBadgeDefinition';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const ManageBadges = () => {
  const { user } = useCurrentUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const publish = useNostrPublish();
  const { data: myBadges, isLoading, refetch } = useBadgeDefinitions(user?.pubkey);
  const [awardDialogBadge, setAwardDialogBadge] = useState<BadgeDefinition | null>(null);
  const [deleteDialogBadge, setDeleteDialogBadge] = useState<BadgeDefinition | null>(null);
  const [recipientInput, setRecipientInput] = useState('');

  useSeoMeta({
    title: 'Manage Badges - Badgestr',
    description: 'Manage your created badges',
  });

  const handleAward = async () => {
    if (!awardDialogBadge) return;

    // Parse pubkeys/npubs (one per line or comma-separated)
    const inputs = recipientInput
      .split(/[\n,]/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    if (inputs.length === 0) {
      toast({
        title: 'Error',
        description: 'Please enter at least one valid pubkey or npub',
        variant: 'destructive',
      });
      return;
    }

    // Convert npubs to hex pubkeys
    const pubkeys: string[] = [];
    const errors: string[] = [];

    for (const input of inputs) {
      try {
        // Check if it's an npub
        if (input.startsWith('npub1')) {
          const decoded = nip19.decode(input);
          if (decoded.type === 'npub') {
            pubkeys.push(decoded.data);
          } else {
            errors.push(`Invalid npub format: ${input.slice(0, 20)}...`);
          }
        } else if (input.match(/^[0-9a-f]{64}$/i)) {
          // It's already a hex pubkey
          pubkeys.push(input.toLowerCase());
        } else {
          errors.push(`Invalid format (not npub or hex): ${input.slice(0, 20)}...`);
        }
      } catch {
        errors.push(`Failed to decode: ${input.slice(0, 20)}...`);
      }
    }

    if (errors.length > 0) {
      toast({
        title: 'Invalid Entries',
        description: `${errors.length} invalid entries found. ${errors[0]}`,
        variant: 'destructive',
      });
      return;
    }

    if (pubkeys.length === 0) {
      toast({
        title: 'Error',
        description: 'No valid pubkeys found',
        variant: 'destructive',
      });
      return;
    }

    const badgeAddress = `30009:${awardDialogBadge.pubkey}:${awardDialogBadge.d}`;
    const tags: string[][] = [['a', badgeAddress]];

    // Add p tags for each recipient
    pubkeys.forEach((pubkey) => {
      tags.push(['p', pubkey]);
    });

    try {
      await publish.mutateAsync({
        kind: 8,
        content: '',
        tags,
      });

      toast({
        title: 'Badge Awarded',
        description: `Successfully awarded badge to ${pubkeys.length} ${pubkeys.length === 1 ? 'person' : 'people'}!`,
      });

      setRecipientInput('');
      setAwardDialogBadge(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to award badge: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteDialogBadge) return;

    try {
      // Publish a deletion event (kind 5)
      await publish.mutateAsync({
        kind: 5,
        content: 'Badge deleted',
        tags: [['a', `30009:${deleteDialogBadge.pubkey}:${deleteDialogBadge.d}`]],
      });

      toast({
        title: 'Badge Deleted',
        description: 'Your badge has been deleted',
      });

      setDeleteDialogBadge(null);
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to delete badge: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  };

  if (!user) {
    return (
      <div className="container max-w-4xl mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Login Required</CardTitle>
            <CardDescription>
              You need to be logged in to manage badges.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="container max-w-6xl mx-auto p-4 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Manage Badges</CardTitle>
                <CardDescription>
                  View, edit, award, or delete your created badges
                </CardDescription>
              </div>
              <Button
                onClick={() => navigate('/badges/create')}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create New Badge
              </Button>
            </div>
          </CardHeader>
        </Card>

        {isLoading ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">Loading your badges...</p>
            </CardContent>
          </Card>
        ) : !myBadges || myBadges.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center space-y-4">
              <p className="text-muted-foreground">
                You haven't created any badges yet.
              </p>
              <Button
                onClick={() => navigate('/badges/create')}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Badge
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myBadges.map((badge) => (
              <Card key={badge.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="p-4">
                  <BadgeCard badge={badge} showIssuer={false} />
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-2">
                  <Button
                    onClick={() => setAwardDialogBadge(badge)}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all"
                  >
                    <Award className="mr-2 h-4 w-4" />
                    Award
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => navigate(`/badges/edit?pubkey=${badge.pubkey}&d=${badge.d}`)}
                      className="flex-1"
                      variant="outline"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => setDeleteDialogBadge(badge)}
                      className="flex-1"
                      variant="outline"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Award Dialog */}
      <Dialog open={!!awardDialogBadge} onOpenChange={() => setAwardDialogBadge(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Award Badge</DialogTitle>
            <DialogDescription>
              Award "{awardDialogBadge?.name || awardDialogBadge?.d}" to users
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {awardDialogBadge && (
              <div className="flex justify-center">
                <div className="w-48">
                  <BadgeCard badge={awardDialogBadge} showIssuer={false} imageSize="m" />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Recipient Pubkeys or Npubs</Label>
              <Textarea
                placeholder="npub1... or hex pubkey (one per line or comma-separated)"
                className="min-h-[150px]"
                value={recipientInput}
                onChange={(e) => setRecipientInput(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter npubs (npub1...) or hex pubkeys. Both formats are supported and can be mixed.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setAwardDialogBadge(null)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAward}
                disabled={publish.isPending || !recipientInput.trim()}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all"
              >
                {publish.isPending ? 'Awarding...' : 'Award Badge'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteDialogBadge} onOpenChange={() => setDeleteDialogBadge(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Badge?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteDialogBadge?.name || deleteDialogBadge?.d}"?
              This will publish a deletion event. Previously awarded badges will remain, but the badge definition will be marked as deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ManageBadges;
