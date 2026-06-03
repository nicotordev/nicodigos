import Link from "next/link";
import { FiMail, FiShield } from "react-icons/fi";
import { LuMapPin } from "react-icons/lu";

import Logo from "@/components/logo";
import { Separator } from "@/components/ui/separator";
import {
  footerAccountLinks,
  footerHelpLinks,
  footerLegalLinks,
  footerShopLinks,
  storeRoutes,
} from "@/lib/store/navigation";
import { cn } from "@/lib/utils";

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30 rounded-sm"
    >
      {children}
    </Link>
  );
}

export function MarketplaceFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))] lg:gap-8 lg:py-14">
          <div className="space-y-4 sm:col-span-2 lg:col-span-1 lg:pr-8">
            <Logo href={storeRoutes.home} size="md" format="auto" />
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Marketplace chileno de productos digitales: keys, licencias, gift
              cards y suscripciones con entrega rápida.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <LuMapPin
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  aria-hidden
                />
                <span>Atención orientada a clientes en Chile.</span>
              </li>
              <li className="flex items-center gap-2">
                <FiMail className="size-4 shrink-0 text-primary" aria-hidden />
                <a
                  href="mailto:contacto@nicodigos.cl"
                  className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30 rounded-sm"
                >
                  contacto@nicodigos.cl
                </a>
              </li>
              <li className="flex items-start gap-2">
                <FiShield
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  aria-hidden
                />
                <span>Compra segura y entrega digital en tu cuenta.</span>
              </li>
            </ul>
          </div>

          <nav aria-label="Tienda">
            <h2 className="text-sm font-semibold text-foreground">Tienda</h2>
            <ul className="mt-4 space-y-2.5">
              {footerShopLinks.map((link) => (
                <li key={link.name}>
                  <FooterLink href={link.href}>{link.name}</FooterLink>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Ayuda">
            <h2 className="text-sm font-semibold text-foreground">Ayuda</h2>
            <ul className="mt-4 space-y-2.5">
              {footerHelpLinks.map((link) => (
                <li key={link.name}>
                  <FooterLink href={link.href}>{link.name}</FooterLink>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Cuenta">
            <h2 className="text-sm font-semibold text-foreground">Cuenta</h2>
            <ul className="mt-4 space-y-2.5">
              {footerAccountLinks.map((link) => (
                <li key={link.name}>
                  <FooterLink href={link.href}>{link.name}</FooterLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <Separator />

        <div className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            © {year} Nicodigos. Todos los derechos reservados.
          </p>
          <nav
            aria-label="Legal"
            className={cn("flex flex-wrap gap-x-4 gap-y-2")}
          >
            {footerLegalLinks.map((link) => (
              <FooterLink key={link.name} href={link.href}>
                {link.name}
              </FooterLink>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}

export default MarketplaceFooter;
