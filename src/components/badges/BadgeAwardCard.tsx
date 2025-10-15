import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BadgeImage } from "./BadgeImage";
import type { BadgeAward } from "@/hooks/useBadgeAwards";
import { useBadgeDefinition } from "@/hooks/useBadgeDefinition";
import { useAuthor } from "@/hooks/useAuthor";

interface BadgeAwardCardProps {
  award: BadgeAward;
  onClick?: () => void;
}

export function BadgeAwardCard({ award, onClick }: BadgeAwardCardProps) {
  // Parse badge address (format: "30009:pubkey:d")
  const parts = award.badgeAddress.split(":");
  const badgePubkey = parts[1];
  const badgeD = parts[2];

  const { data: badgeDefinition } = useBadgeDefinition(badgePubkey, badgeD);
  const { data: issuer } = useAuthor(award.pubkey);

  return (
    <Card
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="p-4">
        <div className="flex items-center justify-center mb-4">
          {badgeDefinition ? (
            <BadgeImage badge={badgeDefinition} size="m" />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-muted animate-pulse" />
          )}
        </div>
        <CardTitle className="text-center text-base">
          {badgeDefinition?.name || badgeD || "Loading..."}
        </CardTitle>
        {issuer?.metadata && (
          <CardDescription className="text-center">
            <div className="flex items-center gap-2 justify-center">
              <Avatar className="w-4 h-4">
                <AvatarImage src={issuer.metadata.picture} />
                <AvatarFallback>{issuer.metadata.name?.[0] || "?"}</AvatarFallback>
              </Avatar>
              <span className="text-xs">
                Awarded by {issuer.metadata.name || issuer.metadata.display_name || "Anonymous"}
              </span>
            </div>
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="text-xs text-muted-foreground">
          <p>Awarded to {award.awardedTo.length} {award.awardedTo.length === 1 ? "person" : "people"}</p>
        </div>
      </CardContent>
    </Card>
  );
}
