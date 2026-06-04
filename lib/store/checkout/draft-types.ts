import type { CheckoutBillingFormValues } from "@/lib/store/checkout/billing";

export const CHECKOUT_DRAFT_VERSION = 1 as const;

export type CheckoutDraftPayload = {
  version: typeof CHECKOUT_DRAFT_VERSION;
  savedAt: string;
  contactComplete: boolean;
  billingIdentityComplete: boolean;
  addressComplete: boolean;
  values: CheckoutBillingFormValues;
};

export function mergeCheckoutDraftValues(
  initial: CheckoutBillingFormValues,
  draft: CheckoutBillingFormValues,
): CheckoutBillingFormValues {
  return {
    ...initial,
    ...draft,
    acceptTerms: draft.acceptTerms ?? initial.acceptTerms,
  };
}

export function parseCheckoutDraftPayload(
  json: string,
): CheckoutDraftPayload | null {
  try {
    const parsed: unknown = JSON.parse(json);

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("version" in parsed) ||
      !("values" in parsed)
    ) {
      return null;
    }

    const record = parsed as Record<string, unknown>;

    if (record.version !== CHECKOUT_DRAFT_VERSION) {
      return null;
    }

    if (typeof record.values !== "object" || record.values === null) {
      return null;
    }

    return parsed as CheckoutDraftPayload;
  } catch {
    return null;
  }
}
