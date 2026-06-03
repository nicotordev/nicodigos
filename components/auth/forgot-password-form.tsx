import Link from "next/link";
import { IconArrowLeft, IconMail } from "@tabler/icons-react";
import { requestForgotPassword } from "@/lib/auth/forgot-password-action";
import {
  getSearchParam,
  type SignInSearchParams,
} from "@/lib/auth/sign-in-params";
import {
  AuthCaptchaHiddenInput,
  AuthCaptchaProvider,
  AuthTurnstileField,
} from "@/components/auth/auth-turnstile";
import { ForgotPasswordSubmit } from "@/components/auth/forgot-password-submit";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export interface ForgotPasswordFormProps {
  callbackURL: string;
  searchParams: SignInSearchParams;
}

export function ForgotPasswordForm({
  callbackURL,
  searchParams,
}: ForgotPasswordFormProps) {
  const status = getSearchParam(searchParams, "status");
  const isSent = status === "sent";
  const email = getSearchParam(searchParams, "email");
  const error = getSearchParam(searchParams, "error");
  const signInHref = `/auth/sign-in?callbackUrl=${encodeURIComponent(callbackURL)}`;

  if (isSent) {
    return (
      <div className="mt-4 space-y-6">
        <Alert className="border-primary/25 bg-primary/5">
          <IconMail className="size-4 text-primary" aria-hidden />
          <AlertTitle>Revisa tu bandeja de entrada</AlertTitle>
          <AlertDescription>
            Si existe una cuenta con{" "}
            <span className="font-medium text-foreground">
              {email ?? "ese correo"}
            </span>
            , te enviamos un enlace para restablecer tu contraseña. El enlace
            caduca en una hora.
          </AlertDescription>
        </Alert>

        <p className="text-sm text-muted-foreground">
          ¿No lo ves? Revisa spam o promociones, o vuelve a intentarlo en unos
          minutos.
        </p>

        <div className="flex flex-col gap-3">
          <Button variant="outline" className="w-full" asChild>
            <Link href={signInHref}>
              <IconArrowLeft className="size-4" aria-hidden />
              Volver a iniciar sesión
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <AuthCaptchaProvider>
      <form
        action={requestForgotPassword}
        className="mt-4 space-y-6"
        noValidate
      >
        <input
          type="hidden"
          name="searchParams"
          value={JSON.stringify(searchParams)}
        />
        <AuthCaptchaHiddenInput />

        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="forgot-password-email">
              Correo electrónico
            </FieldLabel>
            <FieldContent>
              <Input
                id="forgot-password-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                defaultValue={email ?? ""}
                placeholder="tu@correo.com"
              />
            </FieldContent>
          </Field>
        </FieldGroup>

        <AuthTurnstileField />

        <ForgotPasswordSubmit />

        <Button variant="ghost" className="w-full" asChild>
          <Link href={signInHref}>
            <IconArrowLeft className="size-4" aria-hidden />
            Volver a iniciar sesión
          </Link>
        </Button>
      </form>
    </AuthCaptchaProvider>
  );
}
