"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { uniqueCategorySlug } from "@/lib/admin/categories/slug";
import { upsertCategorySchema } from "@/lib/admin/categories/schemas";
import type { UpsertCategoryInput } from "@/lib/admin/categories/schemas";
import { CATEGORY_UPLOAD_ERRORS } from "@/lib/admin/categories/upload-errors";
import prisma from "@/lib/prisma";
import { isR2Configured } from "@/lib/r2/env";
import {
  uploadCategoryImageToR2,
  type CategoryImageKind,
} from "@/lib/r2/upload-category-image";

export type CategoryActionResult =
  | { success: true; message?: string; id: string; slug?: string; url?: string }
  | { success: false; error: string };

export async function upsertCategoryAction(
  input: UpsertCategoryInput,
): Promise<CategoryActionResult> {
  await requireAdmin();

  const parsed = upsertCategorySchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "Datos inválidos";
    return { success: false, error: first };
  }

  const data = parsed.data;

  const mediaData = {
    imageUrl: data.imageUrl ?? null,
    bannerUrl: data.bannerUrl ?? null,
  };

  try {
    if (data.id) {
      const slug = await uniqueCategorySlug(data.name, data.id);
      await prisma.category.update({
        where: { id: data.id },
        data: {
          name: data.name,
          slug,
          description: data.description ?? null,
          sortOrder: data.sortOrder,
          ...mediaData,
        },
      });

      revalidatePath("/admin/categories");
      revalidatePath(`/admin/categories/${data.id}/edit`);
      revalidatePath("/admin");
      return {
        success: true,
        id: data.id,
        slug,
        message: "Categoría actualizada.",
      };
    }

    const slug = await uniqueCategorySlug(data.name);
    const created = await prisma.category.create({
      data: {
        name: data.name,
        slug,
        description: data.description ?? null,
        sortOrder: data.sortOrder,
        ...mediaData,
      },
      select: { id: true },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/admin/categories/new");
    revalidatePath("/admin");
    return {
      success: true,
      id: created.id,
      slug,
      message: "Categoría creada.",
    };
  } catch {
    return { success: false, error: "No se pudo guardar la categoría." };
  }
}

export async function uploadCategoryImageAction(
  categoryId: string,
  kind: CategoryImageKind,
  formData: FormData,
): Promise<CategoryActionResult> {
  await requireAdmin();

  if (!isR2Configured()) {
    return {
      success: false,
      error: CATEGORY_UPLOAD_ERRORS.R2_STORAGE_NOT_CONFIGURED,
    };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "Selecciona una imagen." };
  }

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true },
  });

  if (!category) {
    return { success: false, error: "Categoría no encontrada." };
  }

  try {
    const url = await uploadCategoryImageToR2(categoryId, kind, file);
    await prisma.category.update({
      where: { id: categoryId },
      data: kind === "image" ? { imageUrl: url } : { bannerUrl: url },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/admin/categories/new");
    revalidatePath(`/admin/categories/${categoryId}/edit`);
    return {
      success: true,
      id: categoryId,
      url,
      message:
        kind === "image"
          ? "Imagen de categoría actualizada."
          : "Banner actualizado.",
    };
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    return {
      success: false,
      error: CATEGORY_UPLOAD_ERRORS[code] ?? "No se pudo subir la imagen.",
    };
  }
}

export async function deleteCategoryAction(
  id: string,
): Promise<CategoryActionResult> {
  await requireAdmin();

  try {
    await prisma.category.delete({ where: { id } });
    revalidatePath("/admin/categories");
    revalidatePath("/admin");
    return { success: true, id, message: "Categoría eliminada." };
  } catch {
    return {
      success: false,
      error: "No se pudo eliminar. Puede tener productos asociados.",
    };
  }
}
