import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { IconCircleCheck, IconMail } from "@tabler/icons-react";
import { AuthStatusLayout } from "@/components/auth/auth-status-layout";
import { Button } from "@/components/ui/button";
import {
  normalizePageSearchParams,
  resolveCallbackURL,
} from "@/lib/auth/sign-in-params";
import { resolveAuthSuccessPage } from "@/lib/auth/status-pages";

export const metadata: Metadata = {
  title: "Operación completada",
};

export default async function AuthSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = normalizePageSearchParams(await searchParams);
  const page = resolveAuthSuccessPage(params);

  if (!page) {
    redirect(
      `/auth/sign-in?callbackUrl=${encodeURIComponent(resolveCallbackURL(params))}`,
    );
  }

  const Icon =
    page.code === "email_verified" || page.code === "password_reset"
      ? IconCircleCheck
      : IconMail;

  const primaryLabel =
    page.code === "password_reset" || page.code === "email_verified"
      ? "Iniciar sesión"
      : "Ir a iniciar sesión";

  return (
    <AuthStatusLayout title={page.title} reverse={page.from === "sign-up"}>
      <div className="mt-2 space-y-6 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon className="size-7" aria-hidden />
        </div>

        <p className="text-sm text-muted-foreground">{page.body}</p>

        {page.hint ? (
          <p className="text-sm text-muted-foreground">{page.hint}</p>
        ) : null}

        <div className="flex flex-col gap-3">
          <Button className="w-full" size="lg" asChild>
            <Link href={page.signInHref}>{primaryLabel}</Link>
          </Button>

          {page.secondaryActions.map((action) => (
            <Button
              key={action.href}
              variant="outline"
              className="w-full"
              asChild
            >
              <Link href={action.href}>{action.label}</Link>
            </Button>
          ))}
        </div>
      </div>
    </AuthStatusLayout>
  );
}
