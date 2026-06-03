import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SignInForm } from "@/components/auth/sign-in-form";
import { SignInHero } from "@/components/auth/sign-in-hero";
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
  title: "Iniciar sesión",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = normalizePageSearchParams(await searchParams);
  const legacyRedirect = getLegacyAuthStatusRedirect(params, "sign-in");
  if (legacyRedirect) redirect(legacyRedirect);

  const callbackURL = resolveCallbackURL(params);
  const signUpHref = `/auth/sign-up?callbackUrl=${encodeURIComponent(callbackURL)}`;

  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex flex-1 flex-col justify-center items-center px-4 py-12 sm:px-6 lg:flex-none lg:w-[550px] xl:w-[620px] lg:px-8 xl:px-12 bg-muted/20 dark:bg-muted/5 border-r border-border/40">
        <div className="w-full max-w-[440px]">
          <Card className="w-full border border-border/40 dark:border-border/10 shadow-lg rounded-2xl md:rounded-3xl">
            <CardHeader className="flex flex-col items-center text-center space-y-2 pb-2">
              <Logo href="/" size="lg" priority className="mb-2" />
              <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                Ingresa a tu biblioteca
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Accede para ver tus keys compradas, activar licencias y
                descubrir ofertas.{" "}
                <span className="block mt-2 text-xs">
                  ¿Eres nuevo en Nicodigos?{" "}
                  <Link
                    href={signUpHref}
                    className="font-semibold text-primary hover:text-primary/80 transition-colors underline underline-offset-4"
                  >
                    Regístrate gratis aquí
                  </Link>
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SignInForm callbackURL={callbackURL} searchParams={params} />
            </CardContent>
          </Card>
        </div>
      </div>

      <SignInHero />
    </div>
  );
}
