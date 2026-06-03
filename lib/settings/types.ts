export type IdentificationType = "RUT" | "DNI" | "PASSPORT" | "TAX_ID";

export type AccountHolderType = "person" | "company";

export type AddressType = "billing" | "shipping";

export type UserAddress = {
  id: string;
  type: AddressType;
  label: string;
  country: string;
  region: string;
  city: string;
  commune: string;
  street: string;
  unit: string;
  postalCode: string;
  isDefault: boolean;
};

export type ProfileSettings = {
  fullName: string;
  email: string;
  phone: string;
  image: string | null;
  language: string;
  timezone: string;
};

export type IdentificationSettings = {
  identificationType: IdentificationType;
  identificationNumber: string;
  country: string;
  holderType: AccountHolderType;
  companyName: string;
  companyTaxId: string;
};

export type NotificationPreferences = {
  email: boolean;
  push: boolean;
  smsWhatsApp: boolean;
  productUpdates: boolean;
  orderUpdates: boolean;
  securityAlerts: boolean;
  marketing: boolean;
  newsletter: boolean;
  reminders: boolean;
};

export type PrivacySecuritySettings = {
  loginAlerts: boolean;
  twoFactorEnabled: boolean;
};

export type AppPreferences = {
  theme: "system" | "light" | "dark";
  language: string;
  currency: string;
  defaultCountry: string;
  contentDensity: "comfortable" | "compact";
  emailFormat: "html" | "plain";
  reducedMotion: boolean;
};

export type SettingsInitialData = {
  profile: ProfileSettings;
  identification: IdentificationSettings;
  addresses: UserAddress[];
  notifications: NotificationPreferences;
  privacy: PrivacySecuritySettings;
  preferences: AppPreferences;
  emailVerified: boolean;
  role: string | null | undefined;
  memberSince: string;
};

export const SETTINGS_SECTION_IDS = [
  "cuenta",
  "perfil",
  "identificacion",
  "direcciones",
  "notificaciones",
  "privacidad",
  "preferencias",
  "peligro",
] as const;

export type SettingsSectionId = (typeof SETTINGS_SECTION_IDS)[number];
