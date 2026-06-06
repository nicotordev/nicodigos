import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { MarketingPageShell } from "@/components/marketing/marketing-page-shell";
import { CheckoutForm } from "@/components/store/checkout-form";
import { CheckoutSteps } from "@/components/store/checkout-steps";
import { getCheckoutPageData } from "@/lib/store/checkout/get-checkout-initial";
import { getCartView } from "@/lib/store/cart/queries";
import { getOptionalStoreSession } from "@/lib/store/auth";
import { storeRoutes } from "@/lib/store/navigation";

export const metadata: Metadata = {
  title: "Pago — Datos de compra",
  description:
    "Completa tus datos para comprar keys y gift cards en Chile. Facturación conforme a normativa tributaria chilena.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/checkout",
  },
};

export default async function CheckoutPage() {
  const session = await getOptionalStoreSession();

  if (!session?.user) {
    redirect(storeRoutes.cart);
  }

  const cart = await getCartView(session.user.id);

  if (!cart || cart.items.length === 0) {
    redirect(storeRoutes.cart);
  }

  const checkoutData = await getCheckoutPageData(session.user.id);

  return (
    <MarketingPageShell narrow contentClassName="space-y-6 md:space-y-8">
      <CheckoutSteps current="checkout" />

      <div className="space-y-2 border-b border-border/10 pb-5 md:pb-6">
        <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
          Datos para tu compra
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground/90">
          Completa el formulario para emitir tu comprobante y recibir tus keys
          al tiro después del pago. Los datos se solicitan por obligaciones
          tributarias y de protección de datos personales en Chile.
        </p>
      </div>

      <CheckoutForm
        {...checkoutData}
        userId={session.user.id}
        subtotal={Number(cart.netSubtotal ?? cart.subtotal)}
        itemCount={cart.itemCount}
      />
    </MarketingPageShell>
  );
}
