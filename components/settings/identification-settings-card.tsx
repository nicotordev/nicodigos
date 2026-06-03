"use client";

import { SettingsSectionCard } from "@/components/settings/settings-section-card";
import { SettingsSectionFooter } from "@/components/settings/settings-section-footer";
import type { SettingsSectionControlProps } from "@/components/settings/settings-section-props";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  IDENTIFICATION_TYPE_OPTIONS,
} from "@/lib/settings/constants";
import type { IdentificationSettings } from "@/lib/settings/types";

type IdentificationSettingsCardProps = SettingsSectionControlProps & {
  value: IdentificationSettings;
  onChange: (value: IdentificationSettings) => void;
};

export function IdentificationSettingsCard({
  value,
  isDirty,
  isSaving,
  message,
  error,
  onSave,
  onCancel,
  onChange,
}: IdentificationSettingsCardProps) {
  const isCompany = value.holderType === "company";
  const isChile = value.country === "CL";
  const idTypeOption = IDENTIFICATION_TYPE_OPTIONS.find(
    (o) => o.value === value.identificationType,
  );

  function update<K extends keyof IdentificationSettings>(
    key: K,
    fieldValue: IdentificationSettings[K],
  ) {
    onChange({ ...value, [key]: fieldValue });
  }

  return (
    <SettingsSectionCard
      id="identificacion"
      title="Identificación y datos fiscales"
      description="Información para facturación y cumplimiento tributario. Los datos se usan solo en transacciones que lo requieran."
      badge={
        <Badge variant="secondary" className="text-xs">
          Facturación
        </Badge>
      }
    >
      <FieldGroup className="gap-4">
        <Field orientation="horizontal">
          <div className="flex flex-1 flex-col gap-1">
            <FieldLabel htmlFor="id-holder-company">
              Cuenta de empresa
            </FieldLabel>
            <FieldDescription>
              Activa si compras o facturas a nombre de una empresa.
            </FieldDescription>
          </div>
          <Switch
            id="id-holder-company"
            checked={isCompany}
            onCheckedChange={(checked) =>
              update("holderType", checked ? "company" : "person")
            }
            aria-label="Cuenta de empresa"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="id-type">Tipo de identificación</FieldLabel>
            <NativeSelect
              id="id-type"
              className="w-full"
              value={value.identificationType}
              onChange={(e) =>
                update(
                  "identificationType",
                  e.target
                    .value as IdentificationSettings["identificationType"],
                )
              }
            >
              {IDENTIFICATION_TYPE_OPTIONS.map((opt) => (
                <NativeSelectOption key={opt.value} value={opt.value}>
                  {opt.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            {idTypeOption?.helper ? (
              <FieldDescription>{idTypeOption.helper}</FieldDescription>
            ) : null}
          </Field>

          <Field>
            <FieldLabel htmlFor="id-number">
              {isChile && value.identificationType === "RUT"
                ? "Número de RUT"
                : "Número de identificación"}
            </FieldLabel>
            <Input
              id="id-number"
              name="identificationNumber"
              value={value.identificationNumber}
              onChange={(e) => update("identificationNumber", e.target.value)}
              placeholder={
                isChile && value.identificationType === "RUT"
                  ? "12.345.678-9"
                  : "Ingresa tu documento"
              }
              autoComplete="off"
            />
            {isChile && value.identificationType === "RUT" ? (
              <FieldDescription>
                Formato chileno con guión y dígito verificador.
              </FieldDescription>
            ) : null}
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="id-country">País</FieldLabel>
          <NativeSelect
            id="id-country"
            className="w-full sm:max-w-xs"
            value={value.country}
            onChange={(e) => update("country", e.target.value)}
          >
            {COUNTRY_OPTIONS.map((opt) => (
              <NativeSelectOption key={opt.value} value={opt.value}>
                {opt.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>

        {isCompany ? (
          <div className="grid gap-4 rounded-2xl border border-border/30 bg-muted/20 p-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="id-company-name">Razón social</FieldLabel>
              <Input
                id="id-company-name"
                name="companyName"
                value={value.companyName}
                onChange={(e) => update("companyName", e.target.value)}
                placeholder="Nombre de la empresa"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="id-company-tax">
                {isChile ? "RUT empresa" : "ID fiscal empresa"}
              </FieldLabel>
              <Input
                id="id-company-tax"
                name="companyTaxId"
                value={value.companyTaxId}
                onChange={(e) => update("companyTaxId", e.target.value)}
                placeholder={isChile ? "76.123.456-7" : "Tax ID"}
              />
            </Field>
          </div>
        ) : null}
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
