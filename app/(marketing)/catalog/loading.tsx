import { MarketingPageShell } from "@/components/marketing/marketing-page-shell";
import { CatalogPageShell } from "@/components/store/catalog-page-shell";

export default function CatalogLoading() {
  return (
    <MarketingPageShell contentClassName="space-y-6 md:space-y-8">
      <CatalogPageShell />
    </MarketingPageShell>
  );
}
