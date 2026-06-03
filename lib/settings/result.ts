import type { SettingsInitialData } from "@/lib/settings/types";

export type SettingsActionResult =
  | { success: true; data: SettingsInitialData; message?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export function parseZodErrors(
  issues: { path: PropertyKey[]; message: string }[],
): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of issues) {
    const path = issue.path.join(".");
    if (!fieldErrors[path]) fieldErrors[path] = [];
    fieldErrors[path].push(issue.message);
  }
  return fieldErrors;
}

export function settingsValidationError(
  fieldErrors: Record<string, string[]>,
): SettingsActionResult {
  return {
    success: false,
    error: "Revisa los campos marcados e inténtalo de nuevo.",
    fieldErrors,
  };
}
