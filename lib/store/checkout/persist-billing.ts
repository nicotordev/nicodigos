import "server-only";

import prisma from "@/lib/prisma";
import { mapHolderTypeToPrisma } from "@/lib/settings/mappers";
import type { CheckoutBillingInput } from "@/lib/store/checkout/billing";

/** Sincroniza teléfono, nombre y RUT del checkout al perfil (para que /checkout los muestre después). */
export async function persistCheckoutBillingToUser(
  userId: string,
  billing: CheckoutBillingInput,
): Promise<void> {
  const displayName =
    billing.documentType === "factura"
      ? billing.companyName.trim()
      : billing.fullName.trim();

  const holderType = billing.documentType === "factura" ? "company" : "person";

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { name: displayName || undefined },
    }),
    prisma.userProfile.upsert({
      where: { userId },
      create: {
        userId,
        phone: billing.phone.trim(),
      },
      update: {
        phone: billing.phone.trim(),
      },
    }),
    prisma.userIdentification.upsert({
      where: { userId },
      create: {
        userId,
        identificationType: "RUT",
        identificationNumber: billing.rut.trim(),
        country: "CL",
        holderType: mapHolderTypeToPrisma(holderType),
        companyName: billing.companyName.trim(),
        companyTaxId:
          billing.documentType === "factura" ? billing.rut.trim() : "",
      },
      update: {
        identificationNumber: billing.rut.trim(),
        holderType: mapHolderTypeToPrisma(holderType),
        companyName: billing.companyName.trim(),
        companyTaxId:
          billing.documentType === "factura" ? billing.rut.trim() : "",
      },
    }),
  ]);
}
