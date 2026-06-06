"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin/auth";
import {
  bulkUpdateUsersSchema,
  updateUserSchema,
  type BulkUpdateUsersInput,
  type UpdateUserInput,
} from "@/lib/admin/users/schemas";
import prisma from "@/lib/prisma";

export type UserActionResult =
  | { success: true; message?: string }
  | { success: false; error: string };

export type BulkUsersActionResult = {
  success: boolean;
  message?: string;
  error?: string;
  processed?: number;
  failed?: number;
};

function revalidateUserPaths(userId: string) {
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
}

export async function updateUserAction(
  input: UpdateUserInput,
): Promise<UserActionResult> {
  const session = await requireAdmin();

  const parsed = updateUserSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "Datos inválidos";
    return { success: false, error: first };
  }

  const data = parsed.data;

  if (
    data.userId === session.user.id &&
    data.role !== "ADMIN" &&
    session.user.role === "ADMIN"
  ) {
    return {
      success: false,
      error: "No puedes quitarte el rol de administrador a ti mismo.",
    };
  }

  const existing = await prisma.user.findUnique({
    where: { id: data.userId },
    select: { id: true, email: true },
  });

  if (!existing) {
    return { success: false, error: "Cliente no encontrado." };
  }

  const emailTaken = await prisma.user.findFirst({
    where: {
      email: data.email,
      NOT: { id: data.userId },
    },
    select: { id: true },
  });

  if (emailTaken) {
    return { success: false, error: "Ese correo ya está en uso." };
  }

  await prisma.user.update({
    where: { id: data.userId },
    data: {
      name: data.name,
      email: data.email,
      role: data.role,
      emailVerified: data.emailVerified,
    },
  });

  revalidateUserPaths(data.userId);
  return { success: true, message: "Cliente actualizado." };
}

export async function bulkUpdateUsersAction(
  input: BulkUpdateUsersInput,
): Promise<BulkUsersActionResult> {
  const session = await requireAdmin();

  const parsed = bulkUpdateUsersSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Selección inválida.",
    };
  }

  const { userIds, role, emailVerified } = parsed.data;

  if (role === undefined && emailVerified === undefined) {
    return { success: false, error: "No hay cambios para aplicar." };
  }

  const uniqueIds = [...new Set(userIds)];
  let processed = 0;

  for (const userId of uniqueIds) {
    if (
      userId === session.user.id &&
      role === "USER" &&
      session.user.role === "ADMIN"
    ) {
      continue;
    }

    try {
      const exists = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });
      if (!exists) {
        continue;
      }

      await prisma.user.update({
        where: { id: userId },
        data: {
          ...(role !== undefined ? { role } : {}),
          ...(emailVerified !== undefined ? { emailVerified } : {}),
        },
      });
      revalidateUserPaths(userId);
      processed += 1;
    } catch {
      // skip failed row
    }
  }

  revalidatePath("/admin/users");

  if (processed === 0) {
    return {
      success: false,
      error: "No se pudo actualizar ningún cliente.",
      processed: 0,
      failed: uniqueIds.length,
    };
  }

  return {
    success: true,
    message: `${processed} cliente${processed === 1 ? "" : "s"} actualizado${processed === 1 ? "" : "s"}.`,
    processed,
    failed: uniqueIds.length - processed,
  };
}
