"use client";

import * as React from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import {
  AuthCaptchaProvider,
  AuthTurnstileField,
  useAuthCaptcha,
} from "@/components/auth/auth-turnstile";
import { sendVerificationEmail } from "@/lib/auth-client";
import { captchaFetchOptions } from "@/lib/turnstile";
import {
  buildAuthSuccessUrl,
  buildPostVerificationSignInUrl,
} from "@/lib/auth/status-pages";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  const router = useRouter();
  const {
    token: captchaToken,
    reset: resetCaptcha,
    isReady: captchaReady,
  } = useAuthCaptcha();
  const [submissionError, setSubmissionError] = React.useState<string | null>(
    null,
  );
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

    router.push(
      buildAuthSuccessUrl({
        code: "verification_resent",
        callbackURL,
        email: values.email,
        from: "resend-verification",
      }),
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
