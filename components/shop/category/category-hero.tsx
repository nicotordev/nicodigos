"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CategoryTrustBadges } from "./category-trust-badges";
import type { CategoryViewModel } from "./types";

interface CategoryHeroProps {
  readonly category: CategoryViewModel;
  readonly productCount: number;
}

function plainDescription(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function CategoryHero({ category, productCount }: CategoryHeroProps) {
  const bannerSrc = category.bannerUrl || "/images/shop/category-hero.webp";
  const productCountLabel = `${productCount} ${
    productCount === 1 ? "Producto" : "Productos"
  }`;

  const handleScrollToCatalog = () => {
    const element = document.getElementById("catalog-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Compact header — mobile / tablet */}
      <header className="border-b border-border/80 bg-background px-4 pb-5 pt-6 sm:px-6 lg:hidden">
        <div className="mx-auto w-full max-w-7xl space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            {productCountLabel}
          </p>
          <h1 className="font-heading text-xl font-semibold text-foreground sm:text-2xl">
            {category.name}
          </h1>
          {category.description ? (
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground line-clamp-2">
              {plainDescription(category.description)}
            </p>
          ) : null}
          <CategoryTrustBadges className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none sm:mx-0 sm:px-0" />
        </div>
      </header>

      {/* Cinematic hero — desktop */}
      <header className="relative hidden h-[60vh] max-h-[700px] min-h-[480px] w-full items-center justify-center overflow-hidden lg:flex">
        <div className="absolute inset-0 z-0">
          <Image
            src={bannerSrc}
            alt={category.name}
            fill
            priority
            sizes="100vw"
            className="scale-105 object-cover object-center transition-transform duration-10000 ease-out"
          />
          <div className="absolute inset-0 z-10 bg-black/45" />
          <div className="absolute inset-0 z-15 bg-gradient-to-t from-background/90 via-transparent to-black/30" />
        </div>

        <div className="relative z-20 mt-16 flex max-w-3xl flex-col items-center gap-4 px-6 text-center">
          <span className="rounded-full border border-primary/30 bg-primary/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary-foreground/90 backdrop-blur-md md:text-sm">
            {productCountLabel}
          </span>
          <h1 className="font-heading text-4xl font-black uppercase tracking-wider text-white drop-shadow-md md:text-5xl lg:text-6xl">
            {category.name}
          </h1>
          {category.description ? (
            <div
              className="prose prose-invert prose-p:my-0 max-w-xl text-sm font-light text-gray-200 drop-shadow line-clamp-3 md:text-base"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: trusted input from admin panel
              dangerouslySetInnerHTML={{ __html: category.description }}
            />
          ) : null}
          <Button
            onClick={handleScrollToCatalog}
            className="mt-4 rounded-full bg-background/95 px-8 py-6 text-xs font-semibold uppercase tracking-wider text-foreground shadow-xl transition-all hover:scale-105 hover:bg-background"
          >
            Explorar catálogo
          </Button>
        </div>

        <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-30 w-full overflow-hidden leading-0">
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="relative block h-[60px] w-full fill-background"
          >
            <path
              d="M0,0 C150,90 350,120 600,120 C850,120 1050,90 1200,0 L1200,120 L0,120 Z"
              className="fill-background"
            />
          </svg>
        </div>
      </header>
    </>
  );
}
