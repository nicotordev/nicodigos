import type { Metadata } from "next";
import { IconShoppingCart } from "@tabler/icons-react";

import {
  MarketingPageHeader,
  MarketingPageShell,
} from "@/components/marketing/marketing-page-shell";
import { CartViewPanel } from "@/components/store/cart-view";
import { CheckoutSteps } from "@/components/store/checkout-steps";
import { getOptionalStoreSession } from "@/lib/store/auth";
import { getCartView } from "@/lib/store/cart/queries";

export const metadata: Metadata = {
  title: "Carrito",
  description:
    "Revisa tus keys, gift cards y licencias digitales antes de pagar. Precios en pesos chilenos y entrega al tiro.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/cart",
  },
};

export default async function CartPage() {
  const session = await getOptionalStoreSession();
  const cart = session
    ? ((await getCartView(session.user.id)) ?? {
        id: "",
        items: [],
        itemCount: 0,
        subtotal: "0",
      })
    : {
        id: "",
        items: [],
        itemCount: 0,
        subtotal: "0",
      };

  return (
    <MarketingPageShell contentClassName="space-y-6 md:space-y-8">
      <CheckoutSteps current="cart" />

      <MarketingPageHeader
        title="Tu carrito"
        description="Revisa y gestiona tus productos digitales antes de seguir al pago."
        icon={<IconShoppingCart className="size-5" aria-hidden />}
      />

      <CartViewPanel cart={cart} />
    </MarketingPageShell>
  );
}
