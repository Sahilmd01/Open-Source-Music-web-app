import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { getInitials } from "@/lib/format";

interface CoverArtProps {
  hue: number;
  className?: string;
  /** Renders initials, used for artist avatars. */
  initials?: string;
  size?: number;
  rounded?: "md" | "full";
  src?: string;
  style?: CSSProperties;
}

/** Artwork generated from image or hue fallback. */
export function CoverArt({ hue, className, initials, size, rounded = "md", src, style: customStyle }: CoverArtProps) {
  const style: CSSProperties = {
    background: src ? `url(${src}) center/cover no-repeat` : `linear-gradient(145deg, hsl(${hue} 55% 58%), hsl(${(hue + 40) % 360} 60% 30%))`,
    ...(size ? { width: size, height: size } : null),
    ...customStyle,
  };
  return (
    <div className={cn("cover", rounded === "full" && "cover--round", className)} style={style} aria-hidden="true" suppressHydrationWarning>
      {!src && initials ? <span>{getInitials(initials)}</span> : null}
    </div>
  );
}

