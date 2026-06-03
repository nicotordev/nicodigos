"use client";

import * as React from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { IconMail } from "@tabler/icons-react";
import {
  AuthCaptchaProvider,
  AuthTurnstileField,
  useAuthCaptcha,
} from "@/components/auth/auth-turnstile";
import { sendVerificationEmail } from "@/lib/auth-client";
import { captchaFetchOptions } from "@/lib/turnstile";
import { buildPostVerificationSignInUrl } from "@/lib/auth/sign-in-params";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

const resendSchema = z.object({
  email: z.email("Introduce un correo electrónico válido"),
});

type ResendValues = z.infer<typeof resendSchema>;

export interface ResendVerificationFormProps {
  callbackURL: string;
  defaultEmail?: string;
  signInHref: string;
}

function ResendVerificationFormInner({
  callbackURL,
  defaultEmail = "",
  signInHref,
}: ResendVerificationFormProps) {
  const {
    token: captchaToken,
    reset: resetCaptcha,
    isReady: captchaReady,
  } = useAuthCaptcha();
  const [submissionError, setSubmissionError] = React.useState<string | null>(
    null,
  );
  const [isSent, setIsSent] = React.useState(false);

  const form = useForm<ResendValues>({
    resolver: zodResolver(resendSchema),
    defaultValues: { email: defaultEmail },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: ResendValues) {
    setSubmissionError(null);

    const { error } = await sendVerificationEmail({
      email: values.email,
      callbackURL: buildPostVerificationSignInUrl(callbackURL),
      fetchOptions: captchaFetchOptions(captchaToken),
    });

    if (error) {
      resetCaptcha();
      setSubmissionError(
        error.message ??
          "No pudimos enviar el correo. Inténtalo de nuevo en unos minutos.",
      );
      return;
    }

    setIsSent(true);
  }

  if (isSent) {
    return (
      <div className="mt-4 space-y-6">
        <Alert className="border-primary/25 bg-primary/5">
          <IconMail className="size-4 text-primary" aria-hidden />
          <AlertTitle>Correo enviado</AlertTitle>
          <AlertDescription>
            Si existe una cuenta pendiente de verificación con ese correo,
            recibirás un nuevo enlace en breve.
          </AlertDescription>
        </Alert>
        <Button variant="outline" className="w-full" asChild>
          <Link href={signInHref}>Volver a iniciar sesión</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
        noValidate
      >
        {submissionError ? (
          <Alert variant="destructive">
            <AlertDescription>{submissionError}</AlertDescription>
          </Alert>
        ) : null}

        <FieldGroup>
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel htmlFor="resend-verification-email">
                  Correo electrónico
                </FieldLabel>
                <FieldContent>
                  <Input
                    {...field}
                    id="resend-verification-email"
                    type="email"
                    autoComplete="email"
                    aria-invalid={!!fieldState.error}
                  />
                  <FieldError errors={[fieldState.error]} />
                </FieldContent>
              </Field>
            )}
          />
        </FieldGroup>

        <AuthTurnstileField />

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isSubmitting || !captchaReady}
        >
          {isSubmitting ? (
            <>
              <Spinner />
              Enviando…
            </>
          ) : (
            "Reenviar correo de verificación"
          )}
        </Button>

        <Button variant="ghost" className="w-full" asChild>
          <Link href={signInHref}>Volver a iniciar sesión</Link>
        </Button>
      </form>
    </div>
  );
}

export function ResendVerificationForm(props: ResendVerificationFormProps) {
  return (
    <AuthCaptchaProvider>
      <ResendVerificationFormInner {...props} />
    </AuthCaptchaProvider>
  );
}
