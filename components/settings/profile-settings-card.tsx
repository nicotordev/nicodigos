"use client";

import { useRef, useState } from "react";
import { IconCamera } from "@tabler/icons-react";
import { SettingsSectionCard } from "@/components/settings/settings-section-card";
import { SettingsSectionFooter } from "@/components/settings/settings-section-footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { LANGUAGE_OPTIONS, TIMEZONE_OPTIONS } from "@/lib/settings/constants";
import { uploadProfileAvatarAction } from "@/lib/settings/upload-avatar-action";
import type { ProfileSettings } from "@/lib/settings/types";
import { getUserInitials } from "@/lib/dashboard/format";

type ProfileSettingsCardProps = {
  value: ProfileSettings;
  registeredEmail: string;
  emailVerified: boolean;
  r2Configured: boolean;
  isDirty: boolean;
  isSaving: boolean;
  message?: string;
  error?: string;
  onChange: (value: ProfileSettings) => void;
  onSave: () => void;
  onCancel: () => void;
};

export function ProfileSettingsCard({
  value,
  registeredEmail,
  emailVerified,
  r2Configured,
  isDirty,
  isSaving,
  message,
  error,
  onChange,
  onSave,
  onCancel,
}: ProfileSettingsCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const initials = getUserInitials(value.fullName);
  const emailPendingChange =
    value.email.toLowerCase() !== registeredEmail.toLowerCase();

  function update<K extends keyof ProfileSettings>(
    key: K,
    fieldValue: ProfileSettings[K],
  ) {
    onChange({ ...value, [key]: fieldValue });
  }

  async function handleAvatarUpload(file: File) {
    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.set("file", file);

    const result = await uploadProfileAvatarAction(formData);
    setIsUploading(false);

    if (!result.success) {
      setUploadError(result.error);
      return;
    }

    update("image", result.url);
  }

  return (
    <SettingsSectionCard
      id="perfil"
      title="Información de perfil"
      description="Datos personales visibles en tu cuenta y en las comunicaciones."
    >
      <div className="flex flex-col gap-4 rounded-2xl border border-border/30 bg-muted/30 p-4 sm:flex-row sm:items-center">
        <Avatar
          size="lg"
          className="size-16 border border-border/50 bg-background"
        >
          {value.image ? (
            <AvatarImage src={value.image} alt={value.fullName} />
          ) : null}
          <AvatarFallback className="font-heading text-lg font-bold text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-sm font-medium text-foreground">Foto de perfil</p>
          <p className="text-xs text-muted-foreground">
            JPG, PNG o WebP. Máximo 2 MB.
            {r2Configured
              ? " Se guarda al subir la imagen."
              : " Configura R2 en el servidor para habilitar la subida."}
          </p>
          {uploadError ? (
            <p className="text-xs text-destructive">{uploadError}</p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              aria-label="Subir foto de perfil"
              disabled={!r2Configured || isUploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                void handleAvatarUpload(file);
                e.target.value = "";
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-9 rounded-xl"
              disabled={!r2Configured || isUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? (
                <Spinner className="size-4" />
              ) : (
                <IconCamera className="size-4" />
              )}
              {isUploading ? "Subiendo…" : "Cambiar foto"}
            </Button>
            {value.image ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="min-h-9 rounded-xl"
                disabled={isUploading}
                onClick={() => update("image", null)}
              >
                Quitar
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <Separator className="bg-border/60" />

      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor="profile-full-name">Nombre completo</FieldLabel>
          <Input
            id="profile-full-name"
            name="fullName"
            autoComplete="name"
            value={value.fullName}
            onChange={(e) => update("fullName", e.target.value)}
            placeholder="Tu nombre"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="profile-email">Correo electrónico</FieldLabel>
            <Input
              id="profile-email"
              name="email"
              type="email"
              autoComplete="email"
              value={value.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="tu@email.com"
              aria-invalid={emailPendingChange}
            />
            <FieldDescription>
              {emailPendingChange ? (
                <>
                  Al guardar, enviaremos verificación al nuevo correo y una
                  confirmación a <strong>{registeredEmail}</strong>.
                </>
              ) : (
                "Usado para iniciar sesión y notificaciones importantes."
              )}
            </FieldDescription>
            {emailVerified ? (
              <Badge variant="secondary" className="mt-1 w-fit text-xs">
                Correo verificado
              </Badge>
            ) : (
              <Badge variant="outline" className="mt-1 w-fit text-xs">
                Verificación pendiente
              </Badge>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="profile-phone">Teléfono</FieldLabel>
            <Input
              id="profile-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              value={value.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="+56 9 1234 5678"
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="profile-language">Idioma preferido</FieldLabel>
            <NativeSelect
              id="profile-language"
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

          <Field>
            <FieldLabel htmlFor="profile-timezone">Zona horaria</FieldLabel>
            <NativeSelect
              id="profile-timezone"
              className="w-full"
              value={value.timezone}
              onChange={(e) => update("timezone", e.target.value)}
            >
              {TIMEZONE_OPTIONS.map((opt) => (
                <NativeSelectOption key={opt.value} value={opt.value}>
                  {opt.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <FieldDescription>
              Afecta recordatorios y la hora mostrada en pedidos.
            </FieldDescription>
          </Field>
        </div>
      </FieldGroup>

      <p className="sr-only">
        <Label>Campos de perfil</Label>
      </p>

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
