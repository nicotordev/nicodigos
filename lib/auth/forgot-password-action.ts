"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/lib/auth";
import {
  normalizePageSearchParams,
  resolveCallbackURL,
  type SignInSearchParams,
} from "@/lib/auth/sign-in-params";
import {
  buildAuthErrorUrl,
  buildAuthSuccessUrl,
} from "@/lib/auth/status-pages";
import {
  isTurnstileServerConfigured,
  mergeHeadersWithCaptcha,
} from "@/lib/turnstile";

const emailSchema = z.object({
  email: z.email("Introduce un correo electrónico válido"),
});

export async function requestForgotPassword(formData: FormData) {
  const rawSearchParams = formData.get("searchParams");
  let searchParams: SignInSearchParams = {};

  if (typeof rawSearchParams === "string" && rawSearchParams.length > 0) {
    try {
      searchParams = normalizePageSearchParams(
        JSON.parse(rawSearchParams) as {
          [key: string]: string | string[] | undefined;
        },
      );
    } catch {
      searchParams = {};
    }
  }

  const callbackURL = resolveCallbackURL(searchParams);
  const resetPasswordPath = `/auth/reset-password?callbackUrl=${encodeURIComponent(callbackURL)}`;
  const email = String(formData.get("email") ?? "").trim();
  const captchaToken =
    String(formData.get("captchaToken") ?? "").trim() || null;

  if (isTurnstileServerConfigured() && !captchaToken) {
    redirect(
      buildAuthErrorUrl({
        callbackURL,
        from: "forgot-password",
        message: "Completa la verificación de seguridad antes de continuar.",
        email,
      }),
    );
  }

  const parsed = emailSchema.safeParse({ email });
  if (!parsed.success) {
    redirect(
      buildAuthErrorUrl({
        callbackURL,
        from: "forgot-password",
        message: parsed.error.issues[0]?.message ?? "Correo inválido",
        email,
      }),
    );
  }

  try {
    await auth.api.requestPasswordReset({
      body: {
        email: parsed.data.email,
        redirectTo: resetPasswordPath,
      },
      headers: mergeHeadersWithCaptcha(await headers(), captchaToken),
    });
  } catch {
    redirect(
      buildAuthErrorUrl({
        callbackURL,
        from: "forgot-password",
        message:
          "No pudimos enviar el correo. Inténtalo de nuevo en unos minutos.",
        email: parsed.data.email,
      }),
    );
  }

  redirect(
    buildAuthSuccessUrl({
      code: "forgot_password_sent",
      callbackURL,
      email: parsed.data.email,
      from: "forgot-password",
    }),
  );
}
