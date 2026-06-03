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

export function getAuthErrorFromSearchParams(
  searchParams: SignInSearchParams,
): string | null {
  return (
    getSearchParam(searchParams, "error_description") ??
    getSearchParam(searchParams, "error") ??
    getSearchParam(searchParams, "message") ??
    null
  );
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
