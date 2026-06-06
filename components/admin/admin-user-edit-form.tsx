"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { updateUserAction } from "@/lib/admin/users/actions";
import type { AdminUserDetail } from "@/lib/admin/users/types";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

type AdminUserEditFormProps = {
  user: AdminUserDetail;
  embedded?: boolean;
};

export function AdminUserEditForm({
  user,
  embedded = false,
}: AdminUserEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    role: user.role as "USER" | "ADMIN",
    emailVerified: user.emailVerified,
  });

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    startTransition(async () => {
      const result = await updateUserAction({
        userId: user.id,
        ...form,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(result.message ?? "Cliente actualizado.");
      router.refresh();
    });
  }

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FieldGroup className="gap-3">
        <Field>
          <FieldLabel htmlFor="user-name">Nombre</FieldLabel>
          <Input
            id="user-name"
            value={form.name}
            onChange={(event) =>
              setForm((current) => ({ ...current, name: event.target.value }))
            }
            disabled={isPending}
            required
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="user-email">Correo</FieldLabel>
          <Input
            id="user-email"
            type="email"
            value={form.email}
            onChange={(event) =>
              setForm((current) => ({ ...current, email: event.target.value }))
            }
            disabled={isPending}
            required
          />
          <FieldDescription>Debe ser único en la plataforma.</FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="user-role">Rol</FieldLabel>
          <Select
            value={form.role}
            onValueChange={(value) =>
              setForm((current) => ({
                ...current,
                role: value as "USER" | "ADMIN",
              }))
            }
            disabled={isPending}
          >
            <SelectTrigger id="user-role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USER">Cliente</SelectItem>
              <SelectItem value="ADMIN">Administrador</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 px-3 py-2.5">
          <div className="space-y-0.5">
            <Label htmlFor="user-email-verified" className="text-sm">
              Email verificado
            </Label>
            <p className="text-xs text-muted-foreground">
              Marca manualmente si el correo fue confirmado.
            </p>
          </div>
          <Switch
            id="user-email-verified"
            checked={form.emailVerified}
            onCheckedChange={(checked) =>
              setForm((current) => ({ ...current, emailVerified: checked }))
            }
            disabled={isPending}
          />
        </div>
      </FieldGroup>

      <Button
        type="submit"
        className={embedded ? "w-full" : undefined}
        disabled={isPending}
      >
        {isPending ? "Guardando…" : "Guardar cambios"}
      </Button>
    </form>
  );

  return formContent;
}
