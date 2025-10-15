import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeImage } from "./BadgeImage";
import type { BadgeDefinition } from "@/hooks/useBadgeDefinition";
import { useAuthor } from "@/hooks/useAuthor";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BADGE_RARITY } from "@/lib/pow";
import { Sparkles } from "lucide-react";

interface BadgeCardProps {
  badge: BadgeDefinition;
  onClick?: () => void;
  imageSize?: "xs" | "s" | "m" | "l" | "xl" | "full";
  showIssuer?: boolean;
  showRarity?: boolean;
}

export function BadgeCard({ badge, onClick, imageSize = "l", showIssuer = true, showRarity = true }: BadgeCardProps) {
  const { data: issuer } = useAuthor(showIssuer ? badge.pubkey : undefined);
  const rarityInfo = BADGE_RARITY[badge.rarity];

  return (
    <Card
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer relative"
      onClick={onClick}
    >
      {showRarity && (
        <div className="absolute top-2 right-2 z-10">
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border-2 shadow-lg"
            style={{
              backgroundColor: `${rarityInfo.color}CC`,
              borderColor: rarityInfo.color,
              color: '#ffffff'
            }}
          >
            <Sparkles className="h-3 w-3" />
            {rarityInfo.name}
          </div>
        </div>
      )}
      <CardHeader className="p-4">
        <div className="flex items-center justify-center mb-4">
          <BadgeImage badge={badge} size={imageSize} />
        </div>
        <CardTitle className="text-center">{badge.name || badge.d}</CardTitle>
        {badge.description && (
          <CardDescription className="text-center line-clamp-2">
            {badge.description}
          </CardDescription>
        )}
      </CardHeader>
      {showIssuer && issuer?.metadata && (
        <CardContent className="p-4 pt-0">
          <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground">
            <Avatar className="w-5 h-5">
              <AvatarImage src={issuer.metadata.picture} />
              <AvatarFallback>{issuer.metadata.name?.[0] || "?"}</AvatarFallback>
            </Avatar>
            <span className="truncate">
              {issuer.metadata.name || issuer.metadata.display_name || "Anonymous"}
            </span>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
