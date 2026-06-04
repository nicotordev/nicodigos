import { MarketingHeader } from "@/components/layout/marketing-header";
import { Footer } from "@/components/footer";
import { QueryProvider } from "@/components/providers/query-provider";
import { StoreToaster } from "@/components/store/store-toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <TooltipProvider delayDuration={200}>
        <div className="flex min-h-full flex-col">
          <MarketingHeader />
          {children}
          <Footer />
          <StoreToaster />
        </div>
      </TooltipProvider>
    </QueryProvider>
  );
}
