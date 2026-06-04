"use client";

import Link from "next/link";
import { IconInfoCircle } from "@tabler/icons-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  chilePersonalDataLaws,
  chileTaxLawReference,
  siiElectronicDocumentsUrl,
} from "@/lib/chile/checkout-data-legal";
import { footerLegalLinks } from "@/lib/store/navigation";
import { cn } from "@/lib/utils";

type CheckoutDataNoticeProps = {
  className?: string;
};

const privacyHref = footerLegalLinks[1]?.href ?? "/legal/privacy";

export function CheckoutDataNotice({ className }: CheckoutDataNoticeProps) {
  const [law19628, law21719] = chilePersonalDataLaws;

  return (
    <Accordion
      type="single"
      collapsible
      className={cn("border-border/60 bg-muted/25 shadow-none", className)}
    >
      <AccordionItem value="why-data" className="border-0">
        <AccordionTrigger className="gap-3 py-4 hover:no-underline sm:px-5">
          <span className="flex min-w-0 flex-1 items-start gap-3 text-left">
            <IconInfoCircle
              className="size-5 shrink-0 text-primary mt-0.5"
              aria-hidden
            />
            <span className="font-heading text-base font-semibold text-foreground">
              ¿Por qué pedimos estos datos?
            </span>
          </span>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 sm:px-5 sm:pb-5">
          <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <ul className="list-disc space-y-2 pl-5 marker:text-primary/70">
              <li>
                <strong className="font-medium text-foreground">
                  Contacto
                </strong>{" "}
                (correo y teléfono): para entregarte tus keys, confirmar el pago
                y avisarte del estado del pedido.
              </li>
              <li>
                <strong className="font-medium text-foreground">
                  Facturación
                </strong>{" "}
                (RUT, tipo de documento y nombre o razón social): para emitir tu
                boleta o factura según las reglas del{" "}
                <a
                  href={siiElectronicDocumentsUrl}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Servicio de Impuestos Internos (SII)
                </a>{" "}
                y el{" "}
                <a
                  href={chileTaxLawReference.href}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {chileTaxLawReference.shortName}
                </a>
                .
              </li>
              <li>
                <strong className="font-medium text-foreground">
                  Dirección
                </strong>
                : forma parte del documento tributario y de la acreditación de
                la operación de compra.
              </li>
            </ul>

            <p>
              Tratamos tus datos conforme a nuestra{" "}
              <Link
                href={privacyHref}
                className="font-medium text-primary underline-offset-4 hover:underline"
                target="_blank"
              >
                política de privacidad
              </Link>{" "}
              y la legislación chilena de protección de datos personales, en
              particular la{" "}
              {law19628 ? (
                <a
                  href={law19628.href}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {law19628.shortName}
                </a>
              ) : null}
              {law19628 && law21719 ? " y la " : null}
              {law21719 ? (
                <a
                  href={law21719.href}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {law21719.shortName}
                </a>
              ) : null}
              . Solo usamos esta información para procesar tu compra y cumplir
              obligaciones legales asociadas.
            </p>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
