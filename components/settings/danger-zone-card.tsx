"use client";

import { useState } from "react";
import { IconAlertTriangle } from "@tabler/icons-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { SettingsSectionCard } from "@/components/settings/settings-section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { deleteUserAccountAction } from "@/lib/settings/actions";

type DangerZoneCardProps = {
  accountEmail: string;
};

export function DangerZoneCard({ accountEmail }: DangerZoneCardProps) {
  const [confirmEmail, setConfirmEmail] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailMatches =
    confirmEmail.trim().toLowerCase() === accountEmail.toLowerCase();

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);

    const result = await deleteUserAccountAction(confirmEmail);

    if (!result.success) {
      setError(result.error);
      setIsDeleting(false);
    }
  }

  return (
    <SettingsSectionCard
      id="peligro"
      title="Zona de peligro"
      description="Acciones irreversibles. Procede solo si entiendes las consecuencias."
      className="border-destructive/30 bg-destructive/5"
      contentClassName="space-y-4"
    >
      <div className="flex gap-3 rounded-2xl border border-destructive/20 bg-background/60 p-4">
        <IconAlertTriangle
          className="size-5 shrink-0 text-destructive"
          aria-hidden
        />
        <p className="text-sm text-muted-foreground">
          Eliminar tu cuenta borrará el historial de pedidos, claves asociadas y
          preferencias. Esta acción no se puede deshacer.
        </p>
      </div>

      <Field>
        <FieldLabel htmlFor="danger-confirm-email">
          Confirma tu correo para eliminar la cuenta
        </FieldLabel>
        <Input
          id="danger-confirm-email"
          type="email"
          value={confirmEmail}
          onChange={(e) => {
            setConfirmEmail(e.target.value);
            setError(null);
          }}
          placeholder={accountEmail}
          autoComplete="off"
          aria-invalid={!!error}
          className="border-destructive/30 focus-visible:ring-destructive/20"
        />
        <FieldDescription>
          Escribe tu correo exactamente como aparece en el perfil.
        </FieldDescription>
      </Field>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            type="button"
            variant="destructive"
            size="lg"
            className="min-h-10 w-full rounded-2xl sm:w-auto"
            disabled={!emailMatches}
          >
            Eliminar cuenta permanentemente
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar tu cuenta?</AlertDialogTitle>
            <AlertDialogDescription>
              Perderás acceso a pedidos, claves y saldo de carrito. Los datos se
              eliminarán según la política de retención legal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isDeleting || !emailMatches}
              onClick={(e) => {
                e.preventDefault();
                void handleDelete();
              }}
            >
              {isDeleting ? (
                <>
                  <Spinner className="size-4" />
                  Eliminando…
                </>
              ) : (
                "Sí, eliminar cuenta"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SettingsSectionCard>
  );
}
