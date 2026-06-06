import type { Metadata } from "next";
import Link from "next/link";
import {
  IconHelp,
  IconMail,
  IconMessageCircle,
  IconShoppingCart,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { storeRoutes } from "@/lib/store/navigation";

export const metadata: Metadata = {
  title: "Soporte | Nicodigos",
  description:
    "Soporte en Chile para activar keys Steam, gift cards y códigos digitales. Contacto, pedidos y ayuda con tu compra.",
  alternates: {
    canonical: "/support",
  },
};

const supportTopics = [
  {
    icon: IconShoppingCart,
    title: "Estado de tu pedido",
    description:
      "Revisa Mis pedidos en tu cuenta para ver el avance y las claves entregadas.",
    href: storeRoutes.orders,
  },
  {
    icon: IconHelp,
    title: "Cómo comprar",
    description:
      "Guía paso a paso desde la búsqueda del producto hasta la activación.",
    href: storeRoutes.howItWorks,
  },
  {
    icon: IconMessageCircle,
    title: "Activación de códigos",
    description:
      "Si un key no activa o necesitas validar la región, escríbenos con el número de pedido.",
    href: "mailto:contacto@nicodigos.cl",
  },
] as const;

export default function SupportPage() {
  return (
    <main className="flex-1 bg-background py-10 sm:py-16 md:py-24">
      <div className="mx-auto max-w-3xl space-y-8 px-4 sm:space-y-12 sm:px-6 lg:px-8">
        <div className="space-y-4 border-b border-border/40 pb-8 text-center sm:text-left">
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Soporte
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Equipo chileno para ayudarte con pedidos, activación de keys y dudas
            sobre el catálogo. Respondemos por correo en horario laboral.
          </p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="shrink-0 rounded-xl border border-primary/20 bg-primary/10 p-2.5 text-primary">
              <IconMail className="size-5" aria-hidden />
            </div>
            <div className="space-y-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Correo de soporte
              </h2>
              <a
                href="mailto:contacto@nicodigos.cl"
                className="text-lg font-extrabold text-primary transition-colors hover:underline"
              >
                contacto@nicodigos.cl
              </a>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Incluye tu número de pedido y una captura del error si el
                problema es con la activación de un código.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {supportTopics.map((topic) => {
            const Icon = topic.icon;
            return (
              <Link
                key={topic.title}
                href={topic.href}
                className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-colors hover:border-primary/30 hover:bg-muted/20"
              >
                <Icon className="mb-3 size-5 text-primary" aria-hidden />
                <h3 className="font-heading text-sm font-bold text-foreground">
                  {topic.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {topic.description}
                </p>
              </Link>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href={storeRoutes.orders}>Mis pedidos</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={storeRoutes.howItWorks}>Cómo funciona</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/legal/company">Información de la empresa</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
