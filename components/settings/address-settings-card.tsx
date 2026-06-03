"use client";

import { useState } from "react";
import {
  IconDotsVertical,
  IconMapPin,
  IconPlus,
  IconStar,
} from "@tabler/icons-react";
import {
  AddressEditorSheet,
  type AddressFormValues,
} from "@/components/settings/address-editor-sheet";
import { SettingsSectionCard } from "@/components/settings/settings-section-card";
import { SettingsSectionFooter } from "@/components/settings/settings-section-footer";
import type { SettingsSectionControlProps } from "@/components/settings/settings-section-props";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ADDRESS_TYPE_LABELS, COUNTRY_OPTIONS } from "@/lib/settings/constants";
import type { AddressType, UserAddress } from "@/lib/settings/types";
import { cn } from "@/lib/utils";

type AddressSettingsCardProps = SettingsSectionControlProps & {
  addresses: UserAddress[];
  onChange: (addresses: UserAddress[]) => void;
};

function formatAddressLine(address: UserAddress): string {
  const parts = [
    address.street,
    address.unit,
    address.commune,
    address.city,
    address.region,
  ].filter(Boolean);

  return parts.join(", ");
}

function countryLabel(code: string): string {
  return COUNTRY_OPTIONS.find((c) => c.value === code)?.label ?? code;
}

export function AddressSettingsCard({
  addresses,
  isDirty,
  isSaving,
  message,
  error,
  onSave,
  onCancel,
  onChange,
}: AddressSettingsCardProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<UserAddress | null>(null);
  const [defaultType, setDefaultType] = useState<AddressType>("billing");

  function openCreate(type: AddressType = "billing") {
    setEditing(null);
    setDefaultType(type);
    setSheetOpen(true);
  }

  function openEdit(address: UserAddress) {
    setEditing(address);
    setSheetOpen(true);
  }

  function handleSave(values: AddressFormValues, existingId?: string) {
    if (existingId) {
      onChange(
        addresses.map((a) => (a.id === existingId ? { ...a, ...values } : a)),
      );
      return;
    }

    const newAddress: UserAddress = {
      ...values,
      id: crypto.randomUUID(),
      isDefault: addresses.length === 0,
    };
    onChange([...addresses, newAddress]);
  }

  function handleDelete(id: string) {
    const next = addresses.filter((a) => a.id !== id);
    if (next.length > 0 && !next.some((a) => a.isDefault)) {
      next[0] = { ...next[0], isDefault: true };
    }
    onChange(next);
  }

  function handleSetDefault(id: string) {
    onChange(
      addresses.map((a) => ({
        ...a,
        isDefault: a.id === id,
      })),
    );
  }

  return (
    <>
      <SettingsSectionCard
        id="direcciones"
        title="Direcciones"
        description="Administra direcciones de facturación y envío. En móvil, cada dirección aparece como una tarjeta compacta."
        action={
          <Button
            type="button"
            size="sm"
            className="min-h-9 rounded-xl"
            onClick={() => openCreate()}
          >
            <IconPlus className="size-4" />
            Agregar
          </Button>
        }
      >
        {addresses.length === 0 ? (
          <Empty className="border border-dashed border-border/50 bg-muted/20 py-10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <IconMapPin />
              </EmptyMedia>
              <EmptyTitle>Sin direcciones guardadas</EmptyTitle>
              <EmptyDescription>
                Agrega una dirección de facturación o envío para completar tus
                pedidos y datos fiscales.
              </EmptyDescription>
            </EmptyHeader>
            <Button
              type="button"
              className="mt-2 min-h-10 rounded-2xl"
              onClick={() => openCreate()}
            >
              <IconPlus className="size-4" />
              Agregar primera dirección
            </Button>
          </Empty>
        ) : (
          <ul className="flex flex-col gap-3">
            {addresses.map((address) => (
              <li
                key={address.id}
                className={cn(
                  "flex gap-3 rounded-2xl border border-border/40 bg-muted/20 p-4 transition-colors",
                  "active:bg-muted/40 md:hover:bg-muted/30",
                )}
              >
                <div
                  className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background text-primary ring-1 ring-border/40"
                  aria-hidden
                >
                  <IconMapPin className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-foreground">
                      {address.label}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {ADDRESS_TYPE_LABELS[address.type]}
                    </Badge>
                    {address.isDefault ? (
                      <Badge className="gap-1 text-xs">
                        <IconStar className="size-3" />
                        Predeterminada
                      </Badge>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatAddressLine(address)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {countryLabel(address.country)}
                    {address.postalCode ? ` · ${address.postalCode}` : ""}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-9 shrink-0 rounded-xl"
                      aria-label={`Opciones de ${address.label}`}
                    >
                      <IconDotsVertical className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => openEdit(address)}>
                      Editar
                    </DropdownMenuItem>
                    {!address.isDefault ? (
                      <DropdownMenuItem
                        onClick={() => handleSetDefault(address.id)}
                      >
                        Establecer como predeterminada
                      </DropdownMenuItem>
                    ) : null}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => handleDelete(address.id)}
                    >
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            ))}
          </ul>
        )}

        <SettingsSectionFooter
          isDirty={isDirty}
          isSaving={isSaving}
          message={message}
          error={error}
          onSave={onSave}
          onCancel={onCancel}
        />
      </SettingsSectionCard>

      <AddressEditorSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        address={editing}
        defaultType={defaultType}
        onSave={handleSave}
      />
    </>
  );
}
