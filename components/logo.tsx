import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** Intrinsic aspect ratio of logo assets in /public (2:1). */
const LOGO_WIDTH = 142;
const LOGO_HEIGHT = 71;

const sizeClasses = {
  sm: "h-6",
  md: "h-8",
  lg: "h-10",
} as const;

const logoSrc = {
  svg: "/logo.svg",
  png: "/logo.png",
  webp: "/logo.webp",
} as const;

export type LogoFormat = keyof typeof logoSrc | "auto";

export type LogoProps = {
  className?: string;
  href?: string;
  size?: keyof typeof sizeClasses;
  priority?: boolean;
  /**
   * `svg` | `png` | `webp` pick a single asset.
   * `auto` serves WebP with PNG fallback via `<picture>`.
   */
  format?: LogoFormat;
};

function LogoPicture({
  className,
  size,
  priority,
}: {
  className?: string;
  size: keyof typeof sizeClasses;
  priority?: boolean;
}) {
  return (
    <picture
      className={cn("inline-flex shrink-0", sizeClasses[size], className)}
    >
      <source srcSet={logoSrc.webp} type="image/webp" />
      <img
        src={logoSrc.png}
        alt="Nicodigos"
        width={LOGO_WIDTH}
        height={LOGO_HEIGHT}
        fetchPriority={priority ? "high" : undefined}
        className="h-full w-auto"
      />
    </picture>
  );
}

export function Logo({
  className,
  href,
  size = "md",
  priority = false,
  format = "svg",
}: LogoProps) {
  const content =
    format === "auto" ? (
      <LogoPicture className={className} size={size} priority={priority} />
    ) : (
      <Image
        src={logoSrc[format]}
        alt="Nicodigos"
        width={LOGO_WIDTH}
        height={LOGO_HEIGHT}
        priority={priority}
        className={cn("w-auto", sizeClasses[size], className)}
      />
    );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex shrink-0 focus-visible:outline-none"
      >
        {content}
      </Link>
    );
  }

  return content;
}

export default Logo;
