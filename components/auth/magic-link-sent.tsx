import Link from "next/link";
import { IconMail } from "@tabler/icons-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export interface MagicLinkSentProps {
  email: string;
  description: string;
  backHref?: string;
  backLabel?: string;
}

export function MagicLinkSent({
  email,
  description,
  backHref,
  backLabel = "Volver",
}: MagicLinkSentProps) {
  return (
    <div className="mt-4 space-y-6">
      <Alert className="border-primary/25 bg-primary/5">
        <IconMail className="size-4 text-primary" aria-hidden />
        <AlertTitle>Revisa tu correo</AlertTitle>
        <AlertDescription>
          {description}{" "}
          <span className="font-medium text-foreground">{email}</span>. El
          enlace caduca en unos minutos.
        </AlertDescription>
      </Alert>

      <p className="text-sm text-muted-foreground">
        ¿No lo ves? Revisa spam o promociones e inténtalo de nuevo.
      </p>

      {backHref ? (
        <Button variant="outline" className="w-full" asChild>
          <Link href={backHref}>{backLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}
