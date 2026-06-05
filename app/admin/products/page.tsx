import type { Metadata } from "next";
import Link from "next/link";
import { IconPlus } from "@tabler/icons-react";
import { AdminProductsBoard } from "@/components/admin/admin-products-board";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { Button } from "@/components/ui/button";
import {
  hasActiveAdminProductFilters,
  parseAdminProductFilters,
} from "@/lib/admin/products/filters";
import {
  getAdminProductFilterOptions,
  getAdminProducts,
} from "@/lib/admin/products/queries";
import { syncAllProductGalleriesIfNeeded } from "@/lib/admin/products/sync-gallery";
import { syncAllProductMetadataFromKinguinIfNeeded } from "@/lib/admin/products/sync-metadata";
import { syncAllProductVideosIfNeeded } from "@/lib/admin/products/sync-videos";
import { syncAllProductsClpFromSourceIfNeeded } from "@/lib/admin/products/sync-clp";
import { getEurToClpRate } from "@/lib/currency/exchange";

export const metadata: Metadata = {
  title: "Productos",
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const resolvedParams = await searchParams;
  const filters = parseAdminProductFilters(resolvedParams);

  if (filters.page === 1 && !hasActiveAdminProductFilters(filters)) {
    getEurToClpRate()
      .then((fx) => {
        Promise.all([
          syncAllProductsClpFromSourceIfNeeded(fx.rate),
          syncAllProductGalleriesIfNeeded(),
          syncAllProductVideosIfNeeded(),
          syncAllProductMetadataFromKinguinIfNeeded(),
        ]).catch((err) => {
          console.error("Error in background products synchronization:", err);
        });
      })
      .catch((err) => {
        console.error("Error fetching FX rate for background sync:", err);
      });
  }

  const [
    { products, total, totalPages, page: currentPage, stats },
    filterOptions,
  ] = await Promise.all([
    getAdminProducts(filters, { limit: 50 }),
    getAdminProductFilterOptions(),
  ]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 md:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <DashboardPageHeader
          title="Productos"
          description="Catálogo local sincronizado desde Kinguin."
        />
        <Button asChild className="shrink-0 self-start">
          <Link href="/admin/products/new">
            <IconPlus className="size-4" />
            Agregar producto
          </Link>
        </Button>
      </div>

      <AdminProductsBoard
        products={products}
        total={total}
        page={currentPage}
        totalPages={totalPages}
        filters={filters}
        filterOptions={filterOptions}
        stats={stats}
      />
    </div>
  );
}
