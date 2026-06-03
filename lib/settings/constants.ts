import type { IdentificationType } from "@/lib/settings/types";

export const LANGUAGE_OPTIONS = [
  { value: "es", label: "Español" },
  { value: "en", label: "English" },
  { value: "pt", label: "Português" },
] as const;

export const TIMEZONE_OPTIONS = [
  { value: "America/Santiago", label: "Santiago (GMT-3)" },
  { value: "America/Buenos_Aires", label: "Buenos Aires (GMT-3)" },
  { value: "America/Mexico_City", label: "Ciudad de México (GMT-6)" },
  { value: "Europe/Madrid", label: "Madrid (GMT+1)" },
  { value: "UTC", label: "UTC" },
] as const;

export const COUNTRY_OPTIONS = [
  { value: "CL", label: "Chile" },
  { value: "AR", label: "Argentina" },
  { value: "MX", label: "México" },
  { value: "ES", label: "España" },
  { value: "US", label: "Estados Unidos" },
] as const;

export const IDENTIFICATION_TYPE_OPTIONS: {
  value: IdentificationType;
  label: string;
  helper?: string;
}[] = [
  { value: "RUT", label: "RUT", helper: "Rol Único Tributario (Chile)" },
  { value: "DNI", label: "DNI", helper: "Documento nacional de identidad" },
  { value: "PASSPORT", label: "Pasaporte" },
  {
    value: "TAX_ID",
    label: "Tax ID",
    helper: "Identificador fiscal internacional",
  },
];

export const CURRENCY_OPTIONS = [
  { value: "EUR", label: "Euro (EUR)" },
  { value: "USD", label: "Dólar (USD)" },
  { value: "CLP", label: "Peso chileno (CLP)" },
] as const;

export const ADDRESS_TYPE_LABELS = {
  billing: "Facturación",
  shipping: "Envío",
} as const;
