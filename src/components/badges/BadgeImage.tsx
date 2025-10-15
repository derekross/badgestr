import * as React from "react";
import { cn } from "@/lib/utils";
import type { BadgeDefinition } from "@/hooks/useBadgeDefinition";

interface BadgeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  badge: BadgeDefinition;
  size?: "xs" | "s" | "m" | "l" | "xl" | "full";
}

const sizeMap = {
  xs: "16x16",
  s: "32x32",
  m: "64x64",
  l: "256x256",
  xl: "512x512",
  full: "1024x1024",
};

const sizeClasses = {
  xs: "w-4 h-4",
  s: "w-8 h-8",
  m: "w-16 h-16",
  l: "w-64 h-64",
  xl: "w-[512px] h-[512px]",
  full: "w-full h-full max-w-[1024px] max-h-[1024px]",
};

export function BadgeImage({ badge, size = "m", className, ...props }: BadgeImageProps) {
  const [imgSrc, setImgSrc] = React.useState<string | undefined>();

  React.useEffect(() => {
    if (size === "full" && badge.image) {
      setImgSrc(badge.image);
      return;
    }

    const targetDimensions = sizeMap[size];

    // Try to find a matching thumbnail
    const matchingThumb = badge.thumbs.find(
      (thumb) => thumb.dimensions === targetDimensions
    );

    if (matchingThumb) {
      setImgSrc(matchingThumb.url);
    } else if (badge.thumbs.length > 0) {
      // Fall back to first available thumbnail
      setImgSrc(badge.thumbs[0].url);
    } else if (badge.image) {
      // Fall back to main image
      setImgSrc(badge.image);
    }
  }, [badge, size]);

  if (!imgSrc) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-lg bg-muted text-muted-foreground",
          sizeClasses[size],
          className
        )}
      >
        <span className="text-xs">No Image</span>
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={badge.name || badge.d}
      className={cn("rounded-lg object-cover", sizeClasses[size], className)}
      {...props}
    />
  );
}
