import { CatalogProductSkeleton } from "@/components/store/catalog-product-skeleton";
import { MarketingPageShell } from "@/components/marketing/marketing-page-shell";
import { Skeleton } from "@/components/ui/skeleton";

export function OffersPageSkeleton() {
  return (
    <MarketingPageShell
      variant="warm"
      contentClassName="space-y-6 md:space-y-8"
    >
      <div className="hidden overflow-hidden rounded-3xl border border-rose-500/20 bg-card p-6 shadow-lg md:block sm:p-10">
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <Skeleton className="h-7 w-52 rounded-full" />
            <Skeleton className="h-10 w-64 sm:w-80" />
            <Skeleton className="h-4 w-full max-w-xl" />
          </div>
          <Skeleton className="h-24 w-40 rounded-2xl" />
        </div>
      </div>

      <div className="space-y-2 border-b border-border/80 pb-5 md:hidden">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-4 w-full max-w-sm" />
      </div>

      <Skeleton className="h-4 w-48" />
      <CatalogProductSkeleton count={8} />
    </MarketingPageShell>
  );
}
