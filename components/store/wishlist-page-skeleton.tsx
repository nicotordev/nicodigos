import { MarketingPageShell } from "@/components/marketing/marketing-page-shell";
import { CartLineItemsSkeleton } from "@/components/store/checkout-flow-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export function WishlistPageSkeleton() {
  return (
    <MarketingPageShell
      variant="rose"
      contentClassName="space-y-6 md:space-y-8"
    >
      <div className="border-b border-border/10 pb-6">
        <div className="flex items-center gap-2.5">
          <Skeleton className="size-9 rounded-xl" />
          <Skeleton className="h-9 w-48" />
        </div>
        <Skeleton className="mt-2 h-4 w-full max-w-lg" />
      </div>

      <CartLineItemsSkeleton count={4} />
    </MarketingPageShell>
  );
}
