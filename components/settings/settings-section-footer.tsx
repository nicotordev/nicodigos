"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type SettingsSectionFooterProps = {
  isDirty: boolean;
  isSaving?: boolean;
  onSave: () => void;
  onCancel: () => void;
  message?: string | null;
  error?: string | null;
  className?: string;
};

export function SettingsSectionFooter({
  isDirty,
  isSaving = false,
  onSave,
  onCancel,
  message,
  error,
  className,
}: SettingsSectionFooterProps) {
  if (!isDirty && !message && !error) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-t border-border/40 pt-4",
        className,
      )}
    >
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {message ? (
        <p role="status" className="text-sm text-muted-foreground">
          {message}
        </p>
      ) : null}
      {isDirty ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="min-h-10 rounded-2xl sm:min-w-28"
            disabled={isSaving}
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className="min-h-10 rounded-2xl sm:min-w-36"
            disabled={isSaving}
            onClick={onSave}
          >
            {isSaving ? (
              <>
                <Spinner className="size-4" />
                Guardando…
              </>
            ) : (
              "Guardar sección"
            )}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
