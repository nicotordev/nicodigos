import type { Metadata } from "next";
import Link from "next/link";
import { IconAlertCircle } from "@tabler/icons-react";
import { AuthStatusLayout } from "@/components/auth/auth-status-layout";
import { Button } from "@/components/ui/button";
import { normalizePageSearchParams } from "@/lib/auth/sign-in-params";
import { resolveAuthErrorPage } from "@/lib/auth/status-pages";

export const metadata: Metadata = {
  title: "Error de autenticación",
};

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = normalizePageSearchParams(await searchParams);
  const page = resolveAuthErrorPage(params);

  return (
    <AuthStatusLayout
      title={page.title}
      description={page.message}
      reverse={page.from === "sign-up"}
    >
      <div className="mt-2 space-y-6 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <IconAlertCircle className="size-7" aria-hidden />
        </div>

        <div className="flex flex-col gap-3">
          <Button className="w-full" size="lg" asChild>
            <Link href={page.retryHref}>Reintentar</Link>
          </Button>

          {page.showForgotPassword ? (
            <Button variant="outline" className="w-full" asChild>
              <Link href={page.forgotPasswordHref}>Solicitar nuevo enlace</Link>
            </Button>
          ) : null}

          {page.from !== "sign-in" ? (
            <Button variant="ghost" className="w-full" asChild>
              <Link href={page.signInHref}>Volver a iniciar sesión</Link>
            </Button>
          ) : null}
        </div>
      </div>
    </AuthStatusLayout>
  );
}
