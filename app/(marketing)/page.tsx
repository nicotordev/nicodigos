import Link from "next/link";

import { HomeProductsCarousel } from "@/components/marketing/home-products-carousel";
import { Button } from "@/components/ui/button";
import { storeRoutes } from "@/lib/store/navigation";
import { getStorefrontProducts } from "@/lib/store/products";

export const revalidate = 300;

export default async function HomePage() {
  const products = await getStorefrontProducts();

  return (
    <main className="flex-1">
      <section className="overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-10 py-12 sm:py-16 lg:grid lg:grid-cols-[minmax(0,26rem)_1fr] lg:items-center lg:gap-8 lg:py-20 xl:grid-cols-[minmax(0,28rem)_1fr]">
            <div className="space-y-6">
              <div className="space-y-4">
                <p className="text-sm font-medium text-primary">
                  Marketplace digital · Chile
                </p>
                <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                  Keys, gift cards y licencias al instante
                </h1>
                <p className="text-lg text-muted-foreground">
                  Compra juegos, software, suscripciones y códigos digitales con
                  entrega rápida y soporte local en Nicodigos.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href={storeRoutes.catalog}>Ver catálogo</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href={storeRoutes.offers}>Ofertas de hoy</Link>
                </Button>
              </div>
            </div>

            <div className="relative min-w-0 lg:-mr-[max(0,calc((100vw-80rem)/2+2rem))]">
              <div className="mb-3 flex items-end justify-between gap-3 pr-4 sm:pr-6 lg:pr-8">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Destacados
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Productos disponibles ahora
                  </p>
                </div>
                <Link
                  href={storeRoutes.catalog}
                  className="shrink-0 text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  Ver todos
                </Link>
              </div>
              <HomeProductsCarousel products={products} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
