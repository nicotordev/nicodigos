/** Header expected by Better Auth captcha plugin. */
export const TURNSTILE_RESPONSE_HEADER = "x-captcha-response";

export function getTurnstileSiteKey(): string {
  return process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
}

export function getTurnstileSecretKey(): string {
  return process.env.TURNSTILE_SECRET_KEY ?? "";
}

/** Client-safe: only NEXT_PUBLIC_* is available in the browser bundle. */
export function isTurnstileEnabled(): boolean {
  return Boolean(getTurnstileSiteKey());
}

/** Server-only: captcha plugin needs both keys (secret is never sent to the client). */
export function isTurnstileServerConfigured(): boolean {
  return isTurnstileEnabled() && Boolean(getTurnstileSecretKey());
}

export function captchaFetchOptions(token: string | null | undefined) {
  if (!isTurnstileEnabled() || !token) {
    return undefined;
  }

  return {
    headers: {
      [TURNSTILE_RESPONSE_HEADER]: token,
    },
  } as const;
}

export function mergeHeadersWithCaptcha(
  base: Headers,
  captchaToken: string | null | undefined,
): Headers {
  const merged = new Headers(base);

  if (isTurnstileServerConfigured() && captchaToken) {
    merged.set(TURNSTILE_RESPONSE_HEADER, captchaToken);
  }

  return merged;
}
