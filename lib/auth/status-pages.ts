import {
  getAuthErrorFromSearchParams,
  getSearchParam,
  resolveCallbackURL,
  type SignInSearchParams,
} from "@/lib/auth/sign-in-params";

export type AuthFlowOrigin =
  | "sign-in"
  | "sign-up"
  | "forgot-password"
  | "reset-password"
  | "resend-verification";

export type AuthSuccessCode =
  | "email_verified"
  | "password_reset"
  | "forgot_password_sent"
  | "verification_resent"
  | "magic_link_sign_in"
  | "magic_link_sign_up"
  | "signup_verification_sent";

type AuthSuccessContent = {
  title: string;
  description: string;
  hint?: string;
};

const AUTH_SUCCESS_CONTENT: Record<AuthSuccessCode, AuthSuccessContent> = {
  email_verified: {
    title: "Correo verificado",
    description:
      "Tu correo quedó confirmado. Ya puedes iniciar sesión en Nicodigos.",
  },
  password_reset: {
    title: "Contraseña actualizada",
    description: "Guardamos tu nueva contraseña. Inicia sesión para continuar.",
  },
  forgot_password_sent: {
    title: "Revisa tu bandeja de entrada",
    description:
      "Si existe una cuenta con ese correo, te enviamos un enlace para restablecer tu contraseña. El enlace caduca en una hora.",
    hint: "¿No lo ves? Revisa spam o promociones e inténtalo de nuevo en unos minutos.",
  },
  verification_resent: {
    title: "Correo enviado",
    description:
      "Si existe una cuenta pendiente de verificación con ese correo, recibirás un nuevo enlace en breve.",
    hint: "¿No llegó? Revisa spam o vuelve a intentarlo en unos minutos.",
  },
  magic_link_sign_in: {
    title: "Revisa tu correo",
    description:
      "Enviamos un enlace de acceso a tu cuenta. El enlace caduca en unos minutos.",
    hint: "¿No lo ves? Revisa spam o promociones.",
  },
  magic_link_sign_up: {
    title: "Revisa tu correo",
    description:
      "Enviamos un enlace para activar tu cuenta en Nicodigos. El enlace caduca en unos minutos.",
    hint: "¿No lo ves? Revisa spam o promociones.",
  },
  signup_verification_sent: {
    title: "Confirma tu correo",
    description:
      "Enviamos un enlace de verificación. Ábrelo para activar tu cuenta y poder iniciar sesión con contraseña.",
    hint: "¿No llegó el correo? Puedes solicitar otro enlace de verificación.",
  },
};

const AUTH_SUCCESS_CODES = new Set<string>(Object.keys(AUTH_SUCCESS_CONTENT));

export type AuthStatusPageParams = {
  code?: string;
  error?: string;
  message?: string;
  email?: string;
  callbackUrl?: string;
  from?: string;
};

function appendSearchParams(
  basePath: string,
  params: Record<string, string | undefined>,
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const query = search.toString();
  return query.length > 0 ? `${basePath}?${query}` : basePath;
}

export function buildAuthSuccessUrl(options: {
  code: AuthSuccessCode;
  callbackURL: string;
  email?: string;
  from?: AuthFlowOrigin;
}): string {
  return appendSearchParams("/auth/success", {
    code: options.code,
    callbackUrl: options.callbackURL,
    email: options.email,
    from: options.from,
  });
}

export function buildAuthErrorUrl(options: {
  callbackURL: string;
  from: AuthFlowOrigin;
  error?: string;
  message?: string;
  email?: string;
}): string {
  return appendSearchParams("/auth/error", {
    callbackUrl: options.callbackURL,
    from: options.from,
    error: options.error,
    message: options.message,
    email: options.email,
  });
}

export function buildAuthFlowHref(
  from: AuthFlowOrigin,
  callbackURL: string,
  email?: string,
): string {
  const encodedCallback = encodeURIComponent(callbackURL);
  const emailQuery = email ? `&email=${encodeURIComponent(email)}` : "";

  switch (from) {
    case "sign-up":
      return `/auth/sign-up?callbackUrl=${encodedCallback}${emailQuery}`;
    case "forgot-password":
      return `/auth/forgot-password?callbackUrl=${encodedCallback}${emailQuery}`;
    case "reset-password":
      return `/auth/reset-password?callbackUrl=${encodedCallback}`;
    case "resend-verification":
      return `/auth/resend-verification?callbackUrl=${encodedCallback}${emailQuery}`;
    default:
      return `/auth/sign-in?callbackUrl=${encodedCallback}${emailQuery}`;
  }
}

export function resolveAuthFlowOrigin(
  value: string | undefined,
): AuthFlowOrigin {
  if (
    value === "sign-up" ||
    value === "forgot-password" ||
    value === "reset-password" ||
    value === "resend-verification"
  ) {
    return value;
  }
  return "sign-in";
}

