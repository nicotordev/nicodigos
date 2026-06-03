import "server-only";

export function isCronConfigured(): boolean {
  return Boolean(process.env.CRON_SECRET?.trim());
}

export function verifyCronRequest(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return false;
  }

  const auth = request.headers.get("authorization");
  if (auth === `Bearer ${secret}`) {
    return true;
  }

  const headerSecret = request.headers.get("x-cron-secret");
  return headerSecret === secret;
}
