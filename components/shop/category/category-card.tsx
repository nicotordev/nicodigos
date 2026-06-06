import Image from "next/image";
import Link from "next/link";
import { IconCategory, IconChevronRight } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import type { StorefrontCategory } from "@/lib/store/categories/queries";
import { storeRoutes } from "@/lib/store/navigation";
import { cn } from "@/lib/utils";

export const categoryCardGridClassName =
  "flex flex-col gap-2 sm:gap-3 lg:grid lg:grid-cols-3 lg:gap-6 xl:grid-cols-4";

export const categoryCardImageSizes =
  "(max-width: 1024px) 72px, (max-width: 1280px) 33vw, 25vw";

export interface CategoryCardProps {
  category: StorefrontCategory;
  className?: string;
}

function categoryImageSrc(category: StorefrontCategory) {
  return category.bannerUrl ?? category.imageUrl ?? null;
}

function categoryDescription(category: StorefrontCategory) {
  if (category.description) {
    return category.description
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  return `Explora juegos digitales, gift cards y licencias para ${category.name.toLowerCase()}.`;
}

function productCountLabel(count: number) {
  return `${count} ${count === 1 ? "Producto" : "Productos"}`;
}

function CategoryCardTile({ category, className }: CategoryCardProps) {
  const imageSrc = categoryImageSrc(category);
  const description = categoryDescription(category);

  return (
    <Link
      href={storeRoutes.category(category.slug)}
      className={cn(
        "group flex min-h-11 items-center gap-3 rounded-xl border border-border/60 bg-card px-3 py-3 ring-1 ring-border/40 transition-colors duration-200 hover:border-primary/30 hover:bg-muted/30 active:scale-[0.98] motion-reduce:active:scale-100 sm:gap-4 sm:px-4 lg:hidden",
        className,
      )}
    >
      <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted sm:size-16">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={category.name}
            fill
            unoptimized
            sizes="72px"
            className="object-cover object-center"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 via-muted to-indigo-500/10">
            <IconCategory className="size-6 text-primary/35" aria-hidden />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="font-heading text-sm font-semibold leading-snug text-foreground line-clamp-1 group-hover:text-primary transition-colors duration-200">
          {category.name}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {description}
        </p>
        <p className="text-[11px] font-semibold text-primary">
          {productCountLabel(category.productCount)}
        </p>
      </div>

      <IconChevronRight
        className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary"
        aria-hidden
      />
    </Link>
  );
}

function CategoryCardGrid({ category, className }: CategoryCardProps) {
  const imageSrc = categoryImageSrc(category);
  const description = categoryDescription(category);

  return (
    <Link
      href={storeRoutes.category(category.slug)}
      className={cn("group hidden h-full lg:block", className)}
    >
      <Card className="glass-card glass-card-hover h-full overflow-hidden rounded-2xl border-border bg-card pt-0! flex flex-col">
        <CardHeader className="relative aspect-4/3 overflow-hidden bg-muted p-0! xl:aspect-[5/4]">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={category.name}
              fill
              unoptimized
              sizes={categoryCardImageSizes}
              className="object-cover object-center opacity-85 transition-transform duration-300 ease-out motion-safe:group-hover:scale-105 motion-safe:group-hover:opacity-100"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 via-muted to-indigo-500/10">
              <IconCategory className="size-12 text-primary/30" aria-hidden />
            </div>
          )}

          <div className="absolute inset-0 bg-black/30 opacity-0 transition-opacity duration-300 motion-safe:group-hover:opacity-100" />

          <div className="absolute top-3 left-3 z-10">
            <Badge className="rounded-md border-none bg-primary px-2 py-0.5 text-[10px] font-bold tracking-wider text-primary-foreground uppercase shadow-sm hover:bg-primary/90">
              {productCountLabel(category.productCount)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col justify-between gap-3 py-4 xl:gap-4 xl:py-5">
          <div className="space-y-1.5">
            <CardTitle>
              <span className="font-heading text-sm leading-tight font-bold text-foreground uppercase transition-colors duration-200 line-clamp-1 group-hover:text-primary xl:text-base">
                {category.name}
              </span>
            </CardTitle>
            <CardDescription>
              <span
                className={cn(
                  "text-xs leading-relaxed line-clamp-2 xl:line-clamp-3",
                  !category.description && "italic",
                )}
              >
                {description}
              </span>
            </CardDescription>
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t border-border/40 pt-2 text-xs font-semibold text-primary xl:pt-3">
          <span>Ver catálogo</span>
          <IconChevronRight className="size-4 text-primary transition-transform duration-200 motion-safe:group-hover:translate-x-0.5" />
        </CardFooter>
      </Card>
    </Link>
  );
}

export default function CategoryCard({
  category,
  className,
}: CategoryCardProps) {
  return (
    <>
      <CategoryCardTile category={category} className={className} />
      <CategoryCardGrid category={category} className={className} />
    </>
  );
}
