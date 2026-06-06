import type { Metadata } from "next";
import Link from "next/link";

import { HowItWorksSection } from "@/components/home/how-it-works-section";
import { Button } from "@/components/ui/button";
import { storeRoutes } from "@/lib/store/navigation";

export const metadata: Metadata = {
  title: "Cómo funciona | Nicodigos",
  description:
    "Compra keys, gift cards y licencias digitales en cinco pasos: elige, paga y recibe tu código al instante.",
  alternates: {
    canonical: "/how-it-works",
  },
};

export default function HowItWorksPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <section className="border-b border-border/60 bg-muted/20 px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            Ayuda
          </p>
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Cómo funciona Nicodigos
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            Compra códigos digitales con precio en pesos chilenos, entrega
            automática y soporte local si necesitas ayuda con la activación.
          </p>
        </div>
      </section>

      <HowItWorksSection />

      <section className="border-t border-border/60 px-4 py-12 sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
          <p className="text-sm text-muted-foreground">
            ¿Listo para explorar el catálogo o necesitas ayuda con un pedido?
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild>
              <Link href={storeRoutes.catalog}>Ver catálogo</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={storeRoutes.support}>Contactar soporte</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
