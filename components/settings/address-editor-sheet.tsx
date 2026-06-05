"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { ChileLocationFields } from "@/components/chile/chile-location-fields";
import { ADDRESS_TYPE_LABELS, COUNTRY_OPTIONS } from "@/lib/settings/constants";
import type { AddressType, UserAddress } from "@/lib/settings/types";

export type AddressFormValues = Omit<UserAddress, "id" | "isDefault">;

function addressToFormValues(address: UserAddress): AddressFormValues {
  return {
    type: address.type,
    label: address.label,
    country: address.country,
    region: address.region,
    city: address.city,
    commune: address.commune,
    street: address.street,
    unit: address.unit,
    postalCode: address.postalCode,
  };
}

const emptyAddressForm = (type: AddressType): AddressFormValues => ({
  type,
  label: ADDRESS_TYPE_LABELS[type],
  country: "CL",
  region: "",
  city: "",
  commune: "",
  street: "",
  unit: "",
  postalCode: "",
});

type AddressEditorSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  address?: UserAddress | null;
  defaultType?: AddressType;
  onSave: (values: AddressFormValues, existingId?: string) => void;
};

export function AddressEditorSheet({
  open,
  onOpenChange,
  address,
  defaultType = "billing",
  onSave,
}: AddressEditorSheetProps) {
  const formId = useId();
  const [form, setForm] = useState<AddressFormValues>(() =>
    address ? addressToFormValues(address) : emptyAddressForm(defaultType),
  );

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setForm(
        address ? addressToFormValues(address) : emptyAddressForm(defaultType),
      );
    }
    onOpenChange(nextOpen);
  }

  function update<K extends keyof AddressFormValues>(
    key: K,
    value: AddressFormValues[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(form, address?.id);
    handleOpenChange(false);
  }

  const isChile = form.country === "CL";

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[92dvh] overflow-y-auto rounded-t-3xl sm:max-h-[85dvh] md:side-right md:max-w-md md:rounded-none"
      >
        <SheetHeader>
          <SheetTitle>
            {address ? "Editar dirección" : "Nueva dirección"}
          </SheetTitle>
          <SheetDescription>
            Completa los datos para facturación o envío de productos digitales
            asociados a tu región.
          </SheetDescription>
        </SheetHeader>

        <form
          id={formId}
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col gap-4 px-4 pb-2"
        >
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel htmlFor={`${formId}-type`}>Tipo</FieldLabel>
              <NativeSelect
                id={`${formId}-type`}
                className="w-full"
                value={form.type}
                onChange={(e) => {
                  const type = e.target.value as AddressType;
                  update("type", type);
                  update("label", ADDRESS_TYPE_LABELS[type]);
                }}
              >
                <NativeSelectOption value="billing">
                  {ADDRESS_TYPE_LABELS.billing}
                </NativeSelectOption>
                <NativeSelectOption value="shipping">
                  {ADDRESS_TYPE_LABELS.shipping}
                </NativeSelectOption>
              </NativeSelect>
            </Field>

            <Field>
              <FieldLabel htmlFor={`${formId}-label`}>Etiqueta</FieldLabel>
              <Input
                id={`${formId}-label`}
                value={form.label}
                onChange={(e) => update("label", e.target.value)}
                placeholder="Casa, Oficina…"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor={`${formId}-country`}>País</FieldLabel>
              <NativeSelect
                id={`${formId}-country`}
                className="w-full"
                value={form.country}
                onChange={(e) => update("country", e.target.value)}
              >
                {COUNTRY_OPTIONS.map((opt) => (
                  <NativeSelectOption key={opt.value} value={opt.value}>
                    {opt.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>

            {isChile ? (
              <ChileLocationFields
                idPrefix={formId}
                values={{
                  region: form.region,
                  commune: form.commune,
                  city: form.city,
                }}
                onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
              />
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor={`${formId}-region`}>
                      Región / estado
                    </FieldLabel>
                    <Input
                      id={`${formId}-region`}
                      value={form.region}
                      onChange={(e) => update("region", e.target.value)}
                      placeholder="Estado"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor={`${formId}-city`}>Ciudad</FieldLabel>
                    <Input
                      id={`${formId}-city`}
                      value={form.city}
                      onChange={(e) => update("city", e.target.value)}
                    />
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor={`${formId}-commune`}>
                    Distrito / municipio
                  </FieldLabel>
                  <Input
                    id={`${formId}-commune`}
                    value={form.commune}
                    onChange={(e) => update("commune", e.target.value)}
                  />
                </Field>
              </>
            )}

            <Field>
              <FieldLabel htmlFor={`${formId}-street`}>
                Calle y número
              </FieldLabel>
              <Input
                id={`${formId}-street`}
                value={form.street}
                onChange={(e) => update("street", e.target.value)}
                autoComplete="street-address"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor={`${formId}-unit`}>
                  Depto / unidad
                </FieldLabel>
                <Input
                  id={`${formId}-unit`}
                  value={form.unit}
                  onChange={(e) => update("unit", e.target.value)}
                  placeholder="Opcional"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor={`${formId}-postal`}>
                  Código postal
                </FieldLabel>
                <Input
                  id={`${formId}-postal`}
                  value={form.postalCode}
                  onChange={(e) => update("postalCode", e.target.value)}
                  autoComplete="postal-code"
                />
              </Field>
            </div>
          </FieldGroup>
        </form>

        <SheetFooter className="flex-row gap-2 border-t border-border/40 pt-4">
          <Button
            type="button"
            variant="outline"
            className="min-h-10 flex-1 rounded-2xl"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form={formId}
            className="min-h-10 flex-1 rounded-2xl"
          >
            Guardar dirección
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
