import { Skeleton } from "@/components/ui/skeleton";
import {
  storefrontProductCoverClassName,
  storefrontProductGridClassName,
} from "@/components/store/storefront-product-card";
import { cn } from "@/lib/utils";

type CatalogProductSkeletonProps = {
  count?: number;
  className?: string;
};

export function CatalogProductSkeleton({
  count = 8,
  className,
}: CatalogProductSkeletonProps) {
  return (
    <ul className={cn(storefrontProductGridClassName, className)} aria-hidden>
      {Array.from({ length: count }, (_, index) => (
        <li key={index}>
          <div className="flex flex-col overflow-hidden rounded-md border border-border bg-card">
            <Skeleton className={storefrontProductCoverClassName} />
            <div className="space-y-1.5 p-2.5 sm:p-3">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
              <div className="flex justify-between border-t border-border/50 pt-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-12" />
              </div>
              <Skeleton className="hidden h-8 w-full md:block" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
