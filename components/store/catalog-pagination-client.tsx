"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { catalogFiltersToQueryString } from "@/lib/store/catalog/url";
import type { CatalogFilters } from "@/lib/store/catalog/types";
import { cn } from "@/lib/utils";
import { storeRoutes } from "@/lib/store/navigation";

type CatalogPaginationClientProps = {
  filters: CatalogFilters;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
};

function getVisiblePages(
  page: number,
  totalPages: number,
): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages, page, page - 1, page + 1]);

  const sorted = [...pages]
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((a, b) => a - b);

  const result: Array<number | "ellipsis"> = [];

  for (let index = 0; index < sorted.length; index += 1) {
    const current = sorted[index];
    const previous = sorted[index - 1];

    if (previous !== undefined && current - previous > 1) {
      result.push("ellipsis");
    }

    result.push(current);
  }

  return result;
}

export function CatalogPaginationClient({
  filters,
  page,
  totalPages,
  onPageChange,
  isLoading,
}: CatalogPaginationClientProps) {
  if (totalPages <= 1) {
    return null;
  }

  const visiblePages = getVisiblePages(page, totalPages);
  const basePath = storeRoutes.catalog;

  return (
    <Pagination className={cn("mt-10", isLoading && "opacity-60")}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={`${basePath}${catalogFiltersToQueryString({ ...filters, page: Math.max(1, page - 1) })}`}
            text="Anterior"
            onClick={(event) => {
              event.preventDefault();
              if (page > 1) {
                onPageChange(page - 1);
              }
            }}
            aria-disabled={page <= 1 || isLoading}
            className={cn(page <= 1 && "pointer-events-none opacity-50")}
          />
        </PaginationItem>

        {visiblePages.map((item, index) =>
          item === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink
                href={`${basePath}${catalogFiltersToQueryString({ ...filters, page: item })}`}
                isActive={item === page}
                onClick={(event) => {
                  event.preventDefault();
                  if (item !== page) {
                    onPageChange(item);
                  }
                }}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          ),
        )}

        <PaginationItem>
          <PaginationNext
            href={`${basePath}${catalogFiltersToQueryString({ ...filters, page: Math.min(totalPages, page + 1) })}`}
            text="Siguiente"
            onClick={(event) => {
              event.preventDefault();
              if (page < totalPages) {
                onPageChange(page + 1);
              }
            }}
            aria-disabled={page >= totalPages || isLoading}
            className={cn(
              page >= totalPages && "pointer-events-none opacity-50",
            )}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
