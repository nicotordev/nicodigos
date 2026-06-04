import "server-only";

import prisma from "@/lib/prisma";
import { mapAddressTypeToPrisma } from "@/lib/settings/mappers";
import type { UserAddress } from "@/lib/settings/types";
import { CHECKOUT_NEW_ADDRESS_ID } from "@/lib/store/checkout/constants";
import type { CheckoutBillingInput } from "@/lib/store/checkout/billing";

type UpsertCheckoutAddressInput = {
  userId: string;
  billing: CheckoutBillingInput;
  addressSelection: string;
};

export function isNewCheckoutAddress(selection: string): boolean {
  return selection === CHECKOUT_NEW_ADDRESS_ID;
}

export function addressFieldsFromSaved(address: UserAddress) {
  return {
    addressLabel: address.label,
    region: address.region,
    commune: address.commune,
    city: address.city,
    street: address.street,
    unit: address.unit,
  };
}

export async function upsertCheckoutBillingAddress(
  input: UpsertCheckoutAddressInput,
): Promise<{ addressId: string; label: string }> {
  const label = input.billing.addressLabel.trim();
  const addressData = {
    type: mapAddressTypeToPrisma("billing"),
    label,
    country: "CL",
    region: input.billing.region.trim(),
    city: input.billing.city.trim(),
    commune: input.billing.commune.trim(),
    street: input.billing.street.trim(),
    unit: input.billing.unit?.trim() ?? "",
    postalCode: "",
    isDefault: true,
  };

  if (isNewCheckoutAddress(input.addressSelection)) {
    await prisma.userAddress.updateMany({
      where: { userId: input.userId, type: "BILLING", isDefault: true },
      data: { isDefault: false },
    });

    const created = await prisma.userAddress.create({
      data: {
        userId: input.userId,
        ...addressData,
      },
      select: { id: true, label: true },
    });

    return { addressId: created.id, label: created.label };
  }

  const existing = await prisma.userAddress.findFirst({
    where: {
      id: input.addressSelection,
      userId: input.userId,
      type: "BILLING",
    },
    select: { id: true },
  });

  if (!existing) {
    throw new Error("La dirección seleccionada no existe.");
  }

  await prisma.userAddress.updateMany({
    where: {
      userId: input.userId,
      type: "BILLING",
      isDefault: true,
      NOT: { id: existing.id },
    },
    data: { isDefault: false },
  });

  const updated = await prisma.userAddress.update({
    where: { id: existing.id },
    data: addressData,
    select: { id: true, label: true },
  });

  return { addressId: updated.id, label: updated.label };
}
