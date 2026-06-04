"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { IconPlayerPlay } from "@tabler/icons-react";

import type { StorefrontProductImage } from "@/lib/store/products/queries";
import { youtubeEmbedUrl, youtubeThumbnailUrl } from "@/lib/youtube";
import { cn } from "@/lib/utils";

export type ProductGalleryVideo = {
  id: string;
  youtubeVideoId: string;
  title: string | null;
};

type GallerySelection = { type: "video" } | { type: "image"; id: string };

type ProductGalleryProps = {
  name: string;
  coverImageUrl: string | null;
  images: StorefrontProductImage[];
  primaryVideo?: ProductGalleryVideo | null;
  /** Portada grande tipo Tailwind UI Product Overview. */
  layout?: "default" | "overview";
  className?: string;
};

function buildGalleryImages(
  coverImageUrl: string | null,
  images: StorefrontProductImage[],
): StorefrontProductImage[] {
  if (images.length > 0) {
    return images;
  }

  if (!coverImageUrl) {
    return [];
  }

  return [
    {
      id: "cover",
      url: coverImageUrl,
      thumbnailUrl: coverImageUrl,
      isCover: true,
    },
  ];
}

export function ProductGallery({
  name,
  coverImageUrl,
  images,
  primaryVideo = null,
  layout = "default",
  className,
}: ProductGalleryProps) {
  const isOverview = layout === "overview";
  const galleryImages = useMemo(
    () => buildGalleryImages(coverImageUrl, images),
    [coverImageUrl, images],
  );

  const defaultImageId =
    galleryImages.find((image) => image.isCover)?.id ?? galleryImages[0]?.id;

  const [selection, setSelection] = useState<GallerySelection>(() =>
    primaryVideo
      ? { type: "video" }
      : defaultImageId
        ? { type: "image", id: defaultImageId }
        : { type: "video" },
  );

  const selectedImage =
    selection.type === "image"
      ? (galleryImages.find((image) => image.id === selection.id) ??
        galleryImages[0])
      : galleryImages[0];

  const showThumbnails = primaryVideo != null || galleryImages.length > 1;

  const mainFrameClass = cn(
    "relative overflow-hidden border border-border bg-muted",
    isOverview ? "rounded-lg" : "rounded-2xl shadow-sm",
    selection.type === "video"
      ? "aspect-video"
      : isOverview
        ? "aspect-4/3"
        : "aspect-16/10",
  );

  if (!primaryVideo && !selectedImage) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 text-sm text-muted-foreground",
          isOverview ? "aspect-4/3" : "aspect-16/10 rounded-2xl",
          className,
        )}
      >
        Sin imagen
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className={mainFrameClass}>
        {selection.type === "video" && primaryVideo ? (
          <iframe
            title={primaryVideo.title ?? `Tráiler de ${name}`}
            src={youtubeEmbedUrl(primaryVideo.youtubeVideoId)}
            className="absolute inset-0 h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : selectedImage ? (
          <Image
            src={selectedImage.url}
            alt={name}
            fill
            unoptimized
            priority
            sizes="(max-width: 1024px) 100vw, 560px"
            className="object-cover"
          />
        ) : null}
      </div>

      {primaryVideo?.title && selection.type === "video" ? (
        <p className="text-sm font-medium text-muted-foreground">
          {primaryVideo.title}
        </p>
      ) : null}

      {showThumbnails ? (
        <ul className="flex gap-2 overflow-x-auto pb-1">
          {primaryVideo ? (
            <li className="shrink-0">
              <button
                type="button"
                onClick={() => setSelection({ type: "video" })}
                className={cn(
                  "relative size-16 overflow-hidden rounded-xl border bg-muted transition-colors",
                  selection.type === "video"
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-border/80 hover:border-primary/40",
                )}
                aria-label="Ver tráiler"
                aria-pressed={selection.type === "video"}
              >
                <Image
                  src={youtubeThumbnailUrl(primaryVideo.youtubeVideoId)}
                  alt=""
                  fill
                  unoptimized
                  sizes="64px"
                  className="object-cover"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-black/35">
                  <IconPlayerPlay
                    className="size-6 text-white drop-shadow"
                    aria-hidden
                  />
                </span>
              </button>
            </li>
          ) : null}

          {galleryImages.map((image) => {
            const isSelected =
              selection.type === "image" && selection.id === image.id;
            const thumb = image.thumbnailUrl ?? image.url;

            return (
              <li key={image.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setSelection({ type: "image", id: image.id })}
                  className={cn(
                    "relative size-16 overflow-hidden rounded-xl border bg-muted transition-colors",
                    isSelected
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-border/80 hover:border-primary/40",
                  )}
                  aria-label={`Ver imagen ${image.id}`}
                  aria-pressed={isSelected}
                >
                  <Image
                    src={thumb}
                    alt=""
                    fill
                    unoptimized
                    sizes="64px"
                    className="object-cover"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
