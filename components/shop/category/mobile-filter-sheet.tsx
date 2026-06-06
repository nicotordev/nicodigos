"use client";

import { ReactNode } from "react";
import { IconAdjustmentsHorizontal } from "@tabler/icons-react";
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
    <div className="flex w-full items-center justify-between border-b border-border py-2 md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="flex min-h-11 w-full items-center gap-2 rounded-xl border-border bg-card"
          >
            <IconAdjustmentsHorizontal className="size-4" aria-hidden />
            <span>Filtrar productos</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          side="bottom"
          className="max-h-[85vh] overflow-y-auto rounded-t-2xl bg-background px-4 pb-8 pt-6"
        >
          <SheetHeader className="pb-4 text-left">
            <SheetTitle className="text-lg font-bold tracking-tight">
              Filtros de búsqueda
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">
              Ajusta los criterios para encontrar tu producto ideal.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-2">{children}</div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
