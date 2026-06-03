"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { resetPassword } from "@/lib/auth-client";
import { buildAuthSuccessUrl } from "@/lib/auth/status-pages";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export interface ResetPasswordFormProps {
  token: string;
  callbackURL: string;
  signInHref: string;
  forgotPasswordHref: string;
}

export function ResetPasswordForm({
  token,
  callbackURL,
  signInHref,
  forgotPasswordHref,
}: ResetPasswordFormProps) {
  const router = useRouter();
  const [submissionError, setSubmissionError] = React.useState<string | null>(
    null,
  );
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: ResetPasswordValues) {
    setSubmissionError(null);

    const { error } = await resetPassword({
      newPassword: values.password,
      token,
    });

    if (error) {
      setSubmissionError(
        error.message ??
          "No se pudo actualizar la contraseña. Solicita un enlace nuevo.",
      );
      return;
    }

    router.push(
      buildAuthSuccessUrl({
        code: "password_reset",
        callbackURL,
      }),
    );
    router.refresh();
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
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel htmlFor="reset-password-new">
                  Nueva contraseña
                </FieldLabel>
                <FieldContent>
                  <Input
                    {...field}
                    id="reset-password-new"
                    type="password"
                    autoComplete="new-password"
                    aria-invalid={!!fieldState.error}
                  />
                  <FieldDescription>Mínimo 8 caracteres</FieldDescription>
                  <FieldError errors={[fieldState.error]} />
                </FieldContent>
              </Field>
            )}
          />

          <Controller
            name="confirmPassword"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel htmlFor="reset-password-confirm">
                  Confirmar contraseña
                </FieldLabel>
                <FieldContent>
                  <Input
                    {...field}
                    id="reset-password-confirm"
                    type="password"
                    autoComplete="new-password"
                    aria-invalid={!!fieldState.error}
                  />
                  <FieldError errors={[fieldState.error]} />
                </FieldContent>
              </Field>
            )}
          />
        </FieldGroup>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Spinner />
              Guardando…
            </>
          ) : (
            "Guardar contraseña"
          )}
        </Button>

        <Button variant="ghost" className="w-full" asChild>
          <Link href={signInHref}>Volver a iniciar sesión</Link>
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          ¿El enlace no funciona?{" "}
          <Link
            href={forgotPasswordHref}
            className="font-semibold text-primary hover:text-primary/80"
          >
            Solicitar otro
          </Link>
        </p>
      </form>
    </div>
  );
}
