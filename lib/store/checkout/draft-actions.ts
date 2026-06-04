"use server";

import {
  decryptCheckoutDraft,
  encryptCheckoutDraft,
} from "@/lib/store/checkout/draft-crypto";
import { parseCheckoutDraftPayload } from "@/lib/store/checkout/draft-types";
import type { StoreActionResult } from "@/lib/store/types";

export async function encryptCheckoutDraftAction(
  plaintext: string,
): Promise<StoreActionResult<string>> {
  try {
    if (!plaintext.trim()) {
      return { success: false, error: "No hay datos para guardar." };
    }

    return {
      success: true,
      data: encryptCheckoutDraft(plaintext),
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No se pudo cifrar el borrador del checkout.";
    return { success: false, error: message };
  }
}

export async function decryptCheckoutDraftAction(
  ciphertext: string,
): Promise<StoreActionResult<string>> {
  try {
    if (!ciphertext.trim()) {
      return { success: false, error: "Borrador vacío." };
    }

    const plaintext = decryptCheckoutDraft(ciphertext);
    const payload = parseCheckoutDraftPayload(plaintext);

    if (!payload) {
      return { success: false, error: "Borrador de checkout corrupto." };
    }

    return { success: true, data: plaintext };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No se pudo descifrar el borrador del checkout.";
    return { success: false, error: message };
  }
}
