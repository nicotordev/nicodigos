import { Skeleton } from "@/components/ui/skeleton";
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
    <ul
      className={cn(
        "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className,
      )}
      aria-hidden
    >
      {Array.from({ length: count }, (_, index) => (
        <li key={index}>
          <div className="overflow-hidden rounded-[min(var(--radius-4xl),24px)] ring-1 ring-border/40">
            <Skeleton className="aspect-16/10 w-full rounded-none" />
            <div className="space-y-3 p-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex justify-between pt-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-12" />
              </div>
              <Skeleton className="h-8 w-full" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
