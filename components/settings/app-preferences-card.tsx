"use client";

import { SettingsSectionCard } from "@/components/settings/settings-section-card";
import { SettingsSectionFooter } from "@/components/settings/settings-section-footer";
import type { SettingsSectionControlProps } from "@/components/settings/settings-section-props";
import { Switch } from "@/components/ui/switch";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  COUNTRY_OPTIONS,
  CURRENCY_OPTIONS,
  LANGUAGE_OPTIONS,
} from "@/lib/settings/constants";
import type { AppPreferences } from "@/lib/settings/types";

type AppPreferencesCardProps = SettingsSectionControlProps & {
  value: AppPreferences;
  onChange: (value: AppPreferences) => void;
};

export function AppPreferencesCard({
  value,
  isDirty,
  isSaving,
  message,
  error,
  onSave,
  onCancel,
  onChange,
}: AppPreferencesCardProps) {
  function update<K extends keyof AppPreferences>(
    key: K,
    fieldValue: AppPreferences[K],
  ) {
    onChange({ ...value, [key]: fieldValue });
  }

  return (
    <SettingsSectionCard
      id="preferencias"
      title="Preferencias generales"
      description="Personaliza la experiencia de la tienda: tema, idioma, moneda y accesibilidad."
    >
      <FieldGroup className="gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="pref-theme">Tema</FieldLabel>
            <NativeSelect
              id="pref-theme"
              className="w-full"
              value={value.theme}
              onChange={(e) =>
                update("theme", e.target.value as AppPreferences["theme"])
              }
            >
              <NativeSelectOption value="system">Sistema</NativeSelectOption>
              <NativeSelectOption value="light">Claro</NativeSelectOption>
              <NativeSelectOption value="dark">Oscuro</NativeSelectOption>
            </NativeSelect>
            <FieldDescription>
              Se aplicará en toda la aplicación cuando el soporte esté activo.
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="pref-language">Idioma de la app</FieldLabel>
            <NativeSelect
              id="pref-language"
              className="w-full"
              value={value.language}
              onChange={(e) => update("language", e.target.value)}
            >
              {LANGUAGE_OPTIONS.map((opt) => (
                <NativeSelectOption key={opt.value} value={opt.value}>
                  {opt.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="pref-currency">Moneda</FieldLabel>
            <NativeSelect
              id="pref-currency"
              className="w-full"
              value={value.currency}
              onChange={(e) => update("currency", e.target.value)}
            >
              {CURRENCY_OPTIONS.map((opt) => (
                <NativeSelectOption key={opt.value} value={opt.value}>
                  {opt.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>

          <Field>
            <FieldLabel htmlFor="pref-country">País predeterminado</FieldLabel>
            <NativeSelect
              id="pref-country"
              className="w-full"
              value={value.defaultCountry}
              onChange={(e) => update("defaultCountry", e.target.value)}
            >
              {COUNTRY_OPTIONS.map((opt) => (
                <NativeSelectOption key={opt.value} value={opt.value}>
                  {opt.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="pref-density">
              Densidad de contenido
            </FieldLabel>
            <NativeSelect
              id="pref-density"
              className="w-full"
              value={value.contentDensity}
              onChange={(e) =>
                update(
                  "contentDensity",
                  e.target.value as AppPreferences["contentDensity"],
                )
              }
            >
              <NativeSelectOption value="comfortable">
                Cómoda
              </NativeSelectOption>
              <NativeSelectOption value="compact">Compacta</NativeSelectOption>
            </NativeSelect>
          </Field>

          <Field>
            <FieldLabel htmlFor="pref-email-format">
              Formato de correos
            </FieldLabel>
            <NativeSelect
              id="pref-email-format"
              className="w-full"
              value={value.emailFormat}
              onChange={(e) =>
                update(
                  "emailFormat",
                  e.target.value as AppPreferences["emailFormat"],
                )
              }
            >
              <NativeSelectOption value="html">HTML</NativeSelectOption>
              <NativeSelectOption value="plain">Texto plano</NativeSelectOption>
            </NativeSelect>
          </Field>
        </div>

        <Field
          orientation="horizontal"
          className="rounded-2xl bg-muted/20 px-4 py-3"
        >
          <div className="flex flex-1 flex-col gap-1">
            <FieldLabel htmlFor="pref-reduced-motion" className="font-medium">
              Reducir animaciones
            </FieldLabel>
            <FieldDescription>
              Minimiza transiciones para mayor comodidad visual (preferencia de
              accesibilidad).
            </FieldDescription>
          </div>
          <Switch
            id="pref-reduced-motion"
            checked={value.reducedMotion}
            onCheckedChange={(checked) => update("reducedMotion", checked)}
          />
        </Field>
      </FieldGroup>

      <SettingsSectionFooter
        isDirty={isDirty}
        isSaving={isSaving}
        message={message}
        error={error}
        onSave={onSave}
        onCancel={onCancel}
      />
    </SettingsSectionCard>
  );
}
