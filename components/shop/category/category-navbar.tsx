"use client";

import Link from "next/link";
import {
  Menu,
  Search,
  User,
  Heart,
  ShoppingBag
} from "lucide-react";
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";

export function CategoryNavbar() {
  return (
    <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 bg-transparent text-white border-b border-white/10 backdrop-blur-[2px]">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10 hover:text-white md:hidden"
          aria-label="Menú de navegación"
        >
          <Menu className="h-6 w-6" />
        </Button>
        <div className="flex items-center gap-2">
          <Logo format="svg" size="md" className="brightness-0 invert" href="/" />
        </div>
      </div>

      {/* Center Links */}
      <div className="hidden md:flex items-center gap-8 text-sm font-semibold tracking-wide uppercase">
        <Link
          href="/categories/juegos"
          className="transition-colors hover:text-primary-foreground/80 focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          Juegos
        </Link>
        <Link
          href="/categories/gift-cards"
          className="transition-colors hover:text-primary-foreground/80 focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          Gift Cards
        </Link>
        <Link
          href="/categories/software"
          className="transition-colors hover:text-primary-foreground/80 focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          Software
        </Link>
        <Link
          href="/categories/suscripciones"
          className="transition-colors hover:text-primary-foreground/80 focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          Suscripciones
        </Link>
        <Link
          href="/categories/ofertas"
          className="text-amber-400 hover:text-amber-300 transition-colors focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          Ofertas
        </Link>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10 hover:text-white"
          aria-label="Buscar productos"
        >
          <Search className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10 hover:text-white"
          aria-label="Mi cuenta"
          asChild
        >
          <Link href="/auth">

            <User className="h-5 w-5" />

          </Link>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10 hover:text-white"
          aria-label="Lista de deseos"
          asChild
        >
          <Link href="/wishlist">
            <Heart className="h-5 w-5" />
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10 hover:text-white relative"
          aria-label="Carrito de compras"
          asChild
        >
          <Link href="/cart">

            <ShoppingBag className="h-5 w-5" />

          </Link>
        </Button>
      </div>
    </nav>
  );
}
