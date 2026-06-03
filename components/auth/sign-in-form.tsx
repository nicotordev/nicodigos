"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { signIn } from "@/lib/auth-client";
import {
  getAuthErrorFromSearchParams,
  getSearchParam,
  type SignInSearchParams,
} from "@/lib/auth/sign-in-params";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

const signInSchema = z.object({
  email: z.email("Introduce un correo electrónico válido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
  rememberMe: z.boolean(),
});

type SignInValues = z.infer<typeof signInSchema>;

export interface SignInFormProps {
  callbackURL: string;
  searchParams: SignInSearchParams;
}

export function SignInForm({ callbackURL, searchParams }: SignInFormProps) {
  const router = useRouter();
  const [submissionError, setSubmissionError] = React.useState<string | null>(
    null,
  );
  const urlError = getAuthErrorFromSearchParams(searchParams);
  const authError = submissionError ?? urlError;

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: getSearchParam(searchParams, "email") ?? "",
      password: "",
      rememberMe: false,
    },
  });

  const isSubmitting = form.formState.isSubmitting;
  const forgotPasswordHref = `/auth/forgot-password?callbackUrl=${encodeURIComponent(callbackURL)}`;
  const signInErrorCallbackURL = `/auth/sign-in?callbackUrl=${encodeURIComponent(callbackURL)}`;

  async function onSubmit(values: SignInValues) {
    setSubmissionError(null);

    const { error } = await signIn.email({
      email: values.email,
      password: values.password,
      rememberMe: values.rememberMe,
      callbackURL,
    });

    if (error) {
      setSubmissionError(
        error.message ?? "No se pudo iniciar sesión. Inténtalo de nuevo.",
      );
      return;
    }

    router.push(callbackURL);
    router.refresh();
  }

  async function handleSocial(provider: "google" | "github") {
    setSubmissionError(null);

    const { error } = await signIn.social({
      provider,
      callbackURL,
      errorCallbackURL: signInErrorCallbackURL,
    });

    if (error) {
      setSubmissionError(
        error.message ?? "No se pudo iniciar sesión con ese proveedor.",
      );
    }
  }

  return (
    <div className="mt-10">
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
        noValidate
      >
        {authError ? (
          <Alert variant="destructive">
            <AlertDescription>{authError}</AlertDescription>
          </Alert>
        ) : null}

        <FieldGroup>
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel htmlFor="sign-in-email">
                  Correo electrónico
                </FieldLabel>
                <FieldContent>
                  <Input
                    {...field}
                    id="sign-in-email"
                    type="email"
                    autoComplete="email"
                    aria-invalid={!!fieldState.error}
                  />
                  <FieldError errors={[fieldState.error]} />
                </FieldContent>
              </Field>
            )}
          />

          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel htmlFor="sign-in-password">Contraseña</FieldLabel>
                <FieldContent>
                  <Input
                    {...field}
                    id="sign-in-password"
                    type="password"
                    autoComplete="current-password"
                    aria-invalid={!!fieldState.error}
                  />
                  <FieldError errors={[fieldState.error]} />
                </FieldContent>
              </Field>
            )}
          />
        </FieldGroup>

        <div className="flex items-center justify-between gap-4">
          <Controller
            name="rememberMe"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                orientation="horizontal"
                data-invalid={!!fieldState.error}
                className="w-auto"
              >
                <Checkbox
                  id="remember-me"
                  checked={field.value}
                  onCheckedChange={(checked) =>
                    field.onChange(checked === true)
                  }
                  aria-invalid={!!fieldState.error}
                />
                <FieldLabel htmlFor="remember-me" className="font-normal">
                  Recordarme
                </FieldLabel>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Button variant="link" className="h-auto shrink-0 p-0" asChild>
            <Link href={forgotPasswordHref}>¿Olvidaste tu contraseña?</Link>
          </Button>
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Spinner />
              Iniciando sesión…
            </>
          ) : (
            "Iniciar sesión"
          )}
        </Button>
      </form>

      <div className="mt-10">
        <FieldSeparator>O continúa con</FieldSeparator>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => handleSocial("google")}
            disabled={isSubmitting}
          >
            <FcGoogle className="size-5" aria-hidden />
            Google
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => handleSocial("github")}
            disabled={isSubmitting}
          >
            <FaGithub className="size-5 text-[#24292F]" aria-hidden />
            GitHub
          </Button>
        </div>
      </div>
    </div>
  );
}
