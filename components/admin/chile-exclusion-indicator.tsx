"use client";

import { IconX } from "@tabler/icons-react";
import { isCountryExcluded } from "@/lib/admin/products/country-limitations";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ChileExclusionProps = {
  countryLimitations: string[];
  variant?: "icon" | "badge";
  tooltipSide?: "top" | "right" | "bottom" | "left";
};

function ChileExclusionTooltipContent({
  excludedList,
}: {
  excludedList: string;
}) {
  return (
    <>
      <p className="font-medium">Chile (CL) excluido</p>
      <p className="mt-1 text-background/80">
        Este producto no está disponible para clientes en Chile según Kinguin.
        No debería publicarse en una tienda exclusiva de Chile.
      </p>
      {excludedList ? (
        <p className="mt-1 text-background/80">
          Países excluidos: {excludedList}
        </p>
      ) : null}
    </>
  );
}

export function ChileExclusionIndicator({
  countryLimitations,
  variant = "icon",
  tooltipSide = "left",
}: ChileExclusionProps) {
  if (!isCountryExcluded(countryLimitations, "CL")) {
    return null;
  }

  const excludedList = countryLimitations.join(", ");

  if (variant === "badge") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className="cursor-help gap-1 border-destructive/30 text-destructive"
          >
            <IconX className="size-3" stroke={2.5} />
            CL excluido
          </Badge>
        </TooltipTrigger>
        <TooltipContent
          side={tooltipSide}
          className="max-w-xs flex-col items-start gap-0 py-2"
        >
          <ChileExclusionTooltipContent excludedList={excludedList} />
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className="inline-flex size-8 shrink-0 cursor-help items-center justify-center rounded-full bg-destructive/10 text-destructive"
          aria-label="Chile excluido"
        >
          <IconX className="size-4" stroke={2.5} />
        </span>
      </TooltipTrigger>
      <TooltipContent
        side={tooltipSide}
        className="max-w-xs flex-col items-start gap-0 py-2"
      >
        <ChileExclusionTooltipContent excludedList={excludedList} />
      </TooltipContent>
    </Tooltip>
  );
}
