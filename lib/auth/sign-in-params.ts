export type SignInSearchParams = Record<string, string>;

export function normalizePageSearchParams(searchParams: {
  [key: string]: string | string[] | undefined;
}): SignInSearchParams {
  const record: SignInSearchParams = {};

  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === "string" && value.length > 0) {
      record[key] = value;
    } else if (Array.isArray(value) && typeof value[0] === "string") {
      record[key] = value[0];
    }
  }

  return record;
}

export function getSearchParam(
  searchParams: SignInSearchParams,
  key: string,
): string | undefined {
  return searchParams[key];
}

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  INVALID_TOKEN: "El enlace no es válido o ya fue usado.",
  TOKEN_EXPIRED: "El enlace ha caducado. Solicita uno nuevo.",
  USER_NOT_FOUND: "No encontramos esa cuenta.",
  EMAIL_NOT_VERIFIED: "Confirma tu correo antes de iniciar sesión.",
  failed_to_create_user: "No se pudo crear la cuenta. Inténtalo de nuevo.",
  new_user_signup_disabled: "El registro con enlace no está disponible.",
  failed_to_create_session: "No se pudo iniciar sesión. Inténtalo de nuevo.",
};

export function getAuthErrorFromSearchParams(
  searchParams: SignInSearchParams,
): string | null {
  const errorCode = getSearchParam(searchParams, "error");
  if (errorCode && AUTH_ERROR_MESSAGES[errorCode]) {
    return AUTH_ERROR_MESSAGES[errorCode];
  }

  return (
    getSearchParam(searchParams, "error_description") ??
    errorCode ??
    getSearchParam(searchParams, "message") ??
    null
  );
}

export type AuthStatusNotice = {
  type: "success" | "error";
  message: string;
};

export function getAuthStatusFromSearchParams(
  searchParams: SignInSearchParams,
): AuthStatusNotice | null {
  if (getSearchParam(searchParams, "verified") === "1") {
    return {
      type: "success",
      message: "Tu correo fue verificado. Ya puedes iniciar sesión.",
    };
  }

  if (getSearchParam(searchParams, "reset") === "success") {
    return {
      type: "success",
      message:
        "Contraseña actualizada correctamente. Inicia sesión con tu nueva contraseña.",
    };
  }

  const error = getAuthErrorFromSearchParams(searchParams);
  if (error && getSearchParam(searchParams, "error")) {
    return { type: "error", message: error };
  }

  return null;
}

export function buildPostVerificationSignInUrl(destination: string): string {
  const params = new URLSearchParams({
    verified: "1",
    callbackUrl: destination,
  });
  return `/auth/sign-in?${params.toString()}`;
}

export function buildPostResetSignInUrl(destination: string): string {
  const params = new URLSearchParams({
    reset: "success",
    callbackUrl: destination,
  });
  return `/auth/sign-in?${params.toString()}`;
}

const DEFAULT_CALLBACK_URL = "/dashboard";

export function resolveCallbackURL(searchParams: SignInSearchParams): string {
  const callbackUrl = getSearchParam(searchParams, "callbackUrl");
  if (!callbackUrl) {
    return DEFAULT_CALLBACK_URL;
  }

  if (callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")) {
    return callbackUrl;
  }

  return DEFAULT_CALLBACK_URL;
}
