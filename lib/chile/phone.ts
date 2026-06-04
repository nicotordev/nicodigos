import {
  isValidPhoneNumber,
  parsePhoneNumber,
  type CountryCode,
} from "libphonenumber-js";

/** País por defecto del marketplace (Chile). */
export const CHECKOUT_PHONE_COUNTRY: CountryCode = "CL";

export const CHECKOUT_PHONE_INVALID_MESSAGE =
  "Ingresa un teléfono móvil o fijo válido en Chile.";

export function isValidCheckoutPhone(
  phone: string,
  country: CountryCode = CHECKOUT_PHONE_COUNTRY,
): boolean {
  const trimmed = phone.trim();
  if (!trimmed) return false;

  try {
    return isValidPhoneNumber(trimmed, country);
  } catch {
    return false;
  }
}

/** Formato internacional (+56 …) para guardar en pedido y perfil. */
export function normalizeCheckoutPhone(
  phone: string,
  country: CountryCode = CHECKOUT_PHONE_COUNTRY,
): string {
  const trimmed = phone.trim();
  if (!trimmed) return "";

  try {
    const parsed = parsePhoneNumber(trimmed, country);
    if (parsed?.isValid()) {
      return parsed.formatInternational();
    }
  } catch {
    // Mantener valor original si no se puede parsear (el schema ya rechazará).
  }

  return trimmed;
}
