export const SETTINGS_SAVE_SECTIONS = [
  "profile",
  "identification",
  "addresses",
  "notifications",
  "privacy",
  "preferences",
] as const;

export type SettingsSaveSection = (typeof SETTINGS_SAVE_SECTIONS)[number];
