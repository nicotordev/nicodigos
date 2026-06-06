export function normalizeCountryLimitations(
  values: string[] | undefined,
): string[] {
  return (values ?? [])
    .map((value) => value.trim().toUpperCase())
    .filter(Boolean);
}

export function isCountryExcluded(
  limitations: string[] | undefined,
  countryCode: string,
): boolean {
  const code = countryCode.trim().toUpperCase();
  if (!code) {
    return false;
  }

  return normalizeCountryLimitations(limitations).includes(code);
}
