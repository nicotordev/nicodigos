import { Skeleton } from "@/components/ui/skeleton";
import { storefrontProductGridClassName } from "@/components/store/storefront-product-card";
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
          <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-card">
            <Skeleton className="aspect-3/4 w-full rounded-none sm:aspect-auto sm:h-80" />
            <div className="space-y-2 p-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-2/3" />
              <div className="flex justify-between border-t border-border/50 pt-3">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-9 w-full" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
