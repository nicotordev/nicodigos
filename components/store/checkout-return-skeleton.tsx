import { MarketingPageShell } from "@/components/marketing/marketing-page-shell";
import { Skeleton } from "@/components/ui/skeleton";

export function CheckoutReturnPageSkeleton() {
  return (
    <MarketingPageShell
      narrow
      contentClassName="flex min-h-[50vh] items-center justify-center py-8 md:py-10"
    >
      <div
        className="rounded-3xl border border-border/60 bg-card p-8 sm:p-10 space-y-6 text-center"
        aria-busy="true"
        aria-label="Cargando confirmación de pago"
      >
        <Skeleton className="mx-auto size-16 rounded-full" />
        <Skeleton className="mx-auto h-8 w-64" />
        <Skeleton className="mx-auto h-4 w-full max-w-md" />
        <Skeleton className="mx-auto h-4 w-5/6 max-w-sm" />
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Skeleton className="h-11 w-full rounded-xl sm:w-40" />
          <Skeleton className="h-11 w-full rounded-xl sm:w-40" />
        </div>
      </div>
    </MarketingPageShell>
  );
}
