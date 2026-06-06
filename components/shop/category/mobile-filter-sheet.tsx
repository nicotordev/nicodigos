"use client";

import { ReactNode } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";

interface MobileFilterSheetProps {
  readonly children: ReactNode;
}

export function MobileFilterSheet({ children }: MobileFilterSheetProps) {
  return (
    <div className="lg:hidden w-full flex items-center justify-between py-2 border-b border-border">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="w-full flex items-center gap-2 rounded-xl border-border bg-card">
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filtrar productos</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] overflow-y-auto bg-background p-6">
          <SheetHeader className="text-left pb-4">
            <SheetTitle className="text-lg font-bold tracking-tight">Filtros de Búsqueda</SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">
              Ajusta los criterios de búsqueda para encontrar tu producto ideal.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4">
            {children}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
