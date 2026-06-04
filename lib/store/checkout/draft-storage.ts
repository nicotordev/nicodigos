"use client";

import {
  decryptCheckoutDraftAction,
  encryptCheckoutDraftAction,
} from "@/lib/store/checkout/draft-actions";
import {
  CHECKOUT_DRAFT_VERSION,
  mergeCheckoutDraftValues,
  parseCheckoutDraftPayload,
  type CheckoutDraftPayload,
} from "@/lib/store/checkout/draft-types";
import type { CheckoutBillingFormValues } from "@/lib/store/checkout/billing";
import {
  isCheckoutAddressComplete,
  isCheckoutBillingIdentityComplete,
  isCheckoutContactComplete,
} from "@/lib/store/checkout/billing";

const STORAGE_KEY_PREFIX = "nicodigos.checkout.draft.v1";

export function getCheckoutDraftStorageKey(userId: string): string {
  return `${STORAGE_KEY_PREFIX}.${userId}`;
}

export function buildCheckoutDraftPayload(
  values: CheckoutBillingFormValues,
): CheckoutDraftPayload {
  return {
    version: CHECKOUT_DRAFT_VERSION,
    savedAt: new Date().toISOString(),
    contactComplete: isCheckoutContactComplete(values),
    billingIdentityComplete: isCheckoutBillingIdentityComplete(values),
    addressComplete: isCheckoutAddressComplete(values),
    values,
  };
}

export async function saveCheckoutDraftToStorage(
  userId: string,
  values: CheckoutBillingFormValues,
): Promise<boolean> {
  if (typeof window === "undefined") return false;

  if (!isCheckoutContactComplete(values)) {
    return false;
  }

  const payload = buildCheckoutDraftPayload(values);
  const encrypted = await encryptCheckoutDraftAction(JSON.stringify(payload));

  if (!encrypted.success) {
    console.warn("[checkout-draft] no se pudo cifrar:", encrypted.error);
    return false;
  }

  localStorage.setItem(getCheckoutDraftStorageKey(userId), encrypted.data!);
  return true;
}

export async function loadCheckoutDraftFromStorage(
  userId: string,
  initial: CheckoutBillingFormValues,
): Promise<CheckoutBillingFormValues | null> {
  if (typeof window === "undefined") return null;

  const stored = localStorage.getItem(getCheckoutDraftStorageKey(userId));
  if (!stored) return null;

  const decrypted = await decryptCheckoutDraftAction(stored);

  if (!decrypted.success) {
    clearCheckoutDraftFromStorage(userId);
    return null;
  }

  const payload = parseCheckoutDraftPayload(decrypted.data!);
  if (!payload) {
    clearCheckoutDraftFromStorage(userId);
    return null;
  }

  return mergeCheckoutDraftValues(initial, payload.values);
}

export function clearCheckoutDraftFromStorage(userId: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(getCheckoutDraftStorageKey(userId));
}
