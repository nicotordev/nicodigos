import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { ForgotPasswordHero } from "@/components/auth/forgot-password-hero";
import Logo from "@/components/logo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  normalizePageSearchParams,
  resolveCallbackURL,
} from "@/lib/auth/sign-in-params";
import { getLegacyAuthStatusRedirect } from "@/lib/auth/status-pages";

export const metadata: Metadata = {
  title: "Recuperar contraseña",
};

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = normalizePageSearchParams(await searchParams);
  const legacyRedirect = getLegacyAuthStatusRedirect(params, "forgot-password");
  if (legacyRedirect) redirect(legacyRedirect);

  const callbackURL = resolveCallbackURL(params);

  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex flex-1 flex-col justify-center items-center px-4 py-12 sm:px-6 lg:flex-none lg:w-[550px] xl:w-[620px] lg:px-8 xl:px-12 bg-muted/20 dark:bg-muted/5 border-r border-border/40">
        <div className="w-full max-w-[440px]">
          <Card className="w-full border border-border/40 dark:border-border/10 shadow-lg rounded-2xl md:rounded-3xl">
            <CardHeader className="flex flex-col items-center text-center space-y-2 pb-2">
              <Logo href="/" size="lg" priority className="mb-2" />
              <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                ¿Olvidaste tu contraseña?
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Introduce el correo de tu cuenta y te enviaremos un enlace para
                restablecerla.{" "}
                <Link
                  href={`/auth/sign-in?callbackUrl=${encodeURIComponent(callbackURL)}`}
                  className="font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  Volver a iniciar sesión
                </Link>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ForgotPasswordForm
                callbackURL={callbackURL}
                searchParams={params}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <ForgotPasswordHero />
    </div>
  );
}
