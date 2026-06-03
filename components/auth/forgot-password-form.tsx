import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";
import { requestForgotPassword } from "@/lib/auth/forgot-password-action";
import type { SignInSearchParams } from "@/lib/auth/sign-in-params";
import {
  AuthCaptchaHiddenInput,
  AuthCaptchaProvider,
  AuthTurnstileField,
} from "@/components/auth/auth-turnstile";
import { ForgotPasswordSubmit } from "@/components/auth/forgot-password-submit";
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
  const signInHref = `/auth/sign-in?callbackUrl=${encodeURIComponent(callbackURL)}`;

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
