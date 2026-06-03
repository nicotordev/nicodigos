import type { Metadata } from "next";
import Link from "next/link";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { SignUpHero } from "@/components/auth/sign-up-hero";
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

export const metadata: Metadata = {
  title: "Crear cuenta",
};

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = normalizePageSearchParams(await searchParams);
  const callbackURL = resolveCallbackURL(params);
  const signInHref = `/auth/sign-in?callbackUrl=${encodeURIComponent(callbackURL)}`;

  return (
    <div className="flex lg:flex-row-reverse min-h-screen bg-background">
      <div className="flex flex-1 flex-col justify-center items-center px-4 py-12 sm:px-6 lg:flex-none lg:w-[550px] xl:w-[620px] lg:px-8 xl:px-12 bg-muted/20 dark:bg-muted/5 lg:border-l lg:border-r-0 border-border/40">
        <div className="w-full max-w-[440px]">
          <Card className="w-full border border-border/40 dark:border-border/10 shadow-lg rounded-2xl md:rounded-3xl">
            <CardHeader className="flex flex-col items-center text-center space-y-2 pb-2">
              <Logo href="/" size="lg" priority className="mb-2" />
              <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                Crea tu cuenta
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                ¿Ya tienes cuenta?{" "}
                <Link
                  href={signInHref}
                  className="font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  Iniciar sesión
                </Link>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SignUpForm callbackURL={callbackURL} searchParams={params} />
            </CardContent>
          </Card>
        </div>
      </div>

      <SignUpHero />
    </div>
  );
}
