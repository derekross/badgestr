import { useSeoMeta } from '@unhead/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBadgeDefinitions } from '@/hooks/useBadgeDefinitions';
import { BadgeCard } from '@/components/badges/BadgeCard';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BadgeImage } from '@/components/badges/BadgeImage';
import type { BadgeDefinition } from '@/hooks/useBadgeDefinition';
import { useAuthor } from '@/hooks/useAuthor';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useBadgeAwards } from '@/hooks/useBadgeAwards';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNavigate } from 'react-router-dom';
import { nip19 } from 'nostr-tools';

// Component to display a recipient with avatar and name
const RecipientDisplay = ({ pubkey }: { pubkey: string }) => {
  const { data: author } = useAuthor(pubkey);

  return (
    <a
      href={`https://njump.me/${nip19.npubEncode(pubkey)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 p-2 rounded hover:bg-muted transition-colors"
    >
      <Avatar className="h-8 w-8">
        <AvatarImage src={author?.metadata?.picture} />
        <AvatarFallback>{author?.metadata?.name?.[0] || "?"}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">
          {author?.metadata?.name || author?.metadata?.display_name || "Anonymous"}
        </p>
        <p className="text-xs text-muted-foreground font-mono truncate">
          {(() => {
            const npub = nip19.npubEncode(pubkey);
            return `${npub.slice(0, 12)}...${npub.slice(-8)}`;
          })()}
        </p>
      </div>
    </a>
  );
};

const BadgeGallery = () => {
  const { data: badges, isLoading } = useBadgeDefinitions(undefined, 100);
  const [selectedBadge, setSelectedBadge] = useState<BadgeDefinition | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useCurrentUser();
  const navigate = useNavigate();

  const { data: issuer } = useAuthor(selectedBadge?.pubkey);
  const { data: awards } = useBadgeAwards({
    badgeAddress: selectedBadge ? `30009:${selectedBadge.pubkey}:${selectedBadge.d}` : undefined,
  });

  useSeoMeta({
    title: 'Badge Gallery - Badgestr',
    description: 'Browse all Nostr badges',
  });

  const filteredBadges = badges?.filter((badge) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      badge.name?.toLowerCase().includes(query) ||
      badge.d.toLowerCase().includes(query) ||
      badge.description?.toLowerCase().includes(query)
    );
  });

  return (
    <>
      <div className="container max-w-6xl mx-auto p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Badge Gallery</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search badges..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">Loading badges...</p>
            </CardContent>
          </Card>
        ) : !filteredBadges || filteredBadges.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">
                {searchQuery ? 'No badges found matching your search.' : 'No badges found.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredBadges.map((badge) => (
              <BadgeCard
                key={badge.id}
                badge={badge}
                onClick={() => setSelectedBadge(badge)}
              />
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!selectedBadge} onOpenChange={() => setSelectedBadge(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedBadge?.name || selectedBadge?.d}</DialogTitle>
            <DialogDescription>Badge Details</DialogDescription>
          </DialogHeader>

          {selectedBadge && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="awards">
                  Awards {awards && `(${awards.length})`}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <div className="flex justify-center">
                  <BadgeImage badge={selectedBadge} size="full" />
                </div>

                <div className="space-y-2">
                  <div>
                    <h4 className="font-semibold">ID</h4>
                    <p className="text-sm text-muted-foreground font-mono">{selectedBadge.d}</p>
                  </div>

                  {selectedBadge.description && (
                    <div>
                      <h4 className="font-semibold">Description</h4>
                      <p className="text-sm text-muted-foreground">{selectedBadge.description}</p>
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold mb-1">Issuer</h4>
                    <a
                      href={`https://njump.me/${nip19.npubEncode(selectedBadge.pubkey)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 rounded hover:bg-muted transition-colors"
                    >
                      <Avatar>
                        <AvatarImage src={issuer?.metadata?.picture} />
                        <AvatarFallback>{issuer?.metadata?.name?.[0] || "?"}</AvatarFallback>
                      </Avatar>
                      <p className="font-medium">
                        {issuer?.metadata?.name || issuer?.metadata?.display_name || "Anonymous"}
                      </p>
                    </a>
                  </div>

                  <div>
                    <h4 className="font-semibold">Badge Address</h4>
                    <a
                      href={`https://njump.me/${nip19.naddrEncode({
                        kind: 30009,
                        pubkey: selectedBadge.pubkey,
                        identifier: selectedBadge.d,
                      })}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline font-mono break-all"
                    >
                      {nip19.naddrEncode({
                        kind: 30009,
                        pubkey: selectedBadge.pubkey,
                        identifier: selectedBadge.d,
                      })}
                    </a>
                  </div>

                  {user?.pubkey === selectedBadge.pubkey && (
                    <div className="pt-4 border-t">
                      <Button
                        onClick={() => {
                          navigate(`/badges/edit?pubkey=${selectedBadge.pubkey}&d=${selectedBadge.d}`);
                          setSelectedBadge(null);
                        }}
                        className="w-full"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit This Badge
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="awards" className="space-y-4">
                {!awards || awards.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    This badge has not been awarded yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      This badge has been awarded {awards.length} {awards.length === 1 ? 'time' : 'times'}
                    </p>
                    {awards.map((award) => (
                      <Card key={award.id}>
                        <CardContent className="p-4">
                          <p className="text-sm font-medium mb-3">
                            Awarded to {award.awardedTo.length} {award.awardedTo.length === 1 ? 'person' : 'people'}
                          </p>
                          <div className="space-y-1">
                            {award.awardedTo.map((recipient, i) => (
                              <RecipientDisplay key={i} pubkey={recipient.pubkey} />
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BadgeGallery;
