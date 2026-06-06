import { MarketingPageShell } from "@/components/marketing/marketing-page-shell";
import {
  CheckoutFormSkeleton,
  CheckoutStepsSkeleton,
} from "@/components/store/checkout-flow-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export function CheckoutPageSkeleton() {
  return (
    <MarketingPageShell narrow contentClassName="space-y-6 md:space-y-8">
      <CheckoutStepsSkeleton />

      <div className="space-y-2 border-b border-border/10 pb-6">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-4 w-full max-w-xl" />
        <Skeleton className="h-4 w-5/6 max-w-lg" />
      </div>

      <CheckoutFormSkeleton />
    </MarketingPageShell>
  );
}
