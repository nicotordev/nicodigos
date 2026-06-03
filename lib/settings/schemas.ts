import { z } from "zod";

const identificationTypeSchema = z.enum(["RUT", "DNI", "PASSPORT", "TAX_ID"]);
const holderTypeSchema = z.enum(["person", "company"]);
const addressTypeSchema = z.enum(["billing", "shipping"]);
const themeSchema = z.enum(["system", "light", "dark"]);
const contentDensitySchema = z.enum(["comfortable", "compact"]);
const emailFormatSchema = z.enum(["html", "plain"]);

export const profileSettingsSchema = z.object({
  fullName: z.string().trim().min(1, "El nombre es obligatorio").max(120),
  email: z.email("Correo electrónico no válido"),
  phone: z.string().trim().max(32).optional().default(""),
  image: z.string().nullable(),
  language: z.string().trim().min(2).max(10),
  timezone: z.string().trim().min(1).max(64),
});

export const identificationSettingsSchema = z.object({
  identificationType: identificationTypeSchema,
  identificationNumber: z.string().trim().max(64).optional().default(""),
  country: z.string().trim().length(2),
  holderType: holderTypeSchema,
  companyName: z.string().trim().max(160).optional().default(""),
  companyTaxId: z.string().trim().max(64).optional().default(""),
});

export const userAddressSchema = z.object({
  id: z.string().min(1),
  type: addressTypeSchema,
  label: z.string().trim().min(1).max(80),
  country: z.string().trim().length(2),
  region: z.string().trim().max(80).optional().default(""),
  city: z.string().trim().max(80).optional().default(""),
  commune: z.string().trim().max(80).optional().default(""),
  street: z.string().trim().max(200).optional().default(""),
  unit: z.string().trim().max(40).optional().default(""),
  postalCode: z.string().trim().max(20).optional().default(""),
  isDefault: z.boolean(),
});

export const notificationPreferencesSchema = z.object({
  email: z.boolean(),
  push: z.boolean(),
  smsWhatsApp: z.boolean(),
  productUpdates: z.boolean(),
  orderUpdates: z.boolean(),
  securityAlerts: z.boolean(),
  marketing: z.boolean(),
  newsletter: z.boolean(),
  reminders: z.boolean(),
});

export const privacySecuritySettingsSchema = z.object({
  loginAlerts: z.boolean(),
  twoFactorEnabled: z.boolean(),
});

export const appPreferencesSchema = z.object({
  theme: themeSchema,
  language: z.string().trim().min(2).max(10),
  currency: z.string().trim().length(3),
  defaultCountry: z.string().trim().length(2),
  contentDensity: contentDensitySchema,
  emailFormat: emailFormatSchema,
  reducedMotion: z.boolean(),
});

export const saveUserSettingsSchema = z.object({
  profile: profileSettingsSchema,
  identification: identificationSettingsSchema,
  addresses: z.array(userAddressSchema),
  notifications: notificationPreferencesSchema,
  privacy: privacySecuritySettingsSchema,
  preferences: appPreferencesSchema,
});

export type SaveUserSettingsInput = z.infer<typeof saveUserSettingsSchema>;
