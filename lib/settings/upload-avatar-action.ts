"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { isR2Configured } from "@/lib/r2/env";
import { uploadAvatarToR2 } from "@/lib/r2/upload-avatar";
import { requireSessionUserId } from "@/lib/settings/actions-shared";

export type UploadAvatarResult =
  | { success: true; url: string }
  | { success: false; error: string };

export async function uploadProfileAvatarAction(
  formData: FormData,
): Promise<UploadAvatarResult> {
  const userId = await requireSessionUserId();

  if (!isR2Configured()) {
    return {
      success: false,
      error:
        "El almacenamiento de imágenes no está configurado. Añade las variables R2 en el servidor.",
    };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "Selecciona una imagen válida." };
  }

  let url: string;
  try {
    url = await uploadAvatarToR2(userId, file);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "FILE_TOO_LARGE") {
        return { success: false, error: "La imagen no puede superar 2 MB." };
      }
      if (error.message === "FILE_TYPE_NOT_ALLOWED") {
        return {
          success: false,
          error: "Formato no permitido. Usa JPG, PNG o WebP.",
        };
      }
    }
    return {
      success: false,
      error: "No se pudo subir la imagen. Inténtalo de nuevo.",
    };
  }

  try {
    await auth.api.updateUser({
      headers: await headers(),
      body: { image: url },
    });
  } catch {
    return {
      success: false,
      error: "La imagen se subió pero no se pudo actualizar el perfil.",
    };
  }

  return { success: true, url };
}
