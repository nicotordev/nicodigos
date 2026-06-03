"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { IconMail } from "@tabler/icons-react";
import {
  AuthMethodTabs,
  type AuthMethod,
} from "@/components/auth/auth-method-tabs";
import { MagicLinkSent } from "@/components/auth/magic-link-sent";
import {
  AuthCaptchaProvider,
  AuthTurnstileField,
  useAuthCaptcha,
} from "@/components/auth/auth-turnstile";
import { signIn, signUp } from "@/lib/auth-client";
import { captchaFetchOptions } from "@/lib/turnstile";
import {
  buildPostVerificationSignInUrl,
  getAuthErrorFromSearchParams,
  getSearchParam,
  type SignInSearchParams,
} from "@/lib/auth/sign-in-params";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

const magicLinkSignUpSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(64, "El nombre es demasiado largo"),
  email: z.email("Introduce un correo electrónico válido"),
});

const passwordSignUpSchema = z
  .object({
    name: z
      .string()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(64, "El nombre es demasiado largo"),
    email: z.email("Introduce un correo electrónico válido"),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type MagicLinkSignUpValues = z.infer<typeof magicLinkSignUpSchema>;
type PasswordSignUpValues = z.infer<typeof passwordSignUpSchema>;

export interface SignUpFormProps {
  callbackURL: string;
  searchParams: SignInSearchParams;
}

function SignUpFormInner({ callbackURL, searchParams }: SignUpFormProps) {
  const router = useRouter();
  const [method, setMethod] = React.useState<AuthMethod>("magic-link");
  const [magicLinkSentEmail, setMagicLinkSentEmail] = React.useState<
    string | null
  >(null);
  const [pendingVerificationEmail, setPendingVerificationEmail] =
    React.useState<string | null>(null);
  const {
    token: captchaToken,
    reset: resetCaptcha,
    isReady: captchaReady,
  } = useAuthCaptcha();
  const [submissionError, setSubmissionError] = React.useState<string | null>(
    null,
  );
  const urlError = getAuthErrorFromSearchParams(searchParams);
  const authError = submissionError ?? urlError;

  const magicLinkForm = useForm<MagicLinkSignUpValues>({
    resolver: zodResolver(magicLinkSignUpSchema),
    defaultValues: {
      name: "",
      email: getSearchParam(searchParams, "email") ?? "",
    },
  });

  const passwordForm = useForm<PasswordSignUpValues>({
    resolver: zodResolver(passwordSignUpSchema),
    defaultValues: {
      name: "",
      email: getSearchParam(searchParams, "email") ?? "",
      password: "",
      confirmPassword: "",
    },
  });

  const isSubmitting =
    magicLinkForm.formState.isSubmitting || passwordForm.formState.isSubmitting;
  const signInHref = `/auth/sign-in?callbackUrl=${encodeURIComponent(callbackURL)}`;
  const signUpErrorCallbackURL = `/auth/sign-up?callbackUrl=${encodeURIComponent(callbackURL)}`;
  const signInErrorCallbackURL = `/auth/sign-in?callbackUrl=${encodeURIComponent(callbackURL)}`;

  async function onMagicLinkSubmit(values: MagicLinkSignUpValues) {
    setSubmissionError(null);

    const { error } = await signIn.magicLink({
      email: values.email,
      name: values.name.trim(),
      callbackURL,
      newUserCallbackURL: callbackURL,
      errorCallbackURL: signUpErrorCallbackURL,
      fetchOptions: captchaFetchOptions(captchaToken),
    });

    if (error) {
      resetCaptcha();
      setSubmissionError(
        error.message ?? "No se pudo enviar el enlace. Inténtalo de nuevo.",
      );
      return;
    }

    setMagicLinkSentEmail(values.email);
  }

  async function onPasswordSubmit(values: PasswordSignUpValues) {
    setSubmissionError(null);

    const { data, error } = await signUp.email({
      name: values.name.trim(),
      email: values.email,
      password: values.password,
      callbackURL: buildPostVerificationSignInUrl(callbackURL),
      fetchOptions: captchaFetchOptions(captchaToken),
    });

    if (error) {
      resetCaptcha();
      setSubmissionError(
        error.message ?? "No se pudo crear la cuenta. Inténtalo de nuevo.",
      );
      return;
    }

    if (data?.user && !data.user.emailVerified) {
      setPendingVerificationEmail(values.email);
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
        error.message ??
          "No se pudo continuar con ese proveedor. Inténtalo de nuevo.",
      );
    }
  }

  function handleMethodChange(next: AuthMethod) {
    if (next === "password") {
      const { name, email } = magicLinkForm.getValues();
      if (name) passwordForm.setValue("name", name);
      if (email) passwordForm.setValue("email", email);
    } else {
      const { name, email } = passwordForm.getValues();
      if (name) magicLinkForm.setValue("name", name);
      if (email) magicLinkForm.setValue("email", email);
    }

    setMethod(next);
    setSubmissionError(null);
    setMagicLinkSentEmail(null);
    resetCaptcha();
  }

  if (magicLinkSentEmail) {
    return (
      <MagicLinkSent
        email={magicLinkSentEmail}
        description="Enviamos un enlace para activar tu cuenta a"
        backHref={signUpErrorCallbackURL}
        backLabel="Volver al registro"
      />
    );
  }

  if (pendingVerificationEmail) {
    const resendHref = `/auth/resend-verification?${new URLSearchParams({
      email: pendingVerificationEmail,
      callbackUrl: callbackURL,
    }).toString()}`;

    return (
      <div className="mt-4 space-y-6">
        <Alert className="border-primary/25 bg-primary/5">
          <IconMail className="size-4 text-primary" aria-hidden />
          <AlertTitle>Confirma tu correo</AlertTitle>
          <AlertDescription>
            Enviamos un enlace de verificación a{" "}
            <span className="font-medium text-foreground">
              {pendingVerificationEmail}
            </span>
            . Ábrelo para activar tu cuenta y poder iniciar sesión con
            contraseña.
          </AlertDescription>
        </Alert>

        <p className="text-sm text-muted-foreground">
          ¿No llegó el correo?{" "}
          <Link
            href={resendHref}
            className="font-semibold text-primary hover:text-primary/80"
          >
            Reenviar verificación
          </Link>
          {" · "}
          <Link
            href={signInHref}
            className="font-semibold text-primary hover:text-primary/80"
          >
            Iniciar sesión
          </Link>
        </p>

        <Button variant="outline" className="w-full" asChild>
          <Link href={signInHref}>Ir a iniciar sesión</Link>
        </Button>
      </div>
    );
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
              name="name"
              control={magicLinkForm.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={!!fieldState.error}>
                  <FieldLabel htmlFor="sign-up-magic-name">Nombre</FieldLabel>
                  <FieldContent>
                    <Input
                      {...field}
                      id="sign-up-magic-name"
                      type="text"
                      autoComplete="name"
                      placeholder="Tu nombre"
                      aria-invalid={!!fieldState.error}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </FieldContent>
                </Field>
              )}
            />

            <Controller
              name="email"
              control={magicLinkForm.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={!!fieldState.error}>
                  <FieldLabel htmlFor="sign-up-magic-email">
                    Correo electrónico
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      {...field}
                      id="sign-up-magic-email"
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
            {magicLinkForm.formState.isSubmitting ? (
              <>
                <Spinner />
                Enviando enlace…
              </>
            ) : (
              "Crear cuenta"
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
              name="name"
              control={passwordForm.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={!!fieldState.error}>
                  <FieldLabel htmlFor="sign-up-name">Nombre</FieldLabel>
                  <FieldContent>
                    <Input
                      {...field}
                      id="sign-up-name"
                      type="text"
                      autoComplete="name"
                      placeholder="Tu nombre"
                      aria-invalid={!!fieldState.error}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </FieldContent>
                </Field>
              )}
            />

            <Controller
              name="email"
              control={passwordForm.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={!!fieldState.error}>
                  <FieldLabel htmlFor="sign-up-email">
                    Correo electrónico
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      {...field}
                      id="sign-up-email"
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
                  <FieldLabel htmlFor="sign-up-password">Contraseña</FieldLabel>
                  <FieldContent>
                    <Input
                      {...field}
                      id="sign-up-password"
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
              control={passwordForm.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={!!fieldState.error}>
                  <FieldLabel htmlFor="sign-up-confirm-password">
                    Confirmar contraseña
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      {...field}
                      id="sign-up-confirm-password"
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
                Creando cuenta…
              </>
            ) : (
              "Crear cuenta"
            )}
          </Button>
        </form>
      )}

      <div className="mt-10">
        <FieldSeparator>O regístrate con</FieldSeparator>

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

export function SignUpForm(props: SignUpFormProps) {
  return (
    <AuthCaptchaProvider>
      <SignUpFormInner {...props} />
    </AuthCaptchaProvider>
  );
}
