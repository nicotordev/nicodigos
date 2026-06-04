import { SectionShell } from "@/components/home/section-shell";
import {
  StorefrontProductCardView,
  storefrontProductGridClassName,
} from "@/components/store/storefront-product-card";
import type { StorefrontProductCard } from "@/lib/store/home/types";
import { storeRoutes } from "@/lib/store/navigation";

type OffersSectionProps = {
  products: StorefrontProductCard[];
};

export function OffersSection({ products }: OffersSectionProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <SectionShell
      id="ofertas"
      eyebrow="Promos"
      title="Ofertas que valen la pena"
      description="Precios especiales en keys y software, con stock limitado."
      href={storeRoutes.offers}
      className="py-16 sm:py-20"
    >
      <ul className={storefrontProductGridClassName}>
        {products.map((product) => (
          <li key={product.id} className="h-full">
            <StorefrontProductCardView product={product} />
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}
