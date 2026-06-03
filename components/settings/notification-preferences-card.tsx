"use client";

import { SettingsSectionCard } from "@/components/settings/settings-section-card";
import { SettingsSectionFooter } from "@/components/settings/settings-section-footer";
import type { SettingsSectionControlProps } from "@/components/settings/settings-section-props";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import type { NotificationPreferences } from "@/lib/settings/types";
import { cn } from "@/lib/utils";

type NotificationItem = {
  key: keyof NotificationPreferences;
  label: string;
  description: string;
  recommended?: boolean;
};

const CHANNEL_ITEMS: NotificationItem[] = [
  {
    key: "email",
    label: "Notificaciones por correo",
    description: "Recibe actualizaciones en tu bandeja de entrada.",
  },
  {
    key: "push",
    label: "Notificaciones push",
    description: "Alertas en el navegador cuando estés conectado.",
  },
  {
    key: "smsWhatsApp",
    label: "SMS / WhatsApp",
    description:
      "Mensajes urgentes de pedidos (según disponibilidad regional).",
  },
];

const TOPIC_ITEMS: NotificationItem[] = [
  {
    key: "productUpdates",
    label: "Novedades de productos",
    description: "Lanzamientos, ofertas destacadas y catálogo.",
  },
  {
    key: "orderUpdates",
    label: "Estado de pedidos",
    description: "Confirmaciones, claves listas y cambios de estado.",
  },
  {
    key: "securityAlerts",
    label: "Alertas de seguridad",
    description:
      "Inicios de sesión, cambios de contraseña y actividad sospechosa.",
    recommended: true,
  },
  {
    key: "marketing",
    label: "Promociones y marketing",
    description: "Descuentos personalizados y campañas.",
  },
  {
    key: "newsletter",
    label: "Newsletter",
    description: "Resumen editorial y recomendaciones mensuales.",
  },
  {
    key: "reminders",
    label: "Recordatorios",
    description: "Carrito abandonado, verificación de email y pendientes.",
  },
];

type NotificationPreferencesCardProps = SettingsSectionControlProps & {
  value: NotificationPreferences;
  onChange: (value: NotificationPreferences) => void;
};

function NotificationRow({
  item,
  checked,
  onCheckedChange,
}: {
  item: NotificationItem;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  const switchId = `notif-${item.key}`;

  return (
    <Field
      orientation="horizontal"
      className={cn(
        "rounded-2xl border border-transparent px-3 py-3 md:px-4",
        item.recommended && "border-primary/20 bg-primary/5",
      )}
    >
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <FieldLabel htmlFor={switchId} className="font-medium">
            {item.label}
          </FieldLabel>
          {item.recommended ? (
            <Badge variant="secondary" className="text-xs">
              Recomendado
            </Badge>
          ) : null}
        </div>
        <FieldDescription>{item.description}</FieldDescription>
      </div>
      <Switch
        id={switchId}
        checked={checked}
        onCheckedChange={onCheckedChange}
        aria-label={item.label}
      />
    </Field>
  );
}

export function NotificationPreferencesCard({
  value,
  isDirty,
  isSaving,
  message,
  error,
  onSave,
  onCancel,
  onChange,
}: NotificationPreferencesCardProps) {
  function update(key: keyof NotificationPreferences, checked: boolean) {
    onChange({ ...value, [key]: checked });
  }

  return (
    <SettingsSectionCard
      id="notificaciones"
      title="Preferencias de notificaciones"
      description="Elige cómo y cuándo quieres recibir novedades. Las alertas de seguridad se mantienen activas por tu protección."
    >
      <div className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Canales
        </p>
        {CHANNEL_ITEMS.map((item) => (
          <NotificationRow
            key={item.key}
            item={item}
            checked={value[item.key]}
            onCheckedChange={(c) => update(item.key, c)}
          />
        ))}
      </div>

      <Separator className="bg-border/60" />

      <div className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Temas
        </p>
        {TOPIC_ITEMS.map((item) => (
          <NotificationRow
            key={item.key}
            item={item}
            checked={value[item.key]}
            onCheckedChange={(c) => update(item.key, c)}
          />
        ))}
      </div>

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
