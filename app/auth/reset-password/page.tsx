import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { ResetPasswordHero } from "@/components/auth/reset-password-hero";
import Logo from "@/components/logo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getSearchParam,
  normalizePageSearchParams,
  resolveCallbackURL,
} from "@/lib/auth/sign-in-params";
import { buildAuthErrorUrl } from "@/lib/auth/status-pages";

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

  if (hasInvalidLink) {
    redirect(
      buildAuthErrorUrl({
        callbackURL,
        from: "reset-password",
        error: getSearchParam(params, "error") ?? "INVALID_TOKEN",
      }),
    );
  }

  const signInHref = `/auth/sign-in?callbackUrl=${encodeURIComponent(callbackURL)}`;
  const forgotPasswordHref = `/auth/forgot-password?callbackUrl=${encodeURIComponent(callbackURL)}`;

  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex flex-1 flex-col justify-center items-center px-4 py-12 sm:px-6 lg:flex-none lg:w-[550px] xl:w-[620px] lg:px-8 xl:px-12 bg-muted/20 dark:bg-muted/5 border-r border-border/40">
        <div className="w-full max-w-[440px]">
          <Card className="w-full border border-border/40 dark:border-border/10 shadow-lg rounded-2xl md:rounded-3xl">
            <CardHeader className="flex flex-col items-center text-center space-y-2 pb-2">
              <Logo href="/" size="lg" priority className="mb-2" />
              <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                Crea una nueva contraseña
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Introduce y confirma tu nueva contraseña.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResetPasswordForm
                token={token}
                callbackURL={callbackURL}
                signInHref={signInHref}
                forgotPasswordHref={forgotPasswordHref}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <ResetPasswordHero />
    </div>
  );
}
