import { clean, format, validate } from "rut.js";

export const RUT_INVALID_MESSAGE = "RUT no válido";

/** Normaliza RUT chileno a cuerpo-DV sin puntos (ej. 12345678-5). */
export function normalizeRut(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  if (validate(trimmed)) {
    return format(trimmed, { dots: false });
  }

  const cleaned = clean(trimmed);
  if (cleaned.length < 2) {
    return trimmed;
  }

  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);
  return `${body}-${dv}`;
}

export function isValidRut(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }

  return validate(trimmed);
}
