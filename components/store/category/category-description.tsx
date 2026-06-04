"use client";

import { useState } from "react";
import { IconChevronDown } from "@tabler/icons-react";

import { cn } from "@/lib/utils";

type CategoryDescriptionProps = {
  html: string;
  className?: string;
};

export function CategoryDescription({
  html,
  className,
}: CategoryDescriptionProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/50 bg-muted/10 overflow-hidden",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left text-sm font-semibold text-foreground hover:bg-muted/20 transition-colors"
        aria-expanded={open}
      >
        Sobre esta categoría
        <IconChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>
      {open ? (
        <div
          className="product-description border-t border-border/40 px-5 pb-5 pt-4 text-sm leading-relaxed text-muted-foreground/90 [&_h2]:mb-2.5 [&_h2]:mt-5 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-foreground [&_li]:mb-1.5 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : null}
    </div>
  );
}
