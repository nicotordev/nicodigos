import type { Metadata } from "next";
import Link from "next/link";
import { SignInForm } from "@/components/auth/sign-in-form";
import { SignInHero } from "@/components/auth/sign-in-hero";
import Logo from "@/components/logo";
import {
  normalizePageSearchParams,
  resolveCallbackURL,
} from "@/lib/auth/sign-in-params";

export const metadata: Metadata = {
  title: "Iniciar sesión",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = normalizePageSearchParams(await searchParams);
  const callbackURL = resolveCallbackURL(params);
  const signUpHref = `/auth/sign-up?callbackUrl=${encodeURIComponent(callbackURL)}`;

  return (
    <div className="flex min-h-screen">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <Logo href="/" size="lg" priority />
            <h2 className="mt-8 text-2xl font-bold tracking-tight text-foreground">
              Inicia sesión en tu cuenta
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              ¿No tienes cuenta?{" "}
              <Link
                href={signUpHref}
                className="font-semibold text-primary hover:text-primary/80"
              >
                Crear cuenta
              </Link>
            </p>
          </div>

          <SignInForm callbackURL={callbackURL} searchParams={params} />
        </div>
      </div>

      <SignInHero />
    </div>
  );
}
