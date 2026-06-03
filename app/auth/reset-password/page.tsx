import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { ResetPasswordHero } from "@/components/auth/reset-password-hero";
import Logo from "@/components/logo";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getAuthErrorFromSearchParams,
  getSearchParam,
  normalizePageSearchParams,
  resolveCallbackURL,
} from "@/lib/auth/sign-in-params";

export const metadata: Metadata = {
  title: "Nueva contraseña",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = normalizePageSearchParams(await searchParams);
  const callbackURL = resolveCallbackURL(params);
  const token = getSearchParam(params, "token");
  const hasInvalidLink =
    !token || getSearchParam(params, "error") === "INVALID_TOKEN";
  const signInHref = `/auth/sign-in?callbackUrl=${encodeURIComponent(callbackURL)}`;
  const forgotPasswordHref = `/auth/forgot-password?callbackUrl=${encodeURIComponent(callbackURL)}`;
  const linkError = hasInvalidLink
    ? (getAuthErrorFromSearchParams(params) ??
      "Este enlace no es válido o ha caducado.")
    : null;

  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex flex-1 flex-col justify-center items-center px-4 py-12 sm:px-6 lg:flex-none lg:w-[550px] xl:w-[620px] lg:px-8 xl:px-12 bg-muted/20 dark:bg-muted/5 border-r border-border/40">
        <div className="w-full max-w-[440px]">
          <Card className="w-full border border-border/40 dark:border-border/10 shadow-lg rounded-2xl md:rounded-3xl">
            <CardHeader className="flex flex-col items-center text-center space-y-2 pb-2">
              <Logo href="/" size="lg" priority className="mb-2" />
              <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                {hasInvalidLink ? "Enlace no válido" : "Crea una nueva contraseña"}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {hasInvalidLink
                  ? "Solicita un nuevo correo de recuperación para continuar."
                  : "Introduce y confirma tu nueva contraseña."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {hasInvalidLink ? (
                <div className="mt-4 space-y-4">
                  {linkError ? (
                    <Alert variant="destructive">
                      <AlertDescription>{linkError}</AlertDescription>
                    </Alert>
                  ) : null}
                  <Button className="w-full" size="lg" asChild>
                    <Link href={forgotPasswordHref}>Solicitar nuevo enlace</Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={signInHref}>Volver a iniciar sesión</Link>
                  </Button>
                </div>
              ) : (
                <ResetPasswordForm
                  token={token}
                  callbackURL={callbackURL}
                  signInHref={signInHref}
                  forgotPasswordHref={forgotPasswordHref}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ResetPasswordHero />
    </div>
  );
}