function formatSuccessBody(
  code: AuthSuccessCode,
  description: string,
  email?: string,
): string {
  if (!email) return description;

  switch (code) {
    case "forgot_password_sent":
      return `Si existe una cuenta con ${email}, te enviamos un enlace para restablecer tu contraseña. El enlace caduca en una hora.`;
    case "magic_link_sign_in":
      return `Enviamos un enlace de acceso a ${email}. El enlace caduca en unos minutos.`;
    case "magic_link_sign_up":
      return `Enviamos un enlace para activar tu cuenta a ${email}. El enlace caduca en unos minutos.`;
    case "signup_verification_sent":
      return `Enviamos un enlace de verificación a ${email}. Ábrelo para activar tu cuenta y poder iniciar sesión con contraseña.`;
    default:
      return description;
  }
}

export function resolveAuthSuccessPage(searchParams: SignInSearchParams) {
  const code = getSearchParam(searchParams, "code");
  if (!code || !AUTH_SUCCESS_CODES.has(code)) {
    return null;
  }

  const successCode = code as AuthSuccessCode;
  const content = AUTH_SUCCESS_CONTENT[successCode];
  const email = getSearchParam(searchParams, "email");
  const callbackURL = resolveCallbackURL(searchParams);
  const from = resolveAuthFlowOrigin(getSearchParam(searchParams, "from"));
  const signInHref = `/auth/sign-in?callbackUrl=${encodeURIComponent(callbackURL)}`;
  const body = formatSuccessBody(successCode, content.description, email);

  const secondaryActions: { href: string; label: string }[] = [];

  if (code === "signup_verification_sent") {
    secondaryActions.push({
      href: `/auth/resend-verification?${new URLSearchParams({
        callbackUrl: callbackURL,
        ...(email ? { email } : {}),
      }).toString()}`,
      label: "Reenviar verificación",
    });
  }

  if (
    code === "magic_link_sign_in" ||
    code === "magic_link_sign_up" ||
    code === "forgot_password_sent"
  ) {
    secondaryActions.push({
      href: buildAuthFlowHref(from, callbackURL, email),
      label: from === "sign-up" ? "Volver al registro" : "Usar otro correo",
    });
  }

  return {
    code: successCode,
    title: content.title,
    body,
    hint: content.hint,
    email,
    callbackURL,
    from,
    signInHref,
    secondaryActions,
  };
}

export function resolveAuthErrorPage(searchParams: SignInSearchParams) {
  const callbackURL = resolveCallbackURL(searchParams);
  const from = resolveAuthFlowOrigin(getSearchParam(searchParams, "from"));
  const retryHref = buildAuthFlowHref(
    from,
    callbackURL,
    getSearchParam(searchParams, "email"),
  );
  const signInHref = `/auth/sign-in?callbackUrl=${encodeURIComponent(callbackURL)}`;

  const message =
    getSearchParam(searchParams, "message") ??
    getAuthErrorFromSearchParams(searchParams) ??
    "No pudimos completar la acción. Inténtalo de nuevo.";

  const titles: Partial<Record<string, string>> = {
    INVALID_TOKEN: "Enlace no válido",
    TOKEN_EXPIRED: "Enlace caducado",
    EMAIL_NOT_VERIFIED: "Correo sin verificar",
  };

  const errorCode = getSearchParam(searchParams, "error");
  const title = (errorCode && titles[errorCode]) || "Algo salió mal";

  return {
    title,
    message,
    callbackURL,
    from,
    retryHref,
    signInHref,
    showForgotPassword:
      from === "sign-in" ||
      from === "reset-password" ||
      errorCode === "INVALID_TOKEN" ||
      errorCode === "TOKEN_EXPIRED",
    forgotPasswordHref: `/auth/forgot-password?callbackUrl=${encodeURIComponent(callbackURL)}`,
  };
}

/** Redirect legacy query params on sign-in / sign-up to dedicated status pages. */
export function getLegacyAuthStatusRedirect(
  searchParams: SignInSearchParams,
  from: AuthFlowOrigin,
): string | null {
  const callbackURL = resolveCallbackURL(searchParams);

  if (getSearchParam(searchParams, "verified") === "1") {
    return buildAuthSuccessUrl({ code: "email_verified", callbackURL });
  }

  if (getSearchParam(searchParams, "reset") === "success") {
    return buildAuthSuccessUrl({ code: "password_reset", callbackURL });
  }

  if (
    getSearchParam(searchParams, "status") === "sent" &&
    from === "forgot-password"
  ) {
    return buildAuthSuccessUrl({
      code: "forgot_password_sent",
      callbackURL,
      email: getSearchParam(searchParams, "email"),
      from,
    });
  }

  const errorCode = getSearchParam(searchParams, "error");
  const message =
    getSearchParam(searchParams, "message") ??
    getSearchParam(searchParams, "error_description");
  if (errorCode || message) {
    const isPlainMessage = errorCode?.includes(" ");
    return buildAuthErrorUrl({
      callbackURL,
      from,
      error: errorCode && !isPlainMessage ? errorCode : undefined,
      message: message ?? (isPlainMessage ? errorCode : undefined),
      email: getSearchParam(searchParams, "email"),
    });
  }

  return null;
}

export function buildPostVerificationSignInUrl(destination: string): string {
  return buildAuthSuccessUrl({
    code: "email_verified",
    callbackURL: destination,
  });
}

export function buildPostResetSignInUrl(destination: string): string {
  return buildAuthSuccessUrl({
    code: "password_reset",
    callbackURL: destination,
  });
}
