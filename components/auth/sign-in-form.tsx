"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import {
  AuthMethodTabs,
  type AuthMethod,
} from "@/components/auth/auth-method-tabs";
import {
  AuthCaptchaProvider,
  AuthTurnstileField,
  useAuthCaptcha,
} from "@/components/auth/auth-turnstile";
import { signIn } from "@/lib/auth-client";
import { captchaFetchOptions } from "@/lib/turnstile";
import {
  getSearchParam,
  type SignInSearchParams,
} from "@/lib/auth/sign-in-params";
import {
  buildAuthErrorUrl,
  buildAuthSuccessUrl,
} from "@/lib/auth/status-pages";
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

const magicLinkSchema = z.object({
  email: z.email("Introduce un correo electrónico válido"),
});

const passwordSignInSchema = z.object({
  email: z.email("Introduce un correo electrónico válido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
  rememberMe: z.boolean(),
});

type MagicLinkValues = z.infer<typeof magicLinkSchema>;
type PasswordSignInValues = z.infer<typeof passwordSignInSchema>;

export interface SignInFormProps {
  callbackURL: string;
  searchParams: SignInSearchParams;
}

function SignInFormInner({ callbackURL, searchParams }: SignInFormProps) {
  const router = useRouter();
  const [method, setMethod] = React.useState<AuthMethod>("magic-link");
  const {
    token: captchaToken,
    reset: resetCaptcha,
    isReady: captchaReady,
  } = useAuthCaptcha();
  const [submissionError, setSubmissionError] = React.useState<string | null>(
    null,
  );
  const authError = submissionError;

  const magicLinkForm = useForm<MagicLinkValues>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: {
      email: getSearchParam(searchParams, "email") ?? "",
    },
  });

  const passwordForm = useForm<PasswordSignInValues>({
    resolver: zodResolver(passwordSignInSchema),
    defaultValues: {
      email: getSearchParam(searchParams, "email") ?? "",
      password: "",
      rememberMe: false,
    },
  });

  const isSubmitting =
    magicLinkForm.formState.isSubmitting || passwordForm.formState.isSubmitting;
  const forgotPasswordHref = `/auth/forgot-password?callbackUrl=${encodeURIComponent(callbackURL)}`;
  const signInErrorCallbackURL = buildAuthErrorUrl({
    callbackURL,
    from: "sign-in",
  });

  async function onMagicLinkSubmit(values: MagicLinkValues) {
    setSubmissionError(null);

    const { error } = await signIn.magicLink({
      email: values.email,
      callbackURL,
      errorCallbackURL: signInErrorCallbackURL,
      fetchOptions: captchaFetchOptions(captchaToken),
    });

    if (error) {
      resetCaptcha();
      setSubmissionError(
        error.message ?? "No se pudo enviar el enlace. Inténtalo de nuevo.",
      );
      return;
    }

    router.push(
      buildAuthSuccessUrl({
        code: "magic_link_sign_in",
        callbackURL,
        email: values.email,
        from: "sign-in",
      }),
    );
  }

  async function onPasswordSubmit(values: PasswordSignInValues) {
    setSubmissionError(null);

    const { error } = await signIn.email({
      email: values.email,
      password: values.password,
      rememberMe: values.rememberMe,
      callbackURL,
      fetchOptions: captchaFetchOptions(captchaToken),
    });

    if (error) {
      resetCaptcha();
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

  function handleMethodChange(next: AuthMethod) {
    if (next === "password") {
      const email = magicLinkForm.getValues("email");
      if (email) passwordForm.setValue("email", email);
    } else {
      const email = passwordForm.getValues("email");
      if (email) magicLinkForm.setValue("email", email);
    }

    setMethod(next);
    setSubmissionError(null);
    resetCaptcha();
  }

  return (
    <div className="mt-4">
      {authError ? (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{authError}</AlertDescription>
        </Alert>
      ) : null}

      <AuthMethodTabs
        method={method}
        onMethodChange={handleMethodChange}
        className="mb-6"
      />

      {method === "magic-link" ? (
        <form
          onSubmit={magicLinkForm.handleSubmit(onMagicLinkSubmit)}
          className="space-y-6"
          noValidate
        >
          <FieldGroup>
            <Controller
              name="email"
              control={magicLinkForm.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={!!fieldState.error}>
                  <FieldLabel htmlFor="sign-in-magic-email">
                    Correo electrónico
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      {...field}
                      id="sign-in-magic-email"
                      type="email"
                      autoComplete="email"
                      placeholder="tu@correo.com"
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
            {magicLinkForm.formState.isSubmitting ? (
              <>
                <Spinner />
                Enviando enlace…
              </>
            ) : (
              "Enviar enlace de acceso"
            )}
          </Button>
        </form>
      ) : (
        <form
          onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
          className="space-y-6"
          noValidate
        >
          <FieldGroup>
            <Controller
              name="email"
              control={passwordForm.control}
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
              control={passwordForm.control}
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
              control={passwordForm.control}
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

          <AuthTurnstileField />

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isSubmitting || !captchaReady}
          >
            {passwordForm.formState.isSubmitting ? (
              <>
                <Spinner />
                Iniciando sesión…
              </>
            ) : (
              "Iniciar sesión"
            )}
          </Button>
        </form>
      )}

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

export function SignInForm(props: SignInFormProps) {
  return (
    <AuthCaptchaProvider>
      <SignInFormInner {...props} />
    </AuthCaptchaProvider>
  );
}
