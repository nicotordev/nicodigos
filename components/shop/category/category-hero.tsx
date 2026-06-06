"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CategoryNavbar } from "./category-navbar";
import type { CategoryViewModel } from "./types";

interface CategoryHeroProps {
  readonly category: CategoryViewModel;
  readonly productCount: number;
}

export function CategoryHero({ category, productCount }: CategoryHeroProps) {
  const bannerSrc = category.bannerUrl || "/images/shop/category-hero.webp";

  const handleScrollToCatalog = () => {
    const element = document.getElementById("catalog-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="relative w-full h-[60vh] min-h-[480px] max-h-[700px] flex items-center justify-center overflow-hidden">
      {/* Floating Navbar */}
      <CategoryNavbar />

      {/* Background Banner */}
      <div className="absolute inset-0 z-0">
        <Image
          src={bannerSrc}
          alt={category.name}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center scale-105 transition-transform duration-10000 ease-out"
        />
        <div className="absolute inset-0 bg-black/45 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-black/30 z-15" />
      </div>

      {/* Hero Content */}
      <div className="relative z-20 text-center max-w-3xl px-6 flex flex-col items-center gap-4 mt-16">
        <span className="text-xs md:text-sm font-semibold tracking-widest text-primary-foreground/90 uppercase bg-primary/20 backdrop-blur-md px-3 py-1 rounded-full border border-primary/30">
          {productCount} {productCount === 1 ? "Producto" : "Productos"}
        </span>
        <h1 className="font-heading text-white uppercase tracking-wider text-4xl md:text-5xl lg:text-6xl font-black drop-shadow-md">
          {category.name}
        </h1>
        {category.description && (
          <p className="text-sm md:text-base text-gray-200 line-clamp-3 max-w-xl font-light drop-shadow">
            {category.description}
          </p>
        )}
        <Button
          onClick={handleScrollToCatalog}
          className="mt-4 rounded-full bg-background/95 text-foreground hover:bg-background shadow-xl px-8 py-6 font-semibold uppercase tracking-wider text-xs transition-all hover:scale-105"
        >
          Explorar catálogo
        </Button>
      </div>

      {/* Curved Divider */}
      <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-[0] z-30 pointer-events-none">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="relative block w-full h-[45px] md:h-[60px] fill-background"
        >
          <path
            d="M0,0 C150,90 350,120 600,120 C850,120 1050,90 1200,0 L1200,120 L0,120 Z"
            className="fill-background"
          />
        </svg>
      </div>
    </header>
  );
}
